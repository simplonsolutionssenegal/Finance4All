import type { UseCase } from '@/domain/shared/UseCase';
import type { PaginationParams, PaginatedResult } from '@/domain/shared/Pagination';
import type { InstitutionDTO } from '@/domain/institutions/ports/in/CreateInstitutionUseCase';

export interface GetInstitutionsQuery extends PaginationParams {}

export interface GetInstitutionsUseCase
  extends UseCase<GetInstitutionsQuery, PaginatedResult<InstitutionDTO>> {}
