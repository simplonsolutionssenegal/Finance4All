import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { toast } from 'sonner';

import { useEnrollModule } from '@/hooks/module/useEnrollModule';
import { apiClient } from '@/lib/api-client';

jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock('@/lib/api-client', () => ({
  apiClient: jest.fn(),
}));

import { useAuth } from '@clerk/nextjs';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockApiClient = apiClient as jest.MockedFunction<typeof apiClient>;

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

describe('useEnrollModule', () => {
  const mockGetToken = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
      isLoaded: true,
      isSignedIn: true,
    } as any);

    mockGetToken.mockResolvedValue('mock-token');
  });

  it('calls apiClient with correct endpoint', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });

    mockApiClient.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useEnrollModule(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.enrollModuleAsync({ moduleId: 'module-1' });
    });

    expect(mockApiClient).toHaveBeenCalledWith('modules/module-1/enroll', 'POST', 'mock-token');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows toast when API returns success=false', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });

    mockApiClient.mockResolvedValue({ success: false, message: 'fail' });

    const { result } = renderHook(() => useEnrollModule(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.enrollModuleAsync({ moduleId: 'module-1' });
    });

    expect(toast.error).toHaveBeenCalledWith('Inscription echouee', {
      description: 'fail',
    });
  });

  it('shows toast when apiClient throws', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });

    mockApiClient.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useEnrollModule(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(result.current.enrollModuleAsync({ moduleId: 'module-1' })).rejects.toThrow(
        'boom'
      );
    });

    expect(toast.error).toHaveBeenCalledWith('Inscription echouee', {
      description: 'boom',
    });
  });
});
