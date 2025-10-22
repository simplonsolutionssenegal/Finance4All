import type { UseCase } from '@/domain/shared/UseCase';
import type { PaginationParams, PaginatedResult } from '@/domain/shared/Pagination';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';

export interface GetInstitutionsByServiceTypeQuery extends PaginationParams {
  type: string;
}

export interface GetInstitutionsByServiceTypeUseCase
  extends UseCase<GetInstitutionsByServiceTypeQuery, PaginatedResult<InstitutionDTO>> {}
