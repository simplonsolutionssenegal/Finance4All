import type { Institution } from '@/domain/institutions/entities/Institution';
import type { Service, TypeService } from '@/domain/institutions/entities/Service';
import type { PaginationParams, PaginatedResult } from '@/domain/shared/Pagination';
// import { Service } from '../../entities/Service';

export interface InstitutionRepository {
  save(institution: Institution): Promise<Institution>;
  update(institution: Institution): Promise<Institution>;
  findById(id: string): Promise<Institution | null>;
  findByName(name: string): Promise<Institution[]>;
  findAll(params: PaginationParams): Promise<PaginatedResult<Institution>>;
  findByFilters(
    params: PaginationParams & {
      institutionId: string;
      types?: TypeService[];
      fromDate?: Date;
    }
  ): Promise<PaginatedResult<Service>>;
}
