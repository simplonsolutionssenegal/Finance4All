/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useGetMediaStream } from '@/hooks/media/useGetMediaStream';

let mockOrgId: string | null = 'org-1';
const getTokenMock = jest.fn();

jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: getTokenMock,
    orgId: mockOrgId,
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

describe('useGetMediaStream', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrgId = 'org-1';
  });

  it('mediaId manquant => query désactivée', async () => {
    renderHook(() => useGetMediaStream(undefined), { wrapper: makeWrapper() });

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(getTokenMock).not.toHaveBeenCalled();
    expect(apiClientMock).not.toHaveBeenCalled();
  });

  it('success => retourne le manifest et appelle l’API', async () => {
    getTokenMock.mockResolvedValueOnce('token-123');
    apiClientMock.mockResolvedValueOnce({
      success: true,
      data: {
        masterPlaylistUrl: 'https://cdn.test/master.m3u8',
        variants: [],
        transcodingStatus: 'COMPLETED',
      },
    });

    const { result } = renderHook(() => useGetMediaStream('media-1'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(apiClientMock).toHaveBeenCalledWith(
      'media/media-1/stream?organizationId=org-1',
      'GET',
      'token-123'
    );
    expect(result.current.stream?.masterPlaylistUrl).toBe('https://cdn.test/master.m3u8');
  });

  it('token manquant => isError=true', async () => {
    getTokenMock.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useGetMediaStream('media-2'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('options.enabled=false => query désactivée', async () => {
    renderHook(() => useGetMediaStream('media-3', { enabled: false }), {
      wrapper: makeWrapper(),
    });

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(getTokenMock).not.toHaveBeenCalled();
    expect(apiClientMock).not.toHaveBeenCalled();
  });
});
