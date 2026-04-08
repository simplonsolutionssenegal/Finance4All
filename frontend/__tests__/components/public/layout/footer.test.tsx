import { render, screen } from '@testing-library/react';

import PublicFooter from '@/components/public/layout/footer';

describe('PublicFooter', () => {
  it('renders without crashing', () => {
    render(<PublicFooter />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders brand description and logo alt text', () => {
    render(<PublicFooter />);
    expect(screen.getByAltText('Finance4All Logo')).toBeInTheDocument();
    expect(
      screen.getByText(/Votre partenaire pour l'inclusion financière au Sénégal et au Cameroun./i)
    ).toBeInTheDocument();
  });

  it('renders country labels', () => {
    render(<PublicFooter />);
    expect(screen.getByText('Sénégal')).toBeInTheDocument();
    expect(screen.getByText('Cameroun')).toBeInTheDocument();
  });

  it('renders Produits links with updated routes', () => {
    render(<PublicFooter />);
    const links = [
      { text: 'Comparateur', href: '/comparator' },
      { text: 'Simulateur', href: '/simulator' },
      { text: 'Catalogue de modules', href: '/modules-formation' },
    ];
    links.forEach(({ text, href }) => {
      const link = screen.getByRole('link', { name: text });
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('renders Entreprise links including partners anchor', () => {
    render(<PublicFooter />);
    const links = [
      { text: 'À propos', href: '/about' },
      { text: 'Partenaires', href: '/#partners' },
    ];
    links.forEach(({ text, href }) => {
      const link = screen.getByRole('link', { name: text });
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('renders Support links', () => {
    render(<PublicFooter />);
    const links = [
      { text: "Centre d'aide", href: '/help' },
      { text: 'Contact', href: '/contact' },
    ];
    links.forEach(({ text, href }) => {
      const link = screen.getByRole('link', { name: text });
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('renders copyright', () => {
    render(<PublicFooter />);
    expect(screen.getByText('© 2026 Finance4All. Tous droits réservés.')).toBeInTheDocument();
  });

  it('keeps expected layout classes', () => {
    render(<PublicFooter />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('bg-gray-900', 'text-white', 'py-16');
    const container = footer.querySelector('.max-w-7xl');
    expect(container).toHaveClass('mx-auto');
    const gridContainer = container?.querySelector('.grid');
    expect(gridContainer).toHaveClass('md:grid-cols-4', 'gap-12');
  });
});
