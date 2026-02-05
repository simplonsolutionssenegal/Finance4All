import { useAuth } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useGetQuizProgress } from '@/hooks/quiz/useGetQuizProgress';
import { apiClient } from '@/lib/api-client';

jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api-client', () => ({
  apiClient: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockApiClient = apiClient as jest.Mock;

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

    mockUseAuth.mockReturnValue({
      getToken: jest.fn().mockResolvedValue('mock-token'),
    });
    mockApiClient.mockReset();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('fetches quiz progress with token', async () => {
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

    mockApiClient.mockResolvedValue(response);

    const { result } = renderHook(() => useGetQuizProgress('quiz-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.progress).toEqual(response.data);
    });

    expect(mockApiClient).toHaveBeenCalledWith('quizzes/quiz-1/progress/me', 'GET', 'mock-token');
  });
});
