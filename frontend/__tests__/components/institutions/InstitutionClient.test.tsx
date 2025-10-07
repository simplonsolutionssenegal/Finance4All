import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InstitutionClient from '@/components/institutions/InstitutionClient';
import type { Product } from '@/models/product';

const getByInstitution = jest.fn();
const filterByInstitution = jest.fn();

jest.mock('@/lib/API/api-product', () => ({
  ServicesAPI: {
    getByInstitution: (...args: any[]) => getByInstitution(...args),
    filterByInstitution: (...args: any[]) => filterByInstitution(...args),
  },
}));

jest.mock('@/components/institutions/ProductList', () => {
  return function MockProductList(props: { products: Product[]; isLoading: boolean }) {
    return (
      <div data-testid='ProductList'>
        <span data-testid='count'>{props.products.length}</span>
        <span data-testid='loading'>{String(props.isLoading)}</span>
      </div>
    );
  };
});

let searchBarProps: any = null;
jest.mock('@/components/institutions/SearchBar', () => (props: any) => {
  searchBarProps = props;
  return <div data-testid='SearchBar'></div>;
});

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

describe('InstitutionClient', () => {
  const INSTITUTION_ID = 'abc-123';

  beforeEach(() => {
    jest.clearAllMocks();
    searchBarProps = null;
  });

  it('charge les produits au mount (getByInstitution) et met à jour isLoading', async () => {
    const data = [
      makeProduct({ designation: 'Crédit A' }, 1),
      makeProduct({ designation: 'Épargne B', type: 'EPARGNE' }, 2),
    ];
    getByInstitution.mockResolvedValueOnce(data);

    render(<InstitutionClient institutionId={INSTITUTION_ID} />);

    expect(await screen.findByTestId('ProductList')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    await waitFor(() => {
      expect(getByInstitution).toHaveBeenCalledWith(INSTITUTION_ID);
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('count')).toHaveTextContent('2');
    });
  });

  it('applique filtres (filterByInstitution) quand SearchBar appelle onApplyFilters', async () => {
    const initial = [makeProduct({}, 1)];
    const filtered = [makeProduct({}, 2), makeProduct({}, 3), makeProduct({}, 4)];
    getByInstitution.mockResolvedValueOnce(initial);
    filterByInstitution.mockResolvedValueOnce(filtered);

    render(<InstitutionClient institutionId={INSTITUTION_ID} />);

    await waitFor(() => expect(getByInstitution).toHaveBeenCalled());

    const filters = { type: ['CREDIT'], zone: [], date: '' };

    await act(async () => {
      searchBarProps.onApplyFilters(filters);
    });

    await waitFor(() => {
      expect(filterByInstitution).toHaveBeenCalledWith(INSTITUTION_ID, filters);
      expect(screen.getByTestId('count')).toHaveTextContent('3');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('filtre côté client via onSearch (memo) sans nouvel appel API', async () => {
    const data = [
      makeProduct({ designation: 'Crédit Scolaire', type: 'CREDIT' }, 1),
      makeProduct({ designation: 'Plan Épargne', type: 'EPARGNE' }, 2),
    ];
    getByInstitution.mockResolvedValueOnce(data);

    render(<InstitutionClient institutionId={INSTITUTION_ID} />);
    await waitFor(() => expect(getByInstitution).toHaveBeenCalled());

    await act(async () => {
      searchBarProps.onSearch('épar');
    });

    expect(screen.getByTestId('count')).toHaveTextContent('1');

    expect(filterByInstitution).not.toHaveBeenCalled();
  });

  it('affiche un panneau d’erreur et relance un retry (Réessayer)', async () => {
    getByInstitution.mockRejectedValueOnce(new Error('BOOM'));

    getByInstitution.mockResolvedValueOnce([makeProduct({}, 1)]);

    render(<InstitutionClient institutionId={INSTITUTION_ID} />);

    const errTitle = await screen.findByText(/Erreur de chargement/i);
    expect(errTitle).toBeInTheDocument();
    expect(screen.getByText('BOOM')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Réessayer/i }));

    await waitFor(() => {
      expect(getByInstitution).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('ProductList')).toBeInTheDocument();
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });
  });
});
