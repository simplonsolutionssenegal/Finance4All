import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { useAuth } from '@clerk/nextjs';
import { useGetServices } from '@/hooks/service/useGetServices';
import { apiClient } from '@/lib/api-client';
import type { ServiceDTO } from '@/types/Service';

// Mock des dépendances
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}));
jest.mock('@/lib/api-client');

const mockUseAuth = useAuth as jest.Mock;
const mockApiClient = apiClient as jest.MockedFunction<typeof apiClient>;

// Helper pour créer un wrapper avec QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

// Mock de données de services
const mockServices: ServiceDTO[] = [
  {
    id: '1',
    name: 'Transfert Wave',
    longName: 'Transfert Wave National',
    type: 'TRANSFERT_ARGENT',
    montantMin: 100,
    montantMax: 1000000,
    frais: {
      type: 'FIX',
      amount: 500,
    },
    conditionAccess: ["Carte d'identité"],
    plafonds: ['1M par jour'],
    infrastructureAccess: ['Mobile', 'Agence'],
    institution: {
      id: 'inst-1',
      name: 'Wave',
      logoUrl: 'https://example.com/wave.png',
    },
  },
  {
    id: '2',
    name: 'Dépôt Orange Money',
    longName: 'Dépôt Orange Money',
    type: 'DEPOT_SIMPLE',
    montantMin: 0,
    montantMax: 500000,
    frais: {
      type: 'FREE',
    },
    conditionAccess: [],
    plafonds: [],
    infrastructureAccess: ['Agence'],
    institution: {
      id: 'inst-2',
      name: 'Orange Money',
      logoUrl: 'https://example.com/om.png',
    },
  },
];

const mockPagination = {
  page: 1,
  limit: 100,
  total: 2,
  totalPages: 1,
};

const mockResponse = {
  success: true,
  data: mockServices,
  pagination: mockPagination,
};

describe('useGetServices', () => {
  const mockGetToken = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
    } as any);
    mockGetToken.mockResolvedValue('mock-token');
  });

  it('devrait récupérer les services avec les paramètres par défaut', async () => {
    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGetServices(), {
      wrapper: createWrapper(),
    });

    // État initial
    expect(result.current.isLoading).toBe(true);
    expect(result.current.services).toEqual([]);

    // Attendre que la requête se termine
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Vérifier les résultats
    expect(result.current.services).toEqual(mockServices);
    expect(result.current.pagination).toEqual(mockPagination);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();

    // Vérifier les appels
    expect(mockGetToken).toHaveBeenCalledTimes(1);
    expect(mockApiClient).toHaveBeenCalledWith('services?page=1&limit=100', 'GET', 'mock-token');
  });

  it('devrait utiliser les paramètres de pagination fournis', async () => {
    mockApiClient.mockResolvedValue({
      ...mockResponse,
      pagination: { ...mockPagination, page: 2, limit: 10 },
    });

    const { result } = renderHook(() => useGetServices({ page: 2, limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient).toHaveBeenCalledWith('services?page=2&limit=10', 'GET', 'mock-token');
    expect(result.current.pagination?.page).toBe(2);
    expect(result.current.pagination?.limit).toBe(10);
  });

  it('devrait filtrer par type de service', async () => {
    const filteredServices = [mockServices[0]];
    mockApiClient.mockResolvedValue({
      success: true,
      data: filteredServices,
      pagination: { ...mockPagination, total: 1 },
    });

    const { result } = renderHook(() => useGetServices({ type: 'TRANSFERT_ARGENT' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient).toHaveBeenCalledWith(
      'services?page=1&limit=100&type=TRANSFERT_ARGENT',
      'GET',
      'mock-token'
    );
    expect(result.current.services).toEqual(filteredServices);
  });

  it('ne devrait pas ajouter le paramètre type si la valeur est "ALL"', async () => {
    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGetServices({ type: 'ALL' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient).toHaveBeenCalledWith('services?page=1&limit=100', 'GET', 'mock-token');
  });

  it('devrait gérer les erreurs', async () => {
    const error = new Error('Failed to fetch services');
    mockApiClient.mockRejectedValue(error);

    const { result } = renderHook(() => useGetServices(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.services).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('devrait retourner un tableau vide si pas de données', async () => {
    mockApiClient.mockResolvedValue({
      success: true,
      data: [],
      pagination: { ...mockPagination, total: 0 },
    });

    const { result } = renderHook(() => useGetServices(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.services).toEqual([]);
    expect(result.current.pagination?.total).toBe(0);
  });

  it('devrait utiliser le bon queryKey pour le cache', async () => {
    mockApiClient.mockResolvedValue(mockResponse);

    // Créer un seul wrapper pour partager le QueryClient
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result: result1 } = renderHook(
      () => useGetServices({ page: 1, limit: 100, type: 'TRANSFERT_ARGENT' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    // Le queryKey devrait être ['services', 1, 50, 'TRANSFERT_ARGENT']
    expect(mockApiClient).toHaveBeenCalledTimes(1);

    // Avec les mêmes paramètres et le même QueryClient, devrait utiliser le cache
    const { result: result2 } = renderHook(
      () => useGetServices({ page: 1, limit: 100, type: 'TRANSFERT_ARGENT' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result2.current.isSuccess).toBe(true);
    });

    // Ne devrait pas faire une nouvelle requête (toujours 1 appel car données en cache)
    expect(mockApiClient).toHaveBeenCalledTimes(1);
  });

  it('devrait gérer le cas où getToken retourne null', async () => {
    mockGetToken.mockResolvedValue(null);
    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGetServices(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient).toHaveBeenCalledWith('services?page=1&limit=100', 'GET', null);
  });

  it('devrait combiner plusieurs paramètres correctement', async () => {
    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useGetServices({ page: 3, limit: 20, type: 'DEPOT_SIMPLE' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient).toHaveBeenCalledWith(
      'services?page=3&limit=20&type=DEPOT_SIMPLE',
      'GET',
      'mock-token'
    );
  });

  it('devrait exposer toutes les propriétés de useQuery', async () => {
    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGetServices(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Vérifier que les propriétés de react-query sont exposées
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isError');
    expect(result.current).toHaveProperty('isSuccess');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('refetch');
    expect(result.current).toHaveProperty('isFetching');
  });

  it('devrait respecter le staleTime de 5 minutes', async () => {
    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGetServices(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Vérifier que le staleTime est configuré (visible via les données non stale)
    expect(result.current.isStale).toBe(false);
  });
});
