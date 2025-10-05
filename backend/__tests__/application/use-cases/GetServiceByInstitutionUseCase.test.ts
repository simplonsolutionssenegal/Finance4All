// __tests__/application/use-cases/GetServiceByInstitutionUseCase.test.ts
import type { InstitutionService } from '@/domain/entities/InstitutionService';
import type { GetServiceByInstitutionUseCase } from '@/application/use-cases/GetServiceByInstitutionUseCase';
// ⚠️ Adapte le chemin si besoin
import { GetServiceByInstitutionUseCaseImpl } from '@/domain/use-cases/GetServiceByInstitutionUseCaseImpl';
describe('GetServiceByInstitutionUseCaseImpl', () => {
  // Le repo réel appelé par l’implémentation s’appelle "serviceRepo" et expose:
  // - institutionExists(institutionId: string): Promise<boolean>
  // - findByInstitution(institutionId: string): Promise<InstitutionService[]>
  const mockRepo: {
    institutionExists: jest.Mock<Promise<boolean>, [string]>;
    findByInstitution: jest.Mock<Promise<InstitutionService[]>, [string]>;
  } = {
    institutionExists: jest.fn<Promise<boolean>, [string]>(),
    findByInstitution: jest.fn<Promise<InstitutionService[]>, [string]>(),
  };

  const INSTITUTION_ID = 'inst-42';

  // Si InstitutionService est une classe, remplace par `new InstitutionService(...)`
  const makeService = (overrides?: Partial<InstitutionService>): InstitutionService =>
    ({
      id: 'svc-1',
      designation: 'Produit X',
      montantMin: 1000,
      montantMax: 5000,
      type: 'CREDIT',
      remboursementMode: 'AGENCE',
      institutionId: INSTITUTION_ID,
      zoneId: 'Z1',
      createdAt: new Date('2025-09-01T00:00:00Z'),
      updatedAt: new Date('2025-09-01T00:00:00Z'),
      ...overrides,
    }) as unknown as InstitutionService;

  let useCase: GetServiceByInstitutionUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetServiceByInstitutionUseCaseImpl(mockRepo as any);
  });

  it('retourne les services et appelle le repo avec le bon id (string)', async () => {
    const expected: InstitutionService[] = [
      makeService({ id: 'svc-a' }),
      makeService({ id: 'svc-b' }),
    ];

    mockRepo.institutionExists.mockResolvedValueOnce(true);
    mockRepo.findByInstitution.mockResolvedValueOnce(expected);

    const result = await useCase.execute(INSTITUTION_ID);

    expect(mockRepo.institutionExists).toHaveBeenCalledTimes(1);
    expect(mockRepo.institutionExists).toHaveBeenCalledWith(INSTITUTION_ID);

    expect(mockRepo.findByInstitution).toHaveBeenCalledTimes(1);
    expect(mockRepo.findByInstitution).toHaveBeenCalledWith(INSTITUTION_ID);

    expect(result).toEqual(expected);
  });

  it('retourne [] quand le repo ne trouve rien', async () => {
    const expected: InstitutionService[] = [];

    mockRepo.institutionExists.mockResolvedValueOnce(true);
    mockRepo.findByInstitution.mockResolvedValueOnce(expected);

    const result = await useCase.execute(INSTITUTION_ID);

    expect(mockRepo.institutionExists).toHaveBeenCalledWith(INSTITUTION_ID);
    expect(mockRepo.findByInstitution).toHaveBeenCalledWith(INSTITUTION_ID);
    expect(result).toEqual([]);
  });

  it('propage les erreurs du repository', async () => {
    mockRepo.institutionExists.mockResolvedValueOnce(true);
    mockRepo.findByInstitution.mockRejectedValueOnce(new Error('DB down'));

    await expect(useCase.execute(INSTITUTION_ID)).rejects.toThrow('DB down');

    expect(mockRepo.institutionExists).toHaveBeenCalledWith(INSTITUTION_ID);
    expect(mockRepo.findByInstitution).toHaveBeenCalledWith(INSTITUTION_ID);
  });

  // Active ce test seulement si ton implémentation valide l’ID avant l’appel repo
  it('rejette si institutionId est invalide (implémentations strictes)', async () => {
    await expect(useCase.execute('')).rejects.toThrow();
    // selon ton implémentation, institutionExists peut ne PAS être appelé :
    // ici on n’impose rien; on s’assure surtout qu’aucun accès data n’est fait.
    expect(mockRepo.findByInstitution).not.toHaveBeenCalled();
  });

  it("rejette 'INSTITUTION_NOT_FOUND' si l'institution n'existe pas", async () => {
    mockRepo.institutionExists.mockResolvedValueOnce(false);

    await expect(useCase.execute(INSTITUTION_ID)).rejects.toThrow('INSTITUTION_NOT_FOUND');

    expect(mockRepo.institutionExists).toHaveBeenCalledWith(INSTITUTION_ID);
    expect(mockRepo.findByInstitution).not.toHaveBeenCalled();
  });
});
