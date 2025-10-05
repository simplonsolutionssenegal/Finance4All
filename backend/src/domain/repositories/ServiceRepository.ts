// src/domain/repositories/ServiceRepository.ts
import type { InstitutionService } from '@/domain/entities/InstitutionService';
import type { ServiceType } from '@/domain/entities/types/InstitutionServiceType';

export interface ServiceRepository {
  // findAll(): Promise<Service[]>;
  findByInstitution(institutionId: string): Promise<InstitutionService[]>;
  institutionExists(institutionId: string): Promise<boolean>;
  findByFilters(
    institutionId: string,
    types?: ServiceType[],
    zoneCodes?: string[], // tableau de zones (strings libres)
    fromDate?: Date
  ): Promise<InstitutionService[]>;
  // (optionnel) findByInstitutionAndZone(institutionId: number, zoneId: number): Promise<Service[]>;
}
