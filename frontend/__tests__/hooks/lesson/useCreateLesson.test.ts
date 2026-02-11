/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';

import { useCreateLesson } from '@/hooks/lesson/useCreateLesson';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLoader } from '@/contexts/LoaderContext';

jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
}));

jest.mock('@/lib/api-client', () => ({
  apiClient: jest.fn(),
}));

jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useCreateLesson', () => {
  const useAuthMock = useAuth as unknown as jest.Mock;
  const useMutationMock = useMutation as unknown as jest.Mock;
  const apiClientMock = apiClient as unknown as jest.Mock;
  const useLoaderMock = useLoader as unknown as jest.Mock;

  let capturedConfig: any;

  beforeEach(() => {
    jest.clearAllMocks();
    capturedConfig = undefined;
  });

  function setupUseMutationReturn(overrides?: Partial<any>) {
    const mutationReturn = {
      mutate: jest.fn(),
      isPending: false,
      data: undefined,
      error: null,
      ...overrides,
    };

    useMutationMock.mockImplementation((config: any) => {
      capturedConfig = config;
      return mutationReturn;
    });

    return mutationReturn;
  }

  it('should run mutationFn: showLoader -> getToken -> apiClient(modules/:id/lessons, PUT, token, payload)', async () => {
    const getToken = jest.fn().mockResolvedValue('token-123');
    useAuthMock.mockReturnValue({ getToken });

    const showLoader = jest.fn();
    const hideLoader = jest.fn();
    useLoaderMock.mockReturnValue({ showLoader, hideLoader });

    setupUseMutationReturn();

    apiClientMock.mockResolvedValue({ success: true });

    renderHook(() => useCreateLesson());

    expect(typeof capturedConfig.mutationFn).toBe('function');

    const payload = {
      title: 'L1',
      description: 'Desc',
      duration: 60,
      order: 1,
      status: 'DRAFT',
      chapters: [],
    } as any;

    await capturedConfig.mutationFn({ moduleId: 'module-1', payload });

    expect(showLoader).toHaveBeenCalledTimes(1);
    expect(getToken).toHaveBeenCalledTimes(1);

    expect(apiClientMock).toHaveBeenCalledWith(
      'modules/module-1/lessons',
      'PUT',
      'token-123',
      payload
    );

    // hideLoader est appelé dans onSuccess/onError, pas dans mutationFn
    expect(hideLoader).not.toHaveBeenCalled();
  });

  it('onSuccess: should hide loader + toast.success + call options.onSuccess when data.success=true', () => {
    const getToken = jest.fn();
    useAuthMock.mockReturnValue({ getToken });

    const showLoader = jest.fn();
    const hideLoader = jest.fn();
    useLoaderMock.mockReturnValue({ showLoader, hideLoader });

    const onSuccess = jest.fn();
    const onError = jest.fn();

    setupUseMutationReturn();

    renderHook(() => useCreateLesson({ onSuccess, onError }));

    capturedConfig.onSuccess({ success: true });

    expect(hideLoader).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Leçon créée avec succès !');
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('onSuccess: should hide loader + toast.error + call options.onError when data.success=false', () => {
    const getToken = jest.fn();
    useAuthMock.mockReturnValue({ getToken });

    const showLoader = jest.fn();
    const hideLoader = jest.fn();
    useLoaderMock.mockReturnValue({ showLoader, hideLoader });

    const onSuccess = jest.fn();
    const onError = jest.fn();

    setupUseMutationReturn();

    renderHook(() => useCreateLesson({ onSuccess, onError }));

    capturedConfig.onSuccess({ success: false, message: 'Bad request' });

    expect(hideLoader).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('Création échouée', { description: 'Bad request' });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('onError: should hide loader + toast.error + call options.onError', () => {
    const getToken = jest.fn();
    useAuthMock.mockReturnValue({ getToken });

    const showLoader = jest.fn();
    const hideLoader = jest.fn();
    useLoaderMock.mockReturnValue({ showLoader, hideLoader });

    const onError = jest.fn();

    setupUseMutationReturn();

    renderHook(() => useCreateLesson({ onError }));

    capturedConfig.onError(new Error('Boom'));

    expect(hideLoader).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('Création échouée', {
      description: 'Boom',
    });
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('should expose createLesson=mutate and isCreating=isPending and spread mutation', () => {
    const getToken = jest.fn();
    useAuthMock.mockReturnValue({ getToken });

    const showLoader = jest.fn();
    const hideLoader = jest.fn();
    useLoaderMock.mockReturnValue({ showLoader, hideLoader });

    const mutate = jest.fn();
    const mutationReturn = setupUseMutationReturn({
      mutate,
      isPending: true,
      data: { any: 'value' },
    });

    const { result } = renderHook(() => useCreateLesson());

    expect(result.current.createLesson).toBe(mutate);
    expect(result.current.isCreating).toBe(true);

    // spread mutation
    expect(result.current.data).toEqual(mutationReturn.data);
  });
});
