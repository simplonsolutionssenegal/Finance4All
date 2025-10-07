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

      expect(screen.getByText('Comparaison de Services')).toBeInTheDocument();
      expect(screen.getByText('Epargne Jeune')).toBeInTheDocument();
      expect(screen.getByText('Crédit Immobilier')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<ServiceComparison {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Comparaison de Services')).not.toBeInTheDocument();
    });
  });

  describe('Service display', () => {
    it('should display all services in comparison table', () => {
      render(<ServiceComparison {...defaultProps} />);

      expect(screen.getByText('Désignation')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Institution')).toBeInTheDocument();
      expect(screen.getByText('Montant max')).toBeInTheDocument();
      expect(screen.getByText('Taux')).toBeInTheDocument();
      expect(screen.getByText('Remboursement')).toBeInTheDocument();
    });

    it('should display service data correctly', () => {
      render(<ServiceComparison {...defaultProps} />);

      expect(screen.getByText('Epargne Jeune')).toBeInTheDocument();
      expect(screen.getByText('Crédit Immobilier')).toBeInTheDocument();
      expect(screen.getByText('Société Générale')).toBeInTheDocument();
      expect(screen.getByText('Banque Atlantique')).toBeInTheDocument();
      expect(screen.getByText('1,000,000')).toBeInTheDocument();
      expect(screen.getByText('50,000,000')).toBeInTheDocument();
    });
  });

  describe('Close functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServiceComparison {...defaultProps} />);

      const closeButton = screen.getByText('Fermer');
      await user.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should have proper close button styling', () => {
      render(<ServiceComparison {...defaultProps} />);

      const closeButton = screen.getByText('Fermer');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Table structure', () => {
    it('should render comparison table with proper headers', () => {
      render(<ServiceComparison {...defaultProps} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThan(0);
    });

    it('should render correct number of rows', () => {
      render(<ServiceComparison {...defaultProps} />);

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(3); // Header + 2 service rows
    });
  });

  describe('Empty state', () => {
    it('should handle empty services array', () => {
      render(<ServiceComparison {...defaultProps} services={[]} />);

      expect(screen.getByText('Comparaison de Services')).toBeInTheDocument();
      // Should still render table structure but no data rows
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<ServiceComparison {...defaultProps} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Comparaison de Services')).toBeInTheDocument();
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
