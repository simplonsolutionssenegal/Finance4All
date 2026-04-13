import { render, screen } from '@testing-library/react';

import DashboardBarChart from '@/components/dashboard/BarChart';

jest.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='bar-chart'>{children}</div>
  ),
  Bar: () => <div data-testid='bar' />,
  XAxis: () => <div data-testid='x-axis' />,
  YAxis: () => <div data-testid='y-axis' />,
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

describe('DashboardBarChart', () => {
  it('renders the title', () => {
    render(<DashboardBarChart />);
    expect(screen.getByText('Repartition des beneficiaires')).toBeInTheDocument();
  });

  it('renders total count', () => {
    render(<DashboardBarChart />);
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('renders the chart', () => {
    render(<DashboardBarChart />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('has teal background', () => {
    const { container } = render(<DashboardBarChart />);
    expect(container.querySelector('.bg-teal-600')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockStats.isLoading = true;
    mockStats.stats = null as any;
    render(<DashboardBarChart />);
    expect(screen.getByText('...')).toBeInTheDocument();
    mockStats.isLoading = false;
    mockStats.stats = { total: 150, women: 85, youth: 62, inTraining: 45 };
  });
});
