// backend/__tests__/domain/repositories/ServiceRepository.test.ts

import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import type { InstitutionService } from '@/domain/entities/InstitutionService';
import type { ServiceType } from '@/domain/entities/types/InstitutionServiceType';
import { GetServiceByInstitutionUseCaseImpl } from '@/domain/use-cases/GetServiceByInstitutionUseCaseImpl';
import { FilterServicesUseCaseImpl } from '@/domain/use-cases/FilterServicesUseCaseImpl';

// -----------------------------------------------------------------------------
// MOCK unique et typé pour ServiceRepository
// -----------------------------------------------------------------------------
function makeServiceRepositoryMock(): jest.Mocked<ServiceRepository> {
  return {
    findByInstitution: jest.fn<Promise<InstitutionService[]>, [string]>(),
    institutionExists: jest.fn<Promise<boolean>, [string]>(),
    findByFilters: jest.fn<
      Promise<InstitutionService[]>,
      [string, ServiceType[] | undefined, string[] | undefined, Date | undefined]
    >(),
  };
}

// Petite factory de service (si c’est une classe, remplace par `new InstitutionService(...)`)
function makeService(
  overrides: Partial<InstitutionService> = {},
  base: Partial<InstitutionService> = {}
): InstitutionService {
  const def: Partial<InstitutionService> = {
    id: 'svc-1',
    designation: 'Crédit Nano',
    montantMin: 10000,
    montantMax: 200000,
    type: 'CREDIT',
    modesRemboursement: 'USSD',
    institutionId: base.institutionId ?? 'inst-1',
    zone: 'Z1',
    createdAt: new Date('2025-09-01T00:00:00Z'),
    updatedAt: new Date('2025-09-01T00:00:00Z'),
  };
  return { ...def, ...base, ...overrides } as InstitutionService;
}

// -----------------------------------------------------------------------------
// SUITE 1 — GetServiceByInstitutionUseCaseImpl
// -----------------------------------------------------------------------------
describe('GetServiceByInstitutionUseCaseImpl', () => {
  const INSTITUTION_ID = 'inst-42';

  let repo: jest.Mocked<ServiceRepository>;
  let useCase: { execute: (institutionId: string) => Promise<InstitutionService[]> };

  beforeEach(() => {
    repo = makeServiceRepositoryMock();
    useCase = new GetServiceByInstitutionUseCaseImpl(repo as ServiceRepository) as any;
  });

  it('retourne les services et appelle le repo avec le bon id', async () => {
    const expected: InstitutionService[] = [
      makeService({ id: 'svc-a' }, { institutionId: INSTITUTION_ID }),
      makeService({ id: 'svc-b' }, { institutionId: INSTITUTION_ID }),
    ];
    repo.institutionExists.mockResolvedValueOnce(true);
    repo.findByInstitution.mockResolvedValueOnce(expected);

    const result = await useCase.execute(INSTITUTION_ID);

    expect(repo.institutionExists).toHaveBeenCalledWith(INSTITUTION_ID);
    expect(repo.findByInstitution).toHaveBeenCalledWith(INSTITUTION_ID);
    expect(result).toEqual(expected);
  });

  it('retourne [] quand le repo ne trouve rien', async () => {
    const expected: InstitutionService[] = [];
    repo.institutionExists.mockResolvedValueOnce(true);
    repo.findByInstitution.mockResolvedValueOnce(expected);

    const result = await useCase.execute(INSTITUTION_ID);

    expect(repo.findByInstitution).toHaveBeenCalledWith(INSTITUTION_ID);
    expect(result).toEqual([]);
  });

  it('propage les erreurs du repo', async () => {
    repo.institutionExists.mockResolvedValueOnce(true);
    repo.findByInstitution.mockRejectedValueOnce(new Error('DB down'));

    await expect(useCase.execute(INSTITUTION_ID)).rejects.toThrow('DB down');
    expect(repo.findByInstitution).toHaveBeenCalledWith(INSTITUTION_ID);
  });

  it("rejette 'INSTITUTION_NOT_FOUND' si l'institution n'existe pas", async () => {
    repo.institutionExists.mockResolvedValueOnce(false);

    await expect(useCase.execute(INSTITUTION_ID)).rejects.toThrow('INSTITUTION_NOT_FOUND');
    expect(repo.findByInstitution).not.toHaveBeenCalled();
  });
});

