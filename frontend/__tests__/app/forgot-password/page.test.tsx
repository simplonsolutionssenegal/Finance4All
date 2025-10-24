import { render, screen } from '@testing-library/react';

import ForgotPassword from '@/app/forgot-password/page';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { priority: _priority, ...restProps } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={props.src} alt={props.alt} {...restProps} />;
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock the ForgotPasswordForm component
jest.mock('@/components/forgot-password-form', () => ({
  ForgotPasswordForm: () => (
    <div data-testid='forgot-password-form'>ForgotPasswordForm Component</div>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Sparkles: () => <div data-testid='sparkles-icon'>Sparkles</div>,
  X: () => <div data-testid='close-icon'>X</div>,
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

  it('displays the logo', () => {
    render(<ForgotPassword />);
    const logo = screen.getByAltText('Finance4All Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.svg');
  });

  it('displays the tagline with sparkles icon', () => {
    render(<ForgotPassword />);
    expect(screen.getByText("Plateforme d'inclusion financière")).toBeInTheDocument();
    expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
  });

  it('renders the close button', () => {
    render(<ForgotPassword />);
    const closeButton = screen.getByTestId('close-icon');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton.closest('a')).toHaveAttribute('href', '/login');
  });

  it('renders the forgot password card with proper styling', () => {
    render(<ForgotPassword />);
    const card = screen.getByTestId('forgot-password-form').closest('div')?.parentElement;
    expect(card).toHaveClass(
      'bg-white/80',
      'backdrop-blur-sm',
      'rounded-2xl',
      'shadow-lg',
      'border',
      'border-white/20',
      'p-8'
    );
  });

  it('has proper gradient background', () => {
    render(<ForgotPassword />);
    const forgotPasswordForm = screen.getByTestId('forgot-password-form');
    const mainContainer = forgotPasswordForm.closest('div')?.parentElement;
    expect(mainContainer).toHaveClass(
      'min-h-screen',
      'bg-gradient-to-br',
      'from-gray-50',
      'via-white',
      'to-gray-100',
      'relative',
      'flex',
      'flex-col',
      'justify-center',
      'items-center',
      'px-4',
      'py-8'
    );
  });

  it('renders the ForgotPasswordForm component', () => {
    render(<ForgotPassword />);
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
    expect(screen.getByText('ForgotPasswordForm Component')).toBeInTheDocument();
  });

  it('has proper layout structure', () => {
    render(<ForgotPassword />);
    const forgotPasswordForm = screen.getByTestId('forgot-password-form');
    const mainContainer = forgotPasswordForm.closest('div')?.parentElement;
    expect(mainContainer).toHaveClass(
      'min-h-screen',
      'bg-gradient-to-br',
      'from-gray-50',
      'via-white',
      'to-gray-100',
      'relative',
      'flex',
      'flex-col',
      'justify-center',
      'items-center',
      'px-4',
      'py-8'
    );
  });

  it('displays the logo with correct dimensions', () => {
    render(<ForgotPassword />);
    const logo = screen.getByAltText('Finance4All Logo');
    expect(logo).toHaveClass('h-12', 'w-auto', 'mx-auto');
  });

  it('has proper tagline styling', () => {
    render(<ForgotPassword />);
    const tagline = screen.getByText("Plateforme d'inclusion financière");
    expect(tagline.closest('div')).toHaveClass(
      'inline-flex',
      'items-center',
      'px-4',
      'py-2',
      'gap-2'
    );
  });

  it('has proper close button styling', () => {
    render(<ForgotPassword />);
    const closeButton = screen.getByTestId('close-icon').closest('a');
    expect(closeButton).toHaveClass(
      'w-10',
      'h-10',
      'bg-white/80',
      'backdrop-blur-sm',
      'rounded-full',
      'shadow-lg'
    );
  });

  it('has proper positioning for close button', () => {
    render(<ForgotPassword />);
    const closeButtonContainer = screen.getByTestId('close-icon').closest('div')?.parentElement;
    expect(closeButtonContainer).toHaveClass('absolute', 'top-6', 'right-6', 'z-20');
  });
});
