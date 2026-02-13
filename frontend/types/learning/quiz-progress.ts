export interface SubmittedAnswer {
  questionIndex: number;
  selectedOptionIndexes: number[];
}

export interface QuizAttemptDTO {
  id: string;
  quizId: string;
  userId: string;
  attemptNumber: number;
  earnedPoints: number;
  totalPoints: number;
  scorePercent: number;
  isPassed: boolean;
  answers: SubmittedAnswer[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttemptResult extends QuizAttemptDTO {
  maxAttempts: number;
  remainingAttempts: number;
  hasPassedQuiz: boolean;
}

export interface QuizProgressDTO {
  quizId: string;
  userId: string;
  totalAttempts: number;
  maxAttempts: number;
  remainingAttempts: number;
  hasPassed: boolean;
  bestScorePercent: number | null;
  lastScorePercent: number | null;
  lastAttemptAt: string | null;
}
