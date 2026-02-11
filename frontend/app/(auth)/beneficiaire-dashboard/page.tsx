// frontend/app/(auth)/beneficiaire-dashboard/page.tsx

'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import BeneficiaireDashboard from '@/components/beneficiaire/BeneficiaireDashboard';

export default function BeneficiaireDashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='animate-pulse text-gray-500 font-medium'>Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <BeneficiaireDashboard userId={user.id} />;
}
