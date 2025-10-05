import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import type { InstitutionService } from '@/domain/entities/InstitutionService';
import type { ServiceType } from '@/domain/entities/types/InstitutionServiceType';
import { FilterServicesUseCaseImpl } from '@/domain/use-cases/FilterServicesUseCaseImpl';
import type { RemboursementMode } from '@/domain/entities/types/RemboursementMode';

describe('FilterServicesUseCaseImpl', () => {
  const validUuid = '99e13ab0-b2df-423f-ba5b-c847c1dc0fef';
  let repo: jest.Mocked<ServiceRepository>;
  let uc: FilterServicesUseCaseImpl;

  const mkServices = (n = 2): InstitutionService[] =>
    Array.from(
      { length: n },
      (_, i) =>
        ({
          id: `svc_${i + 1}`,
          designation: `Service ${i + 1}`,
          montantMin: 1000,
          montantMax: 5000,
          type: 'CREDIT' as ServiceType,
          modesRemboursement: 'USSD' as RemboursementMode,
          institutionId: validUuid,
          zone: 'SN-DK',
          createdAt: new Date('2025-09-01T00:00:00Z'),
          updatedAt: new Date('2025-10-01T00:00:00Z'),
        }) as InstitutionService
    );

  beforeEach(() => {
    repo = {
      findByInstitution: jest.fn(),
      findByFilters: jest.fn(),
    };
    uc = new FilterServicesUseCaseImpl(repo);
    jest.useFakeTimers();
    // Fige l’horloge à une date stable (UTC)
    jest.setSystemTime(new Date('2025-10-04T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('jette une erreur si institutionId N’EST PAS un UUID', async () => {
    await expect(
      uc.execute({ institutionId: '123', types: ['CREDIT'], zoneCodes: ['Z1'] })
    ).rejects.toThrow('institutionId invalide (UUID attendu)');
    expect(repo.findByFilters).not.toHaveBeenCalled();
  });

  it('passe les filtres tels que nettoyés (types uppercased/validés, zones trimées) et datePreset=recent (J-7)', async () => {
    const data = mkServices(1);
    repo.findByFilters.mockResolvedValueOnce(data);

    const result = await uc.execute({
      institutionId: validUuid,
      // mélange de casse + une valeur invalide à filtrer
      types: ['credit', 'EPARGNE', 'foo'] as unknown as ServiceType[],
      // espaces et vides à nettoyer
      zoneCodes: ['  DZ-01 ', '', 'SN-DK '],
      datePreset: 'recent',
    });

    // now = 2025-10-04T12:00:00Z
    const expectedFromDate = new Date('2025-09-27T12:00:00Z'); // J-7

    expect(repo.findByFilters).toHaveBeenCalledTimes(1);
    const [instId, cleanTypes, cleanZones, fromDate] = repo.findByFilters.mock.calls[0];

    expect(instId).toBe(validUuid);
    expect(cleanTypes).toEqual(['CREDIT', 'EPARGNE']); // 'foo' supprimé + uppercase
    expect(cleanZones).toEqual(['DZ-01', 'SN-DK']); // trim + vides supprimés
    expect(fromDate?.toISOString()).toBe(expectedFromDate.toISOString());
    expect(result).toEqual(data);
  });

  it('datePreset=3mois calcule une date 3 mois en arrière (même jour/heure si possible)', async () => {
    repo.findByFilters.mockResolvedValueOnce(mkServices(2));

    await uc.execute({
      institutionId: validUuid,
      types: ['MOBILE_MONEY'] as ServiceType[],
      zoneCodes: ['Z-42'],
      datePreset: '3mois',
    });

    // now = 2025-10-04T12:00:00Z → -3 mois = 2025-07-04T12:00:00Z
    const expected = new Date('2025-07-04T12:00:00Z').toISOString();
    const fromDate = repo.findByFilters.mock.calls[0][3];
    expect(fromDate?.toISOString()).toBe(expected);
  });

  it('types invalides uniquement → types undefined', async () => {
    repo.findByFilters.mockResolvedValueOnce(mkServices(1));

    await uc.execute({
      institutionId: validUuid,
      // uniquement des valeurs non autorisées
      types: ['xxx', 'yyy'] as unknown as ServiceType[],
      zoneCodes: ['Z1'],
    });

    const [, cleanTypes] = repo.findByFilters.mock.calls[0];
    expect(cleanTypes).toBeUndefined();
  });

  it('types tableau vide ou non fourni → undefined', async () => {
    repo.findByFilters.mockResolvedValueOnce(mkServices(1));

    await uc.execute({
      institutionId: validUuid,
      types: [],
      zoneCodes: ['Z1'],
    });
    expect(repo.findByFilters.mock.calls[0][1]).toBeUndefined();

    await uc.execute({
      institutionId: validUuid,
      zoneCodes: ['Z1'],
    });
    expect(repo.findByFilters.mock.calls[1][1]).toBeUndefined();
  });

  it('zoneCodes vides/whitespace → undefined', async () => {
    repo.findByFilters.mockResolvedValue(mkServices(1));

    await uc.execute({
      institutionId: validUuid,
      types: ['ASSURANCE'] as ServiceType[],
      zoneCodes: ['   ', ''],
    });

    expect(repo.findByFilters.mock.calls[0][2]).toBeUndefined();
  });

  it('aucun filtre (types/zone/date) → passe undefined partout sauf institutionId', async () => {
    repo.findByFilters.mockResolvedValueOnce([]);

    await uc.execute({ institutionId: validUuid });

    expect(repo.findByFilters).toHaveBeenCalledWith(validUuid, undefined, undefined, undefined);
  });

  it('retourne tel quel le résultat du repository', async () => {
    const data = mkServices(3);
    repo.findByFilters.mockResolvedValueOnce(data);

    const res = await uc.execute({
      institutionId: validUuid,
      types: ['CREDIT'] as ServiceType[],
    });

    expect(res).toBe(data);
  });
});
