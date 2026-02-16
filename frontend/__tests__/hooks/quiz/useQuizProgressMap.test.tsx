import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useQuizProgressMap } from '@/hooks/quiz/useQuizProgressMap';

describe('useQuizProgressMap', () => {
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

  it('deduplicates quiz ids and returns a progress map', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('quiz-1')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
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
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              quizId: 'quiz-2',
              userId: 'user-1',
              totalAttempts: 0,
              maxAttempts: 3,
              remainingAttempts: 3,
              hasPassed: false,
              bestScorePercent: null,
              lastScorePercent: null,
              lastAttemptAt: null,
            },
          }),
      });
    });

    const { result } = renderHook(() => useQuizProgressMap(['quiz-1', 'quiz-1', 'quiz-2']), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.progressMap.size).toBe(2);
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(result.current.progressMap.get('quiz-1')?.bestScorePercent).toBe(75);
    expect(result.current.progressMap.get('quiz-2')?.remainingAttempts).toBe(3);
  });

  it('filters out empty ids', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            quizId: 'quiz-1',
            userId: 'user-1',
            totalAttempts: 0,
            maxAttempts: 3,
            remainingAttempts: 3,
            hasPassed: false,
            bestScorePercent: null,
            lastScorePercent: null,
            lastAttemptAt: null,
          },
        }),
    });

    const { result } = renderHook(() => useQuizProgressMap(['', 'quiz-1', '']), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.progressMap.size).toBe(1);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.current.progressMap.get('quiz-1')).toBeDefined();
  });
});
