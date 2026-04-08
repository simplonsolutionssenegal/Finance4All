'use client';

import { useAuth } from '@clerk/nextjs';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { apiClient } from '@/lib/api-client';
import { useMediaProgressMap } from '@/hooks/media/useMediaProgressMap';
import { useQuizProgressMap } from '@/hooks/quiz/useQuizProgressMap';
import { isChapterViewed } from '@/lib/learning/chapter-progress';
import { mapQuizzes, type BackendLesson, type BackendQuiz } from '@/lib/learning/learning-adapters';
import { QuizStatus, type Quiz } from '@/types/learning/lesson';
import type { Module } from '@/types/modules/module';
import { UserModuleStatus, type LearningModule } from '@/types/learning-module';

type GetModuleByIdResponse = {
  success: boolean;
  data: Module;
  message?: string;
};

export interface ModuleProgressInfo {
  progressPercent: number;
  userStatus: UserModuleStatus;
  completedLessons: number;
  totalLessons: number;
  quizzesPassed: number;
  totalQuizzes: number;
  averageScore: number;
  /** True if the user has viewed at least one chapter in this module */
  hasStarted: boolean;
}

/**
 * Fetches full details for a list of modules and computes real per-module
 * progress using the same logic as ModuleDetailClient.
 *
 * Returns enriched LearningModule[] with accurate `progressPercent` and `userStatus`.
 */
