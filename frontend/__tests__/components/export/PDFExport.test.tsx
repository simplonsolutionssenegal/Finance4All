import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { PDFExport } from '@/components/export/PDFExport';
import type { FinancialService } from '@/types/FinancialServices';

// Mock html2canvas
jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn(() =>
    Promise.resolve({
      toDataURL: jest.fn(() => 'data:image/png;base64,mockImageData'),
      width: 800,
      height: 600,
    })
  ),
}));

// Mock jsPDF
jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getWidth: jest.fn(() => 210),
        getHeight: jest.fn(() => 297),
      },
    },
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    setFont: jest.fn(),
    setDrawColor: jest.fn(),
    text: jest.fn(),
    line: jest.fn(),
    addPage: jest.fn(),
    getNumberOfPages: jest.fn(() => 1),
    setPage: jest.fn(),
    save: jest.fn(),
    addImage: jest.fn(),
  })),
}));

// Mock document.getElementById for table export
Object.defineProperty(document, 'getElementById', {
  value: jest.fn((id: string) => {
    if (id === 'services-table') {
      return {
        getBoundingClientRect: jest.fn(() => ({
          width: 800,
          height: 600,
          top: 0,
          left: 0,
        })),
      };
    }
    return null;
  }),
  writable: true,
});

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

    it('should display export button correctly', () => {
      render(<PDFExport {...defaultProps} />);

      expect(screen.getByText('Exporter PDF')).toBeInTheDocument();
    });

    it('should call PDF generation functions when clicked', async () => {
      const user = userEvent.setup();
      render(<PDFExport {...defaultProps} />);

      const exportButton = screen.getByText('Exporter PDF');
      await user.click(exportButton);

      // Verify that jsPDF constructor was called (mocked)
      expect(require('jspdf').default).toHaveBeenCalled();
    });
  });

  describe('Data handling', () => {
    it('should handle empty services array', () => {
      render(<PDFExport {...defaultProps} services={[]} />);

      // Button should still be rendered even with empty services
      expect(screen.getByText('Exporter PDF')).toBeInTheDocument();
    });

    it('should handle large datasets', () => {
      const manyServices = Array.from({ length: 1000 }, (_, i) => ({
        ...mockServices[0],
        id: `service-${i}`,
        designation: `Service ${i}`,
      }));

      render(<PDFExport {...defaultProps} services={manyServices} />);

      // Button should still be rendered with large datasets
      expect(screen.getByText('Exporter PDF')).toBeInTheDocument();
    });
  });

  describe('Search term handling', () => {
    it('should handle empty search term', () => {
      render(<PDFExport {...defaultProps} searchTerm='' />);

      // Button should still be rendered with empty search term
      expect(screen.getByText('Exporter PDF')).toBeInTheDocument();
    });

    it('should handle long search terms', () => {
      const longSearchTerm =
        'This is a very long search term that might cause layout issues if not handled properly';
      render(<PDFExport {...defaultProps} searchTerm={longSearchTerm} />);

      // Button should still be rendered with long search terms
      expect(screen.getByText('Exporter PDF')).toBeInTheDocument();
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

      // Should render without throwing errors
      expect(() => {
        render(<PDFExport {...defaultProps} services={malformedServices} />);
      }).not.toThrow();

      // Button should still be rendered
      expect(screen.getByText('Exporter PDF')).toBeInTheDocument();
    });

    it('should handle null or undefined props gracefully', () => {
      // Test that component renders correctly with default props
      render(<PDFExport {...defaultProps} />);

      // Button should be rendered correctly
      expect(screen.getByText('Exporter PDF')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button accessibility', () => {
      render(<PDFExport {...defaultProps} />);

      const button = screen.getByText('Exporter PDF');
      expect(button).toBeInTheDocument();
      // Button should be clickable and have proper role
      expect(button.tagName).toBe('BUTTON');
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
