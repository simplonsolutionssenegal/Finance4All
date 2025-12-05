import { useAuth, useOrganization } from '@clerk/nextjs';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import React from 'react';

import BeneficiaryManagement from '@/components/beneficiaire/BeneficiaryManagement';
import { useBeneficiaries } from '@/hooks/beneficiary/useBeneficiaries';
import { useCreateBeneficiaryAdmin } from '@/hooks/beneficiary/useCreateBeneficiaryAdmin';
import { BeneficiaryStatus } from '@/types/beneficiaire/beneficiary';

// ---------- mocks ----------
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
  useOrganization: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/beneficiary/useBeneficiaries');
jest.mock('@/hooks/beneficiary/useCreateBeneficiaryAdmin');

// On garde une référence aux props du dernier rendu du modal
let lastModalProps: any = null;

jest.mock('@/components/beneficiaire/AddBeneficiaryModal', () => {
  return jest.fn(props => {
    lastModalProps = props;
    if (!props.isOpen) return null;
    return (
      <div data-testid='add-beneficiary-modal'>
        Modal {props.mode}
        <button onClick={() => props.onClose()} aria-label='close-modal'>
          close
        </button>
        <button
          onClick={() => {
            // simulate submit with minimal payload depending on mode
            if (props.mode === 'create') {
              props.onSubmit({
                organizationId: props.organizationId,
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                generateTempPassword: true,
                role: 'org:recipient',
              });
            } else {
              props.onSubmit({
                id: props.beneficiaryId,
                organizationId: props.organizationId,
                firstName: 'John Updated',
                lastName: 'Doe Updated',
                phone: '+221779999999',
              });
            }
          }}
          aria-label='submit-modal'
        >
          submit
        </button>
      </div>
    );
  });
});

global.fetch = jest.fn();

