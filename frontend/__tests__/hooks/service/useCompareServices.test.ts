// src/hooks/service/useCompareServices.test.ts
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { apiClient } from '@/lib/api-client';
import type { ServiceDTO } from '@/types/Service';
import { useCompareServices } from '@/hooks/service/useCompareServices';

// Mocks - IMPORTANT: définir les mocks AVANT de les utiliser
const mockGetToken = jest.fn();
const mockUseAuth = jest.fn();
const mockApiClient = jest.fn();

// Mock les modules
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/lib/api-client', () => ({
  apiClient: (...args: any[]) => mockApiClient(...args),
}));

// Helper pour créer un QueryClient pour les tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

// Helper pour créer un wrapper avec QueryClient
const createWrapper = (queryClient: QueryClient) => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

// Données de test
const mockServices: ServiceDTO[] = [
  {
    id: 'service-1',
    name: 'Transfert Wave',
    longName: 'Transfert Wave National',
    type: 'TRANSFERT_ARGENT',
    montantMin: 100,
    montantMax: 1000000,
    frais: {
      type: 'FIX',
      montantFixe: 500,
    },
    conditionAccess: ["Carte d'identité"],
    plafonds: ['1M par jour'],
    infrastructureAccess: ['Mobile'],
    institution: {
      id: 'inst-1',
      name: 'Wave',
      logoUrl: 'https://example.com/wave.png',
    },
  },
  {
    id: 'service-2',
    name: 'Transfert Orange Money',
    longName: 'Transfert Orange Money National',
    type: 'TRANSFERT_ARGENT',
    montantMin: 50,
    montantMax: 500000,
    frais: {
      type: 'POURCENTAGE',
      pourcentage: 0.02,
      maximum: 2000,
    },
    conditionAccess: ["Carte d'identité"],
    plafonds: ['500K par jour'],
    infrastructureAccess: ['Mobile', 'Agence'],
    institution: {
      id: 'inst-2',
      name: 'Orange Money',
      logoUrl: 'https://example.com/orange.png',
    },
  },
];

