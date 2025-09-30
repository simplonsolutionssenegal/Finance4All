// src/domain/repositories/ProductRepository.ts
import type { Service } from '@/domain/entities/Service';
import type { ServiceType } from '@/domain/entities/types/ServiceType';

export interface ServiceRepository {
  // findAll(): Promise<Service[]>;
  findByInstitution(institutionId: number): Promise<Service[]>;
  findByFilters(
    institutionId: number,
    types?: ServiceType[],
    zoneId?: number,
    fromDate?: Date
  ): Promise<Service[]>;
  // (optionnel) findByInstitutionAndZone(institutionId: number, zoneId: number): Promise<Service[]>;
}
