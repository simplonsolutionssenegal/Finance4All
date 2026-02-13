'use client';

import { HelpCircle, Plus } from 'lucide-react';

import type { Quiz } from '@/types/modules/Quiz';

import QuizItem from './Quiz-Item';

type QuizListProps = {
  quizzes: Quiz[];
  onCreate?: () => void;
  onEdit?: (quiz: Quiz) => void;
  onDelete?: (quiz: Quiz) => void;
};

export default function QuizList({ quizzes, onCreate, onEdit, onDelete }: QuizListProps) {
  const uniqueQuizzes = Array.from(new Map(quizzes.map(quiz => [quiz.id, quiz])).values());

  if (!uniqueQuizzes || uniqueQuizzes.length === 0) {
    return (
      <div className='rounded-2xl bg-white shadow-sm border border-slate-100 p-10 text-center'>
        <div className='mx-auto mb-4 h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center'>
          <HelpCircle className='h-6 w-6 text-slate-400' />
        </div>
        <p className='text-slate-900 font-medium'>Aucun quiz pour le moment</p>
        <p className='mt-1 text-sm text-slate-500'>
          Ajoute un quiz pour évaluer les connaissances sur ce module.
        </p>

        {onCreate && (
          <button
            onClick={onCreate}
            className='mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 text-sm font-medium'
          >
            <Plus className='h-4 w-4' />
            Nouveau quiz
          </button>
        )}
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {uniqueQuizzes.map(q => (
        <QuizItem key={q.id} quiz={q} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
