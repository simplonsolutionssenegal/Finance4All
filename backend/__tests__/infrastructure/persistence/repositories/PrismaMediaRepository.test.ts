import { PrismaMediaRepository } from '@/infrastructure/persistence/repositories/PrismaMediaRepository';
import { Media } from '@/domain/media/entities/Media';
import { EntityId } from '@/domain/shared/EntityId';
import { MediaType } from '@/domain/media/value-objects/MediaType';
import type { PrismaClient, Media as PrismaMedia } from '@prisma/client';
import { randomUUID } from 'crypto';

describe('PrismaMediaRepository', () => {
  let repository: PrismaMediaRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let testUuid1: string;
  let testUuid2: string;
  let testUuid3: string;

  beforeEach(() => {
    testUuid1 = randomUUID();
    testUuid2 = randomUUID();
    testUuid3 = randomUUID();

    mockPrisma = {
      media: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
      },
    } as any;

    repository = new PrismaMediaRepository(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a media successfully', async () => {
      const media = new Media({
        id: EntityId.from(testUuid1),
        filename: 'test-file.jpg',
        originalName: 'original.jpg',
        mimeType: 'video/mp4',
        type: MediaType.VIDEO,
        size: 1024000,
        bucket: 'test-bucket',
        path: 'images/test-file.jpg',
        metadata: { width: '1920', height: '1080' },
        isTemporary: false,
        expiresAt: null,
      });

      const prismaMedia: PrismaMedia = {
        id: testUuid1,
        filename: 'test-file.jpg',
        originalName: 'original.jpg',
        mimeType: 'video/mp4',
        type: MediaType.VIDEO,
        size: 1024000,
        bucket: 'test-bucket',
        path: 'images/test-file.jpg',
        metadata: { width: '1920', height: '1080' },
        isTemporary: false,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.media.create as jest.Mock).mockResolvedValue(prismaMedia);

      const result = await repository.save(media);

      expect(mockPrisma.media.create).toHaveBeenCalledWith({
        data: {
          id: testUuid1,
          filename: 'test-file.jpg',
          originalName: 'original.jpg',
          mimeType: 'video/mp4',
          type: 'VIDEO',
          size: 1024000,
          bucket: 'test-bucket',
          path: 'images/test-file.jpg',
          metadata: { width: '1920', height: '1080' },
          isTemporary: false,
          expiresAt: null,
        },
      });

      expect(result).toBeInstanceOf(Media);
      expect(result.id.getValue()).toBe(testUuid1);
      expect(result.filename).toBe('test-file.jpg');
      expect(result.type).toBe(MediaType.VIDEO);
    });

    it('should save media with null metadata', async () => {
      const media = new Media({
        id: EntityId.from(testUuid2),
        filename: 'video.mp4',
        originalName: 'video.mp4',
        mimeType: 'video/mp4',
        type: MediaType.VIDEO,
        size: 5000000,
        bucket: 'videos',
        path: 'uploads/video.mp4',
        metadata: null,
        isTemporary: true,
        expiresAt: new Date('2026-12-31'),
      });

      const prismaMedia: PrismaMedia = {
        id: testUuid2,
        filename: 'video.mp4',
        originalName: 'video.mp4',
        mimeType: 'video/mp4',
        type: MediaType.VIDEO,
        size: 5000000,
        bucket: 'videos',
        path: 'uploads/video.mp4',
        metadata: null,
        isTemporary: true,
        expiresAt: new Date('2026-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.media.create as jest.Mock).mockResolvedValue(prismaMedia);

      const result = await repository.save(media);

      expect(mockPrisma.media.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Object),
        })
      );

      expect(result.metadata).toBeNull();
    });

    it('should throw error when save fails', async () => {
      const media = new Media({
        id: EntityId.from(testUuid1),
        filename: 'test.jpg',
        originalName: 'test.jpg',
        mimeType: 'video/mp4',
        type: MediaType.VIDEO,
        size: 1024,
        bucket: 'test',
        path: 'test.jpg',
        metadata: null,
      });

      (mockPrisma.media.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(repository.save(media)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('should update media successfully', async () => {
      const media = new Media({
        id: EntityId.from(testUuid1),
        filename: 'test.jpg',
        originalName: 'test.jpg',
        mimeType: 'video/mp4',
        type: MediaType.VIDEO,
        size: 1024,
        bucket: 'test',
        path: 'test.jpg',
        metadata: { updated: 'true' },
        isTemporary: false,
        expiresAt: null,
      });

      const prismaMedia: PrismaMedia = {
        id: testUuid1,
        filename: 'test.jpg',
        originalName: 'test.jpg',
        mimeType: 'video/mp4',
        type: MediaType.VIDEO,
        size: 1024,
        bucket: 'test',
        path: 'test.jpg',
        metadata: { updated: 'true' },
        isTemporary: false,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.media.update as jest.Mock).mockResolvedValue(prismaMedia);

      const result = await repository.update(media);

      expect(mockPrisma.media.update).toHaveBeenCalledWith({
        where: { id: testUuid1 },
        data: {
          metadata: { updated: 'true' },
          isTemporary: false,
          expiresAt: null,
        },
      });

      expect(result).toBeInstanceOf(Media);
      expect(result.id.getValue()).toBe(testUuid1);
    });

    it('should update media with null metadata', async () => {
      const media = new Media({
        id: EntityId.from(testUuid1),
        filename: 'test.jpg',
        originalName: 'test.jpg',
        mimeType: 'video/mp4',
        type: MediaType.VIDEO,
        size: 1024,
        bucket: 'test',
        path: 'test.jpg',
        metadata: null,
        isTemporary: true,
        expiresAt: new Date('2026-12-31'),
      });

      const prismaMedia: PrismaMedia = {
        id: testUuid1,
        filename: 'test.jpg',
        originalName: 'test.jpg',
        mimeType: 'video/mp4',
        type: MediaType.VIDEO,
        size: 1024,
        bucket: 'test',
        path: 'test.jpg',
        metadata: null,
        isTemporary: true,
        expiresAt: new Date('2026-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.media.update as jest.Mock).mockResolvedValue(prismaMedia);

      await repository.update(media);

      expect(mockPrisma.media.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: testUuid1 },
          data: expect.objectContaining({
            isTemporary: true,
            expiresAt: expect.any(Date),
          }),
        })
      );
    });

    it('should throw error when update fails', async () => {
      const media = new Media({
        id: EntityId.from(testUuid1),
        filename: 'test.jpg',
        originalName: 'test.jpg',
        mimeType: 'video/mp4',
        type: MediaType.VIDEO,
        size: 1024,
        bucket: 'test',
        path: 'test.jpg',
        metadata: null,
      });

      (mockPrisma.media.update as jest.Mock).mockRejectedValue(new Error('Media not found'));

      await expect(repository.update(media)).rejects.toThrow('Media not found');
    });
  });

  describe('findById', () => {
    it('should find media by id', async () => {
      const prismaMedia: PrismaMedia = {
        id: testUuid1,
        filename: 'test.jpg',
        originalName: 'test.jpg',
        mimeType: 'video/mp4',
        type: MediaType.VIDEO,
        size: 1024,
        bucket: 'test',
        path: 'test.jpg',
        metadata: { key: 'value' },
        isTemporary: false,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.media.findUnique as jest.Mock).mockResolvedValue(prismaMedia);

      const result = await repository.findById(testUuid1);

      expect(mockPrisma.media.findUnique).toHaveBeenCalledWith({
        where: { id: testUuid1 },
      });

      expect(result).toBeInstanceOf(Media);
      expect(result?.id.getValue()).toBe(testUuid1);
      expect(result?.filename).toBe('test.jpg');
    });

    it('should return null when media not found', async () => {
      (mockPrisma.media.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById(testUuid1);

      expect(mockPrisma.media.findUnique).toHaveBeenCalledWith({
        where: { id: testUuid1 },
      });

      expect(result).toBeNull();
    });

    it('should handle media with null metadata', async () => {
      const prismaMedia: PrismaMedia = {
        id: testUuid1,
        filename: 'test.jpg',
        originalName: 'test.jpg',
        mimeType: 'video/mp4',
        type: MediaType.VIDEO,
        size: 1024,
        bucket: 'test',
        path: 'test.jpg',
        metadata: null,
        isTemporary: false,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.media.findUnique as jest.Mock).mockResolvedValue(prismaMedia);

      const result = await repository.findById(testUuid1);

      expect(result?.metadata).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return paginated media', async () => {
      const prismaMediaList: PrismaMedia[] = [
        {
          id: testUuid1,
          filename: 'test1.jpg',
          originalName: 'test1.jpg',
          mimeType: 'video/mp4',
          type: 'VIDEO',
          size: 1024,
          bucket: 'test',
          path: 'test1.jpg',
          metadata: null,
          isTemporary: false,
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: testUuid2,
          filename: 'test2.jpg',
          originalName: 'test2.jpg',
          mimeType: 'video/mp4',
          type: 'VIDEO',
          size: 2048,
          bucket: 'test',
          path: 'test2.jpg',
          metadata: null,
          isTemporary: false,
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPrisma.media.findMany as jest.Mock).mockResolvedValue(prismaMediaList);
      (mockPrisma.media.count as jest.Mock).mockResolvedValue(10);

      const result = await repository.findAll({ page: 1, limit: 2 });

      expect(mockPrisma.media.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 2,
        orderBy: { createdAt: 'desc' },
      });

      expect(mockPrisma.media.count).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 10,
        totalPages: 5,
      });
    });

    it('should handle pagination correctly for page 2', async () => {
      const prismaMediaList: PrismaMedia[] = [];

      (mockPrisma.media.findMany as jest.Mock).mockResolvedValue(prismaMediaList);
      (mockPrisma.media.count as jest.Mock).mockResolvedValue(15);

      const result = await repository.findAll({ page: 2, limit: 5 });

      expect(mockPrisma.media.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
      });
    });

    it('should return empty array when no media found', async () => {
      (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.media.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });

  describe('findByType', () => {
    it('should find media by type', async () => {
      const prismaMediaList: PrismaMedia[] = [
        {
          id: testUuid1,
          filename: 'video1.mp4',
          originalName: 'video1.mp4',
          mimeType: 'video/mp4',
          type: 'VIDEO',
          size: 5000000,
          bucket: 'videos',
          path: 'video1.mp4',
          metadata: null,
          isTemporary: false,
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPrisma.media.findMany as jest.Mock).mockResolvedValue(prismaMediaList);
      (mockPrisma.media.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findByType(MediaType.VIDEO, { page: 1, limit: 10 });

      expect(mockPrisma.media.findMany).toHaveBeenCalledWith({
        where: { type: 'VIDEO' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      expect(mockPrisma.media.count).toHaveBeenCalledWith({
        where: { type: 'VIDEO' },
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe('VIDEO');
    });

    it('should handle pagination for findByType', async () => {
      (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.media.count as jest.Mock).mockResolvedValue(20);

      const result = await repository.findByType(MediaType.PDF, { page: 3, limit: 5 });

      expect(mockPrisma.media.findMany).toHaveBeenCalledWith({
        where: { type: MediaType.PDF },
        skip: 10,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      expect(result.pagination).toEqual({
        page: 3,
        limit: 5,
        total: 20,
        totalPages: 4,
      });
    });

    it('should return empty array when no media of type found', async () => {
      (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.media.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.findByType(MediaType.AUDIO, { page: 1, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('findExpiredTemporaryMedia', () => {
    it('should find expired temporary media', async () => {
      const expiredDate = new Date('2025-01-01');
      const prismaMediaList: PrismaMedia[] = [
        {
          id: testUuid1,
          filename: 'expired1.jpg',
          originalName: 'expired1.jpg',
          mimeType: 'video/mp4',
          type: 'VIDEO',
          size: 1024,
          bucket: 'temp',
          path: 'expired1.jpg',
          metadata: null,
          isTemporary: true,
          expiresAt: expiredDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: testUuid2,
          filename: 'expired2.jpg',
          originalName: 'expired2.jpg',
          mimeType: 'video/mp4',
          type: 'VIDEO',
          size: 2048,
          bucket: 'temp',
          path: 'expired2.jpg',
          metadata: null,
          isTemporary: true,
          expiresAt: expiredDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPrisma.media.findMany as jest.Mock).mockResolvedValue(prismaMediaList);

      const result = await repository.findExpiredTemporaryMedia();

      expect(mockPrisma.media.findMany).toHaveBeenCalledWith({
        where: {
          isTemporary: true,
          expiresAt: {
            lte: expect.any(Date),
          },
        },
      });

      expect(result).toHaveLength(2);
      expect(result[0].isTemporary).toBe(true);
      expect(result[1].isTemporary).toBe(true);
    });

    it('should return empty array when no expired media found', async () => {
      (mockPrisma.media.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.findExpiredTemporaryMedia();

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete media by id', async () => {
      (mockPrisma.media.delete as jest.Mock).mockResolvedValue({});

      await repository.delete(testUuid1);

      expect(mockPrisma.media.delete).toHaveBeenCalledWith({
        where: { id: testUuid1 },
      });
    });

    it('should throw error when delete fails', async () => {
      (mockPrisma.media.delete as jest.Mock).mockRejectedValue(new Error('Media not found'));

      await expect(repository.delete(testUuid1)).rejects.toThrow('Media not found');
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple media by ids', async () => {
      const ids = [testUuid1, testUuid2, testUuid3];

      (mockPrisma.media.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });

      await repository.deleteMany(ids);

      expect(mockPrisma.media.deleteMany).toHaveBeenCalledWith({
        where: {
          id: { in: ids },
        },
      });
    });

    it('should handle empty ids array', async () => {
      (mockPrisma.media.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      await repository.deleteMany([]);

      expect(mockPrisma.media.deleteMany).toHaveBeenCalledWith({
        where: {
          id: { in: [] },
        },
      });
    });

    it('should throw error when deleteMany fails', async () => {
      (mockPrisma.media.deleteMany as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      await expect(repository.deleteMany([testUuid1])).rejects.toThrow('Delete failed');
    });
  });

  describe('existsById', () => {
    it('should return true when media exists', async () => {
      (mockPrisma.media.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.existsById(testUuid1);

      expect(mockPrisma.media.count).toHaveBeenCalledWith({
        where: { id: testUuid1 },
      });

      expect(result).toBe(true);
    });

    it('should return false when media does not exist', async () => {
      (mockPrisma.media.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.existsById(testUuid1);

      expect(mockPrisma.media.count).toHaveBeenCalledWith({
        where: { id: testUuid1 },
      });

      expect(result).toBe(false);
    });

    it('should throw error when count fails', async () => {
      (mockPrisma.media.count as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(repository.existsById(testUuid1)).rejects.toThrow('Database error');
    });
  });

  describe('toDomain transformation', () => {
    it('should transform prisma media to domain media correctly', async () => {
      const createdAt = new Date('2025-01-01');
      const updatedAt = new Date('2025-01-02');
      const expiresAt = new Date('2026-01-01');

      const prismaMedia: PrismaMedia = {
        id: testUuid1,
        filename: 'test.jpg',
        originalName: 'original.jpg',
        mimeType: 'video/mp4',
        type: MediaType.VIDEO,
        size: 1024000,
        bucket: 'images',
        path: 'uploads/test.jpg',
        metadata: { width: '1920', height: '1080' },
        isTemporary: true,
        expiresAt,
        createdAt,
        updatedAt,
      };

      (mockPrisma.media.findUnique as jest.Mock).mockResolvedValue(prismaMedia);

      const result = await repository.findById(testUuid1);

      expect(result?.id.getValue()).toBe(testUuid1);
      expect(result?.filename).toBe('test.jpg');
      expect(result?.originalName).toBe('original.jpg');
      expect(result?.mimeType).toBe('video/mp4');
      expect(result?.type).toBe(MediaType.VIDEO);
      expect(result?.size).toBe(1024000);
      expect(result?.bucket).toBe('images');
      expect(result?.path).toBe('uploads/test.jpg');
      expect(result?.metadata).toEqual({ width: '1920', height: '1080' });
      expect(result?.isTemporary).toBe(true);
      expect(result?.expiresAt).toEqual(expiresAt);
    });
  });

  describe('toPrismaData transformation', () => {
    it('should transform domain media to prisma data correctly', async () => {
      const expiresAt = new Date('2026-01-01');
      const media = new Media({
        id: EntityId.from(testUuid1),
        filename: 'test.jpg',
        originalName: 'original.jpg',
        mimeType: 'video/mp4',
        type: MediaType.VIDEO,
        size: 1024000,
        bucket: 'images',
        path: 'uploads/test.jpg',
        metadata: { width: '1920', height: '1080' },
        isTemporary: true,
        expiresAt,
      });

      const prismaMedia: PrismaMedia = {
        id: testUuid1,
        filename: 'test.jpg',
        originalName: 'original.jpg',
        mimeType: 'video/mp4',
        type: MediaType.VIDEO,
        size: 1024000,
        bucket: 'images',
        path: 'uploads/test.jpg',
        metadata: { width: '1920', height: '1080' },
        isTemporary: true,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.media.create as jest.Mock).mockResolvedValue(prismaMedia);

      await repository.save(media);

      expect(mockPrisma.media.create).toHaveBeenCalledWith({
        data: {
          id: testUuid1,
          filename: 'test.jpg',
          originalName: 'original.jpg',
          mimeType: 'video/mp4',
          type: 'VIDEO',
          size: 1024000,
          bucket: 'images',
          path: 'uploads/test.jpg',
          metadata: { width: '1920', height: '1080' },
          isTemporary: true,
          expiresAt,
        },
      });
    });
  });
});
