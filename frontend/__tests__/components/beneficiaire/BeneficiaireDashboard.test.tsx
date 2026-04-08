import { useUser } from '@clerk/nextjs';
import { render, screen } from '@testing-library/react';

import BeneficiaireDashboard from '@/components/beneficiaire/BeneficiaireDashboard';

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

// Mock useBeneficiaryDashboardStats
const defaultStats = {
  modulesCompleted: { current: 8, total: 26 },
  learningTime: '24h 30m',
  quizzesPassed: { current: 12, total: 15 },
  globalProgress: 75,
};
const defaultModuleStats = {
  completed: 8,
  inProgress: 5,
  notStarted: 13,
  total: 26,
};

jest.mock('@/hooks/beneficiary/useBeneficiaryDashboardStats', () => ({
  useBeneficiaryDashboardStats: jest.fn(),
}));

import { useBeneficiaryDashboardStats } from '@/hooks/beneficiary/useBeneficiaryDashboardStats';

const useBeneficiaryDashboardStatsMock = useBeneficiaryDashboardStats as jest.Mock;

// Mock Chart Components
jest.mock('@/components/beneficiaire/ChartComponents', () => ({
  StatCard: ({ icon, value, label, trend, progress }: any) => (
    <div data-testid='stat-card'>
      <div data-testid='stat-icon'>{icon}</div>
      <div data-testid='stat-value'>{value}</div>
      <div data-testid='stat-label'>{label}</div>
      {trend && <div data-testid='stat-trend'>{trend}</div>}
      {progress !== undefined && <div data-testid='stat-progress'>{progress}</div>}
    </div>
  ),
  DonutChart: ({ data, title }: any) => (
    <div data-testid='donut-chart'>
      <div data-testid='chart-title'>{title}</div>
      <div data-testid='chart-data'>{JSON.stringify(data)}</div>
    </div>
  ),
  MonthlyProgressLineChart: ({ data, title }: any) => (
    <div data-testid='line-chart'>
      <div data-testid='chart-title'>{title}</div>
      <div data-testid='chart-data'>{JSON.stringify(data)}</div>
    </div>
  ),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  BookOpen: () => <div data-testid='icon-book-open'>BookOpen</div>,
  Clock: () => <div data-testid='icon-clock'>Clock</div>,
  Award: () => <div data-testid='icon-award'>Award</div>,
  TrendingUp: () => <div data-testid='icon-trending-up'>TrendingUp</div>,
}));

