import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { useFormState } from '../useFormState';

export interface LoginFormValues {
  email: string;
  password: string;
  [key: string]: unknown;
}

interface UseLoginReturn {
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
  handleLogin: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function useLogin(initialValues: LoginFormValues): UseLoginReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { isLoaded, signIn, setActive } = useSignIn();
  const { formState, updateField, hasError, getError } = useFormState(initialValues);

  const isFormValid = useMemo(() => {
    return (
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
      case 'form_identifier_not_found':
        return 'Email ou mot de passe incorrect.';
      case 'form_password_incorrect':
        return 'Email ou mot de passe incorrect.';
      case 'form_identifier_exists':
        return 'Cet email est déjà utilisé.';
      case 'form_param_format_invalid':
        return "Format de l'email incorrect.";
      default:
        return clerkError.message || "Une erreur s'est produite lors de la connexion.";
    }
  }, []);

  const handleLogin = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!isLoaded || !signIn) return;
      if (!isFormValid) return;

      setIsLoading(true);
      setError(null);

      try {
        const signInAttempt = await signIn.create({
          identifier: formState.values.email as string,
          password: formState.values.password as string,
        });

        if (signInAttempt.status === 'complete') {
          await setActive({ session: signInAttempt.createdSessionId });
          router.push('/dashboard');
        } else {
          setError("Une erreur s'est produite lors de la connexion. Veuillez réessayer.");
        }
      } catch (err: unknown) {
        console.error('Erreur de connexion:', err);

        let errorMessage = "Une erreur s'est produite lors de la connexion.";

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
    [isLoaded, signIn, setActive, isFormValid, formState.values, router, getErrorMessage]
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
    handleLogin,
  };
}
