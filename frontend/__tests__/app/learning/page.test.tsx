import { render, screen, fireEvent } from '@testing-library/react';

import LearningPage from '@/app/(auth)/learning/page';
import { UserModuleStatus } from '@/types/learning-module';

// Mock the useGetLearningModules hook
const mockModules = [
  {
    id: '1',
    title: 'Module 1',
    description: 'Description 1',
    userStatus: UserModuleStatus.AVAILABLE,
    progress: 0,
  },
  {
    id: '2',
    title: 'Module 2',
    description: 'Description 2',
    userStatus: UserModuleStatus.IN_PROGRESS,
    progress: 50,
  },
  {
    id: '3',
    title: 'Module 3',
    description: 'Description 3',
    userStatus: UserModuleStatus.COMPLETED,
    progress: 100,
  },
  {
    id: '4',
    title: 'Module 4',
    description: 'Description 4',
    userStatus: UserModuleStatus.LOCKED,
    progress: 0,
  },
];

jest.mock('@/hooks/module/useGetLearningModules', () => ({
  useGetLearningModules: jest.fn(() => ({
    modules: mockModules,
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

// Mock the components
jest.mock('@/components/learning/module-card', () => ({
  ModuleCard: ({ module }: { module: { id: string; title: string } }) => (
    <div data-testid={`module-card-${module.id}`}>{module.title}</div>
  ),
}));

jest.mock('@/components/learning/module-filters', () => ({
  ModuleFilters: ({
    activeFilter,
    onFilterChange,
    counts,
  }: {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    counts: { all: number; available: number; inProgress: number; completed: number };
  }) => (
    <div data-testid='module-filters'>
      <span data-testid='active-filter'>{activeFilter}</span>
      <button data-testid='filter-all' onClick={() => onFilterChange('ALL')}>
        All ({counts.all})
      </button>
      <button data-testid='filter-available' onClick={() => onFilterChange('AVAILABLE')}>
        Available ({counts.available})
      </button>
      <button data-testid='filter-in-progress' onClick={() => onFilterChange('IN_PROGRESS')}>
        In Progress ({counts.inProgress})
      </button>
      <button data-testid='filter-completed' onClick={() => onFilterChange('COMPLETED')}>
        Completed ({counts.completed})
      </button>
    </div>
  ),
}));

jest.mock('@/components/learning/module-stats', () => ({
  ModuleStats: ({
    total,
    completed,
    inProgress,
    locked,
  }: {
    total: number;
    completed: number;
    inProgress: number;
    locked: number;
  }) => (
    <div data-testid='module-stats'>
      <span data-testid='stats-total'>{total}</span>
      <span data-testid='stats-completed'>{completed}</span>
      <span data-testid='stats-in-progress'>{inProgress}</span>
      <span data-testid='stats-locked'>{locked}</span>
    </div>
  ),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  BookOpen: () => <div data-testid='book-open-icon'>BookOpen</div>,
}));

// Mock Skeleton component
jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className: string }) => (
    <div data-testid='skeleton' className={className} />
  ),
}));

import { useGetLearningModules } from '@/hooks/module/useGetLearningModules';

const mockUseGetLearningModules = useGetLearningModules as jest.Mock;

describe('LearningPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetLearningModules.mockReturnValue({
      modules: mockModules,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  describe('Rendering', () => {
    it('renders the page header', () => {
      render(<LearningPage />);

      expect(screen.getByText("Plateforme d'apprentissage")).toBeInTheDocument();
      expect(screen.getByText('Modules de Formation')).toBeInTheDocument();
    });

    it('renders the page description', () => {
      render(<LearningPage />);

      expect(
        screen.getByText(
          'Développez vos compétences financières à votre rythme avec nos modules interactifs'
        )
      ).toBeInTheDocument();
    });

    it('renders the BookOpen icon', () => {
      render(<LearningPage />);

      expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
    });

    it('renders ModuleStats component with correct props', () => {
      render(<LearningPage />);

      expect(screen.getByTestId('module-stats')).toBeInTheDocument();
      expect(screen.getByTestId('stats-total')).toHaveTextContent('4');
      expect(screen.getByTestId('stats-completed')).toHaveTextContent('1');
      expect(screen.getByTestId('stats-in-progress')).toHaveTextContent('1');
      expect(screen.getByTestId('stats-locked')).toHaveTextContent('1');
    });

    it('renders ModuleFilters component', () => {
      render(<LearningPage />);

      expect(screen.getByTestId('module-filters')).toBeInTheDocument();
    });

    it('renders all module cards when filter is ALL', () => {
      render(<LearningPage />);

      expect(screen.getByTestId('module-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('module-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('module-card-3')).toBeInTheDocument();
      expect(screen.getByTestId('module-card-4')).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('renders skeletons when loading', () => {
      mockUseGetLearningModules.mockReturnValue({
        modules: [],
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<LearningPage />);

      const skeletons = screen.getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('does not render module cards when loading', () => {
      mockUseGetLearningModules.mockReturnValue({
        modules: [],
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<LearningPage />);

      expect(screen.queryByTestId('module-card-1')).not.toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('filters to show only available modules (non-locked)', () => {
      render(<LearningPage />);

      fireEvent.click(screen.getByTestId('filter-available'));

      // Module 4 is LOCKED, should not be shown
      expect(screen.getByTestId('module-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('module-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('module-card-3')).toBeInTheDocument();
      expect(screen.queryByTestId('module-card-4')).not.toBeInTheDocument();
    });

    it('filters to show only in-progress modules', () => {
      render(<LearningPage />);

      fireEvent.click(screen.getByTestId('filter-in-progress'));

      // Only Module 2 is IN_PROGRESS
      expect(screen.queryByTestId('module-card-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('module-card-2')).toBeInTheDocument();
      expect(screen.queryByTestId('module-card-3')).not.toBeInTheDocument();
      expect(screen.queryByTestId('module-card-4')).not.toBeInTheDocument();
    });

    it('filters to show only completed modules', () => {
      render(<LearningPage />);

      fireEvent.click(screen.getByTestId('filter-completed'));

      // Only Module 3 is COMPLETED
      expect(screen.queryByTestId('module-card-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('module-card-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('module-card-3')).toBeInTheDocument();
      expect(screen.queryByTestId('module-card-4')).not.toBeInTheDocument();
    });

    it('shows all modules when ALL filter is selected', () => {
      render(<LearningPage />);

      // First filter to something else
      fireEvent.click(screen.getByTestId('filter-completed'));
      // Then back to ALL
      fireEvent.click(screen.getByTestId('filter-all'));

      expect(screen.getByTestId('module-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('module-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('module-card-3')).toBeInTheDocument();
      expect(screen.getByTestId('module-card-4')).toBeInTheDocument();
    });

    it('updates active filter state', () => {
      render(<LearningPage />);

      expect(screen.getByTestId('active-filter')).toHaveTextContent('ALL');

      fireEvent.click(screen.getByTestId('filter-available'));
      expect(screen.getByTestId('active-filter')).toHaveTextContent('AVAILABLE');

      fireEvent.click(screen.getByTestId('filter-in-progress'));
      expect(screen.getByTestId('active-filter')).toHaveTextContent('IN_PROGRESS');

      fireEvent.click(screen.getByTestId('filter-completed'));
      expect(screen.getByTestId('active-filter')).toHaveTextContent('COMPLETED');
    });
  });

  describe('Counts calculation', () => {
    it('calculates correct counts for filters', () => {
      render(<LearningPage />);

      // Total: 4 modules
      expect(screen.getByTestId('filter-all')).toHaveTextContent('All (4)');
      // Available: 3 (all except LOCKED)
      expect(screen.getByTestId('filter-available')).toHaveTextContent('Available (3)');
      // In Progress: 1
      expect(screen.getByTestId('filter-in-progress')).toHaveTextContent('In Progress (1)');
      // Completed: 1
      expect(screen.getByTestId('filter-completed')).toHaveTextContent('Completed (1)');
    });
  });

  describe('Empty state', () => {
    it('handles empty modules array', () => {
      mockUseGetLearningModules.mockReturnValue({
        modules: [],
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<LearningPage />);

      expect(screen.getByTestId('stats-total')).toHaveTextContent('0');
      expect(screen.queryByTestId('module-card-1')).not.toBeInTheDocument();
    });
  });
});
