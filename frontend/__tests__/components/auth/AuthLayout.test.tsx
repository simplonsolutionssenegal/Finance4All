import { render, screen } from '@testing-library/react';

import { AuthLayout } from '@/components/auth/AuthLayout';

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <div data-testid='next-image' data-src={src} data-alt={alt} {...props} />
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('AuthLayout', () => {
  it('renders children correctly', () => {
    render(
      <AuthLayout>
        <div data-testid='test-content'>Test Content</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders logo and tagline', () => {
    render(
      <AuthLayout>
        <div>Test Content</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('next-image')).toBeInTheDocument();
    expect(screen.getByText("Plateforme d'inclusion financière")).toBeInTheDocument();
  });

  it('renders close button with default href', () => {
    render(
      <AuthLayout>
        <div>Test Content</div>
      </AuthLayout>
    );

    const closeButton = screen.getByRole('link');
    expect(closeButton).toHaveAttribute('href', '/');
  });

  it('renders close button with custom backHref', () => {
    render(
      <AuthLayout backHref='/custom-path'>
        <div>Test Content</div>
      </AuthLayout>
    );

    const closeButton = screen.getByRole('link');
    expect(closeButton).toHaveAttribute('href', '/custom-path');
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(
      <AuthLayout>
        <div>Test Content</div>
      </AuthLayout>
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen', 'bg-gradient-to-br');
  });
});
