import { GetDataInstitutionUseCaseImpl } from '@/application/institutions/use-cases/GetDataInstitutionUseCaseImpl';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';

describe('GetDataInstitutionUseCaseImpl', () => {
  let useCase: GetDataInstitutionUseCaseImpl;
  let mockRepository: jest.Mocked<InstitutionRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      getStats: jest.fn(),
    } as any;

    useCase = new GetDataInstitutionUseCaseImpl(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return institution stats from repository', async () => {
    const stats = {
      total: 25,
      active: 10,
      inactive: 7,
      pending: 8,
      archived: 0,
    };

    mockRepository.getStats.mockResolvedValue(stats);

    const result = await useCase.execute({});

    expect(mockRepository.getStats).toHaveBeenCalledTimes(1);
    expect(result).toEqual(stats);
  });

  it('should propagate repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.getStats.mockRejectedValue(error);

    await expect(useCase.execute({})).rejects.toThrow('Database error');
    expect(mockRepository.getStats).toHaveBeenCalledTimes(1);
  });
});
