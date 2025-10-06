import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import { toast } from 'sonner';

import { useCreateInstitution } from '@/hooks/useCreateInstitution';

// Mock dependencies
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockUseAuth = require('@clerk/nextjs').useAuth;

const mockUseLoader = require('@/contexts/LoaderContext').useLoader;

// Mock fetch
global.fetch = jest.fn();

describe('useCreateInstitution hook', () => {
  let queryClient: QueryClient;
  const mockGetToken = jest.fn();
  const mockShowLoader = jest.fn();
  const mockHideLoader = jest.fn();
  const mockOnSuccess = jest.fn();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
    });

    mockUseLoader.mockReturnValue({
      showLoader: mockShowLoader,
      hideLoader: mockHideLoader,
    });

    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should be a function', () => {
    expect(typeof useCreateInstitution).toBe('function');
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    expect(typeof result.current.createInstitution).toBe('function');
    expect(result.current.isCreating).toBe(false);
  });

  it('should show loader when creating institution', async () => {
    mockGetToken.mockResolvedValue('test-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Institution created' }),
    });

    const { result } = renderHook(() => useCreateInstitution({ onSuccess: mockOnSuccess }), {
      wrapper,
    });

    const institutionData = {
      name: 'Test Institution',
      description: 'Test Description',
      website: 'https://test.com',
      geographicZones: ['EURO'],
      logoUrl: 'https://test.com/logo.png',
    };

    await act(async () => {
      result.current.createInstitution(institutionData);
      await waitFor(() => expect(mockShowLoader).toHaveBeenCalled());
    });
  });

  it('should handle successful institution creation', async () => {
    const token = 'test-token';
    mockGetToken.mockResolvedValue(token);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Institution created' }),
    });

    const { result } = renderHook(() => useCreateInstitution({ onSuccess: mockOnSuccess }), {
      wrapper,
    });

    const institutionData = {
      name: 'Test Institution',
      description: 'Test Description',
      website: 'https://test.com',
      geographicZones: ['EURO'],
      logoUrl: 'https://test.com/logo.png',
    };

    await act(async () => {
      result.current.createInstitution(institutionData);
      await waitFor(() => expect(mockHideLoader).toHaveBeenCalled());
    });

    expect(mockGetToken).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_API_URL}/institutions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(institutionData),
    });
    expect(toast.success).toHaveBeenCalledWith('Institution créée avec succès!');
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockHideLoader).toHaveBeenCalled();
  });

  it('should handle institution creation without token', async () => {
    mockGetToken.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Institution created' }),
    });

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    const institutionData = {
      name: 'Test Institution',
      description: 'Test Description',
      geographicZones: ['EURO'],
    };

    await act(async () => {
      result.current.createInstitution(institutionData);
      await waitFor(() => expect(mockHideLoader).toHaveBeenCalled());
    });

    expect(global.fetch).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_API_URL}/institutions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(institutionData),
    });
  });

  it('should handle institution creation with success=false response', async () => {
    mockGetToken.mockResolvedValue('test-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, message: 'Creation failed' }),
    });

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    const institutionData = {
      name: 'Test Institution',
      description: 'Test Description',
      geographicZones: ['EURO'],
    };

    await act(async () => {
      result.current.createInstitution(institutionData);
      await waitFor(() => expect(mockHideLoader).toHaveBeenCalled());
    });

    expect(toast.error).toHaveBeenCalledWith('La création a échoué', {
      description: 'Creation failed',
    });
    expect(mockHideLoader).toHaveBeenCalled();
  });

  it('should handle HTTP error response', async () => {
    mockGetToken.mockResolvedValue('test-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ message: 'Invalid data' }),
    });

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    const institutionData = {
      name: 'Test Institution',
      description: 'Test Description',
      geographicZones: ['EURO'],
    };

    await act(async () => {
      result.current.createInstitution(institutionData);
      await waitFor(() => expect(mockHideLoader).toHaveBeenCalled());
    });

    expect(toast.error).toHaveBeenCalledWith('La création a échoué', {
      description: 'Invalid data',
    });
    expect(mockHideLoader).toHaveBeenCalled();
  });

  it('should handle HTTP error with errors array', async () => {
    mockGetToken.mockResolvedValue('test-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ errors: [{ message: 'Validation error' }] }),
    });

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    const institutionData = {
      name: 'Test Institution',
      description: 'Test Description',
      geographicZones: ['EURO'],
    };

    await act(async () => {
      result.current.createInstitution(institutionData);
      await waitFor(() => expect(mockHideLoader).toHaveBeenCalled());
    });

    expect(toast.error).toHaveBeenCalledWith('La création a échoué', {
      description: 'Validation error',
    });
  });

  it('should handle HTTP error with JSON parse failure', async () => {
    mockGetToken.mockResolvedValue('test-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => {
        throw new Error('JSON parse error');
      },
    });

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    const institutionData = {
      name: 'Test Institution',
      description: 'Test Description',
      geographicZones: ['EURO'],
    };

    await act(async () => {
      result.current.createInstitution(institutionData);
      await waitFor(() => expect(mockHideLoader).toHaveBeenCalled());
    });

    expect(toast.error).toHaveBeenCalledWith('La création a échoué', {
      description: 'Error HTTP 500: Internal Server Error',
    });
  });

  it('should handle network error', async () => {
    mockGetToken.mockResolvedValue('test-token');
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    const institutionData = {
      name: 'Test Institution',
      description: 'Test Description',
      geographicZones: ['EURO'],
    };

    await act(async () => {
      result.current.createInstitution(institutionData);
      await waitFor(() => expect(mockHideLoader).toHaveBeenCalled());
    });

    expect(toast.error).toHaveBeenCalledWith('La création a échoué', {
      description: 'Network error',
    });
    expect(mockHideLoader).toHaveBeenCalled();
  });

  it('should handle error without message', async () => {
    mockGetToken.mockResolvedValue('test-token');
    (global.fetch as jest.Mock).mockRejectedValue({});

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    const institutionData = {
      name: 'Test Institution',
      description: 'Test Description',
      geographicZones: ['EURO'],
    };

    await act(async () => {
      result.current.createInstitution(institutionData);
      await waitFor(() => expect(mockHideLoader).toHaveBeenCalled());
    });

    expect(toast.error).toHaveBeenCalledWith('La création a échoué', {
      description: 'An unexpected error occurred.',
    });
  });

  it('should handle institution with optional fields', async () => {
    mockGetToken.mockResolvedValue('test-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    const institutionData = {
      name: 'Test Institution',
      description: 'Test Description',
      geographicZones: ['EURO', 'USD'],
    };

    await act(async () => {
      result.current.createInstitution(institutionData);
      await waitFor(() => expect(mockHideLoader).toHaveBeenCalled());
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/institutions`,
      expect.objectContaining({
        body: JSON.stringify(institutionData),
      })
    );
  });

  it('should call onSuccess callback when provided', async () => {
    mockGetToken.mockResolvedValue('test-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const customOnSuccess = jest.fn();
    const { result } = renderHook(() => useCreateInstitution({ onSuccess: customOnSuccess }), {
      wrapper,
    });

    const institutionData = {
      name: 'Test Institution',
      description: 'Test Description',
      geographicZones: ['EURO'],
    };

    await act(async () => {
      result.current.createInstitution(institutionData);
      await waitFor(() => expect(mockHideLoader).toHaveBeenCalled());
    });

    expect(customOnSuccess).toHaveBeenCalled();
  });

  it('should not call onSuccess when creation fails', async () => {
    mockGetToken.mockResolvedValue('test-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: false }),
    });

    const customOnSuccess = jest.fn();
    const { result } = renderHook(() => useCreateInstitution({ onSuccess: customOnSuccess }), {
      wrapper,
    });

    const institutionData = {
      name: 'Test Institution',
      description: 'Test Description',
      geographicZones: ['EURO'],
    };

    await act(async () => {
      result.current.createInstitution(institutionData);
      await waitFor(() => expect(mockHideLoader).toHaveBeenCalled());
    });

    expect(customOnSuccess).not.toHaveBeenCalled();
  });

  it('should work without onSuccess callback', async () => {
    mockGetToken.mockResolvedValue('test-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    const institutionData = {
      name: 'Test Institution',
      description: 'Test Description',
      geographicZones: ['EURO'],
    };

    await act(async () => {
      result.current.createInstitution(institutionData);
      await waitFor(() => expect(mockHideLoader).toHaveBeenCalled());
    });

    expect(toast.success).toHaveBeenCalled();
  });

  it('should set isCreating to true during mutation', async () => {
    mockGetToken.mockResolvedValue('test-token');
    let resolvePromise: (value: any) => void;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    (global.fetch as jest.Mock).mockReturnValue(promise);

    const { result } = renderHook(() => useCreateInstitution(), { wrapper });

    const institutionData = {
      name: 'Test Institution',
      description: 'Test Description',
      geographicZones: ['EURO'],
    };

    act(() => {
      result.current.createInstitution(institutionData);
    });

    await waitFor(() => expect(result.current.isCreating).toBe(true));

    // @ts-ignore
    resolvePromise({
      ok: true,
      json: async () => ({ success: true }),
    });

    await waitFor(() => expect(result.current.isCreating).toBe(false));
  });
});
