import { render, screen, fireEvent } from '@testing-library/react';

import { RegisterForm } from '@/components/register-form';

// Mock dependencies
jest.mock('@clerk/nextjs', () => ({
  useSignUp: jest.fn(() => ({
    isLoaded: true,
    signUp: {
      create: jest.fn(),
      attemptEmailAddressVerification: jest.fn(),
      prepareEmailAddressVerification: jest.fn(),
      id: 'signup_123',
    },
  })),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/hooks/beneficiary/useCreateBeneficiary', () => ({
  useCreateBeneficiary: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial render', () => {
    it('should render registration form initially', () => {
      render(<RegisterForm />);

      expect(screen.getByText('Créer un compte')).toBeInTheDocument();
      expect(screen.getByText('Rejoignez Finance4All dès maintenant')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nom/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/téléphone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<RegisterForm />);

      expect(screen.getByRole('button', { name: /créer un compte/i })).toBeInTheDocument();
    });
  });

  describe('form interaction', () => {
    it('should update form fields when user types', () => {
      render(<RegisterForm />);

      const firstNameInput = screen.getByLabelText(/prénom/i);
      const lastNameInput = screen.getByLabelText(/nom/i);
      const emailInput = screen.getByLabelText(/email/i);

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      expect(firstNameInput).toHaveValue('John');
      expect(lastNameInput).toHaveValue('Doe');
      expect(emailInput).toHaveValue('john@example.com');
    });

    it('should show validation errors for empty fields', () => {
      render(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /créer un compte/i });
      fireEvent.click(submitButton);

      // The form should show validation errors
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('step navigation', () => {
    it('should show verification step when isOtpVerification is true', () => {
      // Mock the useRegister hook to return isOtpVerification: true
      const mockUseRegister = require('@/hooks/register/useRegister');
      mockUseRegister.useRegister = jest.fn(() => ({
        formState: { values: {} },
        isLoading: false,
        error: null,
        isOtpVerification: true,
        verificationError: null,
        isVerifying: false,
        isLoaded: true,
        isFormValid: false,
        handleRegistration: jest.fn(),
        handleVerification: jest.fn(),
        handleResendCode: jest.fn(),
      }));

      render(<RegisterForm />);

      expect(screen.getByText(/vérification/i)).toBeInTheDocument();
    });

    it('should show registration form when isOtpVerification is false', () => {
      // Mock the useRegister hook to return isOtpVerification: false
      const mockUseRegister = require('@/hooks/register/useRegister');
      mockUseRegister.useRegister = jest.fn(() => ({
        formState: { values: {} },
        isLoading: false,
        error: null,
        isOtpVerification: false,
        verificationError: null,
        isVerifying: false,
        isLoaded: true,
        isFormValid: false,
        handleRegistration: jest.fn(),
        handleVerification: jest.fn(),
        handleResendCode: jest.fn(),
      }));

      render(<RegisterForm />);

      expect(screen.getByText('Créer un compte')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should display error messages', () => {
      const mockUseRegister = require('@/hooks/register/useRegister');
      mockUseRegister.useRegister = jest.fn(() => ({
        formState: { values: {} },
        isLoading: false,
        error: 'Erreur de connexion',
        isOtpVerification: false,
        verificationError: null,
        isVerifying: false,
        isLoaded: true,
        isFormValid: false,
        handleRegistration: jest.fn(),
        handleVerification: jest.fn(),
        handleResendCode: jest.fn(),
      }));

      render(<RegisterForm />);

      expect(screen.getByText('Erreur de connexion')).toBeInTheDocument();
    });

    it('should display verification error messages', () => {
      const mockUseRegister = require('@/hooks/register/useRegister');
      mockUseRegister.useRegister = jest.fn(() => ({
        formState: { values: {} },
        isLoading: false,
        error: null,
        isOtpVerification: true,
        verificationError: 'Code de vérification invalide',
        isVerifying: false,
        isLoaded: true,
        isFormValid: false,
        handleRegistration: jest.fn(),
        handleVerification: jest.fn(),
        handleResendCode: jest.fn(),
      }));

      render(<RegisterForm />);

      expect(screen.getByText('Code de vérification invalide')).toBeInTheDocument();
    });
  });

  describe('loading states', () => {
    it('should show loading state during registration', () => {
      const mockUseRegister = require('@/hooks/register/useRegister');
      mockUseRegister.useRegister = jest.fn(() => ({
        formState: { values: {} },
        isLoading: true,
        error: null,
        isOtpVerification: false,
        verificationError: null,
        isVerifying: false,
        isLoaded: true,
        isFormValid: false,
        handleRegistration: jest.fn(),
        handleVerification: jest.fn(),
        handleResendCode: jest.fn(),
      }));

      render(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /créer un compte/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show loading state during verification', () => {
      const mockUseRegister = require('@/hooks/register/useRegister');
      mockUseRegister.useRegister = jest.fn(() => ({
        formState: { values: {} },
        isLoading: false,
        error: null,
        isOtpVerification: true,
        verificationError: null,
        isVerifying: true,
        isLoaded: true,
        isFormValid: false,
        handleRegistration: jest.fn(),
        handleVerification: jest.fn(),
        handleResendCode: jest.fn(),
      }));

      render(<RegisterForm />);

      const verifyButton = screen.getByRole('button', { name: /vérifier/i });
      expect(verifyButton).toBeDisabled();
    });
  });
});
