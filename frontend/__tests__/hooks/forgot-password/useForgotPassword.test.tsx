import { renderHook, act } from '@testing-library/react';

import { useForgotPassword } from '@/hooks/forgot-password/useForgotPassword';
import { useFormState } from '@/hooks/useFormState';
import { validateEmail, validatePassword, validateOTPCode } from '@/lib/validation';

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useClerk: jest.fn(),
  useSignIn: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock validation functions
jest.mock('@/lib/validation', () => ({
  validateEmail: jest.fn(),
  validatePassword: jest.fn(),
  validateOTPCode: jest.fn(),
}));

// Mock useFormState
jest.mock('@/hooks/useFormState', () => ({
  useFormState: jest.fn(),
}));

const mockUseClerk = require('@clerk/nextjs').useClerk;
const mockUseSignIn = require('@clerk/nextjs').useSignIn;
const mockUseRouter = require('next/navigation').useRouter;
const mockUseFormState = useFormState as jest.MockedFunction<typeof useFormState>;
const mockValidateEmail = validateEmail as jest.MockedFunction<typeof validateEmail>;
const mockValidatePassword = validatePassword as jest.MockedFunction<typeof validatePassword>;
const mockValidateOTPCode = validateOTPCode as jest.MockedFunction<typeof validateOTPCode>;

