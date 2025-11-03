import { render, screen } from '@testing-library/react';
import type React from 'react';

import { AuthLayout } from '@/components/auth/AuthLayout';

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: ({ priority, alt, ...props }: any) => (
    <span data-testid='next-image' data-alt={alt} {...props} />
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('AuthLayout', () => {
  it('renders provided children inside the auth card', () => {
    render(
      <AuthLayout>
        <div data-testid='auth-child'>Content</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('auth-child')).toBeInTheDocument();
  });

  it('uses the default back link when none is provided', () => {
    render(
      <AuthLayout>
        <span>Content</span>
      </AuthLayout>
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/');
  });

  it('applies the provided backHref', () => {
    render(
      <AuthLayout backHref='/dashboard'>
        <span>Content</span>
      </AuthLayout>
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard');
  });

  it('displays the tagline text', () => {
    render(
      <AuthLayout>
        <span>Content</span>
      </AuthLayout>
    );

    expect(screen.getByText(/Plateforme d'inclusion financière/i)).toBeInTheDocument();
  });
});
