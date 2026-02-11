/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useUpdateLesson } from '@/hooks/lesson/useUpdateLesson';
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

describe('useUpdateLesson', () => {
  const showLoader = jest.fn();
  const hideLoader = jest.fn();
  const getToken = jest.fn();

  const payload = {
    title: 'Titre',
    description: 'Desc',
    status: 'DRAFT',
    duration: 10,
    chapters: [],
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    useLoaderMock.mockReturnValue({ showLoader, hideLoader });
    useAuthMock.mockReturnValue({ getToken });
    getToken.mockResolvedValue('token-123');
  });

  it('success=true: calls apiClient PUT, hideLoader, toast.success, options.onSuccess', async () => {
    apiClientMock.mockResolvedValue({ success: true });

    const queryClient = makeQueryClient();
    const onSuccess = jest.fn();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateLesson({ onSuccess }), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ lessonId: 'lesson-1', payload });
    });

    expect(showLoader).toHaveBeenCalledTimes(1);
    expect(hideLoader).toHaveBeenCalledTimes(1);

    expect(getToken).toHaveBeenCalledTimes(1);
    expect(apiClientMock).toHaveBeenCalledTimes(1);
    expect(apiClientMock).toHaveBeenCalledWith('lessons/lesson-1', 'PUT', 'token-123', payload);

    expect(toast.success).toHaveBeenCalledWith('Lecon modifiee avec succes !');
    expect(onSuccess).toHaveBeenCalledTimes(1);

    expect(toast.error).not.toHaveBeenCalled();
  });

  it('success=false: toast.error with backend message, no onSuccess', async () => {
    apiClientMock.mockResolvedValue({ success: false, message: 'Nope' });

    const queryClient = makeQueryClient();
    const onSuccess = jest.fn();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateLesson({ onSuccess }), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ lessonId: 'lesson-2', payload });
    });

    expect(hideLoader).toHaveBeenCalledTimes(1);

    expect(toast.error).toHaveBeenCalledWith('La modification a echoue', {
      description: 'Nope',
    });
    expect(toast.success).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('success=true without options: does not call onSuccess', async () => {
    apiClientMock.mockResolvedValue({ success: true });

    const queryClient = makeQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateLesson(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ lessonId: 'lesson-2b', payload });
    });

    expect(toast.success).toHaveBeenCalledWith('Lecon modifiee avec succes !');
  });

  it('onError: hideLoader + toast.error with error message', async () => {
    apiClientMock.mockRejectedValue(new Error('Boom'));

    const queryClient = makeQueryClient();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateLesson(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync({ lessonId: 'lesson-3', payload })).rejects.toThrow(
        'Boom'
      );
    });

    expect(showLoader).toHaveBeenCalledTimes(1);
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

    const { result } = renderHook(() => useUpdateLesson(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync({ lessonId: 'lesson-4', payload })).rejects.toThrow();
    });

    expect(toast.error).toHaveBeenCalledWith('La modification a echoue', {
      description: 'An unexpected error occurred.',
    });
  });
});
