import type { GetProgressUseCase } from '@/domain/streaming/ports/in/GetProgressUseCase';
import type {
  GetProgressQuery,
  MediaProgressDTO,
} from '@/domain/streaming/value-objects/StreamingDTO';
import type { MediaProgressRepository } from '@/domain/streaming/ports/out/MediaProgressRepository';

export class GetProgressUseCaseImpl implements GetProgressUseCase {
  constructor(private readonly progressRepository: MediaProgressRepository) {}

  async execute(query: GetProgressQuery): Promise<MediaProgressDTO | null> {
    const { userId, mediaId } = query;

    const progress = await this.progressRepository.findByUserAndMedia(userId, mediaId);

    if (!progress) {
      return null;
    }

    return progress.toDTO();
  }
}
