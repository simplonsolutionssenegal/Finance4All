import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import {
  useBeneficiaireDashboardData,
  useBeneficiaireDashboardDataRealtime,
  mockBeneficiaireDashboardData,
} from '@/hooks/beneficiary/useBeneficiaireDashboardData';

// Mock fetch globally
global.fetch = jest.fn();

describe('useBeneficiaireDashboardData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial state', () => {
    it('should have initial loading state', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoaded).toBe(false);
    });

    it('should provide refetch function', () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      expect(typeof result.current.refetch).toBe('function');
    });

    it('should provide resetError function', () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      expect(typeof result.current.resetError).toBe('function');
    });
  });

  describe('Successful data fetching', () => {
    it('should fetch dashboard data on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockBeneficiaireDashboardData);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoaded).toBe(true);
    });

    it('should call fetch with correct URL without userId', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/beneficiaire/dashboard/stats');
      });
    });

    it('should call fetch with correct URL with userId', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      renderHook(() => useBeneficiaireDashboardData('user_123'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/beneficiaire/dashboard/stats?userId=user_123'
        );
      });
    });

    it('should set isLoaded to true after successful fetch', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });
    });

    it('should stop loading after successful fetch', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.data).toBeNull();
      expect(result.current.isLoaded).toBe(true);
    });

    it('should handle non-ok response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Données introuvables' }),
      });

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Données introuvables');
      expect(result.current.data).toBeNull();
    });

    it('should handle non-ok response without error message', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      });

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Erreur 500: Internal Server Error');
    });

    it('should handle response.json() parsing error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Erreur 500: Internal Server Error');
    });

    it('should handle null response data', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => null,
      });

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Aucune donnée reçue du serveur');
      expect(result.current.data).toBeNull();
    });

    it('should handle undefined response data', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => undefined,
      });

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Aucune donnée reçue du serveur');
    });

    it('should handle string error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue('String error message');

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('String error message');
    });

    it('should handle unknown error type', async () => {
      (global.fetch as jest.Mock).mockRejectedValue({ unknown: 'error' });

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(
        'Une erreur est survenue lors de la récupération des données'
      );
    });

    it('should log errors to console', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      (global.fetch as jest.Mock).mockRejectedValue(error);

      renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Erreur lors de la récupération des données du dashboard:',
          error
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('resetError function', () => {
    it('should reset error to null', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
      });

      act(() => {
        result.current.resetError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should not affect other state when resetting error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
      });

      const previousIsLoading = result.current.isLoading;
      const previousIsLoaded = result.current.isLoaded;

      act(() => {
        result.current.resetError();
      });

      expect(result.current.isLoading).toBe(previousIsLoading);
      expect(result.current.isLoaded).toBe(previousIsLoaded);
    });
  });

  describe('refetch function', () => {
    it('should refetch data when called', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.refetch();
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should reset error before refetching', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBeneficiaireDashboardData,
        });

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(result.current.error).toBe('First error');
      });

      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it('should set loading state during refetch', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Start refetch and check loading state
      act(() => {
        result.current.refetch();
      });

      // Loading should be true at some point
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify refetch completed
      expect(result.current.data).toEqual(mockBeneficiaireDashboardData);
    });

    it('should update data after refetch', async () => {
      const firstData = { ...mockBeneficiaireDashboardData };
      const updatedData = {
        ...mockBeneficiaireDashboardData,
        stats: {
          ...mockBeneficiaireDashboardData.stats,
          globalProgress: 85,
        },
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => firstData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => updatedData,
        });

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(result.current.data?.stats.globalProgress).toBe(75);
      });

      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.data?.stats.globalProgress).toBe(85);
      });
    });
  });

  describe('userId changes', () => {
    it('should refetch when userId changes', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      const { rerender } = renderHook(({ userId }) => useBeneficiaireDashboardData(userId), {
        initialProps: { userId: 'user_1' },
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/beneficiaire/dashboard/stats?userId=user_1'
        );
      });

      rerender({ userId: 'user_2' });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/beneficiaire/dashboard/stats?userId=user_2'
        );
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle userId changing from defined to undefined', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      const { rerender } = renderHook(({ userId }) => useBeneficiaireDashboardData(userId), {
        initialProps: { userId: 'user_1' as string | undefined },
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/beneficiaire/dashboard/stats?userId=user_1'
        );
      });

      rerender({ userId: undefined });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/beneficiaire/dashboard/stats');
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid successive calls', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      const { result } = renderHook(() => useBeneficiaireDashboardData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await Promise.all([
          result.current.refetch(),
          result.current.refetch(),
          result.current.refetch(),
        ]);
      });

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle empty userId string', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      renderHook(() => useBeneficiaireDashboardData(''));

      await waitFor(() => {
        // Empty string is falsy, so hook treats it as no userId
        expect(global.fetch).toHaveBeenCalledWith('/api/beneficiaire/dashboard/stats');
      });
    });

    it('should handle special characters in userId', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      renderHook(() => useBeneficiaireDashboardData('user@123#'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/beneficiaire/dashboard/stats?userId=user@123#'
        );
      });
    });
  });
});

