import { Prisma, type PrismaClient, type Media as PrismaMedia } from '@prisma/client';
import { Media } from '@/domain/media/entities/Media';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import type { MediaType } from '@/domain/media/value-objects/MediaType';
import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';
import { EntityId } from '@/domain/shared/EntityId';

export class PrismaMediaRepository implements MediaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(media: Media): Promise<Media> {
    const data = this.toPrismaData(media);

    const saved = await this.prisma.media.create({
      data,
    });

    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Media | null> {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    return media ? this.toDomain(media) : null;
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Media>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.media.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.media.count(),
    ]);

    return {
      data: data.map(m => this.toDomain(m)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByType(type: MediaType, params: PaginationParams): Promise<PaginatedResult<Media>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.media.findMany({
        where: { type },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.media.count({ where: { type } }),
    ]);

    return {
      data: data.map(m => this.toDomain(m)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.media.delete({
      where: { id },
    });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.prisma.media.count({
      where: { id },
    });
    return count > 0;
  }

  private toDomain(prismaMedia: PrismaMedia): Media {
    return new Media({
      id: EntityId.from(prismaMedia.id),
      filename: prismaMedia.filename,
      originalName: prismaMedia.originalName,
      mimeType: prismaMedia.mimeType,
      type: prismaMedia.type as MediaType,
      size: prismaMedia.size,
      bucket: prismaMedia.bucket,
      path: prismaMedia.path,
      metadata: prismaMedia.metadata as Record<string, string> | null,
      createdAt: prismaMedia.createdAt,
      updatedAt: prismaMedia.updatedAt,
    });
  }

  private toPrismaData(media: Media): Prisma.MediaCreateInput {
    return {
      id: media.id.getValue(),
      filename: media.filename,
      originalName: media.originalName,
      mimeType: media.mimeType,
      type: media.type,
      size: media.size,
      bucket: media.bucket,
      path: media.path,
      metadata: media.metadata ?? Prisma.JsonNull,
    };
  }
}
