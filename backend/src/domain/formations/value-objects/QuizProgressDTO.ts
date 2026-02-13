export interface QuizProgressDTO {
  quizId: string;
  userId: string;
  totalAttempts: number;
  maxAttempts: number;
  remainingAttempts: number;
  hasPassed: boolean;
  bestScorePercent: number | null;
  lastScorePercent: number | null;
  lastAttemptAt: Date | null;
}
