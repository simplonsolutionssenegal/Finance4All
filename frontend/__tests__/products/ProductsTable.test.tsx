import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import ProductsTable from '@/components/products/ProductsTable';
import { LoaderProvider } from '@/contexts/LoaderContext';

jest.mock('@/lib/api/products', () => ({
  ProductsAPI: {
    getAllProducts: jest.fn(() =>
      Promise.resolve({
        data: [
          {
            id: '1',
            designation: 'Produit Test',
            type: 'credit',
            montantMinimum: 1000,
            montantMaximum: 5000,
            remboursement: {
              dureeMinimum: 12,
              dureeMaximum: 24,
              modalites: ['mensuel'],
              tauxInteret: 5,
              typeRemboursement: 'fixe',
              remboursementAnticipe: true,
            },
            conditionsEligibilite: {
              ageMinimum: 18,
              revenuMinimum: 1500,
              situationsProfessionnelles: ['CDI'],
              documentsRequis: [],
              autresConditions: [],
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      })
    ),
  },
}));

describe('ProductsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le chargement puis la liste des produits', async () => {
    render(
      <LoaderProvider>
        <ProductsTable />
      </LoaderProvider>
    );
    expect(screen.getByText('Chargement des produits...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Produit Test')).toBeInTheDocument();
      expect(screen.getByText('credit')).toBeInTheDocument();
    });
  });

  it('affiche un message si aucun produit', async () => {
    (require('@/lib/api/products').ProductsAPI.getAllProducts as jest.Mock).mockResolvedValueOnce({
      data: [],
    });
    render(
      <LoaderProvider>
        <ProductsTable />
      </LoaderProvider>
    );
    expect(screen.getByText('Chargement des produits...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Aucun produit disponible')).toBeInTheDocument();
    });
  });

  it('filtre les produits selon la recherche', async () => {
    (require('@/lib/api/products').ProductsAPI.getAllProducts as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          id: '1',
          designation: 'Produit A',
          type: 'credit',
          montantMinimum: 1000,
          montantMaximum: 5000,
          remboursement: {
            dureeMinimum: 12,
            dureeMaximum: 24,
            modalites: ['mensuel'],
            tauxInteret: 5,
            typeRemboursement: 'fixe',
            remboursementAnticipe: true,
          },
          conditionsEligibilite: {
            ageMinimum: 18,
            revenuMinimum: 1500,
            situationsProfessionnelles: ['CDI'],
            documentsRequis: [],
            autresConditions: [],
          },
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          designation: 'Produit B',
          type: 'epargne',
          montantMinimum: 2000,
          montantMaximum: 8000,
          remboursement: {
            dureeMinimum: 6,
            dureeMaximum: 18,
            modalites: ['trimestriel'],
            tauxInteret: 3,
            typeRemboursement: 'variable',
            remboursementAnticipe: false,
          },
          conditionsEligibilite: {
            ageMinimum: 21,
            revenuMinimum: 3000,
            situationsProfessionnelles: ['CDI'],
            documentsRequis: [],
            autresConditions: [],
          },
          createdAt: '',
          updatedAt: '',
        },
      ],
    });
    render(
      <LoaderProvider>
        <ProductsTable />
      </LoaderProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('Produit A')).toBeInTheDocument();
      expect(screen.getByText('Produit B')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText('Rechercher un produit...'), {
      target: { value: 'epargne' },
    });
    expect(screen.queryByText('Produit A')).not.toBeInTheDocument();
    expect(screen.getByText('Produit B')).toBeInTheDocument();
  });
});
