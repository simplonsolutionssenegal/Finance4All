import type { Media } from '../../entities/Media';
import type { MediaType } from '../../value-objects/MediaType';
import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';

export interface MediaRepository {
  save(media: Media): Promise<Media>;
  update(media: Media): Promise<Media>;
  findById(id: string): Promise<Media | null>;
  findAll(params: PaginationParams): Promise<PaginatedResult<Media>>;
  findByType(type: MediaType, params: PaginationParams): Promise<PaginatedResult<Media>>;
  findExpiredTemporaryMedia(): Promise<Media[]>;
  delete(id: string): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
  existsById(id: string): Promise<boolean>;
}
