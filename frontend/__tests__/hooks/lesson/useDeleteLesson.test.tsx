/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useDeleteLesson } from '@/hooks/lesson/useDeleteLesson';
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

describe('useDeleteLesson', () => {
  const showLoader = jest.fn();
  const hideLoader = jest.fn();
  const getToken = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useLoaderMock.mockReturnValue({ showLoader, hideLoader });
    useAuthMock.mockReturnValue({ getToken });
    getToken.mockResolvedValue('token-123');
  });

  it('success=true: calls apiClient DELETE, hideLoader, toast.success, invalidateQueries, options.onSuccess', async () => {
    apiClientMock.mockResolvedValue({ success: true });

    const queryClient = makeQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const onSuccess = jest.fn();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteLesson({ onSuccess }), { wrapper });

    await act(async () => {
      await result.current.deleteLessonAsync({ lessonId: 'lesson-1', moduleId: 'module-1' });
    });

    expect(showLoader).toHaveBeenCalledTimes(1);
    expect(hideLoader).toHaveBeenCalledTimes(1);

    expect(getToken).toHaveBeenCalledTimes(1);
    expect(apiClientMock).toHaveBeenCalledTimes(1);
    expect(apiClientMock).toHaveBeenCalledWith('lessons/lesson-1', 'DELETE', 'token-123');

    expect(toast.success).toHaveBeenCalledWith('Lecon supprimee avec succes');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['module', 'module-1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['modules'] });
    expect(onSuccess).toHaveBeenCalledTimes(1);

    expect(toast.error).not.toHaveBeenCalled();
  });

  it('success=true with status=success: does not invalidate module without moduleId', async () => {
    apiClientMock.mockResolvedValue({ status: 'success' });

    const queryClient = makeQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteLesson(), { wrapper });

    await act(async () => {
      await result.current.deleteLessonAsync({ lessonId: 'lesson-1b' });
    });

    expect(toast.success).toHaveBeenCalledWith('Lecon supprimee avec succes');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['modules'] });
    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ['module', 'module-1b'] });
  });

  it('success=true with null data: still shows success and invalidates module list', async () => {
    apiClientMock.mockResolvedValue(null);

    const queryClient = makeQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteLesson(), { wrapper });

    await act(async () => {
      await result.current.deleteLessonAsync({ lessonId: 'lesson-1c' });
    });

    expect(toast.success).toHaveBeenCalledWith('Lecon supprimee avec succes');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['modules'] });
  });

  it('success=false: toast.error with message, no invalidateQueries, no onSuccess', async () => {
    apiClientMock.mockResolvedValue({ success: false, message: 'Nope' });

    const queryClient = makeQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const onSuccess = jest.fn();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteLesson({ onSuccess }), { wrapper });

    await act(async () => {
      await result.current.deleteLessonAsync({ lessonId: 'lesson-2' });
    });

    expect(showLoader).toHaveBeenCalledTimes(1);
    expect(hideLoader).toHaveBeenCalledTimes(1);

    expect(toast.error).toHaveBeenCalledWith('Echec de la suppression de la lecon', {
      description: 'Nope',
    });

    expect(toast.success).not.toHaveBeenCalled();
    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('success=false without message: toast.error with fallback', async () => {
    apiClientMock.mockResolvedValue({ success: false });

    const queryClient = makeQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteLesson(), { wrapper });

    await act(async () => {
      await result.current.deleteLessonAsync({ lessonId: 'lesson-3' });
    });

    expect(toast.error).toHaveBeenCalledWith('Echec de la suppression de la lecon', {
      description: 'Une erreur est survenue.',
    });
  });

  it('onError: hideLoader + toast.error with error message', async () => {
    apiClientMock.mockRejectedValue(new Error('Boom'));

    const queryClient = makeQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteLesson(), { wrapper });

    await act(async () => {
      await expect(result.current.deleteLessonAsync({ lessonId: 'lesson-4' })).rejects.toThrow(
        'Boom'
      );
    });

    expect(showLoader).toHaveBeenCalledTimes(1);
    expect(hideLoader).toHaveBeenCalledTimes(1);

    expect(toast.error).toHaveBeenCalledWith('Echec de la suppression de la lecon', {
      description: 'Boom',
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('onError: fallback description when error message is empty', async () => {
    apiClientMock.mockRejectedValue(new Error(''));

    const queryClient = makeQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteLesson(), { wrapper });

    await act(async () => {
      await expect(result.current.deleteLessonAsync({ lessonId: 'lesson-5' })).rejects.toThrow();
    });

    expect(toast.error).toHaveBeenCalledWith('Echec de la suppression de la lecon', {
      description: 'Une erreur inattendue est survenue.',
    });
  });
});
