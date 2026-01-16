import type { PrismaClient, TranscodingJob as PrismaTranscodingJob } from '@prisma/client';
import { TranscodingJob } from '@/domain/streaming/entities/TranscodingJob';
import type { TranscodingJobRepository } from '@/domain/streaming/ports/out/TranscodingJobRepository';
import type { TranscodingStatus } from '@/domain/streaming/value-objects/TranscodingStatus';

export class PrismaTranscodingJobRepository implements TranscodingJobRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(job: TranscodingJob): Promise<TranscodingJob> {
    const saved = await this.prisma.transcodingJob.create({
      data: this.toPrismaData(job),
    });

    return this.toDomain(saved);
  }

  async update(job: TranscodingJob): Promise<TranscodingJob> {
    const updated = await this.prisma.transcodingJob.update({
      where: { id: job.id.getValue() },
      data: {
        status: job.status,
        progress: job.progress,
        errorMessage: job.errorMessage,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
      },
    });

    return this.toDomain(updated);
  }

  async findById(id: string): Promise<TranscodingJob | null> {
    const job = await this.prisma.transcodingJob.findUnique({
      where: { id },
    });

    return job ? this.toDomain(job) : null;
  }

  async findByMediaId(mediaId: string): Promise<TranscodingJob | null> {
    const job = await this.prisma.transcodingJob.findUnique({
      where: { mediaId },
    });

    return job ? this.toDomain(job) : null;
  }

  async findByStatus(status: TranscodingStatus): Promise<TranscodingJob[]> {
    const jobs = await this.prisma.transcodingJob.findMany({
      where: { status },
      orderBy: { createdAt: 'asc' },
    });

    return jobs.map(j => this.toDomain(j));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transcodingJob.delete({
      where: { id },
    });
  }

  private toDomain(prismaJob: PrismaTranscodingJob): TranscodingJob {
    return TranscodingJob.fromPersistence({
      id: prismaJob.id,
      mediaId: prismaJob.mediaId,
      status: prismaJob.status as TranscodingStatus,
      progress: prismaJob.progress,
      errorMessage: prismaJob.errorMessage,
      startedAt: prismaJob.startedAt,
      completedAt: prismaJob.completedAt,
      createdAt: prismaJob.createdAt,
      updatedAt: prismaJob.updatedAt,
    });
  }

  private toPrismaData(job: TranscodingJob) {
    return {
      id: job.id.getValue(),
      mediaId: job.mediaId,
      status: job.status,
      progress: job.progress,
      errorMessage: job.errorMessage,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    };
  }
}
