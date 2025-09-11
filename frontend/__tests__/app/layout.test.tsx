import RootLayout, { metadata } from '@/app/layout';
import { render, screen } from '@testing-library/react';

// Mocks légers (éviter dépendances réelles)
jest.mock('@/app/globals.css', () => ({}));
jest.mock('next/font/google', () => ({
  Geist: jest.fn(() => ({ variable: '--font-geist-sans', subsets: ['latin'] })),
  Geist_Mono: jest.fn(() => ({ variable: '--font-geist-mono', subsets: ['latin'] })),
}));

jest.mock('@/components/theme-provider', () => {
  return {
    ThemeProvider: ({
      children,
      defaultTheme,
    }: {
      children: React.ReactNode;
      defaultTheme: string;
    }) => (
      <div data-testid='theme-provider' data-default-theme={defaultTheme}>
        {children}
      </div>
    ),
  };
});

jest.mock('@/components/ui/sonner', () => {
  return {
    Toaster: ({ position }: { position: string }) => (
      <div data-testid='toaster' data-position={position}>
        Toaster
      </div>
    ),
  };
});

describe('RootLayout', () => {
  it('exports metadata avec titre et description', () => {
    expect(metadata).toBeDefined();
    expect(metadata.title).toBe('Finance4All');
    expect(metadata.description).toBe('');
  });

  it('covers RootLayout function declaration (line 23)', () => {
    // Tester que la fonction RootLayout est bien définie et exportée par défaut
    expect(typeof RootLayout).toBe('function');

    const testContent = <div data-testid='test-child'>Test Child</div>;
    const result = RootLayout({ children: testContent });

    expect(result).toBeDefined();
    expect(result.type).toBe('html');
  });

  it('should be a function that returns JSX', () => {
    expect(typeof RootLayout).toBe('function');
    const result = RootLayout({ children: mockChildren });
    expect(result).toBeDefined();
    expect(result.type).toBe('html');
  });

  it('returns html element with correct properties', () => {
    const result = RootLayout({ children: mockChildren });
    expect(result.props.lang).toBe('fr');
    expect(result.props.suppressHydrationWarning).toBe(true);
  });

  it('contains body element with children', () => {
    const result = RootLayout({ children: mockChildren });
    const body = result.props.children;
    expect(body.type).toBe('body');
    expect(body.props.className).toContain('antialiased');
  });

  it('contains ThemeProvider with correct default theme', () => {
    const result = RootLayout({ children: mockChildren });
    const body = result.props.children;
    const themeProvider = body.props.children;
    expect(themeProvider.type.name).toBe('ThemeProvider');
    expect(themeProvider.props.defaultTheme).toBe('light');
  });

  it('rend plusieurs enfants correctement', () => {
    render(
      <RootLayout>
        <div data-testid='c1'>One</div>
        <div data-testid='c2'>Two</div>
      </RootLayout>
    );
    expect(screen.getByTestId('c1')).toBeInTheDocument();
    expect(screen.getByTestId('c2')).toBeInTheDocument();
  });
});
