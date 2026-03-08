'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: Readonly<QueryProviderProps>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: data is fresh for 1 minute
            staleTime: 60 * 1000,
            // Cache time: keep in cache for 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
            // Retry delay doubles each time (exponential backoff)
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus in production only
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            // Disable queries during SSR/build to prevent fetch errors when backend is unavailable
            enabled: typeof window !== 'undefined',
          },
          mutations: {
            // Show error notifications by default
            onError: (error: any) => {
              const message = error?.message || 'An error occurred';
              console.error('Mutation error:', error);
              // Global error handler (can be overridden per mutation)
              if (!error?.skipToast) {
                toast.error(message);
              }
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position='bottom' />
      )}
    </QueryClientProvider>
  );
}
