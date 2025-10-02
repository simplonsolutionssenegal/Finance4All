// src/domain/repositories/ProductRepository.ts (interface)
import type {
  Product,
  ProductFilter,
  PaginationOptions,
  PaginatedResult,
  ProductType,
} from '@/domain/entities/Product';

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(filters: ProductFilter, pagination: PaginationOptions): Promise<PaginatedResult<Product>>;
  findByType(type: ProductType): Promise<Product[]>;
}
