import { render, screen } from '@testing-library/react';
import DashboardBarChart from '@/components/dashboard/BarChart';

// Mock recharts components
jest.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe('DashboardBarChart', () => {
  it('renders the chart container', () => {
    render(<DashboardBarChart />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
  });

  it('renders the value 1000', () => {
    render(<DashboardBarChart />);

    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  it('renders all y-axis labels', () => {
    render(<DashboardBarChart />);

    expect(screen.getByText('800')).toBeInTheDocument();
    expect(screen.getByText('600')).toBeInTheDocument();
    expect(screen.getByText('400')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('has the correct styling classes', () => {
    const { container } = render(<DashboardBarChart />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-teal-600', 'text-white', 'shadow-sm', 'rounded-2xl', 'border-0');
  });

  it('renders with proper chart height', () => {
    const { container } = render(<DashboardBarChart />);

    const chartContainer = container.querySelector('.h-40');
    expect(chartContainer).toBeInTheDocument();
  });
});