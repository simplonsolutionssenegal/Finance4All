jest.mock('@clerk/nextjs', () => ({
  ClerkProvider: jest.fn(({ children }) => <>{children}</>),
}));

jest.mock('next-themes', () => ({
  ThemeProvider: jest.fn(({ children }) => <>{children}</>),
}));

jest.mock('@/contexts/LoaderContext', () => ({
  LoaderProvider: jest.fn(({ children }) => <>{children}</>),
}));

jest.mock('@/contexts/query-provider', () => ({
  QueryProvider: jest.fn(({ children }) => <>{children}</>),
}));

jest.mock('@/components/global-loader', () => ({
  GlobalLoader: jest.fn(() => <div data-testid='global-loader' />),
}));

jest.mock('sonner', () => ({
  Toaster: jest.fn(() => <div data-testid='toaster' />),
}));

import { ClerkProvider } from '@clerk/nextjs';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

import { GlobalLoader } from '@/components/global-loader';
import { AppProvider } from '@/contexts/app-provider';
import { LoaderProvider } from '@/contexts/LoaderContext';
import { QueryProvider } from '@/contexts/query-provider';

describe('AppProvider', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('renders all nested providers and components with correct props', () => {
    const publishableKey = 'test-clerk-key';
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = publishableKey;

    render(
      <AppProvider>
        <div>Test Child</div>
      </AppProvider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();

    expect(GlobalLoader).toHaveBeenCalled();
    expect(Toaster).toHaveBeenCalled();

    expect(ClerkProvider).toHaveBeenCalled();
    expect(ThemeProvider).toHaveBeenCalled();
    expect(LoaderProvider).toHaveBeenCalled();
    expect(QueryProvider).toHaveBeenCalled();

    const clerkProviderProps = (ClerkProvider as unknown as jest.Mock).mock.calls[0][0];
    expect(clerkProviderProps.publishableKey).toBe(publishableKey);

    const themeProviderProps = (ThemeProvider as unknown as jest.Mock).mock.calls[0][0];
    expect(themeProviderProps.defaultTheme).toBe('light');

    const toasterProps = (Toaster as unknown as jest.Mock).mock.calls[0][0];
    expect(toasterProps.position).toBe('top-right');
    expect(toasterProps.richColors).toBe(true);
    expect(toasterProps.closeButton).toBe(true);
    expect(toasterProps.duration).toBe(5000);
    expect(toasterProps.theme).toBe('system');
  });
});
