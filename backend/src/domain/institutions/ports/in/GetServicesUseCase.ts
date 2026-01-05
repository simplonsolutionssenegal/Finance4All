import type { UseCase } from '@/domain/shared/UseCase';
import type { PaginationParams, PaginatedResult } from '@/domain/shared/Pagination';
import type { TypeService } from '@/domain/institutions/entities/Service';
import type { CountryType } from '@/domain/institutions/value-objects/Country';
import type { ComparedServiceDTO } from '@/domain/institutions/value-objects/ComparedServiceDTO';

export interface GetServicesQuery extends PaginationParams {
  type?: TypeService;
  pays?: CountryType;
}

export interface GetServicesUseCase
  extends UseCase<GetServicesQuery, PaginatedResult<ComparedServiceDTO>> {}
// extends UseCase<GetServicesQuery, PaginatedResult<ServiceDTO>> {}
