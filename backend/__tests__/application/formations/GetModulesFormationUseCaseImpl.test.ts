import { GetModulesFormationUseCaseImpl } from '@/application/formations/use-cases/GetModulesFormationUseCaseImpl';
import {
  Module,
  DifficultyLevel,
  ModuleStatus,
} from '@/domain/formations/entities/ModuleFormation';
import { EntityId } from '@/domain/shared/EntityId';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';

describe('GetModulesFormationUseCaseImpl', () => {
  let useCase: GetModulesFormationUseCaseImpl;
  let mockRepository: jest.Mocked<ModuleRepository>;

  const TEST_UUIDS = {
    A: '550e8400-e29b-41d4-a716-446655440001',
    B: '550e8400-e29b-41d4-a716-446655440002',
    C: '550e8400-e29b-41d4-a716-446655440003',
  };

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      save: jest.fn(),
      findByTitle: jest.fn(),
      findByThematic: jest.fn(),
    } as unknown as jest.Mocked<ModuleRepository>;

    useCase = new GetModulesFormationUseCaseImpl(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait retourner les modules mappés en DTO avec pagination', async () => {
      // Arrange
      const modules = [
        new Module({
          id: EntityId.from(TEST_UUIDS.A),
          title: 'Finance pour débutants',
          description: 'Introduction aux finances',
          imageMediaId: 'image-1',
          thematics: 'finance et comptabilité',
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 30,
          status: ModuleStatus.DRAFT,
        }),
        new Module({
          id: EntityId.from(TEST_UUIDS.B),
          title: 'Investissement avancé',
          description: "Stratégies d'investissement",
          imageMediaId: null,
          thematics: 'investissement',
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

      // Act
      const result = await useCase.execute({ page: 1, limit: 10 });

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual(
        expect.objectContaining({
          id: TEST_UUIDS.A,
          title: 'Finance pour débutants',
          thematics: 'finance et comptabilité',
        })
      );
      expect(result.data[1]).toEqual(
        expect.objectContaining({
          id: TEST_UUIDS.B,
          title: 'Investissement avancé',
          thematics: 'investissement',
        })
      );
      expect(result.pagination).toEqual(paginated.pagination);
    });

    it('devrait retourner une liste vide avec pagination si aucun module', async () => {
      // Arrange
      const emptyResult = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };

      mockRepository.findAll.mockResolvedValue(emptyResult as any);

      // Act
      const result = await useCase.execute({ page: 1, limit: 10 });

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('devrait gérer la pagination correctement (page 2)', async () => {
      // Arrange
      const modules = [
        new Module({
          id: EntityId.from(TEST_UUIDS.C),
          title: 'Module page 2',
          description: 'Description page 2',
          imageMediaId: null,
          thematics: 'entrepreneuriat',
          difficultyLevel: DifficultyLevel.INTERMEDIATE,
          estimatedDuration: 60,
          status: ModuleStatus.PUBLISHED,
        }),
      ];

      const paginated = {
        data: modules,
        pagination: { page: 2, limit: 5, total: 11, totalPages: 3 },
      };

      mockRepository.findAll.mockResolvedValue(paginated as any);

      // Act
      const result = await useCase.execute({ page: 2, limit: 5 });

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 2, limit: 5 });
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBe(11);
      expect(result.pagination.totalPages).toBe(3);
    });

    it('devrait mapper correctement tous les champs du DTO', async () => {
      // Arrange
      const module = new Module({
        id: EntityId.from(TEST_UUIDS.A),
        title: 'Module Complet',
        description: 'Description complète du module',
        imageMediaId: 'image-123',
        thematics: 'gestion de projet',
        difficultyLevel: DifficultyLevel.EXPERT,
        estimatedDuration: 120,
        lessons: [],
        quizzes: [],
       
        status: ModuleStatus.DRAFT,
      }),
      new Module({
        id: EntityId.from(TEST_UUIDS.B),
        title: 'M2',
        description: 'd2',
        imageMediaId: null,
        thematics: 'investissement',
        difficultyLevel: DifficultyLevel.ADVANCED,
        lessons: [],
        quizzes: [],
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-15T14:30:00Z'),
      });

      const paginated = {
        data: [module],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockRepository.findAll.mockResolvedValue(paginated as any);

      // Act
      const result = await useCase.execute({ page: 1, limit: 10 });

      // Assert
      const dto = result.data[0];
      expect(dto.id).toBe(TEST_UUIDS.A);
      expect(dto.title).toBe('Module Complet');
      expect(dto.description).toBe('Description complète du module');
      expect(dto.imageMediaId).toBe('image-123');
      expect(dto.thematics).toBe('gestion de projet');
      expect(dto.difficultyLevel).toBe(DifficultyLevel.EXPERT);
      expect(dto.estimatedDuration).toBe(120);
      expect(dto.status).toBe(ModuleStatus.PUBLISHED);
      expect(dto.createdAt).toEqual(new Date('2024-01-01T10:00:00Z'));
      expect(dto.updatedAt).toEqual(new Date('2024-01-15T14:30:00Z'));
    });

    it('devrait propager les erreurs du repository', async () => {
      // Arrange
      const dbError = new Error('Database connection error');
      mockRepository.findAll.mockRejectedValue(dbError);

      // Act & Assert
      await expect(useCase.execute({ page: 1, limit: 10 })).rejects.toThrow(
        'Database connection error'
      );
      expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('devrait gérer différentes tailles de limite', async () => {
      // Arrange
      const modules = Array.from(
        { length: 50 },
        (_, i) =>
          new Module({
            id: EntityId.from(`550e8400-e29b-41d4-a716-4466554400${String(i).padStart(2, '0')}`),
            title: `Module ${i + 1}`,
            description: `Description ${i + 1}`,
            imageMediaId: null,
            thematics: 'finance',
            difficultyLevel: DifficultyLevel.BEGINNER,
            estimatedDuration: 30,
            status: ModuleStatus.DRAFT,
          })
      );

      const paginated = {
        data: modules.slice(0, 50),
        pagination: { page: 1, limit: 50, total: 100, totalPages: 2 },
      };

      mockRepository.findAll.mockResolvedValue(paginated as any);

      // Act
      const result = await useCase.execute({ page: 1, limit: 50 });

      // Assert
      expect(result.data).toHaveLength(50);
      expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 50 });
    });
  });

  describe('Constructor', () => {
    it('devrait instancier correctement avec le repository', () => {
      // Act
      const instance = new GetModulesFormationUseCaseImpl(mockRepository);

      // Assert
      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(GetModulesFormationUseCaseImpl);
    });
  });
});
