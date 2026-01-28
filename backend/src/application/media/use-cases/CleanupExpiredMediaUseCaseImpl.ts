import type {
  CleanupExpiredMediaUseCase,
  CleanupResult,
} from '@/domain/media/ports/in/CleanupExpiredMediaUseCase';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import type { StoragePort } from '@/domain/media/ports/out/StoragePort';
import { logger } from '@/infrastructure/utils/logger';

export class CleanupExpiredMediaUseCaseImpl implements CleanupExpiredMediaUseCase {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly storagePort: StoragePort
  ) {}

  async execute(): Promise<CleanupResult> {
    const expiredMedia = await this.mediaRepository.findExpiredTemporaryMedia();

    if (expiredMedia.length === 0) {
      logger.info('No expired temporary media found');
      return { deletedCount: 0, deletedIds: [] };
    }

    const deletedIds: string[] = [];
    const failedIds: string[] = [];

    for (const media of expiredMedia) {
      try {
        // Delete from storage
        await this.storagePort.delete(media.bucket, media.path);
        deletedIds.push(media.id.getValue());
      } catch (error) {
        logger.error('Failed to delete media from storage', {
          mediaId: media.id.getValue(),
          bucket: media.bucket,
          path: media.path,
          error: error instanceof Error ? error.message : String(error),
        });
        failedIds.push(media.id.getValue());
      }
    }

    // Delete records from database (only successfully deleted from storage)
    if (deletedIds.length > 0) {
      try {
        await this.mediaRepository.deleteMany(deletedIds);
        logger.info('Cleaned up expired temporary media', {
          deletedCount: deletedIds.length,
          deletedIds,
        });
      } catch (error) {
        logger.error('Failed to delete media records from database', {
          deletedIds,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (failedIds.length > 0) {
      logger.warn('Some media files failed to be cleaned up', {
        failedCount: failedIds.length,
        failedIds,
      });
    }

    return {
      deletedCount: deletedIds.length,
      deletedIds,
    };
  }
}
