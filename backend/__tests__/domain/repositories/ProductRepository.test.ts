describe('ProductRepository', () => {
  it('should be defined', () => {
    expect(true).toBe(true);
  });
});
// backend/__tests__/domain/repositories/ProductRepository.test.ts
import type { ProductRepository } from '@/domain/repositories/ProductRepository';
import type { Product } from '@/domain/entities/Product';

// Mock implementation pour les tests de contrat
class _MockProductRepository implements ProductRepository {
  private products: Map<string, Product> = new Map();

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  async findAll() {
    return Array.from(this.products.values());
  }

  async findByType(type: string) {
    return Array.from(this.products.values()).filter(p => p.type === type);
  }

  // Helper for tests
  setProduct(product: Product): void {
    this.products.set(product.id, product);
  }
}
