import { renderHook, act, waitFor } from '@testing-library/react';

import { useSocialAuth } from '@/hooks/auth/useSocialAuth';

const mockAuthenticateWithRedirect = jest.fn();

const mockUseSignIn = {
  signIn: {
    authenticateWithRedirect: mockAuthenticateWithRedirect,
  },
  isLoaded: true,
};

const mockUseSignUp = {
  signUp: {
    authenticateWithRedirect: mockAuthenticateWithRedirect,
  },
  isLoaded: true,
};

jest.mock('@clerk/nextjs', () => ({
  useSignIn: jest.fn(() => mockUseSignIn),
  useSignUp: jest.fn(() => mockUseSignUp),
}));

describe('useSocialAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthenticateWithRedirect.mockResolvedValue(undefined);
  });

  describe('login mode', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useSocialAuth('login'));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoaded).toBe(true);
      expect(typeof result.current.handleSocialAuth).toBe('function');
    });

    it('calls signIn.authenticateWithRedirect for google provider', async () => {
      const { result } = renderHook(() => useSocialAuth('login'));

      await act(async () => {
        await result.current.handleSocialAuth('google');
      });

      expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
        strategy: 'oauth_google',
        redirectUrl: '/beneficiaire-dashboard',
        redirectUrlComplete: '/beneficiaire-dashboard',
      });
    });

    it('calls signIn.authenticateWithRedirect for facebook provider', async () => {
      const { result } = renderHook(() => useSocialAuth('login'));

      await act(async () => {
        await result.current.handleSocialAuth('facebook');
      });

      expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
        strategy: 'oauth_facebook',
        redirectUrl: '/beneficiaire-dashboard',
        redirectUrlComplete: '/beneficiaire-dashboard',
      });
    });

    it('calls signIn.authenticateWithRedirect for apple provider', async () => {
      const { result } = renderHook(() => useSocialAuth('login'));

      await act(async () => {
        await result.current.handleSocialAuth('apple');
      });

      expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
        strategy: 'oauth_apple',
        redirectUrl: '/beneficiaire-dashboard',
        redirectUrlComplete: '/beneficiaire-dashboard',
      });
    });

    it('sets loading state during authentication', async () => {
      let resolveAuth: () => void;
      const authPromise = new Promise<void>(resolve => {
        resolveAuth = resolve;
      });
      mockAuthenticateWithRedirect.mockReturnValue(authPromise);

      const { result } = renderHook(() => useSocialAuth('login'));

      const authPromise2 = result.current.handleSocialAuth('google');

      // Loading should be set immediately
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });
      expect(result.current.error).toBeNull();

      // Resolve the promise
      resolveAuth!();
      await authPromise2;

      // Loading should be false after promise resolves
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('handles error when signIn is not loaded', async () => {
      const { useSignIn } = require('@clerk/nextjs');
      useSignIn.mockReturnValueOnce({
        signIn: null,
        isLoaded: false,
      });

      const { result } = renderHook(() => useSocialAuth('login'));

      await act(async () => {
        await result.current.handleSocialAuth('google');
      });

      expect(result.current.error).toBe(
        "Le service d'authentification n'est pas prêt. Veuillez réessayer."
      );
      expect(result.current.isLoading).toBe(false);
    });

    it('handles authentication error and maps "You\'re already signed in"', async () => {
      const error = new Error("You're already signed in");
      mockAuthenticateWithRedirect.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useSocialAuth('login'));

      await act(async () => {
        await result.current.handleSocialAuth('google');
      });

      expect(result.current.error).toBe('Vous êtes déjà connecté.');
      expect(result.current.isLoading).toBe(false);
    });

    it('handles authentication error and maps "Couldn\'t find your account"', async () => {
      const error = new Error("Couldn't find your account");
      mockAuthenticateWithRedirect.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useSocialAuth('login'));

      await act(async () => {
        await result.current.handleSocialAuth('google');
      });

      expect(result.current.error).toBe("Aucun compte n'est associé à cette adresse email");
      expect(result.current.isLoading).toBe(false);
    });

    it('handles generic authentication error', async () => {
      const error = new Error('Generic error');
      mockAuthenticateWithRedirect.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useSocialAuth('login'));

      await act(async () => {
        await result.current.handleSocialAuth('google');
      });

      expect(result.current.error).toBe('Generic error');
      expect(result.current.isLoading).toBe(false);
    });

    it('handles string error', async () => {
      mockAuthenticateWithRedirect.mockRejectedValueOnce('String error');

      const { result } = renderHook(() => useSocialAuth('login'));

      await act(async () => {
        await result.current.handleSocialAuth('google');
      });

      expect(result.current.error).toBe('String error');
      expect(result.current.isLoading).toBe(false);
    });

    it('handles unknown error type', async () => {
      mockAuthenticateWithRedirect.mockRejectedValueOnce({ unknown: 'error' });

      const { result } = renderHook(() => useSocialAuth('login'));

      await act(async () => {
        await result.current.handleSocialAuth('google');
      });

      expect(result.current.error).toBe('Une erreur est survenue lors de la connexion');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('register mode', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useSocialAuth('register'));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoaded).toBe(true);
    });

    it('calls signUp.authenticateWithRedirect for google provider', async () => {
      const { result } = renderHook(() => useSocialAuth('register'));

      await act(async () => {
        await result.current.handleSocialAuth('google');
      });

      expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
        strategy: 'oauth_google',
        redirectUrl: '/beneficiaire-dashboard',
        redirectUrlComplete: '/beneficiaire-dashboard',
      });
    });

    it('handles error when signUp is not loaded', async () => {
      const { useSignUp } = require('@clerk/nextjs');
      useSignUp.mockReturnValueOnce({
        signUp: null,
        isLoaded: false,
      });

      const { result } = renderHook(() => useSocialAuth('register'));

      await act(async () => {
        await result.current.handleSocialAuth('google');
      });

      expect(result.current.error).toBe(
        "Le service d'authentification n'est pas prêt. Veuillez réessayer."
      );
      expect(result.current.isLoading).toBe(false);
    });

    it('handles authentication error in register mode', async () => {
      const error = new Error("You're already signed in");
      mockAuthenticateWithRedirect.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useSocialAuth('register'));

      await act(async () => {
        await result.current.handleSocialAuth('google');
      });

      expect(result.current.error).toBe('Vous êtes déjà connecté.');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('default mode (login)', () => {
    it('defaults to login mode when no mode is provided', () => {
      const { result } = renderHook(() => useSocialAuth());

      expect(result.current.isLoaded).toBe(true);
    });
  });
});
