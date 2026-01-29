'use client';

import { Clock, Layers, ClipboardCheck, Check, Pencil } from 'lucide-react';
import Link from 'next/link';

import type { Lesson } from '@/types/modules/Lesson';

function minutesLabel(n: number) {
  const v = Math.round(Number(n) || 0);
  return `${v} min`;
}

function statusLabelFR(status: string) {
  const map: Record<string, string> = {
    PUBLISHED: 'Publié',
    DRAFT: 'Brouillon',
    ARCHIVED: 'Archivé',
    SCHEDULED: 'Programmé',
  };
  return map[status] ?? status;
}

function statusBadgeClass(status: string) {
  const base =
    'inline-flex gap-1.5 items-center justify-center rounded-full px-2.5 text-xs font-medium border';

  switch (status) {
    case 'PUBLISHED':
      return `${base} bg-emerald-100 text-emerald-700 border-emerald-300`;
    case 'DRAFT':
      return `${base} bg-slate-100 text-slate-700 border-slate-300`;
    case 'ARCHIVED':
      return `${base} bg-amber-100 text-amber-800 border-amber-300`;
    case 'SCHEDULED':
      return `${base} bg-indigo-100 text-indigo-700 border-indigo-300`;
    default:
      return `${base} bg-slate-100 text-slate-700 border-slate-300`;
  }
}

type LessonItemProps = {
  lesson: Lesson;
  resourcesCount?: number;
  quizLabel?: string | null;
  href?: string; // lien vers le détail
  onEdit?: (lesson: Lesson) => void; // ouvre ton edit form/popup
};

export default function LessonItem({
  lesson,
  resourcesCount = 0,
  quizLabel = null,
  href,
  onEdit,
}: LessonItemProps) {
  return (
    <div className='rounded-2xl bg-white shadow-sm border border-slate-100 px-6 py-5 flex gap-4'>
      {/* Left icon */}
      <div className='h-8 w-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0'>
        <Layers className='h-4 w-4 text-sky-500' />
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        {/* meta row */}
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-xs text-slate-500'>Leçon {lesson.order ?? 0}</span>

            <span className='inline-flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 px-2.5 text-xs text-slate-700'>
              {resourcesCount} ressource
            </span>

            <span className={statusBadgeClass(lesson.status)}>
              {lesson.status === 'PUBLISHED' && <Check className='h-3.5 w-3.5' />}
              {statusLabelFR(lesson.status)}
            </span>
          </div>

          {/* bouton edit */}
          {onEdit && (
            <button
              type='button'
              onClick={() => onEdit(lesson)}
              className='h-8 w-8 rounded-2xl bg-primary-50 hover:bg-primary-400 flex items-center justify-center shrink-0'
              aria-label='Modifier la leçon'
            >
              <Pencil className='h-3 w-3 text-slate-600' />
            </button>
          )}
        </div>

        {/* title cliquable */}
        <div className='mt-1 text-sm text-slate-900 truncate'>
          {href ? (
            <Link
              href={href}
              className='no-underline hover:no-underline hover:text-sm hover:font-semibold hover:text-primary-400'
            >
              {lesson.title}
            </Link>
          ) : (
            lesson.title
          )}
        </div>

        {/* subtitle */}
        <div className='mt-1 text-xs text-slate-500 line-clamp-1'>{lesson.description}</div>

        {/* footer row */}
        <div className='mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500'>
          <span className='inline-flex text-xs items-center gap-1.5'>
            <Clock className='h-3 w-3' />
            {minutesLabel(lesson.duration)}
          </span>

          {quizLabel ? (
            <span className='inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs text-orange-700'>
              <ClipboardCheck className='h-3 w-3' />
              {quizLabel}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
