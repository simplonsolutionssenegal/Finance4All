export type ChapterDto = {
  id?: string; // utile pour l'édition / UI
  title: string;
  description: string;
  mediaId?: string; // ✅ optionnel
  quizId?: string; // ✅ optionnel
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

export enum LessonStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  SCHEDULED = 'SCHEDULED',
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  order: number;
  status: LessonStatus;
  chapters: ChapterDto[];
  createdAt: string;
  updatedAt: string;
}
