import type { LessonStatus } from '@/domain/formations/entities/Lesson';
import type { ChapterDTO } from './ChapterDTO';

export interface LessonDTO {
  id: string;
  //   moduleId: string;
  title: string;
  description: string;
  duration: number; // minutes
  order: number;
  status: LessonStatus;
  chapters: ChapterDTO[];
  chaptersCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
