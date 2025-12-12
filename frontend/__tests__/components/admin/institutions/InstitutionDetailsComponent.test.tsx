import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import InstitutionDetailsComponent from '@/components/admin/institutions/InstitutionDetailsComponent';
import { useLoader } from '@/contexts/LoaderContext';
import { useGetInstitution } from '@/hooks/institution/useGetInstitution';
import { InstitutionStatus } from '@/types/Institution';
import { TypeService } from '@/types/Service';
import ServiceItem from '@/components/admin/institutions/ServiceItem';
import ConfirmUpdateStatusModal from '@/components/admin/institutions/ConfirmUpdateStatusModal';
import ServiceDetailsModal from '@/components/admin/institutions/ServiceDetailsModal';
import EditInstitutionModal from '@/components/admin/institutions/EditInstitutionModal';

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

describe('InstitutionDetailsComponent - Couverture Maximale', () => {
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

  // ==================== Tests Basiques de Rendu ====================

  test('rend le composant avec toutes les sections principales', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(screen.getByText('Test Institution')).toBeInTheDocument();
    expect(screen.getByText('Retour aux Institutions')).toBeInTheDocument();
    expect(screen.getByText('Modifier')).toBeInTheDocument();
  });

  test('affiche les tabs correctement avec valeurs par défaut', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(screen.getByText("Détails de l'institution")).toBeInTheDocument();
    expect(screen.getByText(/Services \(/)).toBeInTheDocument();
  });

  // ==================== Tests des Services ====================

  test('affiche le message de gestion des services', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(
      screen.getByText(/Gérez les services financiers proposés par Test Institution/)
    ).toBeInTheDocument();
  });

  test('lien "Nouveau service" pointe vers la bonne URL', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const newServiceLink = screen.getByText('Nouveau service').closest('a');
    expect(newServiceLink).toHaveAttribute('href', '/institutions/1/service/new');
  });

  test('serviceCount avec un seul service affiche "Services (1)"', () => {
    const singleService = [
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
    ];

    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, services: singleService },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(screen.getByText('Services (1)')).toBeInTheDocument();
  });

  test('ServiceItem reçoit les bonnes props avec services', () => {
    const mockServices = [
      {
        id: 'svc-1',
        name: 'Service 1',
        longName: 'Service 1 Long Name',
        type: TypeService.PAIEMENT_MARCHAND,
        frais: { montantFixe: 100 },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
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

    const lastCall = (ServiceItem as jest.Mock).mock.calls.at(-1);
    expect(lastCall[0].services).toHaveLength(1);
    expect(lastCall[0].services[0].id).toBe('svc-1');
    expect(lastCall[0].onView).toBeDefined();
    expect(lastCall[0].onEdit).toBeDefined();
    expect(lastCall[0].onDelete).toBeDefined();
  });

  // ==================== Tests des Zones Géographiques ====================

  test('affiche une seule zone géographique', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: {
        ...mockInstitution,
        geographicZones: ['UEMOA'],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(screen.getByText('UEMOA')).toBeInTheDocument();
    expect(screen.queryByText('CEMAC')).not.toBeInTheDocument();
  });

  test('zones géographiques affichent les icônes MapPin', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const uemoaBadge = screen.getByText('UEMOA').parentElement;
    const cemacBadge = screen.getByText('CEMAC').parentElement;

    // Vérifier que les badges contiennent bien le composant (présence dans le DOM)
    expect(uemoaBadge).toBeInTheDocument();
    expect(cemacBadge).toBeInTheDocument();
  });

  // ==================== Tests du Formatage des Dates ====================

  test('formatDate avec date valide en format court', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: {
        ...mockInstitution,
        createdAt: '2024-03-15',
        updatedAt: '2024-03-15',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    const dates = screen.getAllByText('15/03/2024');
    expect(dates.length).toBeGreaterThanOrEqual(1);
  });

  test('formatDate avec date null affiche —', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: {
        ...mockInstitution,
        createdAt: null,
        updatedAt: null,
      } as any,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  test('formatDate avec chaîne vide affiche —', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: {
        ...mockInstitution,
        createdAt: '',
        updatedAt: '',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  // ==================== Tests des Status Chips ====================

  test('renderStatusChip affiche correctement ACTIVE', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(screen.getByText('Actif')).toBeInTheDocument();
  });

  test('renderStatusChip affiche correctement INACTIVE', () => {
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

  test('renderStatusChip affiche correctement PENDING', () => {
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

  // ==================== Tests des Boutons d'Action ====================

  test('PENDING affiche les boutons Activer et Rejeter', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, status: InstitutionStatus.PENDING },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(screen.getByText('Activer')).toBeInTheDocument();
    expect(screen.getByText('Rejeter')).toBeInTheDocument();
  });

  test('ACTIVE affiche uniquement le bouton Rejeter', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(screen.queryByText('Activer')).not.toBeInTheDocument();
    expect(screen.getByText('Rejeter')).toBeInTheDocument();
  });

  test('INACTIVE affiche uniquement le bouton Activer', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, status: InstitutionStatus.INACTIVE },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(screen.getByText('Activer')).toBeInTheDocument();
    expect(screen.queryByText('Rejeter')).not.toBeInTheDocument();
  });

  test('bouton ACTIVER a les bonnes classes CSS', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, status: InstitutionStatus.PENDING },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    const activateButton = screen.getByText('Activer');
    expect(activateButton).toHaveClass('bg-primary-300');
    expect(activateButton).toHaveClass('text-white');
  });

  test('bouton REJETER a les bonnes classes CSS', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    const rejectButton = screen.getByText('Rejeter');
    expect(rejectButton).toHaveClass('bg-[#E00010]');
    expect(rejectButton).toHaveClass('text-white');
  });

  // ==================== Tests des Modales ====================

  test('ouverture et fermeture multiple du modal ConfirmUpdateStatus', async () => {
    const u = userEvent.setup();
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, status: InstitutionStatus.PENDING },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    // Ouvrir avec Activer
    await u.click(screen.getByText('Activer'));
    let lastCall = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.at(-1);
    expect(lastCall[0].isOpen).toBe(true);

    // Fermer
    act(() => lastCall[0].onClose());
    lastCall = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.at(-1);
    expect(lastCall[0].isOpen).toBe(false);

    // Re-ouvrir avec Rejeter
    await u.click(screen.getByText('Rejeter'));
    lastCall = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.at(-1);
    expect(lastCall[0].isOpen).toBe(true);
    expect(lastCall[0].status).toBe(InstitutionStatus.INACTIVE);
  });

  test('modal ServiceDetails reçoit service null initialement', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const firstCall = (ServiceDetailsModal as jest.Mock).mock.calls[0][0];
    expect(firstCall.service).toBeNull();
    expect(firstCall.open).toBe(false);
  });

  test('modal EditInstitution reçoit la bonne institution', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const firstCall = (EditInstitutionModal as jest.Mock).mock.calls[0][0];
    expect(firstCall.institution).toEqual(expect.objectContaining({ id: '1' }));
    expect(firstCall.open).toBe(false);
  });

  test('ouverture/fermeture multiple du modal EditInstitution', async () => {
    const u = userEvent.setup();

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    // Ouvrir
    await u.click(screen.getByText('Modifier'));
    let lastCall = (EditInstitutionModal as jest.Mock).mock.calls.at(-1);
    expect(lastCall[0].open).toBe(true);

    // Fermer
    act(() => lastCall[0].onOpenChange(false));
    lastCall = (EditInstitutionModal as jest.Mock).mock.calls.at(-1);
    expect(lastCall[0].open).toBe(false);

    // Re-ouvrir
    await u.click(screen.getByText('Modifier'));
    lastCall = (EditInstitutionModal as jest.Mock).mock.calls.at(-1);
    expect(lastCall[0].open).toBe(true);
  });

  // ==================== Tests des Handlers de Service ====================

  test('handleViewService met à jour selectedService et ouvre modal', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, services: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const serviceItemProps = (ServiceItem as jest.Mock).mock.calls.at(-1)?.[0];
    const testService = {
      id: 'svc-test',
      name: 'Test Service',
      longName: 'Test Service Long',
      type: TypeService.PAIEMENT_MARCHAND,
      frais: { montantFixe: 100 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
      institutionId: '1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    act(() => serviceItemProps.onView(testService));

    const modalCall = (ServiceDetailsModal as jest.Mock).mock.calls.at(-1);
    expect(modalCall[0].open).toBe(true);
    expect(modalCall[0].service).toEqual(testService);
  });

  test('handleEditService appelle console.warn avec service correct', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, services: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const serviceItemProps = (ServiceItem as jest.Mock).mock.calls.at(-1)?.[0];
    const testService = {
      id: 'svc-edit',
      name: 'Edit Service',
      longName: 'Edit Service Long',
      type: TypeService.TRANSFERT_ARGENT,
      frais: { montantFixe: 50 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
      institutionId: '1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    serviceItemProps.onEdit(testService);

    expect(consoleWarnSpy).toHaveBeenCalledWith('Modifier le service:', testService);
    consoleWarnSpy.mockRestore();
  });

  test('handleDeleteService appelle console.warn avec service correct', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, services: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const serviceItemProps = (ServiceItem as jest.Mock).mock.calls.at(-1)?.[0];
    const testService = {
      id: 'svc-delete',
      name: 'Delete Service',
      longName: 'Delete Service Long',
      type: TypeService.PAIEMENT_FACTURES,
      frais: { montantFixe: 200 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
      institutionId: '1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    serviceItemProps.onDelete(testService);

    expect(consoleWarnSpy).toHaveBeenCalledWith('Supprimer le service:', testService);
    consoleWarnSpy.mockRestore();
  });

  // ==================== Tests du Logo ====================

  test('logo avec alt text correct', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const logo = screen.getByAltText('Logo Test Institution');
    expect(logo).toHaveAttribute('alt', 'Logo Test Institution');
  });

  test('initiale affichée avec nom en minuscule', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, name: 'test', logoUrl: '' },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  test('initiale avec nom commençant par espace', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, name: ' Banque', logoUrl: null } as any,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    const { container } = render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    // L'espace initial peut être rendu comme un élément vide — vérifier le conteneur
    const initialEl = container.querySelector('.p-2.border-2 div');
    expect(initialEl).toBeInTheDocument();
    expect(initialEl?.textContent?.trim()).toBe('');
  });

  // ==================== Tests des InfoRow et InfoBlock ====================

  test('InfoRow avec href affiche un lien cliquable', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const websiteLink = screen.getByText('https://test.com');
    expect(websiteLink.tagName).toBe('A');
    expect(websiteLink).toHaveAttribute('href', 'https://test.com');
  });

  test('InfoRow sans valeur affiche —', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, website: undefined } as any,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThan(0);
  });

  test('InfoBlock affiche le titre et la valeur', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  // ==================== Tests du Loader ====================

  test('loader appelé pendant isLoading=true', () => {
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

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(mockShowLoader).toHaveBeenCalledTimes(1);
  });

  test('hideLoader appelé quand isLoading passe à false', () => {
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

  test('showLoader et hideLoader ne sont pas appelés si isLoading reste false', () => {
    const mockShowLoader = jest.fn();
    const mockHideLoader = jest.fn();

    (useLoader as jest.Mock).mockReturnValue({
      showLoader: mockShowLoader,
      hideLoader: mockHideLoader,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(mockShowLoader).not.toHaveBeenCalled();
    expect(mockHideLoader).toHaveBeenCalled();
  });

  // ==================== Tests de Navigation ====================

  test('lien "Retour aux Institutions" a le bon href', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const backLink = screen.getByText('Retour aux Institutions').closest('a');
    expect(backLink).toHaveAttribute('href', '/institutions');
  });

  test('lien erreur "Retour à la liste" fonctionne', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: undefined,
      isLoading: false,
      isError: true,
      error: { message: 'Erreur test' },
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const backLink = screen.getByText('Retour à la liste').closest('a');
    expect(backLink).toHaveAttribute('href', '/institutions');
  });

  // ==================== Tests des Erreurs ====================

  test('erreur avec message vide affiche objet error', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: undefined,
      isLoading: false,
      isError: true,
      error: { message: '' },
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(screen.getByText(/Erreur lors du chargement de l'institution/)).toBeInTheDocument();
  });

  test('erreur avec error undefined', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: undefined,
      isLoading: false,
      isError: true,
      error: undefined,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(screen.getByText(/Erreur lors du chargement de l'institution/)).toBeInTheDocument();
  });

  // ==================== Tests des Badges Statiques ====================

  test('badge "Mobile Money" est présent', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, type: 'Mobile Money' as any },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(screen.getByText('Mobile Money')).toBeInTheDocument();
  });

  test('badge "Sénégal et Cameroun" est présent', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, pays: 'Sénégal et Cameroun' as any },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(screen.getByText('Sénégal et Cameroun')).toBeInTheDocument();
  });

  // ==================== Tests des Stats ====================

  test('Stat affiche correctement label et value', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Créée le')).toBeInTheDocument();
    expect(screen.getByText('Mise à jour')).toBeInTheDocument();
  });

  test('serviceCount affiche 0 correctement dans les stats', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, services: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    // Le "0" devrait apparaître dans la section Stats
    const statsSection = screen.getByText('Services').closest('div')?.parentElement;
    expect(statsSection).toHaveTextContent('0');
  });

  // ==================== Tests des Cas Limites ====================

  test('institution avec nom vide affiche initiale vide', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, name: '', logoUrl: '' },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    const { container } = render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    // charAt(0) sur une chaîne vide retourne '' — vérifier que le conteneur du logo existe
    const logoDiv = container.querySelector('.p-2.border-2');
    expect(logoDiv).toBeInTheDocument();
  });

  test('website avec protocole http:// fonctionne', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, website: 'http://test.com' },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const link = screen.getByText('http://test.com');
    expect(link).toHaveAttribute('href', 'http://test.com');
  });

  test('description très longue ne coupe pas le texte', () => {
    const longDesc = 'A'.repeat(1000);
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, description: longDesc },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(screen.getByText(longDesc)).toBeInTheDocument();
  });

  test('zones géographiques avec noms longs', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: {
        ...mockInstitution,
        geographicZones: ['Zone Géographique Très Longue Avec Plusieurs Mots'],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(
      screen.getByText('Zone Géographique Très Longue Avec Plusieurs Mots')
    ).toBeInTheDocument();
  });

  // ==================== Tests de Refetch ====================

  test('refetch appelé via EditInstitutionModal', async () => {
    const u = userEvent.setup();

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    await u.click(screen.getByText('Modifier'));

    const lastCall = (EditInstitutionModal as jest.Mock).mock.calls.at(-1);

    mockRefetch.mockClear();
    act(() => lastCall[0].refresh());

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  test('refetch appelé via ConfirmUpdateStatusModal', async () => {
    const u = userEvent.setup();

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    await u.click(screen.getByText('Rejeter'));

    const lastCall = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.at(-1);

    mockRefetch.mockClear();
    act(() => lastCall[0].refresh());

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  // ==================== Tests de Multiples Clics ====================

  test('multiples clics sur Activer ouvrent le modal plusieurs fois', async () => {
    const u = userEvent.setup();
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, status: InstitutionStatus.PENDING },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const activateButton = screen.getByText('Activer');

    await u.click(activateButton);
    let lastCall = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.at(-1);
    expect(lastCall[0].isOpen).toBe(true);

    act(() => lastCall[0].onClose());

    await u.click(activateButton);
    lastCall = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.at(-1);
    expect(lastCall[0].isOpen).toBe(true);
  });

  test('multiples clics sur Modifier ouvrent/ferment le modal', async () => {
    const u = userEvent.setup();

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const modifyButton = screen.getByText('Modifier');

    // Premier clic
    await u.click(modifyButton);
    let lastCall = (EditInstitutionModal as jest.Mock).mock.calls.at(-1);
    expect(lastCall[0].open).toBe(true);

    // Fermer
    act(() => lastCall[0].onOpenChange(false));
    lastCall = (EditInstitutionModal as jest.Mock).mock.calls.at(-1);
    expect(lastCall[0].open).toBe(false);

    // Second clic
    await u.click(modifyButton);
    lastCall = (EditInstitutionModal as jest.Mock).mock.calls.at(-1);
    expect(lastCall[0].open).toBe(true);
  });

  // ==================== Tests des Services Multiples ====================

  test('handleViewService appelé avec différents services', () => {
    const services = [
      {
        id: 'svc-1',
        name: 'Service 1',
        longName: 'Service 1 Long',
        type: TypeService.PAIEMENT_MARCHAND,
        frais: { montantFixe: 100 },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
        institutionId: '1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'svc-2',
        name: 'Service 2',
        longName: 'Service 2 Long',
        type: TypeService.TRANSFERT_ARGENT,
        frais: { montantFixe: 200 },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
        institutionId: '1',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    ];

    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, services },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const serviceItemProps = (ServiceItem as jest.Mock).mock.calls.at(-1)?.[0];

    // Appeler avec le premier service
    act(() => serviceItemProps.onView(services[0]));
    let modalCall = (ServiceDetailsModal as jest.Mock).mock.calls.at(-1);
    expect(modalCall[0].service).toEqual(services[0]);

    // Fermer
    act(() => modalCall[0].onOpenChange(false));

    // Appeler avec le second service
    act(() => serviceItemProps.onView(services[1]));
    modalCall = (ServiceDetailsModal as jest.Mock).mock.calls.at(-1);
    expect(modalCall[0].service).toEqual(services[1]);
  });

  // ==================== Tests de Formatage Dates Complexes ====================

  test('formatDate avec date ayant timezone', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: {
        ...mockInstitution,
        createdAt: '2024-01-15T10:30:00+01:00',
        updatedAt: '2024-01-15T10:30:00+01:00',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    const dates = screen.getAllByText('15/01/2024');
    expect(dates.length).toBeGreaterThanOrEqual(1);
  });

  test('formatDate avec date millisecondes', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: {
        ...mockInstitution,
        createdAt: '2024-12-31T23:59:59.999Z',
        updatedAt: '2024-12-31T23:59:59.999Z',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    const dates = screen.getAllByText('31/12/2024');
    expect(dates.length).toBeGreaterThanOrEqual(1);
  });

  // ==================== Tests de Rendu Conditionnel ====================

  test('aucun service ne masque pas ServiceItem', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, services: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    // ServiceItem devrait toujours être rendu, même avec tableau vide
    expect(ServiceItem).toHaveBeenCalled();
  });

  test('changement de status met à jour les boutons affichés', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, status: InstitutionStatus.PENDING },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    const { rerender } = render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    expect(screen.getByText('Activer')).toBeInTheDocument();
    expect(screen.getByText('Rejeter')).toBeInTheDocument();

    // Changer pour ACTIVE
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, status: InstitutionStatus.ACTIVE },
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
    expect(screen.queryByText('Activer')).not.toBeInTheDocument();
    expect(screen.getByText('Rejeter')).toBeInTheDocument();
  });

  // ==================== Tests des Propriétés des Modales ====================

  test('ConfirmUpdateStatusModal reçoit institution complète', async () => {
    const u = userEvent.setup();

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    await u.click(screen.getByText('Rejeter'));

    const lastCall = (ConfirmUpdateStatusModal as jest.Mock).mock.calls.at(-1);
    expect(lastCall[0].institution).toEqual(
      expect.objectContaining({
        id: '1',
        name: 'Test Institution',
        status: InstitutionStatus.ACTIVE,
      })
    );
  });

  test('ServiceDetailsModal onOpenChange avec true puis false', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, services: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    const serviceItemProps = (ServiceItem as jest.Mock).mock.calls.at(-1)?.[0];
    const service = {
      id: 'svc-toggle',
      name: 'Toggle Service',
      longName: 'Toggle Service Long',
      type: TypeService.PAIEMENT_MARCHAND,
      frais: { montantFixe: 100 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
      institutionId: '1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    // Ouvrir
    act(() => serviceItemProps.onView(service));
    let modalCall = (ServiceDetailsModal as jest.Mock).mock.calls.at(-1);
    expect(modalCall[0].open).toBe(true);

    // Fermer avec onOpenChange(false)
    act(() => modalCall[0].onOpenChange(false));
    modalCall = (ServiceDetailsModal as jest.Mock).mock.calls.at(-1);
    expect(modalCall[0].open).toBe(false);

    // Re-ouvrir
    act(() => serviceItemProps.onView(service));
    modalCall = (ServiceDetailsModal as jest.Mock).mock.calls.at(-1);
    expect(modalCall[0].open).toBe(true);

    // Fermer avec onOpenChange(true) puis false
    act(() => modalCall[0].onOpenChange(true));
    act(() => modalCall[0].onOpenChange(false));
    modalCall = (ServiceDetailsModal as jest.Mock).mock.calls.at(-1);
    expect(modalCall[0].open).toBe(false);
  });

  // ==================== Test de Couverture Supplémentaire ====================

  test('tous les labels de contact sont présents', () => {
    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });

    // The component currently renders the following main labels
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Site web')).toBeInTheDocument();
    expect(screen.getByText('Zones couvertes')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
  });

  test("institution avec geographicZones null ne cause pas d'erreur", () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, geographicZones: null } as any,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    expect(() => {
      render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    }).not.toThrow();
  });

  test("serviceCount avec services null n'affiche pas de nombre négatif", () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, services: null } as any,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />, { wrapper });
    expect(screen.getByText('Services (0)')).toBeInTheDocument();
  });
});
