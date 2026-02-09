/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ModulesPageContent from '@/components/admin/modules/modules-page-content';
import { DifficultyLevel, ModuleStatus } from '@/types/modules/module';
// eslint-disable-next-line no-duplicate-imports
import type { Module } from '@/types/modules/module';

// =====================
// Mocks LoaderContext
// =====================
const mockShowLoader = jest.fn();
const mockHideLoader = jest.fn();

jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: () => ({
    showLoader: mockShowLoader,
    hideLoader: mockHideLoader,
  }),
}));

// =====================
// Mock useGetModules
// =====================
const mockRefetch = jest.fn();
let mockModules: Module[] | undefined = [];
const mockUseGetModules = jest.fn();

jest.mock('@/hooks/module/useGetModules', () => ({
  useGetModules: (args: any) => mockUseGetModules(args),
}));

// =====================
// Mock children components
// =====================
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
        <button data-testid='go-to-page-2' onClick={() => onPageChange?.(2)}>
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
    totalLessons,
    totalQuizzes,
    totalLearners,
    completionRate,
  }: {
    totalModules: number;
    publishedModules: number;
    totalLessons?: number;
    totalQuizzes: number;
    totalLearners: number;
    completionRate?: number;
  }) {
    return (
      <div data-testid='stats-cards'>
        <span data-testid='stats-total-modules'>{totalModules}</span>
        <span data-testid='stats-published-modules'>{publishedModules}</span>
        <span data-testid='stats-total-lessons'>{totalLessons ?? 0}</span>
        <span data-testid='stats-total-quizzes'>{totalQuizzes}</span>
        <span data-testid='stats-total-learners'>{totalLearners}</span>
        <span data-testid='stats-completion-rate'>{completionRate ?? 0}</span>
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

// =====================
// Helpers
// =====================
const createTestModule = (
  id: number,
  title: string,
  status: ModuleStatus = ModuleStatus.PUBLISHED,
  lessonsCount = 0,
  quizzesCount = 0,
  quizzesGlobalCount = 0
): Module =>
  ({
    id: id.toString(),
    title,
    description: `Description de ${title}`,
    thematics: 'General',
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: 60,
    status,
    imageMediaId: null,
    lessons: Array.from({ length: lessonsCount }, (_, i) => ({ id: `l-${id}-${i}` })),
    quizzes: Array.from({ length: quizzesCount }, (_, i) => ({ id: `q-${id}-${i}` })),
    quizzesGlobal: Array.from({ length: quizzesGlobalCount }, (_, i) => ({ id: `qg-${id}-${i}` })),
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  }) as any;

describe('ModulesPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockModules = [];
    mockUseGetModules.mockReset();

    mockUseGetModules.mockImplementation(() => ({
      modules: mockModules,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    }));
  });

  it('affiche les principaux blocs et appelle useGetModules avec { page:1, limit:100 }', () => {
    render(<ModulesPageContent />);

    expect(screen.getByTestId('stats-cards')).toBeInTheDocument();
    expect(screen.getByTestId('new-button')).toBeInTheDocument();
    expect(screen.getByTestId('module-list')).toBeInTheDocument();

    expect(mockUseGetModules).toHaveBeenCalledWith({ page: 1, limit: 100 });
  });

  it('calcule correctement les stats dynamiques', () => {
    mockModules = [
      createTestModule(1, 'Module 1', ModuleStatus.PUBLISHED, 2, 1, 1), // lessons=2, quizzes=2
      createTestModule(2, 'Module 2', ModuleStatus.DRAFT, 3, 0, 2), // lessons=3, quizzes=2
      createTestModule(3, 'Module 3', ModuleStatus.PUBLISHED, 1, 4, 0), // lessons=1, quizzes=4
    ];

    render(<ModulesPageContent />);

    // totalModules = 3
    expect(screen.getByTestId('stats-total-modules')).toHaveTextContent('3');
    // publishedModules = 2
    expect(screen.getByTestId('stats-published-modules')).toHaveTextContent('2');
    // totalLessons = 2+3+1 = 6
    expect(screen.getByTestId('stats-total-lessons')).toHaveTextContent('6');
    // totalQuizzes = (1+1) + (0+2) + (4+0) = 8
    expect(screen.getByTestId('stats-total-quizzes')).toHaveTextContent('8');
    // totalLearners / completionRate = 0 (valeurs fixes dans le composant)
    expect(screen.getByTestId('stats-total-learners')).toHaveTextContent('0');
    expect(screen.getByTestId('stats-completion-rate')).toHaveTextContent('0');
  });

  it('pagine localement (6 par page) et change de page via ModuleList', async () => {
    mockModules = Array.from({ length: 10 }, (_, i) => createTestModule(i + 1, `Module ${i + 1}`));

    render(<ModulesPageContent />);
    const user = userEvent.setup();

    expect(screen.getByTestId('module-count')).toHaveTextContent('6');
    expect(screen.getByTestId('pagination-page')).toHaveTextContent('1');
    expect(screen.getByTestId('pagination-total-pages')).toHaveTextContent('2');

    await user.click(screen.getByTestId('go-to-page-2'));

    expect(screen.getByTestId('pagination-page')).toHaveTextContent('2');
    expect(screen.getByTestId('module-count')).toHaveTextContent('4');
  });

  it('reset le scroll au changement de page', async () => {
    const scrollToMock = jest.fn();
    window.scrollTo = scrollToMock;

    mockModules = Array.from({ length: 10 }, (_, i) => createTestModule(i + 1, `Module ${i + 1}`));

    render(<ModulesPageContent />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId('go-to-page-2'));

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('ouvre le dialog au clic sur "Nouveau module"', async () => {
    render(<ModulesPageContent />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId('new-button'));
    expect(screen.getByTestId('module-dialog')).toBeInTheDocument();
  });

  it('ferme le dialog et déclenche refetch', async () => {
    render(<ModulesPageContent />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId('new-button'));
    await user.click(screen.getByTestId('close-dialog'));

    await waitFor(() => {
      expect(screen.queryByTestId('module-dialog')).not.toBeInTheDocument();
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('appelle showLoader quand isLoading=true', async () => {
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

  it('appelle hideLoader quand isLoading=false', async () => {
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

  it('gère modules undefined (modules -> [])', () => {
    mockUseGetModules.mockImplementationOnce(() => ({
      modules: undefined,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    }));

    render(<ModulesPageContent />);

    expect(screen.getByTestId('module-count')).toHaveTextContent('0');
    expect(screen.getByTestId('stats-total-modules')).toHaveTextContent('0');
    expect(screen.getByTestId('stats-total-lessons')).toHaveTextContent('0');
    expect(screen.getByTestId('stats-total-quizzes')).toHaveTextContent('0');
  });

  it('applique les bonnes classes au layout', () => {
    const { container } = render(<ModulesPageContent />);

    expect(container.querySelector('.min-h-screen.bg-gray-50.p-6')).toBeInTheDocument();
    expect(container.querySelector('.max-w-7xl.mx-auto')).toBeInTheDocument();
  });

  it('calcule correctement totalPages (18 modules => 3 pages)', () => {
    mockModules = Array.from({ length: 18 }, (_, i) => createTestModule(i + 1, `Module ${i + 1}`));

    render(<ModulesPageContent />);

    expect(screen.getByTestId('pagination-total-pages')).toHaveTextContent('3');
  });
});
