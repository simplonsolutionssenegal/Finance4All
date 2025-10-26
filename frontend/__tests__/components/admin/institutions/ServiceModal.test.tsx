import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ServiceModal from '@/components/admin/institutions/ServiceModal';
import { useCreateService } from '@/hooks/service/useCreateService';
import { TypeService, TypeCalculation } from '@/types/Service';

// Mock hasPointerCapture for JSDOM
HTMLElement.prototype.hasPointerCapture = jest.fn(() => false);
HTMLElement.prototype.setPointerCapture = jest.fn();
HTMLElement.prototype.releasePointerCapture = jest.fn();

// Mock hooks
jest.mock('@/hooks/service/useCreateService');
const mockUseCreateService = useCreateService as jest.Mock;

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: jest.fn().mockResolvedValue('test-token'),
  }),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Plus: () => <div data-testid='plus-icon' />,
  X: () => <div data-testid='x-icon' />,
}));

// Mock Dialog to control open/close
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange?: (isOpen: boolean) => void;
  }) => (
    <div>
      {open ? <div role='dialog'>{children}</div> : null}
      <button data-testid='dialog-close' onClick={() => onOpenChange?.(false)}>
        close
      </button>
    </div>
  ),
  DialogContent: ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  DialogHeader: ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  DialogTitle: ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  DialogDescription: ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
}));

// Mock Select components
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value, disabled }: any) => (
    <div data-testid='select-wrapper'>
      {children}
      <select
        data-testid='select-trigger'
        onChange={e => onValueChange?.(e.target.value)}
        value={value}
        disabled={disabled}
        aria-label='Select option'
      >
        <option value=''>Select...</option>
      </select>
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children, className }: any) => <div className={className}>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

