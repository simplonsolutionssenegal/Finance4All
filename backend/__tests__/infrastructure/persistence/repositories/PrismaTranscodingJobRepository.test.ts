import { PrismaTranscodingJobRepository } from '@/infrastructure/persistence/repositories/PrismaTranscodingJobRepository';
import { TranscodingJob } from '@/domain/streaming/entities/TranscodingJob';
import { TranscodingStatus } from '@/domain/streaming/value-objects/TranscodingStatus';
import type { PrismaClient, TranscodingJob as PrismaTranscodingJob } from '@prisma/client';
import { randomUUID } from 'crypto';

describe('PrismaTranscodingJobRepository', () => {
  let repository: PrismaTranscodingJobRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let testUuid1: string;
  let testUuid2: string;
  let testMediaId: string;

  beforeEach(() => {
    testUuid1 = randomUUID();
    testUuid2 = randomUUID();
    testMediaId = randomUUID();

    mockPrisma = {
      transcodingJob: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
    } as any;

    repository = new PrismaTranscodingJobRepository(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createPrismaJob = (
    id: string,
    mediaId: string,
    overrides: Partial<PrismaTranscodingJob> = {}
  ): PrismaTranscodingJob => ({
    id,
    mediaId,
    status: TranscodingStatus.PENDING,
    progress: 0,
    errorMessage: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('save', () => {
    it('should save job successfully', async () => {
      const job = TranscodingJob.create(testMediaId);

      const prismaJob = createPrismaJob(job.id.getValue(), testMediaId);

      (mockPrisma.transcodingJob.create as jest.Mock).mockResolvedValue(prismaJob);

      const result = await repository.save(job);

      expect(mockPrisma.transcodingJob.create).toHaveBeenCalledWith({
        data: {
          id: job.id.getValue(),
          mediaId: testMediaId,
          status: TranscodingStatus.PENDING,
          progress: 0,
          errorMessage: null,
          startedAt: null,
          completedAt: null,
        },
      });

      expect(result).toBeInstanceOf(TranscodingJob);
      expect(result.mediaId).toBe(testMediaId);
      expect(result.status).toBe(TranscodingStatus.PENDING);
    });

    it('should throw error when save fails', async () => {
      const job = TranscodingJob.create(testMediaId);

      (mockPrisma.transcodingJob.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(repository.save(job)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('should update job progress', async () => {
      const job = TranscodingJob.create(testMediaId);
      job.start();
      job.updateProgress(50);

      const startedAt = job.startedAt;

      const prismaJob = createPrismaJob(job.id.getValue(), testMediaId, {
        status: TranscodingStatus.PROCESSING,
        progress: 50,
        startedAt,
      });

      (mockPrisma.transcodingJob.update as jest.Mock).mockResolvedValue(prismaJob);

      const result = await repository.update(job);

      expect(mockPrisma.transcodingJob.update).toHaveBeenCalledWith({
        where: { id: job.id.getValue() },
        data: {
          status: TranscodingStatus.PROCESSING,
          progress: 50,
          errorMessage: null,
          startedAt,
          completedAt: null,
        },
      });

      expect(result.progress).toBe(50);
      expect(result.status).toBe(TranscodingStatus.PROCESSING);
    });

    it('should update job to completed', async () => {
      const job = TranscodingJob.create(testMediaId);
      job.start();
      job.complete();

      const prismaJob = createPrismaJob(job.id.getValue(), testMediaId, {
        status: TranscodingStatus.COMPLETED,
        progress: 100,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
      });

      (mockPrisma.transcodingJob.update as jest.Mock).mockResolvedValue(prismaJob);

      const result = await repository.update(job);

      expect(result.status).toBe(TranscodingStatus.COMPLETED);
      expect(result.progress).toBe(100);
    });

    it('should update job to failed', async () => {
      const job = TranscodingJob.create(testMediaId);
      job.start();
      job.fail('FFmpeg error');

      const prismaJob = createPrismaJob(job.id.getValue(), testMediaId, {
        status: TranscodingStatus.FAILED,
        errorMessage: 'FFmpeg error',
        startedAt: job.startedAt,
        completedAt: job.completedAt,
      });

      (mockPrisma.transcodingJob.update as jest.Mock).mockResolvedValue(prismaJob);

      const result = await repository.update(job);

      expect(result.status).toBe(TranscodingStatus.FAILED);
      expect(result.errorMessage).toBe('FFmpeg error');
    });

    it('should throw error when update fails', async () => {
      const job = TranscodingJob.create(testMediaId);

      (mockPrisma.transcodingJob.update as jest.Mock).mockRejectedValue(new Error('Not found'));

      await expect(repository.update(job)).rejects.toThrow('Not found');
    });
  });

  describe('findById', () => {
    it('should find job by id', async () => {
      const prismaJob = createPrismaJob(testUuid1, testMediaId, {
        status: TranscodingStatus.PROCESSING,
        progress: 75,
        startedAt: new Date(),
      });

      (mockPrisma.transcodingJob.findUnique as jest.Mock).mockResolvedValue(prismaJob);

      const result = await repository.findById(testUuid1);

      expect(mockPrisma.transcodingJob.findUnique).toHaveBeenCalledWith({
        where: { id: testUuid1 },
      });

      expect(result).toBeInstanceOf(TranscodingJob);
      expect(result?.id.getValue()).toBe(testUuid1);
    });

    it('should return null when job not found', async () => {
      (mockPrisma.transcodingJob.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById(testUuid1);

      expect(result).toBeNull();
    });
  });

  describe('findByMediaId', () => {
    it('should find job by mediaId', async () => {
      const prismaJob = createPrismaJob(testUuid1, testMediaId);

      (mockPrisma.transcodingJob.findUnique as jest.Mock).mockResolvedValue(prismaJob);

      const result = await repository.findByMediaId(testMediaId);

      expect(mockPrisma.transcodingJob.findUnique).toHaveBeenCalledWith({
        where: { mediaId: testMediaId },
      });

      expect(result).toBeInstanceOf(TranscodingJob);
      expect(result?.mediaId).toBe(testMediaId);
    });

    it('should return null when job not found', async () => {
      (mockPrisma.transcodingJob.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByMediaId(testMediaId);

      expect(result).toBeNull();
    });
  });

  describe('findByStatus', () => {
    it('should find jobs by status', async () => {
      const prismaJobs = [
        createPrismaJob(testUuid1, testMediaId, { status: TranscodingStatus.PENDING }),
        createPrismaJob(testUuid2, randomUUID(), { status: TranscodingStatus.PENDING }),
      ];

      (mockPrisma.transcodingJob.findMany as jest.Mock).mockResolvedValue(prismaJobs);

      const result = await repository.findByStatus(TranscodingStatus.PENDING);

      expect(mockPrisma.transcodingJob.findMany).toHaveBeenCalledWith({
        where: { status: TranscodingStatus.PENDING },
        orderBy: { createdAt: 'asc' },
      });

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe(TranscodingStatus.PENDING);
    });

    it('should return empty array when no jobs found', async () => {
      (mockPrisma.transcodingJob.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.findByStatus(TranscodingStatus.PROCESSING);

      expect(result).toEqual([]);
    });

    it('should find completed jobs', async () => {
      const prismaJobs = [
        createPrismaJob(testUuid1, testMediaId, {
          status: TranscodingStatus.COMPLETED,
          progress: 100,
          completedAt: new Date(),
        }),
      ];

      (mockPrisma.transcodingJob.findMany as jest.Mock).mockResolvedValue(prismaJobs);

      const result = await repository.findByStatus(TranscodingStatus.COMPLETED);

      expect(result[0].status).toBe(TranscodingStatus.COMPLETED);
    });

    it('should find failed jobs', async () => {
      const prismaJobs = [
        createPrismaJob(testUuid1, testMediaId, {
          status: TranscodingStatus.FAILED,
          errorMessage: 'Some error',
          completedAt: new Date(),
        }),
      ];

      (mockPrisma.transcodingJob.findMany as jest.Mock).mockResolvedValue(prismaJobs);

      const result = await repository.findByStatus(TranscodingStatus.FAILED);

      expect(result[0].status).toBe(TranscodingStatus.FAILED);
      expect(result[0].errorMessage).toBe('Some error');
    });
  });

  describe('delete', () => {
    it('should delete job by id', async () => {
      (mockPrisma.transcodingJob.delete as jest.Mock).mockResolvedValue({});

      await repository.delete(testUuid1);

      expect(mockPrisma.transcodingJob.delete).toHaveBeenCalledWith({
        where: { id: testUuid1 },
      });
    });

    it('should throw error when delete fails', async () => {
      (mockPrisma.transcodingJob.delete as jest.Mock).mockRejectedValue(new Error('Not found'));

      await expect(repository.delete(testUuid1)).rejects.toThrow('Not found');
    });
  });

  describe('toDomain transformation', () => {
    it('should correctly transform prisma entity to domain entity', async () => {
      const createdAt = new Date('2025-01-01');
      const updatedAt = new Date('2025-01-02');
      const startedAt = new Date('2025-01-01T00:30:00Z');
      const completedAt = new Date('2025-01-01T01:00:00Z');

      const prismaJob: PrismaTranscodingJob = {
        id: testUuid1,
        mediaId: testMediaId,
        status: TranscodingStatus.COMPLETED,
        progress: 100,
        errorMessage: null,
        startedAt,
        completedAt,
        createdAt,
        updatedAt,
      };

      (mockPrisma.transcodingJob.findUnique as jest.Mock).mockResolvedValue(prismaJob);

      const result = await repository.findById(testUuid1);

      expect(result?.id.getValue()).toBe(testUuid1);
      expect(result?.mediaId).toBe(testMediaId);
      expect(result?.status).toBe(TranscodingStatus.COMPLETED);
      expect(result?.progress).toBe(100);
      expect(result?.errorMessage).toBeNull();
      expect(result?.startedAt).toEqual(startedAt);
      expect(result?.completedAt).toEqual(completedAt);
    });

    it('should handle failed job with error message', async () => {
      const prismaJob = createPrismaJob(testUuid1, testMediaId, {
        status: TranscodingStatus.FAILED,
        errorMessage: 'FFmpeg process exited with code 1',
        startedAt: new Date(),
        completedAt: new Date(),
      });

      (mockPrisma.transcodingJob.findUnique as jest.Mock).mockResolvedValue(prismaJob);

      const result = await repository.findById(testUuid1);

      expect(result?.status).toBe(TranscodingStatus.FAILED);
      expect(result?.errorMessage).toBe('FFmpeg process exited with code 1');
    });

    it('should handle pending job with null dates', async () => {
      const prismaJob = createPrismaJob(testUuid1, testMediaId, {
        status: TranscodingStatus.PENDING,
        startedAt: null,
        completedAt: null,
      });

      (mockPrisma.transcodingJob.findUnique as jest.Mock).mockResolvedValue(prismaJob);

      const result = await repository.findById(testUuid1);

      expect(result?.startedAt).toBeNull();
      expect(result?.completedAt).toBeNull();
    });
  });

  describe('toPrismaData transformation', () => {
    it('should correctly transform domain entity to prisma data', async () => {
      const job = TranscodingJob.create(testMediaId);

      const prismaJob = createPrismaJob(job.id.getValue(), testMediaId);
      (mockPrisma.transcodingJob.create as jest.Mock).mockResolvedValue(prismaJob);

      await repository.save(job);

      expect(mockPrisma.transcodingJob.create).toHaveBeenCalledWith({
        data: {
          id: job.id.getValue(),
          mediaId: testMediaId,
          status: TranscodingStatus.PENDING,
          progress: 0,
          errorMessage: null,
          startedAt: null,
          completedAt: null,
        },
      });
    });

    it('should handle started job', async () => {
      const job = TranscodingJob.create(testMediaId);
      job.start();

      const prismaJob = createPrismaJob(job.id.getValue(), testMediaId, {
        status: TranscodingStatus.PROCESSING,
        startedAt: job.startedAt,
      });
      (mockPrisma.transcodingJob.create as jest.Mock).mockResolvedValue(prismaJob);

      await repository.save(job);

      expect(mockPrisma.transcodingJob.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: TranscodingStatus.PROCESSING,
          startedAt: expect.any(Date),
        }),
      });
    });
  });
});
