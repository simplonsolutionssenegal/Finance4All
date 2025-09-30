import { render, screen, fireEvent } from '@testing-library/react';

import ConfirmDeleteModal from '@/components/products/ConfirmDeleteModal';
import type { Product } from '@/types/Product';

const product: Product = {
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

describe('ConfirmDeleteModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    product,
  };

  it('renders modal with product designation', () => {
    render(<ConfirmDeleteModal {...defaultProps} />);
    expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument();
    expect(screen.getByText(/Produit Test/)).toBeInTheDocument();
    expect(screen.getByText('Supprimer définitivement')).toBeInTheDocument();
    expect(screen.getByText('Annuler')).toBeInTheDocument();
  });

  it('calls onClose when Annuler is clicked', () => {
    render(<ConfirmDeleteModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Annuler'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onConfirm when Supprimer définitivement is clicked', () => {
    render(<ConfirmDeleteModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Supprimer définitivement'));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });
});
