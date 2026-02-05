import type { UseCase } from '@/domain/shared/UseCase';
import type { QuizProgressDTO } from '@/domain/formations/value-objects/QuizProgressDTO';

export interface GetQuizProgressQuery {
  quizId: string;
  userId: string;
}

export interface GetQuizProgressUseCase extends UseCase<GetQuizProgressQuery, QuizProgressDTO> {}
