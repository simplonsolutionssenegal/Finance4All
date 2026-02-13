import type { QuizAttempt } from '@/domain/formations/entities/QuizAttempt';

export interface IQuizProgressRepository {
  save(attempt: QuizAttempt): Promise<QuizAttempt>;
  countAttemptsByUser(quizId: string, userId: string): Promise<number>;
  hasPassedQuiz(quizId: string, userId: string): Promise<boolean>;
  findLatestAttemptByUser(quizId: string, userId: string): Promise<QuizAttempt | null>;
  findBestAttemptByUser(quizId: string, userId: string): Promise<QuizAttempt | null>;
}
