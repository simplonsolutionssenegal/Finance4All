import { MediaCleanupCronService } from '@/infrastructure/services/MediaCleanupCronService';
import type { CleanupExpiredMediaUseCase } from '@/domain/media/ports/in/CleanupExpiredMediaUseCase';
import { logger } from '@/infrastructure/utils/logger';

jest.mock('@/infrastructure/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('MediaCleanupCronService', () => {
  let service: MediaCleanupCronService;
  let mockCleanupUseCase: jest.Mocked<CleanupExpiredMediaUseCase>;

  beforeEach(() => {
    jest.useFakeTimers();

    mockCleanupUseCase = {
      execute: jest.fn().mockResolvedValue({ deletedCount: 0, deletedIds: [] }),
    };

    service = new MediaCleanupCronService(mockCleanupUseCase, 1000);
  });

  afterEach(() => {
    service.stop();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('start', () => {
    it('should start the cron service', async () => {
      service.start();

      expect(logger.info).toHaveBeenCalledWith('Starting media cleanup cron service', {
        intervalMs: 1000,
      });

      // Should run cleanup immediately
      await Promise.resolve();
      expect(mockCleanupUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should warn if already running', () => {
      service.start();
      service.start();

      expect(logger.warn).toHaveBeenCalledWith('Media cleanup cron is already running');
    });

    it('should run cleanup periodically', async () => {
      mockCleanupUseCase.execute.mockResolvedValue({
        deletedCount: 5,
        deletedIds: ['1', '2', '3', '4', '5'],
      });

      service.start();

      // Initial run
      await Promise.resolve();
      expect(mockCleanupUseCase.execute).toHaveBeenCalledTimes(1);

      // Advance time by 1 second (interval)
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      expect(mockCleanupUseCase.execute).toHaveBeenCalledTimes(2);

      // Advance time by another second
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      expect(mockCleanupUseCase.execute).toHaveBeenCalledTimes(3);
    });

    it('should log cleanup results', async () => {
      mockCleanupUseCase.execute.mockResolvedValue({ deletedCount: 10, deletedIds: [] });

      service.start();
      await Promise.resolve();

      expect(logger.info).toHaveBeenCalledWith('Running expired media cleanup...');
      expect(logger.info).toHaveBeenCalledWith('Expired media cleanup completed', {
        deletedCount: 10,
      });
    });

    it('should handle cleanup errors', async () => {
      const error = new Error('Database error');
      mockCleanupUseCase.execute.mockRejectedValue(error);

      service.start();
      await Promise.resolve();

      expect(logger.error).toHaveBeenCalledWith('Failed to run expired media cleanup', {
        error: 'Database error',
      });
    });

    it('should handle non-Error objects in catch', async () => {
      mockCleanupUseCase.execute.mockRejectedValue('string error');

      service.start();
      await Promise.resolve();

      expect(logger.error).toHaveBeenCalledWith('Failed to run expired media cleanup', {
        error: 'string error',
      });
    });
  });

  describe('stop', () => {
    it('should stop the cron service', () => {
      service.start();
      service.stop();

      expect(logger.info).toHaveBeenCalledWith('Media cleanup cron service stopped');
    });

    it('should not crash if stopped when not running', () => {
      expect(() => service.stop()).not.toThrow();
    });

    it('should stop periodic cleanup', async () => {
      service.start();
      await Promise.resolve();

      // Initial cleanup
      expect(mockCleanupUseCase.execute).toHaveBeenCalledTimes(1);

      service.stop();

      // Advance time - should not trigger another cleanup
      jest.advanceTimersByTime(2000);
      await Promise.resolve();

      expect(mockCleanupUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('default interval', () => {
    it('should use default 1 hour interval when not specified', () => {
      const serviceWithDefault = new MediaCleanupCronService(mockCleanupUseCase);
      serviceWithDefault.start();

      expect(logger.info).toHaveBeenCalledWith('Starting media cleanup cron service', {
        intervalMs: 3600000, // 1 hour
      });

      serviceWithDefault.stop();
    });
  });
});
