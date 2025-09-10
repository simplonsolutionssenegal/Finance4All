import { apiClient, ApiClient } from '@/lib/api';

// Mock fetch
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('forgotPassword', () => {
    it('should make correct API call and return success response', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Lien de réinitialisation envoyé avec succès',
        data: { success: true },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await apiClient.forgotPassword('test@example.com');

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/auth/forgot-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle API error response', async () => {
      const mockErrorResponse = {
        status: 'error',
        message: 'Format d\'email invalide',
        data: { success: false },
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue(mockErrorResponse),
      } as any);

      const result = await apiClient.forgotPassword('test@example.com');

      expect(result).toEqual({
        status: 'error',
        message: 'Format d\'email invalide',
        data: { success: false },
      });
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Erreur de connexion au serveur'));

      const result = await apiClient.forgotPassword('test@example.com');

      expect(result).toEqual({
        status: 'error',
        message: 'Erreur de connexion au serveur',
      });
    });

    it('should handle unknown error', async () => {
      mockFetch.mockRejectedValueOnce('Unknown error');

      const result = await apiClient.forgotPassword('test@example.com');

      expect(result).toEqual({
        status: 'error',
        message: 'Erreur réseau inconnue',
      });
    });
  });

  describe('resetPassword', () => {
    it('should make correct API call and return success response', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Mot de passe réinitialisé avec succès',
        data: { success: true },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await apiClient.resetPassword('user123', 'newPassword123');

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/auth/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 'user123', newPassword: 'newPassword123' }),
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle API error response', async () => {
      const mockErrorResponse = {
        status: 'error',
        message: 'Le mot de passe ne respecte pas la politique de sécurité',
        data: { success: false },
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue(mockErrorResponse),
      } as any);

      const result = await apiClient.resetPassword('user123', 'newPassword123');

      expect(result).toEqual({
        status: 'error',
        message: 'Le mot de passe ne respecte pas la politique de sécurité',
        data: { success: false },
      });
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Erreur de connexion au serveur'));

      const result = await apiClient.resetPassword('user123', 'newPassword123');

      expect(result).toEqual({
        status: 'error',
        message: 'Erreur de connexion au serveur',
      });
    });

    it('should handle HTTP error without message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({}),
      } as any);

      const result = await apiClient.resetPassword('user123', 'newPassword123');

      expect(result).toEqual({
        status: 'error',
        message: 'Erreur HTTP 400',
        data: undefined,
      });
    });
  });

  describe('custom base URL', () => {
    it('should use custom base URL when provided', async () => {
      const customApiClient = new ApiClient('https://custom-api.com/api/v1');
      
      const mockResponse = {
        status: 'success',
        message: 'Success',
        data: { success: true },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      await customApiClient.forgotPassword('test@example.com');

      expect(mockFetch).toHaveBeenCalledWith('https://custom-api.com/api/v1/auth/forgot-password', expect.any(Object));
    });
  });
});
