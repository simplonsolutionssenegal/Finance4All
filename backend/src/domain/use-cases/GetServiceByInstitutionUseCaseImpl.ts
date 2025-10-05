// src/domain/use-cases/GetServiceByInstitutionUseCaseImpl.ts
import type { GetServiceByInstitutionUseCase } from '@/application/use-cases/GetServiceByInstitutionUseCase';
import type { InstitutionService } from '@/domain/entities/InstitutionService';
import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';

export class GetServiceByInstitutionUseCaseImpl implements GetServiceByInstitutionUseCase {
  constructor(private readonly serviceRepo: ServiceRepository) {}

  async execute(institutionId: string): Promise<InstitutionService[]> {
    const exists = await this.serviceRepo.institutionExists(institutionId);
    if (!exists) {
      throw new Error('INSTITUTION_NOT_FOUND');
    }
    return this.serviceRepo.findByInstitution(institutionId);
  }
}
