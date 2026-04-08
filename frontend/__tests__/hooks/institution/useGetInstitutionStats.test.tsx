jest.mock('@clerk/nextjs', () => ({
  __esModule: true,
  useAuth: jest.fn(),
}));

import { useAuth } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { useGetInstitutionStats } from '@/hooks/institution/useGetInstitutionStats';

const mockUseAuth = useAuth as jest.Mock;

global.fetch = jest.fn();
const mockFetch = fetch as jest.Mock;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useGetInstitutionStats', () => {
  let mockGetToken: jest.Mock;

  const mockStats = {
    total: 25,
    active: 10,
    inactive: 7,
    pending: 8,
    archived: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();

    mockGetToken = jest.fn().mockResolvedValue('test-token');
    mockUseAuth.mockReturnValue({ getToken: mockGetToken });

    mockFetch.mockClear();
    process.env.NEXT_PUBLIC_API_URL = 'http://api.local';
  });

  it('fetches institution stats successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: mockStats,
        }),
    });

    const { result } = renderHook(() => useGetInstitutionStats(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetToken).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/institutions/stats`,
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      })
    );
    expect(result.current.stats).toEqual(mockStats);
  });

  it('returns undefined stats when data is not available yet', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: undefined,
        }),
    });

    const { result } = renderHook(() => useGetInstitutionStats(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.stats).toBeUndefined();
  });

  it('handles fetch network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useGetInstitutionStats(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.stats).toBeUndefined();
    expect(result.current.error?.message).toBe('Network error');
  });

  it('handles non-ok response with message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({ message: 'Server error' }),
    });

    const { result } = renderHook(() => useGetInstitutionStats(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.stats).toBeUndefined();
    expect(result.current.error?.message).toBe('Server error');
  });

  it('handles non-ok response with errors array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ errors: [{ message: 'Validation error' }] }),
    });

    const { result } = renderHook(() => useGetInstitutionStats(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Validation error');
  });

  it('handles null token without Authorization header', async () => {
    mockGetToken.mockResolvedValue(null);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: mockStats,
        }),
    });

    const { result } = renderHook(() => useGetInstitutionStats(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/institutions/stats`,
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(result.current.stats).toEqual(mockStats);
  });

  it('can refetch institution stats', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: mockStats,
        }),
    });

    const { result } = renderHook(() => useGetInstitutionStats(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledTimes(1);

    result.current.refetch();

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
  });

  it('falls back to default error message when backend returns no details', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useGetInstitutionStats(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Failed to GET institutions/stats');
  });
});
