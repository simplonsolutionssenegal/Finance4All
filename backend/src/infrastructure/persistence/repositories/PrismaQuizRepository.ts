import { Quiz, type QuizStatus } from '@/domain/formations/entities/Quiz';
import type { QuizRepository } from '@/domain/formations/ports/out/QuizRepository';
import type { Prisma, PrismaClient } from '@prisma/client';
import { EntityId } from '@/domain/shared/EntityId';
import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';
import { questionsFromJson } from './mappers/QuestionMapper';

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

  async delete(id: string): Promise<void> {
    await this.prisma.quiz.delete({
      where: { id },
    });
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
    const questions = questionsFromJson(prismaQuiz.questions);

    return new Quiz({
      id: EntityId.from(prismaQuiz.id),

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
