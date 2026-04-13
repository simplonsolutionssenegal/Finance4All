/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';

import { useMediaProgressMap } from '@/hooks/media/useMediaProgressMap';
import type { MediaProgressDTO } from '@/types/media';

const getTokenMock = jest.fn();

jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: getTokenMock,
  }),
}));

jest.mock('@/lib/api-client', () => ({
  apiClient: jest.fn(),
}));

const useQueriesMock = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueries: (...args: unknown[]) => useQueriesMock(...args),
}));

const makeProgress = (overrides: Partial<MediaProgressDTO> = {}): MediaProgressDTO => ({
  id: 'progress-1',
  userId: 'user-1',
  mediaId: 'media-1',
  currentPosition: 60,
  duration: 120,
  completionRate: 50,
  isCompleted: false,
  lastWatchedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('useMediaProgressMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQueriesMock.mockReturnValue([]);
  });

  it('returns empty map and not loading when no mediaIds', () => {
    useQueriesMock.mockReturnValue([]);

    const { result } = renderHook(() => useMediaProgressMap([]));

    expect(result.current.mediaProgressMap.size).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('filters out null, undefined, and duplicate mediaIds', () => {
    useQueriesMock.mockReturnValue([]);

    renderHook(() => useMediaProgressMap(['media-1', null, undefined, 'media-1', 'media-2']));

    expect(useQueriesMock).toHaveBeenCalledTimes(1);
    const callArg = useQueriesMock.mock.calls[0][0];
    const queryKeys = callArg.queries.map((q: { queryKey: string[] }) => q.queryKey);
    expect(queryKeys).toEqual([
      ['media-progress', 'media-1'],
      ['media-progress', 'media-2'],
    ]);
  });

  it('returns isLoading true when any query is loading', () => {
    useQueriesMock.mockReturnValue([
      { isLoading: true, data: undefined },
      { isLoading: false, data: undefined },
    ]);

    const { result } = renderHook(() => useMediaProgressMap(['media-1', 'media-2']));

    expect(result.current.isLoading).toBe(true);
  });

  it('builds progressMap from successful query results', () => {
    const progress1 = makeProgress({ mediaId: 'media-1', completionRate: 50 });
    const progress2 = makeProgress({
      id: 'progress-2',
      mediaId: 'media-2',
      completionRate: 100,
      isCompleted: true,
    });

    useQueriesMock.mockReturnValue([
      { isLoading: false, data: { success: true, data: progress1 } },
      { isLoading: false, data: { success: true, data: progress2 } },
    ]);

    const { result } = renderHook(() => useMediaProgressMap(['media-1', 'media-2']));

    expect(result.current.mediaProgressMap.size).toBe(2);
    expect(result.current.mediaProgressMap.get('media-1')).toEqual(progress1);
    expect(result.current.mediaProgressMap.get('media-2')).toEqual(progress2);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles queries with no data gracefully', () => {
    useQueriesMock.mockReturnValue([
      { isLoading: false, data: undefined },
      { isLoading: false, data: { success: true, data: null } },
      { isLoading: false, data: { success: false } },
    ]);

    const { result } = renderHook(() => useMediaProgressMap(['media-1', 'media-2', 'media-3']));

    expect(result.current.mediaProgressMap.size).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns isLoading false when all queries complete', () => {
    const progress = makeProgress({ mediaId: 'media-1' });

    useQueriesMock.mockReturnValue([
      { isLoading: false, data: { success: true, data: progress } },
      {
        isLoading: false,
        data: { success: true, data: makeProgress({ id: 'progress-2', mediaId: 'media-2' }) },
      },
    ]);

    const { result } = renderHook(() => useMediaProgressMap(['media-1', 'media-2']));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.mediaProgressMap.size).toBe(2);
  });
});
