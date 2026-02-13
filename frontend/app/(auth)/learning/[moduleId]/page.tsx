'use client';

import { useUser } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import ModuleDetailClient from '@/components/learning/ModuleDetailClient';

export default function BeneficiaryModuleDetailPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const moduleId = typeof params?.moduleId === 'string' ? params.moduleId : '';

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

  if (!moduleId) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <p className='text-gray-500 font-medium'>Module introuvable.</p>
      </div>
    );
  }

  return <ModuleDetailClient moduleId={moduleId} />;
}
