import type { ProductRepository } from '@/domain/repositories/ProductRepository';
import type { Product } from '@/domain/entities/Product';
import type { ProductType } from '@/domain/entities/types/ProductType';
import { FilterProductUseCaseImpl } from '@/domain/use-cases/FilterProductUseCaseImpl';

function makeRepoMock() {
  return {
    institutionExists: jest.fn(),
    findByFilters: jest.fn(),

    findByInstitution: jest.fn(),
  } as unknown as jest.Mocked<ProductRepository>;
}

describe('FilterProductUseCaseImpl', () => {
  const FIXED_NOW = new Date('2025-01-15T12:00:00.000Z'); // date fixe pour tests "recent"/"3mois"

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('lève INSTITUTION_NOT_FOUND si institution inexistante', async () => {
    const repo = makeRepoMock();
    repo.institutionExists.mockResolvedValueOnce(false);

    const uc = new FilterProductUseCaseImpl(repo);
    await expect(uc.execute({ institutionId: 'inst-x' })).rejects.toThrow('INSTITUTION_NOT_FOUND');

    expect(repo.institutionExists).toHaveBeenCalledWith('inst-x');
    expect(repo.findByFilters).not.toHaveBeenCalled();
  });

  it('passe les filtres normalisés (types + zones) et fromDate undefined si pas de preset', async () => {
    const repo = makeRepoMock();
    repo.institutionExists.mockResolvedValueOnce(true);
    repo.findByFilters.mockResolvedValueOnce([] as Product[]);

    const uc = new FilterProductUseCaseImpl(repo);
    await uc.execute({
      institutionId: 'inst-1',
      types: ['CREDIT', 'EPARGNE', 'UNKNOWN'] as unknown as ProductType[],
      zoneCodes: ['  DAKAR', '', 'THIES  '],
      datePreset: undefined,
    });

    // Vérifie la normalisation passée au repo
    const call = (repo.findByFilters as jest.Mock).mock.calls[0];
    expect(call[0]).toBe('inst-1');
    expect(call[1]).toEqual(['CREDIT', 'EPARGNE']);
    expect(call[2]).toEqual(['DAKAR', 'THIES']);
    expect(call[3]).toBeUndefined();
  });

  it('datePreset "recent" → fromDate = NOW - 7 jours', async () => {
    const repo = makeRepoMock();
    repo.institutionExists.mockResolvedValueOnce(true);
    repo.findByFilters.mockResolvedValueOnce([] as Product[]);

    const uc = new FilterProductUseCaseImpl(repo);
    await uc.execute({
      institutionId: 'inst-2',
      datePreset: 'recent',
    });

    const passedFromDate = (repo.findByFilters as jest.Mock).mock.calls[0][3] as Date;
    expect(passedFromDate).toBeInstanceOf(Date);

    const expected = new Date(FIXED_NOW);
    expected.setDate(expected.getDate() - 7);

    // comparer timestamps (tolérance zéro car date fixe)
    expect(passedFromDate.getTime()).toBe(expected.getTime());
  });

  it('datePreset "3mois" → fromDate = NOW - 3 mois', async () => {
    const repo = makeRepoMock();
    repo.institutionExists.mockResolvedValueOnce(true);
    repo.findByFilters.mockResolvedValueOnce([] as Product[]);

    const uc = new FilterProductUseCaseImpl(repo);
    await uc.execute({
      institutionId: 'inst-3',
      datePreset: '3mois',
    });

    const passedFromDate = (repo.findByFilters as jest.Mock).mock.calls[0][3] as Date;
    expect(passedFromDate).toBeInstanceOf(Date);

    const expected = new Date(FIXED_NOW);
    expected.setMonth(expected.getMonth() - 3);

    expect(passedFromDate.getTime()).toBe(expected.getTime());
  });

  it('types vides → undefined / zones vides → undefined', async () => {
    const repo = makeRepoMock();
    repo.institutionExists.mockResolvedValueOnce(true);
    repo.findByFilters.mockResolvedValueOnce([] as Product[]);

    const uc = new FilterProductUseCaseImpl(repo);
    await uc.execute({
      institutionId: 'inst-4',
      types: [],
      zoneCodes: ['  ', ''],
    });

    const call = (repo.findByFilters as jest.Mock).mock.calls[0];
    expect(call[1]).toBeUndefined();
    // Peut être [] ou undefined selon l'implémentation
    expect([undefined, []]).toContainEqual(call[2]);
  });

  it('retourne la valeur du repo (chemin heureux)', async () => {
    const repo = makeRepoMock();
    repo.institutionExists.mockResolvedValueOnce(true);

    const fake: Product[] = [{ id: 's1' } as unknown as Product];
    repo.findByFilters.mockResolvedValueOnce(fake);

    const uc = new FilterProductUseCaseImpl(repo);
    const result = await uc.execute({ institutionId: 'inst-5' });

    expect(result).toBe(fake);
  });
});
