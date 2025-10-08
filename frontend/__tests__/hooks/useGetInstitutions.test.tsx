jest.mock('@clerk/nextjs', () => ({
  __esModule: true,
  useAuth: jest.fn(),
}));

import { useAuth } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { useGetInstitutions } from '@/hooks/institution/useGetInstitutions';

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

describe('useGetInstitutions', () => {
  let mockGetToken: jest.Mock;

  const mockInstitutions = [
    {
      id: '1',
      name: 'Test Institution 1',
      description: 'Test Description 1',
      website: 'https://test1.com',
      geographicZones: ['UEMOA'],
      logoUrl: 'https://logo1.com',
      status: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Test Institution 2',
      description: 'Test Description 2',
      website: 'https://test2.com',
      geographicZones: ['CEMAC'],
      logoUrl: 'https://logo2.com',
      status: 'ACTIVE',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  const mockPagination = {
    page: 1,
    limit: 10,
    total: 2,
    totalPages: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();

    mockGetToken = jest.fn().mockResolvedValue('test-token');
    mockUseAuth.mockReturnValue({ getToken: mockGetToken });

    mockFetch.mockClear();
    process.env.NEXT_PUBLIC_API_URL = 'http://api.local';
  });

  it('fetches institutions successfully with default parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: mockInstitutions,
          pagination: mockPagination,
        }),
    });

    const { result } = renderHook(() => useGetInstitutions(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetToken).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/institutions?page=1&limit=10`,
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      })
    );
    expect(result.current.institutions).toEqual(mockInstitutions);
    expect(result.current.pagination).toEqual(mockPagination);
  });

  it('fetches institutions with custom pagination parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: mockInstitutions,
          pagination: { ...mockPagination, page: 2, limit: 5 },
        }),
    });

    const { result } = renderHook(() => useGetInstitutions({ page: 2, limit: 5 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/institutions?page=2&limit=5`,
      expect.any(Object)
    );
    expect(result.current.institutions).toEqual(mockInstitutions);
    expect(result.current.pagination?.page).toBe(2);
    expect(result.current.pagination?.limit).toBe(5);
  });

  it('returns empty array when data is not available', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: [],
          pagination: { ...mockPagination, total: 0 },
        }),
    });

    const { result } = renderHook(() => useGetInstitutions(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.institutions).toEqual([]);
    expect(result.current.pagination?.total).toBe(0);
  });

  it('handles fetch network error', async () => {
    const error = new Error('Network error');
    mockFetch.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useGetInstitutions(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.institutions).toEqual([]);
    expect(result.current.error).toBeTruthy();
  });

  it('handles non-ok response with message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({ message: 'Server error' }),
    });

    const { result } = renderHook(() => useGetInstitutions(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.institutions).toEqual([]);
    expect(result.current.error?.message).toBe('Server error');
  });

  it('handles non-ok response with errors array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ errors: [{ message: 'Validation error' }] }),
    });

    const { result } = renderHook(() => useGetInstitutions(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.institutions).toEqual([]);
    expect(result.current.error?.message).toBe('Validation error');
  });

  it('handles non-ok response with unparsable json', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('Invalid JSON')),
    });

    const { result } = renderHook(() => useGetInstitutions(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.institutions).toEqual([]);
    expect(result.current.error?.message).toBe('Error HTTP 500: Internal Server Error');
  });

  it('handles null token (no Authorization header)', async () => {
    mockGetToken.mockResolvedValue(null);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: mockInstitutions,
          pagination: mockPagination,
        }),
    });

    const { result } = renderHook(() => useGetInstitutions(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' }, // No Authorization header
      })
    );
    expect(result.current.institutions).toEqual(mockInstitutions);
  });

  it('can refetch institutions', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: mockInstitutions,
          pagination: mockPagination,
        }),
    });

    const { result } = renderHook(() => useGetInstitutions(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledTimes(1);

    result.current.refetch();

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
  });

  it('updates queryKey when parameters change', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: mockInstitutions,
          pagination: mockPagination,
        }),
    });

    const { result, rerender } = renderHook(
      ({ page, limit }) => useGetInstitutions({ page, limit }),
      {
        wrapper,
        initialProps: { page: 1, limit: 10 },
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/institutions?page=1&limit=10`,
      expect.any(Object)
    );

    rerender({ page: 2, limit: 10 });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/institutions?page=2&limit=10`,
        expect.any(Object)
      );
    });
  });

  it('handles non-ok response with no message or errors (fallback to default)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useGetInstitutions(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.institutions).toEqual([]);
    expect(result.current.error?.message).toBe('Failed to fetch institutions');
  });
});
