import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ServiceList from '@/components/admin/institutions/ServiceList';
import { TypeService, TypeCalculation, type Service } from '@/types/Service';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  EllipsisVertical: () => <div data-testid='ellipsis-icon' />,
  Eye: () => <div data-testid='eye-icon' />,
  Pencil: () => <div data-testid='pencil-icon' />,
  Trash2: () => <div data-testid='trash-icon' />,
}));

// Mock UI components
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => (
    <span className={className} data-testid='badge'>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, size }: any) => (
    <button onClick={onClick} className={className} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children, align, sideOffset, className }: any) => (
    <div data-align={align} data-side-offset={sideOffset} className={className}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid='dropdown-item'>
      {children}
    </button>
  ),
  DropdownMenuSeparator: ({ className }: any) => <hr className={className} />,
}));

jest.mock('@/components/ui/table', () => ({
  Table: ({ children, ...props }: any) => <table {...props}>{children}</table>,
  TableHeader: ({ children, ...props }: any) => <thead {...props}>{children}</thead>,
  TableBody: ({ children, ...props }: any) => <tbody {...props}>{children}</tbody>,
  TableRow: ({ children, className, ...props }: any) => (
    <tr className={className} {...props}>
      {children}
    </tr>
  ),
  TableHead: ({ children, className, ...props }: any) => (
    <th className={className} {...props}>
      {children}
    </th>
  ),
  TableCell: ({ children, className, ...props }: any) => (
    <td className={className} {...props}>
      {children}
    </td>
  ),
}));

