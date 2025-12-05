// frontend/app/%28auth%29/beneficiaire-dashboard/page.tsx

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import BeneficiaireDashboard from '@/components/beneficiaire/BeneficiaireDashboard';

export default async function BeneficiaireDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  return <BeneficiaireDashboard userId={userId} />;
}
