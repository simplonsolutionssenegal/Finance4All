import { renderHook } from '@testing-library/react';

import { useRegister } from '@/hooks/register/useRegister';

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

describe('useRegister', () => {
  const initialValues = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
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
      const values = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+221771234567',
        email: 'john@example.com',
        password: 'password123',
      };

      const { result } = renderHook(() => useRegister(values));

      expect(result.current.formState.values).toEqual(values);
    });
  });

  describe('form validation', () => {
    it('should validate form correctly', () => {
      const values = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+221771234567',
        email: 'john@example.com',
        password: 'password123',
      };

      const { result } = renderHook(() => useRegister(values));

      expect(result.current.isFormValid).toBe(true);
    });

    it('should invalidate form with empty fields', () => {
      const { result } = renderHook(() => useRegister(initialValues));

      expect(result.current.isFormValid).toBe(false);
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

  describe('state management', () => {
    it('should manage loading state', () => {
      const { result } = renderHook(() => useRegister(initialValues));

      expect(result.current.isLoading).toBeDefined();
      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('should manage OTP verification state', () => {
      const { result } = renderHook(() => useRegister(initialValues));

      expect(result.current.isOtpVerification).toBeDefined();
      expect(typeof result.current.isOtpVerification).toBe('boolean');
    });

    it('should manage verification state', () => {
      const { result } = renderHook(() => useRegister(initialValues));

      expect(result.current.isVerifying).toBeDefined();
      expect(typeof result.current.isVerifying).toBe('boolean');
    });
  });

  describe('error handling', () => {
    it('should manage error state', () => {
      const { result } = renderHook(() => useRegister(initialValues));

      expect(result.current.error).toBeDefined();
    });

    it('should manage verification error state', () => {
      const { result } = renderHook(() => useRegister(initialValues));

      expect(result.current.verificationError).toBeDefined();
    });
  });
});
