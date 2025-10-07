// __tests__/application/use-cases/FilterProductUseCase.test.ts
import type { Product } from '@/domain/entities/Product';
import { ProductType } from '@/domain/entities/types/ProductType';
import type { FilterProductUseCase } from '@/application/use-cases/FilterProductUseCase';
import { FilterProductUseCaseImpl } from '@/domain/use-cases/FilterProductUseCaseImpl';

describe('FilterProductUseCaseImpl', () => {
  const mockRepo: {
    institutionExists: jest.Mock<Promise<boolean>, [string]>;
    findByFilters: jest.Mock<
      Promise<Product[]>,
      [string, ProductType[] | undefined, string[] | undefined, Date | undefined]
    >;
  } = {
    institutionExists: jest.fn<Promise<boolean>, [string]>(),
    findByFilters: jest.fn<
      Promise<Product[]>,
      [string, ProductType[] | undefined, string[] | undefined, Date | undefined]
    >(),
  };

  const INSTITUTION_ID = 'inst-1';
  const ZONES = ['Z1', 'Z2'] as const;
  const TYPES = [ProductType.CREDIT, ProductType.EPARGNE];

  const makeService = (overrides?: Partial<Product>): Product =>
    ({
      id: 'svc-1',
      designation: 'Crédit Nano',
      montantMin: 10000,
      montantMax: 200000,
      type: 'CREDIT',
      remboursementMode: 'AGENCE',
      institutionId: INSTITUTION_ID,
      zoneId: ZONES[0],
      createdAt: new Date('2025-09-01T00:00:00Z'),
      updatedAt: new Date('2025-09-01T00:00:00Z'),
      ...overrides,
    }) as unknown as Product;

  const NOW = new Date('2025-10-05T00:00:00Z');
  let useCase: FilterProductUseCase;

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new FilterProductUseCaseImpl(mockRepo as any);
  });

  it("appelle le repo avec types + zones + fromDate('recent') et retourne les services", async () => {
    const expected: Product[] = [makeService({ id: 'svc-a' }), makeService({ id: 'svc-b' })];

    mockRepo.institutionExists.mockResolvedValueOnce(true);
    mockRepo.findByFilters.mockResolvedValueOnce(expected);

    const result = await useCase.execute({
      institutionId: INSTITUTION_ID,
      types: TYPES,
      zoneCodes: [...ZONES],
      datePreset: 'recent',
    });

    expect(mockRepo.institutionExists).toHaveBeenCalledWith(INSTITUTION_ID);

    const [id, types, zones, fromDate] = mockRepo.findByFilters.mock.calls[0];
    expect(id).toBe(INSTITUTION_ID);
    expect(types).toEqual(TYPES);
    expect(zones).toEqual(ZONES);

    expect(fromDate).toBeInstanceOf(Date);
    const days = (NOW.getTime() - (fromDate as Date).getTime()) / (24 * 60 * 60 * 1000);
    expect(days).toBeGreaterThanOrEqual(0);
    expect(days).toBeLessThanOrEqual(40);

    expect(result).toEqual(expected);
  });

  it("appelle le repo avec seulement institutionId (aucun filtre) et n'envoie pas fromDate", async () => {
    const expected: Product[] = [];

    mockRepo.institutionExists.mockResolvedValueOnce(true);
    mockRepo.findByFilters.mockResolvedValueOnce(expected);

    const result = await useCase.execute({ institutionId: INSTITUTION_ID });

    expect(mockRepo.institutionExists).toHaveBeenCalledWith(INSTITUTION_ID);

    const [id, types, zones, fromDate] = mockRepo.findByFilters.mock.calls[0];
    expect(id).toBe(INSTITUTION_ID);
    expect(types).toBeUndefined();
    expect(zones).toBeUndefined();
    expect(fromDate).toBeUndefined();

    expect(result).toEqual(expected);
  });

  it("appelle le repo avec datePreset='3mois' et calcule un fromDate dans ~90 jours", async () => {
    const expected: Product[] = [makeService({ id: 'svc-3m' })];

    mockRepo.institutionExists.mockResolvedValueOnce(true);
    mockRepo.findByFilters.mockResolvedValueOnce(expected);

    const result = await useCase.execute({ institutionId: INSTITUTION_ID, datePreset: '3mois' });

    expect(mockRepo.institutionExists).toHaveBeenCalledWith(INSTITUTION_ID);

    const [, , , fromDate] = mockRepo.findByFilters.mock.calls[0];
    const days = (NOW.getTime() - (fromDate as Date).getTime()) / (24 * 60 * 60 * 1000);
    expect(days).toBeGreaterThanOrEqual(70);
    expect(days).toBeLessThanOrEqual(100);

    expect(result).toEqual(expected);
  });

  it('propage les erreurs du repository', async () => {
    mockRepo.institutionExists.mockResolvedValueOnce(true);
    mockRepo.findByFilters.mockRejectedValueOnce(new Error('DB down'));

    await expect(useCase.execute({ institutionId: INSTITUTION_ID, types: TYPES })).rejects.toThrow(
      'DB down'
    );
  });

  it('rejette si institutionId est vide (implémentations strictes)', async () => {
    await expect(useCase.execute({ institutionId: '' as unknown as string })).rejects.toThrow();
    expect(mockRepo.findByFilters).not.toHaveBeenCalled();
  });

  it("rejette 'INSTITUTION_NOT_FOUND' si l'institution n'existe pas", async () => {
    mockRepo.institutionExists.mockResolvedValueOnce(false);

    await expect(useCase.execute({ institutionId: INSTITUTION_ID })).rejects.toThrow(
      'INSTITUTION_NOT_FOUND'
    );
    expect(mockRepo.findByFilters).not.toHaveBeenCalled();
  });
});
