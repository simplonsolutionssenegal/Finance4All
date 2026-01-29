// frontend/__tests__/hooks/module/useCreateModule.test.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { toast } from 'sonner';

import { useLoader } from '../../../contexts/LoaderContext';
import { useCreateModule } from '../../../hooks/module/useCreateModule';
import { apiClient } from '../../../lib/api-client';
import { DifficultyLevel } from '../../../types/modules/module';
// eslint-disable-next-line no-duplicate-imports
import type { CreateModuleData } from '../../../types/modules/module';

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

jest.mock('../../../lib/api-client', () => ({
  apiClient: jest.fn(),
}));

jest.mock('../../../contexts/LoaderContext', () => ({
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
      imageUrl: 'https://example.com/image.jpg',
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
      imageUrl: null,
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
      imageUrl: null,
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
      imageUrl: null,
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
      imageUrl: null,
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
      imageUrl: null,
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
      imageUrl: null,
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
      imageUrl: null,
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
});
