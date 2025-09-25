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
  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
  findByType(type: ProductType): Promise<Product[]>;
}
