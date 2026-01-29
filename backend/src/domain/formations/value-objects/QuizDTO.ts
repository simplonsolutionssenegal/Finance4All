// import type { QuestionDTO } from '@/domain/formations/entities/Question';
import type { QuizStatus } from '@/domain/formations/entities/Quiz';
import type { QuestionDTO } from './QuestionDTO';

export interface QuizDTO {
  id: string;
  title: string;
  description: string;
  status: QuizStatus;
  scoreMinimum: number;
  duree?: number;
  nombreTentatives: number;
  questions: QuestionDTO[];
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
}
