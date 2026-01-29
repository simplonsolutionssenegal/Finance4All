// infrastructure/persistence/repositories/PrismaQuizRepository.ts

import type { Prisma, PrismaClient } from '@prisma/client';
import { EntityId } from '@/domain/shared/EntityId';
import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';
import type { LessonRepository } from '@/domain/formations/ports/out/LessonRepository';
import { Lesson, type LessonStatus } from '@/domain/formations/entities/Lesson';
import type { ChapterDTO } from '@/domain/formations/value-objects/ChapterDTO';
import { Chapter } from '@/domain/formations/entities/Chapter';

type PrismaLesson = Prisma.LessonGetPayload<{}>;

export class PrismaLessonRepository implements LessonRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Lesson | null> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
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
      }),
      this.prisma.lesson.count(),
    ]);

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: lessons.map(l => this.toDomain(l)),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }

  async update(lesson: Lesson): Promise<Lesson> {
    const data = this.toPrismaUpdateData(lesson);

    const updated = await this.prisma.lesson.update({
      where: { id: lesson.id.getValue() },
      data,
    });

    return this.toDomain(updated);
  }

  // -------------------------
  // Mapping Prisma -> Domain
  // -------------------------
  private toDomain(prismaLesson: PrismaLesson): Lesson {
    const raw = prismaLesson.chapters;
    const chaptersDto: ChapterDTO[] = Array.isArray(raw) ? (raw as unknown as ChapterDTO[]) : [];

    const chapters = chaptersDto.map(c => this.mapChapterToDomain(c));

    return new Lesson({
      id: EntityId.from(prismaLesson.id),
      title: prismaLesson.title,
      description: prismaLesson.description,
      duration: prismaLesson.duration,
      order: prismaLesson.order,
      chapters, // ✅ Utiliser les instances créées
      status: prismaLesson.status as LessonStatus,
    });
  }

  private mapChapterToDomain(dto: ChapterDTO): Chapter {
    return new Chapter(dto.title, dto.description, dto.mediaId, dto.order);
  }

  private toPrismaUpdateData(lesson: Lesson): Prisma.LessonUpdateInput {
    return {
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      order: lesson.order,
      status: lesson.status as any,
      chapters: lesson.chapters.map(c => c.toDTO()) as unknown as Prisma.InputJsonValue,
    };
  }
}
