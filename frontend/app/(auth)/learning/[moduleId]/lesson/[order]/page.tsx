import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import LessonPageClient from '@/components/learning/LessonPageClient';

interface LessonPageProps {
  readonly params: Promise<{ readonly moduleId: string; readonly order: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const { moduleId, order: orderParam } = await params;
  const order = Number(orderParam) || 1;

  return <LessonPageClient moduleId={moduleId} order={order} />;
}
