import type { MediaProgress } from '../../entities/MediaProgress';
import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';

export interface MediaProgressRepository {
  save(progress: MediaProgress): Promise<MediaProgress>;
  update(progress: MediaProgress): Promise<MediaProgress>;
  upsert(progress: MediaProgress): Promise<MediaProgress>;
  findByUserAndMedia(userId: string, mediaId: string): Promise<MediaProgress | null>;
  findByUser(userId: string, params: PaginationParams): Promise<PaginatedResult<MediaProgress>>;
  findRecentByUser(userId: string, limit: number): Promise<MediaProgress[]>;
  delete(id: string): Promise<void>;
}
