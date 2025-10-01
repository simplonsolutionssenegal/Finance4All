// eslint-disable-next-line import/order
import userEvent from '@testing-library/user-event';

it('should call fetchProducts and handle loading, success, and error states', async () => {
  const mockGetAllProducts = require('@/lib/api/products').ProductsAPI.getAllProducts;
  // 1er appel : erreur, 2e appel : succès
  mockGetAllProducts.mockImplementationOnce(() => Promise.reject(new Error('Erreur API')));
  mockGetAllProducts.mockImplementationOnce(() =>
    Promise.resolve({
      data: [
        {
          id: '2',
          designation: 'Produit Succès',
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
            documentsRequis: ['Justificatif domicile'],
            autresConditions: [],
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })
  );

  render(
    <LoaderProvider>
      <ProductsTable />
    </LoaderProvider>
  );

  // Premier appel : erreur
  await waitFor(() => {
    expect(screen.getByText('Chargement des produits...')).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(screen.getByText('Aucun produit disponible')).toBeInTheDocument();
  });

  // Simuler une création de produit complète
  await userEvent.click(screen.getByText('Ajouter un produit'));

  // Remplir tous les champs obligatoires
  await userEvent.type(screen.getByLabelText('Désignation *'), 'Produit Succès');
  await userEvent.type(screen.getByLabelText('Montant minimum (€) *'), '2000');
  await userEvent.type(screen.getByLabelText('Montant maximum (€) *'), '8000');

  // Aller à l’onglet Remboursement via son rôle
  const tabRemboursement = screen.getByRole('tab', { name: 'Remboursement' });
  await userEvent.click(tabRemboursement);
  // Debug du DOM après le clic
  screen.debug();
  await waitFor(() => {
    expect(screen.getByLabelText('Durée minimum (mois) *')).toBeInTheDocument();
  });
  await userEvent.type(screen.getByLabelText('Durée minimum (mois) *'), '6');
  await userEvent.type(screen.getByLabelText('Durée maximum (mois) *'), '18');
  await userEvent.type(screen.getByLabelText("Taux d'intérêt (%) *"), '3');
  // Pour le select shadcn/ui, cibler le bouton juste après le label
  const typeRembLabel = screen.getByText('Type de remboursement *');
  const selectTrigger = typeRembLabel.parentElement?.querySelector('button');
  if (!selectTrigger) throw new Error('Select trigger not found');
  fireEvent.mouseDown(selectTrigger);
  await userEvent.click(screen.getByText('Variable'));

  // Aller à l’onglet Éligibilité
  await userEvent.click(screen.getByRole('tab', { name: 'Éligibilité' }));
  await userEvent.type(screen.getByLabelText('Âge minimum *'), '21');
  await userEvent.type(screen.getByLabelText('Revenu minimum (€) *'), '3000');

  // Soumettre le formulaire
  await userEvent.click(screen.getByText('Créer le produit'));

  // Attendre le succès
  await waitFor(() => {
    expect(screen.getByText('Produit Succès')).toBeInTheDocument();
    expect(screen.getByText('epargne')).toBeInTheDocument();
  });
});
// Test minimal pour garantir la couverture de l’initialisation des hooks d’état
it('should render ProductsTable without crashing (minimal init test)', () => {
  const { container } = render(<ProductsTable />);
  expect(container).toBeInTheDocument();
});
// eslint-disable-next-line import/order
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
