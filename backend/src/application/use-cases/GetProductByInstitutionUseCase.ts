// src/application/use-cases/GetServiceByInstitutionUseCase.ts
import type { Product } from '@/domain/entities/Product';

export interface GetProductByInstitutionUseCase {
  execute(institutionId: string): Promise<Product[]>;
}
