import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { useFormState } from '../useFormState';

export interface RegisterFormValues {
  fullName: string;
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
  // Handlers
  handleFieldChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRegistration: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useRegister(initialValues: RegisterFormValues): UseRegisterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { isLoaded, signUp, setActive } = useSignUp();
  const { formState, updateField, hasError, getError } = useFormState(initialValues);

  const isFormValid = useMemo(() => {
    return (
      (formState.values.fullName as string).trim() !== '' &&
      !hasError('fullName') &&
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
      case 'form_username_invalid':
        return "Nom d'utilisateur invalide.";
      case 'form_username_exists':
        return "Ce nom d'utilisateur est déjà utilisé.";
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
        const signUpAttempt = await signUp.create({
          emailAddress: formState.values.email as string,
          password: formState.values.password as string,
          firstName: (formState.values.fullName as string).split(' ')[0],
          lastName: (formState.values.fullName as string).split(' ').slice(1).join(' '),
        });

        if (signUpAttempt.status === 'complete') {
          await setActive({ session: signUpAttempt.createdSessionId });
          router.push('/dashboard');
        } else {
          setError("Une erreur s'est produite lors de la création du compte. Veuillez réessayer.");
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
        }

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoaded, signUp, setActive, isFormValid, formState.values, router, getErrorMessage]
  );

  return {
    formState,
    updateField,
    hasError,
    getError,
    isFormValid,
    isLoading,
    error,
    isLoaded,
    handleFieldChange,
    handleRegistration,
  };
}
