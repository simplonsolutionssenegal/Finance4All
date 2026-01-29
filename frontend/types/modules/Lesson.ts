export type ChapterDto = {
  title: string;
  description: string;
  mediaId: string;
  order: number;
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
