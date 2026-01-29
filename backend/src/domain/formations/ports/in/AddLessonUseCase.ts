import type { Chapter } from './../../entities/Chapter';
import type { UseCase } from '@/domain/shared/UseCase';
import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import type { LessonStatus } from '@/domain/formations/entities/Lesson';

export interface AddLessonCommand {
  moduleId: string;
  title: string;
  description: string;
  duration: number; // minutes
  order: number;
  status: LessonStatus;
  chapters?: Chapter[];
}

export interface AddLessonUseCase extends UseCase<AddLessonCommand, ModuleResponseDTO> {}
