import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { toast } from 'sonner';

import { useEnrollModule } from '@/hooks/module/useEnrollModule';

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

describe('useEnrollModule', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('calls /api/modules/[moduleId]/enroll with POST', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useEnrollModule(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.enrollModuleAsync({ moduleId: 'module-1' });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/modules/module-1/enroll',
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
      })
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows toast when API returns success=false', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ success: false, message: 'fail' }),
    });

    const { result } = renderHook(() => useEnrollModule(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      try {
        await result.current.enrollModuleAsync({ moduleId: 'module-1' });
      } catch {
        // La mutation lance une erreur quand response.ok est false - onError affiche le toast
      }
    });

    expect(toast.error).toHaveBeenCalledWith('Inscription echouee', {
      description: 'fail',
    });
  });

  it('shows toast when fetch throws', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });

    global.fetch = jest.fn().mockRejectedValue(new Error('boom'));

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
