'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import LessonDetailContent from '@/components/learning/LessonDetailContent';
import { useGetLessonById } from '@/hooks/lesson/useGetLessonById';
import { useGetModuleById } from '@/hooks/module/useGetModuleById';
import {
  mapChapters,
  mapLessonSummary,
  mapQuizzes,
  type BackendLesson,
  type BackendQuiz,
  type BackendChapter,
} from '@/lib/learning/learning-adapters';
import { QuizStatus, type Lesson, type Chapter, type Quiz } from '@/types/learning/lesson';

export default function LessonPageClient({ moduleId, order }: { moduleId: string; order: number }) {
  const {
    module: moduleData,
    isLoading: moduleLoading,
    isError: moduleError,
  } = useGetModuleById(moduleId);

  const lessonsSorted = useMemo<Lesson[]>(() => {
    const rawLessons = (moduleData?.lessons ?? []) as BackendLesson[];
    return rawLessons
      .filter(lesson => lesson.status === 'PUBLISHED')
      .map(lesson => mapLessonSummary(lesson, moduleData?.id ?? moduleId))
      .sort((a, b) => a.order - b.order);
  }, [moduleData, moduleId]);

  const currentLesson = lessonsSorted.find(lesson => lesson.order === order);

  const {
    lesson: lessonDetails,
    isLoading: lessonLoading,
    isError: lessonError,
  } = useGetLessonById<BackendLesson>(currentLesson?.id ?? '');

  const chapters = useMemo<Chapter[]>(() => {
    if (!lessonDetails) return [];
    return mapChapters(lessonDetails.id, lessonDetails.chapters ?? []);
  }, [lessonDetails]);

  const quizzes = useMemo<Quiz[]>(() => {
    if (!lessonDetails) return [];
    const moduleIdFallback = moduleData?.id ?? moduleId;
    const lessonQuizzes = mapQuizzes(
      (lessonDetails.quizzes ?? []) as BackendQuiz[],
      moduleIdFallback
    );
    const chapterQuizzes = (lessonDetails.chapters ?? []).flatMap(chapter =>
      mapQuizzes((chapter as BackendChapter).quizzes ?? [], moduleIdFallback)
    );
    return [...lessonQuizzes, ...chapterQuizzes].filter(
      quiz => quiz.status === QuizStatus.PUBLISHED
    );
  }, [lessonDetails, moduleData, moduleId]);

  const totalLessons = lessonsSorted.length;
  const currentIndex = currentLesson
    ? lessonsSorted.findIndex(lesson => lesson.id === currentLesson.id) + 1
    : 1;
  const headerProgress = totalLessons > 0 ? (currentIndex / totalLessons) * 100 : 0;

  if (moduleLoading || (currentLesson && lessonLoading)) {
    return (
      <div className='min-h-screen bg-grey-50 text-grey-900'>
        <div className='mx-auto flex max-w-5xl flex-col gap-6 px-6 pb-12 pt-6'>
          <p className='text-sm text-grey-600'>Chargement de la leçon...</p>
        </div>
      </div>
    );
  }

  if (moduleError || lessonError || !moduleData) {
    return (
      <div className='min-h-screen bg-grey-50 text-grey-900'>
        <div className='mx-auto flex max-w-5xl flex-col gap-6 px-6 pb-12 pt-6'>
          <div className='rounded-3xl bg-white p-8 text-center text-grey-600'>
            Leçon introuvable
          </div>
        </div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className='min-h-screen bg-grey-50 text-grey-900'>
        <div className='mx-auto flex max-w-5xl flex-col gap-6 px-6 pb-12 pt-6'>
          <div className='rounded-3xl bg-white p-8 text-center text-grey-600'>
            Leçon introuvable
          </div>
        </div>
      </div>
    );
  }

  const lessonTitle = lessonDetails?.title ?? currentLesson.title;
  const lessonDescription = lessonDetails?.description ?? currentLesson.description;

  return (
    <div className='min-h-screen bg-grey-50 text-grey-900'>
      <div className='mx-auto flex max-w-5xl flex-col gap-6 px-6 pb-12 pt-6'>
        {/* Barre supérieure : retour module + progression leçon */}
        <header className='space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <Link
              href={`/learning/${moduleId}`}
              className='inline-flex items-center gap-2 text-xs text-grey-700 hover:text-primary-600'
            >
              <span className='text-base'>←</span>
              <span>Retour au module</span>
            </Link>

            <span className='text-xs font-medium text-grey-500'>
              Leçon {currentIndex} sur {totalLessons}
            </span>
          </div>

          <div className='h-1 w-full overflow-hidden rounded-full bg-grey-200'>
            <div
              className='h-full rounded-full bg-primary-400'
              style={{ width: `${headerProgress}%` }}
            />
          </div>
        </header>

        {/* Carte principale avec colonne gauche (menu leçon) + droite (vidéo + contenu) */}
        <LessonDetailContent
          moduleId={moduleId}
          lessonTitle={lessonTitle}
          lessonDescription={lessonDescription}
          chapters={chapters}
          quizzes={quizzes}
        />
      </div>
    </div>
  );
}
