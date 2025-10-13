// src/domain/use-cases/getProductByIdUseCaseImpl.ts

import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import type { Service } from '@/domain/entities/Service';

export interface GetServiceByIdUseCase {
  execute(id: string): Promise<Service | null>;
}

export class GetServiceByIdUseCaseImpl implements GetServiceByIdUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(id: string): Promise<Service | null> {
    if (!id || id.trim() === '') {
      throw new Error('ID du service requis');
    }

    return await this.serviceRepository.findById(id);
  }
}
