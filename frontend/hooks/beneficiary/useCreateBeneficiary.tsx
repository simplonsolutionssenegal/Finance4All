import { useSignUp, useClerk } from '@clerk/nextjs';
import type { SignUpResource } from '@clerk/types';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { validateBeneficiaryField } from '@/lib/validation';

import { useFormState } from '../useFormState';

export interface CreateBeneficiaryFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: string;
  [key: string]: unknown;
}

interface UseCreateBeneficiaryReturn {
  // Form state
  formState: {
    values: Record<string, unknown>;
    errors: Record<string, string> | Partial<Record<string, string>>;
  };
  updateField: (field: string, value: string) => void;
  hasError: (field: string) => boolean;
  getError: (field: string) => string;
  isFormValid: boolean;
  // UI state
  isLoading: boolean;
  error: string | null;
  isLoaded: boolean;
  // Verification state
  isOtpVerification: boolean;
  verificationError: string | null;
  isVerifying: boolean;
  isResending: boolean;
  verificationStrategy: VerificationStrategy | null;
  verificationTarget: string;
  // Handlers
  handleFieldChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCreateBeneficiary: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleVerification: (code: string) => Promise<void>;
  handleResendCode: () => Promise<void>;
}

type VerificationStrategy = 'email_code';

const REQUIRED_FIELDS = ['firstName', 'lastName', 'phone', 'email', 'birthDate', 'gender'] as const;

