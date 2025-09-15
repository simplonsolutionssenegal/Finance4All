import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Clerk hooks
const mockCreate = jest.fn().mockResolvedValue({
  status: 'complete',
  createdUserId: 'user_123',
  emailAddress: 'test@example.com',
  prepareEmailAddressVerification: jest.fn().mockResolvedValue({}),
});

const mockSignUp = {
  create: mockCreate,
  emailAddress: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
};

const mockUseSignUp = jest.fn().mockReturnValue({
  isLoaded: true,
  signUp: mockSignUp,
  setActive: jest.fn(),
});

const mockPush = jest.fn();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useSignUp: () => mockUseSignUp(),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Eye: () => <div data-testid='eye-icon' />,
  EyeOff: () => <div data-testid='eye-off-icon' />,
  Loader2: () => <div data-testid='loader' />,
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock the auth module
const mockRegisterUser = jest.fn().mockResolvedValue({ success: true });
jest.mock('@/lib/api/auth', () => ({
  registerUser: mockRegisterUser,
}));

// Ne pas mocker le schéma: on veut tester les vrais messages de validation

describe('SignUp page', () => {
  // Cleanup after each test
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSignUp.mockReturnValue({
      isLoaded: true,
      signUp: { ...mockSignUp },
      setActive: jest.fn(),
    });
  });
  it('renders all input fields and labels', async () => {
    await act(async () => {
      const { default: SignUp } = await import('@/app/sign-up/page');
      render(<SignUp />);
    });

    // Check for form elements (labels ancrés pour éviter collisions)
    expect(screen.getByLabelText(/^prénom\*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^nom\*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email\*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^mot de passe\*$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeInTheDocument();

    // Check for password toggle button
    expect(screen.getByRole('button', { name: /afficher le mot de passe/i })).toBeInTheDocument();
  });

  it('affiche les erreurs de validation quand le formulaire vide est soumis', async () => {
    await act(async () => {
      const { default: SignUp } = await import('@/app/sign-up/page');
      render(<SignUp />);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));
    });

    await waitFor(() => {
      // Messages issus du schéma réel (zod)
      expect(
        screen.getByText(/le prénom doit contenir au moins 2 caractères/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/le nom doit contenir au moins 2 caractères/i)).toBeInTheDocument();
      expect(screen.getByText(/format d'email invalide/i)).toBeInTheDocument();
      expect(
        screen.getByText(/le mot de passe doit contenir au moins 8 caractères/i)
      ).toBeInTheDocument();
    });
  });

  it("affiche une erreur d'email invalide quand le champ est vide", async () => {
    await act(async () => {
      const { default: SignUp } = await import('@/app/sign-up/page');
      render(<SignUp />);
    });

    // Laisser l'email vide et remplir les autres champs valides
    fireEvent.change(screen.getByLabelText(/^prénom\*$/i), { target: { value: 'Jean' } });
    fireEvent.change(screen.getByLabelText(/^nom\*$/i), { target: { value: 'Dupont' } });
    fireEvent.change(screen.getByLabelText(/^mot de passe\*$/i), {
      target: { value: 'Password1!' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/format d'email invalide/i)).toBeInTheDocument();
    });
  });

  it('affiche une erreur si le mot de passe est trop court', async () => {
    await act(async () => {
      const { default: SignUp } = await import('@/app/sign-up/page');
      render(<SignUp />);
    });

    fireEvent.change(screen.getByPlaceholderText(/mot de passe/i), { target: { value: '123' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));
    });

    await waitFor(() => {
      expect(
        screen.getByText(/le mot de passe doit contenir au moins 8 caractères/i)
      ).toBeInTheDocument();
    });
  });

  it("gère l'erreur d'inscription", async () => {
    // Mock a failed signup
    mockCreate.mockRejectedValueOnce(new Error('Signup failed'));

    await act(async () => {
      const { default: SignUp } = await import('@/app/sign-up/page');
      render(<SignUp />);
    });

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/^prénom\*$/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/^nom\*$/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/mot de passe/i), {
      target: { value: 'Password123!' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));
    });

    // Vérifie le toast d'erreur
    await waitFor(() => {
      const { toast } = require('sonner');
      expect(toast.error).toHaveBeenCalledWith("Une erreur est survenue lors de l'inscription");
    });
  });

  it('soumet le formulaire avec succès avec des données valides', async () => {
    await act(async () => {
      const { default: SignUp } = await import('@/app/sign-up/page');
      render(<SignUp />);
    });

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/^prénom\*$/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/^nom\*$/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/mot de passe/i), {
      target: { value: 'Password123!' },
    });

    // Mock successful signup
    const mockVerification = { status: 'complete' };
    mockCreate.mockResolvedValueOnce({
      status: 'complete',
      createdUserId: 'user_123',
      emailAddress: 'john.doe@example.com',
      prepareEmailAddressVerification: jest.fn().mockResolvedValue(mockVerification),
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));
    });

    // Vérifie la navigation après succès
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/sign-up/verify-email-address');
    });
    // Vérifie le toast de succès
    const { toast } = require('sonner');
    expect(toast.success).toHaveBeenCalledWith(
      'Inscription réussie ! Veuillez vérifier votre email.'
    );
  });

  it("gère l'état de chargement pendant la soumission", async () => {
    // Mock a slow signup
    let resolvePromise: (value: unknown) => void = () => {};
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    mockCreate.mockImplementationOnce(() => promise);

    await act(async () => {
      const { default: SignUp } = await import('@/app/sign-up/page');
      render(<SignUp />);
    });

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/^prénom\*$/i), { target: { value: 'Jean' } });
    fireEvent.change(screen.getByLabelText(/^nom\*$/i), { target: { value: 'Dupont' } });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'jean.dupont@email.com' },
    });
    fireEvent.change(screen.getByLabelText(/^mot de passe\*$/i), {
      target: { value: 'Password1!' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    // Attente de l'état de chargement
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /inscription en cours.../i })).toBeDisabled();
    });

    // Resolve the promise to clean up
    resolvePromise({
      status: 'complete',
      createdUserId: 'user_123',
      emailAddress: 'jean.dupont@email.com',
      prepareEmailAddressVerification: jest.fn().mockResolvedValue({}),
    });

    // Wait for the promise to resolve
    await act(async () => {
      await promise;
    });

    // Verify navigation
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/sign-up/verify-email-address');
    });
  });
});
