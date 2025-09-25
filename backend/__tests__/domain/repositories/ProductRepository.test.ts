// backend/__tests__/domain/repositories/ProductRepository.test.ts
import type { ProductRepository } from '@/domain/repositories/ProductRepository';
import type { Product, ProductFilter, PaginationOptions } from '@/domain/entities/Product';

// Mock implementation pour les tests de contrat
class MockProductRepository implements ProductRepository {
  private products: Map<string, Product> = new Map();

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  async findAll(filters: ProductFilter, pagination: PaginationOptions) {
    const products = Array.from(this.products.values());
    return {
      data: products,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: products.length,
        totalPages: Math.ceil(products.length / pagination.limit),
      },
    };
  }

  async create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const id = `test_${Date.now()}`;
    const product: Product = {
      ...productData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async update(id: string, productData: Partial<Product>): Promise<Product | null> {
    const existing = this.products.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...productData, updatedAt: new Date() };
    this.products.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async findByType(type: string) {
    return Array.from(this.products.values()).filter(p => p.type === type);
  }

  // Helper for tests
  setProduct(product: Product): void {
    this.products.set(product.id, product);
  }
}

describe('ProductRepository Contract', () => {
  let repository: MockProductRepository;

  beforeEach(() => {
    repository = new MockProductRepository();
  });

  it('should implement all required methods', () => {
    expect(typeof repository.findById).toBe('function');
    expect(typeof repository.findAll).toBe('function');
    expect(typeof repository.create).toBe('function');
    expect(typeof repository.update).toBe('function');
    expect(typeof repository.delete).toBe('function');
    expect(typeof repository.findByType).toBe('function');
  });

  it('should return correct types', async () => {
    const productData = {
      designation: 'Test',
      type: 'credit' as const,
      montantMinimum: 1000,
      montantMaximum: 50000,
      remboursement: {} as any,
      conditionsEligibilite: {} as any,
    };

    const created = await repository.create(productData);
    expect(typeof created.id).toBe('string');
    expect(created.createdAt).toBeInstanceOf(Date);

    const found = await repository.findById(created.id);
    expect(found).toBeTruthy();

    const all = await repository.findAll({}, { page: 1, limit: 10 });
    expect(Array.isArray(all.data)).toBe(true);
    expect(typeof all.pagination.total).toBe('number');
  });
});
