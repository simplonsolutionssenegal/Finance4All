// frontend/__tests__/hooks/module/useGetModules.test.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { useGetModules } from '@/hooks/module/useGetModules';
import { apiClient } from '@/lib/api-client';
import type { Module } from '@/types/modules/module';
// eslint-disable-next-line no-duplicate-imports
import { DifficultyLevel, ModuleStatus } from '@/types/modules/module';

// Mocks
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api-client', () => ({
  apiClient: jest.fn(),
}));

// eslint-disable-next-line import/order
import { useAuth } from '@clerk/nextjs';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockApiClient = apiClient as jest.MockedFunction<typeof apiClient>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('useGetModules', () => {
  const mockGetToken = jest.fn();

  const mockModule: Module = {
    id: '1',
    title: 'Module Test',
    description: 'Description test',
    imageUrl: 'https://example.com/image.jpg',
    thematics: 'finance',
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: 60,
    status: ModuleStatus.DRAFT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
      isLoaded: true,
      isSignedIn: true,
    } as any);

    mockGetToken.mockResolvedValue('mock-token');
  });

  it('devrait récupérer les modules avec succès', async () => {
    const mockResponse = {
      success: true,
      data: [mockModule],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGetModules({ page: 1, limit: 10 }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.modules).toEqual(mockResponse.data);
    expect(result.current.pagination).toEqual(mockResponse.pagination);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockApiClient).toHaveBeenCalledWith('modules?page=1&limit=10', 'GET', 'mock-token');
  });

  it('devrait utiliser les paramètres par défaut (page=1, limit=10)', async () => {
    const mockResponse = {
      success: true,
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGetModules(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockApiClient).toHaveBeenCalledWith('modules?page=1&limit=10', 'GET', 'mock-token');
  });

  it('devrait retourner un tableau vide si pas de data', async () => {
    mockApiClient.mockResolvedValue({
      success: true,
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    });

    const { result } = renderHook(() => useGetModules(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.modules).toEqual([]);
  });

  it('devrait gérer les erreurs réseau', async () => {
    const mockError = new Error('Network error');
    mockApiClient.mockRejectedValue(mockError);

    const { result } = renderHook(() => useGetModules({ page: 1, limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.modules).toEqual([]);
    expect(result.current.pagination).toBeUndefined();
  });

  it('devrait gérer plusieurs pages', async () => {
    const mockResponse = {
      success: true,
      data: [mockModule],
      pagination: {
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
      },
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGetModules({ page: 2, limit: 5 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pagination?.page).toBe(2);
    expect(result.current.pagination?.limit).toBe(5);
    expect(result.current.pagination?.totalPages).toBe(3);
    expect(mockApiClient).toHaveBeenCalledWith('modules?page=2&limit=5', 'GET', 'mock-token');
  });

  it('devrait permettre de refetch les données', async () => {
    const mockResponse = {
      success: true,
      data: [mockModule],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGetModules({ page: 1, limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockApiClient).toHaveBeenCalledTimes(1);

    // Appeler refetch
    result.current.refetch();

    await waitFor(() => {
      expect(mockApiClient).toHaveBeenCalledTimes(2);
    });
  });

  it('devrait utiliser le cache pour les mêmes paramètres', async () => {
    const mockResponse = {
      success: true,
      data: [mockModule],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };

    mockApiClient.mockResolvedValue(mockResponse);

    // Premier render
    const { result: result1 } = renderHook(() => useGetModules({ page: 1, limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result1.current.isLoading).toBe(false);
    });

    // Deuxième render avec les mêmes params (devrait utiliser le cache)
    const { result: result2 } = renderHook(() => useGetModules({ page: 1, limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result2.current.isLoading).toBe(false);
    });
  });

  it('devrait gérer les changements de paramètres', async () => {
    const mockResponse1 = {
      success: true,
      data: [mockModule],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };

    const mockResponse2 = {
      success: true,
      data: [{ ...mockModule, id: '2', title: 'Module 2' }],
      pagination: {
        page: 2,
        limit: 10,
        total: 2,
        totalPages: 2,
      },
    };

    mockApiClient.mockResolvedValueOnce(mockResponse1).mockResolvedValueOnce(mockResponse2);

    const { result, rerender } = renderHook(
      ({ page }: { page: number }) => useGetModules({ page, limit: 10 }),
      {
        wrapper: createWrapper(),
        initialProps: { page: 1 },
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pagination?.page).toBe(1);

    // Changer la page
    rerender({ page: 2 });

    await waitFor(() => {
      expect(result.current.pagination?.page).toBe(2);
    });

    expect(mockApiClient).toHaveBeenCalledTimes(2);
    expect(mockApiClient).toHaveBeenNthCalledWith(
      1,
      'modules?page=1&limit=10',
      'GET',
      'mock-token'
    );
    expect(mockApiClient).toHaveBeenNthCalledWith(
      2,
      'modules?page=2&limit=10',
      'GET',
      'mock-token'
    );
  });

  it('devrait gérer une réponse avec message', async () => {
    const mockResponse = {
      success: true,
      data: [mockModule],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
      message: 'Modules récupérés avec succès',
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGetModules({ page: 1, limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.modules).toEqual(mockResponse.data);
  });

  it('devrait gérer un token null', async () => {
    mockGetToken.mockResolvedValue(null);

    const mockResponse = {
      success: true,
      data: [mockModule],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGetModules({ page: 1, limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockApiClient).toHaveBeenCalledWith('modules?page=1&limit=10', 'GET', null);
  });

  it('devrait gérer des limites personnalisées', async () => {
    const limits = [5, 20, 50, 100];

    for (const limit of limits) {
      mockApiClient.mockClear();

      const mockResponse = {
        success: true,
        data: Array(limit).fill(mockModule),
        pagination: {
          page: 1,
          limit,
          total: limit,
          totalPages: 1,
        },
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGetModules({ page: 1, limit }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockApiClient).toHaveBeenCalledWith(
        `modules?page=1&limit=${limit}`,
        'GET',
        'mock-token'
      );
      expect(result.current.modules).toHaveLength(limit);
    }
  });
});
