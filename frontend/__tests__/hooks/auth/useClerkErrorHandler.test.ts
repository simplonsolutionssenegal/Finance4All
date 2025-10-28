import { renderHook } from '@testing-library/react';

import { useClerkErrorHandler } from '@/hooks/auth/useClerkErrorHandler';

describe('useClerkErrorHandler', () => {
  let hook: ReturnType<typeof useClerkErrorHandler>;

  beforeEach(() => {
    const { result } = renderHook(() => useClerkErrorHandler());
    hook = result.current;
  });

  describe('getLoginErrorMessage', () => {
    it('returns correct message for form_identifier_not_found', () => {
      const error = { code: 'form_identifier_not_found', message: 'Not found' };
      const message = hook.getLoginErrorMessage(error);
      expect(message).toBe('Email ou mot de passe incorrect.');
    });

    it('returns correct message for form_password_incorrect', () => {
      const error = { code: 'form_password_incorrect', message: 'Wrong password' };
      const message = hook.getLoginErrorMessage(error);
      expect(message).toBe('Email ou mot de passe incorrect.');
    });

    it('returns correct message for form_identifier_exists', () => {
      const error = { code: 'form_identifier_exists', message: 'Exists' };
      const message = hook.getLoginErrorMessage(error);
      expect(message).toBe('Cet email est déjà utilisé.');
    });

    it('returns correct message for form_param_format_invalid', () => {
      const error = { code: 'form_param_format_invalid', message: 'Invalid format' };
      const message = hook.getLoginErrorMessage(error);
      expect(message).toBe("Format de l'email incorrect.");
    });

    it('returns default message for unknown error', () => {
      const error = { code: 'unknown_error', message: 'Custom message' };
      const message = hook.getLoginErrorMessage(error);
      expect(message).toBe('Custom message');
    });

    it('returns fallback message when no message provided', () => {
      const error = { code: 'unknown_error' };
      const message = hook.getLoginErrorMessage(error);
      expect(message).toBe("Une erreur s'est produite lors de la connexion.");
    });
  });

  describe('getRegisterErrorMessage', () => {
    it('returns correct message for form_email_address_invalid', () => {
      const error = { code: 'form_email_address_invalid', message: 'Invalid email' };
      const message = hook.getRegisterErrorMessage(error);
      expect(message).toBe('Adresse email invalide.');
    });

    it('returns correct message for form_password_pwned', () => {
      const error = { code: 'form_password_pwned', message: 'Pwned password' };
      const message = hook.getRegisterErrorMessage(error);
      expect(message).toBe('Ce mot de passe a été compromis. Veuillez en choisir un autre.');
    });

    it('returns correct message for form_email_address_exists', () => {
      const error = { code: 'form_email_address_exists', message: 'Email exists' };
      const message = hook.getRegisterErrorMessage(error);
      expect(message).toBe('Cette adresse email est déjà utilisée.');
    });

    it('returns default message for unknown error', () => {
      const error = { code: 'unknown_error', message: 'Custom message' };
      const message = hook.getRegisterErrorMessage(error);
      expect(message).toBe('Custom message');
    });
  });

  describe('handleClerkError', () => {
    it('handles Clerk error response for login', () => {
      const clerkError = {
        errors: [{ code: 'form_identifier_not_found', message: 'Not found' }],
      };
      const message = hook.handleClerkError(clerkError, 'login');
      expect(message).toBe('Email ou mot de passe incorrect.');
    });

    it('handles Clerk error response for register', () => {
      const clerkError = {
        errors: [{ code: 'form_email_address_exists', message: 'Exists' }],
      };
      const message = hook.handleClerkError(clerkError, 'register');
      expect(message).toBe('Cette adresse email est déjà utilisée.');
    });

    it('handles Error instance', () => {
      const error = new Error('Custom error message');
      const message = hook.handleClerkError(error, 'login');
      expect(message).toBe('Custom error message');
    });

    it('handles unknown error type', () => {
      const error = 'string error';
      const message = hook.handleClerkError(error, 'login');
      expect(message).toBe("Une erreur s'est produite.");
    });

    it('defaults to login error type', () => {
      const clerkError = {
        errors: [{ code: 'form_identifier_not_found', message: 'Not found' }],
      };
      const message = hook.handleClerkError(clerkError);
      expect(message).toBe('Email ou mot de passe incorrect.');
    });
  });
});
