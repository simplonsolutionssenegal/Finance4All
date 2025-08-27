// PublicHeader.test.tsx
import { render, screen } from '@testing-library/react';

import PublicHeader from '@/components/public/layout/header';

describe('PublicHeader', () => {
  test('se rend et expose un landmark header', () => {
    render(<PublicHeader />);
    // <header> => role "banner"
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('affiche la marque', () => {
    render(<PublicHeader />);
    expect(screen.getByText(/finance4all/i)).toBeInTheDocument();
  });

  test('expose une navigation avec les bons liens', () => {
    render(<PublicHeader />);

    // Le <nav> est présent
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // Liens + href
    expect(screen.getByRole('link', { name: /comparateur/i })).toHaveAttribute('href', '/comparator');
    expect(screen.getByRole('link', { name: /formation/i })).toHaveAttribute('href', '/formations');
    expect(screen.getByRole('link', { name: /faq/i })).toHaveAttribute('href', '/faq');
    expect(screen.getByRole('link', { name: /à propos/i })).toHaveAttribute('href', '/about-us');

    // Contrat simple : exactement 4 liens nav
    // (si d'autres liens apparaissent un jour dans le header, ajuste ce test)
    expect(screen.getAllByRole('link')).toHaveLength(4);
  });

  test('affiche le bouton Se connecter', () => {
    render(<PublicHeader />);
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });
});
