import { render, screen } from '@testing-library/react';

import Register from '@/app/register/page';

// Mock the components
jest.mock('@/components/register-form', () => ({
  RegisterForm: () => <div data-testid='register-form'>Register Form</div>,
}));

jest.mock('@/components/auth/AuthLayout', () => ({
  AuthLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='auth-layout'>{children}</div>
  ),
}));

describe('Register Page', () => {
  it('renders register form within auth layout', () => {
    render(<Register />);

    expect(screen.getByTestId('auth-layout')).toBeInTheDocument();
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });
});
