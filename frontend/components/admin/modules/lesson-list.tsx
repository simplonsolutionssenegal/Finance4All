'use client';

import { FileText, Plus } from 'lucide-react';

import LessonItem from './lesson-item';

import type { Lesson } from '@/types/modules/Lesson';

type LessonListProps = {
  lessons: Lesson[];
  moduleId: string;
  onCreate?: () => void;
  onEdit?: (lesson: Lesson) => void;
};

function countLessonResources(lesson: Lesson): number {
  const chapters = lesson.chapters ?? [];
  return chapters.filter(ch => !!ch.mediaId && String(ch.mediaId).trim().length > 0).length;
}

export default function LessonList({ lessons, moduleId, onCreate, onEdit }: LessonListProps) {
  if (!lessons || lessons.length === 0) {
    return (
      <div className='rounded-2xl bg-white shadow-sm border border-slate-100 p-10 text-center'>
        <div className='mx-auto mb-4 h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center'>
          <FileText className='h-6 w-6 text-slate-400' />
        </div>
        <p className='text-slate-900 font-medium'>Aucune leçon pour le moment</p>
        <p className='mt-1 text-sm text-slate-500'>Crée une première leçon pour ce module.</p>

        {onCreate ? (
          <button
            onClick={onCreate}
            className='mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 text-sm font-medium'
          >
            <Plus className='h-4 w-4' />
            Ajouter une leçon
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {lessons.map(l => (
        <LessonItem
          key={l.id}
          lesson={l}
          resourcesCount={countLessonResources(l)}
          href={`/modules/${moduleId}/lessons/${l.id}`}
          onEdit={onEdit ? () => onEdit(l) : undefined}
        />
      ))}
    </div>
  );
}
