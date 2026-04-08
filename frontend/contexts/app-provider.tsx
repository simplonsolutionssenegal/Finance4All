'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { GlobalLoader } from '@/components/global-loader';
import { LoaderProvider } from '@/contexts/LoaderContext';

import { QueryProvider } from './query-provider';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInFallbackRedirectUrl='/auth-redirect'
      signUpFallbackRedirectUrl='/auth-redirect'
      taskUrls={{
        'choose-organization': '/auth-redirect',
      }}
    >
      <ThemeProvider defaultTheme='light'>
        <LoaderProvider>
          <QueryProvider>
            {children}
            <GlobalLoader />
            <Toaster position='top-right' richColors closeButton duration={5000} theme='system' />
          </QueryProvider>
        </LoaderProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
