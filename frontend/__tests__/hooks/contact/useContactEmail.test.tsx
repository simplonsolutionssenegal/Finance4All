import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { toast } from 'sonner';

import { useContactEmail } from '@/hooks/contact/useContactEmail';

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

describe('useContactEmail', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('sends payload and updates attempts on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'ok', attemptsRemaining: 2 }),
    });

    const { result } = renderHook(() => useContactEmail(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.sendContactEmail({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@doe.com',
        phone: '+221771112233',
        country: 'Mali',
        subject: 'Sujet valide',
        message: 'Message de test suffisamment long pour validation.',
      });
    });

    expect(result.current.attemptsRemaining).toBe(2);
    expect(toast.success).toHaveBeenCalled();
  });

  it('shows error toast when backend returns not ok', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Limite atteinte',
        attemptsRemaining: 0,
      }),
    });

    const { result } = renderHook(() => useContactEmail(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.sendContactEmail({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@doe.com',
          country: 'Mali',
          subject: 'Sujet valide',
          message: 'Message de test suffisamment long pour validation.',
        })
      ).rejects.toThrow('Limite atteinte');
    });

    expect(result.current.attemptsRemaining).toBe(0);
    expect(toast.error).toHaveBeenCalled();
  });
});
