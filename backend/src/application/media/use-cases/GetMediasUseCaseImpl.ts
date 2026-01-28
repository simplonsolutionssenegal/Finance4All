import type { GetMediasQuery, GetMediasUseCase } from '@/domain/media/ports/in/GetMediasUseCase';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import type { MediaDTO } from '@/domain/media/value-objects/MediaDTO';
import type { PaginatedResult } from '@/domain/shared/Pagination';

export class GetMediasUseCaseImpl implements GetMediasUseCase {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly baseUrl: string
  ) {}

  async execute(query: GetMediasQuery): Promise<PaginatedResult<MediaDTO>> {
    const { type, page, limit } = query;

    const result = type
      ? await this.mediaRepository.findByType(type, { page, limit })
      : await this.mediaRepository.findAll({ page, limit });

    return {
      data: result.data.map(media => media.toDTO(this.baseUrl)),
      pagination: result.pagination,
    };
  }
}
