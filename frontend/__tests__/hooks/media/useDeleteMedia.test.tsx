/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useDeleteMedia } from '@/hooks/media/useDeleteMedia';
import { apiClient } from '@/lib/api-client';
import { useLoader } from '@/contexts/LoaderContext';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

// --------------------
// Mocks
// --------------------
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

describe('useDeleteMedia', () => {
  const showLoader = jest.fn();
  const hideLoader = jest.fn();
  const getToken = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useLoaderMock.mockReturnValue({ showLoader, hideLoader });
    useAuthMock.mockReturnValue({ getToken });
    getToken.mockResolvedValue('token-123');
  });

  it('success=true: appelle apiClient DELETE, hideLoader, toast.success, invalidateQueries, options.onSuccess', async () => {
    apiClientMock.mockResolvedValue({ success: true });

    const queryClient = makeQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const onSuccess = jest.fn();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteMedia({ onSuccess }), { wrapper });

    await act(async () => {
      await result.current.deleteMediaAsync({ mediaId: 'media-1' });
    });

    // loader
    expect(showLoader).toHaveBeenCalledTimes(1);
    expect(hideLoader).toHaveBeenCalledTimes(1);

    // token + api
    expect(getToken).toHaveBeenCalledTimes(1);
    expect(apiClientMock).toHaveBeenCalledTimes(1);
    expect(apiClientMock).toHaveBeenCalledWith('media/media-1', 'DELETE', 'token-123');

    // toast + invalidation + callback
    expect(toast.success).toHaveBeenCalledWith('Ressource supprimée avec succès');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['media'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['modules'] });
    expect(onSuccess).toHaveBeenCalledTimes(1);

    // pas d’erreur toast
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('success=false: toast.error avec message backend, pas de invalidateQueries, pas de options.onSuccess', async () => {
    apiClientMock.mockResolvedValue({ success: false, message: 'Nope' });

    const queryClient = makeQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const onSuccess = jest.fn();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteMedia({ onSuccess }), { wrapper });

    await act(async () => {
      await result.current.deleteMediaAsync({ mediaId: 'media-2' });
    });

    expect(showLoader).toHaveBeenCalledTimes(1);
    expect(hideLoader).toHaveBeenCalledTimes(1);

    expect(toast.error).toHaveBeenCalledWith('Suppression de la ressource échouée', {
      description: 'Nope',
    });

    expect(toast.success).not.toHaveBeenCalled();
    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('success=false sans message: toast.error avec fallback', async () => {
    apiClientMock.mockResolvedValue({ success: false });

    const queryClient = makeQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteMedia(), { wrapper });

    await act(async () => {
      await result.current.deleteMediaAsync({ mediaId: 'media-3' });
    });

    expect(toast.error).toHaveBeenCalledWith('Suppression de la ressource échouée', {
      description: 'Une erreur est survenue.',
    });
  });

  it('onError: hideLoader + toast.error avec message d’erreur', async () => {
    apiClientMock.mockRejectedValue(new Error('Boom'));

    const queryClient = makeQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteMedia(), { wrapper });

    await act(async () => {
      await expect(result.current.deleteMediaAsync({ mediaId: 'media-4' })).rejects.toThrow('Boom');
    });

    expect(showLoader).toHaveBeenCalledTimes(1);
    expect(hideLoader).toHaveBeenCalledTimes(1);

    expect(toast.error).toHaveBeenCalledWith('Suppression de la ressource échouée', {
      description: 'Boom',
    });

    // pas d’invalidation sur erreur
    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
