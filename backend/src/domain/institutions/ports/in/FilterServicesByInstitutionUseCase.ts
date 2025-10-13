// src/domain/institutions/ports/in/FilterServicesByInstitutionUseCase.ts
import type { UseCase } from '@/domain/shared/UseCase';
import type { PaginationParams, PaginatedResult } from '@/domain/shared/Pagination';
import type { ServiceDTO } from '@/domain/institutions/value-objects/ServiceDTO';
import type { TypeService } from '@/domain/institutions/entities/Service';

export interface FilterServicesByInstitutionQuery extends PaginationParams {
  institutionId: string;
  types?: TypeService[];
  fromDate?: Date;
}

export interface FilterServicesByInstitutionUseCase
  extends UseCase<FilterServicesByInstitutionQuery, PaginatedResult<ServiceDTO>> {}
