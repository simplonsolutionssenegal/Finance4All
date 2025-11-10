jest.mock('@clerk/nextjs', () => ({
  __esModule: true,
  useAuth: jest.fn(), // <- important
}));

jest.mock('@/contexts/LoaderContext', () => ({
  __esModule: true,
  useLoader: jest.fn(),
}));

jest.mock('sonner', () => ({
  __esModule: true,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import { useAuth } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { CreateInstitutionDto } from '@/types/Institution';

import { useLoader } from '@/contexts/LoaderContext';
import { useCreateInstitution } from '@/hooks/institution/useCreateInstitution';

const mockUseAuth = useAuth as jest.Mock;
const mockUseLoader = useLoader as unknown as jest.Mock;
const mockToast = toast as jest.Mocked<typeof toast>;

global.fetch = jest.fn();
const mockFetch = fetch as jest.Mock;

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useCreateInstitution', () => {
  let mockShowLoader: jest.Mock;
  let mockHideLoader: jest.Mock;
  let mockGetToken: jest.Mock;

  const institutionData: CreateInstitutionDto = {
    name: 'Test Institution',
    description: 'Test Description',
    geographicZones: ['UEMOA'],
    type: 'SERVICE_FINANCIER_DECENTRALISE' as const,
    pays: 'SENEGAL' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();

    mockShowLoader = jest.fn();
    mockHideLoader = jest.fn();
    mockGetToken = jest.fn().mockResolvedValue('test-token');

    mockUseAuth.mockReturnValue({ getToken: mockGetToken });
    mockUseLoader.mockReturnValue({ showLoader: mockShowLoader, hideLoader: mockHideLoader });

    mockFetch.mockClear();
    process.env.NEXT_PUBLIC_API_URL = 'http://api.local';
  });

  it('calls mutation, shows loader, and handles successful creation', async () => {
    const onSuccess = jest.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { id: 1 } }),
    });

    const { result } = renderHook(() => useCreateInstitution({ onSuccess }), { wrapper });

    result.current.createInstitution(institutionData);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockShowLoader).toHaveBeenCalledTimes(1);
    expect(mockGetToken).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/institutions`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify(institutionData),
      })
    );
    expect(mockHideLoader).toHaveBeenCalledTimes(1);
    expect(mockToast.success).toHaveBeenCalledWith('Institution créée avec succès!');
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('handles API success=false response (no onSuccess, error toast)', async () => {
    const onSuccess = jest.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: false, message: 'Creation failed' }),
    });

    const { result } = renderHook(() => useCreateInstitution({ onSuccess }), { wrapper });

    result.current.createInstitution(institutionData);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(onSuccess).not.toHaveBeenCalled();
    expect(mockHideLoader).toHaveBeenCalledTimes(1);
    expect(mockToast.error).toHaveBeenCalledWith('La création a échoué', {
      description: 'Creation failed',
    });
  });

  it('handles fetch network error', async () => {
    const error = new Error('Network error');
    mockFetch.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    result.current.createInstitution(institutionData);

    await waitFor(() => expect(result.current.isError).toBe(true));

    // showLoader doit être appelé même en cas d’erreur
    expect(mockShowLoader).toHaveBeenCalledTimes(1);
    expect(mockHideLoader).toHaveBeenCalledTimes(1);
    expect(mockToast.error).toHaveBeenCalledWith('La création a échoué', {
      description: 'Network error',
    });
  });

  it('handles non-ok response with message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({ message: 'Server error' }),
    });

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    result.current.createInstitution(institutionData);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockHideLoader).toHaveBeenCalledTimes(1);
    expect(mockToast.error).toHaveBeenCalledWith('La création a échoué', {
      description: 'Server error',
    });
  });

  it('handles non-ok response with errors array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ errors: [{ message: 'Validation error' }] }),
    });

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    result.current.createInstitution(institutionData);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockHideLoader).toHaveBeenCalledTimes(1);
    expect(mockToast.error).toHaveBeenCalledWith('La création a échoué', {
      description: 'Validation error',
    });
  });

  it('handles non-ok response with unparsable json (fallback to HTTP message)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('Invalid JSON')),
    });

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    result.current.createInstitution(institutionData);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockHideLoader).toHaveBeenCalledTimes(1);
    expect(mockToast.error).toHaveBeenCalledWith('La création a échoué', {
      description: 'Error HTTP 500: Internal Server Error',
    });
  });

  it('handles null token (no Authorization header)', async () => {
    mockGetToken.mockResolvedValue(null);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    result.current.createInstitution(institutionData);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' }, // No Authorization header
      })
    );
  });

  it('handles rejected json parsing when response.ok=true (bubbles to onError)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error('Bad JSON')),
    });

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    result.current.createInstitution(institutionData);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockShowLoader).toHaveBeenCalledTimes(1);
    expect(mockHideLoader).toHaveBeenCalledTimes(1);
    expect(mockToast.error).toHaveBeenCalledWith('La création a échoué', {
      description: 'Bad JSON',
    });
  });

  it('handles error object without a message property (fallback text)', async () => {
    const error = { code: 'UNEXPECTED_ERROR' }; // no message
    mockFetch.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    result.current.createInstitution(institutionData);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockToast.error).toHaveBeenCalledWith('La création a échoué', {
      description: 'An unexpected error occurred.',
    });
  });

  it('handles Error with empty message (fallback to default text)', async () => {
    const error = new Error('');
    mockFetch.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    result.current.createInstitution(institutionData);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockToast.error).toHaveBeenCalledWith('La création a échoué', {
      description: 'An unexpected error occurred.',
    });
  });

  it('handles non-ok response with no message or errors (fallback to default)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}), // No message or errors
    });

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    result.current.createInstitution(institutionData);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockHideLoader).toHaveBeenCalledTimes(1);
    expect(mockToast.error).toHaveBeenCalledWith('La création a échoué', {
      description: 'Failed to POST institutions',
    });
  });

  it('sets isCreating to true during mutation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        new Promise(resolve => {
          setTimeout(() => resolve({ success: true }), 100);
        }),
    });

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    result.current.createInstitution(institutionData);

    await waitFor(() => {
      expect(result.current.isCreating).toBe(true);
      expect(result.current.isPending).toBe(true);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isCreating).toBe(false);
    expect(result.current.isPending).toBe(false);
  });
});
