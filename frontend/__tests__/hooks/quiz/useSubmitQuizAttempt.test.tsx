import { useAuth } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useSubmitQuizAttempt } from '@/hooks/quiz/useSubmitQuizAttempt';
import { apiClient } from '@/lib/api-client';

jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api-client', () => ({
  apiClient: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockApiClient = apiClient as jest.Mock;

describe('useSubmitQuizAttempt', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
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

  it('submits answers and invalidates progress query', async () => {
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const response = {
      success: true,
      data: {
        id: 'attempt-1',
        quizId: 'quiz-1',
        userId: 'user-1',
        attemptNumber: 1,
        earnedPoints: 2,
        totalPoints: 2,
        scorePercent: 100,
        isPassed: true,
        answers: [{ questionIndex: 0, selectedOptionIndexes: [1] }],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        maxAttempts: 3,
        remainingAttempts: 2,
        hasPassedQuiz: true,
      },
    };

    mockApiClient.mockResolvedValue(response);

    const { result } = renderHook(() => useSubmitQuizAttempt('quiz-1'), {
      wrapper: createWrapper(),
    });

    const payload = [{ questionIndex: 0, selectedOptionIndexes: [1] }];
    await result.current.submitAttempt(payload);

    expect(mockApiClient).toHaveBeenCalledWith('quizzes/quiz-1/attempts', 'POST', 'mock-token', {
      answers: payload,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['quiz-progress', 'quiz-1'] });
  });
});
