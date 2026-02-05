'use client';

import { Lock, Trophy, RotateCcw } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { QuizStatus, type Quiz } from '@/types/learning/lesson';
import type { QuizProgressDTO } from '@/types/learning/quiz-progress';

interface QuizListProps {
  readonly moduleId: string;
  readonly quizzes: Quiz[];
  readonly quizAvailability: Map<string, boolean>;
  readonly quizProgressMap: Map<string, QuizProgressDTO>;
}

export default function QuizList({
  moduleId,
  quizzes,
  quizAvailability,
  quizProgressMap,
}: QuizListProps) {
  if (quizzes.length === 0) {
    return (
      <p className='rounded-2xl border border-grey-200 bg-white p-6 text-center text-sm text-grey-600 shadow-sm'>
        Aucun quiz publié pour ce module.
      </p>
    );
  }

  return (
    <div className='space-y-4'>
      {quizzes.map(quiz => {
        const questionCount = quiz.questions.length;
        const isPublished = quiz.status === QuizStatus.PUBLISHED;
        const available = isPublished && (quizAvailability.get(quiz.id) ?? false);

        const progress = quizProgressMap.get(quiz.id);
        const totalAttempts = progress?.totalAttempts ?? 0;
        const remainingAttempts = progress?.remainingAttempts ?? quiz.nombreTentatives;
        const bestScore = progress?.bestScorePercent;

        const hasAttempts = totalAttempts > 0;
        const attemptsExhausted = hasAttempts && remainingAttempts <= 0;
        const buttonLabel = hasAttempts ? 'Refaire' : 'Faire';

        const cardContent = (
          <CardContent className='flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-start gap-4'>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  available ? 'bg-emerald-600 text-white' : 'bg-grey-200 text-grey-500'
                }`}
              >
                {available ? <Trophy className='h-6 w-6' /> : <Lock className='h-6 w-6' />}
              </div>

              <div className='space-y-1'>
                <h3
                  className={`text-sm font-semibold ${
                    available ? 'text-secondary-400' : 'text-grey-500'
                  }`}
                >
                  {quiz.title}
                </h3>
                <div className='flex flex-wrap items-center gap-3 text-xs text-grey-500'>
                  <span>
                    {questionCount} question{questionCount > 1 ? 's' : ''}
                  </span>
                  <span>Seuil de réussite: {quiz.scoreMinimum}%</span>
                  {typeof bestScore === 'number' && (
                    <span className='font-semibold text-emerald-600'>Score: {bestScore}%</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              {available ? (
                attemptsExhausted ? (
                  <button
                    type='button'
                    disabled
                    className='inline-flex items-center gap-2 rounded-full border border-grey-200 bg-grey-100 px-4 py-2 text-xs font-medium text-grey-500'
                  >
                    <RotateCcw className='h-4 w-4' />
                    {buttonLabel}
                  </button>
                ) : (
                  <Link href={`/learning/${moduleId}/quiz/${quiz.id}`}>
                    <button
                      type='button'
                      className='inline-flex items-center gap-2 rounded-full border border-grey-200 bg-white px-4 py-2 text-xs font-medium text-grey-700 shadow-sm hover:bg-grey-50'
                    >
                      <RotateCcw className='h-4 w-4' />
                      {buttonLabel}
                    </button>
                  </Link>
                )
              ) : (
                <button
                  type='button'
                  disabled
                  className='inline-flex items-center gap-2 rounded-full border border-grey-200 bg-grey-100 px-4 py-2 text-xs font-medium text-grey-500'
                >
                  <Lock className='h-4 w-4' />
                  Verrouillé
                </button>
              )}
            </div>
          </CardContent>
        );

        return (
          <Card
            key={quiz.id}
            className={`overflow-hidden border-grey-200 shadow-sm ${
              available ? 'bg-white' : 'bg-grey-50 opacity-90'
            }`}
          >
            {cardContent}
          </Card>
        );
      })}
    </div>
  );
}
