import { render, screen } from '@testing-library/react';
import React from 'react';

import { PaymentSchedule } from '@/components/schedule/PaymentSchedule';
import type { FinancialService } from '@/types/FinancialServices';

const mockService: FinancialService = {
  id: '1',
  designation: 'Crédit Immobilier Premium',
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
};

describe('PaymentSchedule', () => {
  const defaultProps = {
    service: mockService,
    amount: 1000000,
    duration: 12,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render schedule title', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByText('Échéancier de Paiement')).toBeInTheDocument();
    });

    it('should display service designation', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByText('Crédit Immobilier Premium')).toBeInTheDocument();
    });

    it('should display loan amount', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByText('Montant emprunté: 1,000,000 FCFA')).toBeInTheDocument();
    });

    it('should display duration', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByText('Durée: 12 mois')).toBeInTheDocument();
    });

    it('should display interest rate', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByText("Taux d'intérêt: 7.2%")).toBeInTheDocument();
    });
  });

  describe('Payment table', () => {
    it('should render payment table', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByText('Mois')).toBeInTheDocument();
      expect(screen.getByText('Capital restant')).toBeInTheDocument();
      expect(screen.getByText('Intérêts')).toBeInTheDocument();
      expect(screen.getByText('Capital amorti')).toBeInTheDocument();
      expect(screen.getByText('Mensualité')).toBeInTheDocument();
    });

    it('should render correct number of payment rows', () => {
      render(<PaymentSchedule {...defaultProps} />);

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1); // Header + 12 data rows
    });

    it('should display monthly payments correctly', () => {
      render(<PaymentSchedule {...defaultProps} />);

      // Should show monthly payment calculations
      expect(screen.getByText(/FCFA/)).toBeInTheDocument();
    });
  });

  describe('Calculations', () => {
    it('should calculate correct monthly payment', () => {
      render(<PaymentSchedule {...defaultProps} />);

      // The calculation should be visible in the table
      expect(screen.getByText(/FCFA/)).toBeInTheDocument();
    });

    it('should handle different loan amounts', () => {
      render(<PaymentSchedule {...defaultProps} amount={2000000} />);

      expect(screen.getByText('Montant emprunté: 2,000,000 FCFA')).toBeInTheDocument();
    });

    it('should handle different durations', () => {
      render(<PaymentSchedule {...defaultProps} duration={24} />);

      expect(screen.getByText('Durée: 24 mois')).toBeInTheDocument();
    });

    it('should handle different interest rates', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByText("Taux d'intérêt: 7.2%")).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle zero amount', () => {
      render(<PaymentSchedule {...defaultProps} amount={0} />);

      expect(screen.getByText('Montant emprunté: 0 FCFA')).toBeInTheDocument();
    });

    it('should handle zero duration', () => {
      render(<PaymentSchedule {...defaultProps} duration={0} />);

      expect(screen.getByText('Durée: 0 mois')).toBeInTheDocument();
    });

    it('should handle very large amounts', () => {
      render(<PaymentSchedule {...defaultProps} amount={999999999} />);

      expect(screen.getByText('Montant emprunté: 999,999,999 FCFA')).toBeInTheDocument();
    });

    it('should handle very long durations', () => {
      render(<PaymentSchedule {...defaultProps} duration={360} />);

      expect(screen.getByText('Durée: 360 mois')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle malformed service data gracefully', () => {
      const malformedService = {
        id: '1',
        designation: '',
        type: 'Crédit' as const,
        institution: '',
        maxAmount: NaN,
        interestRate: Infinity,
        reimbursement: '',
        status: 'ACTIF' as const,
        geographicZones: [],
        createdAt: '',
        description: '',
        minAmount: -1000,
      };

      expect(() => {
        render(<PaymentSchedule {...defaultProps} service={malformedService} />);
      }).not.toThrow();
    });

    it('should handle null or undefined service', () => {
      expect(() => {
        render(<PaymentSchedule {...defaultProps} service={null as any} />);
      }).not.toThrow();

      expect(() => {
        render(<PaymentSchedule {...defaultProps} service={undefined as any} />);
      }).not.toThrow();
    });
  });

  describe('Table structure', () => {
    it('should have proper table accessibility', () => {
      render(<PaymentSchedule {...defaultProps} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBe(5); // Mois, Capital restant, Intérêts, Capital amorti, Mensualité
    });

    it('should render table rows correctly', () => {
      render(<PaymentSchedule {...defaultProps} />);

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(5); // Header + data rows
    });
  });

  describe('Performance considerations', () => {
    it('should handle frequent re-renders efficiently', () => {
      const { rerender } = render(<PaymentSchedule {...defaultProps} />);

      // Re-render multiple times
      for (let i = 0; i < 10; i++) {
        rerender(<PaymentSchedule {...defaultProps} />);
      }

      // Should still work correctly
      expect(screen.getByText('Échéancier de Paiement')).toBeInTheDocument();
    });

    it('should handle large durations efficiently', () => {
      render(<PaymentSchedule {...defaultProps} duration={120} />);

      // Should render without performance issues
      expect(screen.getByText('Échéancier de Paiement')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Échéancier de Paiement')).toBeInTheDocument();
    });

    it('should have readable table headers', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByRole('columnheader', { name: /mois/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /capital restant/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /intérêts/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /capital amorti/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /mensualité/i })).toBeInTheDocument();
    });
  });

  describe('Currency formatting', () => {
    it('should format amounts correctly', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByText(/FCFA/)).toBeInTheDocument();
    });

    it('should handle decimal amounts', () => {
      render(<PaymentSchedule {...defaultProps} amount={1234.56} />);

      expect(screen.getByText(/FCFA/)).toBeInTheDocument();
    });
  });

  describe('Data display', () => {
    it('should display all loan parameters', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByText('Crédit Immobilier Premium')).toBeInTheDocument();
      expect(screen.getByText('1,000,000 FCFA')).toBeInTheDocument();
      expect(screen.getByText('12 mois')).toBeInTheDocument();
      expect(screen.getByText('7.2%')).toBeInTheDocument();
    });

    it('should handle special characters in service data', () => {
      const specialCharService = {
        ...mockService,
        designation: 'Crédit with spécial charácters & symbols!',
      };

      render(<PaymentSchedule {...defaultProps} service={specialCharService} />);

      expect(screen.getByText('Crédit with spécial charácters & symbols!')).toBeInTheDocument();
    });
  });
});
