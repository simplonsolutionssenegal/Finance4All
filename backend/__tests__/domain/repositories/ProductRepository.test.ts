// backend/__tests__/domain/repositories/ProductRepository.test.ts

import type { ProductRepository } from '@/domain/repositories/ProductRepository';
import type { Product } from '@/domain/entities/Product';
import { ProductType } from '@/domain/entities/types/ProductType';
import { GetProductByInstitutionUseCaseImpl } from '@/domain/use-cases/GetProductByInstitutionUseCaseImpl';
import { FilterProductUseCaseImpl } from '@/domain/use-cases/FilterProductUseCaseImpl';

function makeProductRepositoryMock(): jest.Mocked<ProductRepository> {
  return {
    findByInstitution: jest.fn<Promise<Product[]>, [string]>(),
    institutionExists: jest.fn<Promise<boolean>, [string]>(),
    findByFilters: jest.fn<
      Promise<Product[]>,
      [string, ProductType[] | undefined, string[] | undefined, Date | undefined]
    >(),
  };
}

function makeService(overrides: Partial<Product> = {}, base: Partial<Product> = {}): Product {
  const def: Partial<Product> = {
    id: 'svc-1',
    designation: 'Crédit Nano',
    montantMin: 10000,
    montantMax: 200000,
    type: ProductType.CREDIT,
    modesRemboursement: 'USSD',
    institutionId: base.institutionId ?? 'inst-1',
    zone: 'Z1',
    createdAt: new Date('2025-09-01T00:00:00Z'),
    updatedAt: new Date('2025-09-01T00:00:00Z'),
  };
  return { ...def, ...base, ...overrides } as Product;
}

describe('GetServiceByInstitutionUseCaseImpl', () => {
  const INSTITUTION_ID = 'inst-42';

  let repo: jest.Mocked<ProductRepository>;
  let useCase: { execute: (institutionId: string) => Promise<Product[]> };

  beforeEach(() => {
    repo = makeProductRepositoryMock();
    useCase = new GetProductByInstitutionUseCaseImpl(repo as ProductRepository) as any;
  });

  it('retourne les services et appelle le repo avec le bon id', async () => {
    const expected: Product[] = [
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
    const expected: Product[] = [];
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

    await expect(useCase.execute(INSTITUTION_ID)).rejects.toMatchObject({
      code: 'INSTITUTION_NOT_FOUND',
    });
    expect(repo.findByInstitution).not.toHaveBeenCalled();
  });
});

describe('FilterServicesUseCaseImpl', () => {
  const INSTITUTION_ID = 'inst-1';
  const ZONES = ['Z1', 'Z2'] as const;
  const TYPES: ProductType[] = [ProductType.CREDIT, ProductType.EPARGNE];
  const NOW = new Date('2025-10-05T00:00:00Z');

  let repo: jest.Mocked<ProductRepository>;
  let useCase: {
    execute: (p: {
      institutionId: string;
      types?: ProductType[];
      zoneCodes?: string[];
      datePreset?: 'recent' | '3mois';
    }) => Promise<Product[]>;
  };

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    repo = makeProductRepositoryMock();
    useCase = new FilterProductUseCaseImpl(repo as ProductRepository) as any;
  });

  it('recent: appelle institutionExists puis findByFilters avec un fromDate récent', async () => {
    const expected: Product[] = [
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
    const expected: Product[] = [];
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
    const expected: Product[] = [makeService({ id: 'svc-3m' }, { institutionId: INSTITUTION_ID })];
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
