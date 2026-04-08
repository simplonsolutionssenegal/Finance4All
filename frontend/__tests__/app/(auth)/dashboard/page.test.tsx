import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';

import Dashboard from '@/app/(auth)/dashboard/page';
import { getAuthStatus } from '@/lib/auth-utils';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/lib/auth-utils', () => ({
  getAuthStatus: jest.fn(),
}));

jest.mock('@/lib/role-access', () => ({
  ...jest.requireActual('@/lib/role-access'),
}));

jest.mock('@/components/dashboard/PlatformDashboard', () => () => (
  <div data-testid='platform-dashboard'>PlatformDashboard</div>
));
jest.mock('@/components/dashboard/OrganizationDashboard', () => () => (
  <div data-testid='organization-dashboard'>OrganizationDashboard</div>
));
jest.mock(
  '@/components/beneficiaire/BeneficiaireDashboard',
  () =>
    ({ userId }: { userId: string }) => (
      <div data-testid='beneficiary-dashboard'>BeneficiaireDashboard {userId}</div>
    )
);

const mockGetAuthStatus = getAuthStatus as jest.MockedFunction<typeof getAuthStatus>;

describe('Dashboard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('redirects to /login when not authenticated', async () => {
    mockGetAuthStatus.mockResolvedValue({
      userId: null,
      isBeneficiary: false,
      orgId: null,
      orgRole: null,
      appRole: 'Beneficiare',
    });
    await Dashboard();
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('renders PlatformDashboard for Admin role', async () => {
    mockGetAuthStatus.mockResolvedValue({
      userId: 'user_1',
      isBeneficiary: false,
      orgId: 'org_1',
      orgRole: 'org:admin',
      appRole: 'Admin',
    });
    const result = await Dashboard();
    render(result as any);
    expect(screen.getByTestId('platform-dashboard')).toBeInTheDocument();
  });

  it('renders OrganizationDashboard for AdminOrg role', async () => {
    mockGetAuthStatus.mockResolvedValue({
      userId: 'user_1',
      isBeneficiary: false,
      orgId: 'org_1',
      orgRole: 'org:admin',
      appRole: 'AdminOrg',
    });
    const result = await Dashboard();
    render(result as any);
    expect(screen.getByTestId('organization-dashboard')).toBeInTheDocument();
  });

  it('renders BeneficiaireDashboard for Beneficiare role', async () => {
    mockGetAuthStatus.mockResolvedValue({
      userId: 'user_1',
      isBeneficiary: true,
      orgId: null,
      orgRole: null,
      appRole: 'Beneficiare',
    });
    const result = await Dashboard();
    render(result as any);
    expect(screen.getByTestId('beneficiary-dashboard')).toBeInTheDocument();
  });
});
