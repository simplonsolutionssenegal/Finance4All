import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ServicesTable } from '@/components/services-financiers/ServicesTable';
import { formatCurrency, formatPercentage } from '@/data/MockData';
import type { FinancialService, SearchAndFilterState } from '@/types/FinancialServices';

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
    it('should render table container with correct ID', () => {
      const { container } = render(<ServicesTable {...defaultProps} />);

      const tableContainer = container.querySelector('#services-table');
      expect(tableContainer).toBeInTheDocument();
    });

    it('should render table headers', () => {
      render(<ServicesTable {...defaultProps} />);

      expect(screen.getByText('Désignation')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Montant Max.')).toBeInTheDocument();
      expect(screen.getByText('Taux')).toBeInTheDocument();
      expect(screen.getByText('Remboursement')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render correct number of rows', () => {
      render(<ServicesTable {...defaultProps} />);

      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(3); // Header + 2 data rows
    });
  });

  describe('Service data display', () => {
    it('should display service designation and institution', () => {
      render(<ServicesTable {...defaultProps} />);

      expect(screen.getByText('Epargne Jeune')).toBeInTheDocument();
      expect(screen.getByText('Crédit Immobilier')).toBeInTheDocument();
      expect(screen.getByText('Société Générale')).toBeInTheDocument();
      expect(screen.getByText('Banque Atlantique')).toBeInTheDocument();
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

      // Test for formatted currency amounts (verify actual displayed values)
      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
      expect(screen.getByText('$50,000,000')).toBeInTheDocument();

      // Also verify that formatCurrency is called with correct values
      expect(formatCurrency).toHaveBeenCalledWith(1000000);
      expect(formatCurrency).toHaveBeenCalledWith(50000000);
    });

    it('should display formatted min amount', () => {
      render(<ServicesTable {...defaultProps} />);

      // Use a function matcher to find text that might be split across elements
      expect(
        screen.getByText((content, element) => {
          return element?.textContent?.includes('Min: $10,000') || false;
        })
      ).toBeInTheDocument();

      expect(
        screen.getByText((content, element) => {
          return element?.textContent?.includes('Min: $5,000,000') || false;
        })
      ).toBeInTheDocument();

      // Also verify the function is called with correct values
      expect(formatCurrency).toHaveBeenCalledWith(10000);
      expect(formatCurrency).toHaveBeenCalledWith(5000000);
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

      const mensuelElements = screen.getAllByText('Mensuel');
      expect(mensuelElements.length).toBeGreaterThan(0);
    });
  });

  describe('Sorting functionality', () => {
    it('should display sort icons correctly', () => {
      render(<ServicesTable {...defaultProps} />);

      // Should show chevron up for ascending sort on designation
      expect(screen.getByTestId('chevron-up')).toBeInTheDocument();
    });

    it('should call onSort when designation header is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesTable {...defaultProps} />);

      const designationHeader = screen.getByText('Désignation').closest('th');
      expect(designationHeader).toBeInTheDocument();

      if (designationHeader) {
        await user.click(designationHeader);
      }

      expect(mockOnSort).toHaveBeenCalledWith('designation');
    });

    it('should call onSort when type header is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesTable {...defaultProps} />);

      const typeHeader = screen.getByText('Type').closest('th');
      expect(typeHeader).toBeInTheDocument();

      if (typeHeader) {
        await user.click(typeHeader);
      }

      expect(mockOnSort).toHaveBeenCalledWith('type');
    });

    it('should call onSort when maxAmount header is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesTable {...defaultProps} />);

      const maxAmountHeader = screen.getByText('Montant Max.').closest('th');
      expect(maxAmountHeader).toBeInTheDocument();

      if (maxAmountHeader) {
        await user.click(maxAmountHeader);
      }

      expect(mockOnSort).toHaveBeenCalledWith('maxAmount');
    });

    it('should call onSort when interestRate header is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesTable {...defaultProps} />);

      const interestRateHeader = screen.getByText('Taux').closest('th');
      expect(interestRateHeader).toBeInTheDocument();

      if (interestRateHeader) {
        await user.click(interestRateHeader);
      }

      expect(mockOnSort).toHaveBeenCalledWith('interestRate');
    });

    it('should show different icons for different sort states', () => {
      const descendingState = {
        ...mockSearchAndFilter,
        sortBy: 'designation' as const,
        sortOrder: 'desc' as const,
      };

      render(<ServicesTable {...defaultProps} searchAndFilter={descendingState} />);

      expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
    });

    it('should not show sort icon for non-sorted column', () => {
      const typeSortState = {
        ...mockSearchAndFilter,
        sortBy: 'type' as const,
      };

      render(<ServicesTable {...defaultProps} searchAndFilter={typeSortState} />);

      // Only one chevron should be visible (for the sorted column)
      const chevrons = screen.queryAllByTestId('chevron-up');
      expect(chevrons).toHaveLength(1);
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

      const viewButtons = screen.getAllByTitle('Voir');
      await user.click(viewButtons[0]);

      expect(mockOnView).toHaveBeenCalledWith(mockServices[0]);
    });

    it('should call onSchedule when schedule button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesTable {...defaultProps} />);

      const scheduleButtons = screen.getAllByTitle('Échéancier');
      await user.click(scheduleButtons[0]);

      expect(mockOnSchedule).toHaveBeenCalledWith(mockServices[0]);
    });

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesTable {...defaultProps} />);

      const editButtons = screen.getAllByTitle('Modifier');
      await user.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(mockServices[0]);
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesTable {...defaultProps} />);

      const deleteButtons = screen.getAllByTitle('Supprimer');
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
          type: 'Assurance' as any,
        },
      ];

      render(<ServicesTable {...defaultProps} services={servicesWithOtherType} />);

      const assuranceBadge = screen.getByText('Assurance');
      expect(assuranceBadge).toHaveAttribute('data-variant', 'default');
    });
  });

  describe('Empty state', () => {
    it('should handle empty services array', () => {
      render(<ServicesTable {...defaultProps} services={[]} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Should still render headers
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

      const designationHeader = screen.getByText('Désignation').closest('th');
      expect(designationHeader).toBeInTheDocument();

      if (designationHeader) {
        await user.click(designationHeader);
      }
      expect(mockOnSort).toHaveBeenCalledWith('designation');

      if (designationHeader) {
        await user.click(designationHeader);
      }
      expect(mockOnSort).toHaveBeenCalledTimes(2);
    });

    it('should show correct sort icons for different columns', () => {
      const typeSortState = {
        ...mockSearchAndFilter,
        sortBy: 'type' as const,
        sortOrder: 'desc' as const,
      };

      render(<ServicesTable {...defaultProps} searchAndFilter={typeSortState} />);

      expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button titles', () => {
      render(<ServicesTable {...defaultProps} />);

      const viewButtons = screen.getAllByTitle('Voir');
      expect(viewButtons.length).toBe(2);

      const scheduleButtons = screen.getAllByTitle('Échéancier');
      expect(scheduleButtons.length).toBe(2);

      const editButtons = screen.getAllByTitle('Modifier');
      expect(editButtons.length).toBe(2);

      const deleteButtons = screen.getAllByTitle('Supprimer');
      expect(deleteButtons.length).toBe(2);
    });

    it('should have proper table structure', () => {
      render(<ServicesTable {...defaultProps} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders.length).toBeGreaterThan(0);
    });

    it('should have sortable headers with hover effects', () => {
      render(<ServicesTable {...defaultProps} />);

      const designationHeader = screen.getByText('Désignation').closest('th');
      expect(designationHeader).toHaveClass('cursor-pointer', 'hover:bg-gray-100');
    });
  });

  describe('Data formatting', () => {
    it('should format currency correctly', () => {
      render(<ServicesTable {...defaultProps} />);

      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
      expect(screen.getByText('$50,000,000')).toBeInTheDocument();

      // Use function matchers for text that's split across elements
      expect(
        screen.getByText((content, element) => {
          return element?.textContent?.includes('$10,000') || false;
        })
      ).toBeInTheDocument();

      expect(
        screen.getByText((content, element) => {
          return element?.textContent?.includes('$5,000,000') || false;
        })
      ).toBeInTheDocument();

      // Also verify that formatCurrency is called with correct values
      expect(formatCurrency).toHaveBeenCalledWith(1000000);
      expect(formatCurrency).toHaveBeenCalledWith(50000000);
      expect(formatCurrency).toHaveBeenCalledWith(10000);
      expect(formatCurrency).toHaveBeenCalledWith(5000000);
    });

    it('should format percentage correctly', () => {
      render(<ServicesTable {...defaultProps} />);

      // Verify that the formatted percentage values are displayed correctly
      expect(screen.getByText('5.5%')).toBeInTheDocument();
      expect(screen.getByText('7.2%')).toBeInTheDocument();

      // Also verify that formatPercentage is called with correct values
      expect(formatPercentage).toHaveBeenCalledWith(5.5);
      expect(formatPercentage).toHaveBeenCalledWith(7.2);
    });

    it('should handle large numbers correctly', () => {
      const largeAmountService = [
        {
          ...mockServices[0],
          maxAmount: 999999999,
          minAmount: 100000,
          interestRate: 99.99,
        },
      ];

      render(<ServicesTable {...defaultProps} services={largeAmountService} />);

      expect(formatCurrency).toHaveBeenCalledWith(999999999);
      expect(formatPercentage).toHaveBeenCalledWith(99.99);
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
          maxAmount: 0,
          interestRate: 0,
          reimbursement: '',
          status: 'ACTIF' as const,
          geographicZones: [],
          createdAt: '',
          description: '',
          minAmount: 0,
        },
      ];

      expect(() => {
        render(<ServicesTable {...defaultProps} services={malformedService} />);
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

      const designationHeader = screen.getByText('Désignation').closest('th');
      expect(designationHeader).toHaveClass(
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

    it('should apply hover effects to sortable headers', () => {
      render(<ServicesTable {...defaultProps} />);

      const typeHeader = screen.getByText('Type').closest('th');
      expect(typeHeader).toHaveClass('cursor-pointer', 'hover:bg-gray-100');
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
      const manyServices = Array.from({ length: 100 }, (_, i) => ({
        ...mockServices[0],
        id: `service-${i}`,
        designation: `Service ${i}`,
      }));

      const { container } = render(<ServicesTable {...defaultProps} services={manyServices} />);

      expect(container).toBeInTheDocument();
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(101); // Header + 100 data rows
    });

    it('should not cause memory leaks with frequent re-renders', () => {
      const { rerender } = render(<ServicesTable {...defaultProps} />);

      for (let i = 0; i < 10; i++) {
        rerender(<ServicesTable {...defaultProps} />);
      }

      expect(screen.getByText('Epargne Jeune')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle services with very long names', () => {
      const longNameService = [
        {
          ...mockServices[0],
          designation:
            'This is an extremely long service designation that might cause layout issues if not handled properly',
        },
      ];

      render(<ServicesTable {...defaultProps} services={longNameService} />);

      expect(
        screen.getByText(
          'This is an extremely long service designation that might cause layout issues if not handled properly'
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

    it('should handle multiple button clicks', async () => {
      const user = userEvent.setup();
      render(<ServicesTable {...defaultProps} />);

      const viewButtons = screen.getAllByTitle('Voir');
      await user.click(viewButtons[0]);
      await user.click(viewButtons[1]);

      expect(mockOnView).toHaveBeenCalledTimes(2);
      expect(mockOnView).toHaveBeenCalledWith(mockServices[0]);
      expect(mockOnView).toHaveBeenCalledWith(mockServices[1]);
    });
  });

  describe('Container styling', () => {
    it('should apply correct container classes', () => {
      const { container } = render(<ServicesTable {...defaultProps} />);

      const tableContainer = container.querySelector('#services-table');
      expect(tableContainer).toHaveClass(
        'bg-white',
        'rounded-lg',
        'border',
        'border-gray-200',
        'overflow-hidden'
      );
    });

    it('should have overflow-x-auto for responsive scrolling', () => {
      const { container } = render(<ServicesTable {...defaultProps} />);

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe('Non-sortable columns', () => {
    it('should not trigger sort on Remboursement column', async () => {
      render(<ServicesTable {...defaultProps} />);

      const remboursementHeader = screen.getByText('Remboursement').closest('th');

      // Should not have cursor-pointer class
      expect(remboursementHeader).not.toHaveClass('cursor-pointer');
    });

    it('should not trigger sort on Actions column', async () => {
      render(<ServicesTable {...defaultProps} />);

      const actionsHeader = screen.getByText('Actions').closest('th');

      // Should not have cursor-pointer class
      expect(actionsHeader).not.toHaveClass('cursor-pointer');
    });
  });
});