// -----------------------------------------------------------------------------
// SUITE 2 — FilterServicesUseCaseImpl
// -----------------------------------------------------------------------------
describe('FilterServicesUseCaseImpl', () => {
  const INSTITUTION_ID = 'inst-1';
  const ZONES = ['Z1', 'Z2'] as const;
  const TYPES: ServiceType[] = ['CREDIT', 'EPARGNE'];
  const NOW = new Date('2025-10-05T00:00:00Z');

  let repo: jest.Mocked<ServiceRepository>;
  let useCase: {
    execute: (p: {
      institutionId: string;
      types?: ServiceType[];
      zoneCodes?: string[];
      datePreset?: 'recent' | '3mois';
    }) => Promise<InstitutionService[]>;
  };

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    repo = makeServiceRepositoryMock();
    useCase = new FilterServicesUseCaseImpl(repo as ServiceRepository) as any;
  });

  it('recent: appelle institutionExists puis findByFilters avec un fromDate récent', async () => {
    const expected: InstitutionService[] = [
      makeService({ id: 'svc-a' }, { institutionId: INSTITUTION_ID }),
      makeService({ id: 'svc-b' }, { institutionId: INSTITUTION_ID }),
    ];
    repo.institutionExists.mockResolvedValueOnce(true);
    repo.findByFilters.mockResolvedValueOnce(expected);

    const result = await useCase.execute({
      institutionId: INSTITUTION_ID,
      types: TYPES,
      zoneCodes: [...ZONES],
      datePreset: 'recent',
    });

    expect(repo.institutionExists).toHaveBeenCalledWith(INSTITUTION_ID);

    const [id, types, zones, fromDate] = repo.findByFilters.mock.calls[0];
    expect(id).toBe(INSTITUTION_ID);
    expect(types).toEqual(TYPES);
    expect(zones).toEqual(ZONES);
    expect(fromDate).toBeInstanceOf(Date);

    const days = (NOW.getTime() - (fromDate as Date).getTime()) / (24 * 60 * 60 * 1000);
    expect(days).toBeGreaterThanOrEqual(0);
    expect(days).toBeLessThanOrEqual(40); // marge souple

    expect(result).toEqual(expected);
  });

  it('aucun filtre: fromDate undefined', async () => {
    const expected: InstitutionService[] = [];
    repo.institutionExists.mockResolvedValueOnce(true);
    repo.findByFilters.mockResolvedValueOnce(expected);

    const result = await useCase.execute({ institutionId: INSTITUTION_ID });

    const [, types, zones, fromDate] = repo.findByFilters.mock.calls[0];
    expect(types).toBeUndefined();
    expect(zones).toBeUndefined();
    expect(fromDate).toBeUndefined();

    expect(result).toEqual(expected);
  });

  it('3mois: fromDate ~90 jours', async () => {
    const expected: InstitutionService[] = [
      makeService({ id: 'svc-3m' }, { institutionId: INSTITUTION_ID }),
    ];
    repo.institutionExists.mockResolvedValueOnce(true);
    repo.findByFilters.mockResolvedValueOnce(expected);

    const result = await useCase.execute({ institutionId: INSTITUTION_ID, datePreset: '3mois' });

    const [, , , fromDate] = repo.findByFilters.mock.calls[0];
    expect(fromDate).toBeInstanceOf(Date);

    const days = (NOW.getTime() - (fromDate as Date).getTime()) / (24 * 60 * 60 * 1000);
    expect(days).toBeGreaterThanOrEqual(70);
    expect(days).toBeLessThanOrEqual(100);

    expect(result).toEqual(expected);
  });

  it('propage erreur du repo', async () => {
    repo.institutionExists.mockResolvedValueOnce(true);
    repo.findByFilters.mockRejectedValueOnce(new Error('DB down'));

    await expect(useCase.execute({ institutionId: INSTITUTION_ID, types: TYPES })).rejects.toThrow(
      'DB down'
    );
  });

  it("rejette 'INSTITUTION_NOT_FOUND' si inexistant", async () => {
    repo.institutionExists.mockResolvedValueOnce(false);

    await expect(useCase.execute({ institutionId: INSTITUTION_ID })).rejects.toThrow(
      'INSTITUTION_NOT_FOUND'
    );
    expect(repo.findByFilters).not.toHaveBeenCalled();
  });
});
