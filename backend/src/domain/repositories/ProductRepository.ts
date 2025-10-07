// src/domain/repositories/ServiceRepository.ts
import type { Product } from '@/domain/entities/Product';
import type { ProductType } from '@/domain/entities/types/ProductType';

export interface ProductRepository {
  // findAll(): Promise<Service[]>;
  findByInstitution(institutionId: string): Promise<Product[]>;
  institutionExists(institutionId: string): Promise<boolean>;
  findByFilters(
    institutionId: string,
    types?: ProductType[],
    zoneCodes?: string[], // tableau de zones (strings libres)
    fromDate?: Date
  ): Promise<Product[]>;
  // (optionnel) findByInstitutionAndZone(institutionId: number, zoneId: number): Promise<Service[]>;
}
