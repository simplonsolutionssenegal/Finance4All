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
    // Vérifie qu'un montant minimum formaté est affiché (ex: 1 000 € ou 5 000 €)
    expect(screen.getAllByText(/1.?000.?€/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/5.?000.?€/i)[0]).toBeInTheDocument();
    expect(screen.getByText('12 - 24 mois')).toBeInTheDocument();
    expect(screen.getByText(/5 ?%/)).toBeInTheDocument();
    expect(screen.getByText(/fixe/i)).toBeInTheDocument();
    expect(screen.getByText(/Autorisé/i)).toBeInTheDocument();
  });
});
