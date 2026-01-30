// frontend/__tests__/hooks/module/useCreateModule.test.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { useCreateModule } from '@/hooks/module/useCreateModule';
import { apiClient } from '@/lib/api-client';
import { DifficultyLevel, ModuleStatus } from '@/types/modules/module';
// eslint-disable-next-line no-duplicate-imports
import type { CreateModuleData } from '@/types/modules/module';

// Mocks
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/api-client', () => ({
  apiClient: jest.fn(),
}));

jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: jest.fn(() => ({
    showLoader: jest.fn(),
    hideLoader: jest.fn(),
  })),
}));

// Import des mocks après leur définition
// eslint-disable-next-line import/order
import { useAuth } from '@clerk/nextjs';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockApiClient = apiClient as jest.MockedFunction<typeof apiClient>;
const mockToast = toast as jest.Mocked<typeof toast>;
const mockUseLoader = useLoader as jest.MockedFunction<typeof useLoader>;

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

describe('useCreateModule', () => {
  const mockGetToken = jest.fn();
  const mockShowLoader = jest.fn();
  const mockHideLoader = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useAuth
    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
      isLoaded: true,
      isSignedIn: true,
    } as any);

    // Mock useLoader
    mockUseLoader.mockReturnValue({
      showLoader: mockShowLoader,
      hideLoader: mockHideLoader,
    } as any);

    mockGetToken.mockResolvedValue('mock-token');
  });

  it('devrait créer un module avec succès', async () => {
    const mockModuleData: CreateModuleData = {
      title: 'Test Module',
      description: 'Test Description',
      imageMediaId: 'https://example.com/image.jpg',
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      thematics: 'finance',
    };

    const mockResponse = {
      success: true,
      message: 'Module créé',
      data: {
        id: '1',
        ...mockModuleData,
        status: 'DRAFT' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const onSuccessMock = jest.fn();

    const { result } = renderHook(() => useCreateModule({ onSuccess: onSuccessMock }), {
      wrapper: createWrapper(),
    });

    result.current.createModule(mockModuleData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockShowLoader).toHaveBeenCalledTimes(1);
    expect(mockHideLoader).toHaveBeenCalledTimes(1);
    expect(mockGetToken).toHaveBeenCalledTimes(1);
    expect(mockApiClient).toHaveBeenCalledWith('modules', 'POST', 'mock-token', mockModuleData);
    expect(mockToast.success).toHaveBeenCalledWith('Module créé avec succès!');
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
  });

  it('devrait gérer une réponse en échec du backend', async () => {
    const mockModuleData: CreateModuleData = {
      title: 'Test Module',
      description: 'Test Description',
      imageMediaId: null,
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      estimatedDuration: 90,
      thematics: 'investment',
    };

    const mockResponse = {
      success: false,
      message: 'Titre déjà utilisé',
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCreateModule(), {
      wrapper: createWrapper(),
    });

    result.current.createModule(mockModuleData);

    await waitFor(() => {
      expect(mockHideLoader).toHaveBeenCalled();
    });

    expect(mockToast.error).toHaveBeenCalledWith('La création du module a échoué', {
      description: 'Titre déjà utilisé',
    });
  });

  it('devrait gérer une erreur réseau', async () => {
    const mockModuleData: CreateModuleData = {
      title: 'Test Module',
      description: 'Test Description',
      imageMediaId: null,
      difficultyLevel: DifficultyLevel.ADVANCED,
      estimatedDuration: 120,
      thematics: 'budget_management',
    };

    const mockError = new Error('Network error');
    mockApiClient.mockRejectedValue(mockError);

    const { result } = renderHook(() => useCreateModule(), {
      wrapper: createWrapper(),
    });

    result.current.createModule(mockModuleData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockShowLoader).toHaveBeenCalledTimes(1);
    expect(mockHideLoader).toHaveBeenCalledTimes(1);
    expect(mockToast.error).toHaveBeenCalledWith('La création du module a échoué', {
      description: 'Network error',
    });
  });

  it('devrait invalider le cache des modules après succès', async () => {
    const mockModuleData: CreateModuleData = {
      title: 'Test Module',
      description: 'Test Description',
      imageMediaId: null,
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      thematics: 'financial_education',
    };

    const mockResponse = {
      success: true,
      data: {
        id: '1',
        ...mockModuleData,
        status: 'DRAFT' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCreateModule(), { wrapper: Wrapper });

    result.current.createModule(mockModuleData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['modules'] });
  });

  it('devrait retourner isCreating pendant la création', async () => {
    const mockModuleData: CreateModuleData = {
      title: 'Test Module',
      description: 'Test Description',
      imageMediaId: null,
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      thematics: 'financial_education',
    };

    mockApiClient.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => resolve({ success: true }), 100);
        })
    );

    const { result } = renderHook(() => useCreateModule(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isCreating).toBe(false);

    result.current.createModule(mockModuleData);

    await waitFor(() => {
      expect(result.current.isCreating).toBe(true);
    });

    await waitFor(
      () => {
        expect(result.current.isCreating).toBe(false);
      },
      { timeout: 200 }
    );
  });

  it('ne devrait pas appeler onSuccess si la réponse est en échec', async () => {
    const mockModuleData: CreateModuleData = {
      title: 'Test Module',
      description: 'Test Description',
      imageMediaId: null,
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      thematics: 'financial_education',
    };

    const mockResponse = {
      success: false,
      message: 'Erreur validation',
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const onSuccessMock = jest.fn();

    const { result } = renderHook(() => useCreateModule({ onSuccess: onSuccessMock }), {
      wrapper: createWrapper(),
    });

    result.current.createModule(mockModuleData);

    await waitFor(() => {
      expect(mockHideLoader).toHaveBeenCalled();
    });

    expect(onSuccessMock).not.toHaveBeenCalled();
  });

  it('devrait gérer les erreurs sans message', async () => {
    const mockModuleData: CreateModuleData = {
      title: 'Test Module',
      description: 'Test Description',
      imageMediaId: null,
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      thematics: 'financial_education',
    };

    const mockError = new Error();
    mockApiClient.mockRejectedValue(mockError);

    const { result } = renderHook(() => useCreateModule(), {
      wrapper: createWrapper(),
    });

    result.current.createModule(mockModuleData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockToast.error).toHaveBeenCalledWith('La création du module a échoué', {
      description: 'Une erreur inattendue est survenue.',
    });
  });

  it('devrait fonctionner sans options', async () => {
    const mockModuleData: CreateModuleData = {
      title: 'Test Module',
      description: 'Test Description',
      imageMediaId: null,
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      thematics: 'financial_education',
    };

    const mockResponse = {
      success: true,
      data: {
        id: '1',
        ...mockModuleData,
        status: 'DRAFT' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCreateModule(), {
      wrapper: createWrapper(),
    });

    result.current.createModule(mockModuleData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockToast.success).toHaveBeenCalled();
  });

  it('devrait exposer les propriétés isSuccess, isError et error', async () => {
    const { result } = renderHook(() => useCreateModule(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('devrait gérer plusieurs niveaux de difficulté', async () => {
    const difficultyLevels = [
      DifficultyLevel.BEGINNER,
      DifficultyLevel.INTERMEDIATE,
      DifficultyLevel.ADVANCED,
      DifficultyLevel.EXPERT,
    ];

    for (const level of difficultyLevels) {
      const mockModuleData: CreateModuleData = {
        title: `Module ${level}`,
        description: 'Test Description',
        imageMediaId: null,
        difficultyLevel: level,
        estimatedDuration: 60,
        thematics: 'test',
      };

      const mockResponse = {
        success: true,
        data: {
          id: '1',
          ...mockModuleData,
          status: ModuleStatus.DRAFT,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateModule(), {
        wrapper: createWrapper(),
      });

      result.current.createModule(mockModuleData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    }
  });

  it('devrait gérer imageMediaId comme chaîne', async () => {
    const mockModuleData: CreateModuleData = {
      title: 'Test Module',
      description: 'Test Description',
      imageMediaId: 'media-123-456',
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      thematics: 'financial_education',
    };

    const mockResponse = {
      success: true,
      data: {
        id: '1',
        ...mockModuleData,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCreateModule(), {
      wrapper: createWrapper(),
    });

    result.current.createModule(mockModuleData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient).toHaveBeenCalledWith('modules', 'POST', 'mock-token', mockModuleData);
  });

  it("devrait appeler showLoader avant l'appel API", async () => {
    const mockModuleData: CreateModuleData = {
      title: 'Test Module',
      description: 'Test Description',
      imageMediaId: null,
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      thematics: 'test',
    };

    let showLoaderCalled = false;
    let apiClientCalled = false;

    mockShowLoader.mockImplementation(() => {
      showLoaderCalled = true;
      expect(apiClientCalled).toBe(false); // showLoader doit être appelé avant apiClient
    });

    mockApiClient.mockImplementation(async () => {
      apiClientCalled = true;
      expect(showLoaderCalled).toBe(true); // showLoader doit avoir été appelé
      return { success: true };
    });

    const { result } = renderHook(() => useCreateModule(), {
      wrapper: createWrapper(),
    });

    result.current.createModule(mockModuleData);

    await waitFor(() => {
      expect(mockShowLoader).toHaveBeenCalled();
    });
  });

  it("devrait toujours appeler hideLoader même en cas d'erreur", async () => {
    const mockModuleData: CreateModuleData = {
      title: 'Test Module',
      description: 'Test Description',
      imageMediaId: null,
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      thematics: 'test',
    };

    mockApiClient.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useCreateModule(), {
      wrapper: createWrapper(),
    });

    result.current.createModule(mockModuleData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockHideLoader).toHaveBeenCalledTimes(1);
  });

  it('devrait gérer des durées variées', async () => {
    const durations = [5, 30, 60, 120, 240];

    for (const duration of durations) {
      const mockModuleData: CreateModuleData = {
        title: `Module ${duration}min`,
        description: 'Test Description',
        imageMediaId: null,
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: duration,
        thematics: 'test',
      };

      const mockResponse = {
        success: true,
        data: {
          id: '1',
          ...mockModuleData,
          status: ModuleStatus.DRAFT,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateModule(), {
        wrapper: createWrapper(),
      });

      result.current.createModule(mockModuleData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    }
  });

  it("devrait passer le token d'authentification à apiClient", async () => {
    const mockModuleData: CreateModuleData = {
      title: 'Test Module',
      description: 'Test Description',
      imageMediaId: null,
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      thematics: 'test',
    };

    mockGetToken.mockResolvedValue('custom-auth-token');
    mockApiClient.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useCreateModule(), {
      wrapper: createWrapper(),
    });

    result.current.createModule(mockModuleData);

    await waitFor(() => {
      expect(mockApiClient).toHaveBeenCalledWith(
        'modules',
        'POST',
        'custom-auth-token',
        mockModuleData
      );
    });
  });

  it('devrait gérer des thématiques variées', async () => {
    const thematics = ['finance', 'investment', 'budget', 'savings', 'crypto'];

    for (const thematic of thematics) {
      const mockModuleData: CreateModuleData = {
        title: `Module ${thematic}`,
        description: 'Test Description',
        imageMediaId: null,
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: thematic,
      };

      const mockResponse = {
        success: true,
        data: {
          id: '1',
          ...mockModuleData,
          status: ModuleStatus.DRAFT,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateModule(), {
        wrapper: createWrapper(),
      });

      result.current.createModule(mockModuleData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    }
  });

  it('devrait gérer une réponse sans champ data', async () => {
    const mockModuleData: CreateModuleData = {
      title: 'Test Module',
      description: 'Test Description',
      imageMediaId: null,
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      thematics: 'test',
    };

    const mockResponse = {
      success: true,
      message: 'Module créé',
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCreateModule(), {
      wrapper: createWrapper(),
    });

    result.current.createModule(mockModuleData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockToast.success).toHaveBeenCalledWith('Module créé avec succès!');
  });
});
