// InstitutionsList.test.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InstitutionsList from '@/components/admin/institutions/InstitutionsList';
import { useLoader } from '@/contexts/LoaderContext';
import { useGetInstitutions } from '@/hooks/institution/useGetInstitutions';
import { InstitutionStatus } from '@/types/Institution';

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

// Mocks Next.js pieces
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});
jest.mock('next/image', () => (props: any) => <img {...props} />);

// Mock LoaderContext
jest.mock('@/contexts/LoaderContext');

// Mock data hook
jest.mock('@/hooks/institution/useGetInstitutions');

// Mock InstitutionModal
jest.mock('@/components/admin/institutions/InstitutionModal', () => ({
  __esModule: true,
  default: ({ open, institution, refresh }: any) => {
    if (!open) return null;
    // exposer refresh pour tests
    (globalThis as any).__lastInstitutionModalRefresh = refresh;
    return (
      <div data-testid='institution-modal'>
        {institution ? `Edit: ${institution.name}` : 'New Institution'}
      </div>
    );
  },
}));

// Mock des icônes lucide-react utilisées
jest.mock('lucide-react', () => ({
  Search: (p: any) => <i data-testid='icon-search' {...p} />,
  Filter: (p: any) => <i data-testid='icon-filter' {...p} />,
  ChevronDown: (p: any) => <i data-testid='icon-chevron-down' {...p} />,
  MapPin: (p: any) => <i data-testid='icon-map-pin' {...p} />,
  ChevronLeft: (p: any) => <i data-testid='icon-chevron-left' {...p} />,
  ChevronRight: (p: any) => <i data-testid='icon-chevron-right' {...p} />,
  ChevronsLeft: (p: any) => <i data-testid='icon-chevrons-left' {...p} />,
  ChevronsRight: (p: any) => <i data-testid='icon-chevrons-right' {...p} />,
}));

const mockShowLoader = jest.fn();
const mockHideLoader = jest.fn();
const mockRefetch = jest.fn();

