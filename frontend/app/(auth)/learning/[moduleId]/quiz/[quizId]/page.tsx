import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import QuizRunner from '@/components/learning/QuizRunner';
import {
  mockTransfertsInternationauxModule,
  mockTransfertsLessons,
  getQuizById,
  getQuizAvailability,
  getAfterQuizSuccessRedirect,
} from '@/lib/mocks/learning-mocks';

interface QuizPageProps {
  readonly params: Promise<{ readonly moduleId: string; readonly quizId: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const { moduleId, quizId } = await params;

  const moduleData = mockTransfertsInternationauxModule;
  if (moduleId !== moduleData.id) {
    redirect(`/learning/${moduleData.id}`);
  }

  const quiz = getQuizById(moduleId, quizId);
  const lessons = [...mockTransfertsLessons].sort((a, b) => a.order - b.order);
  const totalLessons = lessons.length;

  if (!quiz || quiz.status !== 'PUBLISHED') {
    redirect(`/learning/${moduleId}`);
  }

  const { available } = getQuizAvailability(quiz, totalLessons);
  if (!available) {
    redirect(`/learning/${moduleId}`);
  }

  return (
    <div className='min-h-[calc(100vh-3rem)] bg-grey-50'>
      <div className='mx-auto max-w-3xl px-4 pb-10 pt-4'>
        <Link
          href={`/learning/${moduleId}`}
          className='inline-flex items-center gap-2 text-sm text-grey-600 hover:text-primary-600'
        >
          <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm'>
            ←
          </span>{' '}
          Retour au module
        </Link>

        <div className='mt-6'>
          <QuizRunner
            moduleId={moduleId}
            moduleTitle={moduleData.title}
            quiz={{
              id: quiz.id,
              title: quiz.title,
              description: quiz.description,
              scoreMinimum: quiz.scoreMinimum,
              questions: quiz.questions,
            }}
            afterSuccessRedirect={getAfterQuizSuccessRedirect(moduleId, quiz)}
          />
        </div>
      </div>
    </div>
  );
}
