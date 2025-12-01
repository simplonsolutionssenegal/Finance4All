import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import React from 'react';

import AuthFormsLayout from '@/app/(auth-forms)/layout';
import { RegisterFormProvider } from '@/contexts/register-form-context';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={typeof href === 'string' ? href : ''} {...rest}>
      {children}
    </a>
  ),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Sparkles: () => <div data-testid='sparkles-icon'>Sparkles</div>,
  X: () => <div data-testid='x-icon'>X</div>,
  Shield: () => <div data-testid='shield-icon'>Shield</div>,
}));

describe('AuthFormsLayout', () => {
  const mockUsePathname = usePathname as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    mockUsePathname.mockReturnValue('/login');
    render(
      <AuthFormsLayout>
        <div>Test Content</div>
      </AuthFormsLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders logo and tagline', () => {
    mockUsePathname.mockReturnValue('/login');
    render(
      <AuthFormsLayout>
        <div>Test</div>
      </AuthFormsLayout>
    );

    expect(screen.getByAltText('Finance4All Logo')).toBeInTheDocument();
    expect(screen.getByText("Plateforme d'inclusion financière")).toBeInTheDocument();
  });

  it('renders close button', () => {
    mockUsePathname.mockReturnValue('/login');
    render(
      <AuthFormsLayout>
        <div>Test</div>
      </AuthFormsLayout>
    );

    const closeButton = screen.getByRole('link');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute('href', '/');
  });

  it('sets correct backHref for register page', () => {
    mockUsePathname.mockReturnValue('/register');
    render(
      <AuthFormsLayout>
        <div>Test</div>
      </AuthFormsLayout>
    );

    const closeButton = screen.getByRole('link');
    expect(closeButton).toHaveAttribute('href', '/login');
  });

  it('sets default backHref for login page', () => {
    mockUsePathname.mockReturnValue('/login');
    render(
      <AuthFormsLayout>
        <div>Test</div>
      </AuthFormsLayout>
    );

    const closeButton = screen.getByRole('link');
    expect(closeButton).toHaveAttribute('href', '/');
  });

  it('renders children in auth card', () => {
    mockUsePathname.mockReturnValue('/login');
    render(
      <AuthFormsLayout>
        <div data-testid='child-content'>Child Content</div>
      </AuthFormsLayout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    mockUsePathname.mockReturnValue('/login');
    const { container } = render(
      <AuthFormsLayout>
        <div>Test</div>
      </AuthFormsLayout>
    );

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass(
      'min-h-screen',
      'bg-gradient-to-br',
      'from-gray-50',
      'via-white',
      'to-gray-100'
    );
  });

  it('handles null pathname gracefully', () => {
    mockUsePathname.mockReturnValue(null);
    render(
      <AuthFormsLayout>
        <div>Test</div>
      </AuthFormsLayout>
    );

    const closeButton = screen.getByRole('link');
    expect(closeButton).toHaveAttribute('href', '/');
  });

  it('handles undefined pathname gracefully', () => {
    mockUsePathname.mockReturnValue(undefined);
    render(
      <AuthFormsLayout>
        <div>Test</div>
      </AuthFormsLayout>
    );

    const closeButton = screen.getByRole('link');
    expect(closeButton).toHaveAttribute('href', '/');
  });

  it('displays correct tagline for register page', () => {
    mockUsePathname.mockReturnValue('/register');
    render(
      <AuthFormsLayout>
        <div>Test</div>
      </AuthFormsLayout>
    );

    expect(screen.getByText('Rejoignez Finance4All')).toBeInTheDocument();
  });

  it('displays default security message for login page', () => {
    mockUsePathname.mockReturnValue('/login');
    render(
      <AuthFormsLayout>
        <div>Test</div>
      </AuthFormsLayout>
    );

    expect(
      screen.getByText('Connexion sécurisée par code OTP ou réseaux sociaux')
    ).toBeInTheDocument();
  });

  it('displays default security message for register page at step 1', () => {
    mockUsePathname.mockReturnValue('/register');
    render(
      <RegisterFormProvider>
        <AuthFormsLayout>
          <div>Test</div>
        </AuthFormsLayout>
      </RegisterFormProvider>
    );

    expect(
      screen.getByText('Connexion sécurisée par code OTP ou réseaux sociaux')
    ).toBeInTheDocument();
  });

  it('displays specific security message for register page at step 2', () => {
    mockUsePathname.mockReturnValue('/register');
    const { useRegisterFormStep } = require('@/contexts/register-form-context');
    const TestComponent = () => {
      const { setStep } = useRegisterFormStep();
      React.useEffect(() => {
        setStep(2);
      }, [setStep]);
      return <div>Test</div>;
    };

    render(
      <RegisterFormProvider>
        <AuthFormsLayout>
          <TestComponent />
        </AuthFormsLayout>
      </RegisterFormProvider>
    );

    expect(
      screen.getByText('Données sécurisées • Connexion par code OTP (SMS & Email)')
    ).toBeInTheDocument();
  });

  it('displays security message with shield icon', () => {
    mockUsePathname.mockReturnValue('/login');
    render(
      <AuthFormsLayout>
        <div>Test</div>
      </AuthFormsLayout>
    );

    expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
  });
});
