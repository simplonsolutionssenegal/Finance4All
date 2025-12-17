import { render, screen } from '@testing-library/react';

import PublicFooter from '@/components/public/layout/footer';

describe('PublicFooter', () => {
  it('should be a function that returns JSX', () => {
    expect(typeof PublicFooter).toBe('function');
    const result = PublicFooter();
    expect(result).toBeDefined();
    expect(result.type).toBe('footer');
    expect(result.props).toBeDefined();
    expect(result.props.className).toContain('bg-grey-900');
  });

  it('should render without crashing', () => {
    render(<PublicFooter />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('should display the Finance4All brand section', () => {
    render(<PublicFooter />);
    expect(screen.getByText('Finance4All')).toBeInTheDocument();
    expect(
      screen.getByText("Votre partenaire pour l'inclusion financière au Sénégal et au Cameroun.")
    ).toBeInTheDocument();
  });

  it('should display country badges', () => {
    render(<PublicFooter />);
    expect(screen.getByText('🇸🇳 Sénégal')).toBeInTheDocument();
    expect(screen.getByText('🇨🇲 Cameroun')).toBeInTheDocument();
  });

  it('should render Produits section with all links', () => {
    render(<PublicFooter />);

    expect(screen.getByRole('heading', { name: 'Produits' })).toBeInTheDocument();

    const productLinks = [
      { text: 'Comparateur', href: '/comparator' },
      { text: 'Simulateur', href: '/simulator' },
      { text: 'Catalogue de modules', href: '/modules' },
      { text: 'Certificats', href: '/certificates' },
    ];

    productLinks.forEach(({ text, href }) => {
      const link = screen.getByRole('link', { name: text });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('should render Entreprise section with all links', () => {
    render(<PublicFooter />);

    expect(screen.getByRole('heading', { name: 'Entreprise' })).toBeInTheDocument();

    const companyLinks = [
      { text: 'À propos', href: '/about' },
      { text: 'Partenaires', href: '/partners' },
      { text: 'Blog', href: '/blog' },
    ];

    companyLinks.forEach(({ text, href }) => {
      const link = screen.getByRole('link', { name: text });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('should render Support section with all links', () => {
    render(<PublicFooter />);

    expect(screen.getByRole('heading', { name: 'Support' })).toBeInTheDocument();

    const supportLinks = [
      { text: "Centre d'aide", href: '/help' },
      { text: 'Contact', href: '/contact' },
      { text: "Conditions d'utilisation", href: '/terms' },
      { text: 'Confidentialité', href: '/privacy' },
    ];

    supportLinks.forEach(({ text, href }) => {
      const link = screen.getByRole('link', { name: text });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('should render copyright section', () => {
    render(<PublicFooter />);
    expect(
      screen.getByText('© 2024 Finance4All. Tous droits réservés. Powered by Simplon Solutions.')
    ).toBeInTheDocument();
  });

  it('should render bottom action buttons', () => {
    render(<PublicFooter />);
    expect(screen.getByRole('button', { name: 'Politique de cookies' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mentions légales' })).toBeInTheDocument();
  });

  it('should have proper footer styling', () => {
    render(<PublicFooter />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('bg-grey-900', 'text-white', 'py-16');
  });

  it('should have responsive grid layout', () => {
    render(<PublicFooter />);
    const footer = screen.getByRole('contentinfo');

    // Check main container classes
    const container = footer.querySelector('.max-w-7xl');
    expect(container).toHaveClass('mx-auto');

    // Check grid layout
    const gridContainer = container?.querySelector('.grid');
    expect(gridContainer).toHaveClass('md:grid-cols-4', 'gap-12');
  });

  it('should style section headings correctly', () => {
    render(<PublicFooter />);

    const produitsHeading = screen.getByRole('heading', { name: 'Produits' });
    expect(produitsHeading).toHaveClass('font-semibold', 'mb-4', 'text-white');

    const entrepriseHeading = screen.getByRole('heading', { name: 'Entreprise' });
    expect(entrepriseHeading).toHaveClass('font-semibold', 'mb-4', 'text-white');

    const supportHeading = screen.getByRole('heading', { name: 'Support' });
    expect(supportHeading).toHaveClass('font-semibold', 'mb-4', 'text-white');
  });

  it('should style brand description correctly', () => {
    render(<PublicFooter />);
    const description = screen.getByText(
      "Votre partenaire pour l'inclusion financière au Sénégal et au Cameroun."
    );
    expect(description).toHaveClass('text-grey-400', 'text-sm');
  });

  it('should render all sections in correct structure', () => {
    render(<PublicFooter />);

    // Check that we have 4 main sections in the grid
    const footer = screen.getByRole('contentinfo');
    const gridContainer = footer.querySelector('.grid');
    const sections = gridContainer?.children;

    expect(sections).toHaveLength(4);
  });

  it('should have accessibility-friendly structure', () => {
    render(<PublicFooter />);

    // Footer should have proper landmark role
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();

    // All section links should be accessible
    const allLinks = [
      'Comparateur',
      'Simulateur',
      'Catalogue de modules',
      'Certificats', // Produits
      'À propos',
      'Partenaires',
      'Blog', // Entreprise
      "Centre d'aide",
      'Contact',
      "Conditions d'utilisation",
      'Confidentialité', // Support
    ];

    allLinks.forEach(linkText => {
      expect(screen.getByRole('link', { name: linkText })).toBeInTheDocument();
    });
  });

  it('should have proper navigation structure for product links', () => {
    render(<PublicFooter />);

    const produitsSection = screen.getByRole('heading', { name: 'Produits' }).parentElement;
    const produitsNav = produitsSection?.querySelector('nav');
    expect(produitsNav).toBeInTheDocument();
    expect(produitsNav).toHaveClass('flex', 'flex-col', 'gap-3');
  });

  it('should have proper navigation structure for company links', () => {
    render(<PublicFooter />);

    const entrepriseSection = screen.getByRole('heading', { name: 'Entreprise' }).parentElement;
    const entrepriseNav = entrepriseSection?.querySelector('nav');
    expect(entrepriseNav).toBeInTheDocument();
    expect(entrepriseNav).toHaveClass('flex', 'flex-col', 'gap-3');
  });

  it('should have proper navigation structure for support links', () => {
    render(<PublicFooter />);

    const supportSection = screen.getByRole('heading', { name: 'Support' }).parentElement;
    const supportNav = supportSection?.querySelector('nav');
    expect(supportNav).toBeInTheDocument();
    expect(supportNav).toHaveClass('flex', 'flex-col', 'gap-3');
  });

  it('should render F4A logo', () => {
    render(<PublicFooter />);
    expect(screen.getByText('F4A')).toBeInTheDocument();
  });

  it('should have gradient background on logo', () => {
    render(<PublicFooter />);
    const logo = screen.getByText('F4A').parentElement;
    expect(logo).toHaveClass('bg-gradient-primary', 'rounded-2xl');
  });
});
