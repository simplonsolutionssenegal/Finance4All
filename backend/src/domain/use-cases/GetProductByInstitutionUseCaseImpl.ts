import type { GetProductByInstitutionUseCase } from '@/application/use-cases/GetProductByInstitutionUseCase';
import type { Product } from '@/domain/entities/Product';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';
import { InstitutionNotFoundError } from '@/domain/errors/InstitutionNotFoundError'; // ou '@/domain/errors'

export class GetProductByInstitutionUseCaseImpl implements GetProductByInstitutionUseCase {
  constructor(private readonly productRepo: ProductRepository) {}

  async execute(institutionId: string): Promise<Product[]> {
    const exists = await this.productRepo.institutionExists(institutionId);
    if (!exists) throw new InstitutionNotFoundError(institutionId);
    return this.productRepo.findByInstitution(institutionId);
  }
}
