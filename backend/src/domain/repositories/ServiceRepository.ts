import type { Service, ServiceFilter } from '@/domain/entities/Service';
import type { TypeService } from '../institutions/entities/Service';

export interface ServiceRepository {
  findById(id: string): Promise<Service | null>;
  findAll(filters: ServiceFilter): Promise<Service[]>;
  findByType(type: TypeService): Promise<Service[]>;
}
