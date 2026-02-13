export enum LessonStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  SCHEDULED = 'SCHEDULED',
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  duration: number;
  order: number;
  status: LessonStatus;
}

export enum QuizStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum TypeQuestion {
  CHOIX_UNIQUE = 'CHOIX_UNIQUE',
  CHOIX_MULTIPLE = 'CHOIX_MULTIPLE',
}

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface QuestionDTO {
  question: string;
  type: TypeQuestion;
  points: number;
  options: QuestionOption[];
  explication?: string;
}

export interface Quiz {
  id: string;
  moduleId: string;
  lessonId?: string;
  chapterId?: string | null;
  isModuleQuiz?: boolean;
  title: string;
  description: string;
  status: QuizStatus;
  scoreMinimum: number;
  duree?: number | null;
  nombreTentatives: number;
  questions: QuestionDTO[];
}

export interface LessonWithModuleContext {
  moduleId: string;
  moduleTitle: string;
  currentLesson: Lesson;
  currentIndex: number;
  totalLessons: number;
}

export interface Chapter {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  mediaId?: string;
  order: number;
}

export type LessonProgressStatus = 'DONE' | 'CURRENT' | 'LOCKED';

export type ChapterProgressStatus = 'DONE' | 'CURRENT' | 'LOCKED';

export interface ChapterContent {
  chapterId: string;
  keyPoint?: {
    title: string;
    description: string;
  };
  steps?: Array<{
    number: number;
    title: string;
    description: string;
  }>;
  practicalExample?: {
    title: string;
    situation: string;
    details: Array<{
      label: string;
      value: string;
      highlight?: boolean;
    }>;
  };
}
