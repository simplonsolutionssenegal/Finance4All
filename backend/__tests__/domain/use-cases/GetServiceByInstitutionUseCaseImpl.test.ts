// __tests__/domain/use-cases/GetServiceByInstitutionUseCaseImpl.test.ts

import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import { InstitutionService } from '@/domain/entities/InstitutionService';
import type { ServiceType } from '@/domain/entities/types/InstitutionServiceType';
import type { RemboursementMode } from '@/domain/entities/types/RemboursementMode';
import { GetServiceByInstitutionUseCaseImpl } from '@/domain/use-cases/GetServiceByInstitutionUseCaseImpl';

// ---------- Mock du repository ----------
class MockServiceRepository implements ServiceRepository {
  public calls: Array<{ fn: string; args: any[] }> = [];
  public byInstitutionResult: InstitutionService[] = [];
  public throwInFindByInstitution: Error | null = null;

  async findByInstitution(institutionId: string): Promise<InstitutionService[]> {
    this.calls.push({ fn: 'findByInstitution', args: [institutionId] });
    if (this.throwInFindByInstitution) throw this.throwInFindByInstitution;
    return this.byInstitutionResult;
  }

  // Satisfait l'interface (non utilisé ici)
  async findByFilters(): Promise<InstitutionService[]> {
    this.calls.push({ fn: 'findByFilters', args: Array.from(arguments) });
    return [];
  }
}

// ---------- Petite factory ----------
let __seq = 0;
function makeService(partial: Partial<InstitutionService> = {}) {
  __seq += 1;
  return new InstitutionService(
    partial.id ?? `svc-${__seq}`,
    partial.designation ?? `Service ${__seq}`,
    partial.montantMin ?? 1000,
    partial.montantMax ?? 100000,
    partial.type ?? ('CREDIT' as ServiceType),
    partial.modesRemboursement ?? ('MOBILE' as RemboursementMode),
    partial.institutionId ?? '99e13ab0-b2df-423f-ba5b-c847c1dc0fef',
    partial.zone ?? 'DAKAR',
    partial.createdAt ?? new Date('2025-01-01T00:00:00.000Z'),
    partial.updatedAt ?? new Date('2025-01-01T00:00:00.000Z')
  );
}

// ---------- Tests ----------
describe('GetServiceByInstitutionUseCaseImpl', () => {
  let repo: MockServiceRepository;

  beforeEach(() => {
    repo = new MockServiceRepository();
  });

  it('retourne les services et appelle findByInstitution avec un UUID valide', async () => {
    const uc = new GetServiceByInstitutionUseCaseImpl(repo);
    const VALID_UUID = '99e13ab0-b2df-423f-ba5b-c847c1dc0fef'; // même que tes fixtures
    const s1 = makeService({ id: 's1', institutionId: VALID_UUID, zone: 'DAKAR' });
    const s2 = makeService({ id: 's2', institutionId: VALID_UUID, zone: 'THIES' });
    repo.byInstitutionResult = [s1, s2];

    const out = await uc.execute(VALID_UUID);

    expect(out).toEqual([s1, s2]);
    // vérifie l'appel repo
    expect(repo.calls).toHaveLength(1);
    expect(repo.calls[0]).toMatchObject({ fn: 'findByInstitution', args: [VALID_UUID] });
  });

  it('lève une erreur si institutionId N’EST PAS un UUID', async () => {
    const uc = new GetServiceByInstitutionUseCaseImpl(repo);
    await expect(uc.execute('not-a-uuid')).rejects.toThrow('institutionId invalide (UUID attendu)');
    // Le repo ne doit PAS être appelé
    expect(repo.calls).toHaveLength(0);
  });

  it('propage l’erreur du repository', async () => {
    const uc = new GetServiceByInstitutionUseCaseImpl(repo);
    const VALID_UUID = '99e13ab0-b2df-423f-ba5b-c847c1dc0fef';
    repo.throwInFindByInstitution = new Error('DB down');

    await expect(uc.execute(VALID_UUID)).rejects.toThrow('DB down');
    expect(repo.calls).toHaveLength(1);
    expect(repo.calls[0].fn).toBe('findByInstitution');
  });
});