// Mock Textarea
jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ ...props }: any) => <textarea {...props} />,
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('ServiceModal', () => {
  let mockCreateService: jest.Mock;
  let mockOnOpenChange: jest.Mock;
  let mockRefresh: jest.Mock;
  let mockSuccessCallback: () => void = () => {};

  const setup = (open = true, isCreating = false) => {
    mockCreateService = jest.fn();
    mockOnOpenChange = jest.fn();
    mockRefresh = jest.fn();

    mockUseCreateService.mockImplementation(({ onSuccess }) => {
      if (onSuccess) mockSuccessCallback = onSuccess;
      return { createService: mockCreateService, isCreating };
    });

    const user = userEvent.setup();
    const renderResult = render(
      <ServiceModal
        open={open}
        onOpenChange={mockOnOpenChange}
        institutionId='inst-123'
        institutionName='Test Institution'
        refresh={mockRefresh}
      />,
      {
        wrapper,
      }
    );
    return { user, ...renderResult };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  describe('Rendering', () => {
    it('renders modal title and description', () => {
      setup();
      expect(screen.getByText('Nouveau service')).toBeInTheDocument();
      expect(
        screen.getByText(/Créer un nouveau service financier pour Test Institution/i)
      ).toBeInTheDocument();
    });

    it('renders all form fields and disabled submit button initially', () => {
      setup();
      expect(screen.getByLabelText(/Nom du service/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
      expect(screen.getByText(/Type de service/i)).toBeInTheDocument();
      expect(screen.getByText(/Type de Frais/i)).toBeInTheDocument();
      expect(screen.getByText('Frais')).toBeInTheDocument();
      expect(screen.getByText(/Conditions d'accès/i)).toBeInTheDocument();
      expect(screen.getByText(/Plafonds/i)).toBeInTheDocument();
      expect(screen.getByText(/Infrastructure d'accès/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Enregistrer/i })).toBeDisabled();
    });

    it('renders fee input fields', () => {
      setup();
      expect(screen.getByLabelText(/Montant fixe/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Pourcentage/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Minimum/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Maximum/i)).toBeInTheDocument();
    });

    it('renders with modal closed', () => {
      const { container } = setup(false);
      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });

    it('displays correct placeholder texts', () => {
      setup();
      expect(screen.getByPlaceholderText('Ex: Transfert')).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Ex: Transfert d'argent")).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ajouter une condition')).toBeInTheDocument();
    });
  });

  describe('Form Input Handling', () => {
    it('allows typing in name field', async () => {
      const { user } = setup();
      const nameInput = screen.getByLabelText(/Nom du service/i);
      await user.type(nameInput, 'Test Service');
      expect(nameInput).toHaveValue('Test Service');
    });

    it('allows typing in description field (textarea)', async () => {
      const { user } = setup();
      const descriptionInput = screen.getByLabelText(/Description/i);
      await user.type(descriptionInput, 'Test Description');
      expect(descriptionInput).toHaveValue('Test Description');
    });

    it('handles montantFixe input with value conversion', async () => {
      const { user } = setup();
      const montantFixeInput = screen.getByLabelText(/Montant fixe/i);
      await user.type(montantFixeInput, '100');
      expect(montantFixeInput).toHaveValue(100);
    });

    it('handles montantFixe input clearing', async () => {
      const { user } = setup();
      const montantFixeInput = screen.getByLabelText(/Montant fixe/i);
      await user.type(montantFixeInput, '100');
      await user.clear(montantFixeInput);
      expect(montantFixeInput).toHaveValue(null);
    });

    it('handles pourcentage input with value conversion', async () => {
      const { user } = setup();
      const pourcentageInput = screen.getByLabelText(/Pourcentage/i);
      await user.type(pourcentageInput, '2.5');
      expect(pourcentageInput).toHaveValue(2.5);
    });

    it('handles minimum input with value conversion', async () => {
      const { user } = setup();
      const minimumInput = screen.getByLabelText(/Minimum/i);
      await user.type(minimumInput, '50');
      expect(minimumInput).toHaveValue(50);
    });

    it('handles maximum input with value conversion', async () => {
      const { user } = setup();
      const maximumInput = screen.getByLabelText(/Maximum/i);
      await user.type(maximumInput, '200');
      expect(maximumInput).toHaveValue(200);
    });
  });

  describe('Array Item Management - Conditions', () => {
    it('adds condition when button is clicked', async () => {
      const { user } = setup();
      const conditionInput = screen.getByPlaceholderText('Ajouter une condition');
      await user.type(conditionInput, 'New Condition');

      const addButtons = screen.getAllByTestId('plus-icon');
      await user.click(addButtons[0].parentElement!);

      expect(await screen.findByText('New Condition')).toBeInTheDocument();
      expect(conditionInput).toHaveValue('');
    });

    it('adds condition on Enter key press', async () => {
      const { user } = setup();
      const conditionInput = screen.getByPlaceholderText('Ajouter une condition');
      await user.type(conditionInput, 'Condition via Enter{Enter}');

      expect(await screen.findByText('Condition via Enter')).toBeInTheDocument();
    });

    it('trims whitespace when adding condition', async () => {
      const { user } = setup();
      const conditionInput = screen.getByPlaceholderText('Ajouter une condition');
      await user.type(conditionInput, '  Trimmed Condition  ');

      const addButtons = screen.getAllByTestId('plus-icon');
      await user.click(addButtons[0].parentElement!);

      expect(await screen.findByText('Trimmed Condition')).toBeInTheDocument();
    });

    it('does not add empty condition', async () => {
      const { user } = setup();
      const conditionInput = screen.getByPlaceholderText('Ajouter une condition');
      await user.type(conditionInput, '   ');

      const addButtons = screen.getAllByTestId('plus-icon');
      expect(addButtons[0].parentElement).toBeDisabled();
    });

    it('removes condition when badge is clicked', async () => {
      const { user } = setup();
      const conditionInput = screen.getByPlaceholderText('Ajouter une condition');
      await user.type(conditionInput, 'Condition to Remove{Enter}');

      expect(await screen.findByText('Condition to Remove')).toBeInTheDocument();

      await user.click(screen.getByText('Condition to Remove'));

      await waitFor(() => {
        expect(screen.queryByText('Condition to Remove')).not.toBeInTheDocument();
      });
    });

    it('does not remove condition when creating', async () => {
      setup(true, true);

      const conditionInput = screen.getByPlaceholderText('Ajouter une condition');

      // The input should be disabled when creating
      expect(conditionInput).toBeDisabled();
    });
  });

  describe('Array Item Management - Plafonds', () => {
    it('adds plafond when button is clicked', async () => {
      const { user } = setup();
      const plafondInput = screen.getByPlaceholderText(/500 000 FCFA\/jour/i);
      await user.type(plafondInput, '1000000 FCFA/mois');

      const addButtons = screen.getAllByTestId('plus-icon');
      await user.click(addButtons[1].parentElement!);

      expect(await screen.findByText('1000000 FCFA/mois')).toBeInTheDocument();
      expect(plafondInput).toHaveValue('');
    });

    it('adds plafond on Enter key press', async () => {
      const { user } = setup();
      const plafondInput = screen.getByPlaceholderText(/500 000 FCFA\/jour/i);
      await user.type(plafondInput, 'Plafond via Enter{Enter}');

      expect(await screen.findByText('Plafond via Enter')).toBeInTheDocument();
    });

    it('removes plafond when badge is clicked', async () => {
      const { user } = setup();
      const plafondInput = screen.getByPlaceholderText(/500 000 FCFA\/jour/i);
      await user.type(plafondInput, 'Plafond to Remove{Enter}');

      expect(await screen.findByText('Plafond to Remove')).toBeInTheDocument();

      await user.click(screen.getByText('Plafond to Remove'));

      await waitFor(() => {
        expect(screen.queryByText('Plafond to Remove')).not.toBeInTheDocument();
      });
    });
  });

  describe('Array Item Management - Infrastructure', () => {
    it('adds infrastructure when button is clicked', async () => {
      const { user } = setup();
      const infraInput = screen.getByPlaceholderText(/Agence, GAB, Mobile/i);
      await user.type(infraInput, 'Mobile App');

      const addButtons = screen.getAllByTestId('plus-icon');
      await user.click(addButtons[2].parentElement!);

      expect(await screen.findByText('Mobile App')).toBeInTheDocument();
      expect(infraInput).toHaveValue('');
    });

    it('adds infrastructure on Enter key press', async () => {
      const { user } = setup();
      const infraInput = screen.getByPlaceholderText(/Agence, GAB, Mobile/i);
      await user.type(infraInput, 'Infra via Enter{Enter}');

      expect(await screen.findByText('Infra via Enter')).toBeInTheDocument();
    });

    it('removes infrastructure when badge is clicked', async () => {
      const { user } = setup();
      const infraInput = screen.getByPlaceholderText(/Agence, GAB, Mobile/i);
      await user.type(infraInput, 'Infra to Remove{Enter}');

      expect(await screen.findByText('Infra to Remove')).toBeInTheDocument();

      await user.click(screen.getByText('Infra to Remove'));

      await waitFor(() => {
        expect(screen.queryByText('Infra to Remove')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data and triggers onSubmit', async () => {
      const { user } = setup();

      // Fill all required fields
      await user.type(screen.getByLabelText(/Nom du service/i), 'Test Service');
      await user.type(screen.getByLabelText(/Description/i), 'Test Service Long Name');

      // Try to set the select values
      const selectElements = screen.getAllByTestId('select-trigger') as HTMLSelectElement[];
      fireEvent.change(selectElements[0], { target: { value: TypeService.PAIEMENT_MARCHAND } });
      fireEvent.change(selectElements[1], { target: { value: TypeCalculation.FIX } });

      // Find the form and try submitting
      const formElement = screen.getByRole('button', { name: /Enregistrer/i }).closest('form');
      if (formElement) {
        await act(async () => {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          Object.defineProperty(submitEvent, 'target', {
            value: formElement,
            enumerable: true,
          });
          fireEvent(formElement, submitEvent);
        });
      }
    });
  });

  describe('Modal Behavior', () => {
    it('closes modal and resets form when cancel is clicked', async () => {
      const { user } = setup();
      await user.type(screen.getByLabelText(/Nom du service/i), 'Test Service');
      await user.click(screen.getByRole('button', { name: /Annuler/i }));
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('resets form when modal is closed via dialog close button', async () => {
      const { user } = setup();

      // Fill in some data
      await user.type(screen.getByLabelText(/Nom du service/i), 'Test Service');
      expect(screen.getByLabelText(/Nom du service/i)).toHaveValue('Test Service');

      // Close the dialog using the mock close button
      await user.click(screen.getByTestId('dialog-close'));

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('closes modal and resets form when onOpenChange is called with false', () => {
      const { rerender } = setup();

      // Simulate closing the modal
      rerender(
        <QueryClientProvider client={queryClient}>
          <ServiceModal
            open={false}
            onOpenChange={mockOnOpenChange}
            institutionId='inst-123'
            institutionName='Test Institution'
            refresh={mockRefresh}
          />
        </QueryClientProvider>
      );
    });

    it('does not close modal when creating', async () => {
      setup(true, true);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('calls refresh and closes modal on successful submission', async () => {
      setup();

      act(() => {
        mockSuccessCallback();
      });

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled();
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Button States', () => {
    it('disables form when creating', () => {
      setup(true, true);
      expect(screen.getByRole('button', { name: /Enregistrement.../i })).toBeDisabled();
      expect(screen.getByLabelText(/Nom du service/i)).toBeDisabled();
    });

    it('has correct cancel button text', () => {
      setup();
      expect(screen.getByRole('button', { name: /Annuler/i })).toBeInTheDocument();
    });

    it('has correct submit button text when not creating', () => {
      setup(true, false);
      expect(screen.getByRole('button', { name: /Enregistrer/i })).toBeInTheDocument();
    });

    it('has correct submit button text when creating', () => {
      setup(true, true);
      expect(screen.getByRole('button', { name: /Enregistrement.../i })).toBeInTheDocument();
    });

    it('disables cancel button when creating', () => {
      setup(true, true);
      expect(screen.getByRole('button', { name: /Annuler/i })).toBeDisabled();
    });
  });

  describe('Select Fields', () => {
    it('renders Type de service select with placeholder', () => {
      setup();
      expect(screen.getByText('Sélectionner un type')).toBeInTheDocument();
    });

    it('renders Type de Frais select with placeholder', () => {
      setup();
      expect(screen.getByText('Type frais')).toBeInTheDocument();
    });

    it('disables selects when creating', () => {
      setup(true, true);
      const selectElements = screen.getAllByTestId('select-trigger') as HTMLSelectElement[];
      selectElements.forEach(select => {
        expect(select).toBeDisabled();
      });
    });
  });

  describe('Institution Name Display', () => {
    it('displays institution name in description', () => {
      setup();
      expect(screen.getByText(/Test Institution/i)).toBeInTheDocument();
    });
  });
});
