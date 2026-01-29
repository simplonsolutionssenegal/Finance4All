import type { UseCase } from '@/domain/shared/UseCase';
import type { QuizDTO } from '@/domain/formations/value-objects/QuizDTO';

export interface GetQuizByIdUseCaseQuery {
  id: string;
}

export interface GetQuizByIdUseCase extends UseCase<GetQuizByIdUseCaseQuery, QuizDTO> {}
