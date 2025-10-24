import { render, screen, fireEvent } from '@testing-library/react';

import { LoginForm } from '@/components/login-form';

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
      data-testid='button'
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
      data-testid='input'
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
    <label data-testid='label' htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
}));

jest.mock('@/components/password-input', () => ({
  PasswordInput: ({ value, onChange, disabled, placeholder, className, id, ...props }: any) => (
    <input
      data-testid='password-input'
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      id={id}
      type='password'
      {...props}
    />
  ),
}));

// Mock useLogin hook
jest.mock('@/hooks/login/useLogin', () => ({
  useLogin: jest.fn(),
}));

const { useLogin } = require('@/hooks/login/useLogin');

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

  (useLogin as jest.Mock).mockReturnValue({
    formState: {
      values: {
        email: '',
        password: '',
      },
      errors: {},
    },
    updateField: jest.fn(),
    hasError: jest.fn(() => false),
    getError: jest.fn(() => ''),
    isFormValid: true,
    isLoading: false,
    error: null,
    isLoaded: true,
    handleFieldChange: jest.fn(),
    handleLogin: jest.fn(),
  });
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('LoginForm', () => {
  describe('Rendering', () => {
    it('renders the form with all elements', () => {
      render(<LoginForm />);

      expect(screen.getByText('Bienvenue !')).toBeInTheDocument();
      expect(screen.getByText('Connectez-vous pour continuer')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Mot de passe')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument();
    });

    it('renders email input with correct attributes', () => {
      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText('Votre email');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(emailInput).toHaveAttribute('maxLength', '254');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toBeRequired();
    });

    it('renders password input with correct attributes', () => {
      render(<LoginForm />);

      const passwordInput = screen.getByPlaceholderText('••••••••');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('id', 'password');
      expect(passwordInput).toHaveAttribute('maxLength', '128');
      expect(passwordInput).toHaveAttribute('minLength', '8');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
      expect(passwordInput).toBeRequired();
    });

    it('renders phone icon in email input', () => {
      render(<LoginForm />);
      // The icon should be present in the email input container
      const emailContainer = screen.getByPlaceholderText('Votre email').closest('div');
      expect(emailContainer).toHaveClass('relative');
    });

    it('renders forgot password link', () => {
      render(<LoginForm />);
      expect(screen.getByText('Mot de passe oublié ?')).toBeInTheDocument();
    });

    it('renders create account link', () => {
      render(<LoginForm />);
      expect(screen.getByText('Pas encore de compte ?')).toBeInTheDocument();
      expect(screen.getByText('Créer un compte')).toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('calls handleFieldChange when email changes', () => {
      const mockHandleFieldChange = jest.fn();
      (useLogin as jest.Mock).mockReturnValue({
        formState: {
          values: { email: '', password: '' },
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
        isFormValid: true,
        isLoading: false,
        error: null,
        isLoaded: true,
        handleFieldChange: mockHandleFieldChange,
        handleLogin: jest.fn(),
      });

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText('Votre email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(mockHandleFieldChange).toHaveBeenCalledWith('email');
    });

    it('calls handleFieldChange when password changes', () => {
      const mockHandleFieldChange = jest.fn();
      (useLogin as jest.Mock).mockReturnValue({
        formState: {
          values: { email: '', password: '' },
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
        isFormValid: true,
        isLoading: false,
        error: null,
        isLoaded: true,
        handleFieldChange: mockHandleFieldChange,
        handleLogin: jest.fn(),
      });

      render(<LoginForm />);

      const passwordInput = screen.getByPlaceholderText('••••••••');
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(mockHandleFieldChange).toHaveBeenCalledWith('password');
    });
  });

  describe('Form Validation', () => {
    it('shows email error when hasError returns true', () => {
      (useLogin as jest.Mock).mockReturnValue({
        formState: {
          values: { email: '', password: '' },
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn((field: string) => field === 'email'),
        getError: jest.fn((field: string) => (field === 'email' ? 'Email invalide' : '')),
        isFormValid: true,
        isLoading: false,
        error: null,
        isLoaded: true,
        handleFieldChange: jest.fn(),
        handleLogin: jest.fn(),
      });

      render(<LoginForm />);

      expect(screen.getByText('Email invalide')).toBeInTheDocument();
      expect(screen.getByText('Email invalide')).toHaveAttribute('role', 'alert');
    });

    it('shows password error when hasError returns true', () => {
      (useLogin as jest.Mock).mockReturnValue({
        formState: {
          values: { email: '', password: '' },
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn((field: string) => field === 'password'),
        getError: jest.fn((field: string) =>
          field === 'password' ? 'Mot de passe trop court' : ''
        ),
        isFormValid: true,
        isLoading: false,
        error: null,
        isLoaded: true,
        handleFieldChange: jest.fn(),
        handleLogin: jest.fn(),
      });

      render(<LoginForm />);

      expect(screen.getByText('Mot de passe trop court')).toBeInTheDocument();
      expect(screen.getByText('Mot de passe trop court')).toHaveAttribute('role', 'alert');
    });

    it('applies error styles to email input when hasError is true', () => {
      (useLogin as jest.Mock).mockReturnValue({
        formState: {
          values: { email: '', password: '' },
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn((field: string) => field === 'email'),
        getError: jest.fn(() => ''),
        isFormValid: true,
        isLoading: false,
        error: null,
        isLoaded: true,
        handleFieldChange: jest.fn(),
        handleLogin: jest.fn(),
      });

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText('Votre email');
      expect(emailInput.className).toContain('border-red-500');
    });

    it('applies error styles to password input when hasError is true', () => {
      (useLogin as jest.Mock).mockReturnValue({
        formState: {
          values: { email: '', password: '' },
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn((field: string) => field === 'password'),
        getError: jest.fn(() => ''),
        isFormValid: true,
        isLoading: false,
        error: null,
        isLoaded: true,
        handleFieldChange: jest.fn(),
        handleLogin: jest.fn(),
      });

      render(<LoginForm />);

      const passwordInput = screen.getByPlaceholderText('••••••••');
      expect(passwordInput.className).toContain('border-red-500');
    });
  });

  describe('Form Submission', () => {
    it('calls handleLogin when form is submitted', () => {
      const mockHandleLogin = jest.fn();
      (useLogin as jest.Mock).mockReturnValue({
        formState: {
          values: { email: 'test@example.com', password: 'password123' },
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
        isFormValid: true,
        isLoading: false,
        error: null,
        isLoaded: true,
        handleFieldChange: jest.fn(),
        handleLogin: mockHandleLogin,
      });

      render(<LoginForm />);

      const form = screen.getByRole('button', { name: 'Se connecter' }).closest('form');
      if (form) fireEvent.submit(form);

      expect(mockHandleLogin).toHaveBeenCalled();
    });

    it('shows loading state during submission', () => {
      (useLogin as jest.Mock).mockReturnValue({
        formState: {
          values: { email: '', password: '' },
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
        isFormValid: true,
        isLoading: true,
        error: null,
        isLoaded: true,
        handleFieldChange: jest.fn(),
        handleLogin: jest.fn(),
      });

      render(<LoginForm />);

      expect(screen.getByRole('button', { name: 'Connexion en cours...' })).toBeInTheDocument();
    });

    it('disables inputs during loading', () => {
      (useLogin as jest.Mock).mockReturnValue({
        formState: {
          values: { email: '', password: '' },
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
        isFormValid: true,
        isLoading: true,
        error: null,
        isLoaded: true,
        handleFieldChange: jest.fn(),
        handleLogin: jest.fn(),
      });

      render(<LoginForm />);

      expect(screen.getByPlaceholderText('Votre email')).toBeDisabled();
      expect(screen.getByPlaceholderText('••••••••')).toBeDisabled();
    });

    it('shows error message when error is present', () => {
      (useLogin as jest.Mock).mockReturnValue({
        formState: {
          values: { email: '', password: '' },
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
        isFormValid: true,
        isLoading: false,
        error: 'Email ou mot de passe incorrect.',
        isLoaded: true,
        handleFieldChange: jest.fn(),
        handleLogin: jest.fn(),
      });

      render(<LoginForm />);

      expect(screen.getByText('Email ou mot de passe incorrect.')).toBeInTheDocument();
    });

    it('disables button when form is invalid', () => {
      (useLogin as jest.Mock).mockReturnValue({
        formState: {
          values: { email: '', password: '' },
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
        isFormValid: false,
        isLoading: false,
        error: null,
        isLoaded: true,
        handleFieldChange: jest.fn(),
        handleLogin: jest.fn(),
      });

      render(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: 'Se connecter' });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for error states', () => {
      (useLogin as jest.Mock).mockReturnValue({
        formState: {
          values: { email: '', password: '' },
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn((field: string) => field === 'email'),
        getError: jest.fn((field: string) => (field === 'email' ? 'Email invalide' : '')),
        isFormValid: true,
        isLoading: false,
        error: null,
        isLoaded: true,
        handleFieldChange: jest.fn(),
        handleLogin: jest.fn(),
      });

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText('Votre email');
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');

      const errorMessage = screen.getByText('Email invalide');
      expect(errorMessage).toHaveAttribute('id', 'email-error');
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });

    it('has proper form structure', () => {
      render(<LoginForm />);

      const form = screen.getByRole('button', { name: 'Se connecter' }).closest('form');
      expect(form).toHaveAttribute('noValidate');

      const emailLabel = screen.getByText('Email');
      expect(emailLabel).toHaveAttribute('for', 'email');

      const passwordLabel = screen.getByText('Mot de passe');
      expect(passwordLabel).toHaveAttribute('for', 'password');
    });
  });
});
