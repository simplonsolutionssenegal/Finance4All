// src/domain/use-cases/getProductsUseCaseImpl.ts
import type { Product, ProductFilter } from '@/domain/entities/Product';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';

export interface GetProductsUseCase {
  execute(filters: ProductFilter): Promise<Product[]>;
}

export class GetProductsUseCaseImpl implements GetProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(filters: ProductFilter): Promise<Product[]> {
    return await this.productRepository.findAll(filters);
  }
}
