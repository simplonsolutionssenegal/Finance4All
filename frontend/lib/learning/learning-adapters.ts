import type { Chapter, Lesson, Quiz } from '@/types/learning/lesson';

export type BackendQuiz = {
  id: string;
  title: string;
  description: string;
  status?: string;
  scoreMinimum?: number | string;
  duree?: number | string | null;
  nombreTentatives?: number | string;
  questions?: Quiz['questions'];
  moduleId?: string;
  lessonId?: string;
  chapterId?: string | null;
};

export type BackendChapter = {
  id: string;
  title: string;
  description: string;
  mediaId?: string | null;
  media?: { id?: string | null };
  order?: number | string;
  quizzes?: BackendQuiz[];
};

export type BackendLesson = {
  id: string;
  title: string;
  description: string;
  duration?: number | string;
  order?: number | string;
  status?: string;
  chapters?: BackendChapter[];
  quizzes?: BackendQuiz[];
};

export const mapLessonSummary = (lesson: BackendLesson, moduleId: string): Lesson => ({
  id: lesson.id,
  moduleId,
  title: lesson.title,
  description: lesson.description,
  duration: Number(lesson.duration ?? 0),
  order: Number(lesson.order ?? 0),
  status: lesson.status as Lesson['status'],
});

export const mapChapters = (lessonId: string, chapters: BackendChapter[] = []): Chapter[] =>
  chapters.map(chapter => ({
    id: chapter.id,
    lessonId,
    title: chapter.title,
    description: chapter.description,
    mediaId: chapter.mediaId ?? chapter.media?.id ?? undefined,
    order: Number(chapter.order ?? 0),
  }));

export const mapQuiz = (quiz: BackendQuiz, fallbackModuleId?: string): Quiz => {
  const isModuleQuiz = !quiz.lessonId && !quiz.chapterId;
  return {
    id: quiz.id,
    moduleId: quiz.moduleId ?? fallbackModuleId ?? '',
    lessonId: quiz.lessonId,
    chapterId: quiz.chapterId ?? null,
    isModuleQuiz,
    title: quiz.title,
    description: quiz.description,
    status: quiz.status as Quiz['status'],
    scoreMinimum: Number(quiz.scoreMinimum ?? 0),
    duree: quiz.duree == null ? null : Number(quiz.duree),
    nombreTentatives: Number(quiz.nombreTentatives ?? 0),
    questions: quiz.questions ?? [],
  };
};

export const mapQuizzes = (quizzes: BackendQuiz[] = [], fallbackModuleId?: string): Quiz[] =>
  quizzes.map(quiz => mapQuiz(quiz, fallbackModuleId));
