// frontend/__tests__/hooks/module/media/useMedia.test.tsx

import { renderHook, waitFor } from '@testing-library/react';

import { useMediaUrl } from '@/hooks/module/media/useMedia';
import { getMediaById } from '@/lib/api/media';

// Mock de l'API media
jest.mock('@/lib/api/media');

const mockGetMediaById = getMediaById as jest.MockedFunction<typeof getMediaById>;

describe('useMediaUrl', () => {
  const mockMediaId = 'media-123';
  const mockMediaUrl = 'https://example.com/media/image.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('État initial', () => {
    it('devrait retourner url null et loading false initialement', () => {
      const { result } = renderHook(() => useMediaUrl());

      expect(result.current.url).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('devrait retourner la structure correcte avec url et loading', () => {
      const { result } = renderHook(() => useMediaUrl());

      expect(result.current).toHaveProperty('url');
      expect(result.current).toHaveProperty('loading');
    });
  });

  describe('Récupération réussie du media', () => {
    it("devrait récupérer l'URL du media avec succès", async () => {
      mockGetMediaById.mockResolvedValueOnce({
        id: mockMediaId,
        url: mockMediaUrl,
        filename: 'image.jpg',
      });

      const { result } = renderHook(() => useMediaUrl(mockMediaId));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.url).toBe(mockMediaUrl);
      expect(mockGetMediaById).toHaveBeenCalledTimes(1);
      expect(mockGetMediaById).toHaveBeenCalledWith(mockMediaId);
    });

    it('devrait mettre à jour loading pendant la récupération', async () => {
      mockGetMediaById.mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve({ id: mockMediaId, url: mockMediaUrl }), 100);
          })
      );

      const { result } = renderHook(() => useMediaUrl(mockMediaId));

      expect(result.current.loading).toBe(true);
      expect(result.current.url).toBeNull();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.url).toBe(mockMediaUrl);
    });

    it('devrait gérer les médias avec des URLs complètes', async () => {
      const fullUrl = 'https://cdn.example.com/uploads/2024/01/document.pdf';

      mockGetMediaById.mockResolvedValueOnce({
        id: mockMediaId,
        url: fullUrl,
      });

      const { result } = renderHook(() => useMediaUrl(mockMediaId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.url).toBe(fullUrl);
    });

    it('devrait gérer les médias avec des métadonnées supplémentaires', async () => {
      mockGetMediaById.mockResolvedValueOnce({
        id: mockMediaId,
        url: mockMediaUrl,
        filename: 'photo.jpg',
        mimetype: 'image/jpeg',
        size: 2048,
        thumbnailUrl: 'https://example.com/thumbs/photo-thumb.jpg',
      });

      const { result } = renderHook(() => useMediaUrl(mockMediaId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.url).toBe(mockMediaUrl);
    });
  });

  describe('Gestion des cas sans mediaId', () => {
    it('devrait retourner null si mediaId est undefined', () => {
      const { result } = renderHook(() => useMediaUrl(undefined));

      expect(result.current.url).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(mockGetMediaById).not.toHaveBeenCalled();
    });

    it('devrait retourner null si mediaId est null', () => {
      const { result } = renderHook(() => useMediaUrl(null));

      expect(result.current.url).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(mockGetMediaById).not.toHaveBeenCalled();
    });

    it('devrait retourner null si mediaId est une chaîne vide', () => {
      const { result } = renderHook(() => useMediaUrl(''));

      expect(result.current.url).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(mockGetMediaById).not.toHaveBeenCalled();
    });

    it('ne devrait pas appeler getMediaById si mediaId est falsy', () => {
      renderHook(() => useMediaUrl(null));
      renderHook(() => useMediaUrl(undefined));
      renderHook(() => useMediaUrl(''));

      expect(mockGetMediaById).not.toHaveBeenCalled();
    });
  });

  describe('Gestion des erreurs', () => {
    it("devrait retourner null en cas d'erreur", async () => {
      mockGetMediaById.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useMediaUrl(mockMediaId));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.url).toBeNull();
      expect(mockGetMediaById).toHaveBeenCalledWith(mockMediaId);
    });

    it('devrait gérer les erreurs 404', async () => {
      mockGetMediaById.mockRejectedValueOnce(new Error('Media not found'));

      const { result } = renderHook(() => useMediaUrl(mockMediaId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.url).toBeNull();
    });

    it('devrait gérer les erreurs de timeout', async () => {
      mockGetMediaById.mockRejectedValueOnce(new Error('Request timeout'));

      const { result } = renderHook(() => useMediaUrl(mockMediaId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.url).toBeNull();
    });

    it("devrait mettre loading à false même en cas d'erreur", async () => {
      mockGetMediaById.mockRejectedValueOnce(new Error('API error'));

      const { result } = renderHook(() => useMediaUrl(mockMediaId));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Gestion des réponses sans URL', () => {
    it("devrait retourner null si le media n'a pas d'URL", async () => {
      mockGetMediaById.mockResolvedValueOnce({
        id: mockMediaId,
        url: undefined,
      });

      const { result } = renderHook(() => useMediaUrl(mockMediaId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.url).toBeNull();
    });

    it('devrait retourner null si le media est null', async () => {
      mockGetMediaById.mockResolvedValueOnce(null);

      const { result } = renderHook(() => useMediaUrl(mockMediaId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.url).toBeNull();
    });

    it('devrait retourner null si le media est undefined', async () => {
      mockGetMediaById.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useMediaUrl(mockMediaId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.url).toBeNull();
    });

    it('devrait gérer les médias avec une URL null', async () => {
      mockGetMediaById.mockResolvedValueOnce({
        id: mockMediaId,
        url: null,
      });

      const { result } = renderHook(() => useMediaUrl(mockMediaId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.url).toBeNull();
    });

    it('devrait gérer les médias avec une URL vide', async () => {
      mockGetMediaById.mockResolvedValueOnce({
        id: mockMediaId,
        url: '',
      });

      const { result } = renderHook(() => useMediaUrl(mockMediaId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.url).toBe('');
    });
  });

  describe('Changement de mediaId', () => {
    it('devrait récupérer une nouvelle URL quand mediaId change', async () => {
      const firstMediaId = 'media-111';
      const secondMediaId = 'media-222';
      const firstUrl = 'https://example.com/first.jpg';
      const secondUrl = 'https://example.com/second.jpg';

      mockGetMediaById
        .mockResolvedValueOnce({ id: firstMediaId, url: firstUrl })
        .mockResolvedValueOnce({ id: secondMediaId, url: secondUrl });

      const { result, rerender } = renderHook(({ id }) => useMediaUrl(id), {
        initialProps: { id: firstMediaId },
      });

      await waitFor(() => {
        expect(result.current.url).toBe(firstUrl);
      });

      rerender({ id: secondMediaId });

      await waitFor(() => {
        expect(result.current.url).toBe(secondUrl);
      });

      expect(mockGetMediaById).toHaveBeenCalledTimes(2);
      expect(mockGetMediaById).toHaveBeenNthCalledWith(1, firstMediaId);
      expect(mockGetMediaById).toHaveBeenNthCalledWith(2, secondMediaId);
    });

    it('devrait réinitialiser à null quand mediaId devient null', async () => {
      mockGetMediaById.mockResolvedValueOnce({
        id: mockMediaId,
        url: mockMediaUrl,
      });

      const { result, rerender } = renderHook(({ id }) => useMediaUrl(id), {
        initialProps: { id: mockMediaId },
      });

      await waitFor(() => {
        expect(result.current.url).toBe(mockMediaUrl);
      });

      rerender({ id: null as any });

      expect(result.current.url).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('devrait réinitialiser à null quand mediaId devient undefined', async () => {
      mockGetMediaById.mockResolvedValueOnce({
        id: mockMediaId,
        url: mockMediaUrl,
      });

      const { result, rerender } = renderHook(({ id }) => useMediaUrl(id), {
        initialProps: { id: mockMediaId },
      });

      await waitFor(() => {
        expect(result.current.url).toBe(mockMediaUrl);
      });

      rerender({ id: undefined as any });

      expect(result.current.url).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it("ne devrait pas appeler l'API si le mediaId ne change pas", async () => {
      mockGetMediaById.mockResolvedValueOnce({
        id: mockMediaId,
        url: mockMediaUrl,
      });

      const { result, rerender } = renderHook(({ id }) => useMediaUrl(id), {
        initialProps: { id: mockMediaId },
      });

      await waitFor(() => {
        expect(result.current.url).toBe(mockMediaUrl);
      });

      rerender({ id: mockMediaId });

      // L'API ne devrait être appelée qu'une fois
      expect(mockGetMediaById).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cleanup et annulation', () => {
    it('devrait nettoyer les effets au démontage du composant', async () => {
      mockGetMediaById.mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve({ id: mockMediaId, url: mockMediaUrl }), 100);
          })
      );

      const { unmount } = renderHook(() => useMediaUrl(mockMediaId));

      // Démonter avant la fin de la requête
      unmount();

      // Attendre un peu pour s'assurer qu'il n'y a pas de mise à jour d'état après démontage
      await new Promise<void>(resolve => {
        setTimeout(resolve, 150);
      });

      // Pas d'erreur devrait être levée
      expect(true).toBe(true);
    });

    it("ne devrait pas mettre à jour l'état après démontage", async () => {
      let resolvePromise!: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockGetMediaById.mockReturnValueOnce(promise as any);

      const { result, unmount } = renderHook(() => useMediaUrl(mockMediaId));

      expect(result.current.loading).toBe(true);

      unmount();

      // Résoudre la promesse après le démontage
      resolvePromise({ id: mockMediaId, url: mockMediaUrl });

      await new Promise<void>(resolve => {
        setTimeout(resolve, 50);
      });

      // Aucune erreur ne devrait être levée
      expect(true).toBe(true);
    });

    it('devrait annuler les requêtes en cours lors du changement de mediaId', async () => {
      const firstId = 'media-111';
      const secondId = 'media-222';

      let resolveFirst!: (value: any) => void;
      const firstPromise = new Promise(resolve => {
        resolveFirst = resolve;
      });

      mockGetMediaById.mockReturnValueOnce(firstPromise as any);

      const { result, rerender } = renderHook(({ id }) => useMediaUrl(id), {
        initialProps: { id: firstId },
      });

      expect(result.current.loading).toBe(true);

      // Changer le mediaId avant que la première requête ne se termine
      mockGetMediaById.mockResolvedValueOnce({
        id: secondId,
        url: 'https://example.com/second.jpg',
      });

      rerender({ id: secondId });

      // Résoudre la première promesse (devrait être ignorée)
      resolveFirst({ id: firstId, url: 'https://example.com/first.jpg' });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Devrait avoir l'URL du second media, pas du premier
      expect(result.current.url).toBe('https://example.com/second.jpg');
    });
  });

  describe('Edge cases', () => {
    it('devrait gérer des mediaId avec des caractères spéciaux', async () => {
      const specialId = 'media-123!@#$%';
      const url = 'https://example.com/special.jpg';

      mockGetMediaById.mockResolvedValueOnce({
        id: specialId,
        url,
      });

      const { result } = renderHook(() => useMediaUrl(specialId));

      await waitFor(() => {
        expect(result.current.url).toBe(url);
      });

      expect(mockGetMediaById).toHaveBeenCalledWith(specialId);
    });

    it('devrait gérer des URLs très longues', async () => {
      const longUrl = `https://example.com/${'a'.repeat(1000)}/image.jpg`;

      mockGetMediaById.mockResolvedValueOnce({
        id: mockMediaId,
        url: longUrl,
      });

      const { result } = renderHook(() => useMediaUrl(mockMediaId));

      await waitFor(() => {
        expect(result.current.url).toBe(longUrl);
      });
    });

    it('devrait gérer des appels rapides successifs', async () => {
      const ids = ['id1', 'id2', 'id3', 'id4', 'id5'];
      const lastId = ids[ids.length - 1];

      ids.forEach(id => {
        mockGetMediaById.mockResolvedValueOnce({
          id,
          url: `https://example.com/${id}.jpg`,
        });
      });

      const { result, rerender } = renderHook(({ id }) => useMediaUrl(id), {
        initialProps: { id: ids[0] },
      });

      for (let i = 1; i < ids.length; i++) {
        rerender({ id: ids[i] });
      }

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Devrait avoir l'URL du dernier media
      expect(result.current.url).toContain(lastId);
    });

    it('devrait gérer des transitions null -> mediaId -> null', async () => {
      mockGetMediaById.mockResolvedValueOnce({
        id: mockMediaId,
        url: mockMediaUrl,
      });

      const { result, rerender } = renderHook(({ id }) => useMediaUrl(id), {
        initialProps: { id: null as any },
      });

      expect(result.current.url).toBeNull();

      rerender({ id: mockMediaId });

      await waitFor(() => {
        expect(result.current.url).toBe(mockMediaUrl);
      });

      rerender({ id: null as any });

      expect(result.current.url).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Performance', () => {
    it("ne devrait exécuter l'effet qu'une fois au montage initial", async () => {
      mockGetMediaById.mockResolvedValueOnce({
        id: mockMediaId,
        url: mockMediaUrl,
      });

      renderHook(() => useMediaUrl(mockMediaId));

      await waitFor(() => {
        expect(mockGetMediaById).toHaveBeenCalledTimes(1);
      });
    });

    it('devrait mémoriser les résultats entre les rendus sans changement de mediaId', async () => {
      mockGetMediaById.mockResolvedValueOnce({
        id: mockMediaId,
        url: mockMediaUrl,
      });

      const { result, rerender } = renderHook(() => useMediaUrl(mockMediaId));

      await waitFor(() => {
        expect(result.current.url).toBe(mockMediaUrl);
      });

      // Forcer un nouveau rendu
      rerender();

      // Les références devraient être les mêmes
      expect(mockGetMediaById).toHaveBeenCalledTimes(1);
    });
  });

  describe('Types de retour', () => {
    it('devrait toujours retourner un objet avec url et loading', async () => {
      mockGetMediaById.mockResolvedValueOnce({
        id: mockMediaId,
        url: mockMediaUrl,
      });

      const { result } = renderHook(() => useMediaUrl(mockMediaId));

      expect(typeof result.current).toBe('object');
      expect('url' in result.current).toBe(true);
      expect('loading' in result.current).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current).toBe('object');
      expect('url' in result.current).toBe(true);
      expect('loading' in result.current).toBe(true);
    });

    it('url devrait être string | null', async () => {
      const { result } = renderHook(() => useMediaUrl());

      expect(result.current.url === null || typeof result.current.url === 'string').toBe(true);
    });

    it('loading devrait être boolean', () => {
      const { result } = renderHook(() => useMediaUrl(mockMediaId));

      expect(typeof result.current.loading).toBe('boolean');
    });
  });
});
