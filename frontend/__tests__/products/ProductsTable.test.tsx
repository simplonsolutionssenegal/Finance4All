import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import ProductsTable from '@/components/products/ProductsTable';
import { LoaderProvider } from '@/contexts/LoaderContext';

// Mock API and hooks
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
              revenuMinimum: 2000,
              situationsProfessionnelles: ['CDI'],
              documentsRequis: ['Pièce identité'],
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
jest.mock('@/hooks/products/useProductOperations', () => ({
  useRemoveProduct: () => ({ removeProduct: jest.fn(() => Promise.resolve()) }),
  useCreateProduct: () => ({ createProduct: jest.fn(() => Promise.resolve()) }),
  useUpdateProduct: () => ({ updateProduct: jest.fn(() => Promise.resolve()) }),
}));

describe('ProductsTable', () => {
  it('renders table and product row', async () => {
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

  it('filters products by search', async () => {
    render(
      <LoaderProvider>
        <ProductsTable />
      </LoaderProvider>
    );
    await waitFor(() => screen.getByText('Produit Test'));
    fireEvent.change(screen.getByPlaceholderText('Rechercher un produit...'), {
      target: { value: 'inexistant' },
    });
    expect(screen.getByText('Aucun produit trouvé pour cette recherche')).toBeInTheDocument();
  });

  it('shows add product modal when button is clicked', async () => {
    render(
      <LoaderProvider>
        <ProductsTable />
      </LoaderProvider>
    );
    await waitFor(() => screen.getByText('Produit Test'));
    fireEvent.click(screen.getByText('Ajouter un produit'));
    expect(screen.getByText('Ajouter un nouveau produit')).toBeInTheDocument();
  });

  it('shows product info modal when Eye button is clicked', async () => {
    render(
      <LoaderProvider>
        <ProductsTable />
      </LoaderProvider>
    );
    await waitFor(() => screen.getByText('Produit Test'));
    fireEvent.click(screen.getByTitle('Voir les détails'));
    expect(screen.getByText('Produit financier - Détail')).toBeInTheDocument();
  });

  it('shows edit modal when Edit button is clicked', async () => {
    render(
      <LoaderProvider>
        <ProductsTable />
      </LoaderProvider>
    );
    await waitFor(() => screen.getByText('Produit Test'));
    fireEvent.click(screen.getByTitle('Modifier'));
    expect(screen.getByText('Modifier le produit')).toBeInTheDocument();
  });

  it('shows confirm delete modal when Trash button is clicked', async () => {
    render(
      <LoaderProvider>
        <ProductsTable />
      </LoaderProvider>
    );
    await waitFor(() => screen.getByText('Produit Test'));
    fireEvent.click(screen.getByTitle('Supprimer'));
    expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument();
  });
});
