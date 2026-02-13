import {
  QuizAttempt as QuizAttemptEntity,
  type QuizAttempt,
} from '@/domain/formations/entities/QuizAttempt';
import type { IQuizProgressRepository } from '@/domain/formations/ports/out/IQuizProgressRepository';
import type { PrismaClient } from '@prisma/client';

export class PrismaQuizProgressRepository implements IQuizProgressRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(attempt: QuizAttempt): Promise<QuizAttempt> {
    const saved = await this.prisma.quizAttempt.create({
      data: {
        id: attempt.id,
        quizId: attempt.quizId,
        userId: attempt.userId,
        attemptNumber: attempt.attemptNumber,
        earnedPoints: attempt.earnedPoints,
        totalPoints: attempt.totalPoints,
        scorePercent: attempt.scorePercent,
        isPassed: attempt.isPassed,
        answers: attempt.answers ?? undefined,
      },
    });

    return this.toDomain(saved);
  }

  async countAttemptsByUser(quizId: string, userId: string): Promise<number> {
    return this.prisma.quizAttempt.count({
      where: {
        quizId,
        userId,
      },
    });
  }

  async hasPassedQuiz(quizId: string, userId: string): Promise<boolean> {
    const count = await this.prisma.quizAttempt.count({
      where: {
        quizId,
        userId,
        isPassed: true,
      },
    });

    return count > 0;
  }

  async findLatestAttemptByUser(quizId: string, userId: string): Promise<QuizAttempt | null> {
    const row = await this.prisma.quizAttempt.findFirst({
      where: {
        quizId,
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return row ? this.toDomain(row) : null;
  }

  async findBestAttemptByUser(quizId: string, userId: string): Promise<QuizAttempt | null> {
    const row = await this.prisma.quizAttempt.findFirst({
      where: {
        quizId,
        userId,
      },
      orderBy: [{ scorePercent: 'desc' }, { createdAt: 'asc' }],
    });

    return row ? this.toDomain(row) : null;
  }

  private toDomain(row: {
    id: string;
    quizId: string;
    userId: string;
    attemptNumber: number;
    earnedPoints: number;
    totalPoints: number;
    scorePercent: number;
    isPassed: boolean;
    answers?: unknown | null;
    createdAt: Date;
    updatedAt: Date;
  }): QuizAttempt {
    return new QuizAttemptEntity({
      id: row.id,
      quizId: row.quizId,
      userId: row.userId,
      attemptNumber: row.attemptNumber,
      earnedPoints: row.earnedPoints,
      totalPoints: row.totalPoints,
      scorePercent: row.scorePercent,
      isPassed: row.isPassed,
      answers: (row.answers ?? null) as
        | {
            questionIndex: number;
            selectedOptionIndexes: number[];
          }[]
        | null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
