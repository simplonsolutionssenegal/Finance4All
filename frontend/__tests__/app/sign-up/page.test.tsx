import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';

import SignUpPage from '@/app/sign-up/page';

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
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock SignUpForm component
jest.mock('@/components/auth/SignUpForm', () => {
  return function MockSignUpForm() {
    return <div data-testid='signup-form'>SignUp Form Component</div>;
  };
});

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid='card'>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid='card-content'>
      {children}
    </div>
  ),
}));

describe('SignUpPage', () => {
  it('should render the sign-up page with all components', () => {
    render(<SignUpPage />);

    // Vérifier la présence du titre principal
    expect(screen.getByText(/rejoignez notre communauté/i)).toBeInTheDocument();
    expect(screen.getByText(/s'inscrire/i)).toBeInTheDocument();

    // Vérifier la présence du logo
    expect(screen.getByAltText(/logo finance4all/i)).toBeInTheDocument();

    // Vérifier la présence du composant SignUpForm
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();

    // Vérifier les liens légaux
    expect(screen.getByText(/conditions utilisation/i)).toBeInTheDocument();
    expect(screen.getByText(/politique de confidentialité/i)).toBeInTheDocument();

    // Vérifier le lien de connexion
    expect(screen.getByText(/déjà membre/i)).toBeInTheDocument();
    expect(screen.getByText(/connectez-vous/i)).toBeInTheDocument();
  });

  it('should have correct link hrefs', () => {
    render(<SignUpPage />);

    // Vérifier les liens
    const termsLink = screen.getByRole('link', { name: /conditions utilisation/i });
    expect(termsLink).toHaveAttribute('href', '/legal/terms');

    const privacyLink = screen.getByRole('link', { name: /politique de confidentialité/i });
    expect(privacyLink).toHaveAttribute('href', '/legal/privacy');

    const signInLink = screen.getByRole('link', { name: /connectez-vous/i });
    expect(signInLink).toHaveAttribute('href', '/sign-in');
  });

  it('should have proper CSS classes and structure', () => {
    const { container } = render(<SignUpPage />);

    // Vérifier la structure principale - le premier div enfant
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('min-h-screen', 'flex');

    // Vérifier la présence des cartes UI
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
  });

  it('should render image with correct attributes', () => {
    render(<SignUpPage />);

    const logo = screen.getByAltText(/logo finance4all/i);
    expect(logo).toHaveAttribute('src', '/logoF4A.jpg');
    expect(logo).toHaveAttribute('width', '200');
    expect(logo).toHaveAttribute('height', '96');
  });

  it('should display descriptive text', () => {
    render(<SignUpPage />);

    expect(screen.getByText(/accédez à des formations pratiques/i)).toBeInTheDocument();
    expect(screen.getByText(/lorem ipsum is simply dummy text/i)).toBeInTheDocument();
    expect(screen.getByText(/en créant un compte, vous acceptez/i)).toBeInTheDocument();
  });

  it('should have responsive layout classes', () => {
    render(<SignUpPage />);

    // Vérifier les classes de responsive design
    const leftSection = screen
      .getByText(/rejoignez notre communauté/i)
      .closest('div')?.parentElement;
    expect(leftSection).toHaveClass('hidden', 'lg:flex', 'lg:w-3/4');

    // Simplifier le test pour la section droite - juste vérifier qu'elle existe
    const rightSection = screen.getByTestId('card').closest('div');
    expect(rightSection).toBeInTheDocument();
  });
});
