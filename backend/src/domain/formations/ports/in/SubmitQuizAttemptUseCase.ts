import type { UseCase } from '@/domain/shared/UseCase';
import type { QuizAttemptDTO } from '@/domain/formations/value-objects/QuizAttemptDTO';

export interface SubmittedAnswer {
  questionIndex: number;
  selectedOptionIndexes: number[];
}

export interface SubmitQuizAttemptCommand {
  quizId: string;
  userId: string;
  answers: SubmittedAnswer[];
}

export interface SubmitQuizAttemptResult extends QuizAttemptDTO {
  maxAttempts: number;
  remainingAttempts: number;
  hasPassedQuiz: boolean;
}

export interface SubmitQuizAttemptUseCase
  extends UseCase<SubmitQuizAttemptCommand, SubmitQuizAttemptResult> {}
