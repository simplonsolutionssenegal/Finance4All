import type {
  GetPresignedUrlQuery,
  GetPresignedUrlUseCase,
  PresignedUrlResult,
} from '@/domain/media/ports/in/GetPresignedUrlUseCase';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import type { StoragePort } from '@/domain/media/ports/out/StoragePort';
import { MediaNotFoundError } from '@/domain/media/errors/MediaErrors';

const DEFAULT_EXPIRES_IN = 3600; // 1 hour

export class GetPresignedUrlUseCaseImpl implements GetPresignedUrlUseCase {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly storagePort: StoragePort
  ) {}

  async execute(query: GetPresignedUrlQuery): Promise<PresignedUrlResult> {
    const { mediaId, expiresIn = DEFAULT_EXPIRES_IN } = query;

    const media = await this.mediaRepository.findById(mediaId);

    if (!media) {
      throw new MediaNotFoundError(mediaId);
    }

    const url = await this.storagePort.getPresignedUrl({
      bucket: media.bucket,
      path: media.path,
      expiresIn,
    });

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      url,
      expiresAt,
    };
  }
}
