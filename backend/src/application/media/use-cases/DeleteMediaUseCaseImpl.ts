import type { DeleteMediaUseCase } from '@/domain/media/ports/in/DeleteMediaUseCase';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import type { StoragePort } from '@/domain/media/ports/out/StoragePort';
import { MediaNotFoundError, MediaDeleteError } from '@/domain/media/errors/MediaErrors';

export class DeleteMediaUseCaseImpl implements DeleteMediaUseCase {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly storagePort: StoragePort
  ) {}

  async execute(id: string): Promise<void> {
    const media = await this.mediaRepository.findById(id);

    if (!media) {
      throw new MediaNotFoundError(id);
    }

    try {
      // Delete from storage first
      await this.storagePort.delete(media.bucket, media.path);

      // Then delete from database
      await this.mediaRepository.delete(id);
    } catch (error) {
      throw new MediaDeleteError(id, error instanceof Error ? error : undefined);
    }
  }
}
