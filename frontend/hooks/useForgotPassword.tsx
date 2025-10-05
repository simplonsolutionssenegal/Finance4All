'use client';

import { useClerk, useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

interface UseForgotPasswordReturn {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  successMessage: string | null;
  sendResetLink: (email: string) => Promise<void>;
  resetPassword: (password: string, code: string) => Promise<void>;
  resetState: () => void;
}

export const useForgotPassword = (): UseForgotPasswordReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { session } = useClerk();
  const { signIn } = useSignIn();
  const router = useRouter();

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
    setSuccessMessage(null);
    setIsLoading(false);
  }, []);

  const sendResetLink = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setSuccessMessage(null);

    try {
      // Vérifier si l'utilisateur est déjà connecté
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
  };

  const resetPassword = async (password: string, code: string) => {
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
    }
  };

  return {
    isLoading,
    error,
    success,
    successMessage,
    sendResetLink,
    resetPassword,
    resetState,
  };
};
