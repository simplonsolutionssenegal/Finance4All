"use client";

import { useClerk, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useCallback, useRef } from "react";

interface UseForgotPasswordReturn {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  successMessage: string | null;
  sendResetLink: (email: string) => Promise<void>;
  resetPassword: (password: string, code: string) => Promise<void>;
  resetState: () => void;
  retryCount: number;
  canRetry: boolean;
}

export const useForgotPassword = (): UseForgotPasswordReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const lastAttemptRef = useRef<number>(0);
  const maxRetries = 3;
  const retryDelay = 60000; // 1 minute

  const { session } = useClerk();
  const { signIn } = useSignIn();
  const router = useRouter();

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
    setSuccessMessage(null);
    setIsLoading(false);
  }, []);

  const canRetry = retryCount < maxRetries && (Date.now() - lastAttemptRef.current) > retryDelay;

  const sendResetLink = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setSuccessMessage(null);
    lastAttemptRef.current = Date.now();

    try {
      // Vérifier si l'utilisateur est déjà connecté
      if (session) {
        setError("Vous êtes déjà connecté. Veuillez utiliser la page de changement de mot de passe dans votre profil.");
        setIsLoading(false);
        return;
      }

      await signIn
        ?.create({
          strategy: 'reset_password_email_code',
          identifier: email,
        })
        .then((_) => {
          setSuccess(true)
          setSuccessMessage("Lien de réinitialisation envoyé avec succès")
          setRetryCount(0) // Reset retry count on success
        })
        .catch((err) => {
          console.error('error', err.errors[0].longMessage)
          setError(err.errors[0].longMessage)
          setRetryCount(prev => prev + 1)
        })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      setRetryCount(prev => prev + 1)
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (password: string, code: string) => {
    await signIn
      ?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      })
      .then((result) => {
        // Password reset successful
        if (result.status === 'complete') {
          setSuccess(true)
          setSuccessMessage("Mot de passe réinitialisé avec succès")
          router.push('/login')
        } else {
          setError("Erreur lors de la réinitialisation du mot de passe")
        }
      })
      .catch((err) => {
        console.error('error', err.errors[0].longMessage)
        setError(err.errors[0].longMessage)
      })
  }

  return {
    isLoading,
    error,
    success,
    successMessage,
    sendResetLink,
    resetPassword,
    resetState,
    retryCount,
    canRetry,
  };
};
