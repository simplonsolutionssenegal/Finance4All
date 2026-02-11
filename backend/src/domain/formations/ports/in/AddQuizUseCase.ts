import type { UseCase } from '@/domain/shared/UseCase';
import type { QuizStatus } from '@/domain/formations/entities/Quiz';
import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import type { QuestionDTO } from '@/domain/formations/value-objects/QuestionDTO';

export interface AddQuizCommand {
  title: string;
  description: string;
  status: QuizStatus;
  scoreMinimum: number;
  duree?: number;
  nombreTentatives: number;
  moduleId: string;
  lessonId: string;
  chapterId?: string;
  questions?: QuestionDTO[];
}

export interface AddQuizUseCase extends UseCase<AddQuizCommand, ModuleResponseDTO> {}
