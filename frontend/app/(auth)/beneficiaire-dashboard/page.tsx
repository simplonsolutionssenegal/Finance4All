// frontend/app/(auth)/beneficiaire-dashboard/page.tsx

import { redirect } from 'next/navigation';

import BeneficiaireDashboard from '@/components/beneficiaire/BeneficiaireDashboard';
import { getAuthStatus } from '@/lib/auth-utils';

export default async function BeneficiaireDashboardPage() {
  const { userId } = await getAuthStatus();

  if (!userId) {
    redirect('/login');
  }

  return <BeneficiaireDashboard userId={userId} />;
}
