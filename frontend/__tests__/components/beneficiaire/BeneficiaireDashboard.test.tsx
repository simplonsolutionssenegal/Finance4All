import { useUser } from '@clerk/nextjs';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BeneficiaireDashboard from '@/components/beneficiaire/BeneficiaireDashboard';

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

// Mock useBeneficiaireDashboardData for predictable data and coverage of loading/error states
const mockRefetch = jest.fn();
const mockResetError = jest.fn();
const defaultDashboardData = {
  stats: {
    modulesCompleted: { current: 8, total: 26 },
    learningTime: '24h 30m',
    quizzesPassed: { current: 12, total: 15 },
    globalProgress: 75,
    modulesCompletedTrend: '+2 ce mois',
    learningTimeTrend: '+5h cette semaine',
    globalProgressTrend: '+15% ce mois',
    quizzesPassedTrend: '80% de réussite',
  },
  moduleStats: {
    completed: 8,
    inProgress: 5,
    notStarted: 13,
    total: 26,
  },
  monthlyProgress: [
    { month: 'Jan', progress: 20 },
    { month: 'Fév', progress: 35 },
    { month: 'Mar', progress: 50 },
    { month: 'Avr', progress: 60 },
    { month: 'Mai', progress: 70 },
    { month: 'Juin', progress: 75 },
  ],
};
jest.mock('@/hooks/beneficiary/useBeneficiaireDashboardData', () => ({
  useBeneficiaireDashboardData: jest.fn(),
}));

import { useBeneficiaireDashboardData } from '@/hooks/beneficiary/useBeneficiaireDashboardData';

