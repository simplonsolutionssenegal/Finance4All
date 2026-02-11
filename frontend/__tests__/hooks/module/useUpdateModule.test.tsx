// frontend/__tests__/hooks/module/useUpdateModule.test.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { useUpdateModule } from '@/hooks/module/useUpdateModule';
import { apiClient } from '@/lib/api-client';
import { DifficultyLevel, ModuleStatus } from '@/types/modules/module';
// eslint-disable-next-line no-duplicate-imports
import type { UpdateModuleData } from '@/types/modules/module';

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
  useLoader: jest.fn(),
}));

// Import des mocks après leur définition
// eslint-disable-next-line import/order
import { useAuth } from '@clerk/nextjs';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockApiClient = apiClient as jest.MockedFunction<typeof apiClient>;
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

describe('useUpdateModule', () => {
  const mockGetToken = jest.fn();
  const mockShowLoader = jest.fn();
  const mockHideLoader = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
      isLoaded: true,
      isSignedIn: true,
    } as any);

    mockUseLoader.mockReturnValue({
      showLoader: mockShowLoader,
      hideLoader: mockHideLoader,
    } as any);

    mockGetToken.mockResolvedValue('mock-token');
  });

  it('devrait modifier un module avec succès', async () => {
    const mockUpdateData: UpdateModuleData = {
      title: 'Module Modifié',
      description: 'Description Modifiée',
      difficultyLevel: DifficultyLevel.ADVANCED,
      estimatedDuration: 90,
    };

    const mockResponse = {
      success: true,
      message: 'Module modifié',
      data: {
        id: 'module-123',
        title: 'Module Modifié',
        description: 'Description Modifiée',
        thematics: 'Finance',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
        imageMediaId: 'media-456',
        lessons: [],
        quizzes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const onSuccessMock = jest.fn();

    const { result } = renderHook(() => useUpdateModule({ onSuccess: onSuccessMock }), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.updateModule({ id: 'module-123', data: mockUpdateData });
    });

    await waitFor(() => {
      expect(mockHideLoader).toHaveBeenCalled();
    });

    expect(mockShowLoader).toHaveBeenCalledTimes(1);
    expect(mockHideLoader).toHaveBeenCalledTimes(1);
    expect(mockGetToken).toHaveBeenCalledTimes(1);
    expect(mockApiClient).toHaveBeenCalledWith(
      'modules/module-123',
      'PUT',
      'mock-token',
      mockUpdateData
    );
    expect(toast.success).toHaveBeenCalledWith('Module modifié avec succès');
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
  });

  it('devrait modifier uniquement le titre', async () => {
    const mockUpdateData: UpdateModuleData = {
      title: 'Nouveau Titre',
    };

    const mockResponse = {
      success: true,
      data: {
        id: 'module-123',
        title: 'Nouveau Titre',
        description: 'Description originale',
        thematics: 'Finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        imageMediaId: null,
        lessons: [],
        quizzes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUpdateModule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.updateModule({ id: 'module-123', data: mockUpdateData });
    });

    await waitFor(() => {
      expect(mockApiClient).toHaveBeenCalledWith(
        'modules/module-123',
        'PUT',
        'mock-token',
        mockUpdateData
      );
    });

    expect(toast.success).toHaveBeenCalledWith('Module modifié avec succès');
  });

  it("devrait modifier l'image du module", async () => {
    const mockUpdateData: UpdateModuleData = {
      imageMediaId: 'new-media-789',
    };

    const mockResponse = {
      success: true,
      data: {
        id: 'module-123',
        title: 'Module Test',
        description: 'Description',
        thematics: 'Finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        imageMediaId: 'new-media-789',
        lessons: [],
        quizzes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUpdateModule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.updateModule({ id: 'module-123', data: mockUpdateData });
    });

    await waitFor(() => {
      expect(mockApiClient).toHaveBeenCalledWith(
        'modules/module-123',
        'PUT',
        'mock-token',
        mockUpdateData
      );
    });

    expect(toast.success).toHaveBeenCalledWith('Module modifié avec succès');
  });

  it("devrait supprimer l'image du module (imageMediaId: null)", async () => {
    const mockUpdateData: UpdateModuleData = {
      imageMediaId: null,
    };

    const mockResponse = {
      success: true,
      data: {
        id: 'module-123',
        title: 'Module Test',
        description: 'Description',
        thematics: 'Finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        imageMediaId: null,
        lessons: [],
        quizzes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUpdateModule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.updateModule({ id: 'module-123', data: mockUpdateData });
    });

    await waitFor(() => {
      expect(mockApiClient).toHaveBeenCalledWith(
        'modules/module-123',
        'PUT',
        'mock-token',
        mockUpdateData
      );
    });

    expect(toast.success).toHaveBeenCalledWith('Module modifié avec succès');
  });

  it('devrait modifier le statut du module', async () => {
    const mockUpdateData: UpdateModuleData = {
      status: ModuleStatus.PUBLISHED,
    };

    const mockResponse = {
      success: true,
      data: {
        id: 'module-123',
        title: 'Module Test',
        description: 'Description',
        thematics: 'Finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.PUBLISHED,
        imageMediaId: null,
        lessons: [],
        quizzes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUpdateModule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.updateModule({ id: 'module-123', data: mockUpdateData });
    });

    await waitFor(() => {
      expect(mockApiClient).toHaveBeenCalledWith(
        'modules/module-123',
        'PUT',
        'mock-token',
        mockUpdateData
      );
    });

    expect(toast.success).toHaveBeenCalledWith('Module modifié avec succès');
  });

  it('devrait gérer une réponse en échec du backend', async () => {
    const mockUpdateData: UpdateModuleData = {
      title: 'Titre Déjà Existant',
    };

    mockApiClient.mockResolvedValue({
      success: false,
      message: 'Un module avec ce titre existe déjà',
    });

    const { result } = renderHook(() => useUpdateModule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.updateModule({ id: 'module-123', data: mockUpdateData });
    });

    await waitFor(() => {
      expect(mockHideLoader).toHaveBeenCalled();
    });

    expect(toast.error).toHaveBeenCalledWith('Modification échouée', {
      description: 'Un module avec ce titre existe déjà',
    });
  });

  it('devrait gérer une réponse en échec sans message', async () => {
    const mockUpdateData: UpdateModuleData = {
      title: 'Test',
    };

    mockApiClient.mockResolvedValue({
      success: false,
    });

    const { result } = renderHook(() => useUpdateModule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.updateModule({ id: 'module-123', data: mockUpdateData });
    });

    await waitFor(() => {
      expect(mockHideLoader).toHaveBeenCalled();
    });

    expect(toast.error).toHaveBeenCalledWith('Modification échouée', {
      description: 'Erreur',
    });
  });

  it('devrait gérer une erreur réseau', async () => {
    const mockUpdateData: UpdateModuleData = {
      description: 'Nouvelle description',
    };

    mockApiClient.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUpdateModule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.updateModule({ id: 'module-123', data: mockUpdateData });
    });

    await waitFor(() => {
      expect(mockHideLoader).toHaveBeenCalled();
    });

    expect(mockShowLoader).toHaveBeenCalledTimes(1);
    expect(mockHideLoader).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('Modification échouée', {
      description: 'Network error',
    });
  });

  it('devrait invalider le cache des modules après succès', async () => {
    const mockUpdateData: UpdateModuleData = {
      title: 'Module Mis à Jour',
    };

    mockApiClient.mockResolvedValue({
      success: true,
      data: {
        id: 'module-123',
        title: 'Module Mis à Jour',
        description: 'Description',
        thematics: 'Finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        imageMediaId: null,
        lessons: [],
        quizzes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

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

    const { result } = renderHook(() => useUpdateModule(), { wrapper: Wrapper });

    await act(async () => {
      result.current.updateModule({ id: 'module-123', data: mockUpdateData });
    });

    await waitFor(() => {
      expect(mockHideLoader).toHaveBeenCalled();
    });

    expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['modules'] }));
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['module', 'byId'] })
    );
  });

  it('devrait retourner isUpdating pendant la modification', async () => {
    jest.useFakeTimers();

    const mockUpdateData: UpdateModuleData = {
      title: 'Test',
    };

    mockApiClient.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => resolve({ success: true }), 100);
        })
    );

    const { result } = renderHook(() => useUpdateModule(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isUpdating).toBe(false);

    act(() => {
      result.current.updateModule({ id: 'module-123', data: mockUpdateData });
    });

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(true);
    });

    act(() => {
      jest.advanceTimersByTime(120);
    });

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
    });

    jest.useRealTimers();
  });

  it("devrait toujours appeler hideLoader même en cas d'erreur", async () => {
    const mockUpdateData: UpdateModuleData = {
      title: 'Test',
    };

    mockApiClient.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useUpdateModule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.updateModule({ id: 'module-123', data: mockUpdateData });
    });

    await waitFor(() => {
      expect(mockHideLoader).toHaveBeenCalled();
    });

    expect(mockHideLoader).toHaveBeenCalledTimes(1);
  });

  it('devrait exposer updateModuleAsync pour utilisation asynchrone', async () => {
    const mockUpdateData: UpdateModuleData = {
      title: 'Test Async',
    };

    const mockResponse = {
      success: true,
      data: {
        id: 'module-123',
        title: 'Test Async',
        description: 'Description',
        thematics: 'Finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        imageMediaId: null,
        lessons: [],
        quizzes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUpdateModule(), {
      wrapper: createWrapper(),
    });

    let response;
    await act(async () => {
      response = await result.current.updateModuleAsync({ id: 'module-123', data: mockUpdateData });
    });

    expect(response).toEqual(mockResponse);
  });

  it("devrait exposer error lorsqu'une erreur survient", async () => {
    const mockUpdateData: UpdateModuleData = {
      title: 'Test',
    };

    const mockError = new Error('Test Error');
    mockApiClient.mockRejectedValue(mockError);

    const { result } = renderHook(() => useUpdateModule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.updateModule({ id: 'module-123', data: mockUpdateData });
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('devrait modifier plusieurs champs simultanément', async () => {
    const mockUpdateData: UpdateModuleData = {
      title: 'Nouveau Titre',
      description: 'Nouvelle Description',
      thematics: 'Épargne',
      difficultyLevel: DifficultyLevel.EXPERT,
      estimatedDuration: 120,
      status: ModuleStatus.ARCHIVED,
      imageMediaId: 'new-media-999',
    };

    const mockResponse = {
      success: true,
      data: {
        id: 'module-123',
        ...mockUpdateData,
        lessons: [],
        quizzes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUpdateModule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.updateModule({ id: 'module-123', data: mockUpdateData });
    });

    await waitFor(() => {
      expect(mockApiClient).toHaveBeenCalledWith(
        'modules/module-123',
        'PUT',
        'mock-token',
        mockUpdateData
      );
    });

    expect(toast.success).toHaveBeenCalledWith('Module modifié avec succès');
  });

  it('ne devrait pas appeler onSuccess si la réponse est en échec', async () => {
    const mockUpdateData: UpdateModuleData = {
      title: 'Test',
    };

    mockApiClient.mockResolvedValue({
      success: false,
      message: 'Erreur',
    });

    const onSuccessMock = jest.fn();

    const { result } = renderHook(() => useUpdateModule({ onSuccess: onSuccessMock }), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.updateModule({ id: 'module-123', data: mockUpdateData });
    });

    await waitFor(() => {
      expect(mockHideLoader).toHaveBeenCalled();
    });

    expect(onSuccessMock).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Modification échouée', {
      description: 'Erreur',
    });
  });

  it('ne devrait pas appeler onSuccess si options est undefined', async () => {
    const mockUpdateData: UpdateModuleData = {
      title: 'Test',
    };

    mockApiClient.mockResolvedValue({
      success: true,
      data: {
        id: 'module-123',
        title: 'Test',
        description: 'Description',
        thematics: 'Finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        imageMediaId: null,
        lessons: [],
        quizzes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    const { result } = renderHook(() => useUpdateModule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.updateModule({ id: 'module-123', data: mockUpdateData });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });

    // Ne devrait pas causer d'erreur
    expect(mockHideLoader).toHaveBeenCalled();
  });
});
