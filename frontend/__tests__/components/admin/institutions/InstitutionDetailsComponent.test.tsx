import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConfirmUpdateStatusModal from '@/components/admin/institutions/ConfirmUpdateStatusModal';
import ServiceDetailsModal from '@/components/admin/institutions/ServiceDetailsModal';
import ServiceList from '@/components/admin/institutions/ServiceList';
import ServiceModal from '@/components/admin/institutions/ServiceModal';
import InstitutionDetailsComponent from '@/components/admin/institutions/InstitutionDetailsComponent';
import { useLoader } from '@/contexts/LoaderContext';
import { useGetInstitution } from '@/hooks/institution/useGetInstitution';
import { InstitutionStatus } from '@/types/Institution';
import { TypeService, TypeCalculation } from '@/types/Service';

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: jest.fn().mockResolvedValue('test-token'),
  }),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

// Mock UI components
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, variant }: any) => (
    <span className={className} data-variant={variant}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant }: any) => (
    <button onClick={onClick} className={className} data-variant={variant}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, className }: any) => <label className={className}>{children}</label>,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: ({ className }: any) => <hr className={className} />,
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: any) => (
    <div data-default-value={defaultValue}>{children}</div>
  ),
  TabsList: ({ children, className }: any) => <div className={className}>{children}</div>,
  TabsTrigger: ({ children, value, className }: any) => (
    <button data-value={value} className={className}>
      {children}
    </button>
  ),
  TabsContent: ({ children, value }: any) => <div data-tab-content={value}>{children}</div>,
}));

// Mock useLoader hook
jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: jest.fn(() => ({
    showLoader: jest.fn(),
    hideLoader: jest.fn(),
  })),
}));

// Mock useGetInstitution hook
jest.mock('@/hooks/institution/useGetInstitution');

// Mock modals and components
jest.mock('@/components/admin/institutions/ConfirmUpdateStatusModal', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock('@/components/admin/institutions/ServiceModal', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock('@/components/admin/institutions/ServiceDetailsModal', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock('@/components/admin/institutions/ServiceList', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Service List Mock</div>),
}));

const mockRefetch = jest.fn();
const mockUseGetInstitution = useGetInstitution as jest.Mock;

