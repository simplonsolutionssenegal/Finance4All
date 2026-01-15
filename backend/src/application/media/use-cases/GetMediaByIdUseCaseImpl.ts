import type { GetMediaByIdUseCase } from '@/domain/media/ports/in/GetMediaByIdUseCase';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import type { MediaDTO } from '@/domain/media/value-objects/MediaDTO';
import { MediaNotFoundError } from '@/domain/media/errors/MediaErrors';

export class GetMediaByIdUseCaseImpl implements GetMediaByIdUseCase {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly baseUrl: string
  ) {}

  async execute(id: string): Promise<MediaDTO> {
    const media = await this.mediaRepository.findById(id);

    if (!media) {
      throw new MediaNotFoundError(id);
    }

    return media.toDTO(this.baseUrl);
  }
}
