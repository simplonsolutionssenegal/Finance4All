// domain/formations/value-objects/ChapterDTO.ts

import type { MediaDTO } from '@/domain/media/value-objects/MediaDTO';

export interface ChapterDTO {
  id: string;
  title: string;
  description: string;
  mediaId?: string;
  order: number;
  quizId?: string;
  media?: MediaDTO;
  createdAt?: Date;
  updatedAt?: Date;
}
