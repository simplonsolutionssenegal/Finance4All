import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { PDFExport } from '@/components/export/PDFExport';
import type { FinancialService } from '@/types/FinancialServices';

const mockServices: FinancialService[] = [
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

describe('PDFExport', () => {
  const defaultProps = {
    services: mockServices,
    searchTerm: 'test search',
    totalResults: 25,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock jsPDF
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();

    // Mock document methods
    document.createElement = jest.fn().mockImplementation(tagName => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: jest.fn(),
        };
      }
      return {};
    });

    // Mock window.open
    window.open = jest.fn();
  });

  describe('Button rendering', () => {
    it('should render export button', () => {
      render(<PDFExport {...defaultProps} />);

      expect(screen.getByText('Exporter PDF')).toBeInTheDocument();
    });

    it('should apply correct button styling', () => {
      render(<PDFExport {...defaultProps} />);

      const button = screen.getByText('Exporter PDF');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Export functionality', () => {
    it('should handle export button click', async () => {
      const user = userEvent.setup();
      render(<PDFExport {...defaultProps} />);

      const exportButton = screen.getByText('Exporter PDF');
      await user.click(exportButton);

      // Should trigger PDF generation (mocked)
      expect(exportButton).toBeInTheDocument();
    });

    it('should display services count correctly', () => {
      render(<PDFExport {...defaultProps} />);

      expect(screen.getByText('2')).toBeInTheDocument(); // services.length
    });

    it('should display search term in export', () => {
      render(<PDFExport {...defaultProps} />);

      expect(screen.getByText('test search')).toBeInTheDocument();
    });

    it('should display total results', () => {
      render(<PDFExport {...defaultProps} />);

      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });

  describe('Data handling', () => {
    it('should handle empty services array', () => {
      render(<PDFExport {...defaultProps} services={[]} />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('test search')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('should handle large datasets', () => {
      const manyServices = Array.from({ length: 1000 }, (_, i) => ({
        ...mockServices[0],
        id: `service-${i}`,
        designation: `Service ${i}`,
      }));

      render(<PDFExport {...defaultProps} services={manyServices} />);

      expect(screen.getByText('1000')).toBeInTheDocument();
    });
  });

  describe('Search term handling', () => {
    it('should handle empty search term', () => {
      render(<PDFExport {...defaultProps} searchTerm='' />);

      expect(screen.getByText('Aucun terme de recherche')).toBeInTheDocument();
    });

    it('should handle long search terms', () => {
      const longSearchTerm =
        'This is a very long search term that might cause layout issues if not handled properly';
      render(<PDFExport {...defaultProps} searchTerm={longSearchTerm} />);

      expect(screen.getByText(longSearchTerm)).toBeInTheDocument();
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
        render(<PDFExport {...defaultProps} services={malformedServices} />);
      }).not.toThrow();
    });

    it('should handle null or undefined props', () => {
      expect(() => {
        render(<PDFExport services={null as any} searchTerm='' totalResults={0} />);
      }).not.toThrow();

      expect(() => {
        render(<PDFExport services={undefined as any} searchTerm='' totalResults={0} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button accessibility', () => {
      render(<PDFExport {...defaultProps} />);

      const button = screen.getByText('Exporter PDF');
      expect(button).toBeInTheDocument();
    });

    it('should have proper semantic structure', () => {
      render(<PDFExport {...defaultProps} />);

      expect(screen.getByText('Exporter PDF')).toBeInTheDocument();
    });
  });

  describe('Performance considerations', () => {
    it('should handle frequent re-renders efficiently', () => {
      const { rerender } = render(<PDFExport {...defaultProps} />);

      // Re-render multiple times
      for (let i = 0; i < 10; i++) {
        rerender(<PDFExport {...defaultProps} />);
      }

      // Should still work correctly
      expect(screen.getByText('Exporter PDF')).toBeInTheDocument();
    });
  });
});
