import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';
import ModulesPageContent from '@/components/admin/modules/modules-page-content';
import { DifficultyLevel, ModuleStatus } from '@/types/modules/module';
// eslint-disable-next-line no-duplicate-imports
import type { Module } from '@/types/modules/module';

// Mock des fonctions de chargement
const mockShowLoader = jest.fn();
const mockHideLoader = jest.fn();

jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: () => ({
    showLoader: mockShowLoader,
    hideLoader: mockHideLoader,
  }),
}));

// Mock du hook useGetModules (API distante)
const mockRefetch = jest.fn();
let mockModules: Module[] = [];
const mockUseGetModules = jest.fn();

jest.mock('@/hooks/module/useGetModules', () => ({
  useGetModules: (args: any) => mockUseGetModules(args),
}));

// Mock des composants enfants utilisés par ModulesPageContent
jest.mock('@/components/admin/modules/filters-bar', () => ({
  __esModule: true,
  default: function MockFiltersBar({ onNewClick }: { onNewClick?: () => void }) {
    return (
      <button data-testid='new-button' onClick={onNewClick}>
        Nouveau module
      </button>
    );
  },
}));

jest.mock('@/components/admin/modules/module-list', () => ({
  __esModule: true,
  default: function MockModuleList({
    modules,
    pagination,
    isLoading,
    isError,
    onPageChange,
  }: {
    modules: Module[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
    isLoading: boolean;
    isError: boolean;
    onPageChange?: (page: number) => void;
  }) {
    return (
      <div data-testid='module-list'>
        <div data-testid='module-count'>{modules.length}</div>
        <div data-testid='pagination-page'>{pagination.page}</div>
        <div data-testid='pagination-total-pages'>{pagination.totalPages}</div>
        {isLoading && <span data-testid='list-loading'>loading</span>}
        {isError && <span data-testid='list-error'>error</span>}
        <button data-testid='go-to-page-2' onClick={() => onPageChange && onPageChange(2)}>
          Aller page 2
        </button>
      </div>
    );
  },
}));

jest.mock('@/components/admin/modules/stats-cards', () => ({
  __esModule: true,
  default: function MockStatsCards({
    totalModules,
    publishedModules,
    totalQuizzes,
    totalLearners,
  }: {
    totalModules: number;
    publishedModules: number;
    totalQuizzes: number;
    totalLearners: number;
  }) {
    return (
      <div data-testid='stats-cards'>
        <span data-testid='stats-total-modules'>{totalModules}</span>
        <span data-testid='stats-published-modules'>{publishedModules}</span>
        <span data-testid='stats-total-quizzes'>{totalQuizzes}</span>
        <span data-testid='stats-total-learners'>{totalLearners}</span>
      </div>
    );
  },
}));

jest.mock('@/components/admin/modules/module-dialog', () => ({
  __esModule: true,
  default: function MockModuleDialog({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid='module-dialog'>
        <button data-testid='close-dialog' onClick={onClose}>
          Fermer
        </button>
      </div>
    );
  },
}));

describe('ModulesPageContent', () => {
  const createTestModule = (
    id: number,
    title: string,
    status: ModuleStatus = ModuleStatus.PUBLISHED
  ): Module => ({
    id: id.toString(),
    title,
    description: `Description de ${title}`,
    thematics: 'General',
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: 60,
    status,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  });

  beforeEach(() => {
    mockModules = [];
    mockRefetch.mockReset();
    mockShowLoader.mockReset();
    mockHideLoader.mockReset();

    mockUseGetModules.mockImplementation(() => ({
      modules: mockModules,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    }));
  });

  describe('Rendu de base', () => {
    it('affiche les principaux blocs (stats, filtre, liste)', () => {
      render(<ModulesPageContent />);

      expect(screen.getByTestId('stats-cards')).toBeInTheDocument();
      expect(screen.getByTestId('new-button')).toBeInTheDocument();
      expect(screen.getByTestId('module-list')).toBeInTheDocument();

      // useGetModules doit être appelé avec la pagination API (page=1, limit=100)
      expect(mockUseGetModules).toHaveBeenCalledWith({ page: 1, limit: 100 });
    });
  });

  describe('Statistiques', () => {
    it('calcule et passe correctement totalModules et publishedModules à StatsCards', () => {
      mockModules = [
        createTestModule(1, 'Module 1', ModuleStatus.PUBLISHED),
        createTestModule(2, 'Module 2', ModuleStatus.DRAFT),
        createTestModule(3, 'Module 3', ModuleStatus.PUBLISHED),
      ];

      render(<ModulesPageContent />);

      expect(screen.getByTestId('stats-total-modules')).toHaveTextContent('3');
      expect(screen.getByTestId('stats-published-modules')).toHaveTextContent('2');

      // Valeurs en dur dans le composant
      expect(screen.getByTestId('stats-total-quizzes')).toHaveTextContent('20');
      expect(screen.getByTestId('stats-total-learners')).toHaveTextContent('688');
    });
  });

  describe('Pagination locale', () => {
    it('pagine localement les modules et met à jour la page', async () => {
      mockModules = Array.from({ length: 10 }, (_, index) =>
        createTestModule(index + 1, `Module ${index + 1}`)
      );

      render(<ModulesPageContent />);
      const user = userEvent.setup();

      // itemsPerPage = 6 => première page
      expect(screen.getByTestId('module-count')).toHaveTextContent('6');
      expect(screen.getByTestId('pagination-page')).toHaveTextContent('1');
      expect(screen.getByTestId('pagination-total-pages')).toHaveTextContent('2');

      // Simule un changement de page via ModuleList
      await user.click(screen.getByTestId('go-to-page-2'));

      expect(screen.getByTestId('pagination-page')).toHaveTextContent('2');
      // 10 modules au total, 6 sur la première page => 4 sur la deuxième
      expect(screen.getByTestId('module-count')).toHaveTextContent('4');
    });
  });

  describe('Gestion du dialogue', () => {
    it('ouvre le dialogue au clic sur le bouton "Nouveau module"', async () => {
      render(<ModulesPageContent />);
      const user = userEvent.setup();

      await user.click(screen.getByTestId('new-button'));
      expect(screen.getByTestId('module-dialog')).toBeInTheDocument();
    });

    it('ferme le dialogue et déclenche un refetch', async () => {
      render(<ModulesPageContent />);
      const user = userEvent.setup();

      await user.click(screen.getByTestId('new-button'));
      await user.click(screen.getByTestId('close-dialog'));

      await waitFor(() => {
        expect(screen.queryByTestId('module-dialog')).not.toBeInTheDocument();
      });
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Gestion du chargement global', () => {
    it('appelle showLoader quand les modules sont en cours de chargement', async () => {
      mockUseGetModules.mockImplementationOnce(() => ({
        modules: [],
        isLoading: true,
        isError: false,
        refetch: mockRefetch,
      }));

      render(<ModulesPageContent />);

      await waitFor(() => {
        expect(mockShowLoader).toHaveBeenCalled();
      });
    });

    it('appelle hideLoader quand le chargement est terminé', async () => {
      mockUseGetModules.mockImplementationOnce(() => ({
        modules: [],
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      }));

      render(<ModulesPageContent />);

      await waitFor(() => {
        expect(mockHideLoader).toHaveBeenCalled();
      });
    });
  });

  describe('Gestion des erreurs', () => {
    it("passe isError à ModuleList en cas d'erreur", () => {
      mockUseGetModules.mockImplementationOnce(() => ({
        modules: [],
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      }));

      render(<ModulesPageContent />);

      expect(screen.getByTestId('list-error')).toBeInTheDocument();
    });
  });

  describe('Gestion des modules vides', () => {
    it('affiche 0 modules quand la liste est vide', () => {
      mockModules = [];

      render(<ModulesPageContent />);

      expect(screen.getByTestId('module-count')).toHaveTextContent('0');
      expect(screen.getByTestId('stats-total-modules')).toHaveTextContent('0');
      expect(screen.getByTestId('stats-published-modules')).toHaveTextContent('0');
    });

    it('gère correctement modules undefined', () => {
      mockUseGetModules.mockImplementationOnce(() => ({
        modules: undefined,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      }));

      render(<ModulesPageContent />);

      expect(screen.getByTestId('module-count')).toHaveTextContent('0');
    });
  });

  describe('Pagination avancée', () => {
    it('calcule correctement le nombre total de pages', () => {
      mockModules = Array.from({ length: 18 }, (_, i) =>
        createTestModule(i + 1, `Module ${i + 1}`)
      );

      render(<ModulesPageContent />);

      // 18 modules / 6 par page = 3 pages
      expect(screen.getByTestId('pagination-total-pages')).toHaveTextContent('3');
    });

    it('affiche tous les modules sur une seule page si <= 6', () => {
      mockModules = Array.from({ length: 5 }, (_, i) => createTestModule(i + 1, `Module ${i + 1}`));

      render(<ModulesPageContent />);

      expect(screen.getByTestId('module-count')).toHaveTextContent('5');
      expect(screen.getByTestId('pagination-total-pages')).toHaveTextContent('1');
    });

    it('réinitialise le scroll au changement de page', async () => {
      const scrollToMock = jest.fn();
      window.scrollTo = scrollToMock;

      mockModules = Array.from({ length: 10 }, (_, i) =>
        createTestModule(i + 1, `Module ${i + 1}`)
      );

      render(<ModulesPageContent />);
      const user = userEvent.setup();

      await user.click(screen.getByTestId('go-to-page-2'));

      expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  describe('Calcul des statistiques', () => {
    it('compte uniquement les modules PUBLISHED', () => {
      mockModules = [
        createTestModule(1, 'Module 1', ModuleStatus.PUBLISHED),
        createTestModule(2, 'Module 2', ModuleStatus.DRAFT),
        createTestModule(3, 'Module 3', ModuleStatus.PUBLISHED),
        createTestModule(4, 'Module 4', ModuleStatus.ARCHIVED),
        createTestModule(5, 'Module 5', ModuleStatus.PUBLISHED),
      ];

      render(<ModulesPageContent />);

      expect(screen.getByTestId('stats-total-modules')).toHaveTextContent('5');
      expect(screen.getByTestId('stats-published-modules')).toHaveTextContent('3');
    });

    it('affiche les valeurs en dur pour totalQuizzes et totalLearners', () => {
      render(<ModulesPageContent />);

      expect(screen.getByTestId('stats-total-quizzes')).toHaveTextContent('20');
      expect(screen.getByTestId('stats-total-learners')).toHaveTextContent('688');
    });
  });

  describe('Structure du layout', () => {
    it('applique les bonnes classes au conteneur principal', () => {
      const { container } = render(<ModulesPageContent />);

      const mainDiv = container.querySelector('.min-h-screen.bg-gray-50.p-6');
      expect(mainDiv).toBeInTheDocument();
    });

    it('applique les bonnes classes au conteneur central', () => {
      const { container } = render(<ModulesPageContent />);

      const centerDiv = container.querySelector('.max-w-7xl.mx-auto');
      expect(centerDiv).toBeInTheDocument();
    });
  });

  describe('Interaction avec les hooks', () => {
    it('appelle useGetModules avec les bons paramètres', () => {
      render(<ModulesPageContent />);

      expect(mockUseGetModules).toHaveBeenCalledWith({
        page: 1,
        limit: 100,
      });
    });

    it('utilise refetch du hook useGetModules', async () => {
      render(<ModulesPageContent />);
      const user = userEvent.setup();

      await user.click(screen.getByTestId('new-button'));
      await user.click(screen.getByTestId('close-dialog'));

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  describe('Cas limites', () => {
    it('gère un très grand nombre de modules', () => {
      mockModules = Array.from({ length: 100 }, (_, i) =>
        createTestModule(i + 1, `Module ${i + 1}`)
      );

      render(<ModulesPageContent />);

      expect(screen.getByTestId('stats-total-modules')).toHaveTextContent('100');
      expect(screen.getByTestId('module-count')).toHaveTextContent('6'); // Première page
      expect(screen.getByTestId('pagination-total-pages')).toHaveTextContent('17'); // 100/6 arrondi
    });

    it('gère exactement 6 modules (une page complète)', () => {
      mockModules = Array.from({ length: 6 }, (_, i) => createTestModule(i + 1, `Module ${i + 1}`));

      render(<ModulesPageContent />);

      expect(screen.getByTestId('module-count')).toHaveTextContent('6');
      expect(screen.getByTestId('pagination-total-pages')).toHaveTextContent('1');
    });

    it('gère 7 modules (2 pages avec 1 module sur la seconde)', () => {
      mockModules = Array.from({ length: 7 }, (_, i) => createTestModule(i + 1, `Module ${i + 1}`));

      render(<ModulesPageContent />);

      expect(screen.getByTestId('pagination-total-pages')).toHaveTextContent('2');
    });
  });

  describe('État du dialogue', () => {
    it('le dialogue est fermé par défaut', () => {
      render(<ModulesPageContent />);

      expect(screen.queryByTestId('module-dialog')).not.toBeInTheDocument();
    });

    it('ouvre et ferme le dialogue plusieurs fois', async () => {
      render(<ModulesPageContent />);
      const user = userEvent.setup();

      // Ouvrir
      await user.click(screen.getByTestId('new-button'));
      expect(screen.getByTestId('module-dialog')).toBeInTheDocument();

      // Fermer
      await user.click(screen.getByTestId('close-dialog'));
      await waitFor(() => {
        expect(screen.queryByTestId('module-dialog')).not.toBeInTheDocument();
      });

      // Ouvrir à nouveau
      await user.click(screen.getByTestId('new-button'));
      expect(screen.getByTestId('module-dialog')).toBeInTheDocument();
    });
  });
});
