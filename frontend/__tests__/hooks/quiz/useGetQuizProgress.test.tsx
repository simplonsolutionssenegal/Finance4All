import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useGetQuizProgress } from '@/hooks/quiz/useGetQuizProgress';

describe('useGetQuizProgress', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    queryClient.clear();
    jest.restoreAllMocks();
  });

  it('fetches quiz progress via /api/quizzes/:quizId/progress/me', async () => {
    const response = {
      success: true,
      data: {
        quizId: 'quiz-1',
        userId: 'user-1',
        totalAttempts: 1,
        maxAttempts: 3,
        remainingAttempts: 2,
        hasPassed: false,
        bestScorePercent: 75,
        lastScorePercent: 75,
        lastAttemptAt: '2025-01-01T00:00:00.000Z',
      },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(response),
    });

    const { result } = renderHook(() => useGetQuizProgress('quiz-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.progress).toEqual(response.data);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/quizzes/quiz-1/progress/me', {
      method: 'GET',
      credentials: 'same-origin',
    });
  });
});
