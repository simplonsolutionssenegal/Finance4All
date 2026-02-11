/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useUpdateQuiz } from '@/hooks/quiz/useUpdateQuiz';
import { apiClient } from '@/lib/api-client';
import { useLoader } from '@/contexts/LoaderContext';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: jest.fn(),
}));

jest.mock('@/lib/api-client', () => ({
  apiClient: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const apiClientMock = apiClient as jest.Mock;
const useAuthMock = useAuth as jest.Mock;
const useLoaderMock = useLoader as jest.Mock;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe('useUpdateQuiz', () => {
  const showLoader = jest.fn();
  const hideLoader = jest.fn();
  const getToken = jest.fn();

  const payload = {
    title: 'Quiz',
    description: 'Desc',
    status: 'DRAFT',
    scoreMinimum: 10,
    duree: 10,
    nombreTentatives: 1,
    questions: [],
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    useLoaderMock.mockReturnValue({ showLoader, hideLoader });
    useAuthMock.mockReturnValue({ getToken });
    getToken.mockResolvedValue('token-123');
  });

  it('success=true: calls apiClient PUT, toast.success, options.onSuccess, hideLoader on settled', async () => {
    apiClientMock.mockResolvedValue({ success: true });

    const queryClient = makeQueryClient();
    const onSuccess = jest.fn();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateQuiz({ onSuccess }), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ quizId: 'quiz-1', payload });
    });

    expect(showLoader).toHaveBeenCalledTimes(1);
    expect(hideLoader).toHaveBeenCalledTimes(1);

    expect(getToken).toHaveBeenCalledTimes(1);
    expect(apiClientMock).toHaveBeenCalledTimes(1);
    expect(apiClientMock).toHaveBeenCalledWith('quizzes/quiz-1', 'PUT', 'token-123', payload);

    expect(toast.success).toHaveBeenCalledWith('Quiz modifie avec succes !');
    expect(onSuccess).toHaveBeenCalledTimes(1);

    expect(toast.error).not.toHaveBeenCalled();
  });

  it('success=false: toast.error with backend message', async () => {
    apiClientMock.mockResolvedValue({ success: false, message: 'Nope' });

    const queryClient = makeQueryClient();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateQuiz(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ quizId: 'quiz-2', payload });
    });

    expect(hideLoader).toHaveBeenCalledTimes(1);

    expect(toast.error).toHaveBeenCalledWith('La modification a echoue', {
      description: 'Nope',
    });
  });

  it('success status="success": toast.success', async () => {
    apiClientMock.mockResolvedValue({ status: 'success' });

    const queryClient = makeQueryClient();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateQuiz(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ quizId: 'quiz-3', payload });
    });

    expect(toast.success).toHaveBeenCalledWith('Quiz modifie avec succes !');
  });

  it('data undefined (204): toast.success', async () => {
    apiClientMock.mockResolvedValue(undefined);

    const queryClient = makeQueryClient();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateQuiz(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ quizId: 'quiz-4', payload });
    });

    expect(toast.success).toHaveBeenCalledWith('Quiz modifie avec succes !');
  });

  it('onError: toast.error with error message + hideLoader on settled', async () => {
    apiClientMock.mockRejectedValue(new Error('Boom'));

    const queryClient = makeQueryClient();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateQuiz(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync({ quizId: 'quiz-5', payload })).rejects.toThrow(
        'Boom'
      );
    });

    expect(hideLoader).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('La modification a echoue', {
      description: 'Boom',
    });
  });

  it('onError: fallback description when error message is empty', async () => {
    apiClientMock.mockRejectedValue(new Error(''));

    const queryClient = makeQueryClient();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateQuiz(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync({ quizId: 'quiz-6', payload })).rejects.toThrow();
    });

    expect(toast.error).toHaveBeenCalledWith('La modification a echoue', {
      description: 'An unexpected error occurred.',
    });
  });
});
