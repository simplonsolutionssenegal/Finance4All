import type { UseCase } from '@/domain/shared/UseCase';
import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import type { LessonStatus } from '@/domain/formations/entities/Lesson';
import type { ChapterDTO } from '@/domain/formations/value-objects/ChapterDTO';

export interface AddLessonCommand {
  moduleId: string;
  title: string;
  description: string;
  duration: number; // minutes
  order: number;
  status: LessonStatus;
  chapters?: ChapterDTO[];
}

export interface AddLessonUseCase extends UseCase<AddLessonCommand, ModuleResponseDTO> {}
