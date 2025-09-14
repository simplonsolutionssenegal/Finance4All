
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { ConnexionForm } from '@/components/connexion-form';

// Mock Clerk hooks
const mockSignIn = {
  create: jest.fn(),
};
const mockSetActive = jest.fn();
const mockUseSignIn = jest.fn();

jest.mock('@clerk/nextjs', () => ({
  useSignIn: () => mockUseSignIn(),
}));

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, disabled, onClick, type, className }: any) => (
    <button
      data-testid="button"
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={className}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, disabled, type, placeholder, className, id, ...props }: any) => (
    <input
      data-testid="input"
      value={value}
      onChange={onChange}
      disabled={disabled}
      type={type}
      placeholder={placeholder}
      className={className}
      id={id}
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, className }: any) => (
    <label data-testid="label" htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
}));

jest.mock('@/components/password-input', () => ({
  PasswordInput: ({ value, onChange, disabled, placeholder, className, id, ...props }: any) => (
    <input
      data-testid="password-input"
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      id={id}
      type="password"
      {...props}
    />
  ),
}));

// Mock useFormState hook
const mockUpdateField = jest.fn();
const mockHasError = jest.fn();
const mockGetError = jest.fn();

jest.mock('@/hooks/useFormState', () => ({
  useFormState: jest.fn(),
}));

const { useFormState } = require('@/hooks/useFormState');

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;

