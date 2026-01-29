import type { QuestionDTO } from './Question';

export enum QuizStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  status: QuizStatus;
  scoreMinimum: number;
  duree?: number | null; // null/undefined => illimité
  nombreTentatives: number;
  questions: QuestionDTO[];
  totalPoints?: number;
  createdAt?: string;
  updatedAt?: string;
}
