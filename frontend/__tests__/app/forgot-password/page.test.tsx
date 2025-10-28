import { render, screen } from '@testing-library/react';

import ForgotPassword from '@/app/forgot-password/page';

// Mock the components
jest.mock('@/components/forgot-password-form', () => ({
  ForgotPasswordForm: () => <div data-testid='forgot-password-form'>Forgot Password Form</div>,
}));

jest.mock('@/components/auth/AuthLayout', () => ({
  AuthLayout: ({ children, backHref }: { children: React.ReactNode; backHref?: string }) => (
    <div data-testid='auth-layout' data-back-href={backHref}>
      {children}
    </div>
  ),
}));

describe('Forgot Password Page', () => {
  it('renders forgot password form within auth layout', () => {
    render(<ForgotPassword />);

    expect(screen.getByTestId('auth-layout')).toBeInTheDocument();
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
  });

  it('passes correct backHref to AuthLayout', () => {
    render(<ForgotPassword />);

    const authLayout = screen.getByTestId('auth-layout');
    expect(authLayout).toHaveAttribute('data-back-href', '/login');
  });
});
