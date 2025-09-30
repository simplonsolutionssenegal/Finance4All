import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import ProductEditModal from '@/components/products/ProductEditModal';
import { LoaderProvider } from '@/contexts/LoaderContext';
import type { Product } from '@/types/Product';

// Mock fetch global
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        status: 'success',
        data: {
          id: '1',
          designation: 'Produit Modifié',
          type: 'credit',
          montantMinimum: 2000,
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
      }),
  })
) as jest.Mock;

const mockProduct: Product = {
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
};

describe('ProductEditModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    product: mockProduct,
  };

  it('affiche le modal avec les données du produit', () => {
    render(
      <LoaderProvider>
        <ProductEditModal {...defaultProps} />
      </LoaderProvider>
    );
    expect(screen.getByText('Modifier le produit')).toBeInTheDocument();
    expect(screen.getByLabelText('Désignation *')).toHaveValue('Produit Test');
    expect(screen.getByLabelText('Montant minimum (€) *')).toHaveValue(1000);
    expect(screen.getByLabelText('Montant maximum (€) *')).toHaveValue(5000);
  });

  it('appelle onClose quand Annuler est cliqué', () => {
    render(
      <LoaderProvider>
        <ProductEditModal {...defaultProps} />
      </LoaderProvider>
    );
    fireEvent.click(screen.getByText('Annuler'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('affiche une alerte si des champs obligatoires sont manquants', async () => {
    window.alert = jest.fn();
    render(
      <LoaderProvider>
        <ProductEditModal {...defaultProps} />
      </LoaderProvider>
    );
    fireEvent.change(screen.getByLabelText('Désignation *'), { target: { value: '' } });
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Veuillez remplir tous les champs obligatoires');
    });
  });

  it('soumet le formulaire avec les valeurs modifiées', async () => {
    render(
      <LoaderProvider>
        <ProductEditModal {...defaultProps} />
      </LoaderProvider>
    );
    fireEvent.change(screen.getByLabelText('Désignation *'), {
      target: { value: 'Produit Modifié' },
    });
    fireEvent.change(screen.getByLabelText('Montant minimum (€) *'), { target: { value: '2000' } });
    fireEvent.click(screen.getByText('Enregistrer les modifications'));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/products/1'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });
});
