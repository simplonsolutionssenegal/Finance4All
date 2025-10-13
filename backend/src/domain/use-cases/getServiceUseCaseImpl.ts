// src/domain/use-cases/getProductsUseCaseImpl.ts

import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import type { Service, ServiceFilter } from '@/domain/entities/Service';

export interface GetServicesUseCase {
  execute(filters: ServiceFilter): Promise<Service[]>;
}

export class GetServicesUseCaseImpl implements GetServicesUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(filters: ServiceFilter): Promise<Service[]> {
    return await this.serviceRepository.findAll(filters);
  }
}
