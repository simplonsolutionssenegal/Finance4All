// src/application/use-cases/GetServiceByInstitutionUseCase.ts
import type { InstitutionService } from '@/domain/entities/InstitutionService';

export interface GetServiceByInstitutionUseCase {
  execute(institutionId: string): Promise<InstitutionService[]>;
}
