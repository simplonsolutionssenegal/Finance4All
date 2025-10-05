// src/application/use-cases/GetProductsByInstitutionUseCase.ts
import type { InstitutionService } from '@/domain/entities/InstitutionService';

export interface GetServicesByInstitutionUseCase {
  execute(institutionId: string): Promise<InstitutionService[]>;
}
