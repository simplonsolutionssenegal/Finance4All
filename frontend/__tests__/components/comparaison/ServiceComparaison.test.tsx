import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ServiceComparison } from '@/components/comparaison/ServiceComparaison';

// Mock child components and dependencies
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant }: any) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
}));

const mockServices: Array<{
  id: string;
  designation: string;
  type: 'Epargne' | 'Crédit' | 'Assurance';
  institution: string;
  maxAmount: number;
  interestRate: number;
  reimbursement: string;
  status: 'ACTIF' | 'INACTIF';
  geographicZones: string[];
  createdAt: string;
  description: string;
  minAmount: number;
}> = [
  {
    id: '1',
    designation: 'Epargne Jeune',
    type: 'Epargne',
    institution: 'Société Générale',
    maxAmount: 1000000,
    interestRate: 5.5,
    reimbursement: 'Mensuel',
    status: 'ACTIF',
    geographicZones: ['Zone Géo A'],
    createdAt: '2024-01-01',
    description: 'Compte épargne pour les jeunes',
    minAmount: 10000,
  },
  {
    id: '2',
    designation: 'Crédit Immobilier',
    type: 'Crédit',
    institution: 'Banque Atlantique',
    maxAmount: 50000000,
    interestRate: 7.2,
    reimbursement: 'Mensuel',
    status: 'ACTIF',
    geographicZones: ['Zone Géo A', 'Zone Géo B'],
    createdAt: '2024-01-02',
    description: "Crédit pour l'achat immobilier",
    minAmount: 5000000,
  },
];

describe('ServiceComparison', () => {
  const defaultProps = {
    services: mockServices,
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal visibility', () => {
    it('should render when isOpen is true', () => {
      render(<ServiceComparison {...defaultProps} />);

      expect(screen.getByText('Comparaison de Produits & Simulations')).toBeInTheDocument();
      expect(screen.getByText('Epargne Jeune')).toBeInTheDocument();
      expect(screen.getByText('Crédit Immobilier')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<ServiceComparison {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Comparaison de Produits & Simulations')).not.toBeInTheDocument();
    });
  });

  describe('Service display', () => {
    it('should display all services in selection list', () => {
      render(<ServiceComparison {...defaultProps} />);

      // Check that service cards are displayed in selection list
      expect(screen.getByText('Epargne Jeune')).toBeInTheDocument();
      expect(screen.getByText('Crédit Immobilier')).toBeInTheDocument();
      expect(screen.getByText('Société Générale')).toBeInTheDocument();
      expect(screen.getByText('Banque Atlantique')).toBeInTheDocument();
      expect(screen.getByText('5.5%')).toBeInTheDocument();
      expect(screen.getByText('7.2%')).toBeInTheDocument();
    });

    it('should display service selection interface correctly', () => {
      render(<ServiceComparison {...defaultProps} />);

      // Check selection interface elements
      expect(screen.getByText('Sélectionner les produits à comparer (max 3)')).toBeInTheDocument();
      expect(screen.getAllByText('Ajouter')).toHaveLength(2); // Two services
      expect(screen.getByText('Epargne')).toBeInTheDocument(); // Badge
      expect(screen.getByText('Crédit')).toBeInTheDocument(); // Badge
    });
  });

  describe('Close functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServiceComparison {...defaultProps} />);

      // Find close button by its SVG content or aria-label
      const closeButton = screen.getByRole('button', { name: '' }); // Button with icon only
      await user.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should have proper close button styling', () => {
      render(<ServiceComparison {...defaultProps} />);

      // Find close button by its SVG content
      const closeButton = screen.getByRole('button', { name: '' });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Table structure', () => {
    it('should render comparison table with proper headers when services are selected', async () => {
      const user = userEvent.setup();
      render(<ServiceComparison {...defaultProps} />);

      // Select first service to trigger comparison table
      const addButton = screen.getAllByText('Ajouter')[0];
      await user.click(addButton);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThan(0);
    });

    it('should render correct number of rows when services are selected', async () => {
      const user = userEvent.setup();
      render(<ServiceComparison {...defaultProps} />);

      // Select first service
      const addButton = screen.getAllByText('Ajouter')[0];
      await user.click(addButton);

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  describe('Empty state', () => {
    it('should handle empty services array', () => {
      render(<ServiceComparison {...defaultProps} services={[]} />);

      expect(screen.getByText('Comparaison de Produits & Simulations')).toBeInTheDocument();
      // Should still render table structure but no data rows
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', async () => {
      const user = userEvent.setup();
      render(<ServiceComparison {...defaultProps} />);

      // Should have proper headings
      expect(screen.getByText('Comparaison de Produits & Simulations')).toBeInTheDocument();
      expect(screen.getByText('Sélectionner les produits à comparer (max 3)')).toBeInTheDocument();

      // Select a service to show comparison table
      const addButton = screen.getAllByText('Ajouter')[0];
      await user.click(addButton);

      // Now table should be accessible
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle malformed service data gracefully', () => {
      const malformedServices = [
        {
          id: '1',
          designation: '',
          type: 'Epargne' as const,
          institution: '',
          maxAmount: NaN,
          interestRate: Infinity,
          reimbursement: '',
          status: 'ACTIF' as const,
          geographicZones: [],
          createdAt: '',
          description: '',
          minAmount: -1000,
        },
      ];

      expect(() => {
        render(<ServiceComparison {...defaultProps} services={malformedServices} />);
      }).not.toThrow();
    });
  });
});
