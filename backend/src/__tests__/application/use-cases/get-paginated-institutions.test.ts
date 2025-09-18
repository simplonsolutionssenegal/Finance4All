import { GetPaginatedInstitutionsFinancieresUseCase } from '@/application/use-cases/GetPaginatedInstitutionsFinancieresUseCase';
import type { InstitutionFinanciere } from '@/domain/entities/InstitutionFinanciere';

describe('GetPaginatedInstitutionsFinancieresUseCase', () => {
  const makeRepo = () => {
    return {
      // la use case cast le repo en any et appelle findPaginated(skip, limit)
      findPaginated: jest.fn(),
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('page/limit par défaut, total = 0 ⇒ totalPages=1, hasNext=false, hasPrev=false', async () => {
    const repo = makeRepo();
    const data: InstitutionFinanciere[] = [] as unknown as InstitutionFinanciere[];
    (repo.findPaginated as jest.Mock).mockResolvedValueOnce({ data, total: 0 });

    // @ts-expect-error: l’interface ne déclare pas findPaginated, la use case cast en any
    const uc = new GetPaginatedInstitutionsFinancieresUseCase(repo);

    const result = await uc.execute({}); // pas de page/limit => défauts

    // vérifie l’appel (skip=0, limit=10)
    expect(repo.findPaginated).toHaveBeenCalledWith(0, 10);

    expect(result.data).toEqual(data);
    expect(result.meta).toEqual({
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    });
  });

  it('page=2, limit=10, total=25 ⇒ totalPages=3, hasNext=true, hasPrev=true', async () => {
    const repo = makeRepo();
    const data = [{ id: 'a' }] as unknown as InstitutionFinanciere[];
    (repo.findPaginated as jest.Mock).mockResolvedValueOnce({ data, total: 25 });

    // @ts-expect-error voir plus haut
    const uc = new GetPaginatedInstitutionsFinancieresUseCase(repo);

    const result = await uc.execute({ page: 2, limit: 10 });

    // skip=(2-1)*10=10
    expect(repo.findPaginated).toHaveBeenCalledWith(10, 10);

    expect(result.data).toEqual(data);
    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      totalItems: 25,
      totalPages: 3,
      hasNextPage: true,  // 2 < 3
      hasPrevPage: true,  // 2 > 1
    });
  });

  it('limit > 100 ⇒ retombe à 10 (cap), total=101 ⇒ totalPages=11, hasNext=true, hasPrev=false en page=1', async () => {
    const repo = makeRepo();
    const data = [] as unknown as InstitutionFinanciere[];
    (repo.findPaginated as jest.Mock).mockResolvedValueOnce({ data, total: 101 });

    // @ts-expect-error voir plus haut
    const uc = new GetPaginatedInstitutionsFinancieresUseCase(repo);

    const result = await uc.execute({ page: 1, limit: 500 }); // limit invalide

    // limit capée à 10, skip=0
    expect(repo.findPaginated).toHaveBeenCalledWith(0, 10);

    expect(result.meta).toEqual({
      page: 1,
      limit: 10,         // cap appliqué
      totalItems: 101,
      totalPages: 11,    // ceil(101/10)
      hasNextPage: true, // 1 < 11
      hasPrevPage: false // 1 > 1 → false
    });
  });
});