describe('useForgotPassword hook', () => {
  const mockPush = jest.fn();
  const mockSignIn = {
    create: jest.fn(),
    attemptFirstFactor: jest.fn(),
  };

  const mockFormState = {
    values: {
      email: '',
      password: '',
      code: '',
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUseClerk.mockReturnValue({ session: null });
    mockUseSignIn.mockReturnValue({ signIn: mockSignIn });
    mockUseFormState.mockReturnValue({
      formState: mockFormState,
      ...mockFormActions,
    });
    mockValidateEmail.mockReturnValue('');
    mockValidatePassword.mockReturnValue('');
    mockValidateOTPCode.mockReturnValue('');
  });

  it('should be a function', () => {
    expect(typeof useForgotPassword).toBe('function');
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useForgotPassword({ email: '', password: '', code: '' }));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
    expect(result.current.successMessage).toBe(null);
    expect(result.current.step).toBe(1);
    expect(typeof result.current.handleSendResetLink).toBe('function');
    expect(typeof result.current.handleResetPassword).toBe('function');
    expect(typeof result.current.handleResetForm).toBe('function');
  });

  it('should handle successful password reset link sending', async () => {
    mockSignIn.create.mockResolvedValue({});
    mockUseFormState.mockReturnValue({
      formState: {
        values: { email: 'test@example.com', password: '', code: '' },
        errors: {},
      },
      ...mockFormActions,
    });

    const { result } = renderHook(() => useForgotPassword({ email: '', password: '', code: '' }));

    await act(async () => {
      const event = { preventDefault: jest.fn() } as any;
      await result.current.handleSendResetLink(event);
    });

    expect(result.current.success).toBe(true);
    expect(result.current.successMessage).toBe(
      'Un lien de réinitialisation a été envoyé à votre email.'
    );
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(mockSignIn.create).toHaveBeenCalledWith({
      strategy: 'reset_password_email_code',
      identifier: 'test@example.com',
    });
  });

  it('should handle account not found error', async () => {
    const error = new Error("Couldn't find your account");
    mockSignIn.create.mockRejectedValue(error);
    mockUseFormState.mockReturnValue({
      formState: {
        values: { email: 'test@example.com', password: '', code: '' },
        errors: {},
      },
      ...mockFormActions,
    });

    const { result } = renderHook(() => useForgotPassword({ email: '', password: '', code: '' }));

    await act(async () => {
      const event = { preventDefault: jest.fn() } as any;
      await result.current.handleSendResetLink(event);
    });

    expect(result.current.error).toBe("Aucun compte n'est associé à cette adresse email");
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle already signed in error', async () => {
    const error = new Error("You're already signed in");
    mockSignIn.create.mockRejectedValue(error);
    mockUseFormState.mockReturnValue({
      formState: {
        values: { email: 'test@example.com', password: '', code: '' },
        errors: {},
      },
      ...mockFormActions,
    });

    const { result } = renderHook(() => useForgotPassword({ email: '', password: '', code: '' }));

    await act(async () => {
      const event = { preventDefault: jest.fn() } as any;
      await result.current.handleSendResetLink(event);
    });

    expect(result.current.error).toBe(
      'Vous êtes déjà connecté. Veuillez utiliser la page de changement de mot de passe dans votre profil.'
    );
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle successful password reset', async () => {
    mockSignIn.attemptFirstFactor.mockResolvedValue({ status: 'complete' });
    mockUseFormState.mockReturnValue({
      formState: {
        values: { email: '', password: 'newPassword123', code: '123456' },
        errors: {},
      },
      ...mockFormActions,
    });

    const { result } = renderHook(() => useForgotPassword({ email: '', password: '', code: '' }));

    await act(async () => {
      const event = { preventDefault: jest.fn() } as any;
      await result.current.handleResetPassword(event);
    });

    expect(result.current.success).toBe(true);
    expect(result.current.successMessage).toBe('Mot de passe réinitialisé avec succès');
    expect(mockPush).toHaveBeenCalledWith('/');
    expect(mockSignIn.attemptFirstFactor).toHaveBeenCalledWith({
      strategy: 'reset_password_email_code',
      code: '123456',
      password: 'newPassword123',
    });
  });

  it('should handle password reset failure', async () => {
    mockSignIn.attemptFirstFactor.mockResolvedValue({ status: 'needs_second_factor' });
    mockUseFormState.mockReturnValue({
      formState: {
        values: { email: '', password: 'newPassword123', code: '123456' },
        errors: {},
      },
      ...mockFormActions,
    });

    const { result } = renderHook(() => useForgotPassword({ email: '', password: '', code: '' }));

    await act(async () => {
      const event = { preventDefault: jest.fn() } as any;
      await result.current.handleResetPassword(event);
    });

    expect(result.current.error).toBe('Erreur lors de la réinitialisation du mot de passe');
    expect(result.current.success).toBe(false);
  });

  it('should handle password breach error', async () => {
    const error = {
      errors: [{ code: 'form_password_pwned', longMessage: 'Some other message' }],
    };
    mockSignIn.attemptFirstFactor.mockRejectedValue(error);
    mockUseFormState.mockReturnValue({
      formState: {
        values: { email: '', password: 'newPassword123', code: '123456' },
        errors: {},
      },
      ...mockFormActions,
    });

    const { result } = renderHook(() => useForgotPassword({ email: '', password: '', code: '' }));

    await act(async () => {
      const event = { preventDefault: jest.fn() } as any;
      await result.current.handleResetPassword(event);
    });

    expect(result.current.error).toBe(
      'Ce mot de passe a été trouvé dans une fuite de données en ligne. Veuillez en choisir un autre.'
    );
    expect(result.current.success).toBe(false);
  });

  it('should handle form validation errors', async () => {
    mockValidateEmail.mockReturnValue('Email invalide');
    mockUseFormState.mockReturnValue({
      formState: {
        values: { email: 'invalid-email', password: '', code: '' },
        errors: {},
      },
      ...mockFormActions,
    });

    const { result } = renderHook(() => useForgotPassword({ email: '', password: '', code: '' }));

    await act(async () => {
      const event = { preventDefault: jest.fn() } as any;
      await result.current.handleSendResetLink(event);
    });

    expect(mockFormActions.setFieldError).toHaveBeenCalledWith('email', 'Email invalide');
  });

  it('should handle password validation errors', async () => {
    mockValidatePassword.mockReturnValue('Mot de passe trop faible');
    mockUseFormState.mockReturnValue({
      formState: {
        values: { email: '', password: 'weak', code: '123456' },
        errors: {},
      },
      ...mockFormActions,
    });

    const { result } = renderHook(() => useForgotPassword({ email: '', password: '', code: '' }));

    await act(async () => {
      const event = { preventDefault: jest.fn() } as any;
      await result.current.handleResetPassword(event);
    });

    expect(mockFormActions.setFieldError).toHaveBeenCalledWith(
      'password',
      'Mot de passe trop faible'
    );
  });

  it('should handle OTP validation errors', async () => {
    mockValidateOTPCode.mockReturnValue('Code invalide');
    mockUseFormState.mockReturnValue({
      formState: {
        values: { email: '', password: 'newPassword123', code: '123' },
        errors: {},
      },
      ...mockFormActions,
    });

    const { result } = renderHook(() => useForgotPassword({ email: '', password: '', code: '' }));

    await act(async () => {
      const event = { preventDefault: jest.fn() } as any;
      await result.current.handleResetPassword(event);
    });

    expect(mockFormActions.setFieldError).toHaveBeenCalledWith('code', 'Code invalide');
  });

  it('should handle already authenticated user', async () => {
    mockUseClerk.mockReturnValue({ session: { id: 'session123' } });
    mockUseFormState.mockReturnValue({
      formState: {
        values: { email: 'test@example.com', password: '', code: '' },
        errors: {},
      },
      ...mockFormActions,
    });

    const { result } = renderHook(() => useForgotPassword({ email: '', password: '', code: '' }));

    await act(async () => {
      const event = { preventDefault: jest.fn() } as any;
      await result.current.handleSendResetLink(event);
    });

    expect(result.current.error).toBe(
      'Vous êtes déjà connecté. Veuillez utiliser la page de changement de mot de passe dans votre profil.'
    );
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle reset form', () => {
    const { result } = renderHook(() => useForgotPassword({ email: '', password: '', code: '' }));

    act(() => {
      result.current.handleResetForm();
    });

    expect(result.current.step).toBe(1);
  });

  it('should handle previous step', () => {
    const { result } = renderHook(() =>
      useForgotPassword({ email: '', password: '', code: '' }, 2)
    );

    act(() => {
      result.current.handlePreviousStep();
    });

    expect(result.current.step).toBe(1);
  });

  it('should handle field changes', () => {
    const { result } = renderHook(() => useForgotPassword({ email: '', password: '', code: '' }));

    act(() => {
      const event = { target: { value: 'test@example.com' } } as any;
      result.current.handleEmailChange(event);
    });

    expect(mockFormActions.updateField).toHaveBeenCalledWith('email', 'test@example.com');
  });

  it('should handle password field changes', () => {
    const { result } = renderHook(() => useForgotPassword({ email: '', password: '', code: '' }));

    act(() => {
      const event = { target: { value: 'newpassword123' } } as any;
      result.current.handlePasswordChange(event);
    });

    expect(mockFormActions.updateField).toHaveBeenCalledWith('password', 'newpassword123');
  });

  it('should handle code field changes', () => {
    const { result } = renderHook(() => useForgotPassword({ email: '', password: '', code: '' }));

    act(() => {
      result.current.handleCodeChange('123456');
    });

    expect(mockFormActions.updateField).toHaveBeenCalledWith('code', '123456');
  });
});
