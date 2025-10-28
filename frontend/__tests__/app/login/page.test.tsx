import { render, screen } from '@testing-library/react';

import Login from '@/app/login/page';

// Mock the components
jest.mock('@/components/login-form', () => ({
  LoginForm: () => <div data-testid='login-form'>Login Form</div>,
}));

jest.mock('@/components/auth/AuthLayout', () => ({
  AuthLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='auth-layout'>{children}</div>
  ),
}));

describe('Login Page', () => {
  it('renders login form within auth layout', () => {
    render(<Login />);

    expect(screen.getByTestId('auth-layout')).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });
});
