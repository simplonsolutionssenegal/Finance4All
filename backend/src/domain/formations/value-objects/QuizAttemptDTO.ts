export interface QuizAttemptDTO {
  id: string;
  quizId: string;
  userId: string;
  attemptNumber: number;
  earnedPoints: number;
  totalPoints: number;
  scorePercent: number;
  isPassed: boolean;
  answers:
    | {
        questionIndex: number;
        selectedOptionIndexes: number[];
      }[]
    | null;
  createdAt: Date;
  updatedAt: Date;
}
