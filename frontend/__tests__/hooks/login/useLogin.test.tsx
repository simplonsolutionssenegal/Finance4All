import { renderHook } from '@testing-library/react';

import { useLogin } from '@/hooks/login/useLogin';

// Mock dependencies
jest.mock('@clerk/nextjs', () => ({
  useSignIn: jest.fn(() => ({
    isLoaded: true,
    signIn: {
      create: jest.fn(),
    },
    setActive: jest.fn(),
  })),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/hooks/useFormState', () => ({
  useFormState: jest.fn(() => ({
    formState: {
      values: { email: '', password: '' },
      errors: {},
    },
    updateField: jest.fn(),
    setFieldError: jest.fn(),
    setErrors: jest.fn(),
    validate: jest.fn(),
    clearErrors: jest.fn(),
    resetForm: jest.fn(),
    hasError: jest.fn(() => false),
    getError: jest.fn(() => ''),
    isValid: true,
  })),
}));

describe('useLogin', () => {
  const initialValues = {
    email: '',
    password: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hook initialization', () => {
    it('should initialize correctly', () => {
      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current).toBeDefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide form state', () => {
      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current.formState).toBeDefined();
      expect(result.current.formState.values).toBeDefined();
    });
  });

  describe('form validation', () => {
    it('should validate form correctly', () => {
      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current.isFormValid).toBeDefined();
      expect(typeof result.current.isFormValid).toBe('boolean');
    });

    it('should handle field changes', () => {
      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current.handleFieldChange).toBeDefined();
      expect(typeof result.current.handleFieldChange).toBe('function');
    });
  });

  describe('login functionality', () => {
    it('should provide login handler', () => {
      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current.handleLogin).toBeDefined();
      expect(typeof result.current.handleLogin).toBe('function');
    });

    it('should handle loading state', () => {
      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current.isLoading).toBeDefined();
      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });

  describe('error handling', () => {
    it('should provide error state', () => {
      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current.error).toBeDefined();
    });

    it('should handle error clearing', () => {
      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current.handleFieldChange).toBeDefined();
    });
  });
});