describe('useBeneficiaireDashboardDataRealtime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic functionality', () => {
    it('should fetch data on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      const { result } = renderHook(() => useBeneficiaireDashboardDataRealtime());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockBeneficiaireDashboardData);
    });

    it('should provide all return values from base hook', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      const { result } = renderHook(() => useBeneficiaireDashboardDataRealtime());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('isLoaded');
      expect(result.current).toHaveProperty('refetch');
      expect(result.current).toHaveProperty('resetError');
    });
  });

  describe('Auto-refresh functionality', () => {
    it('should auto-refresh at specified interval', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      renderHook(() => useBeneficiaireDashboardDataRealtime(undefined, 10000));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(3);
      });
    });

    it('should use default 30 second interval', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      renderHook(() => useBeneficiaireDashboardDataRealtime());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      act(() => {
        jest.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should not auto-refresh when interval is 0', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      renderHook(() => useBeneficiaireDashboardDataRealtime(undefined, 0));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should not auto-refresh when interval is negative', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      renderHook(() => useBeneficiaireDashboardDataRealtime(undefined, -1000));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cleanup', () => {
    it('should clear interval on unmount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      const { unmount } = renderHook(() => useBeneficiaireDashboardDataRealtime(undefined, 10000));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      unmount();

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should clear and restart interval when refreshInterval changes', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      const { rerender } = renderHook(
        ({ interval }) => useBeneficiaireDashboardDataRealtime(undefined, interval),
        { initialProps: { interval: 10000 } }
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      rerender({ interval: 5000 });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Integration with userId', () => {
    it('should work with userId parameter', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      renderHook(() => useBeneficiaireDashboardDataRealtime('user_123', 10000));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/beneficiaire/dashboard/stats?userId=user_123'
        );
      });

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/beneficiaire/dashboard/stats?userId=user_123'
        );
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should update when userId changes', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaireDashboardData,
      });

      const { rerender } = renderHook(
        ({ userId }) => useBeneficiaireDashboardDataRealtime(userId, 10000),
        { initialProps: { userId: 'user_1' } }
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/beneficiaire/dashboard/stats?userId=user_1'
        );
      });

      rerender({ userId: 'user_2' });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/beneficiaire/dashboard/stats?userId=user_2'
        );
      });
    });
  });

  describe('Error handling with auto-refresh', () => {
    it('should continue auto-refresh even after errors', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBeneficiaireDashboardData,
        })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBeneficiaireDashboardData,
        });

      const { result } = renderHook(() => useBeneficiaireDashboardDataRealtime(undefined, 10000));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.data).toEqual(mockBeneficiaireDashboardData);
      });

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });
});

describe('mockBeneficiaireDashboardData', () => {
  it('should have correct structure', () => {
    expect(mockBeneficiaireDashboardData).toHaveProperty('stats');
    expect(mockBeneficiaireDashboardData).toHaveProperty('moduleStats');
    expect(mockBeneficiaireDashboardData).toHaveProperty('monthlyProgress');
  });

  it('should have valid stats data', () => {
    expect(mockBeneficiaireDashboardData.stats.modulesCompleted).toEqual({
      current: 8,
      total: 26,
    });
    expect(mockBeneficiaireDashboardData.stats.learningTime).toBe('24h 30m');
    expect(mockBeneficiaireDashboardData.stats.quizzesPassed).toEqual({
      current: 12,
      total: 15,
    });
    expect(mockBeneficiaireDashboardData.stats.globalProgress).toBe(75);
  });

  it('should have valid module stats', () => {
    expect(mockBeneficiaireDashboardData.moduleStats.completed).toBe(8);
    expect(mockBeneficiaireDashboardData.moduleStats.inProgress).toBe(5);
    expect(mockBeneficiaireDashboardData.moduleStats.notStarted).toBe(13);
    expect(mockBeneficiaireDashboardData.moduleStats.total).toBe(26);
  });

  it('should have valid monthly progress', () => {
    expect(Array.isArray(mockBeneficiaireDashboardData.monthlyProgress)).toBe(true);
    expect(mockBeneficiaireDashboardData.monthlyProgress).toHaveLength(6);
    expect(mockBeneficiaireDashboardData.monthlyProgress[0]).toEqual({
      month: 'Jan',
      progress: 20,
    });
  });

  it('should have consistent module total', () => {
    const { completed, inProgress, notStarted, total } = mockBeneficiaireDashboardData.moduleStats;
    expect(completed + inProgress + notStarted).toBe(total);
  });
});
