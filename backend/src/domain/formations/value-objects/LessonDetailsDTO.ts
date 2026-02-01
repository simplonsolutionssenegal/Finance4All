// domain/formations/value-objects/LessonDetailsDTO.ts
import type { LessonStatus } from '@/domain/formations/entities/Lesson';
import type { MediaDTO } from '@/domain/media/value-objects/MediaDTO';

export interface ChapterWithMediaDTO {
  id: string;
  title: string;
  description: string;
  mediaId?: string | null;
  media?: MediaDTO | null; // ✅ objet media
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LessonDetailsDTO {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  duration: number;
  order: number;
  status: LessonStatus;
  chapters: ChapterWithMediaDTO[];
  chaptersCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
