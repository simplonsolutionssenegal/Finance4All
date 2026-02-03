// domain/formations/ports/in/AddLessonUseCase.ts
import type { UseCase } from '@/domain/shared/UseCase';
import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import type { LessonStatus } from '@/domain/formations/entities/Lesson';
import type { ChapterDTO } from '@/domain/formations/value-objects/ChapterDTO';
import type { QuizDTO } from '@/domain/formations/value-objects/QuizDTO'; // ⭐ AJOUT

export interface AddLessonCommand {
  moduleId: string;
  title: string;
  description: string;
  duration: number;
  order: number;
  status: LessonStatus;
  chapters?: ChapterDTO[];
  quizzes?: QuizDTO[]; // ⭐ Quiz au niveau de la leçon
}

export interface AddLessonUseCase extends UseCase<AddLessonCommand, ModuleResponseDTO> {}
