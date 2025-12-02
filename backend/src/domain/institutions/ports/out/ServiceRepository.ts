import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';
import type { Service } from '@/domain/institutions/entities/Service';
import type { ComparedServiceDTO } from '@/domain/institutions/value-objects/ComparedServiceDTO';

export interface ServiceRepository {
  // save(service: Service): Promise<Service>;
  update(service: Service): Promise<Service>;
  findById(id: string): Promise<Service | null>;
  findByName(name: string): Promise<Service[]>;
  findAllByInstitution(
    institutionId: string,
    params: PaginationParams
  ): Promise<PaginatedResult<Service[]>>;

  findAll(params: PaginationParams): Promise<PaginatedResult<ComparedServiceDTO>>;

  findForComparison(ids: string[]): Promise<ComparedServiceDTO[]>;
}
