import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import { EntityId } from '@/domain/shared/EntityId';
import { Thematic } from '@/domain/formations/value-objects/Thematic';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { randomUUID } from 'crypto';
import { GetModuleByIdUseCaseImpl } from '@/application/formations/use-cases/GetModuleByIdUseCaseImpl';
import {
  DifficultyLevel,
  Module,
  ModuleStatus,
} from '@/domain/formations/entities/ModuleFormation';

describe('GetModuleByIdUseCaseImpl — tests avec couverture 100%', () => {
  let useCase: GetModuleByIdUseCaseImpl;
  let mockRepository: jest.Mocked<ModuleRepository>;
  let moduleId: string;

  beforeEach(() => {
    moduleId = randomUUID();

    mockRepository = {
      findById: jest.fn(),
      findByTitle: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new GetModuleByIdUseCaseImpl(mockRepository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('execute(query)', () => {
    it('devrait retourner le DTO du module quand il existe', async () => {
      // Arrange
      const domainModule = Module.create({
        id: EntityId.from(moduleId),
        title: 'Module de test',
        description: 'Description complète du module',
        imageUrl: 'https://example.com/image.jpg',
        thematics: [Thematic.FINANCIAL_EDUCATION, Thematic.INVESTMENT],
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 120,
        status: ModuleStatus.PUBLISHED,
        lessons: [],
        quizzes: [],
      });

      mockRepository.findById.mockResolvedValue(domainModule);

      // Act
      const result = await useCase.execute({ id: moduleId });

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(moduleId);
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        id: moduleId,
        title: 'Module de test',
        description: 'Description complète du module',
        imageUrl: 'https://example.com/image.jpg',
        thematics: [Thematic.FINANCIAL_EDUCATION, Thematic.INVESTMENT],
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 120,
        status: ModuleStatus.PUBLISHED,
        lessons: [],
        quizzes: [],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('devrait retourner un module avec une seule thématique', async () => {
      const domainModule = Module.create({
        id: EntityId.from(moduleId),
        title: 'Module simple',
        description: 'Description',
        imageUrl: null,
        thematics: [Thematic.SAVING],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
      });

      mockRepository.findById.mockResolvedValue(domainModule);

      const result = await useCase.execute({ id: moduleId });

      expect(result.thematics).toEqual([Thematic.SAVING]);
      expect(result.thematics).toHaveLength(1);
    });

    it('devrait retourner un module avec toutes les thématiques possibles', async () => {
      const allThematics = [
        Thematic.FINANCIAL_EDUCATION,
        Thematic.INVESTMENT,
        Thematic.SAVING,
        Thematic.BUDGET_MANAGEMENT,
        Thematic.ENTREPRENEURSHIP,
        Thematic.INSURANCE,
      ];

      const domainModule = Module.create({
        id: EntityId.from(moduleId),
        title: 'Module complet',
        description: 'Toutes les thématiques',
        imageUrl: 'https://example.com/complete.jpg',
        thematics: allThematics,
        difficultyLevel: DifficultyLevel.EXPERT,
        estimatedDuration: 300,
        status: ModuleStatus.PUBLISHED,
        lessons: [],
        quizzes: [],
      });

      mockRepository.findById.mockResolvedValue(domainModule);

      const result = await useCase.execute({ id: moduleId });

      expect(result.thematics).toEqual(allThematics);
      expect(result.thematics).toHaveLength(allThematics.length);
    });

    it('devrait gérer tous les niveaux de difficulté', async () => {
      const difficulties = [
        DifficultyLevel.BEGINNER,
        DifficultyLevel.INTERMEDIATE,
        DifficultyLevel.ADVANCED,
        DifficultyLevel.EXPERT,
      ];

      for (const difficulty of difficulties) {
        const domainModule = Module.create({
          id: EntityId.from(moduleId),
          title: `Module ${difficulty}`,
          description: 'Description',
          imageUrl: null,
          thematics: [Thematic.FINANCIAL_EDUCATION],
          difficultyLevel: difficulty,
          estimatedDuration: 90,
          status: ModuleStatus.PUBLISHED,
          lessons: [],
          quizzes: [],
        });

        mockRepository.findById.mockResolvedValue(domainModule);

        const result = await useCase.execute({ id: moduleId });

        expect(result.difficultyLevel).toBe(difficulty);
      }
    });

    it('devrait gérer tous les statuts de module', async () => {
      const statuses = [ModuleStatus.DRAFT, ModuleStatus.PUBLISHED, ModuleStatus.ARCHIVED];

      for (const status of statuses) {
        const domainModule = Module.create({
          id: EntityId.from(moduleId),
          title: `Module ${status}`,
          description: 'Description',
          imageUrl: null,
          thematics: [Thematic.INVESTMENT],
          difficultyLevel: DifficultyLevel.INTERMEDIATE,
          estimatedDuration: 60,
          status,
          lessons: [],
          quizzes: [],
        });

        mockRepository.findById.mockResolvedValue(domainModule);

        const result = await useCase.execute({ id: moduleId });

        expect(result.status).toBe(status);
      }
    });

    it('devrait retourner un module sans imageUrl (null)', async () => {
      const domainModule = Module.create({
        id: EntityId.from(moduleId),
        title: 'Module sans image',
        description: 'Description',
        imageUrl: null,
        thematics: [Thematic.BUDGET_MANAGEMENT],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 45,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
      });

      mockRepository.findById.mockResolvedValue(domainModule);

      const result = await useCase.execute({ id: moduleId });

      expect(result.imageUrl).toBeNull();
    });

    it("devrait lever une NotFoundError si le module n'existe pas", async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute({ id: moduleId })).rejects.toThrow(NotFoundError);

      await expect(useCase.execute({ id: moduleId })).rejects.toThrow(
        `module with id ${moduleId} not found`
      );

      expect(mockRepository.findById).toHaveBeenCalledWith(moduleId);
      expect(mockRepository.findById).toHaveBeenCalledTimes(2);
    });

    it('devrait lever une NotFoundError avec un ID différent', async () => {
      const differentId = randomUUID();
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute({ id: differentId })).rejects.toThrow(
        `module with id ${differentId} not found`
      );

      expect(mockRepository.findById).toHaveBeenCalledWith(differentId);
    });

    it('devrait propager les erreurs du repository', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockRepository.findById.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute({ id: moduleId })).rejects.toThrow('Database connection failed');

      expect(mockRepository.findById).toHaveBeenCalledWith(moduleId);
    });

    it('devrait propager les erreurs de type différent', async () => {
      const error = new Error('Timeout error');
      mockRepository.findById.mockRejectedValue(error);

      await expect(useCase.execute({ id: moduleId })).rejects.toThrow('Timeout error');
    });

    it('devrait gérer les modules avec des durées variées', async () => {
      const durations = [15, 30, 60, 120, 240, 360];

      for (const duration of durations) {
        const domainModule = Module.create({
          id: EntityId.from(moduleId),
          title: `Module ${duration}min`,
          description: 'Description',
          imageUrl: null,
          thematics: [Thematic.INSURANCE],
          difficultyLevel: DifficultyLevel.INTERMEDIATE,
          estimatedDuration: duration,
          status: ModuleStatus.PUBLISHED,
          lessons: [],
          quizzes: [],
        });

        mockRepository.findById.mockResolvedValue(domainModule);

        const result = await useCase.execute({ id: moduleId });

        expect(result.estimatedDuration).toBe(duration);
      }
    });
  });

  describe('Cas limites et edge cases', () => {
    it('devrait gérer un titre très long', async () => {
      const longTitle = 'A'.repeat(200); // Maximum autorisé

      const domainModule = Module.create({
        id: EntityId.from(moduleId),
        title: longTitle,
        description: 'Description',
        imageUrl: null,
        thematics: [Thematic.INSURANCE],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
      });

      mockRepository.findById.mockResolvedValue(domainModule);

      const result = await useCase.execute({ id: moduleId });

      expect(result.title).toBe(longTitle);
      expect(result.title.length).toBe(200);
    });

    it('devrait gérer une description très longue', async () => {
      const longDescription = 'Lorem ipsum '.repeat(100);

      const domainModule = Module.create({
        id: EntityId.from(moduleId),
        title: 'Module test',
        description: longDescription,
        imageUrl: null,
        thematics: [Thematic.SAVING],
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 60,
        status: ModuleStatus.PUBLISHED,
        lessons: [],
        quizzes: [],
      });

      mockRepository.findById.mockResolvedValue(domainModule);

      const result = await useCase.execute({ id: moduleId });

      expect(result.description).toBe(longDescription);
    });

    it("devrait gérer une URL d'image très longue", async () => {
      const longUrl = `https://example.com/images/${'a'.repeat(200)}.jpg`;

      const domainModule = Module.create({
        id: EntityId.from(moduleId),
        title: 'Module avec longue URL',
        description: 'Description',
        imageUrl: longUrl,
        thematics: [Thematic.INVESTMENT],
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
        lessons: [],
        quizzes: [],
      });

      mockRepository.findById.mockResolvedValue(domainModule);

      const result = await useCase.execute({ id: moduleId });

      expect(result.imageUrl).toBe(longUrl);
    });

    it('devrait appeler toDTO() une seule fois', async () => {
      const domainModule = Module.create({
        id: EntityId.from(moduleId),
        title: 'Module test',
        description: 'Description',
        imageUrl: null,
        thematics: [Thematic.FINANCIAL_EDUCATION],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
      });

      const toDtoSpy = jest.spyOn(domainModule, 'toDTO');
      mockRepository.findById.mockResolvedValue(domainModule);

      await useCase.execute({ id: moduleId });

      expect(toDtoSpy).toHaveBeenCalledTimes(1);
    });
  });
});
