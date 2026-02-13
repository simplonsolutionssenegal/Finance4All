/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useGetLessonById } from '@/hooks/lesson/useGetLessonById';

const getTokenMock = jest.fn();
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: getTokenMock,
  }),
}));

const apiClientMock = jest.fn();
jest.mock('@/lib/api-client', () => ({
  apiClient: (...args: unknown[]) => apiClientMock(...args),
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

describe('useGetLessonById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('id vide => query désactivée', async () => {
    renderHook(() => useGetLessonById(''), { wrapper: makeWrapper() });

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(getTokenMock).not.toHaveBeenCalled();
    expect(apiClientMock).not.toHaveBeenCalled();
  });

  it('success=true => retourne la leçon', async () => {
    getTokenMock.mockResolvedValueOnce('token-123');

    const lessonData = { id: 'lesson-1', title: 'Leçon 1' };
    apiClientMock.mockResolvedValueOnce({
      success: true,
      data: lessonData,
    });

    const { result } = renderHook(() => useGetLessonById('lesson-1'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(apiClientMock).toHaveBeenCalledWith('lessons/lesson-1', 'GET', 'token-123');
    expect(result.current.lesson).toEqual(lessonData);
  });

  it('status=success => retourne la leçon', async () => {
    getTokenMock.mockResolvedValueOnce('token-456');

    const lessonData = { id: 'lesson-2', title: 'Leçon 2' };
    apiClientMock.mockResolvedValueOnce({
      status: 'success',
      data: lessonData,
    });

    const { result } = renderHook(() => useGetLessonById('lesson-2'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.lesson).toEqual(lessonData);
    expect(result.current.isError).toBe(false);
  });

  it('response non-success => isError=true', async () => {
    getTokenMock.mockResolvedValueOnce('token-err');
    apiClientMock.mockResolvedValueOnce({
      success: false,
      status: 'error',
      message: 'No lesson',
    });

    const { result } = renderHook(() => useGetLessonById('lesson-err'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.lesson).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe('No lesson');
  });
});
