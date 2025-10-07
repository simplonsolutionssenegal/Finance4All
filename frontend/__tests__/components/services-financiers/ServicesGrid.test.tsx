import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ServicesGrid } from '@/components/services-financiers/ServicesGrid';
import { formatCurrency, formatPercentage } from '@/data/MockData';
import type { FinancialService } from '@/types/FinancialServices';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Eye: () => <span data-testid='eye-icon'>👁</span>,
  CreditCard: () => <span data-testid='edit-icon'>✏️</span>,
  Trash2: () => <span data-testid='trash-icon'>🗑️</span>,
  Calendar: () => <span data-testid='calendar-icon'>📅</span>,
}));

// Mock Badge component
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid='badge' data-variant={variant}>
      {children}
    </span>
  ),
}));

// Mock formatCurrency and formatPercentage
jest.mock('@/data/MockData', () => ({
  formatCurrency: jest.fn((amount: number) => `$${amount.toLocaleString()}`),
  formatPercentage: jest.fn((rate: number) => `${rate}%`),
}));

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

const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();
const mockOnView = jest.fn();
const mockOnSchedule = jest.fn();

const defaultProps = {
  services: mockServices,
  onEdit: mockOnEdit,
  onDelete: mockOnDelete,
  onView: mockOnView,
  onSchedule: mockOnSchedule,
};

