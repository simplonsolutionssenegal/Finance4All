import { useSignIn, useSignUp } from '@clerk/nextjs';
import { useCallback, useState } from 'react';

export type SocialAuthProvider = 'google' | 'facebook' | 'apple';
export type SocialAuthMode = 'login' | 'register';

type OAuthStrategy = 'oauth_google' | 'oauth_facebook' | 'oauth_apple';

interface UseSocialAuthReturn {
  handleSocialAuth: (provider: SocialAuthProvider) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isLoaded: boolean;
}

export function useSocialAuth(mode: SocialAuthMode = 'login'): UseSocialAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();

  const isLoaded = mode === 'login' ? signInLoaded : signUpLoaded;

  const getStrategy = useCallback((provider: SocialAuthProvider): OAuthStrategy => {
    const strategies: Record<SocialAuthProvider, OAuthStrategy> = {
      google: 'oauth_google',
      facebook: 'oauth_facebook',
      apple: 'oauth_apple',
    };
    return strategies[provider];
  }, []);

  const handleSocialAuth = useCallback(
    async (provider: SocialAuthProvider) => {
      setIsLoading(true);
      setError(null);

      try {
        const strategy = getStrategy(provider);

        if (mode === 'login') {
          if (!signIn || !signInLoaded) {
            setError("Le service d'authentification n'est pas prêt. Veuillez réessayer.");
            setIsLoading(false);
            return;
          }

          await signIn.authenticateWithRedirect({
            strategy,
            redirectUrl: '/beneficiaire-dashboard',
            redirectUrlComplete: '/beneficiaire-dashboard',
          });
        } else {
          // Mode register
          if (!signUp || !signUpLoaded) {
            setError("Le service d'authentification n'est pas prêt. Veuillez réessayer.");
            setIsLoading(false);
            return;
          }

          await signUp.authenticateWithRedirect({
            strategy,
            redirectUrl: '/beneficiaire-dashboard',
            redirectUrlComplete: '/beneficiaire-dashboard',
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === 'string'
              ? err
              : 'Une erreur est survenue lors de la connexion';

        let clerkErrorMessage = errorMessage;
        if (errorMessage.includes("You're already signed in")) {
          clerkErrorMessage = 'Vous êtes déjà connecté.';
        } else if (errorMessage.includes("Couldn't find your account")) {
          clerkErrorMessage = "Aucun compte n'est associé à cette adresse email";
        }

        setError(clerkErrorMessage);
        setIsLoading(false);
      }
    },
    [mode, signIn, signInLoaded, signUp, signUpLoaded, getStrategy]
  );

  return {
    handleSocialAuth,
    isLoading,
    error,
    isLoaded,
  };
}
