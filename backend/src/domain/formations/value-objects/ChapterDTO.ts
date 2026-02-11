// domain/formations/value-objects/ChapterDTO.ts

import type { QuizDTO } from './QuizDTO'; // ⭐ AJOUT
import type { MediaDTO } from '@/domain/media/value-objects/MediaDTO';

export interface ChapterDTO {
  id: string;
  title: string;
  description: string;
  mediaId?: string;
  order: number;
  media?: MediaDTO;
  quizzes?: QuizDTO[]; // ⭐ AJOUT
  createdAt: Date;
  updatedAt: Date;
}
