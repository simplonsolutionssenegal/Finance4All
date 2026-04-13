import { act, renderHook } from '@testing-library/react';

import { useBeneficiaryProgressByUserId } from '@/hooks/beneficiary/useBeneficiaryProgressByUserId';
import type { BeneficiaireDashboardData } from '@/hooks/beneficiary/useBeneficiaireDashboardData';

// ---------------------------------------------------------------------------
// Mock global fetch
// ---------------------------------------------------------------------------
const mockFetch = jest.fn() as jest.Mock;
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fakeDashboardData: BeneficiaireDashboardData = {
  stats: {
    modulesCompleted: { current: 3, total: 10 },
    learningTime: '12h 30min',
    quizzesPassed: { current: 5, total: 8 },
    globalProgress: 45,
    videosWatched: { current: 7, total: 20 },
    averageSessionTime: '25min',
    learningStreakDays: 4,
  },
  moduleStats: {
    completed: 3,
    inProgress: 2,
    notStarted: 5,
    total: 10,
  },
  monthlyProgress: [
    { month: '2025-01', progress: 10, totalMinutes: 120, sessions: 5 },
    { month: '2025-02', progress: 25, totalMinutes: 300, sessions: 12 },
  ],
  recentActivity: [
    {
      chapterId: 'ch-1',
      chapterTitle: 'Introduction',
      lessonTitle: 'Lesson 1',
      moduleTitle: 'Module A',
      progress: 80,
      lastWatchedAt: new Date('2025-03-01'),
      remainingTime: '5min',
    },
  ],
  timeByModule: [
    {
      moduleId: 'mod-1',
      moduleTitle: 'Module A',
      totalSeconds: 3600,
      completionPercent: 60,
    },
  ],
};

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function jsonParseErrorResponse(status: number): Response {
  return {
    ok: false,
    status,
    json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useBeneficiaryProgressByUserId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. undefined clerkUserId ------------------------------------------------
  it('returns null data, isLoading=false and no error when clerkUserId is undefined', async () => {
    const { result } = renderHook(() => useBeneficiaryProgressByUserId(undefined));

    // Give any pending micro-tasks a chance to flush
    await act(async () => {});

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // 2. Successful fetch -----------------------------------------------------
  it('fetches data and returns it on success', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(fakeDashboardData));

    const { result } = renderHook(() => useBeneficiaryProgressByUserId('user_123'));

    // Wait for the fetch to resolve
    await act(async () => {});

    expect(mockFetch).toHaveBeenCalledWith('/api/beneficiaries/dashboard?userId=user_123', {
      credentials: 'same-origin',
    });
    expect(result.current.data).toEqual(fakeDashboardData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // 3. Non-ok response with JSON error field --------------------------------
  it('sets error from the "error" field of a non-ok JSON response', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'Beneficiary not found' }, 404));

    const { result } = renderHook(() => useBeneficiaryProgressByUserId('user_404'));

    await act(async () => {});

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Beneficiary not found');
  });

  // 4. Non-ok response with JSON message field (fallback) -------------------
  it('falls back to "message" field when "error" is absent in the JSON body', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ message: 'Access denied' }, 403));

    const { result } = renderHook(() => useBeneficiaryProgressByUserId('user_403'));

    await act(async () => {});

    expect(result.current.error).toBe('Access denied');
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  // 5. Non-ok response with non-parseable JSON (fallback to status) ---------
  it('falls back to status code when response body is not valid JSON', async () => {
    mockFetch.mockResolvedValueOnce(jsonParseErrorResponse(500));

    const { result } = renderHook(() => useBeneficiaryProgressByUserId('user_500'));

    await act(async () => {});

    expect(result.current.error).toBe('Erreur 500');
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  // 6. Network error --------------------------------------------------------
  it('handles a network error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    const { result } = renderHook(() => useBeneficiaryProgressByUserId('user_net'));

    await act(async () => {});

    expect(result.current.error).toBe('Failed to fetch');
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  // 6b. Non-Error throw uses fallback message
  it('uses fallback error message when thrown value is not an Error instance', async () => {
    mockFetch.mockRejectedValueOnce('some string');

    const { result } = renderHook(() => useBeneficiaryProgressByUserId('user_str'));

    await act(async () => {});

    expect(result.current.error).toBe('Erreur lors du chargement');
  });

  // 7. Re-fetch when clerkUserId changes ------------------------------------
  it('re-fetches when clerkUserId changes', async () => {
    const secondData: BeneficiaireDashboardData = {
      ...fakeDashboardData,
      stats: { ...fakeDashboardData.stats, globalProgress: 90 },
    };

    mockFetch
      .mockResolvedValueOnce(jsonResponse(fakeDashboardData))
      .mockResolvedValueOnce(jsonResponse(secondData));

    const { result, rerender } = renderHook(
      ({ userId }: { userId: string | undefined }) => useBeneficiaryProgressByUserId(userId),
      { initialProps: { userId: 'user_a' as string | undefined } }
    );

    await act(async () => {});

    expect(result.current.data).toEqual(fakeDashboardData);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Change the userId
    rerender({ userId: 'user_b' });

    await act(async () => {});

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenLastCalledWith('/api/beneficiaries/dashboard?userId=user_b', {
      credentials: 'same-origin',
    });
    expect(result.current.data).toEqual(secondData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // 7b. Changing to undefined stops fetching
  it('does not fetch when clerkUserId changes to undefined', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(fakeDashboardData));

    const { result, rerender } = renderHook(
      ({ userId }: { userId: string | undefined }) => useBeneficiaryProgressByUserId(userId),
      { initialProps: { userId: 'user_a' as string | undefined } }
    );

    await act(async () => {});

    expect(mockFetch).toHaveBeenCalledTimes(1);

    rerender({ userId: undefined });

    await act(async () => {});

    // No additional fetch call
    expect(mockFetch).toHaveBeenCalledTimes(1);
    // Previous data is still present (hook does not clear it)
    expect(result.current.data).toEqual(fakeDashboardData);
  });

  // Encodes special characters in userId
  it('encodes special characters in the clerkUserId query parameter', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(fakeDashboardData));

    renderHook(() => useBeneficiaryProgressByUserId('user id&special=yes'));

    await act(async () => {});

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/beneficiaries/dashboard?userId=user%20id%26special%3Dyes',
      { credentials: 'same-origin' }
    );
  });
});
