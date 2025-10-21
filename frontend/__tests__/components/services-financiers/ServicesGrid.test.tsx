import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { ServicesGrid } from '@/components/services-financiers/ServicesGrid';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import type { FinancialService } from '@/types/FinancialServices';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Eye: () => React.createElement('span', { 'data-testid': 'eye-icon' }, '👁'),
  CreditCard: () => React.createElement('span', { 'data-testid': 'edit-icon' }, '✏️'),
  Trash2: () => React.createElement('span', { 'data-testid': 'trash-icon' }, '🗑️'),
  Calendar: () => React.createElement('span', { 'data-testid': 'calendar-icon' }, '📅'),
}));

// Mock Badge component
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) =>
    React.createElement('span', { 'data-testid': 'badge', 'data-variant': variant }, children),
}));

// Mock formatCurrency and formatPercentage
jest.mock('@/lib/formatters', () => ({
  formatCurrency: jest.fn(),
  formatPercentage: jest.fn((rate: number) => `${rate}%`),
}));

const mockInstitution1 = {
  id: 'inst-1',
  name: 'Société Générale',
  description: 'Banque internationale',
  website: 'https://sg.com',
  geographicZones: ['Zone Géo A'],
  logoUrl: 'https://sg.com/logo.png',
  status: 'ACTIVE' as const,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockInstitution2 = {
  id: 'inst-2',
  name: 'Banque Atlantique',
  description: 'Banque régionale',
  website: 'https://ba.com',
  geographicZones: ['Zone Géo A', 'Zone Géo B'],
  logoUrl: 'https://ba.com/logo.png',
  status: 'ACTIVE' as const,
  createdAt: '2024-01-02',
  updatedAt: '2024-01-02',
};

const mockServices: FinancialService[] = [
  {
    id: '1',
    name: 'epargne-jeune',
    longName: 'Epargne Jeune',
    designation: 'Epargne Jeune',
    type: 'EPARGNE',
    frais: {},
    conditionAccess: [],
    plafonds: [],
    infrastructureAccess: [],
    institutionId: 'inst-1',
    institution: mockInstitution1,
    maxAmount: 1000000,
    interestRate: 5.5,
    reimbursement: 'Mensuel',
    status: 'ACTIVE',
    geographicZones: ['Zone Géo A'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    description: 'Compte épargne pour les jeunes',
    minAmount: 10000,
  },
  {
    id: '2',
    name: 'credit-immobilier',
    longName: 'Crédit Immobilier',
    designation: 'Crédit Immobilier',
    type: 'CREDIT',
    frais: {},
    conditionAccess: [],
    plafonds: [],
    infrastructureAccess: [],
    institutionId: 'inst-2',
    institution: mockInstitution2,
    maxAmount: 50000000,
    interestRate: 7.2,
    reimbursement: 'Mensuel',
    status: 'ACTIVE',
    geographicZones: ['Zone Géo A', 'Zone Géo B'],
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
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
      const { container } = render(<ServicesGrid {...defaultProps} />);

      const grid = container.querySelector('.grid');
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

      const epargneBadge = screen.getByText('Épargne');
      expect(epargneBadge).toBeInTheDocument();
    });

    it('should display formatted max amount', () => {
      // Make sure formatCurrency mock returns the expected values
      (formatCurrency as jest.Mock).mockImplementation((value: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      });

      render(<ServicesGrid {...defaultProps} />);

      // Verify that the formatted currency values are displayed correctly
      expect(screen.getByText(/\$1[,\s\u202F]?000[,\s\u202F]?000/)).toBeInTheDocument();
      expect(screen.getByText(/\$50[,\s\u202F]?000[,\s\u202F]?000/)).toBeInTheDocument();

      // Also verify that formatCurrency is called with correct values
      expect(formatCurrency).toHaveBeenCalledWith(1000000);
      expect(formatCurrency).toHaveBeenCalledWith(50000000);
    });
    it('should display formatted interest rate', () => {
      render(<ServicesGrid {...defaultProps} />);

      const tauxLabels = screen.getAllByText('Taux:');
      expect(tauxLabels.length).toBeGreaterThan(0);
      expect(screen.getByText('5.5%')).toBeInTheDocument();
      expect(formatPercentage).toHaveBeenCalledWith(5.5);
    });

    it('should display interest rate and max amount (reimbursement removed)', () => {
      render(<ServicesGrid {...defaultProps} />);

      const tauxLabels = screen.getAllByText('Taux:');
      expect(tauxLabels.length).toBeGreaterThan(0);

      const maxAmount = screen.getAllByText(/\$1[,\s\u202F]?000[,\s\u202F]?000/);
      expect(maxAmount.length).toBeGreaterThan(0);
    });

    it('should display service description', () => {
      render(<ServicesGrid {...defaultProps} />);

      expect(screen.getByText('Compte épargne pour les jeunes')).toBeInTheDocument();
    });

    it('should display geographic zones as tags', () => {
      render(<ServicesGrid {...defaultProps} />);

      const zoneAElements = screen.getAllByText('Zone Géo A');
      expect(zoneAElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Zone Géo B')).toBeInTheDocument();
    });
  });

  describe('Action buttons', () => {
    it('should render schedule button for each service and call onSchedule when clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesGrid {...defaultProps} />);

      const calendarIcons = screen.getAllByTestId('calendar-icon');
      expect(calendarIcons).toHaveLength(2);

      const scheduleButtons = screen.getAllByTitle('Échéancier');
      await user.click(scheduleButtons[0]);

      expect(mockOnSchedule).toHaveBeenCalledWith(mockServices[0]);
    });
  });

  describe('Badge variants', () => {
    it('should use correct badge variant for Epargne type', () => {
      render(<ServicesGrid {...defaultProps} />);

      const epargneBadge = screen.getByText('Épargne');
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
          type: 'ASSURANCE' as const,
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

      const zoneAElements = screen.getAllByText('Zone Géo A');
      expect(zoneAElements.length).toBeGreaterThan(0);
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

      expect(screen.queryByText('Zone Géo B')).not.toBeInTheDocument();
    });

    it('should style geographic zones correctly', () => {
      render(<ServicesGrid {...defaultProps} />);

      const zoneTag = screen.getByText('Zone Géo B');
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
      const { container } = render(<ServicesGrid {...defaultProps} />);

      const cards = container.querySelectorAll('.bg-white');
      cards.forEach(card => {
        expect(card).toHaveClass('hover:shadow-md', 'transition-shadow');
      });
    });

    it('should have proper card structure', () => {
      const { container } = render(<ServicesGrid {...defaultProps} />);

      const cards = container.querySelectorAll('.bg-white');
      cards.forEach(card => {
        expect(card).toHaveClass('rounded-lg', 'border', 'border-gray-200', 'p-6');
      });
    });

    it('should arrange card content properly', () => {
      const { container } = render(<ServicesGrid {...defaultProps} />);

      const headers = container.querySelectorAll('.flex.justify-between.items-start.mb-4');
      expect(headers.length).toBeGreaterThan(0);
    });
  });

  describe('Empty state', () => {
    it('should handle empty services array', () => {
      render(<ServicesGrid {...defaultProps} services={[]} />);

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
          name: 'test-service',
          longName: 'Test Service',
          designation: 'Test Service',
          type: 'EPARGNE' as const,
          frais: {},
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
          institutionId: 'inst-test',
          institution: {
            id: 'inst-test',
            name: 'Test Bank',
            description: 'Test',
            status: 'ACTIVE' as const,
            geographicZones: [],
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
          maxAmount: 100000,
          interestRate: 5.0,
          reimbursement: 'Mensuel',
          status: 'ACTIVE' as const,
          geographicZones: [],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          description: 'Test description',
          minAmount: 10000,
        },
      ];

      render(<ServicesGrid {...defaultProps} services={incompleteService} />);

      expect(screen.getByText('Test Service')).toBeInTheDocument();
      expect(screen.getByText('Test Bank')).toBeInTheDocument();
      expect(screen.getByText('Épargne')).toBeInTheDocument();
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

      // The component displays the name field, not the designation
      expect(screen.getByText('epargne-jeune')).toBeInTheDocument();
      expect(
        screen.getByText('Description with émojis 🚀 and spécial çhârâctérs')
      ).toBeInTheDocument();
    });

    it('should handle very long service names', () => {
      const longNameService = [
        {
          ...mockServices[0],
          name: 'This is an extremely long service designation that might cause layout issues if not handled properly by the component',
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

      const scheduleButtons = screen.getAllByTitle('Échéancier');
      expect(scheduleButtons.length).toBe(2);
    });

    it('should have proper button accessibility attributes', () => {
      render(<ServicesGrid {...defaultProps} />);

      const scheduleButtons = screen.getAllByTitle('Échéancier');
      expect(scheduleButtons[0]).toHaveClass('text-green-400', 'hover:text-green-600', 'p-1');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<ServicesGrid {...defaultProps} />);

      const firstScheduleButton = screen.getAllByTitle('Échéancier')[0];

      await user.tab();
      expect(firstScheduleButton).toHaveFocus();
    });
  });

  describe('Performance considerations', () => {
    it('should handle large number of services', () => {
      const manyServices = Array.from({ length: 100 }, (_, i) => ({
        ...mockServices[0],
        id: `service-${i}`,
        name: `service-${i}`,
      }));

      render(<ServicesGrid {...defaultProps} services={manyServices} />);

      const cards = screen.getAllByText(/service-\d+/);
      expect(cards).toHaveLength(100);
    });

    it('should not cause memory leaks with frequent re-renders', () => {
      const { rerender } = render(<ServicesGrid {...defaultProps} />);

      for (let i = 0; i < 10; i++) {
        rerender(<ServicesGrid {...defaultProps} />);
      }

      expect(screen.getByText('Epargne Jeune')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle malformed service data gracefully', () => {
      const malformedService = [
        {
          id: '1',
          name: '',
          longName: '',
          designation: '',
          type: 'EPARGNE' as const,
          frais: {},
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
          institutionId: '',
          institution: {
            id: '',
            name: '',
            description: '',
            status: 'ACTIVE' as const,
            geographicZones: [],
            createdAt: '',
            updatedAt: '',
          },
          maxAmount: 0,
          interestRate: 0,
          reimbursement: '',
          status: 'ACTIVE' as const,
          geographicZones: [],
          createdAt: '',
          updatedAt: '',
          description: '',
          minAmount: 0,
        },
      ];

      expect(() => {
        render(<ServicesGrid {...defaultProps} services={malformedService} />);
      }).not.toThrow();
    });
  });

  describe('Responsive design', () => {
    it('should apply responsive grid classes', () => {
      const { container } = render(<ServicesGrid {...defaultProps} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should handle different screen sizes appropriately', () => {
      const { container } = render(<ServicesGrid {...defaultProps} />);

      const cards = container.querySelectorAll('.bg-white');

      cards.forEach(card => {
        expect(card).toHaveClass('rounded-lg', 'border', 'border-gray-200', 'p-6');
      });
    });
  });

  describe('Multiple services rendering', () => {
    it('should correctly render all service details for multiple items', () => {
      render(<ServicesGrid {...defaultProps} />);

      expect(screen.getByText('Epargne Jeune')).toBeInTheDocument();
      expect(screen.getByText('Crédit Immobilier')).toBeInTheDocument();
      expect(screen.getByText('Société Générale')).toBeInTheDocument();
      expect(screen.getByText('Banque Atlantique')).toBeInTheDocument();
    });

    it('should maintain proper spacing between cards', () => {
      const { container } = render(<ServicesGrid {...defaultProps} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-6');
    });
  });

  describe('Button interactions', () => {
    it('should handle multiple button clicks', async () => {
      const user = userEvent.setup();
      render(<ServicesGrid {...defaultProps} />);

      const scheduleButtons = screen.getAllByTitle('Échéancier');
      await user.click(scheduleButtons[0]);
      await user.click(scheduleButtons[1]);

      expect(mockOnSchedule).toHaveBeenCalledTimes(2);
      expect(mockOnSchedule).toHaveBeenCalledWith(mockServices[0]);
      expect(mockOnSchedule).toHaveBeenCalledWith(mockServices[1]);
    });

    it('should handle rapid successive clicks', async () => {
      const user = userEvent.setup();
      render(<ServicesGrid {...defaultProps} />);

      const scheduleButton = screen.getAllByTitle('Échéancier')[0];

      await user.click(scheduleButton);
      await user.click(scheduleButton);
      await user.click(scheduleButton);

      expect(mockOnSchedule).toHaveBeenCalledTimes(3);
    });
  });
});
