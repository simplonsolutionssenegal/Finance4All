import { PrismaMediaProgressRepository } from '@/infrastructure/persistence/repositories/PrismaMediaProgressRepository';
import { MediaProgress } from '@/domain/streaming/entities/MediaProgress';
import type { PrismaClient, MediaProgress as PrismaMediaProgress } from '@prisma/client';
import { randomUUID } from 'crypto';

describe('PrismaMediaProgressRepository', () => {
  let repository: PrismaMediaProgressRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let testUuid1: string;
  let testUuid2: string;
  let testUserId: string;
  let testMediaId: string;

  beforeEach(() => {
    testUuid1 = randomUUID();
    testUuid2 = randomUUID();
    testUserId = 'user-123';
    testMediaId = randomUUID();

    mockPrisma = {
      mediaProgress: {
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    } as any;

    repository = new PrismaMediaProgressRepository(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createPrismaProgress = (
    id: string,
    userId: string,
    mediaId: string,
    overrides: Partial<PrismaMediaProgress> = {}
  ): PrismaMediaProgress => ({
    id,
    userId,
    mediaId,
    currentPosition: 300,
    duration: 600,
    completionRate: 50,
    isCompleted: false,
    lastWatchedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('save', () => {
    it('should save progress successfully', async () => {
      const progress = MediaProgress.create(testUserId, testMediaId, 600);
      progress.updateProgress(300, 600);

      const prismaProgress = createPrismaProgress(progress.id.getValue(), testUserId, testMediaId);

      (mockPrisma.mediaProgress.create as jest.Mock).mockResolvedValue(prismaProgress);

      const result = await repository.save(progress);

      expect(mockPrisma.mediaProgress.create).toHaveBeenCalledWith({
        data: {
          id: progress.id.getValue(),
          userId: testUserId,
          mediaId: testMediaId,
          currentPosition: 300,
          duration: 600,
          completionRate: 50,
          isCompleted: false,
          lastWatchedAt: expect.any(Date),
        },
      });

      expect(result).toBeInstanceOf(MediaProgress);
      expect(result.userId).toBe(testUserId);
      expect(result.mediaId).toBe(testMediaId);
    });

    it('should throw error when save fails', async () => {
      const progress = MediaProgress.create(testUserId, testMediaId, 600);

      (mockPrisma.mediaProgress.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(repository.save(progress)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('should update progress successfully', async () => {
      const progress = MediaProgress.create(testUserId, testMediaId, 600);
      progress.updateProgress(450, 600);

      const prismaProgress = createPrismaProgress(progress.id.getValue(), testUserId, testMediaId, {
        currentPosition: 450,
        completionRate: 75,
      });

      (mockPrisma.mediaProgress.update as jest.Mock).mockResolvedValue(prismaProgress);

      const result = await repository.update(progress);

      expect(mockPrisma.mediaProgress.update).toHaveBeenCalledWith({
        where: { id: progress.id.getValue() },
        data: {
          currentPosition: 450,
          duration: 600,
          completionRate: 75,
          isCompleted: false,
          lastWatchedAt: expect.any(Date),
        },
      });

      expect(result).toBeInstanceOf(MediaProgress);
    });

    it('should update completed progress', async () => {
      const progress = MediaProgress.create(testUserId, testMediaId, 600);
      progress.markAsCompleted();

      const prismaProgress = createPrismaProgress(progress.id.getValue(), testUserId, testMediaId, {
        completionRate: 100,
        isCompleted: true,
      });

      (mockPrisma.mediaProgress.update as jest.Mock).mockResolvedValue(prismaProgress);

      const result = await repository.update(progress);

      expect(result.isCompleted).toBe(true);
      expect(result.completionRate).toBe(100);
    });

    it('should throw error when update fails', async () => {
      const progress = MediaProgress.create(testUserId, testMediaId, 600);

      (mockPrisma.mediaProgress.update as jest.Mock).mockRejectedValue(new Error('Not found'));

      await expect(repository.update(progress)).rejects.toThrow('Not found');
    });
  });

  describe('upsert', () => {
    it('should create progress when not exists', async () => {
      const progress = MediaProgress.create(testUserId, testMediaId, 600);
      progress.updateProgress(100, 600);

      const prismaProgress = createPrismaProgress(progress.id.getValue(), testUserId, testMediaId, {
        currentPosition: 100,
        completionRate: 16.67,
      });

      (mockPrisma.mediaProgress.upsert as jest.Mock).mockResolvedValue(prismaProgress);

      const result = await repository.upsert(progress);

      expect(mockPrisma.mediaProgress.upsert).toHaveBeenCalledWith({
        where: {
          userId_mediaId: {
            userId: testUserId,
            mediaId: testMediaId,
          },
        },
        create: {
          id: progress.id.getValue(),
          userId: testUserId,
          mediaId: testMediaId,
          currentPosition: 100,
          duration: 600,
          completionRate: expect.any(Number),
          isCompleted: false,
          lastWatchedAt: expect.any(Date),
        },
        update: {
          currentPosition: 100,
          duration: 600,
          completionRate: expect.any(Number),
          isCompleted: false,
          lastWatchedAt: expect.any(Date),
        },
      });

      expect(result).toBeInstanceOf(MediaProgress);
    });

    it('should update progress when exists', async () => {
      const progress = MediaProgress.create(testUserId, testMediaId, 600);
      progress.updateProgress(500, 600);

      const prismaProgress = createPrismaProgress(progress.id.getValue(), testUserId, testMediaId, {
        currentPosition: 500,
        completionRate: 83.33,
      });

      (mockPrisma.mediaProgress.upsert as jest.Mock).mockResolvedValue(prismaProgress);

      const result = await repository.upsert(progress);

      expect(result).toBeInstanceOf(MediaProgress);
    });

    it('should throw error when upsert fails', async () => {
      const progress = MediaProgress.create(testUserId, testMediaId, 600);

      (mockPrisma.mediaProgress.upsert as jest.Mock).mockRejectedValue(new Error('Upsert failed'));

      await expect(repository.upsert(progress)).rejects.toThrow('Upsert failed');
    });
  });

  describe('findByUserAndMedia', () => {
    it('should find progress by user and media', async () => {
      const prismaProgress = createPrismaProgress(testUuid1, testUserId, testMediaId);

      (mockPrisma.mediaProgress.findUnique as jest.Mock).mockResolvedValue(prismaProgress);

      const result = await repository.findByUserAndMedia(testUserId, testMediaId);

      expect(mockPrisma.mediaProgress.findUnique).toHaveBeenCalledWith({
        where: {
          userId_mediaId: { userId: testUserId, mediaId: testMediaId },
        },
      });

      expect(result).toBeInstanceOf(MediaProgress);
      expect(result?.userId).toBe(testUserId);
      expect(result?.mediaId).toBe(testMediaId);
    });

    it('should return null when progress not found', async () => {
      (mockPrisma.mediaProgress.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByUserAndMedia(testUserId, testMediaId);

      expect(result).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('should return paginated progress for user', async () => {
      const prismaProgresses = [
        createPrismaProgress(testUuid1, testUserId, testMediaId),
        createPrismaProgress(testUuid2, testUserId, randomUUID()),
      ];

      (mockPrisma.mediaProgress.findMany as jest.Mock).mockResolvedValue(prismaProgresses);
      (mockPrisma.mediaProgress.count as jest.Mock).mockResolvedValue(10);

      const result = await repository.findByUser(testUserId, { page: 1, limit: 2 });

      expect(mockPrisma.mediaProgress.findMany).toHaveBeenCalledWith({
        where: { userId: testUserId },
        skip: 0,
        take: 2,
        orderBy: { lastWatchedAt: 'desc' },
      });

      expect(mockPrisma.mediaProgress.count).toHaveBeenCalledWith({
        where: { userId: testUserId },
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 10,
        totalPages: 5,
      });
    });

    it('should handle pagination correctly for page 2', async () => {
      (mockPrisma.mediaProgress.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.mediaProgress.count as jest.Mock).mockResolvedValue(15);

      const result = await repository.findByUser(testUserId, { page: 2, limit: 5 });

      expect(mockPrisma.mediaProgress.findMany).toHaveBeenCalledWith({
        where: { userId: testUserId },
        skip: 5,
        take: 5,
        orderBy: { lastWatchedAt: 'desc' },
      });

      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
      });
    });

    it('should return empty array when no progress found', async () => {
      (mockPrisma.mediaProgress.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.mediaProgress.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.findByUser(testUserId, { page: 1, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });

  describe('findRecentByUser', () => {
    it('should find recent progress for user', async () => {
      const prismaProgresses = [
        createPrismaProgress(testUuid1, testUserId, testMediaId, {
          lastWatchedAt: new Date('2025-01-02'),
        }),
        createPrismaProgress(testUuid2, testUserId, randomUUID(), {
          lastWatchedAt: new Date('2025-01-01'),
        }),
      ];

      (mockPrisma.mediaProgress.findMany as jest.Mock).mockResolvedValue(prismaProgresses);

      const result = await repository.findRecentByUser(testUserId, 5);

      expect(mockPrisma.mediaProgress.findMany).toHaveBeenCalledWith({
        where: { userId: testUserId },
        orderBy: { lastWatchedAt: 'desc' },
        take: 5,
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(MediaProgress);
    });

    it('should return empty array when no progress found', async () => {
      (mockPrisma.mediaProgress.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.findRecentByUser(testUserId, 10);

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete progress by id', async () => {
      (mockPrisma.mediaProgress.delete as jest.Mock).mockResolvedValue({});

      await repository.delete(testUuid1);

      expect(mockPrisma.mediaProgress.delete).toHaveBeenCalledWith({
        where: { id: testUuid1 },
      });
    });

    it('should throw error when delete fails', async () => {
      (mockPrisma.mediaProgress.delete as jest.Mock).mockRejectedValue(new Error('Not found'));

      await expect(repository.delete(testUuid1)).rejects.toThrow('Not found');
    });
  });

  describe('toDomain transformation', () => {
    it('should correctly transform prisma entity to domain entity', async () => {
      const createdAt = new Date('2025-01-01');
      const updatedAt = new Date('2025-01-02');
      const lastWatchedAt = new Date('2025-01-02T10:00:00Z');

      const prismaProgress: PrismaMediaProgress = {
        id: testUuid1,
        userId: testUserId,
        mediaId: testMediaId,
        currentPosition: 450,
        duration: 600,
        completionRate: 75,
        isCompleted: false,
        lastWatchedAt,
        createdAt,
        updatedAt,
      };

      (mockPrisma.mediaProgress.findUnique as jest.Mock).mockResolvedValue(prismaProgress);

      const result = await repository.findByUserAndMedia(testUserId, testMediaId);

      expect(result?.id.getValue()).toBe(testUuid1);
      expect(result?.userId).toBe(testUserId);
      expect(result?.mediaId).toBe(testMediaId);
      expect(result?.currentPosition).toBe(450);
      expect(result?.duration).toBe(600);
      expect(result?.completionRate).toBe(75);
      expect(result?.isCompleted).toBe(false);
      expect(result?.lastWatchedAt).toEqual(lastWatchedAt);
    });

    it('should handle completed progress', async () => {
      const prismaProgress = createPrismaProgress(testUuid1, testUserId, testMediaId, {
        currentPosition: 600,
        completionRate: 100,
        isCompleted: true,
      });

      (mockPrisma.mediaProgress.findUnique as jest.Mock).mockResolvedValue(prismaProgress);

      const result = await repository.findByUserAndMedia(testUserId, testMediaId);

      expect(result?.isCompleted).toBe(true);
      expect(result?.completionRate).toBe(100);
    });
  });

  describe('toPrismaData transformation', () => {
    it('should correctly transform domain entity to prisma data', async () => {
      const progress = MediaProgress.create(testUserId, testMediaId, 600);
      progress.updateProgress(300, 600);

      const prismaProgress = createPrismaProgress(progress.id.getValue(), testUserId, testMediaId);
      (mockPrisma.mediaProgress.create as jest.Mock).mockResolvedValue(prismaProgress);

      await repository.save(progress);

      expect(mockPrisma.mediaProgress.create).toHaveBeenCalledWith({
        data: {
          id: progress.id.getValue(),
          userId: testUserId,
          mediaId: testMediaId,
          currentPosition: 300,
          duration: 600,
          completionRate: 50,
          isCompleted: false,
          lastWatchedAt: expect.any(Date),
        },
      });
    });
  });
});
