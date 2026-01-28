import type { PrismaClient, HlsVariant as PrismaHlsVariant } from '@prisma/client';
import { HlsVariant } from '@/domain/streaming/entities/HlsVariant';
import type { HlsVariantRepository } from '@/domain/streaming/ports/out/HlsVariantRepository';
import type { StreamQuality } from '@/domain/streaming/value-objects/StreamQuality';

export class PrismaHlsVariantRepository implements HlsVariantRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(variant: HlsVariant): Promise<HlsVariant> {
    const saved = await this.prisma.hlsVariant.create({
      data: this.toPrismaData(variant),
    });

    return this.toDomain(saved);
  }

  async saveMany(variants: HlsVariant[]): Promise<HlsVariant[]> {
    const data = variants.map(v => this.toPrismaData(v));

    await this.prisma.hlsVariant.createMany({
      data,
      skipDuplicates: true,
    });

    const saved = await this.prisma.hlsVariant.findMany({
      where: {
        id: { in: variants.map(v => v.id.getValue()) },
      },
    });

    return saved.map(s => this.toDomain(s));
  }

  async findByMediaId(mediaId: string): Promise<HlsVariant[]> {
    const variants = await this.prisma.hlsVariant.findMany({
      where: { mediaId },
      orderBy: { bandwidth: 'asc' },
    });

    return variants.map(v => this.toDomain(v));
  }

  async findByMediaIdAndQuality(
    mediaId: string,
    quality: StreamQuality
  ): Promise<HlsVariant | null> {
    const variant = await this.prisma.hlsVariant.findUnique({
      where: {
        mediaId_quality: { mediaId, quality },
      },
    });

    return variant ? this.toDomain(variant) : null;
  }

  async deleteByMediaId(mediaId: string): Promise<void> {
    await this.prisma.hlsVariant.deleteMany({
      where: { mediaId },
    });
  }

  private toDomain(prismaVariant: PrismaHlsVariant): HlsVariant {
    return HlsVariant.fromPersistence({
      id: prismaVariant.id,
      mediaId: prismaVariant.mediaId,
      quality: prismaVariant.quality as StreamQuality,
      bandwidth: prismaVariant.bandwidth,
      resolution: prismaVariant.resolution,
      codecs: prismaVariant.codecs,
      playlistPath: prismaVariant.playlistPath,
      segmentPrefix: prismaVariant.segmentPrefix,
      segmentCount: prismaVariant.segmentCount,
      segmentDuration: prismaVariant.segmentDuration,
      createdAt: prismaVariant.createdAt,
      updatedAt: prismaVariant.updatedAt,
    });
  }

  private toPrismaData(variant: HlsVariant) {
    return {
      id: variant.id.getValue(),
      mediaId: variant.mediaId,
      quality: variant.quality,
      bandwidth: variant.bandwidth,
      resolution: variant.resolution,
      codecs: variant.codecs,
      playlistPath: variant.playlistPath,
      segmentPrefix: variant.segmentPrefix,
      segmentCount: variant.segmentCount,
      segmentDuration: variant.segmentDuration,
    };
  }
}
