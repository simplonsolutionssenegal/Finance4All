import type { UseCase } from '@/domain/shared/UseCase';
import type { MediaDTO } from '../../value-objects/MediaDTO';
import type { MediaType } from '../../value-objects/MediaType';
import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';

export interface GetMediasQuery extends PaginationParams {
  type?: MediaType;
}

export interface GetMediasUseCase extends UseCase<GetMediasQuery, PaginatedResult<MediaDTO>> {}
