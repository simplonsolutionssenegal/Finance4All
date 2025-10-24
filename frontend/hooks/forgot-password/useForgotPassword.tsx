'use client';

import { useClerk, useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { validateEmail, validatePassword, validateOTPCode } from '@/lib/validation';

import { useFormState } from '../useFormState';

export interface ForgotPasswordFormValues {
  email: string;
  password: string;
  code: string;
  [key: string]: unknown;
}

interface UseForgotPasswordReturn {
  // Form state
  formState: {
    values: Record<string, unknown>;
    errors: Record<string, string> | Partial<Record<string, string>>;
  };
  updateField: (field: string, value: string) => void;
  setFieldError: (field: string, error: string) => void;
  hasError: (field: string) => boolean;
  getError: (field: string) => string;
  isFormValid: boolean;
  step: number;
  setStep: (step: number) => void;

  // UI state
  isLoading: boolean;
  error: string | null;
  success: boolean;
  successMessage: string | null;

  // Handlers
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCodeChange: (value: string) => void;
  handleSendResetLink: (e: React.FormEvent) => void;
  handleResetPassword: (e: React.FormEvent) => void;
  handleResetForm: () => void;
  handlePreviousStep: () => void;
}

export function useForgotPassword(
  initialValues: ForgotPasswordFormValues,
  initialStep = 1
): UseForgotPasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [step, setStep] = useState(initialStep);

  const { session } = useClerk();
  const { signIn } = useSignIn();
  const router = useRouter();

  const { formState, updateField, setFieldError, hasError, getError } = useFormState(initialValues);

  const isFormValid = useMemo(() => {
    if (step === 1) {
      return (formState.values.email as string).trim() !== '' && !hasError('email');
    }
    return (
      (formState.values.password as string).trim() !== '' &&
      (formState.values.code as string).trim() !== '' &&
      !hasError('password') &&
      !hasError('code')
    );
  }, [formState, step, hasError]);

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
    setSuccessMessage(null);
    setIsLoading(false);
  }, []);

  const sendResetLink = useCallback(
    async (email: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      setSuccessMessage(null);

      try {
        if (session) {
          setError(
            'Vous êtes déjà connecté. Veuillez utiliser la page de changement de mot de passe dans votre profil.'
          );
          setIsLoading(false);
          return;
        }

        await signIn
          ?.create({
            strategy: 'reset_password_email_code',
            identifier: email,
          })
          .then(_ => {
            setSuccess(true);
            setSuccessMessage('Un lien de réinitialisation a été envoyé à votre email.');
            setStep(2);
          })
          .catch(err => {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('errorMessage', errorMessage);
            if (errorMessage.includes("Couldn't find your account")) {
              setError("Aucun compte n'est associé à cette adresse email");
            } else if (errorMessage.includes("You're already signed in")) {
              setError(
                'Vous êtes déjà connecté. Veuillez utiliser la page de changement de mot de passe dans votre profil.'
              );
            } else {
              setError("Une erreur est survenue lors de l'envoi de l'email");
            }
          });
      } catch (_err) {
        setError('Une erreur inattendue est survenue');
      } finally {
        setIsLoading(false);
      }
    },
    [session, signIn, setStep]
  );

  const resetPassword = useCallback(
    async (password: string, code: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await signIn
          ?.attemptFirstFactor({
            strategy: 'reset_password_email_code',
            code,
            password,
          })
          .then(result => {
            if (result.status === 'complete') {
              setSuccess(true);
              setSuccessMessage('Mot de passe réinitialisé avec succès');
              router.push('/');
            } else {
              setError('Erreur lors de la réinitialisation du mot de passe');
            }
          })
          .catch(err => {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('error', errorMessage);
            if (
              errorMessage.includes('Password has been found') ||
              err.errors[0].code === 'form_password_pwned'
            ) {
              setError(
                'Ce mot de passe a été trouvé dans une fuite de données en ligne. Veuillez en choisir un autre.'
              );
            } else {
              setError(err.errors[0].longMessage);
            }
          });
      } catch (_err) {
        setError('Une erreur est survenue lors de la réinitialisation du mot de passe');
      } finally {
        setIsLoading(false);
      }
    },
    [signIn, router]
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateField('email', e.target.value);
      if (error) {
        resetState();
      }
    },
    [updateField, error, resetState]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateField('password', e.target.value);
      if (error) {
        resetState();
      }
    },
    [updateField, error, resetState]
  );

  const handleCodeChange = useCallback(
    (value: string) => {
      updateField('code', value);
      if (error) {
        resetState();
      }
    },
    [updateField, error, resetState]
  );

  const handleSendResetLink = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const emailValidationError = validateEmail(formState.values.email as string);
      if (emailValidationError) {
        setFieldError('email', emailValidationError);
        return;
      }

      try {
        await sendResetLink(formState.values.email as string);
      } catch (error) {
        console.error("Erreur lors de l'envoi:", error);
      }
    },
    [formState.values.email, sendResetLink, setFieldError]
  );

  const handleResetPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const passwordValidationError = validatePassword(formState.values.password as string);
      if (passwordValidationError) {
        setFieldError('password', passwordValidationError);
        return;
      }

      const codeValidationError = validateOTPCode(formState.values.code as string);
      if (codeValidationError) {
        setFieldError('code', codeValidationError);
        return;
      }

      await resetPassword(formState.values.password as string, formState.values.code as string);
    },
    [formState.values.password, formState.values.code, resetPassword, setFieldError]
  );

  const handleResetForm = useCallback(() => {
    resetState();
    setStep(1);
  }, [resetState, setStep]);

  const handlePreviousStep = useCallback(() => {
    resetState();
    setStep(1);
  }, [resetState, setStep]);

  return {
    formState,
    updateField,
    setFieldError,
    hasError,
    getError,
    isFormValid,
    step,
    setStep,
    isLoading,
    error,
    success,
    successMessage,
    handleEmailChange,
    handlePasswordChange,
    handleCodeChange,
    handleSendResetLink,
    handleResetPassword,
    handleResetForm,
    handlePreviousStep,
  };
}
