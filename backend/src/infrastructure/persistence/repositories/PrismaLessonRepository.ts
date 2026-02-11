// infrastructure/persistence/repositories/PrismaLessonRepository.ts

import type { Prisma, PrismaClient } from '@prisma/client';
import { EntityId } from '@/domain/shared/EntityId';
import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';
import type { LessonRepository } from '@/domain/formations/ports/out/LessonRepository';
import { Lesson, type LessonStatus } from '@/domain/formations/entities/Lesson';
import { Chapter } from '@/domain/formations/entities/Chapter';
import { Quiz, type QuizStatus } from '@/domain/formations/entities/Quiz';
import { questionsFromJson } from './mappers/QuestionMapper';

type PrismaLesson = Prisma.LessonGetPayload<{
  include: {
    chapters: {
      include: {
        media: true;
        quizzes: true; // ⭐ AJOUT : inclure les quizzes des chapitres
      };
    };
    quizzes: true;
  };
}>;

export class PrismaLessonRepository implements LessonRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Lesson | null> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        chapters: {
          include: {
            media: true,
            quizzes: true, // ⭐ AJOUT
          },
        },
        quizzes: true,
      },
    });

    return lesson ? this.toDomain(lesson) : null;
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Lesson>> {
    const skip = (params.page - 1) * params.limit;

    const [lessons, total] = await Promise.all([
      this.prisma.lesson.findMany({
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          chapters: {
            include: {
              media: true,
              quizzes: true, // ⭐ AJOUT
            },
          },
          quizzes: true,
        },
      }),
      this.prisma.lesson.count(),
    ]);

    return {
      data: lessons.map(l => this.toDomain(l)),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async update(lesson: Lesson): Promise<Lesson> {
    const lessonData = this.toPrismaUpdateData(lesson);
    const quizzes = lesson.quizzes;

    // Récupérer la lesson existante pour comparer les quizzes
    const existingLesson = await this.prisma.lesson.findUnique({
      where: { id: lesson.id.getValue() },
      include: {
        chapters: {
          include: {
            media: true,
            quizzes: true, // ⭐ AJOUT
          },
        },
        quizzes: true,
      },
    });

    const existingQuizIds = new Set(existingLesson?.quizzes.map(q => q.id) || []);
    const newQuizzes = quizzes.filter(q => !existingQuizIds.has(q.id.getValue()));

    // Mettre à jour la lesson et créer les nouveaux quizzes
    const updated = await this.prisma.lesson.update({
      where: { id: lesson.id.getValue() },
      data: {
        ...lessonData,
        ...(newQuizzes.length > 0
          ? { quizzes: { create: newQuizzes.map(q => this.mapQuizToPrisma(q)) } }
          : {}),
      },
      include: {
        chapters: {
          include: {
            media: true,
            quizzes: true, // ⭐ AJOUT
          },
        },
        quizzes: true,
      },
    });

    return this.toDomain(updated);
  }

  private toDomain(prismaLesson: PrismaLesson): Lesson {
    const chapters = (prismaLesson.chapters ?? []).map(c => this.mapChapterToDomain(c));
    const quizzes = (prismaLesson.quizzes ?? []).map(q => this.mapQuizToDomain(q));

    return new Lesson({
      id: EntityId.from(prismaLesson.id),
      moduleId: prismaLesson.moduleId,
      title: prismaLesson.title,
      description: prismaLesson.description,
      duration: prismaLesson.duration,
      order: prismaLesson.order,
      chapters,
      quizzes,
      status: prismaLesson.status as LessonStatus,
    });
  }

  // ⭐ MODIFIER pour inclure les quizzes du chapitre
  private mapChapterToDomain(prismaChapter: PrismaLesson['chapters'][number]): Chapter {
    // Mapper les quizzes du chapitre
    const chapterQuizzes = (prismaChapter.quizzes ?? []).map(q => this.mapQuizToDomain(q));

    return new Chapter(
      EntityId.from(prismaChapter.id),
      prismaChapter.title,
      prismaChapter.description,
      prismaChapter.mediaId ?? undefined,
      prismaChapter.order,
      undefined, // media (peut être ajouté si nécessaire)
      chapterQuizzes, // ⭐ AJOUT : passer les quizzes
      prismaChapter.createdAt,
      prismaChapter.updatedAt
    );
  }

  private mapQuizToDomain(
    prismaQuiz:
      | PrismaLesson['quizzes'][number]
      | PrismaLesson['chapters'][number]['quizzes'][number]
  ): Quiz {
    const questions = questionsFromJson(prismaQuiz.questions);

    return new Quiz({
      id: EntityId.from(prismaQuiz.id),
      moduleId: prismaQuiz.moduleId ?? undefined,
      lessonId: prismaQuiz.lessonId ?? undefined,
      chapterId: prismaQuiz.chapterId ?? undefined, // ⭐ AJOUT
      title: prismaQuiz.title,
      description: prismaQuiz.description,
      status: prismaQuiz.status as QuizStatus,
      scoreMinimum: prismaQuiz.scoreMinimum,
      duree: prismaQuiz.duree ?? undefined,
      nombreTentatives: prismaQuiz.nombreTentatives,
      questions,
    });
  }

  // -------------------------
  // Mapping Domain -> Prisma
  // -------------------------
  private mapQuizToPrisma(quiz: Quiz): Prisma.QuizCreateWithoutLessonInput {
    return {
      id: quiz.id.getValue(),
      title: quiz.title,
      description: quiz.description,
      status: quiz.status as any,
      scoreMinimum: quiz.scoreMinimum,
      duree: quiz.duree ?? null,
      nombreTentatives: quiz.nombreTentatives,
      questions: quiz.questions.map(q => q.toDTO()) as unknown as Prisma.InputJsonValue,
    };
  }

  private toPrismaUpdateData(lesson: Lesson): Prisma.LessonUpdateInput {
    return {
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      order: lesson.order,
      status: lesson.status as any,
    };
  }
}
