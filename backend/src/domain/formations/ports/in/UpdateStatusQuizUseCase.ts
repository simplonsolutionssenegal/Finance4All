import type { UseCase } from '@/domain/shared/UseCase';
import type { QuizStatus } from '@/domain/formations/entities/Quiz';
import type { QuizDTO } from '../../value-objects/QuizDTO';

export interface UpdateQuizStatusCommand {
  id: string;
  status: QuizStatus;
}

export interface UpdateQuizStatusUseCase extends UseCase<UpdateQuizStatusCommand, QuizDTO> {}
