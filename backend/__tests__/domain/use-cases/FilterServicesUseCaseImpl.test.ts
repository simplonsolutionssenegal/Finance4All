import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import type { InstitutionService } from '@/domain/entities/InstitutionService';
import type { ServiceType } from '@/domain/entities/types/InstitutionServiceType';
import { FilterServicesUseCaseImpl } from '@/domain/use-cases/FilterServicesUseCaseImpl';

function makeRepoMock() {
  return {
    institutionExists: jest.fn(),
    findByFilters: jest.fn(),
    // présent dans l'interface globale mais non utilisé ici
    findByInstitution: jest.fn(),
  } as unknown as jest.Mocked<ServiceRepository>;
}

describe('FilterServicesUseCaseImpl', () => {
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

    const uc = new FilterServicesUseCaseImpl(repo);
    await expect(uc.execute({ institutionId: 'inst-x' })).rejects.toThrow('INSTITUTION_NOT_FOUND');

    expect(repo.institutionExists).toHaveBeenCalledWith('inst-x');
    expect(repo.findByFilters).not.toHaveBeenCalled();
  });

  it('passe les filtres normalisés (types + zones) et fromDate undefined si pas de preset', async () => {
    const repo = makeRepoMock();
    repo.institutionExists.mockResolvedValueOnce(true);
    repo.findByFilters.mockResolvedValueOnce([] as InstitutionService[]);

    const uc = new FilterServicesUseCaseImpl(repo);
    await uc.execute({
      institutionId: 'inst-1',
      types: ['credit', 'EPARGNE', 'UNKNOWN'] as unknown as ServiceType[], // casse + type non permis
      zoneCodes: ['  DAKAR', '', 'THIES  '], // espaces + vide
      datePreset: undefined,
    });

    // Vérifie la normalisation passée au repo
    const call = (repo.findByFilters as jest.Mock).mock.calls[0];
    expect(call[0]).toBe('inst-1');
    expect(call[1]).toEqual(['CREDIT', 'EPARGNE']); // 'UNKNOWN' filtré
    expect(call[2]).toEqual(['DAKAR', 'THIES']); // trim + vide supprimé
    expect(call[3]).toBeUndefined(); // pas de preset -> undefined
  });

  it('datePreset "recent" → fromDate = NOW - 7 jours', async () => {
    const repo = makeRepoMock();
    repo.institutionExists.mockResolvedValueOnce(true);
    repo.findByFilters.mockResolvedValueOnce([] as InstitutionService[]);

    const uc = new FilterServicesUseCaseImpl(repo);
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
    repo.findByFilters.mockResolvedValueOnce([] as InstitutionService[]);

    const uc = new FilterServicesUseCaseImpl(repo);
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
    repo.findByFilters.mockResolvedValueOnce([] as InstitutionService[]);

    const uc = new FilterServicesUseCaseImpl(repo);
    await uc.execute({
      institutionId: 'inst-4',
      types: [], // vide -> undefined
      zoneCodes: ['  ', ''], // vides/espaces -> undefined
    });

    const call = (repo.findByFilters as jest.Mock).mock.calls[0];
    expect(call[1]).toBeUndefined();
    expect(call[2]).toBeUndefined();
  });

  it('retourne la valeur du repo (chemin heureux)', async () => {
    const repo = makeRepoMock();
    repo.institutionExists.mockResolvedValueOnce(true);

    const fake: InstitutionService[] = [
      // on n’a pas besoin de l’objet complet pour ce test
      { id: 's1' } as unknown as InstitutionService,
    ];
    repo.findByFilters.mockResolvedValueOnce(fake);

    const uc = new FilterServicesUseCaseImpl(repo);
    const result = await uc.execute({ institutionId: 'inst-5' });

    expect(result).toBe(fake);
  });
});
