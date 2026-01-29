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
    imageUrl: `https://example.com/image-${id}.jpg`,
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
});
