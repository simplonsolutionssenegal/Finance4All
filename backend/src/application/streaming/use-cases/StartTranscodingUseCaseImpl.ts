import type { StartTranscodingUseCase } from '@/domain/streaming/ports/in/StartTranscodingUseCase';
import type {
  StartTranscodingCommand,
  TranscodingJobDTO,
} from '@/domain/streaming/value-objects/StreamingDTO';
import type { TranscodingJobRepository } from '@/domain/streaming/ports/out/TranscodingJobRepository';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import type { JobQueuePort } from '@/domain/streaming/ports/out/JobQueuePort';
import { TranscodingJob } from '@/domain/streaming/entities/TranscodingJob';
import { TranscodingStatus } from '@/domain/streaming/value-objects/TranscodingStatus';
import { MediaNotFoundError } from '@/domain/media/errors/MediaErrors';
import {
  TranscodingInProgressError,
  MediaNotStreamableError,
} from '@/domain/streaming/errors/StreamingErrors';
import { MediaType } from '@/domain/media/value-objects/MediaType';

export class StartTranscodingUseCaseImpl implements StartTranscodingUseCase {
  constructor(
    private readonly transcodingJobRepository: TranscodingJobRepository,
    private readonly mediaRepository: MediaRepository,
    private readonly jobQueue: JobQueuePort
  ) {}

  async execute(command: StartTranscodingCommand): Promise<TranscodingJobDTO> {
    const { mediaId, qualities } = command;

    const media = await this.mediaRepository.findById(mediaId);
    if (!media) {
      throw new MediaNotFoundError(mediaId);
    }

    if (media.type !== MediaType.VIDEO && media.type !== MediaType.AUDIO) {
      throw new MediaNotStreamableError(mediaId, `Type ${media.type} is not streamable`);
    }

    const existingJob = await this.transcodingJobRepository.findByMediaId(mediaId);
    if (existingJob && existingJob.status === TranscodingStatus.PROCESSING) {
      throw new TranscodingInProgressError(mediaId);
    }

    const job = TranscodingJob.create(mediaId);
    const savedJob = await this.transcodingJobRepository.save(job);

    await this.jobQueue.addTranscodingJob({
      mediaId,
      qualities: qualities || [],
      mediaType: media.type,
    });

    return savedJob.toDTO();
  }
}
