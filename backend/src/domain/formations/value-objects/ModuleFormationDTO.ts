import type { DifficultyLevel, ModuleStatus } from '../entities/ModuleFormation';
import type { LessonDTO } from '@/domain/formations/value-objects/LessonDTO';
import type { QuizDTO } from '@/domain/formations/value-objects/QuizDTO';

export interface ModuleResponseDTO {
  id: string;
  title: string;
  description: string;
  imageMediaId: string | null;
  thematics: string;
  difficultyLevel: DifficultyLevel;
  estimatedDuration: number;
  status: ModuleStatus;
  lessons: LessonDTO[];
  quizzes: QuizDTO[];
  createdAt: Date;
  updatedAt: Date;
}
