import type { UseCase } from '@/domain/shared/UseCase';
import type { PaginationParams, PaginatedResult } from '@/domain/shared/Pagination';
import type { ServiceDTO } from '@/domain/institutions/value-objects/ServiceDTO';
import type { TypeService } from '@/domain/institutions/entities/Service';

export interface GetServicesQuery extends PaginationParams {
  type?: TypeService;
}

export interface GetServicesUseCase
  extends UseCase<GetServicesQuery, PaginatedResult<ServiceDTO>> {}
