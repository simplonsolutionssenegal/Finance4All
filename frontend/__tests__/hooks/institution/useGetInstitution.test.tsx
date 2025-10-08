jest.mock('@clerk/nextjs', () => ({
  __esModule: true,
  useAuth: jest.fn(),
}));

import { useAuth } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { useGetInstitution } from '@/hooks/institution/useGetInstitution';
import { InstitutionStatus } from '@/types/Institution';

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

describe('useGetInstitution', () => {
  let mockGetToken: jest.Mock;

  const mockInstitution = {
    id: '1',
    name: 'Test Institution',
    description: 'Test Description',
    website: 'https://test.com',
    geographicZones: ['UEMOA'],
    logoUrl: 'https://logo.com',
    status: InstitutionStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();

    mockGetToken = jest.fn().mockResolvedValue('test-token');
    mockUseAuth.mockReturnValue({ getToken: mockGetToken });

    mockFetch.mockClear();
    process.env.NEXT_PUBLIC_API_URL = 'http://api.local';
  });

  it('fetches institution successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: mockInstitution,
        }),
    });

    const { result } = renderHook(() => useGetInstitution('1'), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetToken).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/institutions/1`,
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      })
    );
    expect(result.current.institution).toEqual(mockInstitution);
  });

  it('does not fetch when id is empty', async () => {
    const { result } = renderHook(() => useGetInstitution(''), { wrapper });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.institution).toBeUndefined();
  });

  it('handles fetch network error', async () => {
    const error = new Error('Network error');
    mockFetch.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useGetInstitution('1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.institution).toBeUndefined();
    expect(result.current.error).toBeTruthy();
  });

  it('handles non-ok response with message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({ message: 'Institution not found' }),
    });

    const { result } = renderHook(() => useGetInstitution('1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.institution).toBeUndefined();
    expect(result.current.error?.message).toBe('Institution not found');
  });

  it('handles non-ok response with errors array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ errors: [{ message: 'Invalid ID' }] }),
    });

    const { result } = renderHook(() => useGetInstitution('1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.institution).toBeUndefined();
    expect(result.current.error?.message).toBe('Invalid ID');
  });

  it('handles non-ok response with unparsable json', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('Invalid JSON')),
    });

    const { result } = renderHook(() => useGetInstitution('1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.institution).toBeUndefined();
    expect(result.current.error?.message).toBe('Error HTTP 500: Internal Server Error');
  });

  it('handles null token (no Authorization header)', async () => {
    mockGetToken.mockResolvedValue(null);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: mockInstitution,
        }),
    });

    const { result } = renderHook(() => useGetInstitution('1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' }, // No Authorization header
      })
    );
    expect(result.current.institution).toEqual(mockInstitution);
  });

  it('can refetch institution', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: mockInstitution,
        }),
    });

    const { result } = renderHook(() => useGetInstitution('1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledTimes(1);

    result.current.refetch();

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
  });

  it('handles non-ok response with no message or errors (fallback to default)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}),
    });

    const { result } = renderHook(() => useGetInstitution('1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.institution).toBeUndefined();
    expect(result.current.error?.message).toBe('Failed to GET institutions/1');
  });

  it('updates queryKey when id changes', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: mockInstitution,
        }),
    });

    const { result, rerender } = renderHook(({ id }) => useGetInstitution(id), {
      wrapper,
      initialProps: { id: '1' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/institutions/1`,
      expect.any(Object)
    );

    rerender({ id: '2' });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/institutions/2`,
        expect.any(Object)
      );
    });
  });
});
