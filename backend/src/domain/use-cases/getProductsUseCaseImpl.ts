// src/domain/use-cases/getProductsUseCaseImpl.ts
import type {
  Product,
  ProductFilter,
  PaginationOptions,
  PaginatedResult,
} from '@/domain/entities/Product';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';

export interface GetProductsUseCase {
  execute(filters: ProductFilter, pagination: PaginationOptions): Promise<PaginatedResult<Product>>;
}

export class GetProductsUseCaseImpl implements GetProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(
    filters: ProductFilter,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Product>> {
    // Validation des paramètres de pagination
    if (pagination.page < 1) {
      throw new Error('Le numéro de page doit être supérieur à 0');
    }
    if (pagination.limit < 1 || pagination.limit > 100) {
      throw new Error('La limite doit être entre 1 et 100');
    }

    return await this.productRepository.findAll(filters, pagination);
  }
}