describe('BeneficiaireDashboard', () => {
  const mockUser = {
    id: 'user_123',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    emailAddresses: [{ emailAddress: 'john.doe@example.com' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: mockUser,
      isLoaded: true,
      isSignedIn: true,
    });
    useBeneficiaryDashboardStatsMock.mockReturnValue({
      stats: defaultStats,
      moduleStats: defaultModuleStats,
      isLoading: false,
    });
  });

  describe('Loading states', () => {
    it('should show loading message when Clerk user is not loaded', () => {
      (useUser as jest.Mock).mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      });

      render(<BeneficiaireDashboard />);

      expect(screen.getByText('Chargement du tableau de bord...')).toBeInTheDocument();
    });

    it('should show loading statistics when data is loading', () => {
      useBeneficiaryDashboardStatsMock.mockReturnValue({
        stats: defaultStats,
        moduleStats: defaultModuleStats,
        isLoading: true,
      });

      render(<BeneficiaireDashboard />);

      expect(screen.getByText('Chargement des statistiques...')).toBeInTheDocument();
    });

    it('should render dashboard when user and stats are loaded', () => {
      render(<BeneficiaireDashboard />);

      expect(screen.queryByText(/Chargement/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Bonjour/i)).toBeInTheDocument();
    });
  });

  describe('User information display', () => {
    it('should display welcome message with user first name', () => {
      render(<BeneficiaireDashboard userId='user_123' />);

      expect(screen.getByText(/Bonjour, John/)).toBeInTheDocument();
    });

    it('should display fallback name when user has no firstName', () => {
      (useUser as jest.Mock).mockReturnValue({
        user: { ...mockUser, firstName: null },
        isLoaded: true,
        isSignedIn: true,
      });

      render(<BeneficiaireDashboard />);

      expect(screen.getByText(/Bonjour, Bénéficiaire/)).toBeInTheDocument();
    });

    it('should display subtitle text', () => {
      render(<BeneficiaireDashboard />);

      expect(
        screen.getByText('Voici un résumé de votre activité et de vos progrès.')
      ).toBeInTheDocument();
    });

    it('should handle user with minimal data', () => {
      (useUser as jest.Mock).mockReturnValue({
        user: { id: 'user_123' },
        isLoaded: true,
        isSignedIn: true,
      });

      render(<BeneficiaireDashboard />);

      expect(screen.getByText(/Bonjour, Bénéficiaire/)).toBeInTheDocument();
    });
  });

  describe('Stats cards rendering', () => {
    it('should render all four stat cards', () => {
      render(<BeneficiaireDashboard />);

      const statCards = screen.getAllByTestId('stat-card');
      expect(statCards).toHaveLength(4);
    });

    it('should render modules completed stat', () => {
      render(<BeneficiaireDashboard />);

      const labels = screen.getAllByTestId('stat-label');
      const values = screen.getAllByTestId('stat-value');

      expect(labels[0]).toHaveTextContent('Modules completés');
      expect(values[0]).toHaveTextContent('8/26');
    });

    it('should render learning time stat', () => {
      render(<BeneficiaireDashboard />);

      const labels = screen.getAllByTestId('stat-label');
      const values = screen.getAllByTestId('stat-value');

      expect(labels[1]).toHaveTextContent("Temps d'apprentissage");
      expect(values[1]).toHaveTextContent('24h 30m');
    });

    it('should render quizzes passed stat', () => {
      render(<BeneficiaireDashboard />);

      const labels = screen.getAllByTestId('stat-label');
      const values = screen.getAllByTestId('stat-value');

      expect(labels[2]).toHaveTextContent('Quiz réussis');
      expect(values[2]).toHaveTextContent('12/15');
    });

    it('should render global progress stat', () => {
      render(<BeneficiaireDashboard />);

      const labels = screen.getAllByTestId('stat-label');
      const values = screen.getAllByTestId('stat-value');

      expect(labels[3]).toHaveTextContent('Progression globale');
      expect(values[3]).toHaveTextContent('75%');
    });

    it('should render icons for each stat card', () => {
      render(<BeneficiaireDashboard />);

      expect(screen.getByTestId('icon-book-open')).toBeInTheDocument();
      expect(screen.getByTestId('icon-clock')).toBeInTheDocument();
      expect(screen.getByTestId('icon-award')).toBeInTheDocument();
      expect(screen.getByTestId('icon-trending-up')).toBeInTheDocument();
    });

    it('should render trend indicators', () => {
      render(<BeneficiaireDashboard />);

      const trends = screen.getAllByTestId('stat-trend');
      expect(trends.length).toBeGreaterThan(0);
    });

    it('should render progress values', () => {
      render(<BeneficiaireDashboard />);

      const progressBars = screen.getAllByTestId('stat-progress');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('should compute correct trend text for modules completed', () => {
      render(<BeneficiaireDashboard />);

      const trends = screen.getAllByTestId('stat-trend');
      expect(trends[0]).toHaveTextContent('8 terminés');
    });

    it('should compute correct trend text for quiz success rate', () => {
      render(<BeneficiaireDashboard />);

      const trends = screen.getAllByTestId('stat-trend');
      // 12/15 * 100 = 80
      expect(trends[2]).toHaveTextContent('80% de réussite');
    });

    it('should compute correct trend text for global progress in progress', () => {
      render(<BeneficiaireDashboard />);

      const trends = screen.getAllByTestId('stat-trend');
      expect(trends[3]).toHaveTextContent('En progression');
    });
  });

  describe('Charts rendering', () => {
    it('should render both charts', () => {
      render(<BeneficiaireDashboard />);

      expect(screen.getByTestId('donut-chart')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should render line chart with correct title', () => {
      render(<BeneficiaireDashboard />);

      const chartTitles = screen.getAllByTestId('chart-title');
      expect(chartTitles[0]).toHaveTextContent('Progression mensuelle');
    });

    it('should render line chart with empty data array', () => {
      render(<BeneficiaireDashboard />);

      const chartData = screen.getAllByTestId('chart-data')[0];
      const data = JSON.parse(chartData.textContent || '[]');

      expect(data).toEqual([]);
    });

    it('should render donut chart with correct title', () => {
      render(<BeneficiaireDashboard />);

      const chartTitles = screen.getAllByTestId('chart-title');
      expect(chartTitles[1]).toHaveTextContent('Répartition des modules');
    });

    it('should render donut chart with module data', () => {
      render(<BeneficiaireDashboard />);

      const chartData = screen.getAllByTestId('chart-data')[1];
      const data = JSON.parse(chartData.textContent || '[]');

      expect(data).toHaveLength(3);
      expect(data[0]).toEqual({ name: 'Complétés', value: 8, color: '#2ECC71' });
      expect(data[1]).toEqual({ name: 'En cours', value: 5, color: '#93C5FD' });
      expect(data[2]).toEqual({ name: 'Non commencés', value: 13, color: '#E5E7EB' });
    });
  });

  describe('Layout structure', () => {
    it('should render heading', () => {
      render(<BeneficiaireDashboard />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should render stats grid with four cards', () => {
      render(<BeneficiaireDashboard />);

      const statCards = screen.getAllByTestId('stat-card');
      expect(statCards.length).toBe(4);
    });

    it('should render charts section', () => {
      render(<BeneficiaireDashboard />);

      expect(screen.getByTestId('donut-chart')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Data calculations', () => {
    it('should calculate module completion progress percentage', () => {
      render(<BeneficiaireDashboard />);

      const progressBars = screen.getAllByTestId('stat-progress');
      // 8/26 * 100 = 30.769...
      expect(Number(progressBars[0].textContent)).toBeCloseTo(30.77, 0);
    });

    it('should format learning time correctly', () => {
      render(<BeneficiaireDashboard />);

      const timeStat = screen.getAllByTestId('stat-value')[1];
      expect(timeStat).toHaveTextContent('24h 30m');
    });

    it('should calculate quiz progress percentage', () => {
      render(<BeneficiaireDashboard />);

      const progressBars = screen.getAllByTestId('stat-progress');
      // 12/15 * 100 = 80
      expect(progressBars[1]).toHaveTextContent('80');
    });

    it('should pass global progress directly as progress value', () => {
      render(<BeneficiaireDashboard />);

      const progressBars = screen.getAllByTestId('stat-progress');
      expect(progressBars[2]).toHaveTextContent('75');
    });
  });

  describe('Responsive behavior', () => {
    it('should render grid layout for stats', () => {
      const { container } = render(<BeneficiaireDashboard />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('should render responsive chart containers', () => {
      const { container } = render(<BeneficiaireDashboard />);

      const charts = container.querySelectorAll(
        '[data-testid="donut-chart"], [data-testid="line-chart"]'
      );
      expect(charts.length).toBe(2);
    });
  });

  describe('Edge cases', () => {
    it('should handle missing user data gracefully', () => {
      (useUser as jest.Mock).mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      });

      render(<BeneficiaireDashboard />);

      expect(screen.getByText('Chargement du tableau de bord...')).toBeInTheDocument();
    });

    it('should handle zero completed modules', () => {
      useBeneficiaryDashboardStatsMock.mockReturnValue({
        stats: {
          modulesCompleted: { current: 0, total: 10 },
          learningTime: '0h 0m',
          quizzesPassed: { current: 0, total: 5 },
          globalProgress: 0,
        },
        moduleStats: { completed: 0, inProgress: 0, notStarted: 10, total: 10 },
        isLoading: false,
      });

      render(<BeneficiaireDashboard />);

      const statCards = screen.getAllByTestId('stat-card');
      expect(statCards).toHaveLength(4);

      const values = screen.getAllByTestId('stat-value');
      expect(values[0]).toHaveTextContent('0/10');
      expect(values[3]).toHaveTextContent('0%');
    });

    it('should show "Aucun terminé" trend when no modules completed', () => {
      useBeneficiaryDashboardStatsMock.mockReturnValue({
        stats: {
          modulesCompleted: { current: 0, total: 10 },
          learningTime: '0h 0m',
          quizzesPassed: { current: 0, total: 5 },
          globalProgress: 0,
        },
        moduleStats: { completed: 0, inProgress: 0, notStarted: 10, total: 10 },
        isLoading: false,
      });

      render(<BeneficiaireDashboard />);

      const trends = screen.getAllByTestId('stat-trend');
      expect(trends[0]).toHaveTextContent('Aucun terminé');
    });

    it('should show "Pas encore commencé" when global progress is 0', () => {
      useBeneficiaryDashboardStatsMock.mockReturnValue({
        stats: {
          modulesCompleted: { current: 0, total: 10 },
          learningTime: '0h 0m',
          quizzesPassed: { current: 0, total: 0 },
          globalProgress: 0,
        },
        moduleStats: { completed: 0, inProgress: 0, notStarted: 10, total: 10 },
        isLoading: false,
      });

      render(<BeneficiaireDashboard />);

      const trends = screen.getAllByTestId('stat-trend');
      expect(trends[3]).toHaveTextContent('Pas encore commencé');
    });

    it('should show "Tout est complété !" when global progress is 100', () => {
      useBeneficiaryDashboardStatsMock.mockReturnValue({
        stats: {
          modulesCompleted: { current: 10, total: 10 },
          learningTime: '50h 0m',
          quizzesPassed: { current: 10, total: 10 },
          globalProgress: 100,
        },
        moduleStats: { completed: 10, inProgress: 0, notStarted: 0, total: 10 },
        isLoading: false,
      });

      render(<BeneficiaireDashboard />);

      const trends = screen.getAllByTestId('stat-trend');
      expect(trends[3]).toHaveTextContent('Tout est complété !');
    });

    it('should handle zero total modules without division errors', () => {
      useBeneficiaryDashboardStatsMock.mockReturnValue({
        stats: {
          modulesCompleted: { current: 0, total: 0 },
          learningTime: '0h 0m',
          quizzesPassed: { current: 0, total: 0 },
          globalProgress: 0,
        },
        moduleStats: { completed: 0, inProgress: 0, notStarted: 0, total: 0 },
        isLoading: false,
      });

      render(<BeneficiaireDashboard />);

      const statCards = screen.getAllByTestId('stat-card');
      expect(statCards).toHaveLength(4);
      expect(screen.getAllByTestId('stat-value')[0]).toHaveTextContent('0/0');
    });

    it('should render charts even with zero module stats', () => {
      useBeneficiaryDashboardStatsMock.mockReturnValue({
        stats: {
          modulesCompleted: { current: 0, total: 0 },
          learningTime: '0h 0m',
          quizzesPassed: { current: 0, total: 0 },
          globalProgress: 0,
        },
        moduleStats: { completed: 0, inProgress: 0, notStarted: 0, total: 0 },
        isLoading: false,
      });

      render(<BeneficiaireDashboard />);

      expect(screen.getByTestId('donut-chart')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<BeneficiaireDashboard />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it('should render with proper structure', () => {
      const { container } = render(<BeneficiaireDashboard />);

      expect(container.querySelector('div.min-h-screen')).toBeInTheDocument();
      expect(container.querySelector('h1')).toBeInTheDocument();
    });

    it('should have accessible stat cards with content', () => {
      render(<BeneficiaireDashboard />);

      const statCards = screen.getAllByTestId('stat-card');
      statCards.forEach(card => {
        expect(card).toHaveTextContent(/./);
      });
    });
  });

  describe('Component integration', () => {
    it('should call Clerk useUser hook', () => {
      render(<BeneficiaireDashboard userId='user_123' />);

      expect(useUser).toHaveBeenCalled();
      expect(screen.getByText(/John/i)).toBeInTheDocument();
    });

    it('should pass correct props to StatCard', () => {
      render(<BeneficiaireDashboard />);

      const statCards = screen.getAllByTestId('stat-card');
      expect(statCards[0]).toHaveTextContent('Modules completés');
      expect(statCards[0]).toHaveTextContent('8/26');
    });

    it('should pass correct props to DonutChart', () => {
      render(<BeneficiaireDashboard />);

      const donutChart = screen.getByTestId('donut-chart');
      expect(donutChart).toHaveTextContent('Répartition des modules');
    });

    it('should pass correct props to MonthlyProgressLineChart', () => {
      render(<BeneficiaireDashboard />);

      const lineChart = screen.getByTestId('line-chart');
      expect(lineChart).toHaveTextContent('Progression mensuelle');
    });
  });

  describe('Mock data structure', () => {
    it('should use consistent mock data for stat values', () => {
      render(<BeneficiaireDashboard />);

      expect(screen.getByText('8/26')).toBeInTheDocument();
      expect(screen.getByText('24h 30m')).toBeInTheDocument();
      expect(screen.getByText('12/15')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should have valid chart data structure', () => {
      render(<BeneficiaireDashboard />);

      const chartData = screen.getAllByTestId('chart-data');
      chartData.forEach(data => {
        const parsed = JSON.parse(data.textContent || '[]');
        expect(Array.isArray(parsed)).toBe(true);
      });
    });
  });
});
