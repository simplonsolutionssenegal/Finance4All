'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import QuizRunner from '@/components/learning/QuizRunner';
import { useGetQuizById } from '@/hooks/quiz/useGetQuizById';
import { mapQuiz, type BackendQuiz } from '@/lib/learning/learning-adapters';
import { QuizStatus, type Quiz } from '@/types/learning/lesson';

export default function QuizPageClient({ moduleId, quizId }: { moduleId: string; quizId: string }) {
  const { quiz: rawQuiz, isLoading, isError } = useGetQuizById<BackendQuiz>(quizId);

  const quiz = useMemo<Quiz | null>(() => {
    if (!rawQuiz) return null;
    return mapQuiz(rawQuiz, moduleId);
  }, [rawQuiz, moduleId]);

  const afterSuccessRedirect = `/learning/${moduleId}`;

  if (isLoading) {
    return (
      <div className='min-h-[calc(100vh-3rem)] bg-grey-50'>
        <div className='mx-auto max-w-3xl px-4 pb-10 pt-4'>
          <p className='text-sm text-grey-600'>Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  if (isError || !quiz || quiz.status !== QuizStatus.PUBLISHED) {
    return (
      <div className='min-h-[calc(100vh-3rem)] bg-grey-50'>
        <div className='mx-auto max-w-3xl px-4 pb-10 pt-4'>
          <p className='text-sm text-grey-600'>Quiz introuvable ou indisponible.</p>
          <Link
            href={`/learning/${moduleId}`}
            className='mt-4 inline-flex items-center gap-2 text-sm text-grey-600 hover:text-primary-600'
          >
            <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm'>
              ←
            </span>{' '}
            Retour au module
          </Link>
        </div>
      </div>
    );
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
            quiz={{
              id: quiz.id,
              title: quiz.title,
              description: quiz.description,
              scoreMinimum: quiz.scoreMinimum,
              questions: quiz.questions,
            }}
            afterSuccessRedirect={afterSuccessRedirect}
          />
        </div>
      </div>
    </div>
  );
}