describe('useCompareServices', () => {
  const mockToken = 'mock-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
      isLoaded: true,
      isSignedIn: true,
    });
    mockGetToken.mockResolvedValue(mockToken);
  });

  describe('Comportement initial', () => {
    it('devrait retourner un tableau vide par défaut', () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const { result } = renderHook(() => useCompareServices([]), { wrapper });

      expect(result.current.services).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.message).toBeUndefined();
    });

    it('ne devrait pas faire de requête avec moins de 2 services', () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const { result } = renderHook(() => useCompareServices(['service-1']), {
        wrapper,
      });

      expect(result.current.isLoading).toBe(false);
      expect(mockApiClient).not.toHaveBeenCalled();
    });

    it('ne devrait pas faire de requête avec un tableau vide', () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const { result } = renderHook(() => useCompareServices([]), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(mockApiClient).not.toHaveBeenCalled();
    });
  });

  describe('Comparaison de services', () => {
    it('devrait comparer 2 services avec succès', async () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const mockResponse = {
        success: true,
        data: mockServices,
        message: 'Services comparés avec succès',
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCompareServices(['service-1', 'service-2']), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.services).toEqual(mockServices);
      expect(result.current.message).toBe('Services comparés avec succès');
      expect(mockApiClient).toHaveBeenCalledWith(
        'services/compare?ids=service-1,service-2',
        'GET',
        mockToken
      );
      expect(mockApiClient).toHaveBeenCalledTimes(1);
    });

    it('devrait comparer 3 services ou plus', async () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const thirdService = { ...mockServices[0], id: 'service-3', name: 'Service 3' };
      const mockResponse = {
        success: true,
        data: [...mockServices, thirdService],
        message: 'Services comparés avec succès',
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useCompareServices(['service-1', 'service-2', 'service-3']),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.services).toHaveLength(3);
      expect(mockApiClient).toHaveBeenCalledWith(
        'services/compare?ids=service-1,service-2,service-3',
        'GET',
        mockToken
      );
    });

    it('devrait trier les IDs dans la queryKey pour optimiser le cache', async () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const mockResponse = {
        success: true,
        data: mockServices,
        message: 'Services comparés avec succès',
      };

      mockApiClient.mockResolvedValue(mockResponse);

      // Premier appel avec service-2, service-1 (non trié)
      const { result: result1 } = renderHook(() => useCompareServices(['service-2', 'service-1']), {
        wrapper,
      });

      await waitFor(() => expect(result1.current.isSuccess).toBe(true));

      // Deuxième appel avec service-1, service-2 (ordre différent)
      const { result: result2 } = renderHook(() => useCompareServices(['service-1', 'service-2']), {
        wrapper,
      });

      await waitFor(() => expect(result2.current.isSuccess).toBe(true));

      // L'API ne devrait être appelée qu'une fois grâce au tri dans la queryKey
      expect(mockApiClient).toHaveBeenCalledTimes(1);
      expect(result1.current.services).toEqual(mockServices);
      expect(result2.current.services).toEqual(mockServices);
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs réseau', async () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const mockError = new Error('Network error');
      mockApiClient.mockRejectedValue(mockError);

      const { result } = renderHook(() => useCompareServices(['service-1', 'service-2']), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(mockError);
      expect(result.current.services).toEqual([]);
    });

    it('devrait gérer les erreurs de validation (moins de 2 services)', async () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const mockError = new Error(
        'Au moins 2 services doivent être sélectionnés pour la comparaison'
      );
      mockApiClient.mockRejectedValue(mockError);

      const { result } = renderHook(() => useCompareServices(['service-1', 'service-2']), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(mockError);
    });

    it('devrait gérer une réponse API avec success: false', async () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      mockApiClient.mockResolvedValue({
        success: false,
        data: [],
        message: 'Services non trouvés',
      });

      const { result } = renderHook(() => useCompareServices(['service-1', 'service-2']), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.services).toEqual([]);
      expect(result.current.message).toBe('Services non trouvés');
    });

    it('devrait gérer une réponse API sans data', async () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      mockApiClient.mockResolvedValue({
        success: true,
        data: undefined,
        message: 'Réponse vide',
      } as any);

      const { result } = renderHook(() => useCompareServices(['service-1', 'service-2']), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.services).toEqual([]);
    });
  });

  describe('Authentification', () => {
    it('devrait récupérer le token avant de faire la requête', async () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const mockResponse = {
        success: true,
        data: mockServices,
        message: 'Services comparés avec succès',
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCompareServices(['service-1', 'service-2']), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockGetToken).toHaveBeenCalledTimes(1);
      expect(mockApiClient).toHaveBeenCalledWith(
        'services/compare?ids=service-1,service-2',
        'GET',
        mockToken
      );
    });

    it("devrait gérer l'absence de token", async () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      mockGetToken.mockResolvedValue(null);

      const mockResponse = {
        success: true,
        data: mockServices,
        message: 'Services comparés avec succès',
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCompareServices(['service-1', 'service-2']), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient).toHaveBeenCalledWith(
        'services/compare?ids=service-1,service-2',
        'GET',
        null
      );
    });
  });

  describe('États de chargement', () => {
    it('devrait indiquer isLoading pendant le chargement', async () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const mockResponse = {
        success: true,
        data: mockServices,
        message: 'Services comparés avec succès',
      };

      mockApiClient.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
      );

      const { result } = renderHook(() => useCompareServices(['service-1', 'service-2']), {
        wrapper,
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.services).toEqual([]);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.services).toEqual(mockServices);
    });

    it('devrait indiquer isPending au début', async () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const mockResponse = {
        success: true,
        data: mockServices,
        message: 'Services comparés avec succès',
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCompareServices(['service-1', 'service-2']), {
        wrapper,
      });

      expect(result.current.isPending).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.isPending).toBe(false);
    });

    it('devrait exposer tous les états de React Query', async () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const mockResponse = {
        success: true,
        data: mockServices,
        message: 'Services comparés avec succès',
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCompareServices(['service-1', 'service-2']), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current).toHaveProperty('isSuccess');
      expect(result.current).toHaveProperty('isError');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('isPending');
      expect(result.current).toHaveProperty('refetch');
      expect(result.current).toHaveProperty('data');
    });
  });

  describe('Mise en cache', () => {
    it('devrait utiliser le cache pour des requêtes identiques', async () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const mockResponse = {
        success: true,
        data: mockServices,
        message: 'Services comparés avec succès',
      };

      mockApiClient.mockResolvedValue(mockResponse);

      // Premier appel
      const { result: result1 } = renderHook(() => useCompareServices(['service-1', 'service-2']), {
        wrapper,
      });

      await waitFor(() => expect(result1.current.isSuccess).toBe(true));

      expect(mockApiClient).toHaveBeenCalledTimes(1);

      // Deuxième appel avec les mêmes IDs
      const { result: result2 } = renderHook(() => useCompareServices(['service-1', 'service-2']), {
        wrapper,
      });

      await waitFor(() => expect(result2.current.isSuccess).toBe(true));

      // L'API ne devrait toujours être appelée qu'une seule fois grâce au cache
      expect(mockApiClient).toHaveBeenCalledTimes(1);
      expect(result2.current.services).toEqual(mockServices);
    });

    it('devrait faire une nouvelle requête pour des IDs différents', async () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const mockResponse1 = {
        success: true,
        data: [mockServices[0]],
        message: 'Premier appel',
      };

      const mockResponse2 = {
        success: true,
        data: [mockServices[1]],
        message: 'Deuxième appel',
      };

      mockApiClient.mockResolvedValueOnce(mockResponse1).mockResolvedValueOnce(mockResponse2);

      // Premier appel
      const { result: result1 } = renderHook(() => useCompareServices(['service-1', 'service-3']), {
        wrapper,
      });

      await waitFor(() => expect(result1.current.isSuccess).toBe(true));

      expect(mockApiClient).toHaveBeenCalledTimes(1);

      // Deuxième appel avec des IDs différents
      const { result: result2 } = renderHook(() => useCompareServices(['service-2', 'service-4']), {
        wrapper,
      });

      await waitFor(() => expect(result2.current.isSuccess).toBe(true));

      // L'API devrait être appelée deux fois
      expect(mockApiClient).toHaveBeenCalledTimes(2);
    });
  });

  describe('Refetch', () => {
    it('devrait permettre de refetch manuellement', async () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const mockResponse = {
        success: true,
        data: mockServices,
        message: 'Services comparés avec succès',
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCompareServices(['service-1', 'service-2']), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiClient).toHaveBeenCalledTimes(1);

      // Refetch manuel
      await result.current.refetch();

      expect(mockApiClient).toHaveBeenCalledTimes(2);
    });

    it('devrait mettre à jour les données après un refetch', async () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const mockResponse1 = {
        success: true,
        data: mockServices,
        message: 'Premier appel',
      };

      const updatedServices = [{ ...mockServices[0], name: 'Service mis à jour' }, mockServices[1]];

      const mockResponse2 = {
        success: true,
        data: updatedServices,
        message: 'Données mises à jour',
      };

      mockApiClient.mockResolvedValueOnce(mockResponse1).mockResolvedValueOnce(mockResponse2);

      const { result } = renderHook(() => useCompareServices(['service-1', 'service-2']), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.services[0].name).toBe('Transfert Wave');

      // Refetch
      await result.current.refetch();

      await waitFor(() => expect(result.current.services[0].name).toBe('Service mis à jour'));

      expect(result.current.message).toBe('Données mises à jour');
    });
  });

  describe('StaleTime', () => {
    it('devrait respecter le staleTime de 5 minutes', async () => {
      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const mockResponse = {
        success: true,
        data: mockServices,
        message: 'Services comparés avec succès',
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCompareServices(['service-1', 'service-2']), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Vérifier que les données ne sont pas marquées comme stale immédiatement
      expect(result.current.isStale).toBe(false);
    });
  });
});
