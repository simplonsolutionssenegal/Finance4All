import { render, screen } from '@testing-library/react';

import OrganizationDashboard from '@/components/dashboard/OrganizationDashboard';

/* ---- mock StatsCards ---- */
jest.mock('@/components/dashboard/StatsCards', () => {
  const MockStatsCards = (props: { items: unknown[]; isLoading?: boolean }) => (
    <div data-testid='stats-cards' data-loading={String(!!props.isLoading)}>
      {JSON.stringify(props.items)}
    </div>
  );
  MockStatsCards.displayName = 'StatsCards';
  return { __esModule: true, default: MockStatsCards };
});

/* ---- mock next/link ---- */
jest.mock('next/link', () => {
  const MockLink = ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  );
  MockLink.displayName = 'Link';
  return { __esModule: true, default: MockLink };
});

/* ---- mock hooks ---- */
const mockUseOrganization = jest.fn();
const mockUseBeneficiaryStats = jest.fn();

jest.mock('@clerk/nextjs', () => ({
  useOrganization: (...args: unknown[]) => mockUseOrganization(...args),
}));

jest.mock('@/hooks/dashboard/useBeneficiaryStats', () => ({
  useBeneficiaryStats: (...args: unknown[]) => mockUseBeneficiaryStats(...args),
}));

describe('OrganizationDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOrganization.mockReturnValue({ organization: { id: 'org_123' } });
    mockUseBeneficiaryStats.mockReturnValue({ stats: undefined, isLoading: false });
  });

  it('renders with loading state', () => {
    mockUseBeneficiaryStats.mockReturnValue({ stats: undefined, isLoading: true });

    render(<OrganizationDashboard />);

    const statsCards = screen.getByTestId('stats-cards');
    expect(statsCards).toHaveAttribute('data-loading', 'true');
  });

  it('renders with stats data', () => {
    mockUseBeneficiaryStats.mockReturnValue({
      stats: { total: 100, women: 40, youth: 30, inTraining: 25 },
      isLoading: false,
    });

    render(<OrganizationDashboard />);

    const statsCards = screen.getByTestId('stats-cards');
    const items = JSON.parse(statsCards.textContent || '[]');

    const beneficiariesItem = items.find((i: { id: string }) => i.id === 'beneficiaries');
    expect(beneficiariesItem.value).toBe(100);
    expect(beneficiariesItem.subtitle).toBe('25 en formation');

    const womenItem = items.find((i: { id: string }) => i.id === 'women');
    expect(womenItem.value).toBe(40);
    expect(womenItem.subtitle).toBe('40% du total');

    const youthItem = items.find((i: { id: string }) => i.id === 'youth');
    expect(youthItem.value).toBe(30);
    expect(youthItem.subtitle).toBe('30% du total');

    const trainingItem = items.find((i: { id: string }) => i.id === 'inTraining');
    expect(trainingItem.value).toBe(25);
    expect(trainingItem.subtitle).toBe('25% du total');
  });

  it('passes orgId to useBeneficiaryStats', () => {
    mockUseOrganization.mockReturnValue({ organization: { id: 'org_456' } });

    render(<OrganizationDashboard />);

    expect(mockUseBeneficiaryStats).toHaveBeenCalledWith('org_456');
  });

  it('shows link to /recipients', () => {
    render(<OrganizationDashboard />);

    const link = screen.getByRole('link', { name: /voir les recipients/i });
    expect(link).toHaveAttribute('href', '/recipients');
  });

  it('renders correct title and description', () => {
    render(<OrganizationDashboard />);

    expect(screen.getByText('Dashboard Organisation')).toBeInTheDocument();
    expect(
      screen.getByText('Gerez vos beneficiaires et suivez leur progression.')
    ).toBeInTheDocument();
  });
});
