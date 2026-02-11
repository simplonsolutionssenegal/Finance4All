// domain/formations/ports/in/UpdateLessonUseCase.ts

import type { UseCase } from '@/domain/shared/UseCase';
import type { LessonDTO } from '@/domain/formations/value-objects/LessonDTO';
import type { LessonStatus } from '@/domain/formations/entities/Lesson';
import type { QuizStatus } from '@/domain/formations/entities/Quiz';
import type { TypeQuestion, QuestionOption } from '@/domain/formations/entities/Question';

export interface UpdateQuestionDTO {
  id?: string;
  type: TypeQuestion;
  question: string;
  points: number;
  options: QuestionOption[];
  explication?: string;
}

export interface UpdateQuizDTO {
  id?: string;
  title: string;
  description: string;
  status?: QuizStatus;
  scoreMinimum: number;
  duree?: number;
  nombreTentatives: number;
  questions: UpdateQuestionDTO[];
}

export interface UpdateChapterDTO {
  id?: string;
  title: string;
  description: string;
  mediaId?: string;
  order: number;
  quizzes?: UpdateQuizDTO[];
}

export interface UpdateLessonCommand {
  id: string;
  title?: string;
  description?: string;
  duration?: number;
  order?: number;
  status?: LessonStatus;
  chapters?: UpdateChapterDTO[];
  quizzes?: UpdateQuizDTO[];
}

export interface UpdateLessonUseCase extends UseCase<UpdateLessonCommand, LessonDTO> {}
