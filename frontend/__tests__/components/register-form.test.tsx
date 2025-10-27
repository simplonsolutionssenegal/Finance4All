import { render, screen } from '@testing-library/react';

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

jest.mock('@/hooks/register/useRegister', () => ({
  useRegister: jest.fn(() => ({
    formState: { values: {} },
    isLoading: false,
    error: null,
    isOtpVerification: false,
    verificationError: null,
    isVerifying: false,
    isLoaded: true,
    isFormValid: false,
    hasError: jest.fn(() => false),
    getError: jest.fn(() => ''),
    handleFieldChange: jest.fn(() => jest.fn()),
    handleRegistration: jest.fn(),
    handleVerification: jest.fn(),
    handleResendCode: jest.fn(),
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

      expect(screen.getByLabelText('Prénom')).toBeInTheDocument();
      expect(screen.getByLabelText('Nom de famille')).toBeInTheDocument();
      expect(screen.getByLabelText('Téléphone')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<RegisterForm />);

      expect(screen.getByRole('button', { name: 'Créer mon compte' })).toBeInTheDocument();
    });
  });

  describe('step navigation', () => {
    it('should show verification step when isOtpVerification is true', () => {
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
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
        handleFieldChange: jest.fn(() => jest.fn()),
        handleRegistration: jest.fn(),
        handleVerification: jest.fn(),
        handleResendCode: jest.fn(),
      }));

      render(<RegisterForm />);

      expect(screen.getByText("Vérification de l'email")).toBeInTheDocument();
    });

    it('should show registration form when isOtpVerification is false', () => {
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
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
        handleFieldChange: jest.fn(() => jest.fn()),
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
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
        handleFieldChange: jest.fn(() => jest.fn()),
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
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
        handleFieldChange: jest.fn(() => jest.fn()),
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
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
        handleFieldChange: jest.fn(() => jest.fn()),
        handleRegistration: jest.fn(),
        handleVerification: jest.fn(),
        handleResendCode: jest.fn(),
      }));

      render(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: 'Création en cours...' });
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
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
        handleFieldChange: jest.fn(() => jest.fn()),
        handleRegistration: jest.fn(),
        handleVerification: jest.fn(),
        handleResendCode: jest.fn(),
      }));

      render(<RegisterForm />);

      const verifyButton = screen.getByRole('button', { name: 'Vérification...' });
      expect(verifyButton).toBeDisabled();
    });
  });
});
