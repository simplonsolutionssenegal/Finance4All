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

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock BeneficiaryTable
jest.mock('@/components/beneficiaire/BeneficiaryTable', () => {
  return jest.fn(({ rows, isLoading, onEdit, onView, onDelete, onReactivate }) => {
    if (isLoading) return <div>Chargement...</div>;
    if (rows.length === 0) return <div>Aucun bénéficiaire trouvé.</div>;
    return (
      <div>
        {rows.map((b: any) => (
          <div key={b.id}>
            <span>
              {b.firstName} {b.lastName}
            </span>
            <button onClick={() => onEdit(b)} title='Modifier'>
              edit
            </button>
            <button onClick={() => onView(b)} title='Voir'>
              view
            </button>
            <button onClick={() => onDelete(b)} title='Supprimer'>
              delete
            </button>
            <button onClick={() => onReactivate(b)} title='Réactiver'>
              reactivate
            </button>
          </div>
        ))}
      </div>
    );
  });
});

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

    // Par défaut, le filtre est ACTIVE, donc seul John Doe (ACTIVE) est visible
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Jane Smith est INACTIVE, donc pas visible par défaut
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<BeneficiaryManagement />);
    expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useBeneficiaries as jest.Mock).mockReturnValue({ data: [], isLoading: true });
    render(<BeneficiaryManagement />);
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  describe('search', () => {
    it('filters by name', () => {
      render(<BeneficiaryManagement />);

      // Par défaut le filtre est ACTIVE, donc John Doe est visible
      fireEvent.change(screen.getByPlaceholderText('Rechercher...'), { target: { value: 'John' } });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('filters by email', () => {
      render(<BeneficiaryManagement />);

      // Passer au filtre ALL pour voir tous les bénéficiaires
      fireEvent.click(screen.getByRole('button', { name: 'Filtrer' })); // ACTIVE -> INACTIVE
      fireEvent.click(screen.getByRole('button', { name: 'Filtrer' })); // INACTIVE -> ALL

      fireEvent.change(screen.getByPlaceholderText('Rechercher...'), {
        target: { value: 'jane.smith@' },
      });

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('status filter (cycle button "Filtrer")', () => {
    it('starts with ACTIVE filter by default (shows only active users)', () => {
      render(<BeneficiaryManagement />);

      // Par défaut, le filtre est ACTIVE
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('cycle: ACTIVE -> INACTIVE (shows only inactive users)', () => {
      render(<BeneficiaryManagement />);

      // click once => INACTIVE
      fireEvent.click(screen.getByRole('button', { name: 'Filtrer' }));
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('cycle: ACTIVE -> INACTIVE -> ALL (shows all users)', () => {
      render(<BeneficiaryManagement />);

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
    it('calls mutateAsync then refresh and shows success toast', async () => {
      const { toast } = require('sonner');
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
        expect(toast.success).toHaveBeenCalledWith('Bénéficiaire ajouté avec succès ✅');
      });
    });
  });

  describe('update beneficiary', () => {
    it('calls PATCH fetch, refresh and shows success toast', async () => {
      const { toast } = require('sonner');

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
        expect(toast.success).toHaveBeenCalledWith('Bénéficiaire mis à jour avec succès ✅');
      });
    });

    it('handles PATCH errors with toast', async () => {
      const { toast } = require('sonner');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Update failed'),
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<BeneficiaryManagement />);

      fireEvent.click(screen.getAllByTitle('Modifier')[0]);
      fireEvent.click(screen.getByLabelText('submit-modal'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Update failed');
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('empty states', () => {
    it('shows empty message when no beneficiaries', () => {
      (useBeneficiaries as jest.Mock).mockReturnValue({ data: [], isLoading: false });
      render(<BeneficiaryManagement />);
      expect(screen.getByText('Aucun bénéficiaire trouvé.')).toBeInTheDocument();
    });

    it('shows empty state when search has no results', () => {
      render(<BeneficiaryManagement />);
      fireEvent.change(screen.getByPlaceholderText('Rechercher...'), {
        target: { value: 'NonExistentName' },
      });
      expect(screen.getByText('Aucun bénéficiaire trouvé.')).toBeInTheDocument();
    });
  });

  describe('organization handling', () => {
    it('shows tooltip on add button when no organization', () => {
      (useOrganization as jest.Mock).mockReturnValue({ organization: null });

      render(<BeneficiaryManagement />);

      const addBtn = screen.getByRole('button', { name: /Ajouter un bénéficiaire/i });
      expect(addBtn).toHaveAttribute('title', "Sélectionne une organisation d'abord");
    });

    it('shows organization name in header', () => {
      render(<BeneficiaryManagement />);
      expect(screen.getByText(/Org Test/)).toBeInTheDocument();
    });

    it('shows "Aucune organisation" when no organization', () => {
      (useOrganization as jest.Mock).mockReturnValue({ organization: null });
      render(<BeneficiaryManagement />);
      expect(screen.getByText(/Aucune organisation/)).toBeInTheDocument();
    });
  });

  describe('delete beneficiary (set to INACTIVE)', () => {
    it('calls PATCH with INACTIVE status and removes from list', async () => {
      const { toast } = require('sonner');

      render(<BeneficiaryManagement />);

      // John Doe est présent initialement
      expect(screen.getByText('John Doe')).toBeInTheDocument();

      // On clique sur supprimer
      fireEvent.click(screen.getAllByTitle('Supprimer')[0]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api.example.com/beneficiaries/1',
          expect.objectContaining({
            method: 'PATCH',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              Authorization: 'Bearer mock-token',
            }),
            body: JSON.stringify({
              organizationId: 'org_123',
              status: 'INACTIVE',
            }),
          })
        );
        expect(toast.success).toHaveBeenCalledWith('Bénéficiaire désactivé avec succès ✅');
      });

      // John Doe devrait être retiré de la liste locale
      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });

    it('shows error toast when delete fails', async () => {
      const { toast } = require('sonner');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Server error'),
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<BeneficiaryManagement />);

      fireEvent.click(screen.getAllByTitle('Supprimer')[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Server error');
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it('shows error when no organization for delete', async () => {
      const { toast } = require('sonner');
      (useOrganization as jest.Mock).mockReturnValue({ organization: null });

      render(<BeneficiaryManagement />);

      fireEvent.click(screen.getAllByTitle('Supprimer')[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Aucune organisation active.');
      });
    });
  });

  describe('reactivate beneficiary (set to ACTIVE)', () => {
    it('calls PATCH with ACTIVE status and updates local state', async () => {
      const { toast } = require('sonner');

      render(<BeneficiaryManagement />);

      // Jane Smith est INACTIVE, on va la réactiver
      fireEvent.click(screen.getAllByTitle('Réactiver')[0]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api.example.com/beneficiaries/1',
          expect.objectContaining({
            method: 'PATCH',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              Authorization: 'Bearer mock-token',
            }),
            body: JSON.stringify({
              organizationId: 'org_123',
              status: 'ACTIVE',
            }),
          })
        );
        expect(toast.success).toHaveBeenCalledWith('Bénéficiaire réactivé avec succès ✅');
      });
    });

    it('shows error toast when reactivate fails', async () => {
      const { toast } = require('sonner');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Reactivation failed'),
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<BeneficiaryManagement />);

      fireEvent.click(screen.getAllByTitle('Réactiver')[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Reactivation failed');
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it('shows error when no organization for reactivate', async () => {
      const { toast } = require('sonner');
      (useOrganization as jest.Mock).mockReturnValue({ organization: null });

      render(<BeneficiaryManagement />);

      fireEvent.click(screen.getAllByTitle('Réactiver')[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Aucune organisation active.');
      });
    });
  });

  describe('view beneficiary', () => {
    it('navigates to beneficiary detail page on view click', () => {
      render(<BeneficiaryManagement />);

      fireEvent.click(screen.getAllByTitle('Voir')[0]);

      expect(mockRouter.push).toHaveBeenCalledWith('/beneficiaires/1');
    });
  });

  describe('search with phone', () => {
    it('filters by phone number', () => {
      render(<BeneficiaryManagement />);

      fireEvent.change(screen.getByPlaceholderText('Rechercher...'), {
        target: { value: '+221771234567' },
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  describe('search with ID', () => {
    it('filters by beneficiary ID', () => {
      render(<BeneficiaryManagement />);

      fireEvent.change(screen.getByPlaceholderText('Rechercher...'), {
        target: { value: '1' },
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  describe('combined search and filter', () => {
    it('applies both search query and status filter', () => {
      render(<BeneficiaryManagement />);

      // Filtre INACTIVE (par défaut c'est ACTIVE)
      fireEvent.click(screen.getByRole('button', { name: 'Filtrer' }));

      // Recherche "Jane"
      fireEvent.change(screen.getByPlaceholderText('Rechercher...'), {
        target: { value: 'Jane' },
      });

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('handles create beneficiary error', async () => {
      const { toast } = require('sonner');
      const mutateAsync = jest.fn().mockRejectedValue(new Error('Creation failed'));
      (useCreateBeneficiaryAdmin as jest.Mock).mockReturnValue({
        mutateAsync,
        isPending: false,
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<BeneficiaryManagement />);

      fireEvent.click(screen.getByRole('button', { name: /Ajouter un bénéficiaire/i }));
      fireEvent.click(screen.getByLabelText('submit-modal'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Creation failed');
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it('handles missing API URL for update', async () => {
      const { toast } = require('sonner');
      delete process.env.NEXT_PUBLIC_API_URL;

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<BeneficiaryManagement />);

      fireEvent.click(screen.getAllByTitle('Modifier')[0]);
      fireEvent.click(screen.getByLabelText('submit-modal'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('NEXT_PUBLIC_API_URL non défini');
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    });
  });

  describe('modal props', () => {
    it('passes correct props for create mode', () => {
      render(<BeneficiaryManagement />);

      fireEvent.click(screen.getByRole('button', { name: /Ajouter un bénéficiaire/i }));

      expect(lastModalProps.mode).toBe('create');
      expect(lastModalProps.organizationId).toBe('org_123');
      expect(lastModalProps.beneficiaryId).toBeUndefined();
      expect(lastModalProps.initialValues).toBeUndefined();
      expect(lastModalProps.isCreating).toBe(false);
    });

    it('passes correct props for edit mode', () => {
      render(<BeneficiaryManagement />);

      fireEvent.click(screen.getAllByTitle('Modifier')[0]);

      expect(lastModalProps.mode).toBe('edit');
      expect(lastModalProps.organizationId).toBe('org_123');
      expect(lastModalProps.beneficiaryId).toBe('1');
      expect(lastModalProps.initialValues).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+221771234567',
      });
      expect(lastModalProps.isUpdating).toBe(false);
    });
  });
});
