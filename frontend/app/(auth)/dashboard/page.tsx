import { redirect } from 'next/navigation';

import BeneficiaireDashboard from '@/components/beneficiaire/BeneficiaireDashboard';
import OrganizationDashboard from '@/components/dashboard/OrganizationDashboard';
import PlatformDashboard from '@/components/dashboard/PlatformDashboard';
import { getAuthStatus } from '@/lib/auth-utils';
import { getAccessGroup } from '@/lib/role-access';

export default async function Dashboard() {
  const { userId, appRole } = await getAuthStatus();

  if (!userId) {
    redirect('/login');
  }

  const group = getAccessGroup(appRole);

  if (group === 'beneficiary') {
    return <BeneficiaireDashboard userId={userId} />;
  }

  if (group === 'organization') {
    return <OrganizationDashboard />;
  }

  return <PlatformDashboard />;
}
