import { render, screen } from '@testing-library/react';

import RootLayout, { metadata } from '@/app/layout';

// Mock AppProvider as it's a wrapper and we are testing the layout
jest.mock('@/contexts/app-provider', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='app-provider'>{children}</div>
  ),
}));

// Mock next/font/local
jest.mock('next/font/local', () => ({
  __esModule: true,
  default: () => ({
    variable: '__font_barlow_variable__',
    className: '__font_barlow_class__',
    style: {},
  }),
}));

describe('RootLayout', () => {
  it('renders children within AppProvider and has correct attributes', () => {
    render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );

    // Check if children are rendered inside the mocked AppProvider
    const appProvider = screen.getByTestId('app-provider');
    expect(appProvider).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();

    // Check for body classes
    const body = document.querySelector('body');
    expect(body).toHaveClass('__font_barlow_variable__', 'antialiased');
  });

  it('should have correct metadata', () => {
    expect(metadata.title).toBe('Finance4All');
    expect(metadata.description).toBe('');
  });
});
