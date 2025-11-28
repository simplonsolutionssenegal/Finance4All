import { render, screen } from '@testing-library/react';

import Register from '@/app/(auth-forms)/register/page';

// Mock the components
jest.mock('@/components/register-form', () => ({
  RegisterForm: () => <div data-testid='register-form'>Register Form</div>,
}));

describe('Register Page', () => {
  it('renders register form', () => {
    render(<Register />);

    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });
});
