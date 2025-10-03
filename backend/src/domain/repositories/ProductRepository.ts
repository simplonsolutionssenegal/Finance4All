import type { Product, ProductFilter, ProductType } from '@/domain/entities/Product';

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(filters: ProductFilter): Promise<Product[]>;
  findByType(type: ProductType): Promise<Product[]>;
}
