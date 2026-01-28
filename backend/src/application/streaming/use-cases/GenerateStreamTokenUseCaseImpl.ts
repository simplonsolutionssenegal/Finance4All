import type { GenerateStreamTokenUseCase } from '@/domain/streaming/ports/in/GenerateStreamTokenUseCase';
import type {
  GenerateStreamTokenCommand,
  StreamTokenDTO,
} from '@/domain/streaming/value-objects/StreamingDTO';
import type { StreamTokenRepository } from '@/domain/streaming/ports/out/StreamTokenRepository';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import { StreamToken } from '@/domain/streaming/entities/StreamToken';
import { MediaNotFoundError } from '@/domain/media/errors/MediaErrors';

export class GenerateStreamTokenUseCaseImpl implements GenerateStreamTokenUseCase {
  private static readonly DEFAULT_EXPIRY_SECONDS = 3600;
  private static readonly MAX_EXPIRY_SECONDS = 86400;

  constructor(
    private readonly streamTokenRepository: StreamTokenRepository,
    private readonly mediaRepository: MediaRepository
  ) {}

  async execute(command: GenerateStreamTokenCommand): Promise<StreamTokenDTO> {
    const { userId, mediaId, expiresInSeconds } = command;

    const media = await this.mediaRepository.findById(mediaId);
    if (!media) {
      throw new MediaNotFoundError(mediaId);
    }

    const expiry = Math.min(
      expiresInSeconds || GenerateStreamTokenUseCaseImpl.DEFAULT_EXPIRY_SECONDS,
      GenerateStreamTokenUseCaseImpl.MAX_EXPIRY_SECONDS
    );

    const token = StreamToken.create(userId, mediaId, expiry);
    await this.streamTokenRepository.save(token);

    return token.toDTO();
  }
}
