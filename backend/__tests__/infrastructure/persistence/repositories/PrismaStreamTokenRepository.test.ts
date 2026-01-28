import { PrismaStreamTokenRepository } from '@/infrastructure/persistence/repositories/PrismaStreamTokenRepository';
import { StreamToken } from '@/domain/streaming/entities/StreamToken';
import type { PrismaClient, StreamToken as PrismaStreamToken } from '@prisma/client';
import { randomUUID } from 'crypto';

describe('PrismaStreamTokenRepository', () => {
  let repository: PrismaStreamTokenRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let testUuid1: string;
  let testUserId: string;
  let testMediaId: string;

  beforeEach(() => {
    testUuid1 = randomUUID();
    testUserId = 'user-123';
    testMediaId = randomUUID();

    mockPrisma = {
      streamToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        deleteMany: jest.fn(),
      },
    } as any;

    repository = new PrismaStreamTokenRepository(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createPrismaToken = (
    id: string,
    userId: string,
    mediaId: string,
    overrides: Partial<PrismaStreamToken> = {}
  ): PrismaStreamToken => ({
    id,
    userId,
    mediaId,
    token: `test-token-value-${id}`,
    expiresAt: new Date(Date.now() + 3600000),
    createdAt: new Date(),
    ...overrides,
  });

  describe('save', () => {
    it('should save token successfully', async () => {
      const token = StreamToken.create(testUserId, testMediaId, 3600);

      const prismaToken = createPrismaToken(token.id.getValue(), testUserId, testMediaId, {
        token: token.token,
        expiresAt: token.expiresAt,
      });

      (mockPrisma.streamToken.create as jest.Mock).mockResolvedValue(prismaToken);

      const result = await repository.save(token);

      expect(mockPrisma.streamToken.create).toHaveBeenCalledWith({
        data: {
          id: token.id.getValue(),
          userId: testUserId,
          mediaId: testMediaId,
          token: token.token,
          expiresAt: token.expiresAt,
        },
      });

      expect(result).toBeInstanceOf(StreamToken);
      expect(result.userId).toBe(testUserId);
      expect(result.mediaId).toBe(testMediaId);
    });

    it('should throw error when save fails', async () => {
      const token = StreamToken.create(testUserId, testMediaId, 3600);

      (mockPrisma.streamToken.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(repository.save(token)).rejects.toThrow('Database error');
    });

    it('should save token with custom expiration', async () => {
      const token = StreamToken.create(testUserId, testMediaId, 7200); // 2 hours

      const prismaToken = createPrismaToken(token.id.getValue(), testUserId, testMediaId, {
        token: token.token,
        expiresAt: token.expiresAt,
      });

      (mockPrisma.streamToken.create as jest.Mock).mockResolvedValue(prismaToken);

      const result = await repository.save(token);

      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('findByToken', () => {
    it('should find token by token value', async () => {
      const tokenValue = 'unique-token-value-123';
      const prismaToken = createPrismaToken(testUuid1, testUserId, testMediaId, {
        token: tokenValue,
      });

      (mockPrisma.streamToken.findUnique as jest.Mock).mockResolvedValue(prismaToken);

      const result = await repository.findByToken(tokenValue);

      expect(mockPrisma.streamToken.findUnique).toHaveBeenCalledWith({
        where: { token: tokenValue },
      });

      expect(result).toBeInstanceOf(StreamToken);
      expect(result?.token).toBe(tokenValue);
    });

    it('should return null when token not found', async () => {
      (mockPrisma.streamToken.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByToken('non-existent-token');

      expect(result).toBeNull();
    });
  });

  describe('deleteExpired', () => {
    it('should delete expired tokens and return count', async () => {
      (mockPrisma.streamToken.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await repository.deleteExpired();

      expect(mockPrisma.streamToken.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: { lte: expect.any(Date) },
        },
      });

      expect(result).toBe(5);
    });

    it('should return 0 when no expired tokens', async () => {
      (mockPrisma.streamToken.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await repository.deleteExpired();

      expect(result).toBe(0);
    });

    it('should throw error when deletion fails', async () => {
      (mockPrisma.streamToken.deleteMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(repository.deleteExpired()).rejects.toThrow('Database error');
    });
  });

  describe('deleteByMediaId', () => {
    it('should delete all tokens for a media', async () => {
      (mockPrisma.streamToken.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });

      await repository.deleteByMediaId(testMediaId);

      expect(mockPrisma.streamToken.deleteMany).toHaveBeenCalledWith({
        where: { mediaId: testMediaId },
      });
    });

    it('should handle deletion when no tokens exist', async () => {
      (mockPrisma.streamToken.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      await expect(repository.deleteByMediaId(testMediaId)).resolves.not.toThrow();

      expect(mockPrisma.streamToken.deleteMany).toHaveBeenCalledWith({
        where: { mediaId: testMediaId },
      });
    });

    it('should throw error when deletion fails', async () => {
      (mockPrisma.streamToken.deleteMany as jest.Mock).mockRejectedValue(
        new Error('Delete failed')
      );

      await expect(repository.deleteByMediaId(testMediaId)).rejects.toThrow('Delete failed');
    });
  });

  describe('toDomain transformation', () => {
    it('should correctly transform prisma entity to domain entity', async () => {
      const createdAt = new Date('2025-01-01');
      const expiresAt = new Date('2025-01-01T01:00:00Z');
      const tokenValue = 'test-token-123';

      const prismaToken: PrismaStreamToken = {
        id: testUuid1,
        userId: testUserId,
        mediaId: testMediaId,
        token: tokenValue,
        expiresAt,
        createdAt,
      };

      (mockPrisma.streamToken.findUnique as jest.Mock).mockResolvedValue(prismaToken);

      const result = await repository.findByToken(tokenValue);

      expect(result?.id.getValue()).toBe(testUuid1);
      expect(result?.userId).toBe(testUserId);
      expect(result?.mediaId).toBe(testMediaId);
      expect(result?.token).toBe(tokenValue);
      expect(result?.expiresAt).toEqual(expiresAt);
    });

    it('should handle non-expired token', async () => {
      const futureDate = new Date(Date.now() + 3600000);
      const tokenValue = 'valid-token';

      const prismaToken = createPrismaToken(testUuid1, testUserId, testMediaId, {
        token: tokenValue,
        expiresAt: futureDate,
      });

      (mockPrisma.streamToken.findUnique as jest.Mock).mockResolvedValue(prismaToken);

      const result = await repository.findByToken(tokenValue);

      expect(result?.isExpired).toBe(false);
    });

    it('should handle expired token', async () => {
      const pastDate = new Date(Date.now() - 3600000);
      const tokenValue = 'expired-token';

      const prismaToken = createPrismaToken(testUuid1, testUserId, testMediaId, {
        token: tokenValue,
        expiresAt: pastDate,
      });

      (mockPrisma.streamToken.findUnique as jest.Mock).mockResolvedValue(prismaToken);

      const result = await repository.findByToken(tokenValue);

      expect(result?.isExpired).toBe(true);
    });
  });
});
