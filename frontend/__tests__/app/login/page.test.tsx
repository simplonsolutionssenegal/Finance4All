import { render, screen } from '@testing-library/react';

import Login from '@/app/(auth-forms)/login/page';

// Mock the components
jest.mock('@/components/login-form', () => ({
  LoginForm: () => <div data-testid='login-form'>Login Form</div>,
}));

describe('Login Page', () => {
  it('renders login form', () => {
    render(<Login />);

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });
});
