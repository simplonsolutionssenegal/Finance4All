// src/application/use-cases/GetProductsByInstitutionUseCase.ts
import type { Service } from '@/domain/entities/Service';

export interface GetServicesByInstitutionUseCase {
  execute(institutionId: number): Promise<Service[]>;
}
