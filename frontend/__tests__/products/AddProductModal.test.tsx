// Mock Tabs to always render all children (for robust testing)
jest.mock('@/components/ui/tabs', () => {
  const React = require('react');
  return {
    Tabs: ({ children }: any) => <div>{children}</div>,
    TabsList: ({ children }: any) => <div>{children}</div>,
    TabsTrigger: ({ children }: any) => <button>{children}</button>,
    TabsContent: ({ children }: any) => <div>{children}</div>,
  };
});
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import AddProductModal from '@/components/products/AddProductModal';

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onCreateProduct: jest.fn(() => Promise.resolve()),
  isCreating: false,
};

describe('AddProductModal', () => {
  beforeEach(() => {
    window.alert = jest.fn();
    jest.clearAllMocks();
  });

  it('renders modal with all tabs and fields', () => {
    render(<AddProductModal {...defaultProps} />);
    expect(screen.getByText('Ajouter un nouveau produit')).toBeInTheDocument();
    expect(screen.getByText('Informations générales')).toBeInTheDocument();
    expect(screen.getByText('Remboursement')).toBeInTheDocument();
    expect(screen.getByText('Éligibilité')).toBeInTheDocument();
    expect(screen.getByLabelText('Désignation *')).toBeInTheDocument();
    // Vérifie seulement la présence du texte du label (pas de champ natif accessible)
    expect(screen.getByText('Type de produit *')).toBeInTheDocument();
    expect(screen.getByLabelText('Montant minimum (€) *')).toBeInTheDocument();
    expect(screen.getByLabelText('Montant maximum (€) *')).toBeInTheDocument();
  });

  it('calls onClose when Annuler is clicked', () => {
    render(<AddProductModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Annuler'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows alert if required fields are missing', async () => {
    render(<AddProductModal {...defaultProps} />);
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Veuillez remplir tous les champs obligatoires');
    });
  });

  it('calls onCreateProduct with correct data', async () => {
    const onCreateProduct = jest.fn(() => Promise.resolve());
    render(<AddProductModal {...defaultProps} onCreateProduct={onCreateProduct} />);
    fireEvent.change(await screen.findByLabelText('Désignation *'), {
      target: { value: 'Produit Test' },
    });
    fireEvent.change(await screen.findByLabelText('Montant minimum (€) *'), {
      target: { value: '1000' },
    });
    fireEvent.change(await screen.findByLabelText('Montant maximum (€) *'), {
      target: { value: '5000' },
    });
    fireEvent.change(await screen.findByLabelText('Durée minimum (mois) *'), {
      target: { value: '12' },
    });
    fireEvent.change(await screen.findByLabelText('Durée maximum (mois) *'), {
      target: { value: '24' },
    });
    fireEvent.change(await screen.findByLabelText('Taux intérêt (%) *'), {
      target: { value: '5' },
    });
    fireEvent.change(await screen.findByLabelText('Âge minimum *'), { target: { value: '18' } });
    fireEvent.change(await screen.findByLabelText('Revenu minimum (€) *'), {
      target: { value: '2000' },
    });
    fireEvent.click(screen.getByText('Créer le produit'));
    await waitFor(() => {
      expect(onCreateProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          designation: 'Produit Test',
          montantMinimum: 1000,
          montantMaximum: 5000,
          remboursement: expect.objectContaining({
            dureeMinimum: 12,
            dureeMaximum: 24,
            tauxInteret: 5,
          }),
          conditionsEligibilite: expect.objectContaining({ ageMinimum: 18, revenuMinimum: 2000 }),
        })
      );
    });
  });

  it('disables buttons when isCreating is true', () => {
    render(<AddProductModal {...defaultProps} isCreating={true} />);
    expect(screen.getByText('Annuler')).toBeDisabled();
    expect(screen.getByText('Création...')).toBeDisabled();
  });
});
