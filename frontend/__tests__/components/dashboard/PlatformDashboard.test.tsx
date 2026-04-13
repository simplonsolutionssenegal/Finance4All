import { render, screen } from '@testing-library/react';

import PlatformDashboard from '@/components/dashboard/PlatformDashboard';

/* ---- mock child components ---- */
jest.mock('@/components/dashboard/StatsCards', () => {
  const MockStatsCards = (props: { items: unknown[]; isLoading?: boolean }) => (
    <div data-testid='stats-cards' data-loading={String(!!props.isLoading)}>
      {JSON.stringify(props.items)}
    </div>
  );
  MockStatsCards.displayName = 'StatsCards';
  return { __esModule: true, default: MockStatsCards };
});

jest.mock('@/components/dashboard/BarChart', () => {
  const MockBarChart = () => <div data-testid='bar-chart' />;
  MockBarChart.displayName = 'BarChart';
  return { __esModule: true, default: MockBarChart };
});

jest.mock('@/components/dashboard/DonutChart', () => {
  const MockDonutChart = () => <div data-testid='donut-chart' />;
  MockDonutChart.displayName = 'DonutChart';
  return { __esModule: true, default: MockDonutChart };
});

jest.mock('@/components/dashboard/GrowthChart', () => {
  const MockGrowthChart = () => <div data-testid='growth-chart' />;
  MockGrowthChart.displayName = 'GrowthChart';
  return { __esModule: true, default: MockGrowthChart };
});

jest.mock('@/components/dashboard/InstitutionsList', () => {
  const MockInstitutionsList = () => <div data-testid='institutions-list' />;
  MockInstitutionsList.displayName = 'InstitutionsList';
  return { __esModule: true, default: MockInstitutionsList };
});

/* ---- mock hooks ---- */
const mockUsePlatformStats = jest.fn();
const mockUseBeneficiaryStats = jest.fn();

jest.mock('@/hooks/organization/usePlatformStats', () => ({
  usePlatformStats: (...args: unknown[]) => mockUsePlatformStats(...args),
}));

jest.mock('@/hooks/dashboard/useBeneficiaryStats', () => ({
  useBeneficiaryStats: (...args: unknown[]) => mockUseBeneficiaryStats(...args),
}));

describe('PlatformDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePlatformStats.mockReturnValue({ stats: undefined, isLoading: false });
    mockUseBeneficiaryStats.mockReturnValue({ stats: undefined, isLoading: false });
  });

  it('renders loading state when both hooks are loading', () => {
    mockUsePlatformStats.mockReturnValue({ stats: undefined, isLoading: true });
    mockUseBeneficiaryStats.mockReturnValue({ stats: undefined, isLoading: true });

    render(<PlatformDashboard />);

    const statsCards = screen.getByTestId('stats-cards');
    expect(statsCards).toHaveAttribute('data-loading', 'true');
  });

  it('renders with beneficiary stats data', () => {
    mockUseBeneficiaryStats.mockReturnValue({
      stats: { total: 200, women: 80, youth: 60, inTraining: 50 },
      isLoading: false,
    });

    render(<PlatformDashboard />);

    const statsCards = screen.getByTestId('stats-cards');
    const items = JSON.parse(statsCards.textContent || '[]');

    const beneficiariesItem = items.find((i: { id: string }) => i.id === 'beneficiaries');
    expect(beneficiariesItem.value).toBe(200);
    expect(beneficiariesItem.subtitle).toBe('50 en formation');

    const womenItem = items.find((i: { id: string }) => i.id === 'women');
    expect(womenItem.value).toBe(80);
  });

  it('renders with platform stats data', () => {
    mockUsePlatformStats.mockReturnValue({
      stats: { totalOrganizations: 10, totalUsers: 45 },
      isLoading: false,
    });

    render(<PlatformDashboard />);

    const statsCards = screen.getByTestId('stats-cards');
    const items = JSON.parse(statsCards.textContent || '[]');

    const orgItem = items.find((i: { id: string }) => i.id === 'organizations');
    expect(orgItem.value).toBe(10);
    expect(orgItem.subtitle).toBe('45 utilisateurs');
  });

  it('renders all chart components', () => {
    render(<PlatformDashboard />);

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('donut-chart')).toBeInTheDocument();
    expect(screen.getByTestId('growth-chart')).toBeInTheDocument();
    expect(screen.getByTestId('institutions-list')).toBeInTheDocument();
  });

  it('computes correct percentage subtitles', () => {
    mockUseBeneficiaryStats.mockReturnValue({
      stats: { total: 200, women: 80, youth: 60, inTraining: 50 },
      isLoading: false,
    });

    render(<PlatformDashboard />);

    const statsCards = screen.getByTestId('stats-cards');
    const items = JSON.parse(statsCards.textContent || '[]');

    const womenItem = items.find((i: { id: string }) => i.id === 'women');
    expect(womenItem.subtitle).toBe('40% du total'); // 80/200 = 40%

    const youthItem = items.find((i: { id: string }) => i.id === 'youth');
    expect(youthItem.subtitle).toBe('30% du total'); // 60/200 = 30%
  });
});