describe('BeneficiaryManagement', () => {
  const mockRouter = { push: jest.fn(), refresh: jest.fn() };

  const mockBeneficiaries = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+221771234567',
      status: BeneficiaryStatus.ACTIVE,
      progressPercent: 75,
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: null,
      status: BeneficiaryStatus.INACTIVE,
      progressPercent: 50,
      createdAt: '2024-02-20T14:30:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    lastModalProps = null;

    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    (useAuth as jest.Mock).mockReturnValue({
      getToken: jest.fn().mockResolvedValue('mock-token'),
    });

    (useOrganization as jest.Mock).mockReturnValue({
      organization: { id: 'org_123', name: 'Org Test' },
    });

    (useBeneficiaries as jest.Mock).mockReturnValue({
      data: mockBeneficiaries,
      isLoading: false,
    });

    (useCreateBeneficiaryAdmin as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
      isPending: false,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true }),
      text: jest.fn().mockResolvedValue(''),
      status: 200,
    });

    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
  });

  it('renders title + table rows', () => {
    render(<BeneficiaryManagement />);
    expect(screen.getByText(/Gestion des bénéficiaires/i)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<BeneficiaryManagement />);
    expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useBeneficiaries as jest.Mock).mockReturnValue({ data: [], isLoading: true });
    render(<BeneficiaryManagement />);
    expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
  });

  describe('search', () => {
    it('filters by name', () => {
      render(<BeneficiaryManagement />);
      fireEvent.change(screen.getByPlaceholderText('Rechercher...'), { target: { value: 'John' } });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('filters by email', () => {
      render(<BeneficiaryManagement />);
      fireEvent.change(screen.getByPlaceholderText('Rechercher...'), {
        target: { value: 'jane.smith@' },
      });

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('status filter (cycle button "Filtrer")', () => {
    it('cycle: ALL -> ACTIVE (keeps only Active)', () => {
      render(<BeneficiaryManagement />);

      // initial: both present
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();

      // click once => ACTIVE
      fireEvent.click(screen.getByRole('button', { name: 'Filtrer' }));
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('cycle: ALL -> ACTIVE -> INACTIVE (keeps only Inactive)', () => {
      render(<BeneficiaryManagement />);

      fireEvent.click(screen.getByRole('button', { name: 'Filtrer' }));
      fireEvent.click(screen.getByRole('button', { name: 'Filtrer' }));

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('cycle back to ALL', () => {
      render(<BeneficiaryManagement />);

      fireEvent.click(screen.getByRole('button', { name: 'Filtrer' })); // ACTIVE
      fireEvent.click(screen.getByRole('button', { name: 'Filtrer' })); // INACTIVE
      fireEvent.click(screen.getByRole('button', { name: 'Filtrer' })); // ALL

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('modal', () => {
    it('opens create modal on add button', () => {
      render(<BeneficiaryManagement />);

      fireEvent.click(screen.getByRole('button', { name: /Ajouter un bénéficiaire/i }));
      expect(screen.getByTestId('add-beneficiary-modal')).toBeInTheDocument();
      expect(screen.getByText('Modal create')).toBeInTheDocument();
    });

    it('opens edit modal on pencil click', () => {
      render(<BeneficiaryManagement />);

      const editBtn = screen.getAllByTitle('Modifier')[0];
      fireEvent.click(editBtn);

      expect(screen.getByTestId('add-beneficiary-modal')).toBeInTheDocument();
      expect(screen.getByText('Modal edit')).toBeInTheDocument();

      // on vérifie que le modal reçoit bien beneficiaryId + initialValues
      expect(lastModalProps.beneficiaryId).toBe('1');
      expect(lastModalProps.initialValues.firstName).toBe('John');
    });

    it('closes modal when onClose is triggered', async () => {
      render(<BeneficiaryManagement />);

      fireEvent.click(screen.getByRole('button', { name: /Ajouter un bénéficiaire/i }));
      expect(screen.getByTestId('add-beneficiary-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('close-modal'));

      await waitFor(() => {
        expect(screen.queryByTestId('add-beneficiary-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('CSV export', () => {
    it('exports CSV when clicking "Exporter"', () => {
      const createObjectURL = jest.fn(() => 'blob:mock-url');
      const revokeObjectURL = jest.fn();

      global.URL.createObjectURL = createObjectURL;

      global.URL.revokeObjectURL = revokeObjectURL;

      const mockClick = jest.fn();
      const originalCreateElement = document.createElement.bind(document);

      jest.spyOn(document, 'createElement').mockImplementation((tagName: any) => {
        const el = originalCreateElement(tagName);
        if (tagName === 'a') {
          el.click = mockClick;
        }
        return el;
      });

      render(<BeneficiaryManagement />);

      fireEvent.click(screen.getByRole('button', { name: 'Exporter' }));

      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(mockClick).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledTimes(1);

      (document.createElement as jest.Mock).mockRestore?.();
    });
  });

  describe('create beneficiary', () => {
    it('calls mutateAsync then refresh', async () => {
      const mutateAsync = jest.fn().mockResolvedValue({});
      (useCreateBeneficiaryAdmin as jest.Mock).mockReturnValue({
        mutateAsync,
        isPending: false,
      });

      render(<BeneficiaryManagement />);

      fireEvent.click(screen.getByRole('button', { name: /Ajouter un bénéficiaire/i }));
      fireEvent.click(screen.getByLabelText('submit-modal'));

      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledTimes(1);
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });
  });

  describe('update beneficiary', () => {
    it('calls PATCH fetch and refresh', async () => {
      render(<BeneficiaryManagement />);

      const editBtn = screen.getAllByTitle('Modifier')[0];
      fireEvent.click(editBtn);

      fireEvent.click(screen.getByLabelText('submit-modal'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api.example.com/beneficiaries/1',
          expect.objectContaining({
            method: 'PATCH',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              Authorization: 'Bearer mock-token',
            }),
          })
        );
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });

    it('handles PATCH errors with alert', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Update failed'),
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<BeneficiaryManagement />);

      fireEvent.click(screen.getAllByTitle('Modifier')[0]);
      fireEvent.click(screen.getByLabelText('submit-modal'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Update failed');
        expect(consoleSpy).toHaveBeenCalled();
      });

      alertSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('empty states', () => {
    it('shows empty message when no beneficiaries', () => {
      (useBeneficiaries as jest.Mock).mockReturnValue({ data: [], isLoading: false });
      render(<BeneficiaryManagement />);
      expect(screen.getByText(/Aucun bénéficiaire/i)).toBeInTheDocument();
    });

    it('shows empty state when search has no results', () => {
      render(<BeneficiaryManagement />);
      fireEvent.change(screen.getByPlaceholderText('Rechercher...'), {
        target: { value: 'NonExistentName' },
      });
      expect(screen.getByText(/Aucun bénéficiaire trouvé/i)).toBeInTheDocument();
    });
  });

  describe('organization handling', () => {
    it('disables add button when no organization', () => {
      (useOrganization as jest.Mock).mockReturnValue({ organization: null });

      render(<BeneficiaryManagement />);

      const addBtn = screen.getByRole('button', { name: /Ajouter un bénéficiaire/i });
      expect(addBtn).toBeDisabled();
    });
  });
});
