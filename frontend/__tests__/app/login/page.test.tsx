import { render, screen } from '@testing-library/react';

import Login from '@/app/login/page';

jest.mock('@/components/login-form', () => ({
  LoginForm: () => <div data-testid='login-form'>Login Form</div>,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { priority: _priority, ...restProps } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...restProps} alt={props.alt} />;
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Sparkles: () => <div data-testid='sparkles-icon'>Sparkles</div>,
  X: () => <div data-testid='close-icon'>X</div>,
}));

describe('Login Page', () => {
  it('renders without crashing', () => {
    render(<Login />);
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('should be a function that returns JSX', () => {
    expect(typeof Login).toBe('function');
    const { container } = render(<Login />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays the logo', () => {
    render(<Login />);
    const logo = screen.getByAltText('Finance4All Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.svg');
  });

  it('displays the tagline with sparkles icon', () => {
    render(<Login />);
    expect(screen.getByText("Plateforme d'inclusion financière")).toBeInTheDocument();
    expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
  });

  it('renders the login card with proper styling', () => {
    render(<Login />);
    const card = screen.getByTestId('login-form').closest('div')?.parentElement;
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
    render(<Login />);
    const loginForm = screen.getByTestId('login-form');
    const mainContainer = loginForm.closest('div')?.parentElement;
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

  it('renders the LoginForm component', () => {
    render(<Login />);
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByText('Login Form')).toBeInTheDocument();
  });

  it('has proper layout structure', () => {
    render(<Login />);
    const loginForm = screen.getByTestId('login-form');
    const mainContainer = loginForm.closest('div')?.parentElement;
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
    render(<Login />);
    const logo = screen.getByAltText('Finance4All Logo');
    expect(logo).toHaveClass('h-12', 'w-auto', 'mx-auto');
  });

  it('has proper tagline styling', () => {
    render(<Login />);
    const tagline = screen.getByText("Plateforme d'inclusion financière");
    expect(tagline.closest('div')).toHaveClass(
      'inline-flex',
      'items-center',
      'px-4',
      'py-2',
      'gap-2'
    );
  });
});
