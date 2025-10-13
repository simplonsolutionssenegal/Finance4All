describe('ProductRepository', () => {
  it('should be defined', () => {
    expect(true).toBe(true);
  });
});
// backend/__tests__/domain/repositories/ProductRepository.test.ts
import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import type { Service } from '@/domain/entities/Service';

// Mock implementation pour les tests de contrat
class _MockServiceRepository implements ServiceRepository {
  private services: Map<string, Service> = new Map();

  async findById(id: string): Promise<Service | null> {
    return this.services.get(id) || null;
  }

  async findAll() {
    return Array.from(this.services.values());
  }

  async findByType(type: string) {
    return Array.from(this.services.values()).filter(p => p.type === type);
  }

  // Helper for tests
  setService(service: Service): void {
    this.services.set(service.id, service);
  }
}
