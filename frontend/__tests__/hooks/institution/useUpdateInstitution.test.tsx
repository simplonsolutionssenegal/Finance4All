import { useAuth } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { useUpdateInstitution } from '@/hooks/institution/useUpdateInstitution';
import type { UpdateInstitutionDto } from '@/types/Institution';

// Mock dependencies
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/contexts/LoaderContext');

global.fetch = jest.fn();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useUpdateInstitution', () => {
  const showLoader = jest.fn();
  const hideLoader = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    (useLoader as jest.Mock).mockReturnValue({ showLoader, hideLoader });
    (useAuth as jest.Mock).mockReturnValue({
      getToken: jest.fn().mockResolvedValue('test-token'),
    });
    (fetch as jest.Mock).mockClear();
  });

  const institutionData: UpdateInstitutionDto = {
    description: '',
    geographicZones: [],
    name: 'New Name',
  };
  const institutionId = 'inst-123';

  it('should handle successful institution update', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { id: institutionId, ...institutionData } }),
    });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useUpdateInstitution({ onSuccess }), { wrapper });

    act(() => {
      result.current.updateInstitution({ id: institutionId, data: institutionData });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(showLoader).toHaveBeenCalledTimes(1);
    expect(hideLoader).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Institution modifiée avec succès!');
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/institutions/${institutionId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify(institutionData),
      }
    );
  });

  it('should set isUpdating to true while mutation is pending', async () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Promise that never resolves

    const { result } = renderHook(() => useUpdateInstitution(), { wrapper });

    act(() => {
      result.current.updateInstitution({ id: institutionId, data: institutionData });
    });

    await waitFor(() => expect(result.current.isUpdating).toBe(true));

    expect(showLoader).toHaveBeenCalledTimes(1);
    expect(hideLoader).not.toHaveBeenCalled();
  });

  it('should handle failed update when API returns success: false', async () => {
    const errorMessage = 'Update failed on server';
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, message: errorMessage }),
    });

    const { result } = renderHook(() => useUpdateInstitution(), { wrapper });

    act(() => {
      result.current.updateInstitution({ id: institutionId, data: institutionData });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(showLoader).toHaveBeenCalledTimes(1);
    expect(hideLoader).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('La modification a échoué', {
      description: errorMessage,
    });
  });

  it('should handle failed update due to network error', async () => {
    const error = new Error('Network error');
    (fetch as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useUpdateInstitution(), { wrapper });

    act(() => {
      result.current.updateInstitution({ id: institutionId, data: institutionData });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(showLoader).toHaveBeenCalledTimes(1);
    expect(hideLoader).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('La modification a échoué', {
      description: 'Network error',
    });
  });

  it('should handle failed update with non-ok response and JSON error', async () => {
    const errorMessage = 'Invalid data';
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: errorMessage }),
    });

    const { result } = renderHook(() => useUpdateInstitution(), { wrapper });

    act(() => {
      result.current.updateInstitution({ id: institutionId, data: institutionData });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(hideLoader).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('La modification a échoué', {
      description: errorMessage,
    });
  });

  it('should handle failed update with non-ok response and errors array', async () => {
    const errorMessage = 'Name is required';
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ errors: [{ message: errorMessage }] }),
    });

    const { result } = renderHook(() => useUpdateInstitution(), { wrapper });

    act(() => {
      result.current.updateInstitution({ id: institutionId, data: institutionData });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(hideLoader).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('La modification a échoué', {
      description: errorMessage,
    });
  });

  it('should handle failed update with non-ok response and non-JSON body', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const { result } = renderHook(() => useUpdateInstitution(), { wrapper });

    act(() => {
      result.current.updateInstitution({ id: institutionId, data: institutionData });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(hideLoader).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('La modification a échoué', {
      description: 'Error HTTP 500: Internal Server Error',
    });
  });

  it('should handle failed update with no error message from backend', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    });

    const { result } = renderHook(() => useUpdateInstitution(), { wrapper });

    act(() => {
      result.current.updateInstitution({ id: institutionId, data: institutionData });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledWith('La modification a échoué', {
      description: `Failed to PUT institutions/${institutionId}`,
    });
  });

  it('should use default error message if error has no message', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce({}); // Throw an object without message property

    const { result } = renderHook(() => useUpdateInstitution(), { wrapper });

    act(() => {
      result.current.updateInstitution({ id: institutionId, data: institutionData });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(hideLoader).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('La modification a échoué', {
      description: 'An unexpected error occurred.',
    });
  });

  it('should not send Authorization header if token is null', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      getToken: jest.fn().mockResolvedValue(null),
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useUpdateInstitution(), { wrapper });

    act(() => {
      result.current.updateInstitution({ id: institutionId, data: institutionData });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/institutions/${institutionId}`,
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  });
});
