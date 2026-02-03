// infrastructure/persistence/repositories/PrismaModuleFormationRepository.ts

import type { Prisma, PrismaClient } from '@prisma/client';

import { EntityId } from '@/domain/shared/EntityId';
import {
  Module,
  type ModuleStatus,
  type DifficultyLevel,
} from '@/domain/formations/entities/ModuleFormation';

import { Lesson, type LessonStatus } from '@/domain/formations/entities/Lesson';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';
import { Quiz, type QuizStatus } from '@/domain/formations/entities/Quiz';
import {
  QuestionChoixMultiple,
  QuestionChoixUnique,
  TypeQuestion,
} from '@/domain/formations/entities/Question';
import type { QuestionDTO } from '@/domain/formations/value-objects/QuestionDTO';
import type { ChapterDTO } from '@/domain/formations/value-objects/ChapterDTO';
import { Chapter } from '@/domain/formations/entities/Chapter';

type ModuleWithLessonsAndQuizzes = Prisma.ModuleGetPayload<{
  include: {
    lessons: {
      include: {
        chapters: true;
        quizzes: true;
      };
    };
    quizzes: true;
  };
}>;

export class PrismaModuleFormationRepository implements ModuleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(module: Module): Promise<Module> {
    const data = this.toPrismaData(module);

    const saved = await this.prisma.module.create({
      data,
      include: { lessons: { include: { chapters: true, quizzes: true } }, quizzes: true },
    });

