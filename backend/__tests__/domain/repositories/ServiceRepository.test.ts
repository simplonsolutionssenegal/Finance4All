// tests/domain/repositories/ServiceRepository.contract.test.ts
import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import { InstitutionService } from '@/domain/entities/InstitutionService';
import type { ServiceType } from '@/domain/entities/types/InstitutionServiceType';

// Une implémentation factice pour le test
class FakeServiceRepository implements ServiceRepository {
  private services: InstitutionService[] = [];

  constructor(services: InstitutionService[]) {
    this.services = services;
  }

  async findByInstitution(institutionId: string): Promise<InstitutionService[]> {
    return this.services.filter(s => s.institutionId === institutionId);
  }

  async findByFilters(
    institutionId: string,
    types?: ServiceType[],
    zoneCodes?: string[],
    fromDate?: Date
  ): Promise<InstitutionService[]> {
    return this.services.filter(s => {
      if (s.institutionId !== institutionId) return false;
      if (types?.length && !types.includes(s.type)) return false;
      if (zoneCodes?.length && !zoneCodes.includes(s.zone)) return false;
      if (fromDate && s.createdAt < fromDate) return false;
      return true;
    });
  }
}

describe('ServiceRepository contract', () => {
  let repo: ServiceRepository;
  const fakeServices = [
    new InstitutionService(
      '1',
      'Crédit logement',
      1000,
      100000,
      'CREDIT' as ServiceType,
      'AGENCE',
      'inst-1',
      'zone-1',
      new Date('2023-01-01'),
      new Date()
    ),
    new InstitutionService(
      '2',
      'Epargne retraite',
      500,
      50000,
      'EPARGNE' as ServiceType,
      'USSD',
      'inst-1',
      'zone-2',
      new Date('2024-01-01'),
      new Date()
    ),
  ];

  beforeEach(() => {
    repo = new FakeServiceRepository(fakeServices);
  });

  it('findByInstitution doit retourner uniquement les services liés à une institution', async () => {
    const results = await repo.findByInstitution('inst-1');
    expect(results).toHaveLength(2);
    expect(results.every(s => s.institutionId === 'inst-1')).toBe(true);
  });

  it('findByFilters doit filtrer par type', async () => {
    const results = await repo.findByFilters('inst-1', ['CREDIT']);
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('CREDIT');
  });

  it('findByFilters doit filtrer par zone', async () => {
    const results = await repo.findByFilters('inst-1', undefined, ['zone-2']);
    expect(results).toHaveLength(1);
    expect(results[0].zone).toBe('zone-2');
  });

  it('findByFilters doit filtrer par date', async () => {
    const results = await repo.findByFilters(
      'inst-1',
      undefined,
      undefined,
      new Date('2023-06-01')
    );
    expect(results).toHaveLength(1);
    expect(results[0].designation).toBe('Epargne retraite');
  });
});
