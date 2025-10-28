import { renderHook, act } from '@testing-library/react';

import { useRegister } from '@/hooks/register/useRegister';

// Mock dependencies
const mockSignUp = {
  create: jest.fn(),
  attemptEmailAddressVerification: jest.fn(),
  prepareEmailAddressVerification: jest.fn(),
  id: 'signup_123',
};

const mockRouter = {
  push: jest.fn(),
};

const mockCreateBeneficiary = {
  mutateAsync: jest.fn(),
};

jest.mock('@clerk/nextjs', () => ({
  useSignUp: jest.fn(() => ({
    isLoaded: true,
    signUp: mockSignUp,
  })),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => mockRouter),
}));

jest.mock('@/hooks/beneficiary/useCreateBeneficiary', () => ({
  useCreateBeneficiary: jest.fn(() => mockCreateBeneficiary),
}));

jest.mock('@/hooks/useFormState', () => ({
  useFormState: jest.fn(),
}));

describe('useRegister', () => {
  const initialValues = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
  };

  const validFormValues = {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+221771234567',
    email: 'john@example.com',
    password: 'password123',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock for useFormState
    const { useFormState } = require('@/hooks/useFormState');
    useFormState.mockReturnValue({
      formState: {
        values: initialValues,
        errors: {},
      },
      updateField: jest.fn(),
      hasError: jest.fn(() => false),
      getError: jest.fn(() => ''),
    });
  });

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useRegister(initialValues));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isOtpVerification).toBe(false);
      expect(result.current.verificationError).toBeNull();
      expect(result.current.isVerifying).toBe(false);
      expect(result.current.isLoaded).toBe(true);
    });

    it('should initialize form state with provided values', () => {
      const { useFormState } = require('@/hooks/useFormState');
      useFormState.mockReturnValue({
        formState: {
          values: validFormValues,
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
      });

      const { result } = renderHook(() => useRegister(validFormValues));

      expect(result.current.formState.values).toEqual(validFormValues);
    });
  });

  describe('form validation', () => {
    it('should validate form correctly with valid values', () => {
      const { useFormState } = require('@/hooks/useFormState');
      useFormState.mockReturnValue({
        formState: {
          values: validFormValues,
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
      });

      const { result } = renderHook(() => useRegister(validFormValues));

      expect(result.current.isFormValid).toBe(true);
    });

    it('should invalidate form with empty fields', () => {
      const { result } = renderHook(() => useRegister(initialValues));

      expect(result.current.isFormValid).toBe(false);
    });
  });

  describe('registration flow', () => {
    it('should handle successful registration without verification', async () => {
      const mockSignUpAttempt = {
        status: 'complete',
        createdUserId: 'user_123',
      };
      mockSignUp.create.mockResolvedValue(mockSignUpAttempt);
      mockCreateBeneficiary.mutateAsync.mockResolvedValue({});

      const { useFormState } = require('@/hooks/useFormState');
      useFormState.mockReturnValue({
        formState: {
          values: validFormValues,
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
      });

      const { result } = renderHook(() => useRegister(validFormValues));

      await act(async () => {
        await result.current.handleRegistration({
          preventDefault: jest.fn(),
        } as any);
      });

      expect(mockSignUp.create).toHaveBeenCalledWith({
        emailAddress: validFormValues.email,
        password: validFormValues.password,
        firstName: validFormValues.firstName,
        lastName: validFormValues.lastName,
      });

      expect(mockCreateBeneficiary.mutateAsync).toHaveBeenCalledWith({
        clerkUserId: 'user_123',
        name: `${validFormValues.firstName} ${validFormValues.lastName}`,
        email: validFormValues.email,
        phoneNumber: validFormValues.phone,
      });

      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });

    it('should handle registration requiring email verification', async () => {
      const mockSignUpAttempt = {
        status: 'missing_requirements',
        prepareEmailAddressVerification: jest.fn().mockResolvedValue({}),
      };
      mockSignUp.create.mockResolvedValue(mockSignUpAttempt);

      const { useFormState } = require('@/hooks/useFormState');
      useFormState.mockReturnValue({
        formState: {
          values: validFormValues,
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
      });

      const { result } = renderHook(() => useRegister(validFormValues));

      await act(async () => {
        await result.current.handleRegistration({
          preventDefault: jest.fn(),
        } as any);
      });

      expect(mockSignUpAttempt.prepareEmailAddressVerification).toHaveBeenCalledWith({
        strategy: 'email_code',
      });

      expect(result.current.isOtpVerification).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should handle Clerk errors during registration', async () => {
      const clerkError = {
        errors: [{ code: 'form_email_address_exists', message: 'Email already exists' }],
      };
      mockSignUp.create.mockRejectedValue(clerkError);

      const { useFormState } = require('@/hooks/useFormState');
      useFormState.mockReturnValue({
        formState: {
          values: validFormValues,
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
      });

      const { result } = renderHook(() => useRegister(validFormValues));

      await act(async () => {
        await result.current.handleRegistration({
          preventDefault: jest.fn(),
        } as any);
      });

      expect(result.current.error).toBe('Cette adresse email est déjà utilisée.');
    });

    it('should not proceed if form is invalid', async () => {
      const { result } = renderHook(() => useRegister(initialValues));

      await act(async () => {
        await result.current.handleRegistration({
          preventDefault: jest.fn(),
        } as any);
      });

      expect(mockSignUp.create).not.toHaveBeenCalled();
    });
  });

  describe('verification flow', () => {
    it('should handle successful verification', async () => {
      const mockVerificationResult = {
        status: 'complete',
        createdUserId: 'user_123',
      };
      mockSignUp.attemptEmailAddressVerification.mockResolvedValue(mockVerificationResult);
      mockCreateBeneficiary.mutateAsync.mockResolvedValue({});

      const { useFormState } = require('@/hooks/useFormState');
      useFormState.mockReturnValue({
        formState: {
          values: validFormValues,
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
      });

      const { result } = renderHook(() => useRegister(validFormValues));

      await act(async () => {
        await result.current.handleVerification('123456');
      });

      expect(mockSignUp.attemptEmailAddressVerification).toHaveBeenCalledWith({
        code: '123456',
      });

      expect(mockCreateBeneficiary.mutateAsync).toHaveBeenCalledWith({
        clerkUserId: 'user_123',
        name: `${validFormValues.firstName} ${validFormValues.lastName}`,
        email: validFormValues.email,
        phoneNumber: validFormValues.phone,
      });

      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });

    it('should handle verification errors', async () => {
      const verificationError = new Error('Invalid code');
      mockSignUp.attemptEmailAddressVerification.mockRejectedValue(verificationError);

      const { useFormState } = require('@/hooks/useFormState');
      useFormState.mockReturnValue({
        formState: {
          values: validFormValues,
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
      });

      const { result } = renderHook(() => useRegister(validFormValues));

      await act(async () => {
        await result.current.handleVerification('123456');
      });

      expect(result.current.verificationError).toBe(
        'Erreur lors de la vérification: Invalid code. Veuillez réessayer.'
      );
    });
  });

  describe('resend code', () => {
    it('should handle successful resend', async () => {
      mockSignUp.prepareEmailAddressVerification.mockResolvedValue({});

      const { result } = renderHook(() => useRegister(validFormValues));

      await act(async () => {
        await result.current.handleResendCode();
      });

      expect(mockSignUp.prepareEmailAddressVerification).toHaveBeenCalledWith({
        strategy: 'email_code',
      });
    });

    it('should handle resend errors', async () => {
      const resendError = new Error('Resend failed');
      mockSignUp.prepareEmailAddressVerification.mockRejectedValue(resendError);

      const { result } = renderHook(() => useRegister(validFormValues));

      await act(async () => {
        await result.current.handleResendCode();
      });

      expect(result.current.verificationError).toBe(
        "Erreur lors de l'envoi du nouveau code: Resend failed. Veuillez réessayer."
      );
    });
  });

  describe('handlers', () => {
    it('should provide registration handler', () => {
      const { result } = renderHook(() => useRegister(initialValues));

      expect(result.current.handleRegistration).toBeDefined();
      expect(typeof result.current.handleRegistration).toBe('function');
    });

    it('should provide verification handler', () => {
      const { result } = renderHook(() => useRegister(initialValues));

      expect(result.current.handleVerification).toBeDefined();
      expect(typeof result.current.handleVerification).toBe('function');
    });

    it('should provide resend code handler', () => {
      const { result } = renderHook(() => useRegister(initialValues));

      expect(result.current.handleResendCode).toBeDefined();
      expect(typeof result.current.handleResendCode).toBe('function');
    });
  });
});
