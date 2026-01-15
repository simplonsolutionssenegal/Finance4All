import type { Media } from '../../entities/Media';
import type { MediaType } from '../../value-objects/MediaType';
import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';

export interface MediaRepository {
  save(media: Media): Promise<Media>;
  findById(id: string): Promise<Media | null>;
  findAll(params: PaginationParams): Promise<PaginatedResult<Media>>;
  findByType(type: MediaType, params: PaginationParams): Promise<PaginatedResult<Media>>;
  delete(id: string): Promise<void>;
  existsById(id: string): Promise<boolean>;
}
