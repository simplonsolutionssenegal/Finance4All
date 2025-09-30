// __tests__/application/use-cases/FilterServicesUseCaseImpl.test.ts
import { FilterServicesUseCaseImpl } from '@/domain/use-cases/FilterServicesUseCaseImpl';
import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import type { Service } from '@/domain/entities/Service';
import type { ServiceType } from '@/domain/entities/types/ServiceType';
import type { DatePreset } from '@/application/use-cases/FilterServicesUseCase';

describe('FilterServicesUseCaseImpl', () => {
  let repo: jest.Mocked<ServiceRepository>;
  let uc: FilterServicesUseCaseImpl;

  beforeEach(() => {
    repo = {
      findByInstitution: jest.fn(),
      findByFilters: jest.fn().mockResolvedValue([] as Service[]),
    } as unknown as jest.Mocked<ServiceRepository>;

    uc = new FilterServicesUseCaseImpl(repo);
    jest.useFakeTimers(); // on utilisera setSystemTime quand nécessaire
    jest.setSystemTime(new Date('2025-09-26T12:00:00Z')); // date fixe pour les tests de preset
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('rejette si institutionId est invalide (<=0 ou NaN)', async () => {
    await expect(uc.execute({ institutionId: 0 })).rejects.toThrow('institutionId invalide');
    await expect(uc.execute({ institutionId: -1 })).rejects.toThrow('institutionId invalide');

    await expect(uc.execute({ institutionId: NaN })).rejects.toThrow('institutionId invalide');
    expect(repo.findByFilters).not.toHaveBeenCalled();
  });

  it('appel minimal: passe seulement institutionId, autres params undefined', async () => {
    const out = await uc.execute({ institutionId: 42 });
    expect(out).toEqual([]);
    expect(repo.findByFilters).toHaveBeenCalledTimes(1);
    expect(repo.findByFilters).toHaveBeenCalledWith(42, undefined, undefined, undefined);
  });

  it('nettoie/normalise types: majuscules et filtre aux valeurs autorisées', async () => {
    await uc.execute({
      institutionId: 1,
      // "credit" → "CREDIT"; "foo" est ignoré; "EPARGNE" ok
      types: ['credit', 'foo', 'EPARGNE'] as unknown as ServiceType[],
    });

    const args = (repo.findByFilters as jest.Mock).mock.calls[0];
    expect(args[0]).toBe(1);
    expect(args[1]).toEqual(['CREDIT', 'EPARGNE']); // types nettoyés
    expect(args[2]).toBeUndefined();
    expect(args[3]).toBeUndefined();
  });

  it("si aucun type valide après nettoyage → passe 'types' en undefined", async () => {
    await uc.execute({
      institutionId: 1,
      types: ['foo', 'bar'] as unknown as ServiceType[],
    });
    const args = (repo.findByFilters as jest.Mock).mock.calls[0];
    expect(args[1]).toBeUndefined();
  });

  it('zoneId: accepte seulement un nombre fini, sinon undefined', async () => {
    // zoneId valide
    await uc.execute({ institutionId: 1, zoneId: 99 });
    expect((repo.findByFilters as jest.Mock).mock.calls.pop()?.[2]).toBe(99);

    await uc.execute({ institutionId: 1, zoneId: NaN });
    expect((repo.findByFilters as jest.Mock).mock.calls.pop()?.[2]).toBeUndefined();

    // zoneId non passé -> undefined
    await uc.execute({ institutionId: 1 });
    expect((repo.findByFilters as jest.Mock).mock.calls.pop()?.[2]).toBeUndefined();
  });

  it("datePreset: 'recent' → fromDate = now - 7 jours", async () => {
    // now = 2025-09-26T12:00:00Z (setSystemTime)
    await uc.execute({ institutionId: 1, datePreset: 'recent' as DatePreset });

    const fromDate: Date = (repo.findByFilters as jest.Mock).mock.calls[0][3];
    expect(fromDate).toBeInstanceOf(Date);

    // attendu: 2025-09-19T12:00:00Z
    const expected = new Date('2025-09-19T12:00:00Z');
    expect(fromDate.toISOString()).toBe(expected.toISOString());
  });

  it("datePreset: '3mois' → fromDate = now - 3 mois", async () => {
    // now = 2025-09-26T12:00:00Z
    await uc.execute({ institutionId: 1, datePreset: '3mois' as DatePreset });

    const fromDate: Date = (repo.findByFilters as jest.Mock).mock.calls[0][3];
    expect(fromDate).toBeInstanceOf(Date);

    // attendu: 2025-06-26T12:00:00Z (setMonth -3)
    const expected = new Date('2025-06-26T12:00:00Z');
    expect(fromDate.toISOString()).toBe(expected.toISOString());
  });

  it('retourne ce que renvoie le repository', async () => {
    const fake: Partial<Service>[] = [
      { id: 1, designation: 'A', institutionId: 1 } as any,
      { id: 2, designation: 'B', institutionId: 1 } as any,
    ];
    repo.findByFilters.mockResolvedValueOnce(fake as Service[]);

    const result = await uc.execute({ institutionId: 1, types: ['CREDIT'] as ServiceType[] });

    expect(result).toEqual(fake);
    expect(repo.findByFilters).toHaveBeenCalledWith(1, ['CREDIT'], undefined, undefined);
  });
});