describe('InstitutionDetailsComponent', () => {
  const mockInstitution = {
    id: '1',
    name: 'Test Institution',
    description: 'Test Description',
    website: 'https://test.com',
    geographicZones: ['UEMOA', 'CEMAC'],
    logoUrl: 'https://logo.com/logo.png',
    status: InstitutionStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetInstitution.mockReturnValue({
      institution: mockInstitution,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });
    queryClient.clear();
  });

  it('renders institution details correctly', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(screen.getByText('Test Institution')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('https://test.com')).toBeInTheDocument();
    expect(screen.getByText('UEMOA')).toBeInTheDocument();
    expect(screen.getByText('CEMAC')).toBeInTheDocument();
  });

  it('displays back to institutions link', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const backLink = screen.getByText('Retour aux Institutions');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/institutions');
  });

  it('renders logo when logoUrl is provided', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const logo = screen.getByAltText('Logo Test Institution');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'https://logo.com/logo.png');
  });

  it('renders initial when logoUrl is not provided', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, logoUrl: '' },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(screen.getByText('T')).toBeInTheDocument();
  });

  describe('Status Badge', () => {
    it('renders active status correctly', () => {
      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByText('Actif')).toBeInTheDocument();
    });

    it('renders inactive status correctly', () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, status: InstitutionStatus.INACTIVE },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByText('Inactif')).toBeInTheDocument();
    });

    it('renders pending status correctly', () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, status: InstitutionStatus.PENDING },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByText('En attente')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('displays activate and reject buttons for pending status', () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, status: InstitutionStatus.PENDING },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByText('REJETER')).toBeInTheDocument();
      expect(screen.getByText('ACTIVER')).toBeInTheDocument();
    });

    it('displays reject button for active status', () => {
      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByText('REJETER')).toBeInTheDocument();
    });

    it('displays activate button for inactive status', () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, status: InstitutionStatus.INACTIVE },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByText('ACTIVER')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('displays error message when there is an error', () => {
      mockUseGetInstitution.mockReturnValue({
        institution: undefined,
        isLoading: false,
        isError: true,
        error: { message: 'Failed to load institution' },
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByText(/Erreur lors du chargement de l'institution/)).toBeInTheDocument();
      expect(screen.getByText(/Failed to load institution/)).toBeInTheDocument();
    });

    it('displays back to list button on error', () => {
      mockUseGetInstitution.mockReturnValue({
        institution: undefined,
        isLoading: false,
        isError: true,
        error: { message: 'Network error' },
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      const backButton = screen.getByText('Retour à la liste');
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders nothing when institution is not loaded', () => {
      mockUseGetInstitution.mockReturnValue({
        institution: undefined,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      const { container } = render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Tabs Navigation', () => {
    it('displays tabs for details and services', () => {
      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByText("Détails de l'institution")).toBeInTheDocument();
      expect(screen.getByText('Services (0)')).toBeInTheDocument();
    });

    it('displays correct service count in tab', () => {
      const mockInstitutionWithServices = {
        ...mockInstitution,
        services: [
          {
            id: 'svc-1',
            name: 'Service 1',
            longName: 'Service 1 Long Name',
            type: TypeService.PAIEMENT_MARCHAND,
            frais: { montantFixe: 100 },
            typeFrais: TypeCalculation.FIX,
            conditionAccess: ['Condition 1'],
            plafonds: ['Plafond 1'],
            infrastructureAccess: ['Infra 1'],
            institutionId: '1',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
      };

      mockUseGetInstitution.mockReturnValue({
        institution: mockInstitutionWithServices,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByText('Services (1)')).toBeInTheDocument();
    });
  });

  describe('Services Section', () => {
    it('displays "Nouveau service" button', () => {
      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByText('Nouveau service')).toBeInTheDocument();
    });

    it('opens service modal when "Nouveau service" is clicked', async () => {
      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      const addButton = screen.getByText('Nouveau service');
      await userEvent.click(addButton);

      const lastCall = (ServiceModal as jest.Mock).mock.calls.slice(-1)[0];
      expect(lastCall[0].open).toBe(true);
    });

    it('passes correct props to ServiceList', () => {
      const mockServices = [
        {
          id: 'svc-1',
          name: 'Service 1',
          longName: 'Service 1 Long Name',
          type: TypeService.PAIEMENT_MARCHAND,
          frais: { montantFixe: 100 },
          typeFrais: TypeCalculation.FIX,
          conditionAccess: ['Condition 1'],
          plafonds: ['Plafond 1'],
          infrastructureAccess: ['Infra 1'],
          institutionId: '1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, services: mockServices },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      const lastCall = (ServiceList as jest.Mock).mock.calls.slice(-1)[0];
      expect(lastCall[0].services).toEqual(mockServices);
      expect(lastCall[0].onView).toBeDefined();
      expect(lastCall[0].onEdit).toBeDefined();
      expect(lastCall[0].onDelete).toBeDefined();
    });
  });

  describe('Geographic Zones', () => {
    it('displays all geographic zones', () => {
      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByText('UEMOA')).toBeInTheDocument();
      expect(screen.getByText('CEMAC')).toBeInTheDocument();
    });

    it('handles single geographic zone', () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, geographicZones: ['UEMOA'] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByText('UEMOA')).toBeInTheDocument();
      expect(screen.queryByText('CEMAC')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    const mockShowLoader = jest.fn();
    const mockHideLoader = jest.fn();

    beforeEach(() => {
      (useLoader as jest.Mock).mockReturnValue({
        showLoader: mockShowLoader,
        hideLoader: mockHideLoader,
      });
    });

    it('displays loader when loading', () => {
      mockUseGetInstitution.mockReturnValue({
        institution: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(mockShowLoader).toHaveBeenCalled();
    });

    it('hides loader when not loading', () => {
      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(mockHideLoader).toHaveBeenCalled();
    });
  });

  describe('Modal Interactions', () => {
    it('opens modal with ACTIVE status when ACTIVER is clicked', async () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, status: InstitutionStatus.PENDING },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      const activateButton = screen.getByText('ACTIVER');
      await userEvent.click(activateButton);

      const lastCall = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.slice(-1)[0];
      expect(lastCall[0].isOpen).toBe(true);
      expect(lastCall[0].status).toBe(InstitutionStatus.ACTIVE);
    });

    it('opens modal with INACTIVE status when REJETER is clicked', async () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, status: InstitutionStatus.PENDING },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      const rejectButton = screen.getByText('REJETER');
      await userEvent.click(rejectButton);

      const lastCall = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.slice(-1)[0];
      expect(lastCall[0].isOpen).toBe(true);
      expect(lastCall[0].status).toBe(InstitutionStatus.INACTIVE);
    });

    it('calls onClose when modal is closed', async () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, status: InstitutionStatus.PENDING },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      const activateButton = screen.getByText('ACTIVER');
      await userEvent.click(activateButton);

      const lastCall = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.slice(-1)[0];
      act(() => {
        lastCall[0].onClose();
      });

      const lastCallAfterClose = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.slice(-1)[0];
      expect(lastCallAfterClose[0].isOpen).toBe(false);
    });

    it('calls refresh when modal refresh is called', async () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, status: InstitutionStatus.PENDING },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      const activateButton = screen.getByText('ACTIVER');
      await userEvent.click(activateButton);

      const lastCall = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.slice(-1)[0];
      lastCall[0].refresh();

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Static Content', () => {
    it('displays static badges correctly', () => {
      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByText('Mobile Money')).toBeInTheDocument();
      expect(screen.getByText('Sénégal et Cameroun')).toBeInTheDocument();
    });

    it('displays modify button', () => {
      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByText('Modifier')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('formats dates correctly in stats', () => {
      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      const dates = screen.getAllByText('01/01/2024');
      expect(dates).toHaveLength(2); // createdAt and updatedAt
    });

    it('displays creation and update labels', () => {
      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByText('Créée le')).toBeInTheDocument();
      expect(screen.getByText('Mise à jour')).toBeInTheDocument();
    });
  });
});
