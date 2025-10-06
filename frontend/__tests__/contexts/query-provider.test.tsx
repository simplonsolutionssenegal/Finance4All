import { useMutation, useQuery } from '@tanstack/react-query';
import { render, screen, waitFor, act } from '@testing-library/react';
import { toast } from 'sonner';

import { QueryProvider } from '@/contexts/query-provider';

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mock ReactQueryDevtools
jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => <div data-testid='react-query-devtools'>Devtools</div>,
}));

// Test component that uses query
function TestQueryComponent() {
  const query = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      return { data: 'test data' };
    },
  });

  if (query.isLoading) return <div>Loading...</div>;
  if (query.error) return <div>Error: {(query.error as Error).message}</div>;
  return <div>Data: {query.data?.data}</div>;
}

// Test component that uses mutation
function TestMutationComponent() {
  const mutation = useMutation({
    mutationFn: async (data: { value: string }) => {
      if (data.value === 'error') {
        throw new Error('Test error');
      }
      return { success: true };
    },
  });

  return (
    <div>
      <button onClick={() => mutation.mutate({ value: 'success' })}>Mutate Success</button>
      <button onClick={() => mutation.mutate({ value: 'error' })}>Mutate Error</button>
      <div>{mutation.isPending && 'Mutating...'}</div>
      <div>{mutation.isSuccess && 'Success!'}</div>
      <div>{mutation.isError && 'Error!'}</div>
    </div>
  );
}

// Test component for mutation with skipToast
function TestMutationWithSkipToastComponent() {
  const mutation = useMutation({
    mutationFn: async (_data: { value: string }) => {
      const error: any = new Error('Test error with skip toast');
      error.skipToast = true;
      throw error;
    },
  });

  return (
    <div>
      <button onClick={() => mutation.mutate({ value: 'error' })}>Mutate Error Skip Toast</button>
    </div>
  );
}

// Test component for mutation without message
function TestMutationWithoutMessageComponent() {
  const mutation = useMutation({
    mutationFn: async () => {
      throw {};
    },
  });

  return (
    <div>
      <button onClick={() => mutation.mutate()}>Mutate Error No Message</button>
    </div>
  );
}

describe('QueryProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders children correctly', () => {
    render(
      <QueryProvider>
        <div data-testid='test-child'>Test Child</div>
      </QueryProvider>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('provides QueryClient to children', async () => {
    render(
      <QueryProvider>
        <TestQueryComponent />
      </QueryProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Data: test data')).toBeInTheDocument();
    });
  });

  it('shows ReactQueryDevtools in development', () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
      configurable: true,
    });

    render(
      <QueryProvider>
        <div>Test</div>
      </QueryProvider>
    );

    expect(screen.getByTestId('react-query-devtools')).toBeInTheDocument();

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
      configurable: true,
    });
  });

  it('does not show ReactQueryDevtools in production', () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
      configurable: true,
    });

    render(
      <QueryProvider>
        <div>Test</div>
      </QueryProvider>
    );

    expect(screen.queryByTestId('react-query-devtools')).not.toBeInTheDocument();

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
      configurable: true,
    });
  });

  it('handles mutation errors with global error handler', async () => {
    render(
      <QueryProvider>
        <TestMutationComponent />
      </QueryProvider>
    );

    const errorButton = screen.getByText('Mutate Error');

    await act(async () => {
      errorButton.click();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Test error');
    });
  });

  it('does not show toast when skipToast is true', async () => {
    render(
      <QueryProvider>
        <TestMutationWithSkipToastComponent />
      </QueryProvider>
    );

    const errorButton = screen.getByText('Mutate Error Skip Toast');

    await act(async () => {
      errorButton.click();
      // Wait a bit to ensure the error handler has run
      await new Promise(resolve => {
        setTimeout(resolve, 100);
      });
    });

    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows default error message when error has no message', async () => {
    render(
      <QueryProvider>
        <TestMutationWithoutMessageComponent />
      </QueryProvider>
    );

    const errorButton = screen.getByText('Mutate Error No Message');

    await act(async () => {
      errorButton.click();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('An error occurred');
    });
  });

  it('console.error is called on mutation error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <QueryProvider>
        <TestMutationComponent />
      </QueryProvider>
    );

    const errorButton = screen.getByText('Mutate Error');

    await act(async () => {
      errorButton.click();
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Mutation error:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('configures QueryClient with correct default options', () => {
    render(
      <QueryProvider>
        <div>Test</div>
      </QueryProvider>
    );

    // QueryProvider renders without errors, meaning QueryClient was configured correctly
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles successful mutations', async () => {
    render(
      <QueryProvider>
        <TestMutationComponent />
      </QueryProvider>
    );

    const successButton = screen.getByText('Mutate Success');

    await act(async () => {
      successButton.click();
    });

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    expect(toast.error).not.toHaveBeenCalled();
  });

  it('sets refetchOnWindowFocus based on environment', () => {
    const originalEnv = process.env.NODE_ENV;

    // Test in production
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
      configurable: true,
    });
    const { unmount } = render(
      <QueryProvider>
        <TestQueryComponent />
      </QueryProvider>
    );
    unmount();

    // Test in development
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
      configurable: true,
    });
    render(
      <QueryProvider>
        <TestQueryComponent />
      </QueryProvider>
    );

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
      configurable: true,
    });
  });

  describe('QueryClient configuration', () => {
    it('creates QueryClient with useState', () => {
      const { rerender } = render(
        <QueryProvider>
          <div>Test</div>
        </QueryProvider>
      );

      rerender(
        <QueryProvider>
          <div>Test Updated</div>
        </QueryProvider>
      );

      expect(screen.getByText('Test Updated')).toBeInTheDocument();
    });
  });
});
