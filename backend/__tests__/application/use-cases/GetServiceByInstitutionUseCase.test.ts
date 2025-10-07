// __tests__/application/use-cases/GetProductByInstitutionUseCase.test.ts
import type { Product } from '@/domain/entities/Product';
import type { GetProductByInstitutionUseCase } from '@/application/use-cases/GetProductByInstitutionUseCase';
// ⚠️ Adapte le chemin si besoin
import { GetProductByInstitutionUseCaseImpl } from '@/domain/use-cases/GetProductByInstitutionUseCaseImpl';
describe('GetProductByInstitutionUseCaseImpl', () => {
  const mockRepo: {
    institutionExists: jest.Mock<Promise<boolean>, [string]>;
    findByInstitution: jest.Mock<Promise<Product[]>, [string]>;
  } = {
    institutionExists: jest.fn<Promise<boolean>, [string]>(),
    findByInstitution: jest.fn<Promise<Product[]>, [string]>(),
  };

  const INSTITUTION_ID = 'inst-42';

  const makeService = (overrides?: Partial<Product>): Product =>
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
    }) as unknown as Product;

  let useCase: GetProductByInstitutionUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetProductByInstitutionUseCaseImpl(mockRepo as any);
  });

  it('retourne les services et appelle le repo avec le bon id (string)', async () => {
    const expected: Product[] = [makeService({ id: 'svc-a' }), makeService({ id: 'svc-b' })];

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
    const expected: Product[] = [];

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

  it('rejette si institutionId est invalide (implémentations strictes)', async () => {
    await expect(useCase.execute('')).rejects.toThrow();
    expect(mockRepo.findByInstitution).not.toHaveBeenCalled();
  });

  it("rejette 'INSTITUTION_NOT_FOUND' si l'institution n'existe pas", async () => {
    mockRepo.institutionExists.mockResolvedValueOnce(false);

    await expect(useCase.execute(INSTITUTION_ID)).rejects.toMatchObject({
      code: 'INSTITUTION_NOT_FOUND',
    });

    expect(mockRepo.institutionExists).toHaveBeenCalledWith(INSTITUTION_ID);
    expect(mockRepo.findByInstitution).not.toHaveBeenCalled();
  });
});
