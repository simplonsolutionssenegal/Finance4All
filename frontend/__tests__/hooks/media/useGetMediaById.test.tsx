/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useGetMediaById } from '@/hooks/media/useGetMediaById';

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

describe('useGetMediaById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('id vide => query désactivée', async () => {
    renderHook(() => useGetMediaById(''), { wrapper: makeWrapper() });

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(getTokenMock).not.toHaveBeenCalled();
    expect(apiClientMock).not.toHaveBeenCalled();
  });

  it('success => retourne le média', async () => {
    getTokenMock.mockResolvedValueOnce('token-1');

    const mediaData = {
      id: 'media-1',
      filename: 'file.mp4',
      originalName: 'File',
      mimeType: 'video/mp4',
      type: 'VIDEO',
      size: 123,
      url: 'https://cdn.test/media-1',
      bucket: 'media',
      path: 'media-1',
      metadata: null,
      isTemporary: false,
      expiresAt: null,
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    };

    apiClientMock.mockResolvedValueOnce({
      success: true,
      data: mediaData,
    });

    const { result } = renderHook(() => useGetMediaById('media-1'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(apiClientMock).toHaveBeenCalledWith('media/media-1', 'GET', 'token-1');
    expect(result.current.media).toEqual(mediaData);
  });

  it('apiClient throw => isError=true', async () => {
    getTokenMock.mockResolvedValueOnce('token-err');
    apiClientMock.mockRejectedValueOnce(new Error('Boom'));

    const { result } = renderHook(() => useGetMediaById('media-err'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.media).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
