import type { LessonStatus } from '@/domain/formations/entities/Lesson';
import type { ChapterDTO } from './ChapterDTO';
import type { QuizDTO } from './QuizDTO';

export interface LessonDTO {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  duration: number; // minutes
  order: number;
  status: LessonStatus;
  chapters: ChapterDTO[];
  quizzes: QuizDTO[];
  chaptersCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
