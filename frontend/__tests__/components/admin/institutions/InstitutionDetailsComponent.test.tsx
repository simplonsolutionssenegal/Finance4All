import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import InstitutionDetailsComponent from '@/components/admin/institutions/InstitutionDetailsComponent';
import { useLoader } from '@/contexts/LoaderContext';
import { useGetInstitution } from '@/hooks/institution/useGetInstitution';
import { InstitutionStatus } from '@/types/Institution';
import { TypeService } from '@/types/Service';
import ServiceItem from '@/components/admin/institutions/ServiceItem';
import ConfirmUpdateStatusModal from '@/components/admin/institutions/ConfirmUpdateStatusModal';
import ServiceDetailsModal from '@/components/admin/institutions/ServiceDetailsModal';

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

// Mocks
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
  TabsTrigger: ({ children, value, className, onClick }: any) => (
    <button data-value={value} className={className} onClick={onClick}>
      {children}
    </button>
  ),
  TabsContent: ({ children, value }: any) => <div data-tab-content={value}>{children}</div>,
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

jest.mock('@/components/admin/institutions/ServiceDetailsModal', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock('@/components/admin/institutions/ServiceItem', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Service List Mock</div>),
}));

jest.mock('@/components/admin/institutions/EditInstitutionModal', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

const mockRefetch = jest.fn();
const mockUseGetInstitution = useGetInstitution as jest.Mock;

describe('InstitutionDetailsComponent - Tests de couverture supplémentaires', () => {
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

  // ==================== Tests des Services ====================

  test('affiche le compte de services corrects avec plusieurs services', () => {
    const mockServices = [
      {
        id: 'svc-1',
        name: 'Service 1',
        longName: 'Service 1 Long Name',
        type: TypeService.PAIEMENT_MARCHAND,
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
        name: 'Service 2',
        longName: 'Service 2 Long Name',
        type: TypeService.PAIEMENT_FACTURES,
        frais: { montantFixe: 200 },
        conditionAccess: ['Condition 2'],
        plafonds: ['Plafond 2'],
        infrastructureAccess: ['Infra 2'],
        institutionId: '1',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
      {
        id: 'svc-3',
        name: 'Service 3',
        longName: 'Service 3 Long Name',
        type: TypeService.TRANSFERT_ARGENT,
        frais: { montantFixe: 300 },
        conditionAccess: ['Condition 3'],
        plafonds: ['Plafond 3'],
        infrastructureAccess: ['Infra 3'],
        institutionId: '1',
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
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
    expect(screen.getByText('Services (3)')).toBeInTheDocument();
  });

  test('institution sans services: affiche Services (0)', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, services: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(screen.getByText('Services (0)')).toBeInTheDocument();
  });

  test('institution avec services undefined: affiche Services (0)', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, services: undefined },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(screen.getByText('Services (0)')).toBeInTheDocument();
  });

  test('ServiceItem reçoit un tableau vide quand services est undefined', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, services: undefined },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const lastCall = (ServiceItem as jest.Mock).mock.calls.slice(-1)[0];
    expect(lastCall[0].services).toEqual([]);
  });

  // ==================== Tests des Zones Géographiques ====================

  test('affiche aucune zone quand geographicZones est undefined', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, geographicZones: undefined },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    // Les badges de zones ne devraient pas être affichés
    expect(screen.queryByText('UEMOA')).not.toBeInTheDocument();
    expect(screen.queryByText('CEMAC')).not.toBeInTheDocument();
  });

  test('affiche aucune zone quand geographicZones est un tableau vide', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, geographicZones: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(screen.queryByText('UEMOA')).not.toBeInTheDocument();
    expect(screen.queryByText('CEMAC')).not.toBeInTheDocument();
  });

  test('affiche plusieurs zones géographiques', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: {
        ...mockInstitution,
        geographicZones: ['UEMOA', 'CEMAC', 'EURO', 'USD'],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(screen.getByText('UEMOA')).toBeInTheDocument();
    expect(screen.getByText('CEMAC')).toBeInTheDocument();
    expect(screen.getByText('EURO')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  // ==================== Tests du Formatage des Dates ====================

  test('formate correctement une date valide', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    const dates = screen.getAllByText('01/01/2024');
    expect(dates).toHaveLength(2);
  });

  test('affiche — quand createdAt est undefined', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, createdAt: undefined } as any,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const dashElements = screen.getAllByText('—');
    expect(dashElements.length).toBeGreaterThan(0);
  });

  test('affiche — quand updatedAt est undefined', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, updatedAt: undefined } as any,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const dashElements = screen.getAllByText('—');
    expect(dashElements.length).toBeGreaterThan(0);
  });

  test('gère une date avec format ISO complet', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: {
        ...mockInstitution,
        createdAt: '2024-06-15T14:30:00.000Z',
        updatedAt: '2024-12-01T09:15:00.000Z',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(screen.getByText('15/06/2024')).toBeInTheDocument();
    expect(screen.getByText('01/12/2024')).toBeInTheDocument();
  });

  // ==================== Tests des Actions sur les Boutons ====================

  test('clic sur ACTIVER depuis PENDING: ouvre modal avec status ACTIVE', async () => {
    const u = userEvent.setup();
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, status: InstitutionStatus.PENDING },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const activateButton = screen.getByText('ACTIVER');
    await u.click(activateButton);

    const lastCall = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.slice(-1)[0];
    expect(lastCall[0].isOpen).toBe(true);
    expect(lastCall[0].status).toBe(InstitutionStatus.ACTIVE);
    expect(lastCall[0].institution).toEqual(expect.objectContaining({ id: '1' }));
  });

  test('clic sur REJETER depuis PENDING: ouvre modal avec status INACTIVE', async () => {
    const u = userEvent.setup();
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, status: InstitutionStatus.PENDING },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const rejectButton = screen.getByText('REJETER');
    await u.click(rejectButton);

    const lastCall = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.slice(-1)[0];
    expect(lastCall[0].isOpen).toBe(true);
    expect(lastCall[0].status).toBe(InstitutionStatus.INACTIVE);
  });

  test('clic sur REJETER depuis ACTIVE: ouvre modal', async () => {
    const u = userEvent.setup();

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const rejectButton = screen.getByText('REJETER');
    await u.click(rejectButton);

    const lastCall = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.slice(-1)[0];
    expect(lastCall[0].isOpen).toBe(true);
    expect(lastCall[0].status).toBe(InstitutionStatus.INACTIVE);
  });

  test('clic sur ACTIVER depuis INACTIVE: ouvre modal', async () => {
    const u = userEvent.setup();
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, status: InstitutionStatus.INACTIVE },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const activateButton = screen.getByText('ACTIVER');
    await u.click(activateButton);

    const lastCall = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.slice(-1)[0];
    expect(lastCall[0].isOpen).toBe(true);
    expect(lastCall[0].status).toBe(InstitutionStatus.ACTIVE);
  });

  test('fermeture du modal ConfirmUpdateStatus', async () => {
    const u = userEvent.setup();
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, status: InstitutionStatus.PENDING },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const activateButton = screen.getByText('ACTIVER');
    await u.click(activateButton);

    let lastCall = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.slice(-1)[0];
    expect(lastCall[0].isOpen).toBe(true);

    // Fermer le modal
    act(() => {
      lastCall[0].onClose();
    });

    lastCall = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.slice(-1)[0];
    expect(lastCall[0].isOpen).toBe(false);
  });

  test('refresh appelé via modal ConfirmUpdateStatus', async () => {
    const u = userEvent.setup();
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, status: InstitutionStatus.PENDING },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const activateButton = screen.getByText('ACTIVER');
    await u.click(activateButton);

    const lastCall = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.slice(-1)[0];

    act(() => {
      lastCall[0].refresh();
    });

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  // ==================== Tests du Logo ====================

  test('affiche le logo avec src correct', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const logo = screen.getByAltText('Logo Test Institution');
    expect(logo).toHaveAttribute('src', 'https://logo.com/logo.png');
  });

  test('affiche initiale quand logoUrl est null', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, logoUrl: null } as any,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(screen.getByText('T')).toBeInTheDocument();
  });

  test('affiche initiale quand logoUrl est chaîne vide', () => {
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

  // ==================== Tests de la Description ====================

  test('affiche la description complète', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  test('affiche — quand description est undefined', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, description: undefined } as any,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const dashElements = screen.getAllByText('—');
    expect(dashElements.length).toBeGreaterThan(0);
  });

  test('affiche — quand description est chaîne vide', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, description: '' },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const dashElements = screen.getAllByText('—');
    expect(dashElements.length).toBeGreaterThan(0);
  });

  // ==================== Tests du Site Web ====================

  test('lien du site web avec href correct', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const link = screen.getByText('https://test.com');
    expect(link.closest('a')).toHaveAttribute('href', 'https://test.com');
    expect(link.closest('a')).toHaveAttribute('target', '_blank');
    expect(link.closest('a')).toHaveAttribute('rel', 'noreferrer');
  });

  test('affiche — quand website est null', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, website: null } as any,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    // Website devrait afficher —
    const dashElements = screen.getAllByText('—');
    expect(dashElements.length).toBeGreaterThan(0);
  });

  // ==================== Tests des Informations Statiques ====================

  test('affiche les informations de contact statiques', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(screen.getByText('+221 33 869 60 00')).toBeInTheDocument();
    expect(screen.getByText('Amadou Diallo')).toBeInTheDocument();
    expect(screen.getByText('contact@orangemoney.sn')).toBeInTheDocument();
    expect(screen.getByText('Dakar, Sénégal')).toBeInTheDocument();
    expect(screen.getByText('+221 77 123 45 67')).toBeInTheDocument();
  });

  test('affiche les badges statiques', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(screen.getByText('Mobile Money')).toBeInTheDocument();
    expect(screen.getByText('Sénégal et Cameroun')).toBeInTheDocument();
  });

  test('affiche les labels des statistiques', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Créée le')).toBeInTheDocument();
    expect(screen.getByText('Mise à jour')).toBeInTheDocument();
  });

  // ==================== Tests de Gestion des Erreurs ====================

  test('erreur avec message personnalisé', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: undefined,
      isLoading: false,
      isError: true,
      error: { message: 'Erreur de réseau' },
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(screen.getByText(/Erreur lors du chargement de l'institution/)).toBeInTheDocument();
    expect(screen.getByText(/Erreur de réseau/)).toBeInTheDocument();
  });

  test('erreur sans message: affiche objet error', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: undefined,
      isLoading: false,
      isError: true,
      error: {} as any,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(screen.getByText(/Erreur lors du chargement de l'institution/)).toBeInTheDocument();
  });

  test('clic sur retour depuis erreur navigue vers /institutions', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: undefined,
      isLoading: false,
      isError: true,
      error: { message: 'Erreur' },
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const backButton = screen.getByText('Retour à la liste');
    expect(backButton.closest('a')).toHaveAttribute('href', '/institutions');
  });

  // ==================== Tests du Chargement ====================

  test('affiche et cache le loader correctement', () => {
    const mockShowLoader = jest.fn();
    const mockHideLoader = jest.fn();

    (useLoader as jest.Mock).mockReturnValue({
      showLoader: mockShowLoader,
      hideLoader: mockHideLoader,
    });

    mockUseGetInstitution.mockReturnValue({
      institution: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    const { rerender } = render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(mockShowLoader).toHaveBeenCalled();

    mockUseGetInstitution.mockReturnValue({
      institution: mockInstitution,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    rerender(
      <QueryClientProvider client={queryClient}>
        <InstitutionDetailsComponent institutionId='1' />
      </QueryClientProvider>
    );

    expect(mockHideLoader).toHaveBeenCalled();
  });

  // ==================== Tests Additionnels pour Couverture ====================

  test('institution avec nom contenant caractères spéciaux: initiale correcte', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, name: '123 Banque', logoUrl: '' },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('description longue: affichage complet', () => {
    const longDescription = 'Lorem ipsum '.repeat(50);
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, description: longDescription },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  test('multiples appels à renderStatusChip avec tous les statuts', () => {
    // Test ACTIVE déjà fait dans les tests de base

    // Test INACTIVE
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, status: InstitutionStatus.INACTIVE },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    const { rerender } = render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(screen.getByText('Inactif')).toBeInTheDocument();

    // Test PENDING
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, status: InstitutionStatus.PENDING },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    rerender(
      <QueryClientProvider client={queryClient}>
        <InstitutionDetailsComponent institutionId='1' />
      </QueryClientProvider>
    );
    expect(screen.getByText('En attente')).toBeInTheDocument();
  });

  test('passage de institutionId différent', () => {
    render(<InstitutionDetailsComponent institutionId='different-id' />, { wrapper });

    // Vérifier que le hook est appelé avec le bon ID
    expect(mockUseGetInstitution).toHaveBeenCalledWith('different-id');
  });
});
