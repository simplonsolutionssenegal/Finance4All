// src/domain/use-cases/GetProductsByInstitutionUseCaseImpl.ts
import type { GetServicesByInstitutionUseCase } from '@/application/use-cases/GetServiceByInstitutionUseCase';
import type { Service } from '@/domain/entities/Service';
import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';

export class GetServiceByInstitutionUseCaseImpl implements GetServicesByInstitutionUseCase {
  constructor(private readonly serviceRepo: ServiceRepository) {}

  async execute(institutionId: number): Promise<Service[]> {
    if (!Number.isFinite(institutionId) || institutionId <= 0) {
      throw new Error('institutionId invalide');
    }
    return this.serviceRepo.findByInstitution(institutionId);
  }
}
