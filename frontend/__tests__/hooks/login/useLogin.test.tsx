import { renderHook, act } from '@testing-library/react';

import { useLogin } from '@/hooks/login/useLogin';

// Mock dependencies
const mockSignIn = {
  create: jest.fn(),
};

const mockSetActive = jest.fn();

const mockRouter = {
  push: jest.fn(),
};

jest.mock('@clerk/nextjs', () => ({
  useSignIn: jest.fn(() => ({
    isLoaded: true,
    signIn: mockSignIn,
    setActive: mockSetActive,
  })),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => mockRouter),
}));

jest.mock('@/hooks/useFormState', () => ({
  useFormState: jest.fn(),
}));

describe('useLogin', () => {
  const initialValues = {
    email: '',
    password: '',
  };

  const validFormValues = {
    email: 'test@example.com',
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

  describe('hook initialization', () => {
    it('should initialize correctly', () => {
      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current).toBeDefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoaded).toBe(true);
    });

    it('should provide form state', () => {
      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current.formState).toBeDefined();
      expect(result.current.formState.values).toBeDefined();
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

      const { result } = renderHook(() => useLogin(validFormValues));

      expect(result.current.isFormValid).toBe(true);
    });

    it('should invalidate form with empty email', () => {
      const { useFormState } = require('@/hooks/useFormState');
      useFormState.mockReturnValue({
        formState: {
          values: { email: '', password: 'password123' },
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
      });

      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current.isFormValid).toBe(false);
    });

    it('should invalidate form with empty password', () => {
      const { useFormState } = require('@/hooks/useFormState');
      useFormState.mockReturnValue({
        formState: {
          values: { email: 'test@example.com', password: '' },
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn(() => false),
        getError: jest.fn(() => ''),
      });

      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current.isFormValid).toBe(false);
    });

    it('should invalidate form with email error', () => {
      const { useFormState } = require('@/hooks/useFormState');
      useFormState.mockReturnValue({
        formState: {
          values: validFormValues,
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn((field: string) => field === 'email'),
        getError: jest.fn(() => ''),
      });

      const { result } = renderHook(() => useLogin(validFormValues));

      expect(result.current.isFormValid).toBe(false);
    });

    it('should invalidate form with password error', () => {
      const { useFormState } = require('@/hooks/useFormState');
      useFormState.mockReturnValue({
        formState: {
          values: validFormValues,
          errors: {},
        },
        updateField: jest.fn(),
        hasError: jest.fn((field: string) => field === 'password'),
        getError: jest.fn(() => ''),
      });

      const { result } = renderHook(() => useLogin(validFormValues));

      expect(result.current.isFormValid).toBe(false);
    });
  });

  describe('login functionality', () => {
    it('should handle successful login', async () => {
      const mockSignInAttempt = {
        status: 'complete',
        createdSessionId: 'session_123',
      };
      mockSignIn.create.mockResolvedValue(mockSignInAttempt);
      mockSetActive.mockResolvedValue({});

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

      const { result } = renderHook(() => useLogin(validFormValues));

      await act(async () => {
        await result.current.handleLogin({
          preventDefault: jest.fn(),
        } as any);
      });

      expect(mockSignIn.create).toHaveBeenCalledWith({
        identifier: validFormValues.email,
        password: validFormValues.password,
      });

      expect(mockSetActive).toHaveBeenCalledWith({
        session: 'session_123',
      });

      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle login failure', async () => {
      const mockSignInAttempt = {
        status: 'needs_identifier',
      };
      mockSignIn.create.mockResolvedValue(mockSignInAttempt);

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

      const { result } = renderHook(() => useLogin(validFormValues));

      await act(async () => {
        await result.current.handleLogin({
          preventDefault: jest.fn(),
        } as any);
      });

      expect(result.current.error).toBe(
        "Une erreur s'est produite lors de la connexion. Veuillez réessayer."
      );
    });

    it('should handle Clerk errors during login', async () => {
      const clerkError = {
        errors: [{ code: 'form_identifier_not_found', message: 'User not found' }],
      };
      mockSignIn.create.mockRejectedValue(clerkError);

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

      const { result } = renderHook(() => useLogin(validFormValues));

      await act(async () => {
        await result.current.handleLogin({
          preventDefault: jest.fn(),
        } as any);
      });

      expect(result.current.error).toBe('Email ou mot de passe incorrect.');
    });

    it('should not proceed if form is invalid', async () => {
      const { result } = renderHook(() => useLogin(initialValues));

      await act(async () => {
        await result.current.handleLogin({
          preventDefault: jest.fn(),
        } as any);
      });

      expect(mockSignIn.create).not.toHaveBeenCalled();
    });
  });

  describe('error message mapping', () => {
    it('should map Clerk error codes to French messages', async () => {
      const testCases = [
        { code: 'form_identifier_not_found', expected: 'Email ou mot de passe incorrect.' },
        { code: 'form_password_incorrect', expected: 'Email ou mot de passe incorrect.' },
        { code: 'form_identifier_exists', expected: 'Cet email est déjà utilisé.' },
        { code: 'form_param_format_invalid', expected: "Format de l'email incorrect." },
        { code: 'unknown_error', expected: 'Original message' }, // Le code utilise le message original quand il existe
      ];

      for (const testCase of testCases) {
        const clerkError = {
          errors: [{ code: testCase.code, message: 'Original message' }],
        };
        mockSignIn.create.mockRejectedValue(clerkError);

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

        const { result } = renderHook(() => useLogin(validFormValues));

        await act(async () => {
          await result.current.handleLogin({
            preventDefault: jest.fn(),
          } as any);
        });

        expect(result.current.error).toBe(testCase.expected);

        // Reset mocks for next iteration
        jest.clearAllMocks();
      }
    });

    it('should use default message when no original message exists', async () => {
      const clerkError = {
        errors: [{ code: 'unknown_error', message: undefined }],
      };
      mockSignIn.create.mockRejectedValue(clerkError);

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

      const { result } = renderHook(() => useLogin(validFormValues));

      await act(async () => {
        await result.current.handleLogin({
          preventDefault: jest.fn(),
        } as any);
      });

      expect(result.current.error).toBe("Une erreur s'est produite lors de la connexion.");
    });
  });

  describe('handlers', () => {
    it('should provide login handler', () => {
      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current.handleLogin).toBeDefined();
      expect(typeof result.current.handleLogin).toBe('function');
    });

    it('should provide field change handler', () => {
      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current.handleFieldChange).toBeDefined();
      expect(typeof result.current.handleFieldChange).toBe('function');
    });
  });

  describe('state management', () => {
    it('should manage loading state', () => {
      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current.isLoading).toBeDefined();
      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('should manage error state', () => {
      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current.error).toBeDefined();
    });

    it('should manage loaded state', () => {
      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current.isLoaded).toBeDefined();
      expect(typeof result.current.isLoaded).toBe('boolean');
    });
  });
});
