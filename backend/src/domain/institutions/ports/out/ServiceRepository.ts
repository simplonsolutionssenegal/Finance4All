import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';
import type { Service } from '@/domain/institutions/entities/Service';

export interface ServiceRepository {
  save(service: Service): Promise<Service>;
  update(service: Service): Promise<Service>;
  findById(id: string): Promise<Service | null>;
  findByName(name: string): Promise<Service[]>;
  findAllByInstitution(
    institutionId: string,
    params: PaginationParams
  ): Promise<PaginatedResult<Service[]>>;
}
