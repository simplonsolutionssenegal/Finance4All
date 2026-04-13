import { render, screen } from '@testing-library/react';

import GrowthChart from '@/components/dashboard/GrowthChart';

jest.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='line-chart'>{children}</div>
  ),
  Line: () => <div data-testid='line' />,
  XAxis: () => <div data-testid='x-axis' />,
  YAxis: () => <div data-testid='y-axis' />,
  CartesianGrid: () => <div data-testid='cartesian-grid' />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='responsive-container'>{children}</div>
  ),
  Tooltip: () => <div data-testid='tooltip' />,
}));

const mockStats = {
  stats: { total: 150, women: 85, youth: 62, inTraining: 45 },
  isLoading: false,
  error: null,
};

jest.mock('@/hooks/dashboard/useBeneficiaryStats', () => ({
  useBeneficiaryStats: () => mockStats,
}));

describe('GrowthChart', () => {
  it('renders the title', () => {
    render(<GrowthChart />);
    expect(screen.getByText('Evolution des inscriptions')).toBeInTheDocument();
  });

  it('renders total count', () => {
    render(<GrowthChart />);
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('inscrits au total')).toBeInTheDocument();
  });

  it('renders the chart', () => {
    render(<GrowthChart />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockStats.isLoading = true;
    mockStats.stats = null as any;
    render(<GrowthChart />);
    expect(screen.getByText('...')).toBeInTheDocument();
    mockStats.isLoading = false;
    mockStats.stats = { total: 150, women: 85, youth: 62, inTraining: 45 };
  });
});
