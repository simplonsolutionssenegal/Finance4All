import { GetServiceByInstitutionUseCaseImpl } from '@/domain/use-cases/GetServiceByInstitutionUseCaseImpl';
import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import type { InstitutionService } from '@/domain/entities/InstitutionService';

function makeRepoMock() {
  return {
    institutionExists: jest.fn(),
    findByInstitution: jest.fn(),
    // autres méthodes éventuelles ignorées
  } as unknown as jest.Mocked<ServiceRepository>;
}

describe('GetServiceByInstitutionUseCaseImpl', () => {
  it('lève INSTITUTION_NOT_FOUND si institution inexistante', async () => {
    const repo = makeRepoMock();
    repo.institutionExists.mockResolvedValueOnce(false);

    const uc = new GetServiceByInstitutionUseCaseImpl(repo);
    await expect(uc.execute('inst-404')).rejects.toThrow('INSTITUTION_NOT_FOUND');

    expect(repo.institutionExists).toHaveBeenCalledWith('inst-404');
    expect(repo.findByInstitution).not.toHaveBeenCalled();
  });

  it('retourne les services si institution existe', async () => {
    const repo = makeRepoMock();
    repo.institutionExists.mockResolvedValueOnce(true);

    const services = [{ id: 's1' }, { id: 's2' }] as unknown as InstitutionService[];
    repo.findByInstitution.mockResolvedValueOnce(services);

    const uc = new GetServiceByInstitutionUseCaseImpl(repo);
    const result = await uc.execute('inst-123');

    expect(repo.institutionExists).toHaveBeenCalledWith('inst-123');
    expect(repo.findByInstitution).toHaveBeenCalledWith('inst-123');
    expect(result).toBe(services);
  });

  it('propage les erreurs du repository (autres que not found)', async () => {
    const repo = makeRepoMock();
    repo.institutionExists.mockResolvedValueOnce(true);
    repo.findByInstitution.mockRejectedValueOnce(new Error('DB DOWN'));

    const uc = new GetServiceByInstitutionUseCaseImpl(repo);
    await expect(uc.execute('inst-bug')).rejects.toThrow('DB DOWN');
  });
});
