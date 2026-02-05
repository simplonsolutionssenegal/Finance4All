/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useMediaProgress } from '@/hooks/media/useMediaProgress';

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

describe('useMediaProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrgId = 'org-1';
  });

  it('mediaId manquant => query désactivée', async () => {
    renderHook(() => useMediaProgress(undefined), { wrapper: makeWrapper() });

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(getTokenMock).not.toHaveBeenCalled();
    expect(apiClientMock).not.toHaveBeenCalled();
  });

  it('success => retourne la progression', async () => {
    getTokenMock.mockResolvedValueOnce('token-1');
    apiClientMock.mockResolvedValueOnce({
      success: true,
      data: {
        id: 'progress-1',
        userId: 'user-1',
        mediaId: 'media-1',
        currentPosition: 10,
        duration: 100,
        completionRate: 10,
        isCompleted: false,
        lastWatchedAt: '2026-02-01T00:00:00.000Z',
      },
    });

    const { result } = renderHook(() => useMediaProgress('media-1'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.progress?.currentPosition).toBe(10);
  });

  it('updateProgress poste la progression', async () => {
    getTokenMock.mockResolvedValue('token-2');
    apiClientMock.mockResolvedValueOnce({
      success: true,
      data: {
        id: 'progress-2',
        userId: 'user-1',
        mediaId: 'media-2',
        currentPosition: 5,
        duration: 100,
        completionRate: 5,
        isCompleted: false,
        lastWatchedAt: '2026-02-01T00:00:00.000Z',
      },
    });
    apiClientMock.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useMediaProgress('media-2'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateProgress(25, 120);
    });

    expect(apiClientMock).toHaveBeenCalledWith('media/media-2/progress', 'POST', 'token-2', {
      organizationId: 'org-1',
      currentPosition: 25,
      duration: 120,
    });
  });

  it('updateProgress ignore les erreurs API', async () => {
    getTokenMock.mockResolvedValue('token-3');
    apiClientMock.mockResolvedValueOnce({
      success: true,
      data: {
        id: 'progress-3',
        userId: 'user-1',
        mediaId: 'media-3',
        currentPosition: 0,
        duration: 100,
        completionRate: 0,
        isCompleted: false,
        lastWatchedAt: '2026-02-01T00:00:00.000Z',
      },
    });
    apiClientMock.mockRejectedValueOnce(new Error('Boom'));

    const { result } = renderHook(() => useMediaProgress('media-3'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.updateProgress(10, 100)).resolves.toBeUndefined();
    });
  });

  it('updateProgress ignore si pas d’orgId', async () => {
    mockOrgId = null;
    getTokenMock.mockResolvedValue('token-4');

    const { result } = renderHook(() => useMediaProgress('media-4'), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.updateProgress(10, 100);
    });

    expect(apiClientMock).not.toHaveBeenCalled();
  });
});