export function useCreateBeneficiary(
  initialValues: CreateBeneficiaryFormValues
): UseCreateBeneficiaryReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOtpVerification, setIsOtpVerification] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStrategy, setVerificationStrategy] = useState<VerificationStrategy | null>(
    null
  );
  const [verificationTarget, setVerificationTarget] = useState('');
  const router = useRouter();
  const { setActive } = useClerk();

  const { isLoaded, signUp } = useSignUp();
  const { formState, updateField, hasError, getError, setFieldError } = useFormState(initialValues);

  const isFormValid = useMemo(() => {
    return REQUIRED_FIELDS.every(
      field => (formState.values[field] as string).trim() !== '' && !hasError(field)
    );
  }, [formState, hasError]);

  const resetState = useCallback(() => {
    setError(null);
  }, []);

  const validateField = useCallback(
    (field: string, value: string) => {
      const error = validateBeneficiaryField(field, value);
      setFieldError(field, error);

      if (field === 'phone' && !error) {
        const trimmed = value.trim().replace(/[\s-]/g, '');
        updateField('phone', trimmed);
      }
    },
    [setFieldError, updateField]
  );

  const handleFieldChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      updateField(field, e.target.value);
      validateField(field, e.target.value);
      if (error) {
        resetState();
      }
    },
    [updateField, validateField, error, resetState]
  );

  const getErrorMessage = useCallback((clerkError: { code: string; message?: string }) => {
    const code = clerkError.code?.toLowerCase();
    const message = clerkError.message?.toLowerCase();

    // Erreurs email
    const emailExistsCodes = [
      'form_email_address_exists',
      'email_address_exists',
      'identifier_already_exists',
      'form_identifier_exists',
    ];
    if (
      emailExistsCodes.includes(code) ||
      message?.includes('email address is taken') ||
      message?.includes('email already exists')
    ) {
      return 'Cette adresse email est déjà utilisée.';
    }
    if (code === 'form_email_address_invalid') {
      return 'Adresse email invalide.';
    }

    // Erreurs téléphone
    const phoneExistsCodes = ['form_phone_number_exists', 'phone_number_exists'];
    if (
      phoneExistsCodes.includes(code) ||
      message?.includes('phone number is already in use') ||
      message?.includes('phone number already exists')
    ) {
      return 'Ce numéro de téléphone est déjà utilisé.';
    }
    if (code === 'form_phone_number_invalid') {
      return 'Numéro de téléphone invalide.';
    }

    // Erreurs pays non supporté
    const unsupportedCountryMessages = [
      'unsupported_country_code',
      'strategy_for_country_not_available',
    ];
    if (unsupportedCountryMessages.includes(code) || message?.includes('currently not supported')) {
      return 'Les numéros de téléphone de ce pays ne sont pas encore pris en charge. Veuillez contacter le support.';
    }

    return "Une erreur s'est produite lors de la création du compte.";
  }, []);

  const setupEmailVerification = useCallback(() => {
    setVerificationStrategy('email_code');
    setVerificationTarget(formState.values.email as string);
    setIsOtpVerification(true);
    setVerificationError(null);
  }, [formState.values.email]);

  const syncBeneficiaryToBackend = useCallback(async () => {
    try {
      await fetch('/api/beneficiaries/self-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formState.values.firstName,
          lastName: formState.values.lastName,
          email: formState.values.email,
          phone: formState.values.phone || undefined,
          birthDate: formState.values.birthDate || undefined,
          gender: formState.values.gender || undefined,
        }),
      });
    } catch (err) {
      console.error('Erreur sync bénéficiaire vers backend:', err);
    }
  }, [formState.values]);

  const processVerificationAttempt = useCallback(
    async (attempt: SignUpResource) => {
      const emailVerificationStatus = attempt.verifications?.emailAddress?.status;
      const isEmailVerified = String(emailVerificationStatus) === 'verified';

      // Activer la session et rediriger vers le dashboard
      if (isEmailVerified || attempt.status === 'complete') {
        if (attempt.createdSessionId) {
          await setActive({ session: attempt.createdSessionId });
        }
        // Synchroniser le bénéficiaire vers PostgreSQL
        await syncBeneficiaryToBackend();
        router.push('/auth-redirect');
        return;
      }

      const unverifiedFields = attempt.unverifiedFields ?? [];
      const missingFields = attempt.missingFields ?? [];

      if (!isEmailVerified && unverifiedFields.includes('email_address')) {
        const errorMessage =
          String(emailVerificationStatus) === 'failed'
            ? 'Le code saisi est invalide ou expiré. Veuillez utiliser le bouton "Renvoyer le code" pour recevoir un nouveau code.'
            : 'Le code n\'a pas pu être vérifié. Veuillez utiliser le bouton "Renvoyer le code" si nécessaire.';
        setVerificationError(errorMessage);
        return;
      }

      // Gestion des erreurs
      if (missingFields.length > 0) {
        setVerificationError(
          `Des informations supplémentaires sont requises: ${missingFields.join(', ')}.`
        );
        return;
      }

      setVerificationError(
        `Status de vérification inattendu: ${attempt.status}. Veuillez réessayer.`
      );
    },
    [router, setActive, syncBeneficiaryToBackend]
  );

  const handleCreateBeneficiary = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!isLoaded || !signUp) return;
      if (!isFormValid) return;

      setIsLoading(true);
      setError(null);
      setVerificationError(null);
      setIsOtpVerification(false);
      setVerificationStrategy(null);
      setVerificationTarget('');

      try {
        // Creation de l'utilisateur dans Clerk
        const signUpResult = await signUp.create({
          emailAddress: formState.values.email as string,
          firstName: formState.values.firstName as string,
          lastName: formState.values.lastName as string,
          unsafeMetadata: {
            role: 'beneficiary',
            phoneNumber: formState.values.phone as string,
            birthDate: formState.values.birthDate as string,
            gender: formState.values.gender as string,
          },
        });

        if (!signUpResult) {
          throw new Error('La création du compte a échoué');
        }

        // Envoi du code OTP
        try {
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setupEmailVerification();
        } catch (verifyErr) {
          const errorMsg =
            verifyErr instanceof Error ? verifyErr.message : "Erreur lors de l'envoi du code OTP";
          setError(errorMsg);
        }
      } catch (err: unknown) {
        let errorMessage = "Une erreur s'est produite lors de la création du compte.";

        if (err && typeof err === 'object' && 'errors' in err) {
          const clerkError = (err as { errors: Array<{ code: string; message?: string }> })
            .errors[0];
          if (clerkError) {
            errorMessage = getErrorMessage(clerkError);
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoaded, signUp, isFormValid, formState.values, getErrorMessage, setupEmailVerification]
  );

  const handleVerification = useCallback(
    async (code: string) => {
      if (!isLoaded || !signUp || !code.trim()) return;
      setIsVerifying(true);
      setVerificationError(null);

      try {
        if (!verificationStrategy) {
          setVerificationError(
            "Aucune vérification n'est en cours. Veuillez relancer la procédure."
          );
          return;
        }

        const trimmedCode = code.trim();
        const attempt = await signUp.attemptEmailAddressVerification({
          code: trimmedCode,
        });

        await processVerificationAttempt(attempt);
      } catch (err: unknown) {
        console.error('Erreur de vérification:', err);
        const errorMessage =
          err instanceof Error ? err.message : "Une erreur inconnue s'est produite";
        setVerificationError(
          `Erreur lors de la vérification: ${errorMessage}. Veuillez réessayer.`
        );
      } finally {
        setIsVerifying(false);
      }
    },
    [isLoaded, processVerificationAttempt, signUp, verificationStrategy]
  );

  const handleResendCode = useCallback(async () => {
    if (!isLoaded || !signUp || !verificationStrategy) return;

    setIsResending(true);
    setVerificationError(null);

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    } catch (err: unknown) {
      console.error("Erreur lors de l'envoi du nouveau code:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur inconnue s'est produite";
      setVerificationError(
        `Erreur lors de l'envoi du nouveau code: ${errorMessage}. Veuillez réessayer.`
      );
    } finally {
      setIsResending(false);
    }
  }, [isLoaded, signUp, verificationStrategy]);

  return {
    formState,
    updateField,
    hasError,
    getError,
    isFormValid,
    isLoading,
    error,
    isLoaded,
    isOtpVerification,
    verificationError,
    isVerifying,
    isResending,
    verificationStrategy,
    verificationTarget,
    handleFieldChange,
    handleCreateBeneficiary,
    handleVerification,
    handleResendCode,
  };
}
