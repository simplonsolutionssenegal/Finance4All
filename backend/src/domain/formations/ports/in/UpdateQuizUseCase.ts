// domain/formations/ports/in/UpdateQuizUseCase.ts

import type { UseCase } from '@/domain/shared/UseCase';
import type { QuizDTO } from '@/domain/formations/value-objects/QuizDTO';
import type { QuizStatus } from '@/domain/formations/entities/Quiz';
import type { QuestionDTO } from '@/domain/formations/value-objects/QuestionDTO';

export interface UpdateQuizCommand {
  id: string;
  title?: string;
  description?: string;
  status?: QuizStatus;
  scoreMinimum?: number;
  duree?: number;
  nombreTentatives?: number;
  questions?: QuestionDTO[];
}

export interface UpdateQuizUseCase extends UseCase<UpdateQuizCommand, QuizDTO> {}
