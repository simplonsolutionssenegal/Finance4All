import { act, renderHook } from '@testing-library/react';
import type { MutableRefObject } from 'react';

import { useCreateBeneficiary } from '@/hooks/beneficiary/useCreateBeneficiary';

const mockSignUp = {
  create: jest.fn(),
  prepareEmailAddressVerification: jest.fn(),
  attemptEmailAddressVerification: jest.fn(),
};

let mockIsLoaded = true;
const mockRouterPush = jest.fn();
const mockUseFormState = jest.fn();

jest.mock('@clerk/nextjs', () => ({
  useSignUp: () => ({
    isLoaded: mockIsLoaded,
    signUp: mockSignUp,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

jest.mock('@/hooks/useFormState', () => ({
  useFormState: (...args: unknown[]) => mockUseFormState(...args),
}));

describe('useCreateBeneficiary', () => {
  const initialValues = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  };

  const validFormValues = {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+221771234567',
    email: 'john@example.com',
  };

  const setupFormState = (
    values: typeof validFormValues | typeof initialValues,
    overrides: {
      hasError?: jest.Mock;
      getError?: jest.Mock;
      updateField?: jest.Mock;
      setFieldError?: jest.Mock;
      formState?: {
        values: Record<string, unknown>;
        errors: Record<string, string>;
      };
    } = {}
  ) => {
    const hasError = overrides.hasError ?? jest.fn(() => false);
    const getError = overrides.getError ?? jest.fn(() => '');
    const updateField = overrides.updateField ?? jest.fn();
    const setFieldError = overrides.setFieldError ?? jest.fn();
    const formState = overrides.formState ?? {
      values: { ...values },
      errors: {},
    };

    mockUseFormState.mockReturnValue({
      formState,
      updateField,
      hasError,
      getError,
      setFieldError,
    });
  };

  beforeEach(() => {
    mockIsLoaded = true;
    jest.clearAllMocks();
    setupFormState(initialValues);
  });

  const createChangeEvent = (value: string) =>
    ({
      target: { value },
    }) as React.ChangeEvent<HTMLInputElement>;

  it('initialises with default state', () => {
    const { result } = renderHook(() => useCreateBeneficiary(initialValues));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isOtpVerification).toBe(false);
    expect(result.current.verificationError).toBeNull();
    expect(result.current.isVerifying).toBe(false);
    expect(result.current.isResending).toBe(false);
    expect(result.current.isLoaded).toBe(true);
  });

  it('returns provided form values', () => {
    setupFormState(validFormValues);

    const { result } = renderHook(() => useCreateBeneficiary(validFormValues));

    expect(result.current.formState.values).toEqual(validFormValues);
  });

  it('validates form correctly', () => {
    setupFormState(validFormValues);
    const { result: validResult } = renderHook(() => useCreateBeneficiary(validFormValues));
    expect(validResult.current.isFormValid).toBe(true);

    setupFormState(initialValues);
    const { result: invalidResult } = renderHook(() => useCreateBeneficiary(initialValues));
    expect(invalidResult.current.isFormValid).toBe(false);
  });

  describe('handleCreateBeneficiary', () => {
    it('creates user and sends OTP code', async () => {
      setupFormState(validFormValues);
      mockSignUp.create.mockResolvedValue({
        status: 'missing_requirements',
        unverifiedFields: ['email_address'],
      });
      mockSignUp.prepareEmailAddressVerification.mockResolvedValue({});

      const { result } = renderHook(() => useCreateBeneficiary(validFormValues));

      await act(async () => {
        await result.current.handleCreateBeneficiary({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(mockSignUp.create).toHaveBeenCalledWith({
        emailAddress: validFormValues.email,
        firstName: validFormValues.firstName,
        lastName: validFormValues.lastName,
        unsafeMetadata: {
          role: 'beneficiary',
          phoneNumber: validFormValues.phone,
        },
      });
      expect(mockSignUp.prepareEmailAddressVerification).toHaveBeenCalledWith({
        strategy: 'email_code',
      });
      expect(result.current.isOtpVerification).toBe(true);
    });

    it('starts email verification when required', async () => {
      setupFormState(validFormValues);
      mockSignUp.create.mockResolvedValue({
        status: 'missing_requirements',
        unverifiedFields: ['email_address'],
      });
      mockSignUp.prepareEmailAddressVerification.mockResolvedValue({});

      const { result } = renderHook(() => useCreateBeneficiary(validFormValues));

      await act(async () => {
        await result.current.handleCreateBeneficiary({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(mockSignUp.prepareEmailAddressVerification).toHaveBeenCalledWith({
        strategy: 'email_code',
      });
      expect(result.current.isOtpVerification).toBe(true);
      expect(result.current.verificationTarget).toBe(validFormValues.email);
    });

    const clerkErrorCases = [
      {
        name: 'email_address_exists code',
        errorResponse: {
          errors: [{ code: 'email_address_exists', message: 'Email already exists' }],
        },
        expected: 'Cette adresse email est déjà utilisée.',
      },
      {
        name: 'identifier_already_exists code',
        errorResponse: {
          errors: [{ code: 'identifier_already_exists', message: 'Identifier already exists' }],
        },
        expected: 'Cette adresse email est déjà utilisée.',
      },
      {
        name: 'english email taken message',
        errorResponse: {
          errors: [
            {
              code: 'some_unknown_code',
              message: 'That email address is taken. Please try another.',
            },
          ],
        },
        expected: 'Cette adresse email est déjà utilisée.',
      },
      {
        name: 'english phone number message',
        errorResponse: {
          errors: [
            {
              code: 'random_code',
              message: 'This phone number is already in use. Try a different one.',
            },
          ],
        },
        expected: 'Ce numéro de téléphone est déjà utilisé.',
      },
      {
        name: 'form_identifier_exists code',
        errorResponse: {
          errors: [{ code: 'form_identifier_exists', message: 'Identifier already exists' }],
        },
        expected: 'Cette adresse email est déjà utilisée.',
      },
      {
        name: 'form_email_address_invalid code',
        errorResponse: {
          errors: [{ code: 'form_email_address_invalid', message: 'Email invalid' }],
        },
        expected: 'Adresse email invalide.',
      },
      {
        name: 'form_phone_number_exists code',
        errorResponse: {
          errors: [{ code: 'form_phone_number_exists', message: 'Phone already exists' }],
        },
        expected: 'Ce numéro de téléphone est déjà utilisé.',
      },
      {
        name: 'phone_number_exists code',
        errorResponse: {
          errors: [{ code: 'phone_number_exists', message: 'Phone already exists' }],
        },
        expected: 'Ce numéro de téléphone est déjà utilisé.',
      },
      {
        name: 'form_phone_number_invalid code',
        errorResponse: {
          errors: [{ code: 'form_phone_number_invalid', message: 'Phone invalid' }],
        },
        expected: 'Numéro de téléphone invalide.',
      },
      {
        name: 'strategy_for_country_not_available code',
        errorResponse: {
          errors: [
            { code: 'strategy_for_country_not_available', message: 'Country not supported' },
          ],
        },
        expected:
          'Les numéros de téléphone de ce pays ne sont pas encore pris en charge. Veuillez contacter le support.',
      },
      {
        name: 'english unsupported country message',
        errorResponse: {
          errors: [
            {
              code: 'random',
              message: 'Phone numbers for this country are currently not supported.',
            },
          ],
        },
        expected:
          'Les numéros de téléphone de ce pays ne sont pas encore pris en charge. Veuillez contacter le support.',
      },
      {
        name: 'english phone already exists message variant',
        errorResponse: {
          errors: [
            {
              code: 'random',
              message: 'The phone number already exists in our records.',
            },
          ],
        },
        expected: 'Ce numéro de téléphone est déjà utilisé.',
      },
    ] as const;

    it.each(clerkErrorCases)(
      'localises Clerk errors for %s',
      async ({ errorResponse, expected }) => {
        setupFormState(validFormValues);
        mockSignUp.create.mockRejectedValueOnce(errorResponse);

        const { result } = renderHook(() => useCreateBeneficiary(validFormValues));

        await act(async () => {
          await result.current.handleCreateBeneficiary({
            preventDefault: jest.fn(),
          } as unknown as React.FormEvent<HTMLFormElement>);
        });

        expect(result.current.error).toBe(expected);
      }
    );
  });

  describe('handleFieldChange', () => {
    it('normalises valid phone numbers and clears errors', () => {
      const updateField = jest.fn();
      const setFieldError = jest.fn();
      setupFormState(validFormValues, { updateField, setFieldError });

      const { result } = renderHook(() => useCreateBeneficiary(validFormValues));

      act(() => {
        result.current.handleFieldChange('phone')(createChangeEvent('+221 77-123-4567  '));
      });

      expect(setFieldError).toHaveBeenCalledWith('phone', '');
      expect(updateField).toHaveBeenNthCalledWith(2, 'phone', '+221771234567');
    });

    it('sets required error when phone empty', () => {
      const setFieldError = jest.fn();
      setupFormState(initialValues, { setFieldError });

      const { result } = renderHook(() => useCreateBeneficiary(initialValues));

      act(() => {
        result.current.handleFieldChange('phone')(createChangeEvent('   '));
      });

      expect(setFieldError).toHaveBeenCalledWith('phone', 'Le numéro de téléphone est requis.');
    });

    it('validates phone format prefix', () => {
      const setFieldError = jest.fn();
      setupFormState(initialValues, { setFieldError });

      const { result } = renderHook(() => useCreateBeneficiary(initialValues));

      act(() => {
        result.current.handleFieldChange('phone')(createChangeEvent('771234567'));
      });

      expect(setFieldError).toHaveBeenCalledWith(
        'phone',
        'Le numéro doit commencer par + suivi du code pays (ex: +22370112233).'
      );
    });

    it('validates E.164 format for phone numbers', () => {
      const setFieldError = jest.fn();
      setupFormState(initialValues, { setFieldError });

      const { result } = renderHook(() => useCreateBeneficiary(initialValues));

      act(() => {
        result.current.handleFieldChange('phone')(createChangeEvent('+22177abc123'));
      });

      expect(setFieldError).toHaveBeenCalledWith(
        'phone',
        'Numéro de téléphone invalide (format international requis).'
      );
    });

    it('resets global error when a field changes', async () => {
      setupFormState(validFormValues);
      mockSignUp.create.mockRejectedValue({
        errors: [{ code: 'email_address_exists', message: 'Email already exists' }],
      });

      const { result } = renderHook(() => useCreateBeneficiary(validFormValues));

      await act(async () => {
        await result.current.handleCreateBeneficiary({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.error).toBe('Cette adresse email est déjà utilisée.');

      act(() => {
        result.current.handleFieldChange('email')(createChangeEvent('john+alias@example.com'));
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('handleVerification', () => {
    const initialiseVerificationState = async (
      result: MutableRefObject<ReturnType<typeof useCreateBeneficiary>>
    ) => {
      mockSignUp.create.mockResolvedValue({
        status: 'missing_requirements',
        unverifiedFields: ['email_address'],
      });
      mockSignUp.prepareEmailAddressVerification.mockResolvedValue({});

      await act(async () => {
        await result.current.handleCreateBeneficiary({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      mockSignUp.create.mockClear();
      mockSignUp.prepareEmailAddressVerification.mockClear();
    };

    it('redirects to dashboard when verification completes', async () => {
      setupFormState(validFormValues);
      mockSignUp.attemptEmailAddressVerification.mockResolvedValue({
        status: 'complete',
      });

      const { result } = renderHook(() => useCreateBeneficiary(validFormValues));
      await initialiseVerificationState(result);

      await act(async () => {
        await result.current.handleVerification('123456');
      });

      expect(mockSignUp.attemptEmailAddressVerification).toHaveBeenCalledWith({ code: '123456' });
      expect(mockRouterPush).toHaveBeenCalledWith('/beneficiaire-dashboard');
    });

    it('shows error message when verification fails', async () => {
      setupFormState(validFormValues);
      mockSignUp.attemptEmailAddressVerification.mockResolvedValue({
        status: 'missing_requirements',
        unverifiedFields: ['email_address'],
        verifications: {
          emailAddress: { status: 'failed' },
        },
      });

      const { result } = renderHook(() => useCreateBeneficiary(validFormValues));
      await initialiseVerificationState(result);

      await act(async () => {
        await result.current.handleVerification('123456');
      });

      expect(result.current.verificationError).toBe(
        'Le code saisi est invalide ou expiré. Veuillez utiliser le bouton "Renvoyer le code" pour recevoir un nouveau code.'
      );
      expect(mockSignUp.prepareEmailAddressVerification).not.toHaveBeenCalled();
    });

    it('handles missing additional requirements', async () => {
      setupFormState(validFormValues);
      mockSignUp.attemptEmailAddressVerification.mockResolvedValue({
        status: 'missing_requirements',
        missingFields: ['name'],
        unverifiedFields: [],
        verifications: {
          emailAddress: { status: 'unverified' },
        },
      });

      const { result } = renderHook(() => useCreateBeneficiary(validFormValues));
      await initialiseVerificationState(result);

      await act(async () => {
        await result.current.handleVerification('123456');
      });

      expect(result.current.verificationError).toBe(
        'Des informations supplémentaires sont requises: name.'
      );
    });

    it('handles unexpected verification status', async () => {
      setupFormState(validFormValues);
      mockSignUp.attemptEmailAddressVerification.mockResolvedValue({
        status: 'needs_factor_two',
        missingFields: [],
        unverifiedFields: [],
        verifications: {},
      });

      const { result } = renderHook(() => useCreateBeneficiary(validFormValues));
      await initialiseVerificationState(result);

      await act(async () => {
        await result.current.handleVerification('123456');
      });

      expect(result.current.verificationError).toBe(
        'Status de vérification inattendu: needs_factor_two. Veuillez réessayer.'
      );
    });

    it('shows error message when verification status is not verified', async () => {
      setupFormState(validFormValues);
      mockSignUp.attemptEmailAddressVerification.mockResolvedValue({
        status: 'missing_requirements',
        unverifiedFields: ['email_address'],
        verifications: {
          emailAddress: { status: 'expired' },
        },
      });

      const hook = renderHook(() => useCreateBeneficiary(validFormValues));
      await initialiseVerificationState(hook.result);

      await act(async () => {
        await hook.result.current.handleVerification('123456');
      });

      expect(hook.result.current.verificationError).toBe(
        'Le code n\'a pas pu être vérifié. Veuillez utiliser le bouton "Renvoyer le code" si nécessaire.'
      );
      expect(mockSignUp.prepareEmailAddressVerification).not.toHaveBeenCalled();
    });

    it('shows error message when verification cannot be completed', async () => {
      setupFormState(validFormValues);
      mockSignUp.attemptEmailAddressVerification.mockResolvedValue({
        status: 'missing_requirements',
        unverifiedFields: ['email_address'],
        verifications: {
          emailAddress: { status: 'pending' },
        },
      });

      const hook = renderHook(() => useCreateBeneficiary(validFormValues));
      await initialiseVerificationState(hook.result);

      await act(async () => {
        await hook.result.current.handleVerification('123456');
      });

      expect(hook.result.current.verificationError).toBe(
        'Le code n\'a pas pu être vérifié. Veuillez utiliser le bouton "Renvoyer le code" si nécessaire.'
      );
    });

    it('redirects when requirements resolved without additional fields', async () => {
      setupFormState(validFormValues);
      mockSignUp.attemptEmailAddressVerification.mockResolvedValue({
        status: 'missing_requirements',
        unverifiedFields: [],
        missingFields: [],
        verifications: {
          emailAddress: { status: 'verified' },
        },
      });

      const hook = renderHook(() => useCreateBeneficiary(validFormValues));
      await initialiseVerificationState(hook.result);
      mockRouterPush.mockClear();

      await act(async () => {
        await hook.result.current.handleVerification('123456');
      });

      expect(mockRouterPush).toHaveBeenCalledWith('/beneficiaire-dashboard');
    });

    it('handles verification attempts that throw', async () => {
      setupFormState(validFormValues);
      mockSignUp.attemptEmailAddressVerification.mockRejectedValue(new Error('Invalid code'));

      const hook = renderHook(() => useCreateBeneficiary(validFormValues));
      await initialiseVerificationState(hook.result);

      await act(async () => {
        await hook.result.current.handleVerification('123456');
      });

      expect(hook.result.current.verificationError).toBe(
        'Erreur lors de la vérification: Invalid code. Veuillez réessayer.'
      );
    });

    it('sets manual error when verification not initialised', async () => {
      setupFormState(validFormValues);
      const { result } = renderHook(() => useCreateBeneficiary(validFormValues));

      await act(async () => {
        await result.current.handleVerification('123456');
      });

      expect(result.current.verificationError).toBe(
        "Aucune vérification n'est en cours. Veuillez relancer la procédure."
      );
      expect(mockSignUp.attemptEmailAddressVerification).not.toHaveBeenCalled();
    });

    it('ignores empty verification codes', async () => {
      setupFormState(validFormValues);
      const { result } = renderHook(() => useCreateBeneficiary(validFormValues));

      await act(async () => {
        await result.current.handleVerification('   ');
      });

      expect(mockSignUp.attemptEmailAddressVerification).not.toHaveBeenCalled();
    });
  });

  describe('handleResendCode', () => {
    it('sends a new code successfully', async () => {
      setupFormState(validFormValues);
      mockSignUp.prepareEmailAddressVerification.mockResolvedValue({});

      const { result } = renderHook(() => useCreateBeneficiary(validFormValues));

      await act(async () => {
        mockSignUp.create.mockResolvedValue({
          status: 'missing_requirements',
          unverifiedFields: ['email_address'],
        });
        await result.current.handleCreateBeneficiary({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.verificationStrategy).toBe('email_code');
      mockSignUp.prepareEmailAddressVerification.mockClear();
      mockSignUp.prepareEmailAddressVerification.mockResolvedValue({});

      await act(async () => {
        await result.current.handleResendCode();
      });

      expect(mockSignUp.prepareEmailAddressVerification).toHaveBeenCalledWith({
        strategy: 'email_code',
      });
    });

    it('manages isResending state correctly', async () => {
      setupFormState(validFormValues);
      mockSignUp.prepareEmailAddressVerification.mockResolvedValue({});

      const { result } = renderHook(() => useCreateBeneficiary(validFormValues));

      await act(async () => {
        mockSignUp.create.mockResolvedValue({
          status: 'missing_requirements',
          unverifiedFields: ['email_address'],
        });
        await result.current.handleCreateBeneficiary({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      // Initially isResending should be false
      expect(result.current.isResending).toBe(false);

      mockSignUp.prepareEmailAddressVerification.mockClear();
      mockSignUp.prepareEmailAddressVerification.mockResolvedValue({});

      await act(async () => {
        await result.current.handleResendCode();
      });

      // After completion, isResending should be false
      expect(result.current.isResending).toBe(false);
    });

    it('reports resend failures', async () => {
      setupFormState(validFormValues);
      mockSignUp.prepareEmailAddressVerification.mockRejectedValue(new Error('Resend failed'));

      const { result } = renderHook(() => useCreateBeneficiary(validFormValues));

      await act(async () => {
        mockSignUp.create.mockResolvedValue({
          status: 'missing_requirements',
          unverifiedFields: ['email_address'],
        });
        mockSignUp.prepareEmailAddressVerification.mockResolvedValue({});
        await result.current.handleCreateBeneficiary({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.verificationStrategy).toBe('email_code');
      mockSignUp.prepareEmailAddressVerification.mockClear();
      mockSignUp.prepareEmailAddressVerification.mockRejectedValue(new Error('Resend failed'));

      await act(async () => {
        await result.current.handleResendCode();
      });

      expect(result.current.verificationError).toBe(
        "Erreur lors de l'envoi du nouveau code: Resend failed. Veuillez réessayer."
      );
    });

    it('does nothing when verification not started', async () => {
      setupFormState(validFormValues);
      const { result } = renderHook(() => useCreateBeneficiary(validFormValues));

      await act(async () => {
        await result.current.handleResendCode();
      });

      expect(mockSignUp.prepareEmailAddressVerification).not.toHaveBeenCalled();
    });
  });

  describe('handleCreateBeneficiary edge cases', () => {
    it('throws error when signUp returns null', async () => {
      setupFormState(validFormValues);
      mockSignUp.create.mockResolvedValue(null);

      const { result } = renderHook(() => useCreateBeneficiary(validFormValues));

      await act(async () => {
        await result.current.handleCreateBeneficiary({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.error).toBe('La création du compte a échoué');
    });

    it('surfaces email verification preparation failures', async () => {
      setupFormState(validFormValues);
      mockSignUp.create.mockResolvedValue({
        status: 'missing_requirements',
        unverifiedFields: ['email_address'],
      });
      mockSignUp.prepareEmailAddressVerification.mockRejectedValue(new Error('SMTP indisponible'));

      const { result } = renderHook(() => useCreateBeneficiary(validFormValues));

      await act(async () => {
        await result.current.handleCreateBeneficiary({
          preventDefault: jest.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.error).toBe('SMTP indisponible');
    });
  });
});
