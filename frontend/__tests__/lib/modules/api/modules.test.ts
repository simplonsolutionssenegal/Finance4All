// __tests__/api/modules.test.ts
import { createModule, getModules } from '@/lib/api/modules';
import type { Module, CreateModuleData } from '@/types/modules/module';
// eslint-disable-next-line no-duplicate-imports
import { DifficultyLevel, Thematic, ModuleStatus } from '@/types/modules/module';

// Mock de fetch
global.fetch = jest.fn();

describe('API Modules', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
  const API_BASE_URL = 'http://localhost:5000/api/v1';

  beforeEach(() => {
    jest.clearAllMocks();
    // Supprimer les console.warn et console.error pour les tests
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createModule', () => {
    const mockModuleData: CreateModuleData = {
      title: 'Module de test',
      description: 'Description du module',
      imageUrl: 'https://example.com/image.png',
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      thematics: [Thematic.FINANCIAL_EDUCATION],
    };

    const mockModuleResponse: Module = {
      id: 'ac3fba07-67dc-4738-8afe-a42621f38314',
      ...mockModuleData,
      status: ModuleStatus.PUBLISHED,
      imageUrl: 'https://example.com/image.png',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('crée un module avec succès', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockModuleResponse,
        }),
      } as Response);

      const result = await createModule(mockModuleData);

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockModuleData),
      });
      expect(result).toEqual(mockModuleResponse);
    });

    it('envoie les bonnes données dans le body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockModuleResponse,
        }),
      } as Response);

      await createModule(mockModuleData);

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      expect(body).toEqual(mockModuleData);
      expect(body.title).toBe('Module de test');
      expect(body.thematics).toEqual([Thematic.FINANCIAL_EDUCATION]);
    });

    it("lance une erreur quand la réponse n'est pas ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Données invalides',
        }),
      } as Response);

      await expect(createModule(mockModuleData)).rejects.toThrow('Données invalides');
    });

    it("lance une erreur générique si pas de message d'erreur", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response);

      await expect(createModule(mockModuleData)).rejects.toThrow(
        'Erreur lors de la création du module'
      );
    });

    it('gère les erreurs réseau', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(createModule(mockModuleData)).rejects.toThrow('Network error');
    });

    it('envoie le header Content-Type correct', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockModuleResponse,
        }),
      } as Response);

      await createModule(mockModuleData);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1]?.headers).toEqual({
        'Content-Type': 'application/json',
      });
    });
  });

  describe('getModules', () => {
    const mockModules: Module[] = [
      {
        id: 'ac3fba07-67dc-4738-8afe-a42621f38314',
        title: 'Module 1',
        description: 'Description 1',

        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: [Thematic.FINANCIAL_EDUCATION],
        status: ModuleStatus.PUBLISHED,
        imageUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '²b1f4e8d-3c4b-4f5a-9f7e-123456789abc',
        title: 'Module 2',
        description: 'Description 2',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 90,
        thematics: [Thematic.INVESTMENT],
        status: ModuleStatus.PUBLISHED,
        imageUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    it('récupère tous les modules avec succès', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockModules,
        }),
      } as Response);

      const result = await getModules();

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/modules`, {
        cache: 'no-store',
      });
      expect(result).toEqual(mockModules);
      expect(result).toHaveLength(2);
    });

    it('utilise cache: no-store', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockModules,
        }),
      } as Response);

      await getModules();

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1]).toEqual({ cache: 'no-store' });
    });

    it('retourne un tableau vide si aucun module', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
        }),
      } as Response);

      const result = await getModules();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("lance une erreur quand la réponse n'est pas ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          message: 'Erreur serveur',
        }),
      } as Response);

      await expect(getModules()).rejects.toThrow('Erreur serveur');
    });

    it('gère les erreurs HTTP sans message JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as unknown as Response);

      await expect(getModules()).rejects.toThrow('Erreur HTTP 404: Not Found');
    });

    it('gère les erreurs réseau', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getModules()).rejects.toThrow('Network error');
    });

    it('log les tentatives de récupération', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockModules,
        }),
      } as Response);

      await getModules();
    });

    it('log les erreurs', async () => {
      const consoleError = jest.spyOn(console, 'error');

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getModules()).rejects.toThrow();

      expect(consoleError).toHaveBeenCalledWith('Erreur dans getModules:', expect.any(Error));
    });

    it('log les détails des erreurs HTTP', async () => {
      const consoleError = jest.spyOn(console, 'error');
      const errorData = { message: 'Not found', code: 'MODULE_NOT_FOUND' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => errorData,
      } as Response);

      await expect(getModules()).rejects.toThrow();

      expect(consoleError).toHaveBeenCalledWith("Détail de l'erreur:", errorData);
    });
  });

  describe('Configuration API', () => {
    it("utilise l'URL par défaut si NEXT_PUBLIC_API_URL n'est pas défini", async () => {
      delete process.env.NEXT_PUBLIC_API_URL;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
        }),
      } as Response);

      await getModules();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/modules',
        expect.any(Object)
      );
    });

    it('utilise NEXT_PUBLIC_API_URL si défini', async () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.production.com/v1';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
        }),
      } as Response);

      // Réimporter pour prendre en compte la nouvelle variable d'environnement
      jest.resetModules();
      const { getModules: getModulesNew } = require('@/lib/api/modules');

      await getModulesNew();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.production.com/v1/modules',
        expect.any(Object)
      );

      // Nettoyer
      delete process.env.NEXT_PUBLIC_API_URL;
    });
  });
});
