import { render, screen } from '@testing-library/react';

import ProductInfoModal from '@/components/products/ProductInfoModal';
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

describe('ProductInfoModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    product,
  };

  it('renders modal with product details', () => {
    render(<ProductInfoModal {...defaultProps} />);
    expect(screen.getByText('Produit financier - Détail')).toBeInTheDocument();
    expect(screen.getByText('Produit Test')).toBeInTheDocument();
    expect(screen.getByText(/credit/i)).toBeInTheDocument();

    // Vérifie la section Montant
    expect(screen.getByText('Montant')).toBeInTheDocument();
    expect(screen.getByText('Minimum')).toBeInTheDocument();
    expect(screen.getByText('Maximum')).toBeInTheDocument();

    // Vérifie les montants en utilisant une regex plus flexible
    expect(screen.getByText(/1\s*000\s*F\s*CFA/i)).toBeInTheDocument();
    expect(screen.getByText(/5\s*000\s*F\s*CFA/i)).toBeInTheDocument();

    // Vérifie les modalités de remboursement
    expect(screen.getByText('Modalités de remboursement')).toBeInTheDocument();
    expect(screen.getByText(/12\s*-\s*24\s*mois/)).toBeInTheDocument();
    expect(screen.getByText(/5\s*%/)).toBeInTheDocument();
    expect(screen.getByText(/fixe/i)).toBeInTheDocument();
    expect(screen.getByText(/Autorisé/i)).toBeInTheDocument();
  });
});
