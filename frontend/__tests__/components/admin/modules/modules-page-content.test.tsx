import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';
import ModulesPageContent from '@/components/admin/modules/modules-page-content';
import { ModuleStatus, Thematic, DifficultyLevel } from '@/types/modules/module';
// eslint-disable-next-line no-duplicate-imports
import type { Module } from '@/types/modules/module';
import type { PaginationResult } from '@/types/utils/pagination';

// Mock des fonctions de chargement
const mockShowLoader = jest.fn();
const mockHideLoader = jest.fn();

// Mock du contexte LoaderContext
jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: () => ({
    showLoader: mockShowLoader,
    hideLoader: mockHideLoader,
  }),
}));

// Mock du hook useGetModules
const mockRefetch = jest.fn();
let mockModules: Module[] = [];

jest.mock('@/hooks/module/useGetModules', () => ({
  useGetModules: jest.fn().mockImplementation(({ page = 1, limit = 3 }) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedModules = mockModules.slice(startIndex, endIndex);

    return {
      modules: paginatedModules,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(mockModules.length / limit),
        total: mockModules.length,
        limit,
        hasNextPage: endIndex < mockModules.length,
        hasPreviousPage: page > 1,
      } as PaginationResult,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    };
  }),
}));

// Mock des composants enfants
jest.mock('@/components/admin/modules/content-tabs', () => ({
  __esModule: true,
  default: function MockContentTabs({
    children,
  }: {
    children: (activeTab: 'modules' | 'quiz') => React.ReactNode;
  }) {
    return <div data-testid='content-tabs'>{children('modules')}</div>;
  },
}));

jest.mock('@/components/admin/modules/filters-bar', () => ({
  __esModule: true,
  default: function MockFiltersBar(props: any) {
    return (
      <div data-testid='filters-bar'>
        <input
          data-testid='search-input'
          value={props.searchValue || ''}
          onChange={e => props.onSearchChange?.(e.target.value)}
        />
        <button data-testid='new-button' onClick={props.onNewClick}>
          {props.buttonLabel}
        </button>
      </div>
    );
  },
}));

jest.mock('@/components/admin/modules/module-list', () => ({
  __esModule: true,
  default: function MockModuleList({ modules }: { modules: Module[] }) {
    return (
      <div data-testid='module-list'>
        {modules.map(module => (
          <div key={module.id} data-testid={`module-${module.id}`}>
            {module.title}
          </div>
        ))}
      </div>
    );
  },
}));

jest.mock('@/components/admin/modules/stats-cards', () => ({
  __esModule: true,
  default: function MockStatsCards(props: any) {
    return (
      <div data-testid='stats-cards'>
        <div data-testid='total-modules'>{props.totalModules}</div>
        <div data-testid='published-modules'>{props.publishedModules}</div>
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
        <button onClick={onClose} data-testid='close-dialog'>
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
    status = ModuleStatus.PUBLISHED
  ): Module => ({
    id: id.toString(),
    title,
    description: `Description de ${title}`,
    thematics: [Thematic.FINANCIAL_EDUCATION],
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: 60,
    status,
    imageUrl: `https://example.com/image-${id}.jpg`,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  });

  beforeEach(() => {
    mockModules = [];
    jest.clearAllMocks();
  });

  describe('Rendu initial', () => {
    it('affiche les composants principaux', () => {
      render(<ModulesPageContent />);

      expect(screen.getByTestId('content-tabs')).toBeInTheDocument();
      expect(screen.getByTestId('filters-bar')).toBeInTheDocument();
      expect(screen.getByTestId('stats-cards')).toBeInTheDocument();
      expect(screen.getByTestId('module-list')).toBeInTheDocument();
    });

    it('affiche correctement les statistiques', () => {
      mockModules = [
        createTestModule(1, 'Module 1', ModuleStatus.PUBLISHED),
        createTestModule(2, 'Module 2', ModuleStatus.DRAFT),
        createTestModule(3, 'Module 3', ModuleStatus.PUBLISHED),
      ];

      render(<ModulesPageContent />);

      expect(screen.getByTestId('total-modules')).toHaveTextContent('3');
      expect(screen.getByTestId('published-modules')).toHaveTextContent('2');
    });
  });

  describe('Gestion du dialogue', () => {
    it('ouvre le dialogue au clic sur le bouton nouveau', async () => {
      render(<ModulesPageContent />);
      const user = userEvent.setup();

      await user.click(screen.getByTestId('new-button'));
      expect(screen.getByTestId('module-dialog')).toBeInTheDocument();
    });

    it('ferme le dialogue et actualise la liste', async () => {
      render(<ModulesPageContent />);
      const user = userEvent.setup();

      await user.click(screen.getByTestId('new-button'));
      await user.click(screen.getByTestId('close-dialog'));

      await waitFor(() => {
        expect(screen.queryByTestId('module-dialog')).not.toBeInTheDocument();
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  describe('Recherche et filtres', () => {
    it('permet la recherche de modules', async () => {
      mockModules = [createTestModule(1, 'Premier module'), createTestModule(2, 'Deuxième module')];

      render(<ModulesPageContent />);
      const user = userEvent.setup();

      await user.type(screen.getByTestId('search-input'), 'Premier');

      expect(screen.getByText('Premier module')).toBeInTheDocument();
    });
  });

  describe('Gestion du chargement', () => {
    it('gère correctement les états de chargement', () => {
      const useGetModules = jest.requireMock('@/hooks/module/useGetModules').useGetModules;
      useGetModules.mockImplementationOnce(() => ({
        modules: [],
        pagination: { currentPage: 1, totalPages: 0, total: 0, limit: 3 },
        isLoading: true,
        isError: false,
        refetch: jest.fn(),
      }));

      render(<ModulesPageContent />);

      expect(mockShowLoader).toHaveBeenCalled();
    });
  });
});
