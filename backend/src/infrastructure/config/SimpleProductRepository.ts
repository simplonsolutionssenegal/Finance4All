// Repository temporaire pour tester sans base de données
import type {
  Product,
  ProductFilter,
  PaginationOptions,
  PaginatedResult,
  ProductType,
} from '@/domain/entities/Product';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';

export class SimpleProductRepository implements ProductRepository {
  private products: Map<string, Product> = new Map();
  private idCounter = 1;

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  async findAll(
    filters: ProductFilter,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Product>> {
    let filteredProducts = Array.from(this.products.values());

    // Appliquer les filtres
    if (filters.type) {
      filteredProducts = filteredProducts.filter(p => p.type === filters.type);
    }

    if (filters.designation) {
      filteredProducts = filteredProducts.filter(p =>
        p.designation.toLowerCase().includes(filters.designation!.toLowerCase())
      );
    }

    if (filters.montantMinimum) {
      filteredProducts = filteredProducts.filter(p => p.montantMaximum >= filters.montantMinimum!);
    }

    if (filters.montantMaximum) {
      filteredProducts = filteredProducts.filter(p => p.montantMinimum <= filters.montantMaximum!);
    }

    // Pagination
    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / pagination.limit);
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      data: paginatedProducts,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      },
    };
  }

  async create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const id = `prod_${this.idCounter++}`;
    const now = new Date();

    const product: Product = {
      ...productData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.products.set(id, product);
    return product;
  }

  async update(id: string, productData: Partial<Product>): Promise<Product | null> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      return null;
    }

    const updatedProduct: Product = {
      ...existingProduct,
      ...productData,
      id,
      createdAt: existingProduct.createdAt,
      updatedAt: new Date(),
    };

    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async delete(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async findByType(type: ProductType): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.type === type);
  }
}
