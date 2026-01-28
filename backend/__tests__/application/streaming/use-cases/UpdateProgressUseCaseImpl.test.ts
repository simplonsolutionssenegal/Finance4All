import { UpdateProgressUseCaseImpl } from '@/application/streaming/use-cases/UpdateProgressUseCaseImpl';
import type { MediaProgressRepository } from '@/domain/streaming/ports/out/MediaProgressRepository';
import { MediaProgress } from '@/domain/streaming/entities/MediaProgress';

describe('UpdateProgressUseCaseImpl', () => {
  let useCase: UpdateProgressUseCaseImpl;
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

    useCase = new UpdateProgressUseCaseImpl(mockProgressRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validCommand = {
      userId: 'user-123',
      mediaId: 'media-456',
      currentPosition: 300,
      duration: 600,
    };

    it('should create new progress when not exists', async () => {
      mockProgressRepository.findByUserAndMedia.mockResolvedValue(null);
      mockProgressRepository.upsert.mockImplementation(async progress => progress);

      const result = await useCase.execute(validCommand);

      expect(result).toMatchObject({
        userId: validCommand.userId,
        mediaId: validCommand.mediaId,
        currentPosition: validCommand.currentPosition,
        duration: validCommand.duration,
      });
    });

    it('should update existing progress', async () => {
      const existingProgress = MediaProgress.create(validCommand.userId, validCommand.mediaId, 600);
      existingProgress.updateProgress(100, 600);

      mockProgressRepository.findByUserAndMedia.mockResolvedValue(existingProgress);
      mockProgressRepository.upsert.mockImplementation(async progress => progress);

      const result = await useCase.execute(validCommand);

      expect(result.currentPosition).toBe(validCommand.currentPosition);
    });

    it('should calculate completion rate correctly', async () => {
      mockProgressRepository.findByUserAndMedia.mockResolvedValue(null);
      mockProgressRepository.upsert.mockImplementation(async progress => progress);

      const result = await useCase.execute(validCommand);

      expect(result.completionRate).toBe(50); // 300/600 = 50%
    });

    it('should auto-complete when reaching 95% threshold', async () => {
      mockProgressRepository.findByUserAndMedia.mockResolvedValue(null);
      mockProgressRepository.upsert.mockImplementation(async progress => progress);

      const commandAtThreshold = {
        ...validCommand,
        currentPosition: 570, // 95%
      };

      const result = await useCase.execute(commandAtThreshold);

      expect(result.isCompleted).toBe(true);
    });

    it('should not auto-complete below 95% threshold', async () => {
      mockProgressRepository.findByUserAndMedia.mockResolvedValue(null);
      mockProgressRepository.upsert.mockImplementation(async progress => progress);

      const commandBelowThreshold = {
        ...validCommand,
        currentPosition: 560, // 93.33%
      };

      const result = await useCase.execute(commandBelowThreshold);

      expect(result.isCompleted).toBe(false);
    });

    it('should query repository for existing progress', async () => {
      mockProgressRepository.findByUserAndMedia.mockResolvedValue(null);
      mockProgressRepository.upsert.mockImplementation(async progress => progress);

      await useCase.execute(validCommand);

      expect(mockProgressRepository.findByUserAndMedia).toHaveBeenCalledWith(
        validCommand.userId,
        validCommand.mediaId
      );
    });

    it('should upsert progress to repository', async () => {
      mockProgressRepository.findByUserAndMedia.mockResolvedValue(null);
      mockProgressRepository.upsert.mockImplementation(async progress => progress);

      await useCase.execute(validCommand);

      expect(mockProgressRepository.upsert).toHaveBeenCalledTimes(1);
      expect(mockProgressRepository.upsert).toHaveBeenCalledWith(expect.any(MediaProgress));
    });

    it('should handle repository errors', async () => {
      mockProgressRepository.findByUserAndMedia.mockResolvedValue(null);
      mockProgressRepository.upsert.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(validCommand)).rejects.toThrow('Database error');
    });

    it('should update lastWatchedAt timestamp', async () => {
      const existingProgress = MediaProgress.create(validCommand.userId, validCommand.mediaId, 600);
      const originalLastWatched = existingProgress.lastWatchedAt;

      mockProgressRepository.findByUserAndMedia.mockResolvedValue(existingProgress);
      mockProgressRepository.upsert.mockImplementation(async progress => progress);

      // Small delay to ensure timestamp difference
      await new Promise<void>(resolve => {
        setTimeout(resolve, 10);
      });

      const result = await useCase.execute(validCommand);

      expect(result.lastWatchedAt.getTime()).toBeGreaterThanOrEqual(originalLastWatched.getTime());
    });

    it('should preserve completed status when updating', async () => {
      const completedProgress = MediaProgress.create(
        validCommand.userId,
        validCommand.mediaId,
        600
      );
      completedProgress.markAsCompleted();

      mockProgressRepository.findByUserAndMedia.mockResolvedValue(completedProgress);
      mockProgressRepository.upsert.mockImplementation(async progress => progress);

      const commandWithLowPosition = {
        ...validCommand,
        currentPosition: 100, // Going back to beginning
      };

      const result = await useCase.execute(commandWithLowPosition);

      expect(result.isCompleted).toBe(true); // Should stay completed
    });

    it('should handle zero duration', async () => {
      mockProgressRepository.findByUserAndMedia.mockResolvedValue(null);
      mockProgressRepository.upsert.mockImplementation(async progress => progress);

      const commandWithZeroDuration = {
        ...validCommand,
        duration: 0,
      };

      const result = await useCase.execute(commandWithZeroDuration);

      expect(result.completionRate).toBe(0);
    });
  });
});
