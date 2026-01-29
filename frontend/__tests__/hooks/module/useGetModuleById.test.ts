import { renderHook } from '@testing-library/react';

import { useGetModuleById } from '@/hooks/module/useGetModuleById'; // adapte le chemin réel
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/lib/api-client', () => ({
  apiClient: jest.fn(),
}));

describe('useGetModuleById', () => {
  const useAuthMock = useAuth as unknown as jest.Mock;
  const useQueryMock = useQuery as unknown as jest.Mock;
  const apiClientMock = apiClient as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call useQuery with enabled=false when id is empty and return mapped fields', () => {
    const getToken = jest.fn();
    useAuthMock.mockReturnValue({ getToken });

    const refetch = jest.fn();
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    });

    const { result } = renderHook(() => useGetModuleById(''));

    // useQuery config
    expect(useQueryMock).toHaveBeenCalledTimes(1);
    const config = useQueryMock.mock.calls[0][0];

    expect(config.queryKey).toEqual(['module', '']);
    expect(config.enabled).toBe(false);
    expect(config.staleTime).toBe(5 * 60 * 1000);
    expect(typeof config.queryFn).toBe('function');

    // mapping return
    expect(result.current.module).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.refetch).toBe(refetch);
  });

  it('should call apiClient with token in queryFn when id is provided and map module from response', async () => {
    const getToken = jest.fn().mockResolvedValue('token-123');
    useAuthMock.mockReturnValue({ getToken });

    const refetch = jest.fn();
    const moduleData = { id: 'abc', title: 'Module ABC' };

    useQueryMock.mockReturnValue({
      data: { success: true, data: moduleData },
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    });

    apiClientMock.mockResolvedValue({ success: true, data: moduleData });

    const { result } = renderHook(() => useGetModuleById('abc'));

    // useQuery config
    expect(useQueryMock).toHaveBeenCalledTimes(1);
    const config = useQueryMock.mock.calls[0][0];

    expect(config.queryKey).toEqual(['module', 'abc']);
    expect(config.enabled).toBe(true);
    expect(config.staleTime).toBe(5 * 60 * 1000);

    // execute queryFn manually (puisqu'on mock useQuery)
    await config.queryFn();

    expect(getToken).toHaveBeenCalledTimes(1);
    expect(apiClientMock).toHaveBeenCalledWith('modules/abc', 'GET', 'token-123');

    // mapping return
    expect(result.current.module).toEqual(moduleData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.refetch).toBe(refetch);
  });

  it('should expose query error fields when useQuery returns an error', () => {
    const getToken = jest.fn();
    useAuthMock.mockReturnValue({ getToken });

    const refetch = jest.fn();
    const err = new Error('boom');

    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: err,
      refetch,
    });

    const { result } = renderHook(() => useGetModuleById('abc'));

    expect(result.current.module).toBeUndefined();
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(err);
    expect(result.current.refetch).toBe(refetch);
  });
});