beforeEach(() => {
  console.error = jest.fn();
  jest.clearAllMocks();

  // Default mock implementations
  mockUseSignIn.mockReturnValue({
    isLoaded: true,
    signIn: mockSignIn,
    setActive: mockSetActive,
  });

  mockHasError.mockReturnValue(false);
  mockGetError.mockReturnValue('');
  (useFormState as jest.Mock).mockImplementation(() => ({
    formState: {
      values: {
        email: '',
        password: '',
      },
    },
    updateField: mockUpdateField,
    hasError: mockHasError,
    getError: mockGetError,
    isValid: true,
  }));
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('ConnexionForm', () => {
  describe('Rendering', () => {
    it('renders the form with all elements', () => {
      render(<ConnexionForm />);

      expect(screen.getByText('Connexion Administration')).toBeInTheDocument();
      expect(screen.getByText('Connectez vous à votre compte')).toBeInTheDocument();
      expect(screen.getByText('Email*')).toBeInTheDocument();
      expect(screen.getByText('Mot de passe*')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Connexion' })).toBeInTheDocument();
    });

    it('renders email input with correct attributes', () => {
      render(<ConnexionForm />);

      const emailInput = screen.getByPlaceholderText('Votre email');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(emailInput).toHaveAttribute('maxLength', '254');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toBeRequired();
    });

    it('renders password input with correct attributes', () => {
      render(<ConnexionForm />);

      const passwordInput = screen.getByPlaceholderText('Mot de passe');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('id', 'password');
      expect(passwordInput).toHaveAttribute('maxLength', '128');
      expect(passwordInput).toHaveAttribute('minLength', '8');
      expect(passwordInput).toHaveAttribute('autoComplete', 'password');
      expect(passwordInput).toBeRequired();
    });
  });

  describe('Input Handling', () => {
    it('calls updateField when email changes', () => {
      render(<ConnexionForm />);

      const emailInput = screen.getByPlaceholderText('Votre email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(mockUpdateField).toHaveBeenCalledWith('email', 'test@example.com');
    });

    it('calls updateField when password changes', () => {
      render(<ConnexionForm />);

      const passwordInput = screen.getByPlaceholderText('Mot de passe');
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(mockUpdateField).toHaveBeenCalledWith('password', 'password123');
    });
  });

  describe('Form Validation', () => {
    it('shows email error when hasError returns true', () => {
      mockHasError.mockImplementation((field) => field === 'email');
      mockGetError.mockImplementation((field) => field === 'email' ? 'Email invalide' : '');

      render(<ConnexionForm />);

      expect(screen.getByText('Email invalide')).toBeInTheDocument();
      expect(screen.getByText('Email invalide')).toHaveAttribute('role', 'alert');
    });

    it('shows password error when hasError returns true', () => {
      mockHasError.mockImplementation((field) => field === 'password');
      mockGetError.mockImplementation((field) => field === 'password' ? 'Mot de passe trop court' : '');

      render(<ConnexionForm />);

      expect(screen.getByText('Mot de passe trop court')).toBeInTheDocument();
      expect(screen.getByText('Mot de passe trop court')).toHaveAttribute('role', 'alert');
    });

    it('applies error styles to email input when hasError is true', () => {
      mockHasError.mockImplementation((field) => field === 'email');

      render(<ConnexionForm />);

      const emailInput = screen.getByPlaceholderText('Votre email');
      expect(emailInput.className).toContain('border-red-500');
    });

    it('applies error styles to password input when hasError is true', () => {
      mockHasError.mockImplementation((field) => field === 'password');

      render(<ConnexionForm />);

      const passwordInput = screen.getByPlaceholderText('Mot de passe');
      expect(passwordInput.className).toContain('border-red-500');
    });
  });

  describe('Form Submission', () => {
    it('prevents submission when Clerk is not loaded', async () => {
      mockUseSignIn.mockReturnValue({
        isLoaded: false,
        signIn: mockSignIn,
        setActive: mockSetActive,
      });

      render(<ConnexionForm />);

      const form = screen.getByRole('button', { name: 'Connexion' }).closest('form');
      fireEvent.submit(form!);

      expect(mockSignIn.create).not.toHaveBeenCalled();
    });

    it('prevents submission when signIn is not available', async () => {
      mockUseSignIn.mockReturnValue({
        isLoaded: true,
        signIn: null,
        setActive: mockSetActive,
      });

      render(<ConnexionForm />);

      const form = screen.getByRole('button', { name: 'Connexion' }).closest('form');
      fireEvent.submit(form!);

      expect(mockSignIn.create).not.toHaveBeenCalled();
    });

    it('submits form with correct data when valid', async () => {
      (useFormState as jest.Mock).mockImplementation(() => ({
        formState: {
          values: {
            email: 'test@example.com',
            password: 'password123',
          },
        },
        updateField: jest.fn(),
        hasError: () => false,
        getError: () => '',
        isValid: true,
      }));

      mockSignIn.create.mockResolvedValue({
        status: 'complete',
        createdSessionId: 'session_123',
      });

      render(<ConnexionForm />);

      const form = screen.getByRole('button', { name: 'Connexion' }).closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockSignIn.create).toHaveBeenCalledWith({
          identifier: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('redirects to dashboard on successful login', async () => {
      (useFormState as jest.Mock).mockImplementation(() => ({
        formState: {
          values: {
            email: 'test@example.com',
            password: 'password123',
          },
        },
        updateField: jest.fn(),
        hasError: () => false,
        getError: () => '',
        isValid: true,
      }));

      mockSignIn.create.mockResolvedValue({
        status: 'complete',
        createdSessionId: 'session_123',
      });

      render(<ConnexionForm />);

      const form = screen.getByRole('button', { name: 'Connexion' }).closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockSetActive).toHaveBeenCalledWith({ session: 'session_123' });
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows error when sign in status is incomplete', async () => {
      (useFormState as jest.Mock).mockImplementation(() => ({
        formState: {
          values: {
            email: 'test@example.com',
            password: 'password123',
          },
        },
        updateField: jest.fn(),
        hasError: () => false,
        getError: () => '',
        isValid: true,
      }));

      mockSignIn.create.mockResolvedValue({
        status: 'incomplete',
      });

      render(<ConnexionForm />);

      const form = screen.getByRole('button', { name: 'Connexion' }).closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText("Une erreur s'est produite lors de la connexion. Veuillez réessayer.")).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      (useFormState as jest.Mock).mockImplementation(() => ({
        formState: {
          values: {
            email: 'test@example.com',
            password: 'password123',
          },
        },
        updateField: jest.fn(),
        hasError: () => false,
        getError: () => '',
        isValid: true,
      }));
    });

    it('handles form_identifier_not_found error', async () => {
      mockSignIn.create.mockRejectedValue({
        errors: [{ code: 'form_identifier_not_found' }],
      });

      render(<ConnexionForm />);

      const form = screen.getByRole('button', { name: 'Connexion' }).closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('Email non trouvé. Vérifiez votre adresse email.')).toBeInTheDocument();
      });
    });

    it('handles form_password_incorrect error', async () => {
      mockSignIn.create.mockRejectedValue({
        errors: [{ code: 'form_password_incorrect' }],
      });

      render(<ConnexionForm />);

      const form = screen.getByRole('button', { name: 'Connexion' }).closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('Mot de passe incorrect.')).toBeInTheDocument();
      });
    });

    it('handles form_identifier_exists error', async () => {
      mockSignIn.create.mockRejectedValue({
        errors: [{ code: 'form_identifier_exists' }],
      });

      render(<ConnexionForm />);

      const form = screen.getByRole('button', { name: 'Connexion' }).closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('Cet email est déjà utilisé.')).toBeInTheDocument();
      });
    });

    it('handles custom error message', async () => {
      mockSignIn.create.mockRejectedValue({
        errors: [{ code: 'custom_error', message: 'Custom error message' }],
      });

      render(<ConnexionForm />);

      const form = screen.getByRole('button', { name: 'Connexion' }).closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('Custom error message')).toBeInTheDocument();
      });
    });

    it('handles unknown error', async () => {
      mockSignIn.create.mockRejectedValue(new Error('Unknown error'));

      render(<ConnexionForm />);

      const form = screen.getByRole('button', { name: 'Connexion' }).closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText("Une erreur s'est produite lors de la connexion.")).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading text during submission', async () => {
      (useFormState as jest.Mock).mockImplementation(() => ({
        formState: {
          values: {
            email: 'test@example.com',
            password: 'password123',
          },
        },
        updateField: jest.fn(),
        hasError: () => false,
        getError: () => '',
        isValid: true,
      }));

      let resolveSignIn: (value: any) => void;
      const signInPromise = new Promise((resolve) => {
        resolveSignIn = resolve;
      });
      mockSignIn.create.mockReturnValue(signInPromise);

      render(<ConnexionForm />);

      const form = screen.getByRole('button', { name: 'Connexion' }).closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Connexion en cours...' })).toBeInTheDocument();
      });

      resolveSignIn!({ status: 'complete', createdSessionId: 'session_123' });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Connexion' })).toBeInTheDocument();
      });
    });

    it('disables inputs during loading', async () => {
      (useFormState as jest.Mock).mockImplementation(() => ({
        formState: {
          values: {
            email: 'test@example.com',
            password: 'password123',
          },
        },
        updateField: jest.fn(),
        hasError: () => false,
        getError: () => '',
        isValid: true,
      }));

      let resolveSignIn: (value: any) => void;
      const signInPromise = new Promise((resolve) => {
        resolveSignIn = resolve;
      });
      mockSignIn.create.mockReturnValue(signInPromise);

      render(<ConnexionForm />);

      const form = screen.getByRole('button', { name: 'Connexion' }).closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Votre email')).toBeDisabled();
        expect(screen.getByPlaceholderText('Mot de passe')).toBeDisabled();
      });

      resolveSignIn!({ status: 'complete', createdSessionId: 'session_123' });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Votre email')).not.toBeDisabled();
        expect(screen.getByPlaceholderText('Mot de passe')).not.toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for error states', () => {
      mockHasError.mockImplementation((field) => field === 'email');
      mockGetError.mockImplementation((field) => field === 'email' ? 'Email invalide' : '');

      render(<ConnexionForm />);

      const emailInput = screen.getByPlaceholderText('Votre email');
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');

      const errorMessage = screen.getByText('Email invalide');
      expect(errorMessage).toHaveAttribute('id', 'email-error');
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });

    it('has proper form structure', () => {
      render(<ConnexionForm />);

      const form = screen.getByRole('button', { name: 'Connexion' }).closest('form');
      expect(form).toHaveAttribute('noValidate');

      const emailLabel = screen.getByText('Email*');
      expect(emailLabel).toHaveAttribute('for', 'email');

      const passwordLabel = screen.getByText('Mot de passe*');
      expect(passwordLabel).toHaveAttribute('for', 'password');
    });
  });
});
