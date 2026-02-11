'use client';

import { Award, Check, Clock, HelpCircle, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { Quiz } from '@/types/modules/Quiz';

import ConfirmDeleteModal from './ConfirmDeleteModal';

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

type QuizItemProps = {
  quiz: Quiz;
  onEdit?: (quiz: Quiz) => void;
  onDelete?: (quiz: Quiz) => void;
};

export default function QuizItem({ quiz, onEdit, onDelete }: QuizItemProps) {
  const questionsCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className='rounded-2xl bg-white shadow-sm border border-slate-100 px-6 py-5 flex gap-4'>
      <div className='h-8 w-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0'>
        <HelpCircle className='h-4 w-4 text-orange-500' />
      </div>

      <div className='flex-1 min-w-0 flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 px-2.5 text-xs text-slate-700'>
              {questionsCount} questions
            </span>

            <span className={statusBadgeClass(quiz.status)}>
              {quiz.status === 'PUBLISHED' && <Check className='h-3.5 w-3.5' />}
              {statusLabelFR(quiz.status)}
            </span>
          </div>

          <div className='mt-1 text-sm  text-slate-900 truncate'>{quiz.title}</div>
          <div className='mt-1 text-xs text-slate-500 line-clamp-1'>{quiz.description}</div>

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
        <div className='shrink-0 flex flex-col gap-2'>
          <button
            type='button'
            onClick={() => onEdit?.(quiz)}
            className='h-7 w-7 rounded-2xl bg-primary-50 hover:bg-primary-400 flex items-center justify-center'
            aria-label='Modifier le quiz'
          >
            <Pencil className='h-3 w-3 text-slate-600' />
          </button>

          <button
            type='button'
            onClick={() => {
              setIsDeleteOpen(true);
            }}
            className='h-7 w-7 rounded-2xl bg-red-50 hover:bg-red-100 flex items-center justify-center'
            aria-label='Supprimer le quiz'
          >
            <Trash2 className='h-3 w-3 text-red-600' />
          </button>
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          onDelete?.(quiz);
          setIsDeleteOpen(false);
        }}
        description={
          <>
            Vous allez supprimer le quiz{' '}
            <span className='font-medium text-tertiary-400'>{quiz.title}</span>
          </>
        }
        confirmLabel='Supprimer'
        confirmClassName='bg-red-500 hover:bg-red-600'
      />
    </div>
  );
}
