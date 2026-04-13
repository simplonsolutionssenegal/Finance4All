import { renderHook, waitFor, act } from '@testing-library/react';

import { useBeneficiaryStats } from '@/hooks/dashboard/useBeneficiaryStats';
import type { DemographicStats } from '@/hooks/dashboard/useBeneficiaryStats';

global.fetch = jest.fn();
const mockFetch = fetch as jest.Mock;

const mockStats: DemographicStats = {
  total: 120,
  women: 65,
  youth: 40,
  inTraining: 30,
};

describe('useBeneficiaryStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts in loading state with null stats and no error', () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useBeneficiaryStats());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('fetches stats successfully without orgId', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockStats }),
    });

    const { result } = renderHook(() => useBeneficiaryStats());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/beneficiaries/stats', {
      credentials: 'same-origin',
    });
    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.error).toBeNull();
  });

  it('fetches stats successfully with orgId and encodes the query param', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockStats }),
    });

    const orgId = 'org 123/test&special=chars';

    const { result } = renderHook(() => useBeneficiaryStats(orgId));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/beneficiaries/stats?orgId=${encodeURIComponent(orgId)}`,
      { credentials: 'same-origin' }
    );
    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.error).toBeNull();
  });

  it('handles non-ok response with JSON error body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ error: 'Acces interdit' }),
    });

    const { result } = renderHook(() => useBeneficiaryStats());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBe('Acces interdit');
  });

  it('handles non-ok response with non-JSON body (fallback error message)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    });

    const { result } = renderHook(() => useBeneficiaryStats());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBe('Erreur 500');
  });

  it('handles non-ok response with JSON body missing error field', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useBeneficiaryStats());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBe('Erreur 404');
  });

  it('handles network/fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));

    const { result } = renderHook(() => useBeneficiaryStats());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBe('Network failure');
  });

  it('handles non-Error throw from fetch', async () => {
    mockFetch.mockRejectedValueOnce('some string error');

    const { result } = renderHook(() => useBeneficiaryStats());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBe('Erreur');
  });

  it('re-fetches when orgId changes', async () => {
    const statsOrg1: DemographicStats = {
      total: 50,
      women: 30,
      youth: 15,
      inTraining: 10,
    };
    const statsOrg2: DemographicStats = {
      total: 80,
      women: 45,
      youth: 25,
      inTraining: 20,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: statsOrg1 }),
    });

    const { result, rerender } = renderHook(
      ({ orgId }: { orgId?: string }) => useBeneficiaryStats(orgId),
      { initialProps: { orgId: 'org-1' } }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stats).toEqual(statsOrg1);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenLastCalledWith(
      `/api/beneficiaries/stats?orgId=${encodeURIComponent('org-1')}`,
      { credentials: 'same-origin' }
    );

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: statsOrg2 }),
    });

    rerender({ orgId: 'org-2' });

    await waitFor(() => expect(result.current.stats).toEqual(statsOrg2));

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenLastCalledWith(
      `/api/beneficiaries/stats?orgId=${encodeURIComponent('org-2')}`,
      { credentials: 'same-origin' }
    );
  });

  it('clears previous error on successful re-fetch', async () => {
    mockFetch.mockRejectedValueOnce(new Error('First failure'));

    const { result, rerender } = renderHook(
      ({ orgId }: { orgId?: string }) => useBeneficiaryStats(orgId),
      { initialProps: { orgId: 'org-fail' } }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('First failure');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockStats }),
    });

    rerender({ orgId: 'org-ok' });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.stats).toEqual(mockStats);
  });
});
