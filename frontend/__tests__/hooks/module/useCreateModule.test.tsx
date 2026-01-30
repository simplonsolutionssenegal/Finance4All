// frontend/__tests__/hooks/module/useCreateModule.test.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
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

describe('useCreateModule', () => {
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

  it('devrait créer un module avec succès', async () => {
    const mockModuleData: CreateModuleData = {
      title: 'Test Module',
      description: 'Test Description',
      imageMediaId: 'media-123', // ✅ un ID (pas une URL)
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
        status: ModuleStatus.DRAFT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    mockApiClient.mockResolvedValue(mockResponse);

    const onSuccessMock = jest.fn();

    const { result } = renderHook(() => useCreateModule({ onSuccess: onSuccessMock }), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.createModule(mockModuleData);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockShowLoader).toHaveBeenCalledTimes(1);
    expect(mockHideLoader).toHaveBeenCalledTimes(1);
    expect(mockGetToken).toHaveBeenCalledTimes(1);
    expect(mockApiClient).toHaveBeenCalledWith('modules', 'POST', 'mock-token', mockModuleData);
    expect(toast.success).toHaveBeenCalledWith('Module créé avec succès!');
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

    mockApiClient.mockResolvedValue({
      success: false,
      message: 'Titre déjà utilisé',
    });

    const { result } = renderHook(() => useCreateModule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.createModule(mockModuleData);
    });

    await waitFor(() => {
      expect(mockHideLoader).toHaveBeenCalled();
    });

    expect(toast.error).toHaveBeenCalledWith('La création du module a échoué', {
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

    mockApiClient.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCreateModule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.createModule(mockModuleData);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockShowLoader).toHaveBeenCalledTimes(1);
    expect(mockHideLoader).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('La création du module a échoué', {
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

    mockApiClient.mockResolvedValue({
      success: true,
      data: {
        id: '1',
        ...mockModuleData,
        status: ModuleStatus.DRAFT,
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

    const { result } = renderHook(() => useCreateModule(), { wrapper: Wrapper });

    await act(async () => {
      result.current.createModule(mockModuleData);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // ✅ plus tolérant (selon ta version react-query)
    expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['modules'] }));
  });

  it('devrait retourner isCreating pendant la création', async () => {
    jest.useFakeTimers();

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

    act(() => {
      result.current.createModule(mockModuleData);
    });

    await waitFor(() => {
      expect(result.current.isCreating).toBe(true);
    });

    act(() => {
      jest.advanceTimersByTime(120);
    });

    await waitFor(() => {
      expect(result.current.isCreating).toBe(false);
    });

    jest.useRealTimers();
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

    await act(async () => {
      result.current.createModule(mockModuleData);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockHideLoader).toHaveBeenCalledTimes(1);
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

    mockApiClient.mockRejectedValue(new Error());

    const { result } = renderHook(() => useCreateModule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.createModule(mockModuleData);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalledWith('La création du module a échoué', {
      description: 'Une erreur inattendue est survenue.',
    });
  });

  it('devrait exposer isSuccess, isError et error', () => {
    const { result } = renderHook(() => useCreateModule(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
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

    mockApiClient.mockResolvedValue({
      success: true,
      message: 'Module créé',
    });

    const { result } = renderHook(() => useCreateModule(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.createModule(mockModuleData);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(toast.success).toHaveBeenCalledWith('Module créé avec succès!');
  });
});
