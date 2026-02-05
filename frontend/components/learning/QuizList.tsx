'use client';

import { HelpCircle, CheckCircle2, Award, Clock, RotateCcw, Lock } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { QuizStatus, type Quiz } from '@/types/learning/lesson';

interface QuizListProps {
  readonly moduleId: string;
  readonly quizzes: Quiz[];
}

function formatStatus(status: QuizStatus): string {
  switch (status) {
    case QuizStatus.PUBLISHED:
      return 'Publié';
    case QuizStatus.DRAFT:
      return 'Brouillon';
    case QuizStatus.ARCHIVED:
      return 'Archivé';
    default:
      return status;
  }
}

export default function QuizList({ moduleId, quizzes }: QuizListProps) {
  if (quizzes.length === 0) {
    return (
      <p className='rounded-2xl border border-grey-200 bg-white p-6 text-center text-sm text-grey-600 shadow-sm'>
        Aucun quiz publié pour ce module.
      </p>
    );
  }

  return (
    <div className='space-y-3'>
      {quizzes.map(quiz => {
        const questionCount = quiz.questions.length;
        const isPublished = quiz.status === QuizStatus.PUBLISHED;
        const available = isPublished;
        const reason = available ? undefined : 'Quiz non publié.';

        const cardContent = (
          <CardContent className='flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4'>
            <div className='flex shrink-0 items-center justify-center'>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                  available ? 'border-orange-200 bg-orange-50' : 'border-grey-200 bg-grey-100'
                }`}
              >
                {available ? (
                  <HelpCircle className='h-6 w-6 text-orange-500' />
                ) : (
                  <Lock className='h-6 w-6 text-grey-400' />
                )}
              </div>
            </div>

            <div className='min-w-0 flex-1 space-y-2'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='inline-flex items-center rounded-full bg-grey-100 px-2.5 py-0.5 text-xs font-medium text-grey-700'>
                  {questionCount} question{questionCount > 1 ? 's' : ''}
                </span>
                {isPublished && (
                  <span className='inline-flex items-center gap-1 rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-700'>
                    <CheckCircle2 className='h-3.5 w-3.5 text-success-600' />
                    {formatStatus(quiz.status)}
                  </span>
                )}
                {!available && reason && (
                  <span className='inline-flex items-center gap-1 rounded-full bg-warning-100 px-2.5 py-0.5 text-xs font-medium text-warning-700'>
                    Non disponible
                  </span>
                )}
              </div>

              <h3
                className={`text-sm font-semibold ${
                  available ? 'text-secondary-400' : 'text-grey-600'
                }`}
              >
                {quiz.title}
              </h3>
              <p className='text-xs text-grey-600'>{quiz.description}</p>
              {!available && reason && <p className='text-xs text-grey-500'>{reason}</p>}

              <div className='flex flex-wrap items-center gap-4 text-xs text-grey-500'>
                <span className='inline-flex items-center gap-1'>
                  <Award className='h-4 w-4 text-grey-400' aria-hidden />
                  {quiz.scoreMinimum}% requis
                </span>
                <span className='inline-flex items-center gap-1'>
                  <Clock className='h-4 w-4 text-grey-400' aria-hidden />
                  {quiz.duree == null ? 'Illimité' : `${quiz.duree} min`}
                </span>
                <span className='inline-flex items-center gap-1'>
                  <RotateCcw className='h-4 w-4 text-grey-400' aria-hidden />
                  {quiz.nombreTentatives} tentative
                  {quiz.nombreTentatives > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </CardContent>
        );

        if (available) {
          return (
            <Link key={quiz.id} href={`/learning/${moduleId}/quiz/${quiz.id}`}>
              <Card className='overflow-hidden border-grey-200 bg-white shadow-sm transition-shadow hover:shadow-md'>
                {cardContent}
              </Card>
            </Link>
          );
        }

        return (
          <Card
            key={quiz.id}
            className='overflow-hidden border-grey-200 bg-grey-50 shadow-sm opacity-90'
          >
            {cardContent}
          </Card>
        );
      })}
    </div>
  );
}
