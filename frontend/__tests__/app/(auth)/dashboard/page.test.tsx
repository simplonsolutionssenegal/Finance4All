import { render, screen } from '@testing-library/react';

import Dashboard from '@/app/(auth)/dashboard/page';

jest.mock('@/components/dashboard/StatsCards', () => () => (
  <div data-testid='stats-cards'>StatsCards</div>
));
jest.mock('@/components/dashboard/GrowthChart', () => () => (
  <div data-testid='growth-chart'>GrowthChart</div>
));
jest.mock('@/components/dashboard/DonutChart', () => () => (
  <div data-testid='donut-chart'>DonutChart</div>
));
jest.mock('@/components/dashboard/BarChart', () => () => (
  <div data-testid='bar-chart'>BarChart</div>
));
jest.mock('@/components/dashboard/InstitutionsList', () => () => (
  <div data-testid='institutions-list'>InstitutionsList</div>
));

describe('Dashboard', () => {
  it('renders all dashboard components', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('stats-cards')).toBeInTheDocument();
    expect(screen.getByTestId('growth-chart')).toBeInTheDocument();
    expect(screen.getByTestId('donut-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('institutions-list')).toBeInTheDocument();
  });
});
