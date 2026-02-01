// infrastructure/persistence/repositories/PrismaQuizRepository.ts

import { Quiz, type QuizStatus } from '@/domain/formations/entities/Quiz';
import type { QuizRepository } from '@/domain/formations/ports/out/QuizRepository';
import type { Prisma, PrismaClient } from '@prisma/client';
import { EntityId } from '@/domain/shared/EntityId';
import type { QuestionDTO } from '@/domain/formations/value-objects/QuestionDTO';
import {
  QuestionChoixMultiple,
  QuestionChoixUnique,
  TypeQuestion,
} from '@/domain/formations/entities/Question';
import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';

type PrismaQuiz = Prisma.QuizGetPayload<{}>;

export class PrismaQuizRepository implements QuizRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Quiz | null> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
    });

    return quiz ? this.toDomain(quiz) : null;
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Quiz>> {
    const skip = (params.page - 1) * params.limit;

    const [quizzes, total] = await Promise.all([
      this.prisma.quiz.findMany({
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quiz.count(),
    ]);

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: quizzes.map(q => this.toDomain(q)),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }

  async update(quiz: Quiz): Promise<Quiz> {
    const data = this.toPrismaUpdateData(quiz);

    const updated = await this.prisma.quiz.update({
      where: { id: quiz.id.getValue() },
      data,
    });

    return this.toDomain(updated);
  }

  // -------------------------
  // Mapping Prisma -> Domain
  // -------------------------
  private toDomain(prismaQuiz: PrismaQuiz): Quiz {
    const raw = prismaQuiz.questions;
    const questionsDto: QuestionDTO[] = Array.isArray(raw) ? (raw as unknown as QuestionDTO[]) : [];
    const questions = questionsDto.map(q => this.mapQuestionToDomain(q));

    return new Quiz({
      id: EntityId.from(prismaQuiz.id),

      // ✅ AJOUTER CES 3 LIGNES
      moduleId: prismaQuiz.moduleId ?? undefined,
      lessonId: prismaQuiz.lessonId ?? undefined,
      chapterId: prismaQuiz.chapterId ?? undefined,

      title: prismaQuiz.title,
      description: prismaQuiz.description,
      status: prismaQuiz.status as QuizStatus,
      scoreMinimum: prismaQuiz.scoreMinimum,
      duree: prismaQuiz.duree ?? undefined,
      nombreTentatives: prismaQuiz.nombreTentatives,
      questions,
    });
  }

  private mapQuestionToDomain(dto: QuestionDTO) {
    if (dto.type === TypeQuestion.CHOIX_UNIQUE) {
      return new QuestionChoixUnique(dto.question, dto.points, dto.options, dto.explication);
    }

    if (dto.type === TypeQuestion.CHOIX_MULTIPLE) {
      return new QuestionChoixMultiple(dto.question, dto.points, dto.options, dto.explication);
    }

    throw new Error(`TypeQuestion inconnu: ${String((dto as any).type)}`);
  }

  // -------------------------
  // Mapping Domain -> Prisma
  // -------------------------
  private toPrismaUpdateData(quiz: Quiz): Prisma.QuizUpdateInput {
    return {
      title: quiz.title,
      description: quiz.description,
      status: quiz.status as any,
      scoreMinimum: quiz.scoreMinimum,
      duree: quiz.duree ?? null,
      nombreTentatives: quiz.nombreTentatives,
      questions: quiz.questions.map(q => q.toDTO()) as unknown as Prisma.InputJsonValue,
    };
  }
}
