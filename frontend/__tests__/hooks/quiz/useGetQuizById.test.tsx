/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useGetQuizById } from '@/hooks/quiz/useGetQuizById';

const getTokenMock = jest.fn();
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: getTokenMock,
  }),
}));

const apiClientMock = jest.fn();
jest.mock('@/lib/api-client', () => ({
  apiClient: (...args: any[]) => apiClientMock(...args),
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useGetQuizById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('id vide => enabled=false => apiClient/getToken ne sont pas appelés', async () => {
    renderHook(() => useGetQuizById(''), { wrapper: makeWrapper() });

    // laisser un tick au scheduler
    await new Promise(r => setTimeout(r, 0));

    expect(getTokenMock).not.toHaveBeenCalled();
    expect(apiClientMock).not.toHaveBeenCalled();
  });

  it('success => retourne quiz et appelle apiClient avec token', async () => {
    getTokenMock.mockResolvedValueOnce('token-123');

    const quizId = 'quiz-1';
    const quizData = {
      id: quizId,
      title: 'Quiz 1',
      description: 'Desc',
      status: 'DRAFT',
      scoreMinimum: 70,
      duree: null,
      nombreTentatives: 3,
      questions: [],
      totalPoints: 0,
      createdAt: '2026-02-02T00:00:00.000Z',
      updatedAt: '2026-02-02T00:00:00.000Z',
    };

    apiClientMock.mockResolvedValueOnce({
      success: true,
      data: quizData,
    });

    const { result } = renderHook(() => useGetQuizById(quizId), {
      wrapper: makeWrapper(),
    });

    // attendre que la query se termine
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getTokenMock).toHaveBeenCalledTimes(1);
    expect(apiClientMock).toHaveBeenCalledTimes(1);
    expect(apiClientMock).toHaveBeenCalledWith(`quizzes/${quizId}`, 'GET', 'token-123');

    expect(result.current.quiz).toEqual(quizData);
    expect(result.current.isError).toBe(false);
  });

  it('apiClient throw => isError=true et error exposé', async () => {
    getTokenMock.mockResolvedValueOnce('token-abc');
    apiClientMock.mockRejectedValueOnce(new Error('Boom'));

    const { result } = renderHook(() => useGetQuizById('quiz-err'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.quiz).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe('Boom');
  });

  it('refetch appelle apiClient à nouveau', async () => {
    getTokenMock.mockResolvedValue('token-xyz');

    const quizId = 'quiz-refetch';
    apiClientMock.mockResolvedValue({
      success: true,
      data: {
        id: quizId,
        title: 'Quiz refetch',
        description: 'Desc',
        status: 'DRAFT',
        scoreMinimum: 70,
        duree: null,
        nombreTentatives: 3,
        questions: [],
      },
    });

    const { result } = renderHook(() => useGetQuizById(quizId), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(apiClientMock).toHaveBeenCalledTimes(1);

    await result.current.refetch();
    expect(apiClientMock).toHaveBeenCalledTimes(2);
  });
});
