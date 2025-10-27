import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { useCreateBeneficiary } from '../beneficiary/useCreateBeneficiary';
import { useFormState } from '../useFormState';

export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  [key: string]: unknown;
}

interface UseRegisterReturn {
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
  // Handlers
  handleFieldChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRegistration: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleVerification: (code: string) => Promise<void>;
  handleResendCode: () => Promise<void>;
}

export function useRegister(initialValues: RegisterFormValues): UseRegisterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOtpVerification, setIsOtpVerification] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const { isLoaded, signUp } = useSignUp();
  const { formState, updateField, hasError, getError } = useFormState(initialValues);
  const createBeneficiaryMutation = useCreateBeneficiary();

  const isFormValid = useMemo(() => {
    return (
      (formState.values.firstName as string).trim() !== '' &&
      !hasError('firstName') &&
      (formState.values.lastName as string).trim() !== '' &&
      !hasError('lastName') &&
      (formState.values.phone as string).trim() !== '' &&
      !hasError('phone') &&
      (formState.values.email as string).trim() !== '' &&
      !hasError('email') &&
      (formState.values.password as string).trim() !== '' &&
      !hasError('password')
    );
  }, [formState, hasError]);

  const resetState = useCallback(() => {
    setError(null);
  }, []);

  const handleFieldChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      updateField(field, e.target.value);
      if (error) {
        resetState();
      }
    },
    [updateField, error, resetState]
  );

  const getErrorMessage = useCallback((clerkError: { code: string; message?: string }) => {
    switch (clerkError.code) {
      case 'form_email_address_invalid':
        return 'Adresse email invalide.';
      case 'form_password_pwned':
        return 'Ce mot de passe a été compromis. Veuillez en choisir un autre.';
      case 'form_password_size_in_bytes':
        return 'Le mot de passe est trop long.';
      case 'form_password_validation_failed':
        return 'Le mot de passe ne respecte pas les critères requis.';
      case 'form_email_address_exists':
        return 'Cette adresse email est déjà utilisée.';
      default:
        return clerkError.message || "Une erreur s'est produite lors de la création du compte.";
    }
  }, []);

  const handleRegistration = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!isLoaded || !signUp) return;
      if (!isFormValid) return;

      setIsLoading(true);
      setError(null);

      try {
        // 1. Créer le compte utilisateur dans Clerk avec toutes les informations
        const signUpAttempt = await signUp.create({
          emailAddress: formState.values.email as string,
          password: formState.values.password as string,
          firstName: formState.values.firstName as string,
          lastName: formState.values.lastName as string,
        });

        if (signUpAttempt.status === 'complete') {
          // 2. Récupérer l'ID de l'utilisateur créé dans Clerk
          const clerkUserId = signUpAttempt.createdUserId || signUp?.id;

          if (!clerkUserId) {
            throw new Error("Impossible de récupérer l'ID de l'utilisateur créé");
          }

          // 3. Créer le bénéficiaire dans notre base de données
          await createBeneficiaryMutation.mutateAsync({
            clerkUserId,
            name: `${formState.values.firstName} ${formState.values.lastName}`,
            email: formState.values.email as string,
            phoneNumber: formState.values.phone as string,
          });

          // 4. Rediriger vers le login
          router.push('/login');
        } else if (signUpAttempt.status === 'missing_requirements') {
          // Envoyer le code de vérification par email
          await signUpAttempt.prepareEmailAddressVerification({ strategy: 'email_code' });

          setIsOtpVerification(true);
          setError(null);
        } else {
          setError(`Status d'inscription: ${signUpAttempt.status}. Veuillez réessayer.`);
        }
      } catch (err: unknown) {
        console.error('Erreur de création de compte:', err);

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
    [
      isLoaded,
      signUp,
      isFormValid,
      formState.values,
      router,
      getErrorMessage,
      createBeneficiaryMutation,
    ]
  );

  const handleVerification = useCallback(
    async (code: string) => {
      if (!isLoaded || !signUp || !code.trim()) return;

      setIsVerifying(true);
      setVerificationError(null);

      try {
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: code.trim(),
        });

        if (completeSignUp.status === 'complete') {
          // Récupérer l'ID de l'utilisateur créé dans Clerk
          const clerkUserId = completeSignUp.createdUserId || signUp?.id;

          if (!clerkUserId) {
            throw new Error("Impossible de récupérer l'ID de l'utilisateur créé");
          }

          // Créer le bénéficiaire dans notre base de données
          await createBeneficiaryMutation.mutateAsync({
            clerkUserId,
            name: `${formState.values.firstName} ${formState.values.lastName}`,
            email: formState.values.email as string,
            phoneNumber: formState.values.phone as string,
          });

          // Rediriger vers le login
          router.push('/login');
        } else if (completeSignUp.status === 'missing_requirements') {
          // Vérifier s'il y a d'autres requirements manquants
          if (completeSignUp.unverifiedFields && completeSignUp.unverifiedFields.length > 0) {
            setVerificationError(
              'Vérification incomplète. Veuillez vérifier tous les champs requis.'
            );
          } else {
            const clerkUserId = completeSignUp.createdUserId || signUp?.id;

            if (clerkUserId) {
              // Créer le bénéficiaire dans notre base de données
              await createBeneficiaryMutation.mutateAsync({
                clerkUserId,
                name: `${formState.values.firstName} ${formState.values.lastName}`,
                email: formState.values.email as string,
                phoneNumber: formState.values.phone as string,
              });

              // Rediriger vers le login
              router.push('/login');
            } else {
              setVerificationError('Erreur lors de la création du compte. Veuillez réessayer.');
            }
          }
        } else {
          setVerificationError(
            `Status de vérification inattendu: ${completeSignUp.status}. Veuillez réessayer.`
          );
        }
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
    [isLoaded, signUp, formState.values, router, createBeneficiaryMutation]
  );

  const handleResendCode = useCallback(async () => {
    if (!isLoaded || !signUp) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur inconnue s'est produite";
      console.error("Erreur lors de l'envoi du nouveau code:", err);
      setVerificationError(
        `Erreur lors de l'envoi du nouveau code: ${errorMessage}. Veuillez réessayer.`
      );
    }
  }, [isLoaded, signUp]);

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
    handleFieldChange,
    handleRegistration,
    handleVerification,
    handleResendCode,
  };
}
