import { render, screen } from '@testing-library/react';

import ForgotPassword from '@/app/(auth-forms)/forgot-password/page';

// Mock the components
jest.mock('@/components/forgot-password-form', () => ({
  ForgotPasswordForm: () => <div data-testid='forgot-password-form'>Forgot Password Form</div>,
}));

describe('Forgot Password Page', () => {
  it('renders forgot password form', () => {
    render(<ForgotPassword />);

    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
  });
});
