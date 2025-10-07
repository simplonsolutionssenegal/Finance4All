import React from 'react';
import { render, screen } from '@testing-library/react';
import type { Product } from '@/models/product';

jest.mock('@/components/ui/skeletons', () => ({
  ProductsTableSkeleton: () => <div data-testid='fallback'>Loading…</div>,
}));

function makeProduct(overrides: Partial<Product> = {}, i = 1): Product {
  const base: Product = {
    id: `p-${i}`,
    designation: `Produit ${i}`,
    type: 'CREDIT',
    montantMin: 1000 * i,
    montantMax: 10000 * i,
    modesRemboursement: 'AGENCE',
    institutionId: '11111111-2222-3333-4444-555555555555',
    zoneId: 'ZONE1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
  };
  return { ...base, ...overrides };
}

describe('ProductList (wrapper avec Suspense)', () => {
  let lastProps: any = null;

  beforeEach(() => {
    jest.resetModules();
    lastProps = null;
  });

  it('passe bien les props à ProductListClient', async () => {
    jest.doMock('@/components/institutions/ProductListClient', () => ({
      __esModule: true,
      default: (props: any) => {
        lastProps = props;
        return <div data-testid='client'>Client</div>;
      },
    }));

    const ProductList = (await import('@/components/institutions/ProductList')).default;

    const products = [makeProduct({}, 1), makeProduct({}, 2)];
    render(<ProductList products={products} isLoading={true} />);

    expect(screen.getByTestId('client')).toBeInTheDocument();

    expect(lastProps).toBeTruthy();
    expect(lastProps.products).toHaveLength(2);
    expect(lastProps.isLoading).toBe(true);

    expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
  });

  it('affiche le fallback Suspense si l’enfant suspend (throw Promise)', async () => {
    const never = new Promise(() => {});

    jest.doMock('@/components/institutions/ProductListClient', () => ({
      __esModule: true,
      default: () => {
        throw never;
      },
    }));

    const ProductList = (await import('@/components/institutions/ProductList')).default;

    const products = [makeProduct({}, 1)];
    render(<ProductList products={products} isLoading={false} />);

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('client')).not.toBeInTheDocument();
  });
});
