import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import QuizPageClient from '@/components/learning/QuizPageClient';

interface QuizPageProps {
  readonly params: Promise<{ readonly moduleId: string; readonly quizId: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const { moduleId, quizId } = await params;

  return <QuizPageClient moduleId={moduleId} quizId={quizId} />;
}
