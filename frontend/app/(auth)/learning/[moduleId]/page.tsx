import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import ModuleDetailClient from '@/components/learning/ModuleDetailClient';

interface ModulePageProps {
  readonly params: Promise<{ readonly moduleId: string }>;
}

export default async function BeneficiaryModuleDetailPage({ params }: ModulePageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const { moduleId } = await params;

  return <ModuleDetailClient moduleId={moduleId} />;
}