const mockInstitutions = [
  {
    id: '1',
    name: 'Orange Money',
    description: 'Service de paiement mobile',
    website: 'https://orange.sn',
    geographicZones: ['UEMOA', 'CEMAC'],
    logoUrl: 'https://logo.com/orange.png',
    status: InstitutionStatus.ACTIVE,
    type: 'SERVICE_PAIEMENT_ELECTRONIQUE',
    pays: 'SENEGAL',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Wave',
    description: "Transfert d'argent",
    website: 'https://wave.com',
    geographicZones: ['UEMOA'],
    logoUrl: '',
    status: InstitutionStatus.PENDING,
    type: 'PORTEFEUILLE_NUMERIQUE',
    pays: 'SENEGAL',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'MTN Money',
    description: 'Mobile money service',
    website: '',
    geographicZones: ['CEMAC'],
    logoUrl: 'https://logo.com/mtn.png',
    status: InstitutionStatus.INACTIVE,
    type: 'ETABLISSEMENT_MONNAIE_ELECTRONIQUE',
    pays: 'CAMEROUN',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

describe('InstitutionsList (nouvelle version)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLoader as jest.Mock).mockReturnValue({
      showLoader: mockShowLoader,
      hideLoader: mockHideLoader,
    });
    (useGetInstitutions as jest.Mock).mockReturnValue({
      institutions: mockInstitutions,
      pagination: {
        page: 1,
        totalPages: 1,
        total: 3,
        limit: 10,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  describe('Rendering de base', () => {
    it('affiche le champ de recherche (placeholder exact)', () => {
      render(<InstitutionsList />, { wrapper });
      expect(screen.getByPlaceholderText('Rechercher une institution...')).toBeInTheDocument();
    });

    it('affiche les boutons de filtres type/pays', () => {
      render(<InstitutionsList />, { wrapper });
      expect(screen.getByText('Tous les types')).toBeInTheDocument();
      expect(screen.getByText('Tous les pays')).toBeInTheDocument();
    });

    it('affiche les entêtes de table attendues', () => {
      render(<InstitutionsList />, { wrapper });
      expect(screen.getByText('Institution')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Pays')).toBeInTheDocument();
      expect(screen.getByText('Zones')).toBeInTheDocument();
      expect(screen.getByText('Statut')).toBeInTheDocument();
    });

    it('affiche toutes les institutions', () => {
      render(<InstitutionsList />, { wrapper });
      expect(screen.getByText('Orange Money')).toBeInTheDocument();
      expect(screen.getByText('Wave')).toBeInTheDocument();
      expect(screen.getByText('MTN Money')).toBeInTheDocument();
    });

    it('rend les logos quand disponibles', () => {
      render(<InstitutionsList />, { wrapper });
      const logos = screen.getAllByRole('img');
      expect(logos.length).toBeGreaterThan(0);
      expect(logos[0]).toHaveAttribute('alt', 'Orange Money');
      expect(logos[0]).toHaveAttribute('src', 'https://logo.com/orange.png');
    });

    it("n'affiche pas de logo si logoUrl est vide", () => {
      render(<InstitutionsList />, { wrapper });
      const waveRow = screen.getByText('Wave').closest('tr');
      const images = waveRow?.querySelectorAll('img');
      expect(images?.length ?? 0).toBe(0);
    });
  });

  describe('Badges de statut', () => {
    it('affiche Actif / En attente / Inactif', () => {
      render(<InstitutionsList />, { wrapper });
      expect(screen.getByText('Actif')).toBeInTheDocument();
      expect(screen.getByText('En attente')).toBeInTheDocument();
      expect(screen.getByText('Inactif')).toBeInTheDocument();
    });

    it('styles corrects pour Actif', () => {
      render(<InstitutionsList />, { wrapper });
      const el = screen.getByText('Actif');
      expect(el).toHaveClass('bg-emerald-50', 'text-emerald-600', 'border', 'border-emerald-200');
    });

    it('styles corrects pour En attente', () => {
      render(<InstitutionsList />, { wrapper });
      const el = screen.getByText('En attente');
      expect(el).toHaveClass('bg-amber-50', 'text-amber-600', 'border', 'border-amber-200');
    });

    it('styles corrects pour Inactif', () => {
      render(<InstitutionsList />, { wrapper });
      const el = screen.getByText('Inactif');
      expect(el).toHaveClass('bg-rose-50', 'text-rose-600', 'border', 'border-rose-200');
    });
  });

  describe('Colonnes Pays & Zones', () => {
    it('affiche le pays et le drapeau (ex: Sénégal)', () => {
      render(<InstitutionsList />, { wrapper });
      expect(screen.getAllByText(/Sénégal|Cameroun/).length).toBeGreaterThan(0);
    });

    it('affiche le nombre de zones', () => {
      render(<InstitutionsList />, { wrapper });
      expect(screen.getByText('2 zones')).toBeInTheDocument();
      expect(screen.getAllByText('1 zone').length).toBeGreaterThanOrEqual(1);
    });

    it('gère geographicZones null -> "0 zone"', () => {
      (useGetInstitutions as jest.Mock).mockReturnValue({
        institutions: [{ ...mockInstitutions[0], geographicZones: null }],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });
      render(<InstitutionsList />, { wrapper });
      expect(screen.getByText('0 zone')).toBeInTheDocument();
    });
  });

  describe('Recherche', () => {
    it('filtre par nom', async () => {
      const user = userEvent.setup();
      render(<InstitutionsList />, { wrapper });
      const input = screen.getByPlaceholderText('Rechercher une institution...');
      await user.type(input, 'Orange');
      expect(screen.getByText('Orange Money')).toBeInTheDocument();
      expect(screen.queryByText('Wave')).not.toBeInTheDocument();
      expect(screen.queryByText('MTN Money')).not.toBeInTheDocument();
    });

    it('filtre par site web', async () => {
      const user = userEvent.setup();
      render(<InstitutionsList />, { wrapper });
      const input = screen.getByPlaceholderText('Rechercher une institution...');
      await user.type(input, 'wave.com');
      expect(screen.getByText('Wave')).toBeInTheDocument();
      expect(screen.queryByText('Orange Money')).not.toBeInTheDocument();
    });

    it('filtre par description (case insensitive)', async () => {
      const user = userEvent.setup();
      render(<InstitutionsList />, { wrapper });
      const input = screen.getByPlaceholderText('Rechercher une institution...');
      await user.type(input, 'MOBILE');
      expect(screen.getByText('Orange Money')).toBeInTheDocument();
      expect(screen.getByText('MTN Money')).toBeInTheDocument();
      expect(screen.queryByText('Wave')).not.toBeInTheDocument();
    });

    it('retourne tout quand la recherche est vidée', async () => {
      const user = userEvent.setup();
      render(<InstitutionsList />, { wrapper });
      const input = screen.getByPlaceholderText('Rechercher une institution...');
      await user.type(input, 'Orange');
      await user.clear(input);
      expect(screen.getByText('Orange Money')).toBeInTheDocument();
      expect(screen.getByText('Wave')).toBeInTheDocument();
      expect(screen.getByText('MTN Money')).toBeInTheDocument();
    });

    it('affiche un état vide quand aucun résultat', async () => {
      const user = userEvent.setup();
      render(<InstitutionsList />, { wrapper });
      const input = screen.getByPlaceholderText('Rechercher une institution...');
      await user.type(input, 'BanqueQuiNExistePas');
      expect(screen.getByText('Aucune institution trouvée')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('affiche la barre de pagination et le texte de range', async () => {
      (useGetInstitutions as jest.Mock).mockReturnValue({
        institutions: mockInstitutions,
        pagination: { page: 1, totalPages: 5, total: 50, limit: 10 },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });
      render(<InstitutionsList />, { wrapper });

      // Trouver le conteneur du texte de pagination
      await waitFor(() => {
        const paginationText = screen.getByText((content, element) => {
          if (!element) return false;
          return (
            element.tagName.toLowerCase() === 'div' &&
            element.classList.contains('text-tertiary-400/60') &&
            content.includes('Affichage de') &&
            content.includes('résultats')
          );
        });
        expect(paginationText).toBeInTheDocument();
      });
    });

    it('change de page en cliquant sur 2 et rappelle le hook avec page:2', async () => {
      const user = userEvent.setup();
      (useGetInstitutions as jest.Mock).mockReturnValue({
        institutions: mockInstitutions,
        pagination: { page: 1, totalPages: 3, total: 30, limit: 10 },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });
      render(<InstitutionsList />, { wrapper });

      const btn2 = screen.getByText('2');
      await user.click(btn2);

      await waitFor(() => {
        expect(useGetInstitutions).toHaveBeenCalledWith({ page: 2, limit: 10 });
      });
    });

    it('désactive les boutons précédent/début en page 1', () => {
      (useGetInstitutions as jest.Mock).mockReturnValue({
        institutions: mockInstitutions,
        pagination: { page: 1, totalPages: 3, total: 30, limit: 10 },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });
      render(<InstitutionsList />, { wrapper });
      const buttons = screen.getAllByRole('button');
      const firstBtn = buttons.find(b => b.querySelector('[data-testid="icon-chevrons-left"]'))!;
      const prevBtn = buttons.find(b => b.querySelector('[data-testid="icon-chevron-left"]'))!;
      expect(firstBtn).toBeDisabled();
      expect(prevBtn).toBeDisabled();
    });

    it('désactive les boutons suivant/fin en dernière page', () => {
      (useGetInstitutions as jest.Mock).mockReturnValue({
        institutions: mockInstitutions,
        pagination: { page: 3, totalPages: 3, total: 30, limit: 10 },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });
      render(<InstitutionsList />, { wrapper });
      const buttons = screen.getAllByRole('button');
      const nextBtn = buttons.find(b => b.querySelector('[data-testid="icon-chevron-right"]'))!;
      const lastBtn = buttons.find(b => b.querySelector('[data-testid="icon-chevrons-right"]'))!;
      expect(nextBtn).toBeDisabled();
      expect(lastBtn).toBeDisabled();
    });

    it('affiche des ellipses quand beaucoup de pages', () => {
      (useGetInstitutions as jest.Mock).mockReturnValue({
        institutions: mockInstitutions,
        pagination: { page: 5, totalPages: 10, total: 100, limit: 10 },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });
      render(<InstitutionsList />, { wrapper });
      const ellipses = screen.getAllByText('...');
      expect(ellipses.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('États chargement / erreur / vide', () => {
    it('montre le loader quand isLoading', () => {
      (useGetInstitutions as jest.Mock).mockReturnValue({
        institutions: [],
        pagination: null,
        isLoading: true,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });
      render(<InstitutionsList />, { wrapper });
      expect(mockShowLoader).toHaveBeenCalled();
    });

    it('cache le loader quand pas en chargement', () => {
      render(<InstitutionsList />, { wrapper });
      expect(mockHideLoader).toHaveBeenCalled();
    });

    it('affiche le message vide quand pas de données', () => {
      (useGetInstitutions as jest.Mock).mockReturnValue({
        institutions: [],
        pagination: { page: 1, totalPages: 1, total: 0, limit: 10 },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });
      render(<InstitutionsList />, { wrapper });
      expect(screen.getByText('Aucune institution trouvée')).toBeInTheDocument();
    });

    it('affiche un message erreur et bouton Réessayer', async () => {
      const user = userEvent.setup();
      (useGetInstitutions as jest.Mock).mockReturnValue({
        institutions: [],
        pagination: null,
        isLoading: false,
        isError: true,
        error: { message: 'Network error' },
        refetch: mockRefetch,
      });
      render(<InstitutionsList />, { wrapper });
      expect(screen.getByText(/Erreur lors du chargement des institutions:/)).toBeInTheDocument();
      expect(screen.getByText(/Network error/)).toBeInTheDocument();

      await user.click(screen.getByText('Réessayer'));
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Liens & intégration modal', () => {
    it('lien vers la page détail', () => {
      render(<InstitutionsList />, { wrapper });
      const link = screen.getByText('Orange Money').closest('a');
      expect(link).toHaveAttribute('href', '/institutions/1');
    });

    it('ouvre la modal via évènement global', async () => {
      render(<InstitutionsList />, { wrapper });
      globalThis.dispatchEvent(new CustomEvent('open-institution-modal'));
      await waitFor(() => {
        expect(screen.getByTestId('institution-modal')).toBeInTheDocument();
        expect(screen.getByText('New Institution')).toBeInTheDocument();
      });
    });

    it('appel du refresh -> refetch', async () => {
      render(<InstitutionsList />, { wrapper });
      // ouvrir la modal pour injecter refresh
      globalThis.dispatchEvent(new CustomEvent('open-institution-modal'));
      await waitFor(() => expect((globalThis as any).__lastInstitutionModalRefresh).toBeDefined());
      (globalThis as any).__lastInstitutionModalRefresh();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Divers / robustesse', () => {
    it('affiche le site si description vide, sinon — si les deux vides', () => {
      (useGetInstitutions as jest.Mock).mockReturnValue({
        institutions: [
          { ...mockInstitutions[0], description: '' },
          { ...mockInstitutions[1], description: '', website: '' },
        ],
        pagination: { page: 1, totalPages: 1, total: 2, limit: 10 },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });
      render(<InstitutionsList />, { wrapper });
      expect(screen.getByText('https://orange.sn')).toBeInTheDocument();
      expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    });
  });
});
