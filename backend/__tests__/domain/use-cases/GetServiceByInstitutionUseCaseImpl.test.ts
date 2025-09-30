import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import { Service } from '@/domain/entities/Service';

import type { ServiceType } from '@/domain/entities/types/ServiceType';
import type { RemboursementMode } from '@/domain/entities/types/RemboursementMode';
import { GetServiceByInstitutionUseCaseImpl } from '@/domain/use-cases/GetServiceByInstitutionUseCaseImpl';

describe('GetServiceByInstitutionUseCaseImpl', () => {
  let repo: jest.Mocked<ServiceRepository>;
  let usecase: GetServiceByInstitutionUseCaseImpl;

  beforeEach(() => {
    repo = {
      findByInstitution: jest.fn(),
      findByFilters: jest.fn(),
    } as unknown as jest.Mocked<ServiceRepository>;

    usecase = new GetServiceByInstitutionUseCaseImpl(repo);
  });

  it('rejette si institutionId <= 0', async () => {
    await expect(usecase.execute(0)).rejects.toThrow('institutionId invalide');
    await expect(usecase.execute(-1)).rejects.toThrow('institutionId invalide');
    expect(repo.findByInstitution).not.toHaveBeenCalled();
  });

  it('rejette si institutionId est NaN', async () => {
    await expect(usecase.execute(NaN)).rejects.toThrow('institutionId invalide');
    expect(repo.findByInstitution).not.toHaveBeenCalled();
  });

  it('appelle le repository avec le bon id et retourne les services', async () => {
    const services: Service[] = [
      new Service(
        1,
        'Crédit Agricole',
        1000,
        5000,
        'CREDIT' as ServiceType,
        'MENSUEL' as RemboursementMode,
        42,
        10,
        new Date('2025-01-01T00:00:00Z'),
        new Date('2025-09-01T00:00:00Z')
      ),
      new Service(
        2,
        'Épargne Plus',
        0,
        0,
        'EPARGNE' as ServiceType,
        'AUTRE' as RemboursementMode,
        42,
        10,
        new Date('2025-02-01T00:00:00Z'),
        new Date('2025-09-02T00:00:00Z')
      ),
    ];

    repo.findByInstitution.mockResolvedValueOnce(services);

    const result = await usecase.execute(42);

    expect(repo.findByInstitution).toHaveBeenCalledTimes(1);
    expect(repo.findByInstitution).toHaveBeenCalledWith(42);
    expect(result).toEqual(services);
  });

  it('propage les erreurs du repository', async () => {
    repo.findByInstitution.mockRejectedValueOnce(new Error('DB down'));

    await expect(usecase.execute(42)).rejects.toThrow('DB down');
    expect(repo.findByInstitution).toHaveBeenCalledWith(42);
  });

  it('accepte tout nombre fini strictement positif', async () => {
    // le code n’impose pas l’entier — seulement Number.isFinite && > 0
    repo.findByInstitution.mockResolvedValueOnce([]);
    await expect(usecase.execute(3.14)).resolves.toEqual([]);
    expect(repo.findByInstitution).toHaveBeenCalledWith(3.14);
  });
});
