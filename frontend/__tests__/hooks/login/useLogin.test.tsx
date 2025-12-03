import { act, renderHook } from '@testing-library/react';

import { useLogin } from '@/hooks/login/useLogin';

const mockSignIn = {
  create: jest.fn(),
  attemptFirstFactor: jest.fn(),
};

const mockSetActive = jest.fn();
const mockRouterPush = jest.fn();

jest.mock('@clerk/nextjs', () => ({
  useSignIn: jest.fn(() => ({
    isLoaded: true,
    signIn: mockSignIn,
    setActive: mockSetActive,
  })),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockRouterPush,
  })),
}));

jest.mock('@/hooks/useFormState', () => ({
  useFormState: jest.fn(),
}));

describe('useLogin', () => {
  const initialValues = {
    email: '',
    code: '',
  };

  const validValues = {
    email: 'user@example.com',
    code: '123456',
  };

  const getUseFormStateMock = () => require('@/hooks/useFormState').useFormState as jest.Mock;

  const setupFormState = (values: { email: string; code: string } = initialValues) => {
    const mutableValues = { ...values };
    const mutableErrors: Record<string, string> = {};

    const updateField = jest.fn((field: string, value: string) => {
      (mutableValues as Record<string, string>)[field] = value;
    });

    const setFieldError = jest.fn((field: string, error: string) => {
      if (error) {
        mutableErrors[field] = error;
      } else {
        delete mutableErrors[field];
      }
    });

    const hasError = jest.fn((field: string) => Boolean(mutableErrors[field]));
    const getError = jest.fn((field: string) => mutableErrors[field] ?? '');

    getUseFormStateMock().mockReturnValue({
      formState: {
        values: mutableValues,
        errors: mutableErrors,
      },
      updateField,
      setFieldError,
      hasError,
      getError,
    });

    return {
      values: mutableValues,
      errors: mutableErrors,
      updateField,
      setFieldError,
      hasError,
      getError,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupFormState(initialValues);
  });

  describe('initialisation', () => {
    it('exposes the expected default state', () => {
      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current.isLoaded).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.step).toBe(1);
      expect(result.current.success).toBe(false);
      expect(result.current.successMessage).toBeNull();
    });
  });

  describe('validation logic', () => {
    it('validates the email step when email is provided', () => {
      setupFormState({ email: 'user@example.com', code: '' });

      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current.isFormValid).toBe(true);
    });

    it('marks the email step invalid when the email is empty', () => {
      setupFormState({ email: '', code: '' });

      const { result } = renderHook(() => useLogin(initialValues));

      expect(result.current.isFormValid).toBe(false);
    });

    it('validates the code step when a 6 digit code is provided', () => {
      setupFormState(validValues);
      const { result } = renderHook(() => useLogin(initialValues, 2));

      expect(result.current.isFormValid).toBe(true);
    });

    it('marks the code step invalid when the code length is not 6', () => {
      setupFormState({ email: 'user@example.com', code: '12' });
      const { result } = renderHook(() => useLogin(initialValues, 2));

      expect(result.current.isFormValid).toBe(false);
    });
  });

  describe('handleFieldChange', () => {
    it('updates field and validates email', () => {
      const { updateField, setFieldError } = setupFormState();
      const { result } = renderHook(() => useLogin(initialValues));

      const mockEvent = {
        target: { value: 'user@example.com' },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleFieldChange('email')(mockEvent);
      });

      expect(updateField).toHaveBeenCalledWith('email', 'user@example.com');
      expect(setFieldError).toHaveBeenCalledWith('email', '');
    });

    it('handles non-email fields', () => {
      const { updateField } = setupFormState();
      const { result } = renderHook(() => useLogin(initialValues));

      const mockEvent = {
        target: { value: 'some value' },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleFieldChange('otherField')(mockEvent);
      });

      expect(updateField).toHaveBeenCalledWith('otherField', 'some value');
    });

    it('resets error state when field changes and error exists', () => {
      const { updateField } = setupFormState();
      const { result } = renderHook(() => useLogin(initialValues));

      // Set an error first
      act(() => {
        result.current.setFieldError('email', 'Some error');
      });

      const mockEvent = {
        target: { value: 'user@example.com' },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleFieldChange('email')(mockEvent);
      });

      expect(updateField).toHaveBeenCalled();
    });
  });

  describe('handleCodeChange', () => {
    it('updates code field and validates', () => {
      const { updateField, setFieldError } = setupFormState();
      const { result } = renderHook(() => useLogin(initialValues));

      act(() => {
        result.current.handleCodeChange('123456');
      });

      expect(updateField).toHaveBeenCalledWith('code', '123456');
      expect(setFieldError).toHaveBeenCalledWith('code', '');
    });

    it('resets error state when code changes and error exists', () => {
      const { updateField } = setupFormState();
      const { result } = renderHook(() => useLogin(initialValues));

      // Set an error first
      act(() => {
        result.current.setFieldError('code', 'Some error');
      });

      act(() => {
        result.current.handleCodeChange('123456');
      });

      expect(updateField).toHaveBeenCalled();
    });
  });

  describe('handleSendOTP', () => {
    it('sends the OTP and updates the success state', async () => {
      const { setFieldError } = setupFormState({ email: 'user@example.com', code: '' });
      mockSignIn.create.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useLogin(initialValues));

      await act(async () => {
        await result.current.handleSendOTP({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(setFieldError).not.toHaveBeenCalledWith('email', expect.any(String));
      expect(mockSignIn.create).toHaveBeenCalledWith({
        strategy: 'email_code',
        identifier: 'user@example.com',
      });
      expect(result.current.success).toBe(true);
      expect(result.current.successMessage).toBe(
        'Un code de vérification a été envoyé à votre email.'
      );
    });

    it('sets a field error when the email is invalid', async () => {
      const { setFieldError } = setupFormState({ email: '', code: '' });

      const { result } = renderHook(() => useLogin(initialValues));

      await act(async () => {
        await result.current.handleSendOTP({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(setFieldError).toHaveBeenCalledWith('email', "L'adresse email est requise.");
      expect(mockSignIn.create).not.toHaveBeenCalled();
    });

    it('handles service not ready error', async () => {
      const mockUseSignIn = require('@clerk/nextjs').useSignIn as jest.Mock;
      mockUseSignIn.mockReturnValueOnce({
        isLoaded: false,
        signIn: null,
        setActive: mockSetActive,
      });

      setupFormState({ email: 'user@example.com', code: '' });
      const { result } = renderHook(() => useLogin(initialValues));

      await act(async () => {
        await result.current.handleSendOTP({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.error).toBe("Le service n'est pas prêt. Veuillez réessayer.");
      expect(result.current.isLoading).toBe(false);

      // Reset mock
      mockUseSignIn.mockReturnValue({
        isLoaded: true,
        signIn: mockSignIn,
        setActive: mockSetActive,
      });
    });

    it('handles account not found error', async () => {
      setupFormState({ email: 'user@example.com', code: '' });
      mockSignIn.create.mockRejectedValueOnce(new Error("Couldn't find your account"));

      const { result } = renderHook(() => useLogin(initialValues));

      await act(async () => {
        await result.current.handleSendOTP({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.error).toBe("Aucun compte n'est associé à cette adresse email");
    });

    it('handles already signed in error', async () => {
      setupFormState({ email: 'user@example.com', code: '' });
      mockSignIn.create.mockRejectedValueOnce(new Error("You're already signed in"));

      const { result } = renderHook(() => useLogin(initialValues));

      await act(async () => {
        await result.current.handleSendOTP({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.error).toBe('Vous êtes déjà connecté.');
    });

    it('handles generic OTP send error', async () => {
      setupFormState({ email: 'user@example.com', code: '' });
      mockSignIn.create.mockRejectedValueOnce(new Error('Generic error'));

      const { result } = renderHook(() => useLogin(initialValues));

      await act(async () => {
        await result.current.handleSendOTP({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.error).toBe("Une erreur est survenue lors de l'envoi du code OTP");
    });

    it('handles unexpected error', async () => {
      setupFormState({ email: 'user@example.com', code: '' });
      mockSignIn.create.mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      const { result } = renderHook(() => useLogin(initialValues));

      await act(async () => {
        await result.current.handleSendOTP({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.error).toBe('Une erreur inattendue est survenue');
    });
  });

  describe('handleVerifyOTP', () => {
    it('verifies the code and redirects on success', async () => {
      setupFormState(validValues);
      mockSignIn.attemptFirstFactor.mockResolvedValueOnce({
        status: 'complete',
        createdSessionId: 'sess_123',
      });

      const { result } = renderHook(() => useLogin(initialValues, 2));

      await act(async () => {
        await result.current.handleVerifyOTP({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(mockSignIn.attemptFirstFactor).toHaveBeenCalledWith({
        strategy: 'email_code',
        code: '123456',
      });
      expect(mockSetActive).toHaveBeenCalledWith({ session: 'sess_123' });
      expect(mockRouterPush).toHaveBeenCalledWith('/auth-redirect');
    });

    it('sets a validation error when the code is too short', async () => {
      const { setFieldError } = setupFormState({ email: 'user@example.com', code: '12' });

      const { result } = renderHook(() => useLogin(initialValues, 2));

      await act(async () => {
        await result.current.handleVerifyOTP({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(setFieldError).toHaveBeenCalledWith(
        'code',
        'Le code doit contenir au moins 6 caractères.'
      );
      expect(mockSignIn.attemptFirstFactor).not.toHaveBeenCalled();
    });

    it('sets a validation error when the code length is not 6', async () => {
      const { setFieldError } = setupFormState({ email: 'user@example.com', code: '1234567' });

      const { result } = renderHook(() => useLogin(initialValues, 2));

      await act(async () => {
        await result.current.handleVerifyOTP({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(setFieldError).toHaveBeenCalledWith('code', 'Le code doit contenir 6 caractères.');
      expect(mockSignIn.attemptFirstFactor).not.toHaveBeenCalled();
    });

    it('handles service not ready error', async () => {
      const mockUseSignIn = require('@clerk/nextjs').useSignIn as jest.Mock;
      mockUseSignIn.mockReturnValueOnce({
        isLoaded: false,
        signIn: null,
        setActive: mockSetActive,
      });

      setupFormState(validValues);
      const { result } = renderHook(() => useLogin(initialValues, 2));

      await act(async () => {
        await result.current.handleVerifyOTP({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.error).toBe("Le service n'est pas prêt. Veuillez réessayer.");
      expect(result.current.isLoading).toBe(false);

      // Reset mock
      mockUseSignIn.mockReturnValue({
        isLoaded: true,
        signIn: mockSignIn,
        setActive: mockSetActive,
      });
    });

    it('handles incomplete status', async () => {
      setupFormState(validValues);
      mockSignIn.attemptFirstFactor.mockResolvedValueOnce({
        status: 'incomplete',
      });

      const { result } = renderHook(() => useLogin(initialValues, 2));

      await act(async () => {
        await result.current.handleVerifyOTP({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.error).toBe(
        'Erreur lors de la vérification du code. Veuillez réessayer.'
      );
    });

    it('handles form_code_incorrect error', async () => {
      setupFormState(validValues);
      const clerkError = {
        errors: [
          {
            code: 'form_code_incorrect',
            message: 'Incorrect code',
            longMessage: 'The code you entered is incorrect',
          },
        ],
      };
      mockSignIn.attemptFirstFactor.mockRejectedValueOnce(clerkError);

      const { result } = renderHook(() => useLogin(initialValues, 2));

      await act(async () => {
        await result.current.handleVerifyOTP({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.error).toBe('Code incorrect. Veuillez réessayer.');
    });

    it('handles clerk error with longMessage', async () => {
      setupFormState(validValues);
      const clerkError = {
        errors: [
          {
            code: 'other_error',
            message: 'Short message',
            longMessage: 'This is a long error message',
          },
        ],
      };
      mockSignIn.attemptFirstFactor.mockRejectedValueOnce(clerkError);

      const { result } = renderHook(() => useLogin(initialValues, 2));

      await act(async () => {
        await result.current.handleVerifyOTP({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.error).toBe('This is a long error message');
    });

    it('handles clerk error with message only', async () => {
      setupFormState(validValues);
      const clerkError = {
        errors: [
          {
            code: 'other_error',
            message: 'Error message',
          },
        ],
      };
      mockSignIn.attemptFirstFactor.mockRejectedValueOnce(clerkError);

      const { result } = renderHook(() => useLogin(initialValues, 2));

      await act(async () => {
        await result.current.handleVerifyOTP({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.error).toBe('Error message');
    });

    it('handles generic error without clerk error structure', async () => {
      setupFormState(validValues);
      mockSignIn.attemptFirstFactor.mockRejectedValueOnce(new Error('Generic error'));

      const { result } = renderHook(() => useLogin(initialValues, 2));

      await act(async () => {
        await result.current.handleVerifyOTP({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.error).toBe('Code incorrect. Veuillez réessayer.');
    });

    it('handles unexpected error', async () => {
      setupFormState(validValues);
      mockSignIn.attemptFirstFactor.mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      const { result } = renderHook(() => useLogin(initialValues, 2));

      await act(async () => {
        await result.current.handleVerifyOTP({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.error).toBe('Une erreur est survenue lors de la vérification du code');
    });
  });

  describe('handleResendCode', () => {
    it('reuses sendOTP when a code is requested again', async () => {
      setupFormState(validValues);
      mockSignIn.create.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLogin(initialValues));

      await act(async () => {
        await result.current.handleResendCode();
      });

      expect(mockSignIn.create).toHaveBeenCalledWith({
        strategy: 'email_code',
        identifier: 'user@example.com',
      });
    });

    it('does not send code when email is empty', async () => {
      setupFormState({ email: '', code: '' });
      mockSignIn.create.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLogin(initialValues));

      await act(async () => {
        await result.current.handleResendCode();
      });

      expect(mockSignIn.create).not.toHaveBeenCalled();
    });

    it('does not send code when email is only whitespace', async () => {
      setupFormState({ email: '   ', code: '' });
      mockSignIn.create.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLogin(initialValues));

      await act(async () => {
        await result.current.handleResendCode();
      });

      expect(mockSignIn.create).not.toHaveBeenCalled();
    });

    it('manages isResending state correctly', async () => {
      setupFormState(validValues);
      mockSignIn.create.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLogin(initialValues));

      // Initially isResending should be false
      expect(result.current.isResending).toBe(false);

      await act(async () => {
        await result.current.handleResendCode();
      });

      // After completion, isResending should be false
      expect(result.current.isResending).toBe(false);
    });

    it('does not set isLoading when resending code', async () => {
      setupFormState(validValues);
      mockSignIn.create.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLogin(initialValues));

      await act(async () => {
        await result.current.handleResendCode();
      });

      // isLoading should remain false during resend
      expect(result.current.isLoading).toBe(false);
    });

    it('does not change step when resending code', async () => {
      setupFormState(validValues);
      mockSignIn.create.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLogin(initialValues, 2));

      await act(async () => {
        await result.current.handleResendCode();
      });

      // Step should remain the same (2)
      expect(result.current.step).toBe(2);
    });

    it('handles resend errors gracefully', async () => {
      setupFormState(validValues);
      mockSignIn.create.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useLogin(initialValues));

      await act(async () => {
        await result.current.handleResendCode();
      });

      expect(result.current.isResending).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('reset helpers', () => {
    it('returns to step 1 when handlePreviousStep is invoked', () => {
      setupFormState(validValues);
      const { result } = renderHook(() => useLogin(initialValues, 2));

      act(() => {
        result.current.handlePreviousStep();
      });

      expect(result.current.step).toBe(1);
    });

    it('resets form state when handleResetForm is invoked', () => {
      setupFormState(validValues);
      const { result } = renderHook(() => useLogin(initialValues, 2));

      act(() => {
        result.current.handleResetForm();
      });

      expect(result.current.step).toBe(1);
    });
  });
});
