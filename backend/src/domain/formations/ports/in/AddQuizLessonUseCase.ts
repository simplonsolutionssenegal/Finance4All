import type { UseCase } from '@/domain/shared/UseCase';
import type { QuizStatus } from '@/domain/formations/entities/Quiz';
import type { QuestionDTO } from '@/domain/formations/value-objects/QuestionDTO';
import type { LessonDTO } from '@/domain/formations/value-objects/LessonDTO';

export interface AddQuizLessonCommand {
  lessonId: string; // ✅ Requis, pas optionnel
  title: string;
  description: string;
  status: QuizStatus;
  scoreMinimum: number;
  duree?: number;
  nombreTentatives: number;
  questions?: QuestionDTO[];
}

export interface AddQuizLessonUseCase extends UseCase<AddQuizLessonCommand, LessonDTO> {}
