import type { GetTranscodingStatusUseCase } from '@/domain/streaming/ports/in/GetTranscodingStatusUseCase';
import type { TranscodingJobDTO } from '@/domain/streaming/value-objects/StreamingDTO';
import type { TranscodingJobRepository } from '@/domain/streaming/ports/out/TranscodingJobRepository';
import { TranscodingNotFoundError } from '@/domain/streaming/errors/StreamingErrors';

export class GetTranscodingStatusUseCaseImpl implements GetTranscodingStatusUseCase {
  constructor(private readonly transcodingJobRepository: TranscodingJobRepository) {}

  async execute(mediaId: string): Promise<TranscodingJobDTO> {
    const job = await this.transcodingJobRepository.findByMediaId(mediaId);

    if (!job) {
      throw new TranscodingNotFoundError(mediaId);
    }

    return job.toDTO();
  }
}
