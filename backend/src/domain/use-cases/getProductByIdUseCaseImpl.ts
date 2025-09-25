// src/domain/use-cases/getProductByIdUseCaseImpl.ts
import type { Product } from '@/domain/entities/Product';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';

export interface GetProductByIdUseCase {
  execute(id: string): Promise<Product | null>;
}

export class GetProductByIdUseCaseImpl implements GetProductByIdUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<Product | null> {
    if (!id || id.trim() === '') {
      throw new Error('ID du produit requis');
    }

    return await this.productRepository.findById(id);
  }
}
