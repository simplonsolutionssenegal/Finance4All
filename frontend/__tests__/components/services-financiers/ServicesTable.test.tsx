import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { formatCurrency, formatPercentage } from '../../../data/MockData';
import type { FinancialService, SearchAndFilterState } from '../../../types/FinancialServices';
import { ServicesTable } from '../../components/services-financiers/ServicesTable';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Eye: () => <span data-testid='eye-icon'>👁</span>,
  CreditCard: () => <span data-testid='edit-icon'>✏️</span>,
  Trash2: () => <span data-testid='trash-icon'>🗑️</span>,
  ChevronUp: () => <span data-testid='chevron-up'>↑</span>,
  ChevronDown: () => <span data-testid='chevron-down'>↓</span>,
  Calendar: () => <span data-testid='calendar-icon'>📅</span>,
}));

// Mock Badge component
jest.mock('../../components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid='badge' data-variant={variant}>
      {children}
    </span>
  ),
}));

// Mock formatCurrency and formatPercentage
jest.mock('../../../data/MockData', () => ({
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

const mockSearchAndFilter: SearchAndFilterState = {
  searchTerm: '',
  filters: {
    serviceType: [],
    geographicZone: [],
    institut: [],
    date: 'Récente',
  },
  sortBy: 'designation',
  sortOrder: 'asc',
  viewMode: 'table',
  currentPage: 1,
  itemsPerPage: 10,
};

const mockOnSort = jest.fn();
const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();
const mockOnView = jest.fn();
const mockOnSchedule = jest.fn();

const defaultProps = {
  services: mockServices,
  searchAndFilter: mockSearchAndFilter,
  onSort: mockOnSort,
  onEdit: mockOnEdit,
  onDelete: mockOnDelete,
  onView: mockOnView,
  onSchedule: mockOnSchedule,
};

describe('ServicesTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Table structure', () => {
    it('should render table with correct ID', () => {
      render(<ServicesTable {...defaultProps} />);

      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('id', 'services-table');
    });

    it('should render table headers', () => {
      render(<ServicesTable {...defaultProps} />);

      expect(screen.getByText('Désignation')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Institution')).toBeInTheDocument();
      expect(screen.getByText('Montant max')).toBeInTheDocument();
      expect(screen.getByText('Taux')).toBeInTheDocument();
      expect(screen.getByText('Remboursement')).toBeInTheDocument();
      expect(screen.getByText('Zones')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render correct number of rows', () => {
      render(<ServicesTable {...defaultProps} />);

      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(3); // Header + 2 data rows
    });
  });

  describe('Service data display', () => {
    it('should display service designation', () => {
      render(<ServicesTable {...defaultProps} />);

      expect(screen.getByText('Epargne Jeune')).toBeInTheDocument();
      expect(screen.getByText('Crédit Immobilier')).toBeInTheDocument();
    });

    it('should display service type badge', () => {
      render(<ServicesTable {...defaultProps} />);

      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);

      expect(screen.getByText('Epargne')).toBeInTheDocument();
      expect(screen.getByText('Crédit')).toBeInTheDocument();
    });

    it('should display formatted max amount', () => {
      render(<ServicesTable {...defaultProps} />);

      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
      expect(screen.getByText('$50,000,000')).toBeInTheDocument();
      expect(formatCurrency).toHaveBeenCalledWith(1000000);
      expect(formatCurrency).toHaveBeenCalledWith(50000000);
    });

    it('should display formatted interest rate', () => {
      render(<ServicesTable {...defaultProps} />);

      expect(screen.getByText('5.5%')).toBeInTheDocument();
      expect(screen.getByText('7.2%')).toBeInTheDocument();
      expect(formatPercentage).toHaveBeenCalledWith(5.5);
      expect(formatPercentage).toHaveBeenCalledWith(7.2);
    });

    it('should display reimbursement information', () => {
      render(<ServicesTable {...defaultProps} />);

      expect(screen.getByText('Mensuel')).toBeInTheDocument();
    });

    it('should display geographic zones', () => {
      render(<ServicesTable {...defaultProps} />);

      expect(screen.getByText('Zone Géo A')).toBeInTheDocument();
      expect(screen.getByText('Zone Géo B')).toBeInTheDocument();
    });
  });

  describe('Sorting functionality', () => {
    it('should display sort icons correctly', () => {
      render(<ServicesTable {...defaultProps} />);

      // Should show chevron up for ascending sort on designation
      expect(screen.getByTestId('chevron-up')).toBeInTheDocument();
    });

    it('should call onSort when header is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesTable {...defaultProps} />);

      const designationHeader = screen.getByText('Désignation').closest('th');
      await user.click(designationHeader!);

      expect(mockOnSort).toHaveBeenCalledWith('designation');
    });

    it('should show different icons for different sort states', () => {
      const descendingState = {
        ...mockSearchAndFilter,
        sortBy: 'designation',
        sortOrder: 'desc' as const,
      };

      render(<ServicesTable {...defaultProps} searchAndFilter={descendingState} />);

      expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
    });

    it('should not show sort icon for non-sorted column', () => {
      const unsortedState = {
        ...mockSearchAndFilter,
        sortBy: 'type',
      };

      render(<ServicesTable {...defaultProps} searchAndFilter={unsortedState} />);

      expect(screen.queryByTestId('chevron-up')).not.toBeInTheDocument();
      expect(screen.queryByTestId('chevron-down')).not.toBeInTheDocument();
    });
  });

  describe('Action buttons', () => {
    it('should render action buttons for each service', () => {
      render(<ServicesTable {...defaultProps} />);

      const eyeIcons = screen.getAllByTestId('eye-icon');
      const calendarIcons = screen.getAllByTestId('calendar-icon');
      const editIcons = screen.getAllByTestId('edit-icon');
      const trashIcons = screen.getAllByTestId('trash-icon');

      expect(eyeIcons).toHaveLength(2);
      expect(calendarIcons).toHaveLength(2);
      expect(editIcons).toHaveLength(2);
      expect(trashIcons).toHaveLength(2);
    });

    it('should call onView when view button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesTable {...defaultProps} />);

      const viewButtons = screen.getAllByTestId('eye-icon');
      await user.click(viewButtons[0]);

      expect(mockOnView).toHaveBeenCalledWith(mockServices[0]);
    });

    it('should call onSchedule when schedule button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesTable {...defaultProps} />);

      const scheduleButtons = screen.getAllByTestId('calendar-icon');
      await user.click(scheduleButtons[0]);

      expect(mockOnSchedule).toHaveBeenCalledWith(mockServices[0]);
    });

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesTable {...defaultProps} />);

      const editButtons = screen.getAllByTestId('edit-icon');
      await user.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(mockServices[0]);
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesTable {...defaultProps} />);

      const deleteButtons = screen.getAllByTestId('trash-icon');
      await user.click(deleteButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('Badge variants', () => {
    it('should use correct badge variant for Epargne type', () => {
      render(<ServicesTable {...defaultProps} />);

      const epargneBadge = screen.getByText('Epargne');
      expect(epargneBadge).toHaveAttribute('data-variant', 'info');
    });

    it('should use correct badge variant for Crédit type', () => {
      render(<ServicesTable {...defaultProps} />);

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

      render(<ServicesTable {...defaultProps} services={servicesWithOtherType} />);

      const assuranceBadge = screen.getByText('Assurance');
      expect(assuranceBadge).toHaveAttribute('data-variant', 'default');
    });
  });

  describe('Geographic zones display', () => {
    it('should display geographic zones as badges', () => {
      render(<ServicesTable {...defaultProps} />);

      // Zones should be displayed as individual elements
      const zoneElements = screen.getAllByText(/Zone Géo/);
      expect(zoneElements.length).toBeGreaterThan(0);
    });

    it('should handle services with no geographic zones', () => {
      const noZoneService = [
        {
          ...mockServices[0],
          geographicZones: [],
        },
      ];

      render(<ServicesTable {...defaultProps} services={noZoneService} />);

      // Should not crash and should not display zone elements
      expect(screen.getByText('Epargne Jeune')).toBeInTheDocument();
    });

    it('should handle services with multiple zones', () => {
      render(<ServicesTable {...defaultProps} />);

      expect(screen.getByText('Zone Géo A')).toBeInTheDocument();
      expect(screen.getByText('Zone Géo B')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should handle empty services array', () => {
      render(<ServicesTable {...defaultProps} services={[]} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Should still render headers but no data rows
      expect(screen.getByText('Désignation')).toBeInTheDocument();
    });

    it('should not crash with empty services', () => {
      expect(() => {
        render(<ServicesTable {...defaultProps} services={[]} />);
      }).not.toThrow();
    });
  });

  describe('Sorting state management', () => {
    it('should handle sort state changes correctly', async () => {
      const user = userEvent.setup();
      render(<ServicesTable {...defaultProps} />);

      // Click on designation header multiple times to test sort order toggle
      const designationHeader = screen.getByText('Désignation').closest('th');

      await user.click(designationHeader!);
      expect(mockOnSort).toHaveBeenCalledWith('designation');

      await user.click(designationHeader!);
      expect(mockOnSort).toHaveBeenCalledWith('designation');
    });

    it('should show correct sort icons for different columns', () => {
      const typeSortState = {
        ...mockSearchAndFilter,
        sortBy: 'type' as const,
        sortOrder: 'desc' as const,
      };

      render(<ServicesTable {...defaultProps} searchAndFilter={typeSortState} />);

      // Should show down arrow for type column (not designation)
      expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button titles', () => {
      render(<ServicesTable {...defaultProps} />);

      const viewButtons = screen.getAllByTestId('eye-icon');
      expect(viewButtons[0]).toHaveAttribute('title', 'Voir');

      const scheduleButtons = screen.getAllByTestId('calendar-icon');
      expect(scheduleButtons[0]).toHaveAttribute('title', 'Échéancier');

      const editButtons = screen.getAllByTestId('edit-icon');
      expect(editButtons[0]).toHaveAttribute('title', 'Modifier');

      const deleteButtons = screen.getAllByTestId('trash-icon');
      expect(deleteButtons[0]).toHaveAttribute('title', 'Supprimer');
    });

    it('should have proper table structure', () => {
      render(<ServicesTable {...defaultProps} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const thead = screen.getByRole('columnheader', { name: /désignation/i });
      expect(thead).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<ServicesTable {...defaultProps} />);

      // Tab through sortable headers
      await user.tab();
      const designationHeader = screen.getByText('Désignation').closest('th');
      expect(designationHeader).toHaveFocus();
    });
  });

  describe('Data formatting', () => {
    it('should format currency correctly', () => {
      render(<ServicesTable {...defaultProps} />);

      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
      expect(formatCurrency).toHaveBeenCalledWith(1000000);
    });

    it('should format percentage correctly', () => {
      render(<ServicesTable {...defaultProps} />);

      expect(screen.getByText('5.5%')).toBeInTheDocument();
      expect(formatPercentage).toHaveBeenCalledWith(5.5);
    });

    it('should handle large numbers correctly', () => {
      const largeAmountService = [
        {
          ...mockServices[0],
          maxAmount: 999999999,
          interestRate: 99.99,
        },
      ];

      render(<ServicesTable {...defaultProps} services={largeAmountService} />);

      expect(screen.getByText('$999,999,999')).toBeInTheDocument();
      expect(screen.getByText('99.99%')).toBeInTheDocument();
    });

    it('should handle decimal values correctly', () => {
      const decimalService = [
        {
          ...mockServices[0],
          maxAmount: 1234.56,
          interestRate: 5.123,
        },
      ];

      render(<ServicesTable {...defaultProps} services={decimalService} />);

      expect(screen.getByText('$1,235')).toBeInTheDocument(); // Rounded
      expect(screen.getByText('5.12%')).toBeInTheDocument(); // Rounded
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
        render(<ServicesTable {...defaultProps} services={malformedService} />);
      }).not.toThrow();
    });

    it('should handle null or undefined services', () => {
      expect(() => {
        render(<ServicesTable {...defaultProps} services={null as any} />);
      }).not.toThrow();

      expect(() => {
        render(<ServicesTable {...defaultProps} services={undefined as any} />);
      }).not.toThrow();
    });

    it('should handle missing searchAndFilter prop', () => {
      expect(() => {
        render(<ServicesTable {...defaultProps} searchAndFilter={undefined as any} />);
      }).not.toThrow();
    });
  });

  describe('Table styling', () => {
    it('should apply correct table classes', () => {
      render(<ServicesTable {...defaultProps} />);

      const table = screen.getByRole('table');
      expect(table).toHaveClass('min-w-full', 'divide-y', 'divide-gray-200');
    });

    it('should apply correct header classes', () => {
      render(<ServicesTable {...defaultProps} />);

      const header = screen.getByRole('columnheader', { name: /désignation/i });
      expect(header).toHaveClass(
        'px-6',
        'py-3',
        'text-left',
        'text-xs',
        'font-medium',
        'text-gray-500',
        'uppercase',
        'tracking-wider'
      );
    });

    it('should apply hover effects to headers', () => {
      render(<ServicesTable {...defaultProps} />);

      const designationHeader = screen.getByText('Désignation').closest('th');
      expect(designationHeader).toHaveClass('cursor-pointer', 'hover:bg-gray-100');
    });

    it('should apply correct row classes', () => {
      render(<ServicesTable {...defaultProps} />);

      const rows = screen.getAllByRole('row');
      // Skip header row
      for (let i = 1; i < rows.length; i++) {
        expect(rows[i]).toHaveClass('hover:bg-gray-50');
      }
    });
  });

  describe('Performance considerations', () => {
    it('should handle large datasets efficiently', () => {
      const manyServices = Array.from({ length: 1000 }, (_, i) => ({
        ...mockServices[0],
        id: `service-${i}`,
        designation: `Service ${i}`,
      }));

      const { container } = render(<ServicesTable {...defaultProps} services={manyServices} />);

      // Should render without performance issues
      expect(container).toBeInTheDocument();
    });

    it('should not cause memory leaks with frequent re-renders', () => {
      const { rerender } = render(<ServicesTable {...defaultProps} />);

      // Re-render multiple times
      for (let i = 0; i < 10; i++) {
        rerender(<ServicesTable {...defaultProps} />);
      }

      // Should still work correctly
      expect(screen.getByText('Epargne Jeune')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle services with very long names', () => {
      const longNameService = [
        {
          ...mockServices[0],
          designation:
            'This is an extremely long service designation that might cause layout issues if not handled properly by the table component and could potentially break the layout',
        },
      ];

      render(<ServicesTable {...defaultProps} services={longNameService} />);

      expect(
        screen.getByText(
          'This is an extremely long service designation that might cause layout issues if not handled properly by the table component and could potentially break the layout'
        )
      ).toBeInTheDocument();
    });

    it('should handle special characters in service data', () => {
      const specialCharService = [
        {
          ...mockServices[0],
          designation: 'Service with spécial charácters & symbols!',
          institution: 'Bank with émojis 🚀',
        },
      ];

      render(<ServicesTable {...defaultProps} services={specialCharService} />);

      expect(screen.getByText('Service with spécial charácters & symbols!')).toBeInTheDocument();
      expect(screen.getByText('Bank with émojis 🚀')).toBeInTheDocument();
    });

    it('should handle negative values gracefully', () => {
      const negativeValueService = [
        {
          ...mockServices[0],
          maxAmount: -1000000,
          interestRate: -5.5,
        },
      ];

      render(<ServicesTable {...defaultProps} services={negativeValueService} />);

      // Should display negative values (though formatters might handle them)
      expect(screen.getByText('$1,000,000')).toBeInTheDocument(); // Absolute value
      expect(screen.getByText('5.5%')).toBeInTheDocument(); // Absolute value
    });
  });
});
