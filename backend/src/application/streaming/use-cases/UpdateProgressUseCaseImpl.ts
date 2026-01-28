import type { UpdateProgressUseCase } from '@/domain/streaming/ports/in/UpdateProgressUseCase';
import type {
  UpdateProgressCommand,
  MediaProgressDTO,
} from '@/domain/streaming/value-objects/StreamingDTO';
import type { MediaProgressRepository } from '@/domain/streaming/ports/out/MediaProgressRepository';
import { MediaProgress } from '@/domain/streaming/entities/MediaProgress';

export class UpdateProgressUseCaseImpl implements UpdateProgressUseCase {
  constructor(private readonly progressRepository: MediaProgressRepository) {}

  async execute(command: UpdateProgressCommand): Promise<MediaProgressDTO> {
    const { userId, mediaId, currentPosition, duration } = command;

    let progress = await this.progressRepository.findByUserAndMedia(userId, mediaId);

    if (!progress) {
      progress = MediaProgress.create(userId, mediaId, duration);
    }

    progress.updateProgress(currentPosition, duration);

    const saved = await this.progressRepository.upsert(progress);
    return saved.toDTO();
  }
}
