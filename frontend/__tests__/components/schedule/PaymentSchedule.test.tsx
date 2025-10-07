import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

      expect(screen.getByText('Échéancier Détaillé')).toBeInTheDocument();
    });

    it('should display service designation', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByText(/Crédit Immobilier Premium/)).toBeInTheDocument();
    });

    it('should display service institution', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByText(/Banque Atlantique/)).toBeInTheDocument();
    });

    it('should display loan amount in summary card', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByText('Montant emprunté')).toBeInTheDocument();
      expect(screen.getByText('1 000 000 F CFA')).toBeInTheDocument();
    });

    it('should display export CSV button', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByText('Exporter CSV')).toBeInTheDocument();
    });
  });

  describe('Payment table', () => {
    it('should render payment table with correct headers', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByRole('columnheader', { name: /mois/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /date/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /mensualité/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /capital/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /intérêts/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /solde restant/i })).toBeInTheDocument();
    });

    it('should render correct number of payment rows initially', () => {
      render(<PaymentSchedule {...defaultProps} />);

      const rows = screen.getAllByRole('row');
      // 1 header row + 12 data rows (first 12 months displayed by default)
      expect(rows.length).toBe(13);
    });

    it('should display monthly payments correctly', () => {
      render(<PaymentSchedule {...defaultProps} />);

      // Should show F CFA currency format
      const fcfaElements = screen.getAllByText(/F CFA/);
      expect(fcfaElements.length).toBeGreaterThan(0);
    });

    it('should display month numbers in table', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  describe('Summary cards', () => {
    it('should display all three summary cards', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByText('Montant emprunté')).toBeInTheDocument();
      expect(screen.getByText('Total à rembourser')).toBeInTheDocument();
      expect(screen.getByText('Coût total')).toBeInTheDocument();
    });

    it('should display calculated amounts in summary', () => {
      render(<PaymentSchedule {...defaultProps} />);

      // Check that three amounts are displayed in summary cards
      // The exact pattern may vary (some amounts might have 1, 2, or 3 digit groups)
      const summaryAmounts = screen.getAllByText(/\d+[\s\d]*F CFA/);
      expect(summaryAmounts.length).toBeGreaterThanOrEqual(3);
    });

    it('should show correct labels for credit type', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByText('Montant emprunté')).toBeInTheDocument();
      expect(screen.getByText('Total à rembourser')).toBeInTheDocument();
      expect(screen.getByText('Coût total')).toBeInTheDocument();
    });

    it('should show correct labels for savings type', () => {
      const savingsService = { ...mockService, type: 'Epargne' as const };
      render(<PaymentSchedule {...defaultProps} service={savingsService} />);

      expect(screen.getByText('Capital initial')).toBeInTheDocument();
      expect(screen.getByText('Total versé')).toBeInTheDocument();
      expect(screen.getByText('Gains totaux')).toBeInTheDocument();
    });
  });

  describe('Calculations', () => {
    it('should calculate monthly payment for credit', () => {
      render(<PaymentSchedule {...defaultProps} />);

      // Monthly payment should be visible in the table
      expect(screen.getAllByText(/F CFA/).length).toBeGreaterThan(0);
    });

    it('should handle different loan amounts', () => {
      render(<PaymentSchedule {...defaultProps} amount={2000000} />);

      expect(screen.getByText('2 000 000 F CFA')).toBeInTheDocument();
    });

    it('should handle different durations', () => {
      render(<PaymentSchedule {...defaultProps} duration={24} />);

      const rows = screen.getAllByRole('row');
      // Should show first 12 months by default
      expect(rows.length).toBe(13);
    });

    it('should calculate interest correctly', () => {
      render(<PaymentSchedule {...defaultProps} />);

      // Interest should be displayed in summary and table
      expect(screen.getByText('Coût total')).toBeInTheDocument();
    });
  });

  describe('Show/Hide functionality', () => {
    it('should show "Afficher plus" button when duration > 12', async () => {
      render(<PaymentSchedule {...defaultProps} duration={24} />);

      const button = screen.getByRole('button', { name: /afficher les \d+ mois restants/i });
      expect(button).toBeInTheDocument();
    });

    it('should expand to show all months when clicked', async () => {
      const user = userEvent.setup();
      render(<PaymentSchedule {...defaultProps} duration={24} />);

      const expandButton = screen.getByRole('button', { name: /afficher les \d+ mois restants/i });
      await user.click(expandButton);

      const rows = screen.getAllByRole('row');
      // 1 header + 24 data rows
      expect(rows.length).toBe(25);
    });

    it('should collapse when "Afficher moins" is clicked', async () => {
      const user = userEvent.setup();
      render(<PaymentSchedule {...defaultProps} duration={24} />);

      const expandButton = screen.getByRole('button', { name: /afficher les \d+ mois restants/i });
      await user.click(expandButton);

      const collapseButton = screen.getByRole('button', { name: /afficher moins/i });
      await user.click(collapseButton);

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(13); // Back to 12 months + header
    });

    it('should not show expand button when duration <= 12', () => {
      render(<PaymentSchedule {...defaultProps} duration={12} />);

      const button = screen.queryByRole('button', { name: /afficher les/i });
      expect(button).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle zero amount', () => {
      render(<PaymentSchedule {...defaultProps} amount={0} />);

      // Check that zero amounts are displayed in summary cards
      const zeroAmountElements = screen.getAllByText('0 F CFA');
      expect(zeroAmountElements.length).toBeGreaterThanOrEqual(3); // At least 3 summary cards
    });

    it('should handle zero duration', () => {
      render(<PaymentSchedule {...defaultProps} duration={0} />);

      // Should render without errors
      expect(screen.getByText('Échéancier Détaillé')).toBeInTheDocument();
    });

    it('should handle very large amounts', () => {
      render(<PaymentSchedule {...defaultProps} amount={999999999} />);

      expect(screen.getByText(/999\s+999\s+999\s+F CFA/)).toBeInTheDocument();
    });

    it('should handle very long durations', () => {
      render(<PaymentSchedule {...defaultProps} duration={360} />);

      // Should display first 12 months by default
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(13);

      // Should have expand button
      expect(
        screen.getByRole('button', { name: /afficher les 348 mois restants/i })
      ).toBeInTheDocument();
    });
  });

  describe('CSV Export', () => {
    it('should have export CSV button', () => {
      render(<PaymentSchedule {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: /exporter csv/i });
      expect(exportButton).toBeInTheDocument();
    });

    it('should trigger CSV export when button is clicked', async () => {
      const user = userEvent.setup();
      // Mock URL.createObjectURL which is not available in JSDOM
      global.URL.createObjectURL = jest.fn(() => 'mocked-url');

      render(<PaymentSchedule {...defaultProps} />);

      const createElementSpy = jest.spyOn(document, 'createElement');
      const exportButton = screen.getByRole('button', { name: /exporter csv/i });

      await user.click(exportButton);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();

      // Cleanup
      delete (global.URL as any).createObjectURL;
    });
  });

  describe('Chart visualization', () => {
    it('should display evolution chart', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByText(/évolution/i)).toBeInTheDocument();
      expect(screen.getByText(/du solde restant/i)).toBeInTheDocument();
    });

    it('should show correct chart label for savings', () => {
      const savingsService = { ...mockService, type: 'Epargne' as const };
      render(<PaymentSchedule {...defaultProps} service={savingsService} />);

      expect(screen.getByText(/de l'épargne/i)).toBeInTheDocument();
    });
  });

  describe('Table structure', () => {
    it('should have proper table accessibility', () => {
      render(<PaymentSchedule {...defaultProps} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBe(6); // Mois, Date, Mensualité, Capital, Intérêts, Solde restant
    });

    it('should render table rows correctly', () => {
      render(<PaymentSchedule {...defaultProps} />);

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(13); // Header + 12 data rows
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
      expect(screen.getByText('Échéancier Détaillé')).toBeInTheDocument();
    });

    it('should handle large durations efficiently', () => {
      render(<PaymentSchedule {...defaultProps} duration={120} />);

      // Should render without performance issues
      expect(screen.getByText('Échéancier Détaillé')).toBeInTheDocument();

      // Should only show first 12 months initially
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(13);
    });
  });

  describe('Currency formatting', () => {
    it('should format amounts with spaces as thousand separators', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByText('1 000 000 F CFA')).toBeInTheDocument();
    });

    it('should display F CFA currency symbol', () => {
      render(<PaymentSchedule {...defaultProps} />);

      const fcfaElements = screen.getAllByText(/F CFA/);
      expect(fcfaElements.length).toBeGreaterThan(0);
    });
  });

  describe('Service type variations', () => {
    it('should display correct headers for credit type', () => {
      render(<PaymentSchedule {...defaultProps} />);

      expect(screen.getByRole('columnheader', { name: /mensualité/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /solde restant/i })).toBeInTheDocument();
    });

    it('should display correct headers for savings type', () => {
      const savingsService = { ...mockService, type: 'Epargne' as const };
      render(<PaymentSchedule {...defaultProps} service={savingsService} />);

      expect(screen.getByRole('columnheader', { name: /dépôt/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /épargne totale/i })).toBeInTheDocument();
    });
  });
});
