import { GetProgressUseCaseImpl } from '@/application/streaming/use-cases/GetProgressUseCaseImpl';
import type { MediaProgressRepository } from '@/domain/streaming/ports/out/MediaProgressRepository';
import { MediaProgress } from '@/domain/streaming/entities/MediaProgress';

describe('GetProgressUseCaseImpl', () => {
  let useCase: GetProgressUseCaseImpl;
  let mockProgressRepository: jest.Mocked<MediaProgressRepository>;

  beforeEach(() => {
    mockProgressRepository = {
      save: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      findByUserAndMedia: jest.fn(),
      findByUser: jest.fn(),
      findRecentByUser: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetProgressUseCaseImpl(mockProgressRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validQuery = {
      userId: 'user-123',
      mediaId: 'media-456',
    };

    it('should return progress when found', async () => {
      const mockProgress = MediaProgress.create(validQuery.userId, validQuery.mediaId, 600);
      mockProgress.updateProgress(300, 600);
      mockProgressRepository.findByUserAndMedia.mockResolvedValue(mockProgress);

      const result = await useCase.execute(validQuery);

      expect(result).not.toBeNull();
      expect(result).toMatchObject({
        userId: validQuery.userId,
        mediaId: validQuery.mediaId,
        currentPosition: 300,
        duration: 600,
        completionRate: 50,
        isCompleted: false,
      });
    });

    it('should return null when progress not found', async () => {
      mockProgressRepository.findByUserAndMedia.mockResolvedValue(null);

      const result = await useCase.execute(validQuery);

      expect(result).toBeNull();
    });

    it('should query repository with correct parameters', async () => {
      mockProgressRepository.findByUserAndMedia.mockResolvedValue(null);

      await useCase.execute(validQuery);

      expect(mockProgressRepository.findByUserAndMedia).toHaveBeenCalledWith(
        validQuery.userId,
        validQuery.mediaId
      );
    });

    it('should return completed progress correctly', async () => {
      const mockProgress = MediaProgress.create(validQuery.userId, validQuery.mediaId, 600);
      mockProgress.markAsCompleted();
      mockProgressRepository.findByUserAndMedia.mockResolvedValue(mockProgress);

      const result = await useCase.execute(validQuery);

      expect(result).not.toBeNull();
      expect(result?.isCompleted).toBe(true);
      expect(result?.completionRate).toBe(100);
    });

    it('should return progress with lastWatchedAt timestamp', async () => {
      const mockProgress = MediaProgress.create(validQuery.userId, validQuery.mediaId, 600);
      mockProgressRepository.findByUserAndMedia.mockResolvedValue(mockProgress);

      const result = await useCase.execute(validQuery);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.lastWatchedAt).toBeInstanceOf(Date);
      }
    });

    it('should handle repository errors', async () => {
      mockProgressRepository.findByUserAndMedia.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(validQuery)).rejects.toThrow('Database error');
    });

    it('should return correct DTO structure', async () => {
      const mockProgress = MediaProgress.create(validQuery.userId, validQuery.mediaId, 600);
      mockProgressRepository.findByUserAndMedia.mockResolvedValue(mockProgress);

      const result = await useCase.execute(validQuery);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('mediaId');
      expect(result).toHaveProperty('currentPosition');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('completionRate');
      expect(result).toHaveProperty('isCompleted');
      expect(result).toHaveProperty('lastWatchedAt');
    });
  });
});
