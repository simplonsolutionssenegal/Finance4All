import { useSignIn } from '@clerk/nextjs';
import { renderHook } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { useLogin } from '@/hooks/login/useLogin';
import { useFormState } from '@/hooks/useFormState';

// Mock useFormState
jest.mock('@/hooks/useFormState', () => ({
  useFormState: jest.fn(),
}));

jest.mock('@clerk/nextjs', () => ({
  useSignIn: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseFormState = useFormState as jest.MockedFunction<typeof useFormState>;
const mockUseSignIn = useSignIn as jest.MockedFunction<typeof useSignIn>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('useLogin', () => {
  const mockFormState = {
    values: {
      email: '',
      password: '',
    },
    errors: {},
  };

  const mockFormActions = {
    updateField: jest.fn(),
    setFieldError: jest.fn(),
    setErrors: jest.fn(),
    validate: jest.fn(),
    clearErrors: jest.fn(),
    resetForm: jest.fn(),
    hasError: jest.fn((_field: string) => false),
    getError: jest.fn((_field: string) => ''),
    isValid: true,
  };

  const mockSignIn = {
    create: jest.fn(),
  };

  const mockSetActive = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFormState.mockReturnValue({
      formState: mockFormState,
      ...mockFormActions,
    });
    mockUseSignIn.mockReturnValue({
      isLoaded: true,
      signIn: mockSignIn,
      setActive: mockSetActive,
    } as any);
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);
  });

  it('should return form state and actions', () => {
    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    expect(result.current.formState).toEqual(mockFormState);
    expect(result.current.updateField).toBe(mockFormActions.updateField);
    expect(result.current.hasError).toBe(mockFormActions.hasError);
    expect(result.current.getError).toBe(mockFormActions.getError);
  });

  it('should return isFormValid as true when form is valid', () => {
    mockUseFormState.mockReturnValue({
      formState: {
        values: {
          email: 'test@example.com',
          password: 'password123',
        },
        errors: {},
      },
      ...mockFormActions,
    });

    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    expect(result.current.isFormValid).toBe(true);
  });

  it('should return isFormValid as false when email is empty', () => {
    mockUseFormState.mockReturnValue({
      formState: {
        values: {
          email: '',
          password: 'password123',
        },
        errors: {},
      },
      ...mockFormActions,
    });

    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    expect(result.current.isFormValid).toBe(false);
  });

  it('should return isFormValid as false when password is empty', () => {
    mockUseFormState.mockReturnValue({
      formState: {
        values: {
          email: 'test@example.com',
          password: '',
        },
        errors: {},
      },
      ...mockFormActions,
    });

    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    expect(result.current.isFormValid).toBe(false);
  });

  it('should return isFormValid as false when email has only whitespace', () => {
    mockUseFormState.mockReturnValue({
      formState: {
        values: {
          email: '   ',
          password: 'password123',
        },
        errors: {},
      },
      ...mockFormActions,
    });

    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    expect(result.current.isFormValid).toBe(false);
  });

  it('should return isFormValid as false when password has only whitespace', () => {
    mockUseFormState.mockReturnValue({
      formState: {
        values: {
          email: 'test@example.com',
          password: '   ',
        },
        errors: {},
      },
      ...mockFormActions,
    });

    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    expect(result.current.isFormValid).toBe(false);
  });

  it('should return isFormValid as false when email has error', () => {
    const hasErrorMock = jest.fn((field: string) => field === 'email');
    mockUseFormState.mockReturnValue({
      formState: {
        values: {
          email: 'test@example.com',
          password: 'password123',
        },
        errors: {},
      },
      ...mockFormActions,
      hasError: hasErrorMock,
    });

    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    expect(result.current.isFormValid).toBe(false);
  });

  it('should return isFormValid as false when password has error', () => {
    const hasErrorMock = jest.fn((field: string) => field === 'password');
    mockUseFormState.mockReturnValue({
      formState: {
        values: {
          email: 'test@example.com',
          password: 'password123',
        },
        errors: {},
      },
      ...mockFormActions,
      hasError: hasErrorMock,
    });

    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    expect(result.current.isFormValid).toBe(false);
  });

  it('should return isFormValid as false when both fields have errors', () => {
    const hasErrorMock = jest.fn(() => true);
    mockUseFormState.mockReturnValue({
      formState: {
        values: {
          email: 'test@example.com',
          password: 'password123',
        },
        errors: {},
      },
      ...mockFormActions,
      hasError: hasErrorMock,
    });

    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    expect(result.current.isFormValid).toBe(false);
  });

  it('should return UI state', () => {
    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoaded).toBe(true);
  });

  it('should return handlers', () => {
    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    expect(result.current.handleFieldChange).toBeDefined();
    expect(result.current.handleLogin).toBeDefined();
  });

  it('should handle successful login', async () => {
    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    mockSignIn.create.mockResolvedValue({
      status: 'complete',
      createdSessionId: 'session123',
    });

    await result.current.handleLogin({ preventDefault: jest.fn() } as any);

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
    expect(mockSetActive).toHaveBeenCalledWith({ session: 'session123' });
  });

  it('should handle login error - form_identifier_not_found', async () => {
    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    mockSignIn.create.mockRejectedValue({
      errors: [{ code: 'form_identifier_not_found', message: 'Not found' }],
    });

    await result.current.handleLogin({ preventDefault: jest.fn() } as any);

    expect(result.current.error).toBe('Email ou mot de passe incorrect.');
  });

  it('should handle login error - form_password_incorrect', async () => {
    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    mockSignIn.create.mockRejectedValue({
      errors: [{ code: 'form_password_incorrect', message: 'Wrong password' }],
    });

    await result.current.handleLogin({ preventDefault: jest.fn() } as any);

    expect(result.current.error).toBe('Email ou mot de passe incorrect.');
  });

  it('should handle login error - form_identifier_exists', async () => {
    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    mockSignIn.create.mockRejectedValue({
      errors: [{ code: 'form_identifier_exists', message: 'Already exists' }],
    });

    await result.current.handleLogin({ preventDefault: jest.fn() } as any);

    expect(result.current.error).toBe('Cet email est déjà utilisé.');
  });

  it('should handle login error - form_param_format_invalid', async () => {
    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    mockSignIn.create.mockRejectedValue({
      errors: [{ code: 'form_param_format_invalid', message: 'Invalid format' }],
    });

    await result.current.handleLogin({ preventDefault: jest.fn() } as any);

    expect(result.current.error).toBe("Format de l'email incorrect.");
  });

  it('should handle login error - generic error', async () => {
    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    mockSignIn.create.mockRejectedValue({
      errors: [{ code: 'unknown_error', message: 'Generic error' }],
    });

    await result.current.handleLogin({ preventDefault: jest.fn() } as any);

    expect(result.current.error).toBe('Generic error');
  });

  it('should handle incomplete sign in status', async () => {
    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    mockSignIn.create.mockResolvedValue({
      status: 'needs_first_factor',
    });

    await result.current.handleLogin({ preventDefault: jest.fn() } as any);

    expect(result.current.error).toBe(
      "Une erreur s'est produite lors de la connexion. Veuillez réessayer."
    );
  });

  it('should not call signIn.create when not loaded', async () => {
    mockUseSignIn.mockReturnValue({
      isLoaded: false,
      signIn: null,
      setActive: mockSetActive,
    } as any);

    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    await result.current.handleLogin({ preventDefault: jest.fn() } as any);

    expect(mockSignIn.create).not.toHaveBeenCalled();
  });

  it('should handle field change with error cleared', async () => {
    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    // First set an error
    mockSignIn.create.mockRejectedValue({
      errors: [{ code: 'unknown_error', message: 'Error' }],
    });

    await result.current.handleLogin({ preventDefault: jest.fn() } as any);
    expect(result.current.error).not.toBeNull();

    // Then change a field
    await result.current.handleFieldChange('email')({
      target: { value: 'new@example.com' },
    } as any);

    expect(result.current.error).toBeNull();
    expect(mockFormActions.updateField).toHaveBeenCalledWith('email', 'new@example.com');
  });

  it('should handle field change without error', async () => {
    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    await result.current.handleFieldChange('email')({
      target: { value: 'test@example.com' },
    } as any);

    expect(mockFormActions.updateField).toHaveBeenCalledWith('email', 'test@example.com');
  });

  it('should handle error without message', async () => {
    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    mockSignIn.create.mockRejectedValue({
      errors: [{ code: 'unknown_error' }],
    });

    await result.current.handleLogin({ preventDefault: jest.fn() } as any);

    expect(result.current.error).toBe("Une erreur s'est produite lors de la connexion.");
  });

  it('should handle error without clerkError structure', async () => {
    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    mockSignIn.create.mockRejectedValue({ message: 'Network error' });

    await result.current.handleLogin({ preventDefault: jest.fn() } as any);

    expect(result.current.error).toBe("Une erreur s'est produite lors de la connexion.");
  });

  it('should not call signIn.create when form is invalid', async () => {
    mockUseFormState.mockReturnValue({
      formState: {
        values: {
          email: '',
          password: '',
        },
        errors: {},
      },
      ...mockFormActions,
      hasError: jest.fn(() => true),
    });

    const { result } = renderHook(() => useLogin({ email: '', password: '' }));

    await result.current.handleLogin({ preventDefault: jest.fn() } as any);

    expect(mockSignIn.create).not.toHaveBeenCalled();
  });
});
