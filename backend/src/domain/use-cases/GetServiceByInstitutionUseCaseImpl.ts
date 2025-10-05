// src/domain/use-cases/GetProductsByInstitutionUseCaseImpl.ts
import type { GetServicesByInstitutionUseCase } from '@/application/use-cases/GetServiceByInstitutionUseCase';
import type { InstitutionService } from '@/domain/entities/InstitutionService';
import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import { validate as isUuid } from 'uuid';
export class GetServiceByInstitutionUseCaseImpl implements GetServicesByInstitutionUseCase {
  constructor(private readonly serviceRepo: ServiceRepository) {}

  async execute(institutionId: string): Promise<InstitutionService[]> {
    if (!isUuid(institutionId)) {
      throw new Error('institutionId invalide (UUID attendu)');
    }
    return this.serviceRepo.findByInstitution(institutionId);
  }
}
