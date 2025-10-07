import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductListClient from '@/components/institutions/ProductListClient';
import type { Product } from '@/models/product';

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, ...rest }: any) => (
    <div data-testid='dialog' {...rest}>
      {children}
    </div>
  ),
  DialogTrigger: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/ui/skeletons', () => ({
  ProductsMobileSkeleton: () => <div data-testid='mobile-skeleton'>Loading…</div>,
}));

function makeProduct(overrides: Partial<Product> = {}, i = 1): Product {
  const base: Product = {
    id: `p-${i}`,
    designation: `Produit ${i}`,
    type: 'CREDIT' as Product['type'],
    montantMin: 1000 * i,
    montantMax: 10000 * i,
    modesRemboursement: 'AGENCE' as Product['modesRemboursement'],
    institutionId: '11111111-2222-3333-4444-555555555555',
    zoneId: 'ZONE1',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
  };
  return { ...base, ...overrides };
}

describe('ProductListClient', () => {
  it('affiche le skeleton quand isLoading=true', () => {
    render(<ProductListClient products={[makeProduct()]} isLoading />);
    expect(screen.getByTestId('mobile-skeleton')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('affiche l’état vide quand products=[]', () => {
    render(<ProductListClient products={[]} />);
    expect(screen.getByText(/Aucun service/i)).toBeInTheDocument();
    expect(screen.getByText(/Commencez par ajouter un nouveau service/i)).toBeInTheDocument();
  });

  it('rend au plus 5 lignes par page et gère la pagination', async () => {
    const products = Array.from({ length: 12 }, (_, idx) => makeProduct({}, idx + 1));
    render(<ProductListClient products={products} />);

    const table = screen.getByRole('table');

    const [, tbody] = within(table).getAllByRole('rowgroup');

    const bodyRows = () => within(tbody).getAllByRole('row');

    expect(screen.getByText(/Page 1 \/ 3/i)).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(5);

    const prevBtn = screen.getByRole('button', { name: /Précédent/i });
    const nextBtn = screen.getByRole('button', { name: /Suivant/i });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    await userEvent.click(nextBtn);
    expect(screen.getByText(/Page 2 \/ 3/i)).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(5);

    await userEvent.click(nextBtn);
    expect(screen.getByText(/Page 3 \/ 3/i)).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(2);
    expect(nextBtn).toBeDisabled();
  });

  it('affiche montants formatés (de-DE) et actions avec bons aria-label', () => {
    const p = makeProduct(
      {
        designation: 'Crédit Étudiant',
        montantMin: 1234,
        montantMax: 56789,
        type: 'CREDIT' as Product['type'],
        modesRemboursement: 'USSD' as Product['modesRemboursement'],
      },
      42
    );

    render(<ProductListClient products={[p]} />);

    expect(screen.getByText('Crédit Étudiant')).toBeInTheDocument();
    expect(screen.getByText('CREDIT')).toBeInTheDocument();

    expect(screen.getByText('1.234')).toBeInTheDocument();
    expect(screen.getByText('56.789')).toBeInTheDocument();

    expect(screen.getByText('USSD')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Voir Crédit Étudiant/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Modifier Crédit Étudiant/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Supprimer Crédit Étudiant/i })).toBeInTheDocument();
  });
});
