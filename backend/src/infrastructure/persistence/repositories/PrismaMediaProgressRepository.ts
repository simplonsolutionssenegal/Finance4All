import type { PrismaClient, MediaProgress as PrismaMediaProgress } from '@prisma/client';
import { MediaProgress } from '@/domain/streaming/entities/MediaProgress';
import type { MediaProgressRepository } from '@/domain/streaming/ports/out/MediaProgressRepository';
import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';

export class PrismaMediaProgressRepository implements MediaProgressRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(progress: MediaProgress): Promise<MediaProgress> {
    const saved = await this.prisma.mediaProgress.create({
      data: this.toPrismaData(progress),
    });

    return this.toDomain(saved);
  }

  async update(progress: MediaProgress): Promise<MediaProgress> {
    const updated = await this.prisma.mediaProgress.update({
      where: { id: progress.id.getValue() },
      data: {
        currentPosition: progress.currentPosition,
        duration: progress.duration,
        completionRate: progress.completionRate,
        isCompleted: progress.isCompleted,
        lastWatchedAt: progress.lastWatchedAt,
      },
    });

    return this.toDomain(updated);
  }

  async upsert(progress: MediaProgress): Promise<MediaProgress> {
    const upserted = await this.prisma.mediaProgress.upsert({
      where: {
        userId_mediaId: {
          userId: progress.userId,
          mediaId: progress.mediaId,
        },
      },
      create: this.toPrismaData(progress),
      update: {
        currentPosition: progress.currentPosition,
        duration: progress.duration,
        completionRate: progress.completionRate,
        isCompleted: progress.isCompleted,
        lastWatchedAt: progress.lastWatchedAt,
      },
    });

    return this.toDomain(upserted);
  }

  async findByUserAndMedia(userId: string, mediaId: string): Promise<MediaProgress | null> {
    const progress = await this.prisma.mediaProgress.findUnique({
      where: {
        userId_mediaId: { userId, mediaId },
      },
    });

    return progress ? this.toDomain(progress) : null;
  }

  async findByUser(
    userId: string,
    params: PaginationParams
  ): Promise<PaginatedResult<MediaProgress>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.mediaProgress.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { lastWatchedAt: 'desc' },
      }),
      this.prisma.mediaProgress.count({ where: { userId } }),
    ]);

    return {
      data: data.map(p => this.toDomain(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findRecentByUser(userId: string, limit: number): Promise<MediaProgress[]> {
    const progresses = await this.prisma.mediaProgress.findMany({
      where: { userId },
      orderBy: { lastWatchedAt: 'desc' },
      take: limit,
    });

    return progresses.map(p => this.toDomain(p));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.mediaProgress.delete({
      where: { id },
    });
  }

  private toDomain(prismaProgress: PrismaMediaProgress): MediaProgress {
    return MediaProgress.fromPersistence({
      id: prismaProgress.id,
      userId: prismaProgress.userId,
      mediaId: prismaProgress.mediaId,
      currentPosition: prismaProgress.currentPosition,
      duration: prismaProgress.duration,
      completionRate: prismaProgress.completionRate,
      isCompleted: prismaProgress.isCompleted,
      lastWatchedAt: prismaProgress.lastWatchedAt,
      createdAt: prismaProgress.createdAt,
      updatedAt: prismaProgress.updatedAt,
    });
  }

  private toPrismaData(progress: MediaProgress) {
    return {
      id: progress.id.getValue(),
      userId: progress.userId,
      mediaId: progress.mediaId,
      currentPosition: progress.currentPosition,
      duration: progress.duration,
      completionRate: progress.completionRate,
      isCompleted: progress.isCompleted,
      lastWatchedAt: progress.lastWatchedAt,
    };
  }
}
