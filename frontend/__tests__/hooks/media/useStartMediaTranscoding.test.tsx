/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act, renderHook } from '@testing-library/react';

import { useStartMediaTranscoding } from '@/hooks/media/useStartMediaTranscoding';

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

describe('useStartMediaTranscoding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrgId = 'org-1';
  });

  it('mediaId manquant => retourne null', async () => {
    const { result } = renderHook(() => useStartMediaTranscoding());

    await act(async () => {
      const response = await result.current.startTranscoding('');
      expect(response).toBeNull();
    });
  });

  it('orgId manquant => retourne null', async () => {
    mockOrgId = null;
    const { result } = renderHook(() => useStartMediaTranscoding());

    await act(async () => {
      const response = await result.current.startTranscoding('media-1');
      expect(response).toBeNull();
    });
  });

  it('token manquant => retourne null', async () => {
    getTokenMock.mockResolvedValueOnce(null);
    const { result } = renderHook(() => useStartMediaTranscoding());

    await act(async () => {
      const response = await result.current.startTranscoding('media-2');
      expect(response).toBeNull();
    });
  });

  it('success => appelle API avec organizationId et qualities', async () => {
    getTokenMock.mockResolvedValueOnce('token-123');
    apiClientMock.mockResolvedValueOnce({
      success: true,
      data: { id: 'job-1', mediaId: 'media-3', status: 'PROCESSING', progress: 0 },
    });

    const { result } = renderHook(() => useStartMediaTranscoding());

    let promise: Promise<unknown> | undefined;
    await act(async () => {
      promise = result.current.startTranscoding('media-3', ['Q720P']);
    });

    await act(async () => {
      await promise;
    });

    expect(apiClientMock).toHaveBeenCalledWith('media/media-3/transcode', 'POST', 'token-123', {
      organizationId: 'org-1',
      qualities: ['Q720P'],
    });
    expect(result.current.isStarting).toBe(false);
  });
});
