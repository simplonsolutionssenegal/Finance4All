import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AddInstitutionModal from '@/components/admin/institutions/AddInstitutionModal';
import { useCreateInstitution } from '@/hooks/useCreateInstitution';

// Mock the hook
jest.mock('@/hooks/useCreateInstitution');
const mockUseCreateInstitution = useCreateInstitution as jest.Mock;

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt || 'Aperçu du logo'} />,
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
      {open ? <div data-testid='dialog'>{children}</div> : null}
      <button data-testid='dialog-close' onClick={() => onOpenChange?.(false)}>
        close
      </button>
      <button data-testid='dialog-open' onClick={() => onOpenChange?.(true)}>
        open
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
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('AddInstitutionModal', () => {
  let mockCreateInstitution: jest.Mock;
  let mockOnOpenChange: jest.Mock;
  let mockSuccessCallback: () => void = () => {};

  const setup = (open = true, isCreating = false) => {
    mockCreateInstitution = jest.fn();
    mockOnOpenChange = jest.fn();

    mockUseCreateInstitution.mockImplementation(({ onSuccess }) => {
      if (onSuccess) mockSuccessCallback = onSuccess;
      return { createInstitution: mockCreateInstitution, isCreating };
    });

    const user = userEvent.setup();
    const renderResult = render(
      <AddInstitutionModal open={open} onOpenChange={mockOnOpenChange} />,
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

  it('renders all form fields and disabled submit button initially', () => {
    setup();
    expect(screen.getByText('Ajouter un institut')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom de l'institut/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Site web/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Rechercher une zone.../i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Logo \(URL\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enregistrer/i })).toBeDisabled();
  });

  it('renders nothing when open=false', () => {
    render(<AddInstitutionModal open={false} onOpenChange={jest.fn()} />, { wrapper });
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('shows validation errors for invalid input', async () => {
    const { user } = setup();
    const submitButton = screen.getByRole('button', { name: /Enregistrer/i });

    await user.type(screen.getByLabelText(/Nom de l'institut/i), 'a');
    await user.type(screen.getByLabelText(/Description/i), 'short');
    await user.type(screen.getByLabelText(/Site web/i), 'invalid-url');
    fireEvent.blur(screen.getByLabelText(/Site web/i));
    fireEvent.submit(submitButton);

    expect(
      await screen.findByText('Le nom doit contenir au moins 2 caractères')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('La description doit contenir au moins 10 caractères')
    ).toBeInTheDocument();
    expect(await screen.findByText('Doit être une URL valide')).toBeInTheDocument();
    expect(
      await screen.findByText('Au moins une zone géographique est requise')
    ).toBeInTheDocument();
  });

  it('enables submit button and submits with all fields filled', async () => {
    const { user } = setup();
    const submitButton = screen.getByRole('button', { name: /Enregistrer/i });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText(/Nom de l'institut/i), 'Test Bank');
    await user.type(screen.getByLabelText(/Description/i), 'This is a test description.');
    await user.type(screen.getByLabelText(/Site web/i), 'https://test.com');
    await user.type(screen.getByLabelText(/Logo \(URL\)/i), 'https://test.com/logo.png');
    await user.click(screen.getByPlaceholderText(/Rechercher une zone.../i));
    await user.click(await screen.findByRole('button', { name: 'UEMOA' }));

    await waitFor(() => expect(submitButton).toBeEnabled());
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateInstitution).toHaveBeenCalledWith({
        name: 'Test Bank',
        description: 'This is a test description.',
        website: 'https://test.com',
        logoUrl: 'https://test.com/logo.png',
        geographicZones: ['UEMOA'],
      });
    });
  });

  it('submits with only required fields filled', async () => {
    const { user } = setup();
    const submitButton = screen.getByRole('button', { name: /Enregistrer/i });

    await user.type(screen.getByLabelText(/Nom de l'institut/i), 'Another Bank');
    await user.type(screen.getByLabelText(/Description/i), 'A description long enough.');
    await user.click(screen.getByPlaceholderText(/Rechercher une zone.../i));
    await user.click(await screen.findByRole('button', { name: 'CEMAC' }));

    await waitFor(() => expect(submitButton).toBeEnabled());
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateInstitution).toHaveBeenCalledWith({
        name: 'Another Bank',
        description: 'A description long enough.',
        website: '',
        logoUrl: '',
        geographicZones: ['CEMAC'],
      });
    });
  });

  it('handles geographic zone selection and removal', async () => {
    const { user } = setup();
    const zoneInput = screen.getByPlaceholderText(/Rechercher une zone.../i);

    await user.click(zoneInput);
    const uemoaOption = await screen.findByRole('button', { name: 'UEMOA' });
    expect(uemoaOption).toBeInTheDocument();

    await user.click(uemoaOption);
    expect(await screen.findByText('UEMOA')).toBeInTheDocument();

    await user.click(screen.getByText('UEMOA')); // remove via badge
    await waitFor(() => {
      expect(screen.queryByText('UEMOA')).not.toBeInTheDocument();
    });
  });

  it('shows no dropdown options when search has no matches', async () => {
    const { user } = setup();
    const zoneInput = screen.getByPlaceholderText(/Rechercher une zone.../i);

    await user.click(zoneInput);
    await user.type(zoneInput, 'zzzzzz');

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'UEMOA' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'CEMAC' })).not.toBeInTheDocument();
    });
  });

  it('shows logo preview for a valid URL', async () => {
    const { user } = setup();

    // make form valid so the section can render consistently
    await user.type(screen.getByLabelText(/Nom de l'institut/i), 'Valid Bank');
    await user.type(screen.getByLabelText(/Description/i), 'A long enough description.');
    await user.click(screen.getByPlaceholderText(/Rechercher une zone.../i));
    await user.click(await screen.findByRole('button', { name: 'UEMOA' }));

    const logoInput = screen.getByLabelText(/Logo \(URL\)/i);
    await user.type(logoInput, 'https://valid.com/logo.png');
    fireEvent.blur(logoInput);

    // preview block shows
    expect(await screen.findByText('Aperçu du logo :')).toBeInTheDocument();
  });

  it('hides logo preview when logo URL is cleared and shows error on invalid URL', async () => {
    const { user } = setup();

    // form valid baseline
    await user.type(screen.getByLabelText(/Nom de l'institut/i), 'Valid Bank');
    await user.type(screen.getByLabelText(/Description/i), 'A long enough description.');
    await user.click(screen.getByPlaceholderText(/Rechercher une zone.../i));
    await user.click(await screen.findByRole('button', { name: 'UEMOA' }));

    const logoInput = screen.getByLabelText(/Logo \(URL\)/i);

    // first, set a valid URL to ensure preview appears
    await user.type(logoInput, 'https://valid.com/logo.png');
    fireEvent.blur(logoInput);
    expect(await screen.findByText('Aperçu du logo :')).toBeInTheDocument();

    // then clear -> preview must disappear (logoUrl becomes falsy)
    await user.clear(logoInput);
    fireEvent.blur(logoInput);
    await waitFor(() => {
      expect(screen.queryByText('Aperçu du logo :')).not.toBeInTheDocument();
    });

    // now check invalid URL error (independent of preview)
    await user.type(logoInput, 'invalid-url');
    fireEvent.blur(logoInput);

    // submit the <form> directly to trigger zod resolver in onSubmit mode
    const formEl = document.querySelector('form') as HTMLFormElement;
    fireEvent.submit(formEl);

    expect(await screen.findByText('Doit être une URL valide')).toBeInTheDocument();
  });

  it('disables form fields and shows loading state when isCreating=true', () => {
    setup(true, true);
    expect(screen.getByLabelText(/Nom de l'institut/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /Enregistrement.../i })).toBeDisabled();
  });

  it('resets form and calls onOpenChange(false) when modal is closed (isCreating=false)', async () => {
    const { user } = setup(true, false);

    await user.type(screen.getByLabelText(/Nom de l'institut/i), 'Bank A');
    await user.type(screen.getByLabelText(/Description/i), 'Description long enough');
    await user.click(screen.getByPlaceholderText(/Rechercher une zone.../i));
    await user.click(await screen.findByRole('button', { name: 'UEMOA' }));

    expect((screen.getByLabelText(/Nom de l'institut/i) as HTMLInputElement).value).toBe('Bank A');
    expect(screen.getByText('UEMOA')).toBeInTheDocument();

    await user.click(screen.getByTestId('dialog-close'));

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
    expect((screen.getByLabelText(/Nom de l'institut/i) as HTMLInputElement).value).toBe('');
    expect(screen.queryByText('UEMOA')).not.toBeInTheDocument();
  });

  it('does not call onOpenChange when closing while isCreating=true', async () => {
    // Render directly with isCreating=true
    const { user } = setup(true, true);
    // Try to close
    await user.click(screen.getByTestId('dialog-close'));
    // Assert: no call (close blocked)
    expect(mockOnOpenChange).not.toHaveBeenCalled();
  });

  it('calls onSuccess, resets form, and closes modal after successful submission', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText(/Nom de l'institut/i), 'Test Bank');
    await user.type(screen.getByLabelText(/Description/i), 'This is a test description.');
    await user.click(screen.getByPlaceholderText(/Rechercher une zone.../i));
    await user.click(await screen.findByRole('button', { name: 'UEMOA' }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Enregistrer/i })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: /Enregistrer/i }));

    await waitFor(() => expect(mockCreateInstitution).toHaveBeenCalled());

    act(() => {
      mockSuccessCallback();
    });

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
