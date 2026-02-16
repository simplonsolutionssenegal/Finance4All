import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import ModuleDetailClient from '@/components/learning/ModuleDetailClient';

interface ModuleDetailPageProps {
  readonly params: Promise<{ readonly moduleId: string }>;
}

export default async function BeneficiaryModuleDetailPage({ params }: ModuleDetailPageProps) {
  const { userId } = await auth({ treatPendingAsSignedOut: false });

  if (!userId) {
    redirect('/login');
  }

  const { moduleId } = await params;

  if (!moduleId) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <p className='text-gray-500 font-medium'>Module introuvable.</p>
      </div>
    );
  }

  return <ModuleDetailClient moduleId={moduleId} />;
}
