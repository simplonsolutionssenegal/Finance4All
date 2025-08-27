// PublicFooter.test.tsx
import { render, screen } from '@testing-library/react';

import PublicFooter from '@/components/public/layout/footer';

describe('PublicFooter', () => {
  test('se rend et expose un landmark footer', () => {
    render(<PublicFooter />);
    // role contentinfo = <footer>
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  test('affiche les sections attendues', () => {
    render(<PublicFooter />);
    expect(screen.getByRole('heading', { name: /Finance4All/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Services/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Support/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Contact/i })).toBeInTheDocument();
  });

  test('liste les liens de navigation avec les bons href', () => {
    render(<PublicFooter />);

    // Services
    expect(screen.getByRole('link', { name: /Comparator/i })).toHaveAttribute('href', '/comparator');
    expect(screen.getByRole('link', { name: /Formation/i })).toHaveAttribute('href', '/formations');
    expect(screen.getByRole('link', { name: /Conseil/i })).toHaveAttribute('href', '/conseil');

    // Support
    expect(screen.getByRole('link', { name: /FAQ/i })).toHaveAttribute('href', '/faq');
    expect(screen.getByRole('link', { name: /Contact/i })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: /Aide/i })).toHaveAttribute('href', '/help');

    // Contrat simple : exactement 6 liens
    expect(screen.getAllByRole('link')).toHaveLength(6);
  });

  test('affiche les infos de contact et le texte marketing', () => {
    render(<PublicFooter />);
    expect(screen.getByText(/Votre partenaire pour une meilleure gestion financière/i)).toBeInTheDocument();
    expect(screen.getByText(/\+221 77 123 45 67/)).toBeInTheDocument();
    expect(screen.getByText(/contact@finance4all\.sn/)).toBeInTheDocument();
  });

  test('affiche le copyright 2024', () => {
    render(<PublicFooter />);
    expect(screen.getByText(/© 2024 Finance4All\. Tous droits réservés\./i)).toBeInTheDocument();
  });
});
