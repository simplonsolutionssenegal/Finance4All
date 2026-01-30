// frontend/__tests__/lib/api/media.test.ts

import { getMediaById } from '@/lib/api/media';

// Mock de fetch global
global.fetch = jest.fn();

describe('media API', () => {
  const mockMediaId = 'media-123';
  const mockApiUrl = 'http://localhost:3001/api/v1';

  beforeAll(() => {
    process.env.NEXT_PUBLIC_API_URL = mockApiUrl;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getMediaById', () => {
    it('devrait récupérer un media avec succès', async () => {
      const mockMediaData = {
        id: mockMediaId,
        filename: 'image.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        url: 'https://example.com/image.jpg',
      };

      const mockResponse = {
        data: mockMediaData,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await getMediaById(mockMediaId);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(`${mockApiUrl}/media/${mockMediaId}`, {
        cache: 'no-store',
      });
      expect(result).toEqual(mockMediaData);
    });

    it("devrait retourner les données sans wrapper si data n'existe pas", async () => {
      const mockMediaData = {
        id: mockMediaId,
        filename: 'image.jpg',
        mimetype: 'image/jpeg',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockMediaData),
      });

      const result = await getMediaById(mockMediaId);

      expect(result).toEqual(mockMediaData);
    });

    it('devrait utiliser cache: no-store dans la requête', async () => {
      const mockResponse = {
        data: { id: mockMediaId },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await getMediaById(mockMediaId);

      expect(global.fetch).toHaveBeenCalledWith(expect.any(String), {
        cache: 'no-store',
      });
    });

    it("devrait construire l'URL correctement avec l'ID du media", async () => {
      const testId = 'test-media-456';
      const mockResponse = {
        data: { id: testId },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await getMediaById(testId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/media/${testId}`,
        expect.any(Object)
      );
    });

    it("devrait lancer une erreur si la réponse n'est pas ok", async () => {
      const mockErrorResponse = {
        message: 'Media non trouvé',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce(mockErrorResponse),
      });

      await expect(getMediaById(mockMediaId)).rejects.toThrow('Media non trouvé');

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("devrait lancer une erreur par défaut si pas de message d'erreur", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({}),
      });

      await expect(getMediaById(mockMediaId)).rejects.toThrow('Impossible de récupérer le media');
    });

    it('devrait lancer une erreur par défaut si json() échoue', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
      });

      await expect(getMediaById(mockMediaId)).rejects.toThrow('Impossible de récupérer le media');
    });

    it('devrait gérer les erreurs de parsing JSON avec catch', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
      });

      const result = await getMediaById(mockMediaId);

      expect(result).toBeNull();
    });

    it("devrait gérer les réponses avec un statut d'erreur HTTP", async () => {
      const mockErrorResponse = {
        message: 'Erreur serveur interne',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValueOnce(mockErrorResponse),
      });

      await expect(getMediaById(mockMediaId)).rejects.toThrow('Erreur serveur interne');
    });

    it('devrait gérer les réponses 404', async () => {
      const mockErrorResponse = {
        message: 'Media introuvable',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValueOnce(mockErrorResponse),
      });

      await expect(getMediaById(mockMediaId)).rejects.toThrow('Media introuvable');
    });

    it('devrait gérer les réponses 401 non autorisées', async () => {
      const mockErrorResponse = {
        message: 'Non autorisé',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValueOnce(mockErrorResponse),
      });

      await expect(getMediaById(mockMediaId)).rejects.toThrow('Non autorisé');
    });

    it('devrait gérer les réponses avec des données nulles', async () => {
      const mockResponse = {
        data: null,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await getMediaById(mockMediaId);

      expect(result).toEqual(mockResponse);
    });

    it('devrait gérer les réponses avec des données vides', async () => {
      const mockResponse = {
        data: {},
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await getMediaById(mockMediaId);

      expect(result).toEqual({});
    });

    it('devrait gérer les erreurs réseau', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(getMediaById(mockMediaId)).rejects.toThrow('Network error');
    });

    it('devrait gérer les timeouts', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Request timeout'));

      await expect(getMediaById(mockMediaId)).rejects.toThrow('Request timeout');
    });

    it("devrait accepter différents types d'ID", async () => {
      const ids = ['abc-123', '12345', 'media_xyz', 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'];

      for (const id of ids) {
        const mockResponse = {
          data: { id },
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockResponse),
        });

        await getMediaById(id);

        expect(global.fetch).toHaveBeenCalledWith(`${mockApiUrl}/media/${id}`, expect.any(Object));
      }

      expect(global.fetch).toHaveBeenCalledTimes(ids.length);
    });

    it('devrait retourner les données complètes du media', async () => {
      const completeMediaData = {
        data: {
          id: mockMediaId,
          filename: 'document.pdf',
          originalname: 'mon-document.pdf',
          mimetype: 'application/pdf',
          size: 2048000,
          url: 'https://cdn.example.com/documents/document.pdf',
          thumbnailUrl: 'https://cdn.example.com/thumbnails/document-thumb.jpg',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-15T00:00:00.000Z',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(completeMediaData),
      });

      const result = await getMediaById(mockMediaId);

      expect(result).toEqual(completeMediaData.data);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('mimetype');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('url');
    });

    it("devrait utiliser NEXT_PUBLIC_API_URL depuis les variables d'environnement", async () => {
      const customApiUrl = 'https://api.custom.com';
      const originalUrl = process.env.NEXT_PUBLIC_API_URL;
      process.env.NEXT_PUBLIC_API_URL = customApiUrl;

      const mockResponse = {
        data: { id: mockMediaId },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await getMediaById(mockMediaId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${customApiUrl}/media/${mockMediaId}`,
        expect.any(Object)
      );

      // Restaurer l'URL originale
      process.env.NEXT_PUBLIC_API_URL = originalUrl;
    });

    it("devrait gérer les réponses avec des messages d'erreur complexes", async () => {
      const complexErrorResponse = {
        message: 'Validation error',
        errors: [
          { field: 'id', message: 'Invalid ID format' },
          { field: 'permission', message: 'Access denied' },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce(complexErrorResponse),
      });

      await expect(getMediaById(mockMediaId)).rejects.toThrow('Validation error');
    });

    it('devrait retourner null si json() retourne null et ok est true', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(null),
      });

      const result = await getMediaById(mockMediaId);

      expect(result).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('devrait gérer un ID vide', async () => {
      const mockResponse = {
        data: { id: '' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await getMediaById('');

      expect(global.fetch).toHaveBeenCalledWith(`${mockApiUrl}/media/`, expect.any(Object));
    });

    it("devrait gérer des caractères spéciaux dans l'ID", async () => {
      const specialId = 'media-123!@#$%';
      const mockResponse = {
        data: { id: specialId },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await getMediaById(specialId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/media/${specialId}`,
        expect.any(Object)
      );
    });

    it('devrait gérer les IDs très longs', async () => {
      const longId = 'a'.repeat(1000);
      const mockResponse = {
        data: { id: longId },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await getMediaById(longId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/media/${longId}`,
        expect.any(Object)
      );
    });

    it('devrait être une fonction asynchrone', () => {
      const mockResponse = {
        data: { id: mockMediaId },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = getMediaById(mockMediaId);

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('Performance et optimisation', () => {
    it('devrait utiliser no-store pour éviter la mise en cache', async () => {
      const mockResponse = {
        data: { id: mockMediaId },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await getMediaById(mockMediaId);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1]).toHaveProperty('cache', 'no-store');
    });

    it("ne devrait pas ajouter d'autres options de configuration par défaut", async () => {
      const mockResponse = {
        data: { id: mockMediaId },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await getMediaById(mockMediaId);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const options = fetchCall[1];

      expect(Object.keys(options)).toEqual(['cache']);
    });
  });

  describe('Types de réponse', () => {
    it('devrait gérer les différents formats de réponse API', async () => {
      const formats = [
        { data: { id: '1', name: 'test' } },
        { id: '2', name: 'direct' },
        { data: null },
        {},
      ];

      for (const format of formats) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(format),
        });

        const result = await getMediaById(mockMediaId);

        if ('data' in format && format.data !== undefined && format.data !== null) {
          expect(result).toEqual(format.data);
        } else {
          expect(result).toEqual(format);
        }
      }
    });
  });
});
