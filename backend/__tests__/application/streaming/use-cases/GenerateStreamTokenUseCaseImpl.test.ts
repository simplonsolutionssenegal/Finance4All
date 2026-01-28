import { GenerateStreamTokenUseCaseImpl } from '@/application/streaming/use-cases/GenerateStreamTokenUseCaseImpl';
import type { StreamTokenRepository } from '@/domain/streaming/ports/out/StreamTokenRepository';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import { StreamToken } from '@/domain/streaming/entities/StreamToken';
import { MediaNotFoundError } from '@/domain/media/errors/MediaErrors';

describe('GenerateStreamTokenUseCaseImpl', () => {
  let useCase: GenerateStreamTokenUseCaseImpl;
  let mockStreamTokenRepository: jest.Mocked<StreamTokenRepository>;
  let mockMediaRepository: jest.Mocked<MediaRepository>;

  beforeEach(() => {
    mockStreamTokenRepository = {
      save: jest.fn(),
      findByToken: jest.fn(),
      deleteExpired: jest.fn(),
      deleteByMediaId: jest.fn(),
    };

    mockMediaRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByType: jest.fn(),
      findExpiredTemporaryMedia: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      existsById: jest.fn(),
    };

    useCase = new GenerateStreamTokenUseCaseImpl(mockStreamTokenRepository, mockMediaRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validCommand = {
      userId: 'user-123',
      mediaId: 'media-456',
    };

    it('should generate stream token successfully', async () => {
      const mockMedia = { id: 'media-456', type: 'VIDEO' };
      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockStreamTokenRepository.save.mockImplementation(async token => token);

      const result = await useCase.execute(validCommand);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('expiresAt');
      expect(result.token).toHaveLength(64);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should throw MediaNotFoundError when media does not exist', async () => {
      mockMediaRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validCommand)).rejects.toThrow(MediaNotFoundError);
      expect(mockStreamTokenRepository.save).not.toHaveBeenCalled();
    });

    it('should use default expiry of 1 hour when not specified', async () => {
      const mockMedia = { id: 'media-456', type: 'VIDEO' };
      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockStreamTokenRepository.save.mockImplementation(async token => token);

      const result = await useCase.execute(validCommand);

      const expectedExpiry = Date.now() + 3600 * 1000;
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(result.expiresAt.getTime()).toBeLessThanOrEqual(expectedExpiry + 1000);
    });

    it('should respect custom expiry time', async () => {
      const mockMedia = { id: 'media-456', type: 'VIDEO' };
      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockStreamTokenRepository.save.mockImplementation(async token => token);

      const commandWithExpiry = {
        ...validCommand,
        expiresInSeconds: 7200, // 2 hours
      };

      const result = await useCase.execute(commandWithExpiry);

      const expectedExpiry = Date.now() + 7200 * 1000;
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(result.expiresAt.getTime()).toBeLessThanOrEqual(expectedExpiry + 1000);
    });

    it('should cap expiry time to 24 hours maximum', async () => {
      const mockMedia = { id: 'media-456', type: 'VIDEO' };
      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockStreamTokenRepository.save.mockImplementation(async token => token);

      const commandWithLongExpiry = {
        ...validCommand,
        expiresInSeconds: 172800, // 48 hours
      };

      const result = await useCase.execute(commandWithLongExpiry);

      const maxExpiry = Date.now() + 86400 * 1000; // 24 hours
      expect(result.expiresAt.getTime()).toBeLessThanOrEqual(maxExpiry + 1000);
    });

    it('should save token to repository', async () => {
      const mockMedia = { id: 'media-456', type: 'VIDEO' };
      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockStreamTokenRepository.save.mockImplementation(async token => token);

      await useCase.execute(validCommand);

      expect(mockStreamTokenRepository.save).toHaveBeenCalledTimes(1);
      expect(mockStreamTokenRepository.save).toHaveBeenCalledWith(expect.any(StreamToken));
    });

    it('should verify media exists before generating token', async () => {
      const mockMedia = { id: 'media-456', type: 'VIDEO' };
      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockStreamTokenRepository.save.mockImplementation(async token => token);

      await useCase.execute(validCommand);

      expect(mockMediaRepository.findById).toHaveBeenCalledWith(validCommand.mediaId);
      expect(mockStreamTokenRepository.save).toHaveBeenCalled();
    });

    it('should handle repository save errors', async () => {
      const mockMedia = { id: 'media-456', type: 'VIDEO' };
      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockStreamTokenRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(validCommand)).rejects.toThrow('Database error');
    });

    it('should generate unique tokens for different requests', async () => {
      const mockMedia = { id: 'media-456', type: 'VIDEO' };
      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockStreamTokenRepository.save.mockImplementation(async token => token);

      const result1 = await useCase.execute(validCommand);
      const result2 = await useCase.execute(validCommand);

      expect(result1.token).not.toBe(result2.token);
    });

    it('should work with minimum expiry time', async () => {
      const mockMedia = { id: 'media-456', type: 'VIDEO' };
      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockStreamTokenRepository.save.mockImplementation(async token => token);

      const commandWithMinExpiry = {
        ...validCommand,
        expiresInSeconds: 1,
      };

      const result = await useCase.execute(commandWithMinExpiry);

      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });
});