    return this.toDomain(saved);
  }

  async findByTitle(title: string): Promise<Module | null> {
    const module = await this.prisma.module.findFirst({
      where: {
        title: { equals: title },
      },
      include: { lessons: { include: { chapters: true, quizzes: true } }, quizzes: true },
    });

    return module ? this.toDomain(module) : null;
  }

  async findById(id: string): Promise<Module | null> {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: { lessons: { include: { chapters: true, quizzes: true } }, quizzes: true },
    });

    return module ? this.toDomain(module) : null;
  }
  async findByThematic(thematic: string): Promise<Module | null> {
    const normalizedThematic = thematic.toLowerCase().trim();

    const module = await this.prisma.module.findFirst({
      where: {
        thematics: {
          equals: normalizedThematic,
          mode: 'insensitive',
        },
      },
      // ✅ Ajoutez l'include comme dans les autres méthodes
      include: {
        lessons: {
          include: {
            chapters: true,
            quizzes: true,
          },
        },
        quizzes: true,
      },
    });

    return module ? this.toDomain(module) : null;
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Module>> {
    const skip = (params.page - 1) * params.limit;

    const [modules, total] = await Promise.all([
      this.prisma.module.findMany({
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          lessons: {
            include: {
              chapters: true,
              quizzes: true,
            },
          },
          quizzes: true,
        },
      }),
      this.prisma.module.count(),
    ]);

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: modules.map(m => this.toDomain(m)), // ✅ maintenant ça compile
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }

  async update(module: Module): Promise<Module> {
    const moduleData = this.toPrismaUpdateData(module);
    const lessons = module.lessons;

    // Récupérer le module existant pour comparer les leçons
    const existingModule = await this.prisma.module.findUnique({
      where: { id: module.id.getValue() },
      include: { lessons: true, quizzes: true },
    });

    const existingLessonIds = new Set(existingModule?.lessons.map(l => l.id) || []);
    const newLessons = lessons.filter(l => !existingLessonIds.has(l.id.getValue()));

    const existingQuizIds = new Set(existingModule?.quizzes.map(q => q.id) || []);
    const newQuizzes = module.quizzes.filter(q => !existingQuizIds.has(q.id.getValue()));

    // Mettre à jour le module et créer les nouvelles leçons
    const updated = await this.prisma.module.update({
      where: { id: module.id.getValue() },
      data: {
        ...moduleData,
        ...(newLessons.length > 0
          ? { lessons: { create: newLessons.map(l => this.mapLessonToPrisma(l)) } }
          : {}),

        ...(newQuizzes.length > 0
          ? { quizzes: { create: newQuizzes.map(q => this.mapQuizToPrisma(q)) } }
          : {}),
      },
      include: { lessons: { include: { chapters: true, quizzes: true } }, quizzes: true },
    });

    return this.toDomain(updated);
  }

  // -------------------------
  // Mapping Prisma -> Domain
  // -------------------------
  private toDomain(prismaModule: ModuleWithLessonsAndQuizzes): Module {
    const lessons = prismaModule.lessons?.map(l => this.mapLessonToDomain(l)) || [];
    const quizzes = prismaModule.quizzes?.map(q => this.mapQuizToDomain(q)) || [];

    return new Module({
      id: EntityId.from(prismaModule.id),
      title: prismaModule.title,
      thematics: prismaModule.thematics,
      imageMediaId: prismaModule.imageMediaId,
      description: prismaModule.description,
      difficultyLevel: prismaModule.difficultyLevel as DifficultyLevel,
      estimatedDuration: prismaModule.estimatedDuration,
      status: prismaModule.status as ModuleStatus,
      lessons,
      quizzes,
      createdAt: prismaModule.createdAt,
      updatedAt: prismaModule.updatedAt,
    });
  }

  private mapLessonToDomain(prismaLesson: ModuleWithLessonsAndQuizzes['lessons'][number]): Lesson {
    const chaptersDto: ChapterDTO[] = Array.isArray(prismaLesson.chapters)
      ? (prismaLesson.chapters as unknown as ChapterDTO[])
      : [];

    const chapters = chaptersDto.map(c => this.mapChapterToDomain(c));

    // ⭐ Mapper les quizzes de la leçon
    const quizzes = (prismaLesson.quizzes ?? []).map(q => this.mapQuizToDomain(q));

    return new Lesson({
      id: EntityId.from(prismaLesson.id),
      moduleId: prismaLesson.moduleId,
      title: prismaLesson.title,
      description: prismaLesson.description,
      duration: prismaLesson.duration,
      order: prismaLesson.order,
      chapters,
      quizzes, // ⭐ Ajouter les quizzes
      status: prismaLesson.status as LessonStatus,
    });
  }

  private mapQuizToDomain(prismaQuiz: ModuleWithLessonsAndQuizzes['quizzes'][number]): Quiz {
    const raw = prismaQuiz.questions;

    const questionsDto: QuestionDTO[] = Array.isArray(raw) ? (raw as unknown as QuestionDTO[]) : [];

    const questions = questionsDto.map(q => this.mapQuestionToDomain(q));

    return new Quiz({
      id: EntityId.from(prismaQuiz.id),
      title: prismaQuiz.title,
      description: prismaQuiz.description,
      status: prismaQuiz.status as QuizStatus,
      scoreMinimum: prismaQuiz.scoreMinimum,
      duree: prismaQuiz.duree ?? undefined,
      nombreTentatives: prismaQuiz.nombreTentatives,
      questions,
    });
  }

  private mapQuizToPrisma(quiz: Quiz): Prisma.QuizCreateWithoutModuleInput {
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

  private mapLessonToPrisma(lesson: Lesson): Prisma.LessonCreateWithoutModuleInput {
    return {
      id: lesson.id.getValue(),
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      order: lesson.order,
      status: lesson.status as any,

      // ✅ Créer les chapitres avec leurs quizzes
      chapters: {
        create: lesson.chapters.map(chapter => ({
          id: chapter.id.getValue(),
          title: chapter.title,
          description: chapter.description,
          mediaId: chapter.mediaId ?? null,
          order: chapter.order,

          // ⭐ Créer les quizzes du chapitre
          quizzes: {
            create: chapter.quizzes.map(quiz => ({
              id: quiz.id.getValue(),
              title: quiz.title,
              description: quiz.description,
              status: quiz.status as any,
              scoreMinimum: quiz.scoreMinimum,
              duree: quiz.duree ?? null,
              nombreTentatives: quiz.nombreTentatives,
              questions: quiz.questions.map(q => q.toDTO()) as unknown as Prisma.InputJsonValue,
            })),
          },
        })),
      },

      // ✅ Créer les quizzes liés directement à la leçon
      quizzes: {
        create: lesson.quizzes.map(q => ({
          id: q.id.getValue(),
          title: q.title,
          description: q.description,
          status: q.status as any,
          scoreMinimum: q.scoreMinimum,
          duree: q.duree ?? null,
          nombreTentatives: q.nombreTentatives,
          questions: q.questions.map(question =>
            question.toDTO()
          ) as unknown as Prisma.InputJsonValue,
        })),
      },
    };
  }

  private mapChapterToDomain(dto: ChapterDTO): Chapter {
    const quizzes = (dto.quizzes ?? []).map(quizDto => {
      const prismaQuizFormat = {
        ...quizDto,
        duree: quizDto.duree ?? null,
        moduleId: quizDto.moduleId ?? null,
        lessonId: quizDto.lessonId ?? null,
        chapterId: quizDto.chapterId ?? null,
        questions: quizDto.questions as unknown as Prisma.JsonValue,
      };

      return this.mapQuizToDomain(prismaQuizFormat);
    });

    return new Chapter(
      EntityId.from(dto.id),
      dto.title,
      dto.description,
      dto.mediaId ?? undefined,
      dto.order,
      undefined, // media
      quizzes
    );
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
  private toPrismaData(module: Module): Prisma.ModuleCreateInput {
    return {
      id: module.id.getValue(),
      title: module.title,
      description: module.description,
      thematics: module.thematics,
      difficultyLevel: module.difficultyLevel as any,
      estimatedDuration: module.estimatedDuration,

      status: module.status as ModuleStatus,
      ...(module.imageMediaId && {
        imageMedia: {
          connect: { id: module.imageMediaId },
        },
      }),

      lessons: {
        create: module.lessons.map(l => this.mapLessonToPrisma(l)),
      },
    };
  }

  private toPrismaUpdateData(module: Module): Prisma.ModuleUpdateInput {
    return {
      title: module.title,
      description: module.description,
      // ✅ Gérer la relation imageMedia correctement
      ...(module.imageMediaId
        ? { imageMedia: { connect: { id: module.imageMediaId } } }
        : { imageMedia: { disconnect: true } }),
      thematics: module.thematics,
      difficultyLevel: module.difficultyLevel as any,
      estimatedDuration: module.estimatedDuration,
      status: module.status as any,
    };
  }
}
