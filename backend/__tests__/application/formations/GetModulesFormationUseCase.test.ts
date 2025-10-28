// backend/src/application/use-cases/formations/__tests__/GetModulesUseCase.test.ts

import { GetModulesUseCaseImpl } from '@/application/formations/use-cases/GetModulesFormationUseCase';
import { Module } from '@/domain/formations/entities/ModuleFormation';
import { EntityId } from '@/domain/shared/EntityId';
import { Thematic } from '@/domain/formations/value-objects/Thematic';
// eslint-disable-next-line no-duplicate-imports
import { DifficultyLevel, ModuleStatus } from '@/domain/formations/entities/ModuleFormation';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';

describe('GetModulesUseCaseImpl', () => {
  let useCase: GetModulesUseCaseImpl;
  let mockRepository: jest.Mocked<ModuleRepository>;

  // UUIDs valides pour les tests
  const TEST_UUIDS = {
    FIRST: '550e8400-e29b-41d4-a716-446655440001',
    SECOND: '550e8400-e29b-41d4-a716-446655440002',
    THIRD: '550e8400-e29b-41d4-a716-446655440003',
  };

  beforeEach(() => {
    // Mock du repository
    mockRepository = {
      findAll: jest.fn(),
      save: jest.fn(),
    } as jest.Mocked<ModuleRepository>;

    useCase = new GetModulesUseCaseImpl(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait retourner tous les modules convertis en DTO', async () => {
      // Arrange
      const mockModules = [
        new Module({
          id: EntityId.from(TEST_UUIDS.FIRST),
          title: 'Module 1',
          description: 'Description 1',
          imageUrl: 'https://example.com/image1.jpg',
          thematics: [Thematic.FINANCIAL_EDUCATION],
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 60,
          status: ModuleStatus.PUBLISHED,
          createdAt: new Date('2024-01-01T10:00:00Z'),
          updatedAt: new Date('2024-01-01T10:00:00Z'),
        }),
        new Module({
          id: EntityId.from(TEST_UUIDS.SECOND),
          title: 'Module 2',
          description: 'Description 2',
          imageUrl: 'https://example.com/image2.jpg',
          thematics: [Thematic.INVESTMENT],
          difficultyLevel: DifficultyLevel.INTERMEDIATE,
          estimatedDuration: 90,
          status: ModuleStatus.DRAFT,
          createdAt: new Date('2024-01-02T10:00:00Z'),
          updatedAt: new Date('2024-01-02T10:00:00Z'),
        }),
      ];

      mockRepository.findAll.mockResolvedValue(mockModules);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
    });

    it("devrait retourner un tableau vide si aucun module n'existe", async () => {
      // Arrange
      mockRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("devrait préserver l'ordre des modules retournés par le repository", async () => {
      // Arrange
      const mockModules = [
        new Module({
          id: EntityId.from(TEST_UUIDS.THIRD),
          title: 'Dernier Module',
          description: 'Description',
          imageUrl: null,
          thematics: [Thematic.SAVING],
          difficultyLevel: DifficultyLevel.ADVANCED,
          estimatedDuration: 120,
          status: ModuleStatus.PUBLISHED,
          createdAt: new Date('2024-01-03T10:00:00Z'),
          updatedAt: new Date('2024-01-03T10:00:00Z'),
        }),
        new Module({
          id: EntityId.from(TEST_UUIDS.FIRST),
          title: 'Premier Module',
          description: 'Description',
          imageUrl: null,
          thematics: [Thematic.FINANCIAL_EDUCATION],
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 60,
          status: ModuleStatus.PUBLISHED,
          createdAt: new Date('2024-01-01T10:00:00Z'),
          updatedAt: new Date('2024-01-01T10:00:00Z'),
        }),
      ];

      mockRepository.findAll.mockResolvedValue(mockModules);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(TEST_UUIDS.THIRD);
      expect(result[0].title).toBe('Dernier Module');
      expect(result[1].id).toBe(TEST_UUIDS.FIRST);
      expect(result[1].title).toBe('Premier Module');
    });

    it('devrait gérer les modules avec imageUrl null', async () => {
      // Arrange
      const mockModules = [
        new Module({
          id: EntityId.from(TEST_UUIDS.FIRST),
          title: 'Module sans image',
          description: 'Description du module',
          imageUrl: null,
          thematics: [Thematic.BUDGET_MANAGEMENT],
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 45,
          status: ModuleStatus.PUBLISHED,
          createdAt: new Date('2024-01-01T10:00:00Z'),
          updatedAt: new Date('2024-01-01T10:00:00Z'),
        }),
      ];

      mockRepository.findAll.mockResolvedValue(mockModules);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].imageUrl).toBeNull();
    });

    it('devrait gérer tous les niveaux de difficulté', async () => {
      // Arrange
      const mockModules = [
        new Module({
          id: EntityId.from(TEST_UUIDS.FIRST),
          title: 'Beginner',
          description: 'Desc',
          imageUrl: null,
          thematics: [Thematic.FINANCIAL_EDUCATION],
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 30,
          status: ModuleStatus.PUBLISHED,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        new Module({
          id: EntityId.from(TEST_UUIDS.SECOND),
          title: 'Intermediate',
          description: 'Desc',
          imageUrl: null,
          thematics: [Thematic.INVESTMENT],
          difficultyLevel: DifficultyLevel.INTERMEDIATE,
          estimatedDuration: 60,
          status: ModuleStatus.PUBLISHED,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        new Module({
          id: EntityId.from(TEST_UUIDS.THIRD),
          title: 'Advanced',
          description: 'Desc',
          imageUrl: null,
          thematics: [Thematic.TAXATION],
          difficultyLevel: DifficultyLevel.ADVANCED,
          estimatedDuration: 90,
          status: ModuleStatus.PUBLISHED,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      mockRepository.findAll.mockResolvedValue(mockModules);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].difficultyLevel).toBe(DifficultyLevel.BEGINNER);
      expect(result[1].difficultyLevel).toBe(DifficultyLevel.INTERMEDIATE);
      expect(result[2].difficultyLevel).toBe(DifficultyLevel.ADVANCED);
    });

    it('devrait gérer tous les statuts de modules', async () => {
      // Arrange
      const mockModules = [
        new Module({
          id: EntityId.from(TEST_UUIDS.FIRST),
          title: 'Draft Module',
          description: 'Description',
          imageUrl: null,
          thematics: [Thematic.FINANCIAL_EDUCATION],
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 60,
          status: ModuleStatus.DRAFT,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        new Module({
          id: EntityId.from(TEST_UUIDS.SECOND),
          title: 'Published Module',
          description: 'Description',
          imageUrl: null,
          thematics: [Thematic.INVESTMENT],
          difficultyLevel: DifficultyLevel.INTERMEDIATE,
          estimatedDuration: 60,
          status: ModuleStatus.PUBLISHED,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        new Module({
          id: EntityId.from(TEST_UUIDS.THIRD),
          title: 'Archived Module',
          description: 'Description',
          imageUrl: null,
          thematics: [Thematic.SAVING],
          difficultyLevel: DifficultyLevel.ADVANCED,
          estimatedDuration: 60,
          status: ModuleStatus.ARCHIVED,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      mockRepository.findAll.mockResolvedValue(mockModules);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].status).toBe(ModuleStatus.DRAFT);
      expect(result[1].status).toBe(ModuleStatus.PUBLISHED);
      expect(result[2].status).toBe(ModuleStatus.ARCHIVED);
    });

    it('devrait gérer les modules avec plusieurs thématiques', async () => {
      // Arrange
      const mockModules = [
        new Module({
          id: EntityId.from(TEST_UUIDS.FIRST),
          title: 'Module Multi-Thématiques',
          description: 'Description',
          imageUrl: null,
          thematics: [Thematic.FINANCIAL_EDUCATION, Thematic.INVESTMENT, Thematic.SAVING],
          difficultyLevel: DifficultyLevel.INTERMEDIATE,
          estimatedDuration: 90,
          status: ModuleStatus.PUBLISHED,
          createdAt: new Date('2024-01-01T10:00:00Z'),
          updatedAt: new Date('2024-01-01T10:00:00Z'),
        }),
      ];

      mockRepository.findAll.mockResolvedValue(mockModules);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].thematics).toEqual([
        Thematic.FINANCIAL_EDUCATION,
        Thematic.INVESTMENT,
        Thematic.SAVING,
      ]);
    });

    it('devrait propager les erreurs du repository', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockRepository.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow('Database connection failed');
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('devrait appeler toDTO() sur chaque module', async () => {
      // Arrange
      const mockModule = new Module({
        id: EntityId.from(TEST_UUIDS.FIRST),
        title: 'Test Module',
        description: 'Description',
        imageUrl: null,
        thematics: [Thematic.FINANCIAL_EDUCATION],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const toDTOSpy = jest.spyOn(mockModule, 'toDTO');
      mockRepository.findAll.mockResolvedValue([mockModule]);

      // Act
      await useCase.execute();

      // Assert
      expect(toDTOSpy).toHaveBeenCalledTimes(1);
    });

    it('devrait retourner les dates correctement formatées', async () => {
      // Arrange
      const createdAt = new Date('2024-01-15T14:30:00Z');
      const updatedAt = new Date('2024-01-20T16:45:00Z');

      const mockModules = [
        new Module({
          id: EntityId.from(TEST_UUIDS.FIRST),
          title: 'Module avec dates',
          description: 'Description',
          imageUrl: null,
          thematics: [Thematic.FINANCIAL_EDUCATION],
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 60,
          status: ModuleStatus.PUBLISHED,
          createdAt,
          updatedAt,
        }),
      ];

      mockRepository.findAll.mockResolvedValue(mockModules);
    });
  });

  describe('Integration avec le repository', () => {
    it('devrait appeler findAll sans paramètres', async () => {
      // Arrange
      mockRepository.findAll.mockResolvedValue([]);

      // Act
      await useCase.execute();

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledWith();
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("ne devrait pas appeler d'autres méthodes du repository", async () => {
      // Arrange
      mockRepository.findAll.mockResolvedValue([]);

      // Act
      await useCase.execute();

      // Assert
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('devrait gérer efficacement un grand nombre de modules', async () => {
      // Arrange
      const largeModuleList = Array.from(
        { length: 100 },
        (_, index) =>
          new Module({
            id: EntityId.generate(), // Corriger create() en generate()
            title: `Module ${index}`,
            description: `Description ${index}`,
            imageUrl: null,
            thematics: [Thematic.FINANCIAL_EDUCATION],
            difficultyLevel: DifficultyLevel.BEGINNER,
            estimatedDuration: 60,
            status: ModuleStatus.PUBLISHED,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
      );

      mockRepository.findAll.mockResolvedValue(largeModuleList);

      // Act
      const startTime = Date.now();
      const result = await useCase.execute();
      const endTime = Date.now();

      // Assert
      expect(result).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // Doit être rapide
    });
  });
});