describe('ServiceList', () => {
  const mockService: Service = {
    id: 'service-1',
    name: 'Transfert mobile',
    longName: "Service de transfert d'argent mobile",
    type: TypeService.TRANSFERT_ARGENT,
    typeFrais: TypeCalculation.FIX,
    frais: {
      montantFixe: 500,
      pourcentage: 2.5,
      minimum: 100,
      maximum: 50000,
    },
    conditionAccess: ['Avoir un compte actif'],
    plafonds: ['500 000 FCFA/jour'],
    infrastructureAccess: ['Mobile', 'Agence'],
    institutionId: 'inst-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockServiceWithoutOptionalFields: Service = {
    id: 'service-2',
    name: 'Service Simple',
    longName: '',
    type: TypeService.DEPOT_SIMPLE,
    typeFrais: TypeCalculation.FREE,
    frais: {},
    conditionAccess: [],
    plafonds: [],
    infrastructureAccess: [],
    institutionId: 'inst-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockOnView = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Empty State', () => {
    it('displays empty message when no services provided', () => {
      render(<ServiceList services={[]} />);
      expect(screen.getByText('Aucun service pour le moment.')).toBeInTheDocument();
    });

    it('displays empty message when services is undefined', () => {
      render(<ServiceList services={undefined as any} />);
      expect(screen.getByText('Aucun service pour le moment.')).toBeInTheDocument();
    });

    it('does not render table when no services', () => {
      const { container } = render(<ServiceList services={[]} />);
      expect(container.querySelector('table')).not.toBeInTheDocument();
    });
  });

  describe('Table Rendering', () => {
    it('renders table with correct headers', () => {
      render(<ServiceList services={[mockService]} />);

      expect(screen.getByText('Service')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Montants')).toBeInTheDocument();
      expect(screen.getByText('Frais')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders service name and long name', () => {
      render(<ServiceList services={[mockService]} />);

      expect(screen.getByText('Transfert mobile')).toBeInTheDocument();
      expect(screen.getByText("Service de transfert d'argent mobile")).toBeInTheDocument();
    });

    it('renders service without long name', () => {
      render(<ServiceList services={[mockServiceWithoutOptionalFields]} />);

      expect(screen.getByText('Service Simple')).toBeInTheDocument();
      // The longName span should not be rendered when longName is empty
      const serviceCell = screen.getByText('Service Simple').closest('td');
      const spans = serviceCell?.querySelectorAll('span');
      expect(spans?.length).toBe(1); // Only the name span, no longName span
    });

    it('renders service type in badge', () => {
      render(<ServiceList services={[mockService]} />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent(TypeService.TRANSFERT_ARGENT);
    });

    it('renders multiple services', () => {
      const services = [mockService, mockServiceWithoutOptionalFields];
      render(<ServiceList services={services} />);

      expect(screen.getByText('Transfert mobile')).toBeInTheDocument();
      expect(screen.getByText('Service Simple')).toBeInTheDocument();
    });
  });

  describe('Amount Range Formatting', () => {
    it('formats amount range with both min and max', () => {
      render(<ServiceList services={[mockService]} />);
      expect(screen.getByText(/100 - 50 000 FCFA/)).toBeInTheDocument();
    });

    it('formats amount with only minimum', () => {
      const service = {
        ...mockService,
        frais: { minimum: 1000 },
      };
      render(<ServiceList services={[service]} />);
      expect(screen.getByText(/≥ 1 000 FCFA/)).toBeInTheDocument();
    });

    it('formats amount with only maximum', () => {
      const service = {
        ...mockService,
        frais: { maximum: 10000 },
      };
      render(<ServiceList services={[service]} />);
      expect(screen.getByText(/≤ 10 000 FCFA/)).toBeInTheDocument();
    });

    it('displays dash when no amount limits', () => {
      render(<ServiceList services={[mockServiceWithoutOptionalFields]} />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  describe('Fees Formatting', () => {
    it('formats fees with montantFixe and pourcentage', () => {
      render(<ServiceList services={[mockService]} />);
      expect(screen.getByText('500 FCFA + 2.5%')).toBeInTheDocument();
    });

    it('formats fees with only montantFixe', () => {
      const service = {
        ...mockService,
        frais: { montantFixe: 1000 },
      };
      render(<ServiceList services={[service]} />);
      expect(screen.getByText('1 000 FCFA')).toBeInTheDocument();
    });

    it('formats fees with only pourcentage', () => {
      const service = {
        ...mockService,
        frais: { pourcentage: 3 },
      };
      render(<ServiceList services={[service]} />);
      expect(screen.getByText('3%')).toBeInTheDocument();
    });

    it('displays "Gratuit" when no fees', () => {
      render(<ServiceList services={[mockServiceWithoutOptionalFields]} />);
      expect(screen.getByText('Gratuit')).toBeInTheDocument();
    });

    it('formats large numbers with thousand separators', () => {
      const service = {
        ...mockService,
        frais: { montantFixe: 1000000 },
      };
      render(<ServiceList services={[service]} />);
      expect(screen.getByText(/1 000 000 FCFA/)).toBeInTheDocument();
    });
  });

  describe('Dropdown Actions', () => {
    it('renders dropdown trigger button', () => {
      render(
        <ServiceList
          services={[mockService]}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('ellipsis-icon')).toBeInTheDocument();
    });

    it('renders "Voir les détails" menu item when onView is provided', () => {
      render(<ServiceList services={[mockService]} onView={mockOnView} />);

      expect(screen.getByText('Voir les détails')).toBeInTheDocument();
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    });

    it('does not render "Voir les détails" when onView is not provided', () => {
      render(<ServiceList services={[mockService]} />);

      expect(screen.queryByText('Voir les détails')).not.toBeInTheDocument();
    });

    it('renders "Modifier" menu item when onEdit is provided', () => {
      render(<ServiceList services={[mockService]} onEdit={mockOnEdit} />);

      expect(screen.getByText('Modifier')).toBeInTheDocument();
      expect(screen.getByTestId('pencil-icon')).toBeInTheDocument();
    });

    it('does not render "Modifier" when onEdit is not provided', () => {
      render(<ServiceList services={[mockService]} />);

      expect(screen.queryByText('Modifier')).not.toBeInTheDocument();
    });

    it('renders "Supprimer" menu item when onDelete is provided', () => {
      render(<ServiceList services={[mockService]} onDelete={mockOnDelete} />);

      expect(screen.getByText('Supprimer')).toBeInTheDocument();
      expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
    });

    it('does not render "Supprimer" when onDelete is not provided', () => {
      render(<ServiceList services={[mockService]} />);

      expect(screen.queryByText('Supprimer')).not.toBeInTheDocument();
    });

    it('calls onView with service when clicked', async () => {
      const user = userEvent.setup();
      render(<ServiceList services={[mockService]} onView={mockOnView} />);

      const viewButton = screen.getByText('Voir les détails');
      await user.click(viewButton);

      expect(mockOnView).toHaveBeenCalledTimes(1);
      expect(mockOnView).toHaveBeenCalledWith(mockService);
    });

    it('calls onEdit with service when clicked', async () => {
      const user = userEvent.setup();
      render(<ServiceList services={[mockService]} onEdit={mockOnEdit} />);

      const editButton = screen.getByText('Modifier');
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledWith(mockService);
    });

    it('calls onDelete with service when clicked', async () => {
      const user = userEvent.setup();
      render(<ServiceList services={[mockService]} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByText('Supprimer');
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith(mockService);
    });

    it('renders separator when multiple actions are present', () => {
      const { container } = render(
        <ServiceList
          services={[mockService]}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const separator = container.querySelector('hr');
      expect(separator).toBeInTheDocument();
    });

    it('does not render separator when only delete action is present', () => {
      const { container } = render(
        <ServiceList services={[mockService]} onDelete={mockOnDelete} />
      );

      const separator = container.querySelector('hr');
      expect(separator).not.toBeInTheDocument();
    });
  });

  describe('Multiple Services Rendering', () => {
    it('renders correct number of rows for multiple services', () => {
      const services = [
        mockService,
        { ...mockService, id: 'service-2', name: 'Service 2' },
        { ...mockService, id: 'service-3', name: 'Service 3' },
      ];
      render(<ServiceList services={services} />);

      const rows = screen.getAllByRole('row');
      // +1 for header row
      expect(rows).toHaveLength(services.length + 1);
    });

    it('handles actions for different services independently', async () => {
      const user = userEvent.setup();
      const service1 = mockService;
      const service2 = { ...mockService, id: 'service-2', name: 'Service 2' };
      const services = [service1, service2];

      render(<ServiceList services={services} onView={mockOnView} onEdit={mockOnEdit} />);

      const viewButtons = screen.getAllByText('Voir les détails');
      await user.click(viewButtons[0]);
      expect(mockOnView).toHaveBeenCalledWith(service1);

      await user.click(viewButtons[1]);
      expect(mockOnView).toHaveBeenCalledWith(service2);
      expect(mockOnView).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('handles service with null frais gracefully', () => {
      const service = {
        ...mockService,
        frais: null as any,
      };
      render(<ServiceList services={[service]} />);

      expect(screen.getByText('Gratuit')).toBeInTheDocument();
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('handles invalid numbers in formatNumber', () => {
      const service = {
        ...mockService,
        frais: { montantFixe: NaN },
      };
      render(<ServiceList services={[service]} />);

      // When formatNumber fails, it catches the error and returns String(n)
      // So NaN will be displayed as "Gratuit" since it's falsy
      expect(screen.getByText('Gratuit')).toBeInTheDocument();
    });

    it('renders all action buttons when all callbacks provided', () => {
      render(
        <ServiceList
          services={[mockService]}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Voir les détails')).toBeInTheDocument();
      expect(screen.getByText('Modifier')).toBeInTheDocument();
      expect(screen.getByText('Supprimer')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders table with proper structure', () => {
      render(<ServiceList services={[mockService]} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(5);
    });

    it('renders action buttons with proper structure', () => {
      render(
        <ServiceList
          services={[mockService]}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
