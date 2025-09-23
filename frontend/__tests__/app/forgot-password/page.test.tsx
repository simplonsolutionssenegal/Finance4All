import { render, screen } from '@testing-library/react';

import ForgotPassword from '@/app/forgot-password/page';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock the ForgotPasswordForm component
jest.mock('@/components/forgot-password-form', () => ({
  ForgotPasswordForm: () => (
    <div data-testid='forgot-password-form'>ForgotPasswordForm Component</div>
  ),
}));

describe('ForgotPassword Page', () => {
  it('renders without crashing', () => {
    render(<ForgotPassword />);
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
  });

  it('should be a function that returns JSX', () => {
    expect(typeof ForgotPassword).toBe('function');
    const { container } = render(<ForgotPassword />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays left section content', () => {
    render(<ForgotPassword />);
    expect(screen.getByText('Réinitialisez votre mot de passe')).toBeInTheDocument();
  });

  it('displays left section description', () => {
    render(<ForgotPassword />);
    expect(screen.getByText(/Pas d'inquiétude, ça arrive à tout le monde/)).toBeInTheDocument();
  });

  it('renders the logo', () => {
    render(<ForgotPassword />);
    const logo = screen.getByAltText('Finance4All Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.svg');
  });

  it('renders the background image', () => {
    render(<ForgotPassword />);
    const bgImage = screen.getByAltText('Background image');
    expect(bgImage).toBeInTheDocument();
    expect(bgImage).toHaveAttribute('src', '/assets/images/login-bg.svg');
  });

  it('renders the ForgotPasswordForm component', () => {
    render(<ForgotPassword />);
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
    expect(screen.getByText('ForgotPasswordForm Component')).toBeInTheDocument();
  });
});
