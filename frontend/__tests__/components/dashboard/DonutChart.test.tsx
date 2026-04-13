import { render, screen } from '@testing-library/react';

import DonutChart from '@/components/dashboard/DonutChart';

jest.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='pie-chart'>{children}</div>
  ),
  Pie: () => <div data-testid='pie' />,
  Cell: () => <div data-testid='cell' />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='responsive-container'>{children}</div>
  ),
}));

const mockStats = {
  stats: { total: 150, women: 85, youth: 62, inTraining: 45 },
  isLoading: false,
  error: null,
};

jest.mock('@/hooks/dashboard/useBeneficiaryStats', () => ({
  useBeneficiaryStats: () => mockStats,
}));

describe('DonutChart', () => {
  it('renders the title', () => {
    render(<DonutChart />);
    expect(screen.getByText('Repartition par genre')).toBeInTheDocument();
  });

  it('renders total count in center', () => {
    render(<DonutChart />);
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders gender breakdown', () => {
    render(<DonutChart />);
    expect(screen.getByText('Femmes')).toBeInTheDocument();
    expect(screen.getByText('Hommes')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('65')).toBeInTheDocument(); // 150 - 85
  });

  it('renders youth stats', () => {
    render(<DonutChart />);
    expect(screen.getByText('Jeunes (-30 ans)')).toBeInTheDocument();
    expect(screen.getByText('62')).toBeInTheDocument();
  });

  it('renders percentages', () => {
    render(<DonutChart />);
    expect(screen.getByText('(57%)')).toBeInTheDocument(); // 85/150
    expect(screen.getByText('(43%)')).toBeInTheDocument(); // 65/150
  });

  it('shows empty state when no data', () => {
    mockStats.stats = { total: 0, women: 0, youth: 0, inTraining: 0 };
    render(<DonutChart />);
    expect(screen.getByText('Aucune donnee')).toBeInTheDocument();
    mockStats.stats = { total: 150, women: 85, youth: 62, inTraining: 45 };
  });
});
