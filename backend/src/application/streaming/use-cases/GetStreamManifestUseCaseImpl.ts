import type { GetStreamManifestUseCase } from '@/domain/streaming/ports/in/GetStreamManifestUseCase';
import type {
  GetStreamManifestQuery,
  StreamManifestDTO,
} from '@/domain/streaming/value-objects/StreamingDTO';
import type { HlsVariantRepository } from '@/domain/streaming/ports/out/HlsVariantRepository';
import type { TranscodingJobRepository } from '@/domain/streaming/ports/out/TranscodingJobRepository';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import { MediaNotFoundError } from '@/domain/media/errors/MediaErrors';
import {
  StreamNotReadyError,
  TranscodingNotFoundError,
} from '@/domain/streaming/errors/StreamingErrors';
import { TranscodingStatus } from '@/domain/streaming/value-objects/TranscodingStatus';

export class GetStreamManifestUseCaseImpl implements GetStreamManifestUseCase {
  constructor(
    private readonly hlsVariantRepository: HlsVariantRepository,
    private readonly transcodingJobRepository: TranscodingJobRepository,
    private readonly mediaRepository: MediaRepository,
    private readonly baseStreamUrl: string
  ) {}

  async execute(query: GetStreamManifestQuery): Promise<StreamManifestDTO> {
    const { mediaId } = query;

    const media = await this.mediaRepository.findById(mediaId);
    if (!media) {
      throw new MediaNotFoundError(mediaId);
    }

    const job = await this.transcodingJobRepository.findByMediaId(mediaId);
    if (!job) {
      throw new TranscodingNotFoundError(mediaId);
    }

    if (job.status !== TranscodingStatus.COMPLETED) {
      throw new StreamNotReadyError(mediaId);
    }

    const variants = await this.hlsVariantRepository.findByMediaId(mediaId);

    return {
      masterPlaylistUrl: `${this.baseStreamUrl}/api/v1/media/${mediaId}/stream/master.m3u8`,
      variants: variants.map(v => v.toDTO(`${this.baseStreamUrl}/api/v1/media/${mediaId}/stream`)),
      transcodingStatus: job.status,
    };
  }
}
