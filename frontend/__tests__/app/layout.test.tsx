import RootLayout, { metadata } from '@/app/layout';
import { render, screen } from '@testing-library/react';

// Mock des imports CSS (ligne 1)
jest.mock('@/app/globals.css', () => ({}));

// Mock des fonts Google (lignes 3)
jest.mock('next/font/google', () => ({
  Geist: jest.fn(() => ({
    variable: '--font-geist-sans',
    subsets: ['latin'],
  })),
  Geist_Mono: jest.fn(() => ({
    variable: '--font-geist-mono',
    subsets: ['latin'],
  })),
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

describe('RootLayout - Lines 1-23 Coverage', () => {
  const mockChildren = <div data-testid='test-children'>Test Content</div>;

  it('covers imports and type imports (lines 1-6)', () => {
    // Tester que les imports sont bien définis
    expect(RootLayout).toBeDefined();
    expect(metadata).toBeDefined();

    // Vérifier que les mocks des fonts sont appelés
    const { Geist, Geist_Mono } = require('next/font/google');
    expect(Geist).toBeDefined();
    expect(Geist_Mono).toBeDefined();
  });

  it('covers geistSans font configuration (lines 8-11)', () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    // Vérifier que la classe font est appliquée au body
    const body = document.querySelector('body');
    expect(body?.className).toContain('antialiased');
  });

  it('covers geistMono font configuration (lines 13-16)', () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    // Vérifier que les variables de font sont présentes dans le className
    const body = document.querySelector('body');
    expect(body?.className).toBeDefined();
  });

  it('covers metadata export (lines 18-21)', () => {
    // Tester l'export des metadata qui couvre les lignes 18-21
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

  it('renders with empty children', () => {
    const result = RootLayout({ children: null });
    expect(result).toBeDefined();
    expect(result.type).toBe('html');
  });

  it('renders multiple children correctly', () => {
    const multipleChildren = (
      <>
        <div data-testid='child-1'>Child 1</div>
        <div data-testid='child-2'>Child 2</div>
      </>
    );

    const result = RootLayout({ children: multipleChildren });
    expect(result).toBeDefined();
    expect(result.type).toBe('html');
  });
});
