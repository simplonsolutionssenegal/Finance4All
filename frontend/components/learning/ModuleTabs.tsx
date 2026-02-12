'use client';

import { FileText, Award } from 'lucide-react';
import { useState } from 'react';

import type { Lesson, Quiz, LessonProgressStatus } from '@/types/learning/lesson';
import type { QuizProgressDTO } from '@/types/learning/quiz-progress';

import LessonList from './LessonList';
import QuizList from './QuizList';

interface ModuleTabsProps {
  readonly moduleId: string;
  readonly lessons: Lesson[];
  readonly totalLessons: number;
  readonly quizzes: Quiz[];
  readonly lessonStatuses: Map<string, LessonProgressStatus>;
  readonly quizAvailability: Map<string, boolean>;
  readonly quizProgressMap: Map<string, QuizProgressDTO>;
}

export default function ModuleTabs({
  moduleId,
  lessons,
  totalLessons,
  quizzes,
  lessonStatuses,
  quizAvailability,
  quizProgressMap,
}: ModuleTabsProps) {
  const [activeTab, setActiveTab] = useState<'lessons' | 'quizzes'>('lessons');
  const totalQuizzes = quizzes.length;

  return (
    <>
      {/* Tabs Leçons / Quiz */}
      <div className='flex items-center gap-1 rounded-full bg-grey-100 px-1 py-1 text-sm shadow-sm'>
        <button
          type='button'
          onClick={() => setActiveTab('lessons')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-center transition-all ${
            activeTab === 'lessons'
              ? 'bg-white font-semibold text-secondary-400 shadow-sm'
              : 'text-secondary-300'
          }`}
        >
          <FileText
            className={`h-4 w-4 ${activeTab === 'lessons' ? 'text-secondary-400' : 'text-secondary-300'}`}
          />
          Leçons ({totalLessons})
        </button>
        <button
          type='button'
          onClick={() => setActiveTab('quizzes')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-center transition-all ${
            activeTab === 'quizzes'
              ? 'bg-white font-semibold text-secondary-400 shadow-sm'
              : 'text-secondary-300'
          }`}
        >
          <Award
            className={`h-4 w-4 ${activeTab === 'quizzes' ? 'text-secondary-400' : 'text-secondary-300'}`}
          />
          Quiz ({totalQuizzes})
        </button>
      </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'lessons' ? (
        <LessonList moduleId={moduleId} lessons={lessons} lessonStatuses={lessonStatuses} />
      ) : (
        <>
          <QuizList
            moduleId={moduleId}
            quizzes={quizzes}
            quizAvailability={quizAvailability}
            quizProgressMap={quizProgressMap}
          />
        </>
      )}
    </>
  );
}
