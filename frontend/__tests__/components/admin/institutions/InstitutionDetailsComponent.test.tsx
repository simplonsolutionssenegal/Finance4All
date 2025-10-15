import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConfirmUpdateStatusModal from '@/components/admin/institutions/ConfirmUpdateStatusModal';
import InstitutionDetailsComponent from '@/components/admin/institutions/InstitutionDetailsComponent';
import SearchBar from '@/components/admin/institutions/SearchBar';
import { useLoader } from '@/contexts/LoaderContext';
import { useGetInstitution } from '@/hooks/institution/useGetInstitution';
import { InstitutionStatus } from '@/types/Institution';
import { EMPTY_FILTERS } from '@/types/Service';

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: jest.fn().mockResolvedValue('test-token'),
  }),
}));

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => <span className={className}>{children}</span>,
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

jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: jest.fn(() => ({
    showLoader: jest.fn(),
    hideLoader: jest.fn(),
  })),
}));

jest.mock('@/hooks/institution/useGetInstitution');

jest.mock('@/components/admin/institutions/ConfirmUpdateStatusModal', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock('@/components/admin/institutions/SearchBar', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid='search-bar'>SearchBar</div>),
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

  it('displays back to list link', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const backLink = screen.getByText('Retour à la liste');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/institutions');
  });

  it('renders logo when logoUrl is provided', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const logo = screen.getByAltText('Logo de Test Institution');
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

    it('renders null for default status', () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, status: 'UNKNOWN' as any },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.queryByText('Actif')).toBeNull();
      expect(screen.queryByText('Inactif')).toBeNull();
      expect(screen.queryByText('En attente')).toBeNull();
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

    it('displays deactivate button for active status', () => {
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

  describe('Financial Services Section', () => {
    it('displays SearchBar component', () => {
      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    });

    it('passes correct props to SearchBar', () => {
      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      const searchBarCall = (SearchBar as jest.Mock).mock.calls[0][0];
      expect(searchBarCall).toHaveProperty('onSearch');
      expect(searchBarCall).toHaveProperty('resultsCount');
      expect(searchBarCall).toHaveProperty('onApplyFilters');
      expect(searchBarCall).toHaveProperty('currentFilters');
      expect(searchBarCall.currentFilters).toEqual(EMPTY_FILTERS);
    });

    it('displays "Ajouter un service" button', () => {
      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByText('Ajouter un service')).toBeInTheDocument();
    });

    it('displays empty message when no services exist', () => {
      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByText('Aucun service financier pour le moment.')).toBeInTheDocument();
    });

    it('displays services when they exist', () => {
      const mockInstitutionWithServices = {
        ...mockInstitution,
        services: [
          {
            id: 'svc-1',
            name: 'Service 1',
            longName: 'Service 1 Long Name',
            type: 'paiement marchand',
            frais: { montantFixe: 100 },
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

      expect(screen.queryByText('Aucun service financier pour le moment.')).not.toBeInTheDocument();
      expect(screen.getByText('Service 1')).toBeInTheDocument();
    });

    it('opens service modal when "Ajouter un service" is clicked', async () => {
      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      const addButton = screen.getByText('Ajouter un service');
      await userEvent.click(addButton);
    });
  });

  describe('Search and Filter Functionality', () => {
    const mockServices = [
      {
        id: 'svc-1',
        name: 'Service Mobile',
        longName: 'Service Mobile Money',
        type: 'mobile money',
        frais: { montantFixe: 100 },
        conditionAccess: ['Condition 1'],
        plafonds: ['Plafond 1'],
        infrastructureAccess: ['Infra 1'],
        institutionId: '1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'svc-2',
        name: 'Service Paiement',
        longName: 'Service Paiement Marchand',
        type: 'paiement marchand',
        frais: { montantFixe: 200 },
        conditionAccess: ['Condition 2'],
        plafonds: ['Plafond 2'],
        infrastructureAccess: ['Infra 2'],
        institutionId: '1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    it('filters services by search term (name)', async () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, services: mockServices },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      const searchBarCall = (SearchBar as jest.Mock).mock.calls[0][0];
      act(() => {
        searchBarCall.onSearch('Mobile');
      });

      expect(screen.getByText('Service Mobile')).toBeInTheDocument();
      expect(screen.queryByText('Service Paiement')).not.toBeInTheDocument();
    });

    it('filters services by type', async () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, services: mockServices },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      const searchBarCall = (SearchBar as jest.Mock).mock.calls[0][0];
      act(() => {
        searchBarCall.onApplyFilters({ type: ['mobile money'] });
      });

      expect(screen.getByText('Service Mobile')).toBeInTheDocument();
      expect(screen.queryByText('Service Paiement')).not.toBeInTheDocument();
    });

    it('shows "no results" message when filters return empty', async () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, services: mockServices },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      const searchBarCall = (SearchBar as jest.Mock).mock.calls[0][0];
      act(() => {
        searchBarCall.onSearch('nonexistent');
      });

      expect(
        screen.getByText('Aucun service ne correspond à votre recherche.')
      ).toBeInTheDocument();
      expect(screen.getByText('Effacer les filtres')).toBeInTheDocument();
    });

    it('clears filters when "Effacer les filtres" is clicked', async () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, services: mockServices },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      const searchBarCall = (SearchBar as jest.Mock).mock.calls[0][0];
      act(() => {
        searchBarCall.onSearch('nonexistent');
      });

      const clearButton = screen.getByText('Effacer les filtres');
      await userEvent.click(clearButton);

      expect(screen.getByText('Service Mobile')).toBeInTheDocument();
      expect(screen.getByText('Service Paiement')).toBeInTheDocument();
    });

    it('updates results count in SearchBar after filtering', async () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, services: mockServices },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      const { rerender } = render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      let searchBarCall = (SearchBar as jest.Mock).mock.calls.slice(-1)[0][0];
      expect(searchBarCall.resultsCount).toBe(2);

      act(() => {
        searchBarCall.onSearch('Mobile');
      });

      rerender(<InstitutionDetailsComponent institutionId='1' />);

      searchBarCall = (SearchBar as jest.Mock).mock.calls.slice(-1)[0][0];
      expect(searchBarCall.resultsCount).toBe(1);
    });
  });

  describe('Geographic Zones', () => {
    it('displays all geographic zones', () => {
      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

      expect(screen.getByText('Zones géographiques :')).toBeInTheDocument();
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

    it('calls refresh when modal is refreshed', async () => {
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
});