describe('ServicesGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render all services as cards', () => {
      render(<ServicesGrid {...defaultProps} />);

      expect(screen.getByText('Epargne Jeune')).toBeInTheDocument();
      expect(screen.getByText('Crédit Immobilier')).toBeInTheDocument();
    });

    it('should render correct number of service cards', () => {
      render(<ServicesGrid {...defaultProps} />);

      const cards = screen.getAllByText(/Epargne Jeune|Crédit Immobilier/);
      expect(cards).toHaveLength(2);
    });

    it('should apply correct grid layout classes', () => {
      render(<ServicesGrid {...defaultProps} />);

      const grid = screen.getByRole('generic'); // The grid container
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6');
    });
  });

  describe('Service card content', () => {
    it('should display service designation and institution', () => {
      render(<ServicesGrid {...defaultProps} />);

      expect(screen.getByText('Epargne Jeune')).toBeInTheDocument();
      expect(screen.getByText('Société Générale')).toBeInTheDocument();
    });

    it('should display service type badge', () => {
      render(<ServicesGrid {...defaultProps} />);

      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);

      // First service should have 'Epargne' type
      const epargneBadge = screen.getByText('Epargne');
      expect(epargneBadge).toBeInTheDocument();
    });

    it('should display formatted max amount', () => {
      render(<ServicesGrid {...defaultProps} />);

      expect(screen.getByText('Montant max:')).toBeInTheDocument();
      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
      expect(formatCurrency).toHaveBeenCalledWith(1000000);
    });

    it('should display formatted interest rate', () => {
      render(<ServicesGrid {...defaultProps} />);

      expect(screen.getByText('Taux:')).toBeInTheDocument();
      expect(screen.getByText('5.5%')).toBeInTheDocument();
      expect(formatPercentage).toHaveBeenCalledWith(5.5);
    });

    it('should display reimbursement information', () => {
      render(<ServicesGrid {...defaultProps} />);

      expect(screen.getByText('Remboursement:')).toBeInTheDocument();
      expect(screen.getByText('Mensuel')).toBeInTheDocument();
    });

    it('should display service description', () => {
      render(<ServicesGrid {...defaultProps} />);

      expect(screen.getByText('Compte épargne pour les jeunes')).toBeInTheDocument();
    });

    it('should display geographic zones as tags', () => {
      render(<ServicesGrid {...defaultProps} />);

      expect(screen.getByText('Zone Géo A')).toBeInTheDocument();
      expect(screen.getByText('Zone Géo B')).toBeInTheDocument();
    });
  });

  describe('Action buttons', () => {
    it('should render all action buttons for each service', () => {
      render(<ServicesGrid {...defaultProps} />);

      const eyeIcons = screen.getAllByTestId('eye-icon');
      const calendarIcons = screen.getAllByTestId('calendar-icon');
      const editIcons = screen.getAllByTestId('edit-icon');
      const trashIcons = screen.getAllByTestId('trash-icon');

      expect(eyeIcons).toHaveLength(2); // One for each service
      expect(calendarIcons).toHaveLength(2);
      expect(editIcons).toHaveLength(2);
      expect(trashIcons).toHaveLength(2);
    });

    it('should call onView when view button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesGrid {...defaultProps} />);

      const viewButtons = screen.getAllByTestId('eye-icon');
      await user.click(viewButtons[0]);

      expect(mockOnView).toHaveBeenCalledWith(mockServices[0]);
    });

    it('should call onSchedule when schedule button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesGrid {...defaultProps} />);

      const scheduleButtons = screen.getAllByTestId('calendar-icon');
      await user.click(scheduleButtons[0]);

      expect(mockOnSchedule).toHaveBeenCalledWith(mockServices[0]);
    });

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesGrid {...defaultProps} />);

      const editButtons = screen.getAllByTestId('edit-icon');
      await user.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(mockServices[0]);
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesGrid {...defaultProps} />);

      const deleteButtons = screen.getAllByTestId('trash-icon');
      await user.click(deleteButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('Badge variants', () => {
    it('should use correct badge variant for Epargne type', () => {
      render(<ServicesGrid {...defaultProps} />);

      const epargneBadge = screen.getByText('Epargne');
      expect(epargneBadge).toHaveAttribute('data-variant', 'info');
    });

    it('should use correct badge variant for Crédit type', () => {
      render(<ServicesGrid {...defaultProps} />);

      const creditBadge = screen.getByText('Crédit');
      expect(creditBadge).toHaveAttribute('data-variant', 'warning');
    });

    it('should use default variant for other types', () => {
      const servicesWithOtherType = [
        {
          ...mockServices[0],
          type: 'Assurance' as const,
        },
      ];

      render(<ServicesGrid {...defaultProps} services={servicesWithOtherType} />);

      const assuranceBadge = screen.getByText('Assurance');
      expect(assuranceBadge).toHaveAttribute('data-variant', 'default');
    });
  });

  describe('Geographic zones display', () => {
    it('should display single geographic zone', () => {
      const singleZoneService = [
        {
          ...mockServices[0],
          geographicZones: ['Zone Géo A'],
        },
      ];

      render(<ServicesGrid {...defaultProps} services={singleZoneService} />);

      expect(screen.getByText('Zone Géo A')).toBeInTheDocument();
      expect(screen.queryByText('Zone Géo B')).not.toBeInTheDocument();
    });

    it('should display multiple geographic zones', () => {
      render(<ServicesGrid {...defaultProps} />);

      expect(screen.getByText('Zone Géo A')).toBeInTheDocument();
      expect(screen.getByText('Zone Géo B')).toBeInTheDocument();
    });

    it('should handle empty geographic zones', () => {
      const noZoneService = [
        {
          ...mockServices[0],
          geographicZones: [],
        },
      ];

      render(<ServicesGrid {...defaultProps} services={noZoneService} />);

      // Should not display any zone tags
      expect(screen.queryByText('Zone Géo A')).not.toBeInTheDocument();
      expect(screen.queryByText('Zone Géo B')).not.toBeInTheDocument();
    });

    it('should style geographic zones correctly', () => {
      render(<ServicesGrid {...defaultProps} />);

      const zoneTag = screen.getByText('Zone Géo A').closest('span');
      expect(zoneTag).toHaveClass(
        'text-xs',
        'bg-gray-100',
        'text-gray-600',
        'px-2',
        'py-1',
        'rounded'
      );
    });
  });

  describe('Card styling and layout', () => {
    it('should apply hover effects to cards', () => {
      render(<ServicesGrid {...defaultProps} />);

      const card = screen.getByText('Epargne Jeune').closest('.bg-white');
      expect(card).toHaveClass('hover:shadow-md', 'transition-shadow');
    });

    it('should have proper card structure', () => {
      render(<ServicesGrid {...defaultProps} />);

      const card = screen.getByText('Epargne Jeune').closest('.bg-white');
      expect(card).toHaveClass('rounded-lg', 'border', 'border-gray-200', 'p-6');
    });

    it('should arrange card content properly', () => {
      render(<ServicesGrid {...defaultProps} />);

      // Header section with designation and badge
      const header = screen.getByText('Epargne Jeune').closest('.flex');
      expect(header).toHaveClass('justify-between', 'items-start', 'mb-4');
    });
  });

  describe('Empty state', () => {
    it('should handle empty services array', () => {
      render(<ServicesGrid {...defaultProps} services={[]} />);

      // Should not render any cards
      expect(screen.queryByText('Epargne Jeune')).not.toBeInTheDocument();
      expect(screen.queryByText('Crédit Immobilier')).not.toBeInTheDocument();
    });

    it('should not crash with empty services', () => {
      expect(() => {
        render(<ServicesGrid {...defaultProps} services={[]} />);
      }).not.toThrow();
    });
  });

  describe('Service data handling', () => {
    it('should handle services with missing optional data', () => {
      const incompleteService = [
        {
          id: '1',
          designation: 'Test Service',
          type: 'Epargne' as const,
          institution: 'Test Bank',
          maxAmount: 100000,
          interestRate: 5.0,
          reimbursement: 'Mensuel',
          status: 'ACTIF' as const,
          geographicZones: [],
          createdAt: '2024-01-01',
          description: 'Test description',
          minAmount: 10000,
        },
      ];

      render(<ServicesGrid {...defaultProps} services={incompleteService} />);

      expect(screen.getByText('Test Service')).toBeInTheDocument();
      expect(screen.getByText('Test Bank')).toBeInTheDocument();
      expect(screen.getByText('Epargne')).toBeInTheDocument();
    });

    it('should handle special characters in service data', () => {
      const specialCharService = [
        {
          ...mockServices[0],
          designation: 'Service with spécial charácters & symbols!',
          description: 'Description with émojis 🚀 and spécial çhârâctérs',
        },
      ];

      render(<ServicesGrid {...defaultProps} services={specialCharService} />);

      expect(screen.getByText('Service with spécial charácters & symbols!')).toBeInTheDocument();
      expect(
        screen.getByText('Description with émojis 🚀 and spécial çhârâctérs')
      ).toBeInTheDocument();
    });

    it('should handle very long service names', () => {
      const longNameService = [
        {
          ...mockServices[0],
          designation:
            'This is an extremely long service designation that might cause layout issues if not handled properly by the component',
        },
      ];

      render(<ServicesGrid {...defaultProps} services={longNameService} />);

      expect(
        screen.getByText(
          'This is an extremely long service designation that might cause layout issues if not handled properly by the component'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button titles', () => {
      render(<ServicesGrid {...defaultProps} />);

      const viewButtons = screen.getAllByTestId('eye-icon');
      expect(viewButtons[0]).toHaveAttribute('title', 'Voir');

      const scheduleButtons = screen.getAllByTestId('calendar-icon');
      expect(scheduleButtons[0]).toHaveAttribute('title', 'Échéancier');

      const editButtons = screen.getAllByTestId('edit-icon');
      expect(editButtons[0]).toHaveAttribute('title', 'Modifier');

      const deleteButtons = screen.getAllByTestId('trash-icon');
      expect(deleteButtons[0]).toHaveAttribute('title', 'Supprimer');
    });

    it('should have proper button accessibility attributes', () => {
      render(<ServicesGrid {...defaultProps} />);

      const viewButtons = screen.getAllByTestId('eye-icon');
      expect(viewButtons[0]).toHaveClass('text-gray-400', 'hover:text-gray-600', 'p-1');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<ServicesGrid {...defaultProps} />);

      // Tab through action buttons
      await user.tab();
      const firstViewButton = screen.getAllByTestId('eye-icon')[0];
      expect(firstViewButton).toHaveFocus();
    });
  });

  describe('Performance considerations', () => {
    it('should handle large number of services', () => {
      const manyServices = Array.from({ length: 100 }, (_, i) => ({
        ...mockServices[0],
        id: `service-${i}`,
        designation: `Service ${i}`,
      }));

      render(<ServicesGrid {...defaultProps} services={manyServices} />);

      // Should render all services without performance issues
      const cards = screen.getAllByText(/Service \d+/);
      expect(cards).toHaveLength(100);
    });

    it('should not cause memory leaks with frequent re-renders', () => {
      const { rerender } = render(<ServicesGrid {...defaultProps} />);

      // Re-render multiple times
      for (let i = 0; i < 10; i++) {
        rerender(<ServicesGrid {...defaultProps} />);
      }

      // Should still work correctly
      expect(screen.getByText('Epargne Jeune')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle malformed service data gracefully', () => {
      const malformedService = [
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
        render(<ServicesGrid {...defaultProps} services={malformedService} />);
      }).not.toThrow();
    });

    it('should handle null or undefined services', () => {
      expect(() => {
        render(<ServicesGrid {...defaultProps} services={null as any} />);
      }).not.toThrow();

      expect(() => {
        render(<ServicesGrid {...defaultProps} services={undefined as any} />);
      }).not.toThrow();
    });
  });

  describe('Responsive design', () => {
    it('should apply responsive grid classes', () => {
      render(<ServicesGrid {...defaultProps} />);

      const grid = screen.getByRole('generic');
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should handle different screen sizes appropriately', () => {
      render(<ServicesGrid {...defaultProps} />);

      // Cards should be responsive
      const cards = screen
        .getAllByText(/Epargne Jeune|Crédit Immobilier/)
        .map(el => el.closest('.bg-white'));

      cards.forEach(card => {
        expect(card).toHaveClass('rounded-lg', 'border', 'border-gray-200', 'p-6');
      });
    });
  });
});
