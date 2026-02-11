import { Quiz, type QuizStatus } from '@/domain/formations/entities/Quiz';
import { EntityId } from '@/domain/shared/EntityId';
import { questionsFromJson } from './QuestionMapper';

export type PrismaQuizLike = {
  id: string;
  moduleId?: string | null;
  lessonId?: string | null;
  chapterId?: string | null;
  title: string;
  description: string;
  status: string;
  scoreMinimum: number;
  duree: number | null;
  nombreTentatives: number;
  questions: unknown;
};

export function quizFromPrisma(row: PrismaQuizLike): Quiz {
  return new Quiz({
    id: EntityId.from(row.id),
    moduleId: row.moduleId ?? undefined,
    lessonId: row.lessonId ?? undefined,
    chapterId: row.chapterId ?? undefined,
    title: row.title,
    description: row.description,
    status: row.status as QuizStatus,
    scoreMinimum: row.scoreMinimum,
    duree: row.duree ?? undefined,
    nombreTentatives: row.nombreTentatives,
    questions: questionsFromJson(row.questions),
  });
}
