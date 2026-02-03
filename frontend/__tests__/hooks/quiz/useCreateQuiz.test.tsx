/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useCreateQuiz } from '@/hooks/quiz/useCreateQuiz';
import { QuizStatus } from '@/types/modules/Quiz';

// --- mocks ---
const getTokenMock = jest.fn();
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: getTokenMock,
  }),
}));

const showLoaderMock = jest.fn();
const hideLoaderMock = jest.fn();
jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: () => ({
    showLoader: showLoaderMock,
    hideLoader: hideLoaderMock,
  }),
}));

const apiClientMock = jest.fn();
jest.mock('@/lib/api-client', () => ({
  apiClient: (...args: any[]) => apiClientMock(...args),
}));

const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();
jest.mock('sonner', () => ({
  toast: {
    success: (...args: any[]) => toastSuccessMock(...args),
    error: (...args: any[]) => toastErrorMock(...args),
  },
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useCreateQuiz', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('success=true => showLoader, apiClient appelé, hideLoader, toast.success, options.onSuccess', async () => {
    getTokenMock.mockResolvedValueOnce('token-123');
    apiClientMock.mockResolvedValueOnce({ success: true });

    const onSuccess = jest.fn();

    const { result } = renderHook(() => useCreateQuiz({ onSuccess }), {
      wrapper: makeWrapper(),
    });

    const payload = {
      title: 'Quiz 1',
      description: 'Desc',
      status: QuizStatus.DRAFT,
      scoreMinimum: 70,
      duree: undefined,
      nombreTentatives: 3,
      questions: [],
    };

    act(() => {
      result.current.createQuiz({ moduleId: 'module-1', payload });
    });

    await waitFor(() => {
      expect(apiClientMock).toHaveBeenCalled();
    });

    // loader
    expect(showLoaderMock).toHaveBeenCalledTimes(1);
    expect(hideLoaderMock).toHaveBeenCalledTimes(1);

    // token + appel API
    expect(getTokenMock).toHaveBeenCalledTimes(1);
    expect(apiClientMock).toHaveBeenCalledWith(
      'modules/module-1/quizzes',
      'PUT',
      'token-123',
      payload
    );

    // toast + callback
    expect(toastSuccessMock).toHaveBeenCalledWith('Quiz créé avec succès !');
    expect(toastErrorMock).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('success=false => hideLoader, toast.error avec message, pas de onSuccess', async () => {
    getTokenMock.mockResolvedValueOnce('token-abc');
    apiClientMock.mockResolvedValueOnce({ success: false, message: 'Bad request' });

    const onSuccess = jest.fn();

    const { result } = renderHook(() => useCreateQuiz({ onSuccess }), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.createQuiz({
        moduleId: 'module-1',
        payload: {
          title: 'Quiz 2',
          description: 'Desc',
          status: QuizStatus.DRAFT,
          scoreMinimum: 70,
          duree: 20,
          nombreTentatives: 3,
          questions: [],
        },
      });
    });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalled();
    });

    expect(showLoaderMock).toHaveBeenCalledTimes(1);
    expect(hideLoaderMock).toHaveBeenCalledTimes(1);

    expect(toastErrorMock).toHaveBeenCalledWith('La création a échoué', {
      description: 'Bad request',
    });

    expect(toastSuccessMock).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('onError (apiClient throw) => hideLoader + toast.error avec error.message', async () => {
    getTokenMock.mockResolvedValueOnce('token-xyz');
    apiClientMock.mockRejectedValueOnce(new Error('Network down'));

    const onSuccess = jest.fn();

    const { result } = renderHook(() => useCreateQuiz({ onSuccess }), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.createQuiz({
        moduleId: 'module-1',
        payload: {
          title: 'Quiz 3',
          description: 'Desc',
          status: QuizStatus.DRAFT,
          scoreMinimum: 70,
          duree: undefined,
          nombreTentatives: 3,
          questions: [],
        },
      });
    });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalled();
    });

    expect(showLoaderMock).toHaveBeenCalledTimes(1);
    expect(hideLoaderMock).toHaveBeenCalledTimes(1);

    expect(toastErrorMock).toHaveBeenCalledWith('La création a échoué', {
      description: 'Network down',
    });

    expect(toastSuccessMock).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('token null => apiClient appelé avec token null (branche token nullable)', async () => {
    getTokenMock.mockResolvedValueOnce(null);
    apiClientMock.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useCreateQuiz(), { wrapper: makeWrapper() });

    const payload = {
      title: 'Quiz 4',
      description: 'Desc',
      status: QuizStatus.DRAFT,
      scoreMinimum: 70,
      duree: undefined,
      nombreTentatives: 3,
      questions: [],
    };

    act(() => {
      result.current.createQuiz({ moduleId: 'module-2', payload });
    });

    await waitFor(() => {
      expect(apiClientMock).toHaveBeenCalled();
    });

    expect(apiClientMock).toHaveBeenCalledWith('modules/module-2/quizzes', 'PUT', null, payload);
  });
});
