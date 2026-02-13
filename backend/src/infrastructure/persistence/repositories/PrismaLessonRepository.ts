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

  async delete(id: string): Promise<void> {
    await this.prisma.lesson.delete({
      where: { id },
    });
  }

  async update(lesson: Lesson): Promise<Lesson> {
    const existingLesson = await this.prisma.lesson.findUnique({
      where: { id: lesson.id.getValue() },
      include: {
        chapters: {
          include: {
            media: true,
            quizzes: true,
          },
        },
        quizzes: true,
      },
    });

    if (!existingLesson) {
      throw new Error('Lesson not found');
    }

    // Préparer les chapitres
    const existingChapterIds = new Set(existingLesson.chapters.map(c => c.id));
    const newChapters = lesson.chapters.filter(c => !existingChapterIds.has(c.id.getValue()));
    const updatedChapters = lesson.chapters.filter(c => existingChapterIds.has(c.id.getValue()));

    // Identifier les chapitres à supprimer
    const incomingChapterIds = new Set(lesson.chapters.map(c => c.id.getValue()));
    const chaptersToDelete = existingLesson.chapters
      .filter(c => !incomingChapterIds.has(c.id))
      .map(c => c.id);

    // Préparer les quizzes de la lesson (hors chapitres)
    const existingQuizIds = new Set(existingLesson.quizzes.map(q => q.id));
    const newQuizzes = lesson.quizzes.filter(q => !existingQuizIds.has(q.id.getValue()));

    // Transaction pour tout mettre à jour
    const updated = await this.prisma.lesson.update({
      where: { id: lesson.id.getValue() },
      data: {
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration,
        order: lesson.order,
        status: lesson.status as any,

        // Gestion des quizzes de la lesson
        ...(newQuizzes.length > 0 && {
          quizzes: {
            create: newQuizzes.map(q => this.mapQuizToPrisma(q)),
          },
        }),

        // Gestion des chapitres
        chapters: {
          // Supprimer les chapitres retirés
          ...(chaptersToDelete.length > 0 && {
            delete: chaptersToDelete.map(id => ({ id })),
          }),

          // Créer les nouveaux chapitres
          ...(newChapters.length > 0 && {
            create: newChapters.map(c => this.mapChapterToPrismaCreate(c)),
          }),

          // Mettre à jour les chapitres existants
          ...(updatedChapters.length > 0 && {
            update: updatedChapters.map(c => ({
              where: { id: c.id.getValue() },
              data: this.mapChapterToPrismaUpdate(c),
            })),
          }),
        },
      },
      include: {
        chapters: {
          include: {
            media: true,
            quizzes: true,
          },
        },
        quizzes: true,
      },
    });

    return this.toDomain(updated);
  }

  private mapChapterToPrismaCreate(chapter: Chapter): Prisma.ChapterCreateWithoutLessonInput {
    const chapterQuizzes = chapter.quizzes.map(q => ({
      id: q.id.getValue(),
      ...(q.moduleId && {
        module: {
          connect: { id: q.moduleId },
        },
      }),
      title: q.title,
      description: q.description,
      status: q.status as any,
      scoreMinimum: q.scoreMinimum,
      duree: q.duree ?? null,
      nombreTentatives: q.nombreTentatives,
      questions: q.questions.map(qu => qu.toDTO()) as unknown as Prisma.InputJsonValue,
    }));

    return {
      id: chapter.id.getValue(),
      title: chapter.title,
      description: chapter.description,
      order: chapter.order,
      ...(chapter.mediaId && {
        media: {
          connect: { id: chapter.mediaId },
        },
      }),
      quizzes: {
        create: chapterQuizzes,
      },
    };
  }

  // Méthode pour mapper un Chapter vers Prisma (mise à jour)
  private mapChapterToPrismaUpdate(chapter: Chapter): Prisma.ChapterUpdateInput {
    return {
      title: chapter.title,
      description: chapter.description,
      order: chapter.order,
      ...(chapter.mediaId
        ? { media: { connect: { id: chapter.mediaId } } }
        : { media: { disconnect: true } }),
      quizzes: {
        deleteMany: {},
        create: chapter.quizzes.map(q => ({
          id: q.id.getValue(),
          // ✅ NE PAS inclure chapter car on est déjà dans le contexte du chapitre
          // ✅ Connecter seulement le module si nécessaire
          ...(q.moduleId && {
            module: {
              connect: { id: q.moduleId },
            },
          }),
          title: q.title,
          description: q.description,
          status: q.status as any,
          scoreMinimum: q.scoreMinimum,
          duree: q.duree ?? null,
          nombreTentatives: q.nombreTentatives,
          questions: q.questions.map(qu => qu.toDTO()) as unknown as Prisma.InputJsonValue,
        })),
      },
    };
  }

  // Aussi mettre à jour la méthode mapQuizToPrisma existante
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
      // ✅ Si le quiz a un moduleId, le connecter
      ...(quiz.moduleId && {
        module: {
          connect: { id: quiz.moduleId },
        },
      }),
      // ✅ Si le quiz a un chapterId, le connecter
      ...(quiz.chapterId && {
        chapter: {
          connect: { id: quiz.chapterId },
        },
      }),
    };
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
