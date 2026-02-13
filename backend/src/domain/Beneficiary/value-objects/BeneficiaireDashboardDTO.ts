export interface BeneficiaireDashboardStats {
  modulesCompleted: { current: number; total: number };
  learningTime: string;
  quizzesPassed: { current: number; total: number };
  globalProgress: number;
  modulesCompletedTrend?: string;
  learningTimeTrend?: string;
  globalProgressTrend?: string;
  quizzesPassedTrend?: string;
  videosWatched: { current: number; total: number };
  videosWatchedTrend?: string;
  averageSessionTime: string;
  learningStreakDays: number;
}

export interface BeneficiaireModuleStats {
  completed: number;
  inProgress: number;
  notStarted: number;
  total: number;
}

export interface BeneficiaireMonthlyProgress {
  month: string;
  progress: number;
  totalMinutes: number;
  sessions: number;
}

export interface BeneficiaireRecentActivity {
  chapterId: string;
  chapterTitle: string;
  lessonTitle: string;
  moduleTitle: string;
  progress: number;
  lastWatchedAt: Date;
  remainingTime: string;
}

export interface BeneficiaireTimeByModule {
  moduleId: string;
  moduleTitle: string;
  totalSeconds: number;
  completionPercent: number;
}

export interface BeneficiaireDashboardDTO {
  stats: BeneficiaireDashboardStats;
  moduleStats: BeneficiaireModuleStats;
  monthlyProgress: BeneficiaireMonthlyProgress[];
  recentActivity: BeneficiaireRecentActivity[];
  timeByModule: BeneficiaireTimeByModule[];
}