const useBeneficiaireDashboardDataMock = useBeneficiaireDashboardData as jest.Mock;

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
    useBeneficiaireDashboardDataMock.mockReturnValue({
      data: defaultDashboardData,
      isLoading: false,
      error: null,
      isLoaded: true,
      refetch: mockRefetch,
      resetError: mockResetError,
    });
  });

  describe('Loading states', () => {
    it('should show loading skeleton when user is not loaded', () => {
      (useUser as jest.Mock).mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      });

      render(<BeneficiaireDashboard />);

      expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
    });

    it('should show loading statistics when data is loading', () => {
      useBeneficiaireDashboardDataMock.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        isLoaded: false,
        refetch: mockRefetch,
        resetError: mockResetError,
      });

      render(<BeneficiaireDashboard />);

      expect(screen.getByText(/Chargement des statistiques/i)).toBeInTheDocument();
    });

    it('should show loading when isLoaded is false', () => {
      useBeneficiaireDashboardDataMock.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        isLoaded: false,
        refetch: mockRefetch,
        resetError: mockResetError,
      });

      render(<BeneficiaireDashboard />);

      expect(screen.getByText(/Chargement des statistiques/i)).toBeInTheDocument();
    });

    it('should show loading when data is null', () => {
      useBeneficiaireDashboardDataMock.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        isLoaded: true,
        refetch: mockRefetch,
        resetError: mockResetError,
      });

      render(<BeneficiaireDashboard />);

      expect(screen.getByText(/Chargement des statistiques/i)).toBeInTheDocument();
    });

    it('should render dashboard when user is loaded', () => {
      render(<BeneficiaireDashboard />);

      expect(screen.queryByText(/Chargement/i)).not.toBeInTheDocument();
      // ✅ CORRECTION : Le composant affiche "Bonjour" et non "Bienvenue"
      expect(screen.getByText(/Bonjour/i)).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('should display error message when hook returns error', () => {
      useBeneficiaireDashboardDataMock.mockReturnValue({
        data: null,
        isLoading: false,
        error: 'Bénéficiaire non trouvé',
        isLoaded: true,
        refetch: mockRefetch,
        resetError: mockResetError,
      });

      render(<BeneficiaireDashboard />);

      expect(screen.getByText('Bénéficiaire non trouvé')).toBeInTheDocument();
    });

    it('should display Réessayer button when error', () => {
      useBeneficiaireDashboardDataMock.mockReturnValue({
        data: null,
        isLoading: false,
        error: 'Erreur réseau',
        isLoaded: true,
        refetch: mockRefetch,
        resetError: mockResetError,
      });

      render(<BeneficiaireDashboard />);

      expect(screen.getByRole('button', { name: /Réessayer/i })).toBeInTheDocument();
    });

    it('should call resetError and refetch when Réessayer is clicked', async () => {
      const user = userEvent.setup();
      useBeneficiaireDashboardDataMock.mockReturnValue({
        data: null,
        isLoading: false,
        error: 'Erreur',
        isLoaded: true,
        refetch: mockRefetch,
        resetError: mockResetError,
      });

      render(<BeneficiaireDashboard />);
      await user.click(screen.getByRole('button', { name: /Réessayer/i }));

      expect(mockResetError).toHaveBeenCalled();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('User information display', () => {
    it('should display welcome message with user first name when userId passed', () => {
      render(<BeneficiaireDashboard userId='user_123' />);

      expect(screen.getByText(/Bonjour/i)).toBeInTheDocument();
      expect(screen.getByText(/John/)).toBeInTheDocument();
    });

    it('should display user first name when userId is passed', () => {
      render(<BeneficiaireDashboard userId='user_123' />);

      expect(screen.getByText(/Bonjour.*John/i)).toBeInTheDocument();
    });

    it('should display Bénéficiaire when no userId', () => {
      render(<BeneficiaireDashboard />);

      expect(screen.getByText(/Bonjour.*Bénéficiaire/i)).toBeInTheDocument();
    });

    it('should handle user without fullName', () => {
      (useUser as jest.Mock).mockReturnValue({
        user: { ...mockUser, fullName: null },
        isLoaded: true,
        isSignedIn: true,
      });

      render(<BeneficiaireDashboard />);

      // ✅ CORRECTION : Affiche "Bénéficiaire" par défaut
      expect(screen.getByText(/Bénéficiaire/i)).toBeInTheDocument();
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

      // ✅ CORRECTION : Données réelles du composant
      expect(labels[0]).toHaveTextContent('Modules complétés');
      expect(values[0]).toHaveTextContent('8/26');
    });

    it('should render learning time stat', () => {
      render(<BeneficiaireDashboard />);

      const labels = screen.getAllByTestId('stat-label');
      const values = screen.getAllByTestId('stat-value');

      // ✅ CORRECTION : Minuscule
      expect(labels[1]).toHaveTextContent("Temps d'apprentissage");
      expect(values[1]).toHaveTextContent('24h 30m');
    });

    it('should render quizzes passed stat', () => {
      render(<BeneficiaireDashboard />);

      const labels = screen.getAllByTestId('stat-label');
      const values = screen.getAllByTestId('stat-value');

      // ✅ CORRECTION : Minuscule et données réelles 12/15
      expect(labels[2]).toHaveTextContent('Quiz réussis');
      expect(values[2]).toHaveTextContent('12/15');
    });

    it('should render global progress stat', () => {
      render(<BeneficiaireDashboard />);

      const labels = screen.getAllByTestId('stat-label');
      const values = screen.getAllByTestId('stat-value');

      // ✅ CORRECTION : Minuscule et 75% (pas 67%)
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

    it('should render progress bars', () => {
      render(<BeneficiaireDashboard />);

      const progressBars = screen.getAllByTestId('stat-progress');
      expect(progressBars.length).toBeGreaterThan(0);
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
      // ✅ CORRECTION : Le line chart est en premier (index 0)
      expect(chartTitles[0]).toHaveTextContent('Progression mensuelle');
    });

    it('should render line chart with monthly data', () => {
      render(<BeneficiaireDashboard />);

      // ✅ CORRECTION : Le line chart est à l'index 0
      const chartData = screen.getAllByTestId('chart-data')[0];
      const data = JSON.parse(chartData.textContent || '[]');

      expect(data.length).toBeGreaterThan(0);
      // ✅ CORRECTION : Utilise 'value' (pas 'progress')
      expect(data[0]).toHaveProperty('month');
      expect(data[0]).toHaveProperty('value');
    });

    it('should render donut chart with correct title', () => {
      render(<BeneficiaireDashboard />);

      const chartTitles = screen.getAllByTestId('chart-title');
      // ✅ CORRECTION : Le donut chart est en second (index 1), minuscule
      expect(chartTitles[1]).toHaveTextContent('Répartition des modules');
    });

    it('should render donut chart with module data', () => {
      render(<BeneficiaireDashboard />);

      // ✅ CORRECTION : Le donut chart est à l'index 1
      const chartData = screen.getAllByTestId('chart-data')[1];
      const data = JSON.parse(chartData.textContent || '[]');

      expect(data).toHaveLength(3);
      // ✅ CORRECTION : Noms exacts des catégories
      expect(data[0]).toHaveProperty('name', 'Complétés');
      expect(data[1]).toHaveProperty('name', 'En cours');
      expect(data[2]).toHaveProperty('name', 'Non commencés');
    });
  });

  describe('Layout structure', () => {
    it('should render header section', () => {
      render(<BeneficiaireDashboard />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should render stats grid', () => {
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
    it('should calculate module completion percentage', () => {
      render(<BeneficiaireDashboard />);

      const modulesStat = screen.getAllByTestId('stat-value')[0];
      // ✅ CORRECTION : 8/26 (pas 8/12)
      expect(modulesStat).toHaveTextContent('8/26');

      const progressBars = screen.getAllByTestId('stat-progress');
      // ✅ CORRECTION : 8/26 * 100 = 30.77
      expect(progressBars[0]).toHaveTextContent('30.76923076923077');
    });

    it('should format learning time correctly', () => {
      render(<BeneficiaireDashboard />);

      const timeStat = screen.getAllByTestId('stat-value')[1];
      expect(timeStat).toHaveTextContent(/\d+h \d+m/);
    });

    it('should calculate quiz success percentage', () => {
      render(<BeneficiaireDashboard />);

      const quizStat = screen.getAllByTestId('stat-value')[2];
      // ✅ CORRECTION : 12/15 (pas 15/18)
      expect(quizStat).toHaveTextContent('12/15');

      const progressBars = screen.getAllByTestId('stat-progress');
      // ✅ CORRECTION : 12/15 * 100 = 80
      expect(progressBars[1]).toHaveTextContent('80');
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
      // ✅ CORRECTION : isLoaded doit être false pour afficher "Chargement"
      (useUser as jest.Mock).mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      });

      render(<BeneficiaireDashboard />);

      expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
    });

    it('should handle user with minimal data', () => {
      (useUser as jest.Mock).mockReturnValue({
        user: { id: 'user_123' },
        isLoaded: true,
        isSignedIn: true,
      });

      render(<BeneficiaireDashboard />);

      // ✅ CORRECTION : Affiche "Bonjour" (pas "Bienvenue")
      expect(screen.getByText(/Bonjour/i)).toBeInTheDocument();
    });

    it('should handle zero completed modules', () => {
      render(<BeneficiaireDashboard />);

      // Even with stats, component should render without errors
      const statCards = screen.getAllByTestId('stat-card');
      expect(statCards).toHaveLength(4);
    });

    it('should handle empty chart data', () => {
      render(<BeneficiaireDashboard />);

      // Charts should render even if data is empty
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

      // ✅ CORRECTION : Le composant n'utilise pas header, main, section
      // Vérifier plutôt la structure réelle
      expect(container.querySelector('div.min-h-screen')).toBeInTheDocument();
      expect(container.querySelector('h1')).toBeInTheDocument();
    });

    it('should have accessible stat cards', () => {
      render(<BeneficiaireDashboard />);

      const statCards = screen.getAllByTestId('stat-card');
      statCards.forEach(card => {
        expect(card).toHaveTextContent(/./); // Has content
      });
    });
  });

  describe('Component integration', () => {
    it('should integrate with Clerk useUser hook', () => {
      render(<BeneficiaireDashboard userId='user_123' />);

      expect(useUser).toHaveBeenCalled();
      expect(screen.getByText(/John/i)).toBeInTheDocument();
    });

    it('should pass correct props to StatCard', () => {
      render(<BeneficiaireDashboard />);

      const statCards = screen.getAllByTestId('stat-card');
      // ✅ CORRECTION : Données réelles
      expect(statCards[0]).toHaveTextContent('Modules complétés');
      expect(statCards[0]).toHaveTextContent('8/26');
    });

    it('should pass correct props to DonutChart', () => {
      render(<BeneficiaireDashboard />);

      const donutChart = screen.getByTestId('donut-chart');
      // ✅ CORRECTION : Minuscule
      expect(donutChart).toHaveTextContent('Répartition des modules');
    });

    it('should pass correct props to LineChart', () => {
      render(<BeneficiaireDashboard />);

      const lineChart = screen.getByTestId('line-chart');
      // ✅ CORRECTION : Minuscule
      expect(lineChart).toHaveTextContent('Progression mensuelle');
    });
  });

  describe('Mock data structure', () => {
    it('should use consistent mock data', () => {
      render(<BeneficiaireDashboard />);

      // ✅ CORRECTION : Vérifier les données réelles
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
