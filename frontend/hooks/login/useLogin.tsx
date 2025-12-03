import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { validateEmail, validateOTPCode } from '@/lib/validation';

import { useFormState } from '../useFormState';

export interface LoginFormValues {
  email: string;
  code: string;
  [key: string]: unknown;
}

interface UseLoginReturn {
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
  isLoaded: boolean;
  success: boolean;
  successMessage: string | null;
  isResending: boolean;

  // Handlers
  handleFieldChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCodeChange: (value: string) => void;
  handleSendOTP: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleVerifyOTP: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleResetForm: () => void;
  handlePreviousStep: () => void;
  handleResendCode: () => Promise<void>;
}

export function useLogin(initialValues: LoginFormValues, initialStep = 1): UseLoginReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [step, setStep] = useState(initialStep);
  const router = useRouter();

  const { isLoaded, signIn, setActive } = useSignIn();
  const { formState, updateField, setFieldError, hasError, getError } = useFormState(initialValues);

  const isFormValid = useMemo(() => {
    if (step === 1) {
      return (formState.values.email as string).trim() !== '' && !hasError('email');
    }
    return (
      (formState.values.code as string).trim() !== '' &&
      !hasError('code') &&
      (formState.values.code as string).length === 6
    );
  }, [formState, step, hasError]);

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
    setSuccessMessage(null);
    setIsLoading(false);
  }, []);

  const handleFieldChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      updateField(field, value);

      if (field === 'email') {
        const emailError = validateEmail(value);
        setFieldError('email', emailError);
      }

      if (error) {
        resetState();
      }
    },
    [updateField, setFieldError, error, resetState]
  );

  const handleCodeChange = useCallback(
    (value: string) => {
      updateField('code', value);

      const codeError = validateOTPCode(value);
      setFieldError('code', codeError);

      if (error) {
        resetState();
      }
    },
    [updateField, setFieldError, error, resetState]
  );

  const sendOTP = useCallback(
    async (email: string, isResend = false): Promise<void> => {
      if (!isResend) {
        setIsLoading(true);
      }
      setError(null);
      setSuccess(false);
      setSuccessMessage(null);

      try {
        if (!isLoaded || !signIn) {
          setError("Le service n'est pas prêt. Veuillez réessayer.");
          if (!isResend) {
            setIsLoading(false);
          }
          return;
        }

        await signIn
          .create({
            strategy: 'email_code',
            identifier: email,
          })
          .then(() => {
            setSuccess(true);
            setSuccessMessage('Un code de vérification a été envoyé à votre email.');
            if (!isResend) {
              setStep(2);
            }
          })
          .catch(err => {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Erreur envoi OTP:', errorMessage);
            if (errorMessage.includes("Couldn't find your account")) {
              setError("Aucun compte n'est associé à cette adresse email");
            } else if (errorMessage.includes("You're already signed in")) {
              setError('Vous êtes déjà connecté.');
            } else {
              setError("Une erreur est survenue lors de l'envoi du code OTP");
            }
          });
      } catch (_err) {
        setError('Une erreur inattendue est survenue');
      } finally {
        if (!isResend) {
          setIsLoading(false);
        }
      }
    },
    [isLoaded, signIn, setStep]
  );

  const verifyOTP = useCallback(
    async (code: string) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!isLoaded || !signIn) {
          setError("Le service n'est pas prêt. Veuillez réessayer.");
          setIsLoading(false);
          return;
        }

        await signIn
          .attemptFirstFactor({
            strategy: 'email_code',
            code,
          })
          .then(async result => {
            if (result.status === 'complete') {
              await setActive({ session: result.createdSessionId });
              router.push('/auth-redirect');
            } else {
              setError('Erreur lors de la vérification du code. Veuillez réessayer.');
            }
          })
          .catch(err => {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Erreur vérification OTP:', errorMessage);
            if (
              err &&
              typeof err === 'object' &&
              'errors' in err &&
              Array.isArray(err.errors) &&
              err.errors.length > 0
            ) {
              const clerkError = err.errors[0];
              if (clerkError.code === 'form_code_incorrect') {
                setError('Code incorrect. Veuillez réessayer.');
              } else {
                setError(
                  clerkError.longMessage ||
                    clerkError.message ||
                    'Code incorrect. Veuillez réessayer.'
                );
              }
            } else {
              setError('Code incorrect. Veuillez réessayer.');
            }
          });
      } catch (_err) {
        setError('Une erreur est survenue lors de la vérification du code');
      } finally {
        setIsLoading(false);
      }
    },
    [isLoaded, signIn, setActive, router]
  );

  const handleSendOTP = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const emailValidationError = validateEmail(formState.values.email as string);
      if (emailValidationError) {
        setFieldError('email', emailValidationError);
        return;
      }

      try {
        await sendOTP(formState.values.email as string);
      } catch (error) {
        console.error("Erreur lors de l'envoi:", error);
      }
    },
    [formState.values.email, sendOTP, setFieldError]
  );

  const handleVerifyOTP = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const codeValidationError = validateOTPCode(formState.values.code as string);
      if (codeValidationError) {
        setFieldError('code', codeValidationError);
        return;
      }

      if ((formState.values.code as string).length !== 6) {
        setFieldError('code', 'Le code doit contenir 6 caractères.');
        return;
      }

      await verifyOTP(formState.values.code as string);
    },
    [formState.values.code, verifyOTP, setFieldError]
  );

  const handleResetForm = useCallback(() => {
    resetState();
    setStep(1);
  }, [resetState, setStep]);

  const handlePreviousStep = useCallback(() => {
    resetState();
    setStep(1);
  }, [resetState, setStep]);

  const handleResendCode = useCallback(async () => {
    const email = (formState.values.email as string) || '';
    if (!email.trim()) {
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      await sendOTP(email, true);
    } finally {
      setIsResending(false);
    }
  }, [formState.values.email, sendOTP]);

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
    isLoaded,
    success,
    successMessage,
    isResending,
    handleFieldChange,
    handleCodeChange,
    handleSendOTP,
    handleVerifyOTP,
    handleResetForm,
    handlePreviousStep,
    handleResendCode,
  };
}
