'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import QuizRunner from '@/components/learning/QuizRunner';
import { useGetLessonById } from '@/hooks/lesson/useGetLessonById';
import { useGetModuleById } from '@/hooks/module/useGetModuleById';
import { useGetQuizById } from '@/hooks/quiz/useGetQuizById';
import {
  mapChapters,
  mapLessonSummary,
  mapQuiz,
  type BackendLesson,
  type BackendQuiz,
} from '@/lib/learning/learning-adapters';
import { QuizStatus, type Lesson, type Quiz } from '@/types/learning/lesson';

export default function QuizPageClient({ moduleId, quizId }: { moduleId: string; quizId: string }) {
  const { module: moduleData } = useGetModuleById(moduleId);
  const { quiz: rawQuiz, isLoading, isError } = useGetQuizById<BackendQuiz>(quizId);

  const quiz = useMemo<Quiz | null>(() => {
    if (!rawQuiz) return null;
    return mapQuiz(rawQuiz, moduleId);
  }, [rawQuiz, moduleId]);

  const lessonsSorted = useMemo<Lesson[]>(() => {
    const rawLessons = (moduleData?.lessons ?? []) as BackendLesson[];
    return rawLessons
      .filter(lesson => lesson.status === 'PUBLISHED')
      .map(lesson => mapLessonSummary(lesson, moduleData?.id ?? moduleId))
      .sort((a, b) => a.order - b.order);
  }, [moduleData, moduleId]);

  const { lesson: lessonDetails } = useGetLessonById<BackendLesson>(quiz?.lessonId ?? '');
  const lessonOrder = useMemo(() => {
    if (!quiz?.lessonId) return undefined;
    const fromModule = lessonsSorted.find(lesson => lesson.id === quiz.lessonId)?.order;
    if (fromModule != null) return fromModule;
    const fromLesson = Number(lessonDetails?.order);
    return Number.isFinite(fromLesson) ? fromLesson : undefined;
  }, [quiz?.lessonId, lessonsSorted, lessonDetails]);

  const chapters = useMemo(() => {
    if (!lessonDetails) return [];
    return mapChapters(lessonDetails.id, lessonDetails.chapters ?? []);
  }, [lessonDetails]);

  const lessonQuiz = useMemo<Quiz | null>(() => {
    if (!quiz?.lessonId) return null;
    const rawQuizzes = (moduleData?.quizzesGlobal ?? []) as BackendQuiz[];
    const mapped = rawQuizzes
      .map(item => mapQuiz(item, moduleData?.id ?? moduleId))
      .filter(item => item.status === QuizStatus.PUBLISHED);
    return mapped.find(item => item.lessonId === quiz.lessonId && !item.chapterId) ?? null;
  }, [moduleData, moduleId, quiz?.lessonId]);

  const afterSuccessRedirect = useMemo(() => {
    if (!quiz) return `/learning/${moduleId}`;

    if (quiz.chapterId && quiz.lessonId) {
      const currentIndex = chapters.findIndex(ch => ch.id === quiz.chapterId);
      if (lessonOrder != null && currentIndex >= 0 && currentIndex + 1 < chapters.length) {
        const nextChapter = chapters[currentIndex + 1];
        return `/learning/${moduleId}/lesson/${lessonOrder}?chapter=${nextChapter.id}`;
      }
      if (lessonQuiz && lessonQuiz.id !== quiz.id) {
        return `/learning/${moduleId}/quiz/${lessonQuiz.id}`;
      }
      return `/learning/${moduleId}`;
    }

    return `/learning/${moduleId}`;
  }, [quiz, moduleId, lessonOrder, chapters, lessonQuiz]);

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
