'use client';

import { useMemo } from 'react';

import { useGetLearningModules } from '@/hooks/module/useGetLearningModules';
import { useModulesWithProgress } from '@/hooks/learning/useModulesWithProgress';
import { UserModuleStatus } from '@/types/learning-module';

export interface DashboardStats {
  modulesCompleted: { current: number; total: number };
  learningTime: string;
  quizzesPassed: { current: number; total: number };
  globalProgress: number;
}

export interface DashboardModuleStats {
  completed: number;
  inProgress: number;
  notStarted: number;
  total: number;
}

/**
 * Client-side hook that computes real beneficiary dashboard statistics
 * by aggregating progress across all learning modules.
 *
 * This replaces the broken backend endpoint which used binary module completion
 * and hardcoded quiz stats.
 */
export function useBeneficiaryDashboardStats() {
  const { modules, isLoading: modulesLoading } = useGetLearningModules();
  const {
    enrichedModules,
    progressByModule,
    isLoading: progressLoading,
  } = useModulesWithProgress(modules);

  const { stats, moduleStats } = useMemo(() => {
    let totalModules = 0;
    let completedModules = 0;
    let inProgressModules = 0;
    let notStartedModules = 0;
    let totalQuizzes = 0;
    let quizzesPassed = 0;
    let progressSum = 0;
    let totalDurationMinutes = 0;

    enrichedModules.forEach(mod => {
      totalModules++;
      const progress = progressByModule.get(mod.id);

      if (mod.userStatus === UserModuleStatus.COMPLETED) {
        completedModules++;
      } else if (mod.userStatus === UserModuleStatus.IN_PROGRESS) {
        inProgressModules++;
      } else {
        notStartedModules++;
      }

      if (progress) {
        totalQuizzes += progress.totalQuizzes;
        quizzesPassed += progress.quizzesPassed;
        progressSum += progress.progressPercent;
      }

      // Estimate learning time from module's estimated duration weighted by progress
      if (progress && progress.progressPercent > 0) {
        totalDurationMinutes += Math.round(
          (mod.estimatedDuration ?? 0) * (progress.progressPercent / 100)
        );
      }
    });

    const globalProgress = totalModules > 0 ? Math.round(progressSum / totalModules) : 0;

    // Format learning time
    let learningTime: string;
    if (totalDurationMinutes >= 60) {
      const hours = Math.floor(totalDurationMinutes / 60);
      const mins = totalDurationMinutes % 60;
      learningTime = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else {
      learningTime = `${totalDurationMinutes}m`;
    }

    const stats: DashboardStats = {
      modulesCompleted: { current: completedModules, total: totalModules },
      learningTime,
      quizzesPassed: { current: quizzesPassed, total: totalQuizzes },
      globalProgress,
    };

    const moduleStats: DashboardModuleStats = {
      completed: completedModules,
      inProgress: inProgressModules,
      notStarted: notStartedModules,
      total: totalModules,
    };

    return { stats, moduleStats };
  }, [enrichedModules, progressByModule]);

  const isLoading = modulesLoading || progressLoading;

  return {
    stats,
    moduleStats,
    enrichedModules,
    isLoading,
  };
}
