import { useCallback } from 'react';

export interface ClerkError {
  code: string;
  message?: string;
}

export interface ClerkErrorResponse {
  errors: ClerkError[];
}

export function useClerkErrorHandler() {
  const getLoginErrorMessage = useCallback((clerkError: ClerkError) => {
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

  const getRegisterErrorMessage = useCallback((clerkError: ClerkError) => {
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

  const handleClerkError = useCallback(
    (err: unknown, errorType: 'login' | 'register' = 'login'): string => {
      let errorMessage = "Une erreur s'est produite.";

      if (err && typeof err === 'object' && 'errors' in err) {
        const clerkError = (err as ClerkErrorResponse).errors[0];
        if (clerkError) {
          errorMessage =
            errorType === 'login'
              ? getLoginErrorMessage(clerkError)
              : getRegisterErrorMessage(clerkError);
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      return errorMessage;
    },
    [getLoginErrorMessage, getRegisterErrorMessage]
  );

  return {
    getLoginErrorMessage,
    getRegisterErrorMessage,
    handleClerkError,
  };
}
