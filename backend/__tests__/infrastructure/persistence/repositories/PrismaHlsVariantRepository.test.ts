import { PrismaHlsVariantRepository } from '@/infrastructure/persistence/repositories/PrismaHlsVariantRepository';
import { HlsVariant } from '@/domain/streaming/entities/HlsVariant';
import { StreamQuality } from '@/domain/streaming/value-objects/StreamQuality';
import type { PrismaClient, HlsVariant as PrismaHlsVariant } from '@prisma/client';
import { randomUUID } from 'crypto';

describe('PrismaHlsVariantRepository', () => {
  let repository: PrismaHlsVariantRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let testUuid1: string;
  let testUuid2: string;
  let testMediaId: string;

  beforeEach(() => {
    testUuid1 = randomUUID();
    testUuid2 = randomUUID();
    testMediaId = randomUUID();

    mockPrisma = {
      hlsVariant: {
        create: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        deleteMany: jest.fn(),
      },
    } as any;

    repository = new PrismaHlsVariantRepository(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createPrismaVariant = (
    id: string,
    mediaId: string,
    quality: StreamQuality
  ): PrismaHlsVariant => ({
    id,
    mediaId,
    quality,
    bandwidth: 2928000,
    resolution: '1280x720',
    codecs: 'avc1.4d001f,mp4a.40.2',
    playlistPath: `${mediaId}/${quality.toLowerCase()}/playlist.m3u8`,
    segmentPrefix: `${mediaId}/${quality.toLowerCase()}/segment`,
    segmentCount: 10,
    segmentDuration: 10.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('save', () => {
    it('should save a variant successfully', async () => {
      const variant = HlsVariant.create(
        testMediaId,
        StreamQuality.Q720P,
        2928000,
        '1280x720',
        'avc1.4d001f,mp4a.40.2',
        `${testMediaId}/q720p/playlist.m3u8`,
        `${testMediaId}/q720p/segment`,
        10.0
      );

      const prismaVariant = createPrismaVariant(
        variant.id.getValue(),
        testMediaId,
        StreamQuality.Q720P
      );

      (mockPrisma.hlsVariant.create as jest.Mock).mockResolvedValue(prismaVariant);

      const result = await repository.save(variant);

      expect(mockPrisma.hlsVariant.create).toHaveBeenCalledWith({
        data: {
          id: variant.id.getValue(),
          mediaId: testMediaId,
          quality: StreamQuality.Q720P,
          bandwidth: 2928000,
          resolution: '1280x720',
          codecs: 'avc1.4d001f,mp4a.40.2',
          playlistPath: `${testMediaId}/q720p/playlist.m3u8`,
          segmentPrefix: `${testMediaId}/q720p/segment`,
          segmentCount: 0,
          segmentDuration: 10.0,
        },
      });

      expect(result).toBeInstanceOf(HlsVariant);
      expect(result.mediaId).toBe(testMediaId);
      expect(result.quality).toBe(StreamQuality.Q720P);
    });

    it('should throw error when save fails', async () => {
      const variant = HlsVariant.create(
        testMediaId,
        StreamQuality.Q720P,
        2928000,
        '1280x720',
        'avc1.4d001f,mp4a.40.2',
        `${testMediaId}/q720p/playlist.m3u8`,
        `${testMediaId}/q720p/segment`,
        10.0
      );

      (mockPrisma.hlsVariant.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(repository.save(variant)).rejects.toThrow('Database error');
    });
  });

  describe('saveMany', () => {
    it('should save multiple variants successfully', async () => {
      const variant1 = HlsVariant.create(
        testMediaId,
        StreamQuality.Q360P,
        896000,
        '640x360',
        'avc1.42001f,mp4a.40.2',
        `${testMediaId}/q360p/playlist.m3u8`,
        `${testMediaId}/q360p/segment`,
        10.0
      );

      const variant2 = HlsVariant.create(
        testMediaId,
        StreamQuality.Q720P,
        2928000,
        '1280x720',
        'avc1.4d001f,mp4a.40.2',
        `${testMediaId}/q720p/playlist.m3u8`,
        `${testMediaId}/q720p/segment`,
        10.0
      );

      const prismaVariants = [
        createPrismaVariant(variant1.id.getValue(), testMediaId, StreamQuality.Q360P),
        createPrismaVariant(variant2.id.getValue(), testMediaId, StreamQuality.Q720P),
      ];

      (mockPrisma.hlsVariant.createMany as jest.Mock).mockResolvedValue({ count: 2 });
      (mockPrisma.hlsVariant.findMany as jest.Mock).mockResolvedValue(prismaVariants);

      const result = await repository.saveMany([variant1, variant2]);

      expect(mockPrisma.hlsVariant.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ mediaId: testMediaId, quality: StreamQuality.Q360P }),
          expect.objectContaining({ mediaId: testMediaId, quality: StreamQuality.Q720P }),
        ]),
        skipDuplicates: true,
      });

      expect(mockPrisma.hlsVariant.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: [variant1.id.getValue(), variant2.id.getValue()] },
        },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(HlsVariant);
      expect(result[1]).toBeInstanceOf(HlsVariant);
    });

    it('should handle empty array', async () => {
      (mockPrisma.hlsVariant.createMany as jest.Mock).mockResolvedValue({ count: 0 });
      (mockPrisma.hlsVariant.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.saveMany([]);

      expect(mockPrisma.hlsVariant.createMany).toHaveBeenCalledWith({
        data: [],
        skipDuplicates: true,
      });

      expect(result).toEqual([]);
    });

    it('should throw error when saveMany fails', async () => {
      const variant = HlsVariant.create(
        testMediaId,
        StreamQuality.Q720P,
        2928000,
        '1280x720',
        'avc1.4d001f,mp4a.40.2',
        `${testMediaId}/q720p/playlist.m3u8`,
        `${testMediaId}/q720p/segment`,
        10.0
      );

      (mockPrisma.hlsVariant.createMany as jest.Mock).mockRejectedValue(
        new Error('Batch insert failed')
      );

      await expect(repository.saveMany([variant])).rejects.toThrow('Batch insert failed');
    });
  });

  describe('findByMediaId', () => {
    it('should find variants by mediaId sorted by bandwidth', async () => {
      const prismaVariants = [
        createPrismaVariant(testUuid1, testMediaId, StreamQuality.Q360P),
        createPrismaVariant(testUuid2, testMediaId, StreamQuality.Q720P),
      ];

      (mockPrisma.hlsVariant.findMany as jest.Mock).mockResolvedValue(prismaVariants);

      const result = await repository.findByMediaId(testMediaId);

      expect(mockPrisma.hlsVariant.findMany).toHaveBeenCalledWith({
        where: { mediaId: testMediaId },
        orderBy: { bandwidth: 'asc' },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(HlsVariant);
    });

    it('should return empty array when no variants found', async () => {
      (mockPrisma.hlsVariant.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.findByMediaId(testMediaId);

      expect(result).toEqual([]);
    });
  });

  describe('findByMediaIdAndQuality', () => {
    it('should find variant by mediaId and quality', async () => {
      const prismaVariant = createPrismaVariant(testUuid1, testMediaId, StreamQuality.Q720P);

      (mockPrisma.hlsVariant.findUnique as jest.Mock).mockResolvedValue(prismaVariant);

      const result = await repository.findByMediaIdAndQuality(testMediaId, StreamQuality.Q720P);

      expect(mockPrisma.hlsVariant.findUnique).toHaveBeenCalledWith({
        where: {
          mediaId_quality: { mediaId: testMediaId, quality: StreamQuality.Q720P },
        },
      });

      expect(result).toBeInstanceOf(HlsVariant);
      expect(result?.quality).toBe(StreamQuality.Q720P);
    });

    it('should return null when variant not found', async () => {
      (mockPrisma.hlsVariant.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByMediaIdAndQuality(testMediaId, StreamQuality.Q1080P);

      expect(result).toBeNull();
    });
  });

  describe('deleteByMediaId', () => {
    it('should delete all variants for a mediaId', async () => {
      (mockPrisma.hlsVariant.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });

      await repository.deleteByMediaId(testMediaId);

      expect(mockPrisma.hlsVariant.deleteMany).toHaveBeenCalledWith({
        where: { mediaId: testMediaId },
      });
    });

    it('should handle deletion when no variants exist', async () => {
      (mockPrisma.hlsVariant.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      await expect(repository.deleteByMediaId(testMediaId)).resolves.not.toThrow();

      expect(mockPrisma.hlsVariant.deleteMany).toHaveBeenCalledWith({
        where: { mediaId: testMediaId },
      });
    });

    it('should throw error when deletion fails', async () => {
      (mockPrisma.hlsVariant.deleteMany as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      await expect(repository.deleteByMediaId(testMediaId)).rejects.toThrow('Delete failed');
    });
  });

  describe('toDomain transformation', () => {
    it('should correctly transform prisma entity to domain entity', async () => {
      const createdAt = new Date('2025-01-01');
      const updatedAt = new Date('2025-01-02');

      const prismaVariant: PrismaHlsVariant = {
        id: testUuid1,
        mediaId: testMediaId,
        quality: StreamQuality.Q720P,
        bandwidth: 2928000,
        resolution: '1280x720',
        codecs: 'avc1.4d001f,mp4a.40.2',
        playlistPath: `${testMediaId}/q720p/playlist.m3u8`,
        segmentPrefix: `${testMediaId}/q720p/segment`,
        segmentCount: 15,
        segmentDuration: 10.0,
        createdAt,
        updatedAt,
      };

      (mockPrisma.hlsVariant.findUnique as jest.Mock).mockResolvedValue(prismaVariant);

      const result = await repository.findByMediaIdAndQuality(testMediaId, StreamQuality.Q720P);

      expect(result?.id.getValue()).toBe(testUuid1);
      expect(result?.mediaId).toBe(testMediaId);
      expect(result?.quality).toBe(StreamQuality.Q720P);
      expect(result?.bandwidth).toBe(2928000);
      expect(result?.resolution).toBe('1280x720');
      expect(result?.codecs).toBe('avc1.4d001f,mp4a.40.2');
      expect(result?.playlistPath).toBe(`${testMediaId}/q720p/playlist.m3u8`);
      expect(result?.segmentPrefix).toBe(`${testMediaId}/q720p/segment`);
      expect(result?.segmentCount).toBe(15);
      expect(result?.segmentDuration).toBe(10.0);
    });

    it('should handle null resolution for audio variants', async () => {
      const prismaVariant: PrismaHlsVariant = {
        id: testUuid1,
        mediaId: testMediaId,
        quality: StreamQuality.AUDIO_MEDIUM,
        bandwidth: 128000,
        resolution: null,
        codecs: 'mp4a.40.2',
        playlistPath: `${testMediaId}/audio_medium/playlist.m3u8`,
        segmentPrefix: `${testMediaId}/audio_medium/segment`,
        segmentCount: 20,
        segmentDuration: 10.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.hlsVariant.findUnique as jest.Mock).mockResolvedValue(prismaVariant);

      const result = await repository.findByMediaIdAndQuality(
        testMediaId,
        StreamQuality.AUDIO_MEDIUM
      );

      expect(result?.resolution).toBeNull();
      expect(result?.quality).toBe(StreamQuality.AUDIO_MEDIUM);
    });
  });

  describe('toPrismaData transformation', () => {
    it('should correctly transform domain entity to prisma data', async () => {
      const variant = HlsVariant.create(
        testMediaId,
        StreamQuality.Q480P,
        1528000,
        '854x480',
        'avc1.4d001f,mp4a.40.2',
        `${testMediaId}/q480p/playlist.m3u8`,
        `${testMediaId}/q480p/segment`,
        10.0
      );

      const prismaVariant = createPrismaVariant(
        variant.id.getValue(),
        testMediaId,
        StreamQuality.Q480P
      );
      (mockPrisma.hlsVariant.create as jest.Mock).mockResolvedValue(prismaVariant);

      await repository.save(variant);

      expect(mockPrisma.hlsVariant.create).toHaveBeenCalledWith({
        data: {
          id: variant.id.getValue(),
          mediaId: testMediaId,
          quality: StreamQuality.Q480P,
          bandwidth: 1528000,
          resolution: '854x480',
          codecs: 'avc1.4d001f,mp4a.40.2',
          playlistPath: `${testMediaId}/q480p/playlist.m3u8`,
          segmentPrefix: `${testMediaId}/q480p/segment`,
          segmentCount: 0,
          segmentDuration: 10.0,
        },
      });
    });
  });
});
