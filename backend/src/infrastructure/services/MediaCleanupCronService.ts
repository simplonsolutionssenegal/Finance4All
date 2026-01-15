import type { CleanupExpiredMediaUseCase } from '@/domain/media/ports/in/CleanupExpiredMediaUseCase';
import { logger } from '@/infrastructure/utils/logger';

const ONE_HOUR_MS = 60 * 60 * 1000;

export class MediaCleanupCronService {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly cleanupExpiredMediaUseCase: CleanupExpiredMediaUseCase,
    private readonly intervalMs: number = ONE_HOUR_MS
  ) {}

  start(): void {
    if (this.intervalId) {
      logger.warn('Media cleanup cron is already running');
      return;
    }

    logger.info('Starting media cleanup cron service', {
      intervalMs: this.intervalMs,
    });

    // Run immediately on start
    this.runCleanup();

    // Then schedule periodic cleanup
    this.intervalId = setInterval(() => {
      this.runCleanup();
    }, this.intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Media cleanup cron service stopped');
    }
  }

  private async runCleanup(): Promise<void> {
    try {
      logger.info('Running expired media cleanup...');
      const result = await this.cleanupExpiredMediaUseCase.execute();
      logger.info('Expired media cleanup completed', {
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      logger.error('Failed to run expired media cleanup', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
