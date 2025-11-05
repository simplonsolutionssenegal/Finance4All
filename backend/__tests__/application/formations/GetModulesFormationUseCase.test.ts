import { GetModulesUseCaseImpl } from '@/application/formations/use-cases/GetModulesFormationUseCase';
import {
  Module,
  DifficultyLevel,
  ModuleStatus,
} from '@/domain/formations/entities/ModuleFormation';
import { EntityId } from '@/domain/shared/EntityId';
import { Thematic } from '@/domain/formations/value-objects/Thematic';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';

describe('GetModulesUseCaseImpl', () => {
  let useCase: GetModulesUseCaseImpl;
  let mockRepository: jest.Mocked<ModuleRepository>;

  const TEST_UUIDS = {
    A: '550e8400-e29b-41d4-a716-446655440001',
    B: '550e8400-e29b-41d4-a716-446655440002',
  };

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      save: jest.fn(),
      findByTitle: jest.fn(),
    } as unknown as jest.Mocked<ModuleRepository>;

    useCase = new GetModulesUseCaseImpl(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('retourne les modules mappés en DTO et transmet la pagination', async () => {
    const modules = [
      new Module({
        id: EntityId.from(TEST_UUIDS.A),
        title: 'M1',
        description: 'd1',
        imageUrl: null,
        thematics: [Thematic.FINANCIAL_EDUCATION],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
        status: ModuleStatus.DRAFT,
      }),
      new Module({
        id: EntityId.from(TEST_UUIDS.B),
        title: 'M2',
        description: 'd2',
        imageUrl: null,
        thematics: [Thematic.INVESTMENT],
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
      }),
    ];

    const paginated = {
      data: modules,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    };

    mockRepository.findAll.mockResolvedValue(paginated as any);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual(expect.objectContaining({ id: TEST_UUIDS.A, title: 'M1' }));
    expect(result.pagination).toEqual(paginated.pagination);
  });

  it('propague les erreurs du repository', async () => {
    mockRepository.findAll.mockRejectedValue(new Error('db error'));
    await expect(useCase.execute({ page: 1, limit: 10 })).rejects.toThrow('db error');
  });
});
