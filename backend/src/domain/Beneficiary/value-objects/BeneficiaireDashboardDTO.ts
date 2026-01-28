export interface BeneficiaireDashboardStats {
  modulesCompleted: { current: number; total: number };
  learningTime: string;
  quizzesPassed: { current: number; total: number };
  globalProgress: number;
  modulesCompletedTrend?: string;
  learningTimeTrend?: string;
  globalProgressTrend?: string;
  quizzesPassedTrend?: string;
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
}

export interface BeneficiaireDashboardDTO {
  stats: BeneficiaireDashboardStats;
  moduleStats: BeneficiaireModuleStats;
  monthlyProgress: BeneficiaireMonthlyProgress[];
}