export function useModulesWithProgress(modules: LearningModule[]) {
  const { getToken } = useAuth();
  const moduleIds = useMemo(() => modules.map(m => m.id), [modules]);

  // 1. Fetch full module details for each module
  const moduleDetailQueries = useQueries({
    queries: moduleIds.map(id => ({
      queryKey: ['module', id],
      enabled: Boolean(id),
      queryFn: async () => {
        const token = await getToken();
        return apiClient<GetModuleByIdResponse>(`modules/${id}`, 'GET', token);
      },
      staleTime: 5 * 60 * 1000,
    })),
  });

  const moduleDetails = useMemo(() => {
    const map = new Map<string, Module>();
    moduleDetailQueries.forEach(query => {
      const data = query.data?.data;
      if (data?.id) map.set(data.id, data);
    });
    return map;
  }, [moduleDetailQueries]);

  const detailsLoading = moduleDetailQueries.some(q => q.isLoading);

  // 2. Collect all chapter mediaIds and all quiz IDs across all modules
  const { allMediaIds, allQuizIds, allQuizzes } = useMemo(() => {
    const mediaIds: (string | undefined)[] = [];
    const quizIds: string[] = [];
    const quizzesList: { moduleId: string; quiz: Quiz }[] = [];

    moduleDetails.forEach((mod, moduleId) => {
      const rawLessons = (mod.lessons ?? []) as BackendLesson[];
      rawLessons.forEach(lesson => {
        (lesson.chapters ?? []).forEach(ch => {
          const mediaId = ch.mediaId ?? ch.media?.id;
          if (mediaId) mediaIds.push(mediaId);
        });
      });

      const rawQuizzes = (mod.quizzesGlobal ?? []) as BackendQuiz[];
      const mappedQuizzes = mapQuizzes(rawQuizzes, moduleId).filter(
        q => q.status === QuizStatus.PUBLISHED
      );
      mappedQuizzes.forEach(quiz => {
        quizIds.push(quiz.id);
        quizzesList.push({ moduleId, quiz });
      });
    });

    return { allMediaIds: mediaIds, allQuizIds: quizIds, allQuizzes: quizzesList };
  }, [moduleDetails]);

  // 3. Fetch media progress and quiz progress in parallel
  const { mediaProgressMap, isLoading: mediaLoading } = useMediaProgressMap(allMediaIds);
  const { progressMap: quizProgressMap, isLoading: quizLoading } = useQuizProgressMap(allQuizIds);

  // 4. Compute per-module progress
  const progressByModule = useMemo(() => {
    const result = new Map<string, ModuleProgressInfo>();

    const hasPassed = (quizId: string) => quizProgressMap.get(quizId)?.hasPassed === true;

    moduleDetails.forEach((mod, moduleId) => {
      const rawLessons = (mod.lessons ?? []) as BackendLesson[];
      const sortedLessons = rawLessons
        .filter(l => l.status === 'PUBLISHED')
        .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));

      // Get module quizzes
      const moduleQuizzes = allQuizzes.filter(q => q.moduleId === moduleId).map(q => q.quiz);

      const quizzesByChapter = new Map<string, Quiz[]>();
      const quizzesByLesson = new Map<string, Quiz[]>();

      moduleQuizzes.forEach(quiz => {
        if (quiz.chapterId) {
          const list = quizzesByChapter.get(quiz.chapterId) ?? [];
          list.push(quiz);
          quizzesByChapter.set(quiz.chapterId, list);
        } else if (quiz.lessonId) {
          const list = quizzesByLesson.get(quiz.lessonId) ?? [];
          list.push(quiz);
          quizzesByLesson.set(quiz.lessonId, list);
        }
      });

      let totalCompletedLessons = 0;
      let moduleHasStarted = false;
      const lessonProgressMap = new Map<string, number>();

      sortedLessons.forEach(lesson => {
        const chapters = [...(lesson.chapters ?? [])].sort(
          (a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)
        );
        let lessonCompletedChapters = 0;
        let allChaptersComplete = true;

        chapters.forEach(chapter => {
          const chapterQuizzes = quizzesByChapter.get(chapter.id) ?? [];
          const chapterMediaId = chapter.mediaId ?? chapter.media?.id;
          const hasMedia = Boolean(chapterMediaId);
          const hasQuizzes = chapterQuizzes.length > 0;

          const mediaProgress = hasMedia ? mediaProgressMap.get(chapterMediaId!) : undefined;
          const isTrackableMedia = hasMedia && mediaProgress !== undefined;
          const mediaComplete = isTrackableMedia
            ? mediaProgress.isCompleted === true
            : !hasMedia || isChapterViewed(chapter.id);
          const quizzesComplete = hasQuizzes ? chapterQuizzes.every(q => hasPassed(q.id)) : true;
          const chapterComplete =
            isTrackableMedia || hasQuizzes
              ? mediaComplete && quizzesComplete
              : isChapterViewed(chapter.id);

          if (chapterComplete) lessonCompletedChapters++;
          else allChaptersComplete = false;

          if (isChapterViewed(chapter.id)) moduleHasStarted = true;
        });

        const lessonProgress = chapters.length > 0 ? lessonCompletedChapters / chapters.length : 0;
        lessonProgressMap.set(lesson.id, lessonProgress);

        const lessonQuizzes = quizzesByLesson.get(lesson.id) ?? [];
        const lessonQuizComplete =
          lessonQuizzes.length === 0 || lessonQuizzes.every(q => hasPassed(q.id));
        const lessonComplete = allChaptersComplete && lessonQuizComplete;

        if (lessonComplete) totalCompletedLessons++;
      });

      const lessonCount = sortedLessons.length;
      const progressPercent =
        lessonCount > 0
          ? Math.round(
              (sortedLessons.reduce(
                (sum, lesson) => sum + (lessonProgressMap.get(lesson.id) ?? 0),
                0
              ) /
                lessonCount) *
                100
            )
          : 0;

      const totalQuizzes = moduleQuizzes.length;
      const quizzesPassed = moduleQuizzes.filter(q => hasPassed(q.id)).length;
      const scores = moduleQuizzes
        .map(q => quizProgressMap.get(q.id)?.bestScorePercent)
        .filter((s): s is number => typeof s === 'number');
      const averageScore =
        scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0;

      let userStatus: UserModuleStatus;
      if (progressPercent >= 100) {
        userStatus = UserModuleStatus.COMPLETED;
      } else if (moduleHasStarted) {
        userStatus = UserModuleStatus.IN_PROGRESS;
      } else {
        userStatus = UserModuleStatus.AVAILABLE;
      }

      result.set(moduleId, {
        progressPercent,
        userStatus,
        completedLessons: totalCompletedLessons,
        totalLessons: lessonCount,
        quizzesPassed,
        totalQuizzes,
        averageScore,
        hasStarted: moduleHasStarted,
      });
    });

    return result;
  }, [moduleDetails, allQuizzes, mediaProgressMap, quizProgressMap]);

  // 5. Enrich modules with real progress
  const enrichedModules = useMemo<LearningModule[]>(() => {
    return modules.map(mod => {
      const progress = progressByModule.get(mod.id);
      if (!progress) return mod;
      return {
        ...mod,
        progressPercent: progress.progressPercent,
        userStatus: progress.userStatus,
      };
    });
  }, [modules, progressByModule]);

  const isLoading = detailsLoading || mediaLoading || quizLoading;

  return {
    enrichedModules,
    progressByModule,
    isLoading,
  };
}
