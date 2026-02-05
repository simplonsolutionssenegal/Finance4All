'use client';

import { BookOpen, Award, TrendingUp, Clock, Target, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useMemo } from 'react';

import ModuleTabs from '@/components/learning/ModuleTabs';
import { Card, CardContent } from '@/components/ui/card';
import { useGetMediaById } from '@/hooks/media/useGetMediaById';
import { useGetModuleById } from '@/hooks/module/useGetModuleById';
import { DIFFICULTY_LABELS } from '@/lib/constants/module-constants';
import {
  mapLessonSummary,
  mapQuizzes,
  type BackendLesson,
  type BackendQuiz,
} from '@/lib/learning/learning-adapters';
import { QuizStatus, type Lesson, type Quiz } from '@/types/learning/lesson';

export default function ModuleDetailClient({ moduleId }: { moduleId: string }) {
  const { module: moduleData, isLoading, isError } = useGetModuleById(moduleId);
  const { media: moduleImage } = useGetMediaById(moduleData?.imageMediaId ?? '');

  const lessons = useMemo<Lesson[]>(() => {
    const rawLessons = (moduleData?.lessons ?? []) as BackendLesson[];
    return rawLessons
      .filter(lesson => lesson.status === 'PUBLISHED')
      .map(lesson => mapLessonSummary(lesson, moduleData?.id ?? moduleId))
      .sort((a, b) => a.order - b.order);
  }, [moduleData, moduleId]);

  const quizzes = useMemo<Quiz[]>(() => {
    const rawQuizzes = (moduleData?.quizzesGlobal ?? []) as BackendQuiz[];
    return mapQuizzes(rawQuizzes, moduleData?.id ?? moduleId).filter(
      quiz => quiz.status === QuizStatus.PUBLISHED
    );
  }, [moduleData, moduleId]);

  const totalLessons = lessons.length;
  const totalQuizzes = quizzes.length;
  const completedLessons = 0;
  const quizzesPassed = 0;
  const averageScore = 0;
  const globalProgress = 0;

  if (isLoading) {
    return (
      <div className='min-h-[calc(100vh-3rem)] bg-grey-50 secondary-400'>
        <div className='mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-10 pt-4'>
          <p className='text-sm text-grey-600'>Chargement du module...</p>
        </div>
      </div>
    );
  }

  if (isError || !moduleData) {
    return (
      <div className='min-h-[calc(100vh-3rem)] bg-grey-50 secondary-400'>
        <div className='mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-10 pt-4'>
          <p className='rounded-2xl border border-grey-200 bg-white p-6 text-center text-sm text-grey-600 shadow-sm'>
            Module introuvable ou indisponible.
          </p>
        </div>
      </div>
    );
  }

  const difficultyLabel = moduleData.difficultyLevel
    ? DIFFICULTY_LABELS[moduleData.difficultyLevel]
    : 'Niveau';

  return (
    <div className='min-h-[calc(100vh-3rem)] bg-grey-50 secondary-400'>
      <div className='mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-10 pt-4'>
        {/* Lien retour */}
        <button
          type='button'
          className='inline-flex items-center gap-2 text-sm text-grey-600 hover:text-primary-600 self-start'
        >
          <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm'>
            ←
          </span>{' '}
          Retour aux modules
        </button>

        {/* En-tête module */}
        <Card className='border-none bg-white shadow-secondary-lg'>
          <CardContent className='flex flex-col gap-6 p-6 md:flex-row'>
            {/* Image */}
            <div className='relative h-40 w-full overflow-hidden rounded-2xl bg-grey-900 md:h-48 md:w-72'>
              <div className='absolute inset-0 bg-gradient-to-br from-grey-800 to-grey-900' />
              {moduleImage?.url && (
                <Image
                  src={moduleImage.url}
                  alt={moduleData.title}
                  fill
                  sizes='(max-width: 768px) 100vw, 288px'
                  className='object-cover'
                  unoptimized
                />
              )}
              <div className='absolute left-4 top-4 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700'>
                {difficultyLabel}
              </div>
            </div>

            {/* Texte */}
            <div className='flex-1 space-y-4'>
              <div>
                <h1 className='text-2xl font-semibold text-secondary-300'>{moduleData.title}</h1>
                <p className='mt-1 text-sm text-grey-600'>{moduleData.description}</p>
              </div>

              <div className='flex flex-wrap items-center gap-4 text-xs text-secondary-200'>
                <div className='inline-flex items-center gap-1'>
                  <BookOpen className='h-4 w-4 text-primary-600' />
                  <span>{totalLessons} leçons</span>
                </div>
                <div className='inline-flex items-center gap-1'>
                  <Award className='h-4 w-4 text-success-600' />
                  <span>Certificat inclus</span>
                </div>
                <div className='inline-flex items-center gap-1'>
                  <Clock className='h-4 w-4 text-warning-500' />
                  <span>{moduleData.estimatedDuration} min</span>
                </div>
              </div>

              {/* Progression barre */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-xs text-grey-600'>
                  <span>Votre progression</span>
                  <span>{globalProgress}%</span>
                </div>
                <div className='relative h-2 overflow-hidden rounded-full bg-grey-200'>
                  <div
                    className='absolute inset-y-0 left-0 rounded-full bg-primary-400'
                    style={{ width: `${globalProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card className='border-grey-200 bg-white shadow-sm'>
            <CardContent className='space-y-2 p-4'>
              <div className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-50'>
                <BookOpen className='h-4 w-4 text-primary-600' />
              </div>
              <p className='text-xs textsecondary-300'>Leçons complétées</p>
              <p className='text-xl font-semibold text-secondary-400'>
                {completedLessons}/{totalLessons}
              </p>
            </CardContent>
          </Card>

          <Card className='border-grey-200 bg-white shadow-sm'>
            <CardContent className='space-y-2 p-4'>
              <div className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-success-100'>
                <TrendingUp className='h-4 w-4 text-success-600' />
              </div>
              <p className='text-xs text-secondary-300'>Progression</p>
              <p className='text-xl font-semibold secondary-400'>{globalProgress}%</p>
            </CardContent>
          </Card>

          <Card className='border-grey-200 bg-white shadow-sm'>
            <CardContent className='space-y-2 p-4'>
              <div className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-warning-100'>
                <Trophy className='h-4 w-4 text-warning-500' />
              </div>
              <p className='text-xs text-secondary-300'>Quiz réussis</p>
              <p className='text-xl font-semibold text-secondary-400'>
                {quizzesPassed}/{totalQuizzes}
              </p>
            </CardContent>
          </Card>

          <Card className='border-grey-200 bg-white shadow-sm'>
            <CardContent className='space-y-2 p-4'>
              <div className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-50'>
                <Target className='h-4 w-4 text-primary-600' />
              </div>
              <p className='text-xs text-secondary-300'>Score moyen</p>
              <p className='text-xl font-semibold secondary-400'>{averageScore}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Leçons / Quiz + contenu */}
        <div className='flex flex-col gap-4'>
          <ModuleTabs
            moduleId={moduleData.id}
            lessons={lessons}
            totalLessons={totalLessons}
            quizzes={quizzes}
          />
        </div>
      </div>
    </div>
  );
}
