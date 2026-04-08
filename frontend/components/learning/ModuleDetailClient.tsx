'use client';

import { useUser } from '@clerk/nextjs';
import { BookOpen, Award, TrendingUp, Clock, Target, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

import ModuleTabs from '@/components/learning/ModuleTabs';
import { Card, CardContent } from '@/components/ui/card';
import { useGetMediaById } from '@/hooks/media/useGetMediaById';
import { useMediaProgressMap } from '@/hooks/media/useMediaProgressMap';
import { useGetModuleById } from '@/hooks/module/useGetModuleById';
import { useQuizProgressMap } from '@/hooks/quiz/useQuizProgressMap';
import { DIFFICULTY_LABELS } from '@/lib/constants/module-constants';
import { isChapterViewed } from '@/lib/learning/chapter-progress';
import {
  mapLessonSummary,
  mapQuizzes,
  type BackendLesson,
  type BackendQuiz,
} from '@/lib/learning/learning-adapters';
import {
  QuizStatus,
  type Lesson,
  type Quiz,
  type LessonProgressStatus,
  type ChapterProgressStatus,
} from '@/types/learning/lesson';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Module introuvable ou indisponible.';
}

export default function ModuleDetailClient({ moduleId }: { moduleId: string }) {
  const { isLoaded: clerkLoaded } = useUser();
  const { module: moduleData, isLoading, isError, error, refetch } = useGetModuleById(moduleId);
  const { media: moduleImage } = useGetMediaById(moduleData?.imageMediaId ?? '');

  const rawLessons = useMemo(() => (moduleData?.lessons ?? []) as BackendLesson[], [moduleData]);
  const rawLessonsSorted = useMemo(() => {
    return rawLessons
      .filter(lesson => lesson.status === 'PUBLISHED')
      .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));
  }, [rawLessons]);

  const lessons = useMemo<Lesson[]>(() => {
    return rawLessonsSorted.map(lesson => mapLessonSummary(lesson, moduleData?.id ?? moduleId));
  }, [rawLessonsSorted, moduleData, moduleId]);

  const quizzes = useMemo<Quiz[]>(() => {
    const rawQuizzes = (moduleData?.quizzesGlobal ?? []) as BackendQuiz[];
    return mapQuizzes(rawQuizzes, moduleData?.id ?? moduleId).filter(
      quiz => quiz.status === QuizStatus.PUBLISHED
    );
  }, [moduleData, moduleId]);

  const { progressMap } = useQuizProgressMap(quizzes.map(quiz => quiz.id));

  // Collect all chapter mediaIds to fetch their reading/viewing progress
  const chapterMediaIds = useMemo(() => {
    return rawLessonsSorted.flatMap(lesson =>
      (lesson.chapters ?? []).map(ch => ch.mediaId ?? ch.media?.id)
    );
  }, [rawLessonsSorted]);

  const { mediaProgressMap } = useMediaProgressMap(chapterMediaIds);

  const { lessonStatuses, quizAvailability, completedLessons, globalProgress, startedLessonIds } =
    useMemo(() => {
      const lessonStatuses = new Map<string, LessonProgressStatus>();
      const lessonCompletionMap = new Map<string, boolean>();
      const lessonChapterCompleteMap = new Map<string, boolean>();
      const chapterStatusMap = new Map<string, ChapterProgressStatus>();
      const quizAvailability = new Map<string, boolean>();
      // Per-lesson chapter progress: stores completedChapters / totalChapters for each lesson
      const lessonProgressMap = new Map<string, number>();
      // Lessons where at least one chapter has been viewed
      const startedLessonIds = new Set<string>();

      const quizzesByChapter = new Map<string, Quiz[]>();
      const quizzesByLesson = new Map<string, Quiz[]>();

      const hasPassed = (quizId: string) => progressMap.get(quizId)?.hasPassed === true;

      quizzes.forEach(quiz => {
        if (quiz.chapterId) {
          const list = quizzesByChapter.get(quiz.chapterId) ?? [];
          list.push(quiz);
          quizzesByChapter.set(quiz.chapterId, list);
          return;
        }
        if (quiz.lessonId) {
          const list = quizzesByLesson.get(quiz.lessonId) ?? [];
          list.push(quiz);
          quizzesByLesson.set(quiz.lessonId, list);
          return;
        }
        // module-level quiz
      });

      let lessonsUnlocked = true;

      rawLessonsSorted.forEach(lesson => {
        const isLessonUnlocked = lessonsUnlocked;
        const chapters = [...(lesson.chapters ?? [])].sort(
          (a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)
        );
        let chapterUnlocked = true;
        let allChaptersComplete = true;
        let lessonCompletedChapters = 0;

        chapters.forEach((chapter, chapterIndex) => {
          const chapterQuizzes = quizzesByChapter.get(chapter.id) ?? [];
          const chapterMediaId = chapter.mediaId ?? chapter.media?.id;
          const hasMedia = Boolean(chapterMediaId);
          const hasQuizzes = chapterQuizzes.length > 0;

          // --- Completion (for progression) ---
          // For trackable media (video, audio, PDF) the backend stores MediaProgress.
          // For non-trackable media (image) there is no entry in the map → fall back to viewed.
          const mediaProgress = hasMedia ? mediaProgressMap.get(chapterMediaId!) : undefined;
          const isTrackableMedia = hasMedia && mediaProgress !== undefined;
          const mediaComplete = isTrackableMedia
            ? mediaProgress.isCompleted === true
            : !hasMedia || isChapterViewed(chapter.id); // image or no media → viewed is enough
          const quizzesComplete = hasQuizzes ? chapterQuizzes.every(q => hasPassed(q.id)) : true;
          const chapterComplete =
            isTrackableMedia || hasQuizzes
              ? mediaComplete && quizzesComplete
              : isChapterViewed(chapter.id);

          if (chapterComplete) {
            lessonCompletedChapters++;
          } else {
            allChaptersComplete = false;
          }

          // --- Unlocking (for navigation) ---
          const previousViewed =
            chapterIndex === 0 || isChapterViewed(chapters[chapterIndex - 1].id);

          let status: ChapterProgressStatus = 'LOCKED';
          if (isLessonUnlocked && previousViewed) {
            status = chapterComplete ? 'DONE' : 'CURRENT';
          }

          chapterStatusMap.set(chapter.id, status);

          if (isLessonUnlocked && chapterUnlocked && !chapterComplete) {
            chapterUnlocked = false;
          }
        });

        // Detect if user has started this lesson (at least one chapter viewed)
        if (chapters.some(ch => isChapterViewed(ch.id))) {
          startedLessonIds.add(lesson.id);
        }

        // Lesson progress = ratio of completed chapters in this lesson
        const lessonProgress = chapters.length > 0 ? lessonCompletedChapters / chapters.length : 0;
        lessonProgressMap.set(lesson.id, lessonProgress);

        const lessonQuizzes = quizzesByLesson.get(lesson.id) ?? [];
        const lessonQuizComplete =
          lessonQuizzes.length === 0 || lessonQuizzes.every(q => hasPassed(q.id));
        const lessonComplete = allChaptersComplete && lessonQuizComplete;

        let lessonStatus: LessonProgressStatus = 'LOCKED';
        if (isLessonUnlocked) {
          lessonStatus = lessonComplete ? 'DONE' : 'CURRENT';
        }

        lessonStatuses.set(lesson.id, lessonStatus);
        lessonCompletionMap.set(lesson.id, lessonComplete);
        lessonChapterCompleteMap.set(lesson.id, allChaptersComplete);

        if (lessonsUnlocked && !lessonComplete) {
          lessonsUnlocked = false;
        }
      });

      const completedLessons = rawLessonsSorted.filter(lesson =>
        lessonCompletionMap.get(lesson.id)
      ).length;

      const allLessonsComplete =
        rawLessonsSorted.length > 0 &&
        rawLessonsSorted.every(lesson => lessonCompletionMap.get(lesson.id));

      quizzes.forEach(quiz => {
        let available = true;
        if (quiz.chapterId) {
          available = chapterStatusMap.get(quiz.chapterId) !== 'LOCKED';
        } else if (quiz.lessonId) {
          const lessonStatus = lessonStatuses.get(quiz.lessonId);
          const chaptersComplete = lessonChapterCompleteMap.get(quiz.lessonId) ?? false;
          available = lessonStatus !== 'LOCKED' && chaptersComplete;
        } else {
          available = allLessonsComplete;
        }
        quizAvailability.set(quiz.id, available);
      });

      // Module progress = average of lesson progresses (each lesson weighted equally)
      const lessonCount = rawLessonsSorted.length;
      const globalProgress =
        lessonCount > 0
          ? Math.round(
              (rawLessonsSorted.reduce(
                (sum, lesson) => sum + (lessonProgressMap.get(lesson.id) ?? 0),
                0
              ) /
                lessonCount) *
                100
            )
          : 0;

      return {
        lessonStatuses,
        quizAvailability,
        completedLessons,
        globalProgress,
        startedLessonIds,
      };
    }, [rawLessonsSorted, quizzes, progressMap, mediaProgressMap]);

  const totalLessons = lessons.length;
  const totalQuizzes = quizzes.length;
  const quizzesPassed = useMemo(
    () => quizzes.filter(quiz => progressMap.get(quiz.id)?.hasPassed).length,
    [quizzes, progressMap]
  );
  const averageScore = useMemo(() => {
    const scores = quizzes
      .map(quiz => progressMap.get(quiz.id)?.bestScorePercent)
      .filter((score): score is number => typeof score === 'number');
    if (scores.length === 0) return 0;
    const total = scores.reduce((sum, score) => sum + score, 0);
    return Math.round(total / scores.length);
  }, [quizzes, progressMap]);

  if (!clerkLoaded) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='animate-pulse text-gray-500 font-medium'>Chargement...</div>
      </div>
    );
  }

  if (isError) {
    const message = error ? getErrorMessage(error) : 'Module introuvable ou indisponible.';
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6'>
        <p className='text-red-600 font-medium'>{message}</p>
        <button
          type='button'
          onClick={() => refetch()}
          className='mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800'
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (isLoading || !moduleData) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='animate-pulse text-gray-500 font-medium'>Chargement du module...</div>
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
        <Link
          href='/learning'
          className='inline-flex items-center gap-2 text-sm text-grey-600 hover:text-primary-600 self-start'
        >
          <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm'>
            ←
          </span>{' '}
          Retour aux modules
        </Link>

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
              <p className='text-xs text-secondary-300'>Leçons complétées</p>
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
              <p className='text-xl font-semibold text-secondary-400'>{globalProgress}%</p>
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
              <p className='text-xl font-semibold text-secondary-400'>{averageScore}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs leçons / Quiz + contenu */}
        <div className='flex flex-col gap-4'>
          <ModuleTabs
            moduleId={moduleData.id}
            lessons={lessons}
            totalLessons={totalLessons}
            quizzes={quizzes}
            lessonStatuses={lessonStatuses}
            quizAvailability={quizAvailability}
            quizProgressMap={progressMap}
            startedLessonIds={startedLessonIds}
          />
        </div>
      </div>
    </div>
  );
}
