'use client';

import { Award, Check, Clock, HelpCircle, Plus, RotateCcw } from 'lucide-react';

import type { Quiz } from '@/types/modules/Quiz';

function statusBadgeClass(status: string) {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 text-xs font-medium border';

  switch (status) {
    case 'PUBLISHED':
      return `${base} bg-emerald-100 text-emerald-700 border-emerald-300`;
    case 'DRAFT':
      return `${base} bg-slate-100 text-slate-700 border-slate-300`;
    case 'ARCHIVED':
      return `${base} bg-amber-100 text-amber-800 border-amber-300`;
    default:
      return `${base} bg-slate-100 text-slate-700 border-slate-300`;
  }
}

function statusLabelFR(status: string) {
  const map: Record<string, string> = {
    PUBLISHED: 'Publié',
    DRAFT: 'Brouillon',
    ARCHIVED: 'Archivé',
  };
  return map[status] ?? status;
}

function durationLabel(duree?: number | null) {
  if (duree === null || duree === undefined) return 'Illimité';
  return `${Math.round(Number(duree) || 0)} min`;
}

function QuizItem({ quiz }: { quiz: Quiz }) {
  const questionsCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;

  return (
    <div className='rounded-2xl bg-white shadow-sm border border-slate-100 px-6 py-5 flex gap-4'>
      {/* Icône à gauche (orange) */}
      <div className='h-8 w-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0'>
        <HelpCircle className='h-4 w-4 text-orange-500' />
      </div>

      <div className='flex-1 min-w-0'>
        {/* Badges top */}
        <div className='flex flex-wrap items-center gap-2'>
          <span className='inline-flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 px-2.5 text-xs text-slate-700'>
            {questionsCount} questions
          </span>

          <span className={statusBadgeClass(quiz.status)}>
            {quiz.status === 'PUBLISHED' && <Check className='h-3.5 w-3.5' />}
            {statusLabelFR(quiz.status)}
          </span>
        </div>

        {/* Titre */}
        <div className='mt-1 text-sm  text-slate-900 truncate'>{quiz.title}</div>

        {/* Description */}
        <div className='mt-1 text-xs text-slate-500 line-clamp-1'>{quiz.description}</div>

        {/* Meta row */}
        <div className='mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500'>
          <span className='inline-flex text-xs items-center gap-1.5'>
            <Award className='h-3 w-3' />
            {quiz.scoreMinimum}% requis
          </span>

          <span className='inline-flex text-xs items-center gap-1.5'>
            <Clock className='h-3 w-3' />
            {durationLabel(quiz.duree)}
          </span>

          <span className='inline-flex text-xs items-center gap-1.5'>
            <RotateCcw className='h-3 w-3' />
            {quiz.nombreTentatives} tentatives
          </span>
        </div>
      </div>
    </div>
  );
}

type QuizListProps = {
  quizzes: Quiz[];
  onCreate?: () => void;
};

export default function QuizList({ quizzes, onCreate }: QuizListProps) {
  if (!quizzes || quizzes.length === 0) {
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
      {quizzes.map(q => (
        <QuizItem key={q.id} quiz={q} />
      ))}
    </div>
  );
}
