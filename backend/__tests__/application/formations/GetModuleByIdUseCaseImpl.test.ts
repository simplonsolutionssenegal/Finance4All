import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import { EntityId } from '@/domain/shared/EntityId';
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
      findByThematic: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    } as any;

    useCase = new GetModuleByIdUseCaseImpl(mockRepository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('execute(query)', () => {
    it('devrait retourner le DTO du module quand il existe', async () => {
      // Arrange
      const domainModule = new Module({
        id: EntityId.from(moduleId),
        title: 'Module de test',
        description: 'Description complète du module',
        imageMediaId: 'image-123',
        thematics: 'finance et comptabilité',
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
        imageMediaId: 'image-123',
        thematics: 'finance et comptabilité',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 120,
        status: ModuleStatus.PUBLISHED,
        lessons: [],
        quizzes: [],
        quizzesGlobal: [], // ✅ Ajouté par le use case
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('devrait retourner un module avec imageMediaId null', async () => {
      const domainModule = new Module({
        id: EntityId.from(moduleId),
        title: 'Module simple',
        description: 'Description',
        imageMediaId: null,
        thematics: 'épargne',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
      });

      mockRepository.findById.mockResolvedValue(domainModule);

      const result = await useCase.execute({ id: moduleId });

      expect(result.imageMediaId).toBeNull();
      expect(result.thematics).toBe('épargne');
    });

    it('devrait retourner un module avec différentes thématiques', async () => {
      const thematics = [
        'finance et comptabilité',
        'investissement',
        'épargne',
        'gestion de budget',
        'entrepreneuriat',
        'assurance',
      ];

      for (const thematic of thematics) {
        const domainModule = new Module({
          id: EntityId.from(moduleId),
          title: `Module ${thematic}`,
          description: 'Description',
          imageMediaId: null,
          thematics: thematic,
          difficultyLevel: DifficultyLevel.INTERMEDIATE,
          estimatedDuration: 90,
          status: ModuleStatus.PUBLISHED,
          lessons: [],
          quizzes: [],
        });

        mockRepository.findById.mockResolvedValue(domainModule);

        const result = await useCase.execute({ id: moduleId });

        expect(result.thematics).toBe(thematic);
      }
    });

    it('devrait gérer tous les niveaux de difficulté', async () => {
      const difficulties = [
        DifficultyLevel.BEGINNER,
        DifficultyLevel.INTERMEDIATE,
        DifficultyLevel.ADVANCED,
        DifficultyLevel.EXPERT,
      ];

      for (const difficulty of difficulties) {
        const domainModule = new Module({
          id: EntityId.from(moduleId),
          title: `Module ${difficulty}`,
          description: 'Description',
          imageMediaId: null,
          thematics: 'finance et comptabilité',
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
        const domainModule = new Module({
          id: EntityId.from(moduleId),
          title: `Module ${status}`,
          description: 'Description',
          imageMediaId: null,
          thematics: 'investissement',
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
        const domainModule = new Module({
          id: EntityId.from(moduleId),
          title: `Module ${duration}min`,
          description: 'Description',
          imageMediaId: null,
          thematics: 'assurance',
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

    it('devrait inclure quizzesGlobal vide si aucun quiz', async () => {
      const domainModule = new Module({
        id: EntityId.from(moduleId),
        title: 'Module sans quiz',
        description: 'Description',
        imageMediaId: null,
        thematics: 'finance et comptabilité',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
      });

      mockRepository.findById.mockResolvedValue(domainModule);

      const result = await useCase.execute({ id: moduleId });

      expect(result.quizzesGlobal).toEqual([]);
      expect(result.quizzes).toEqual([]);
    });
  });

  describe('Cas limites et edge cases', () => {
    it('devrait gérer un titre très long', async () => {
      const longTitle = 'A'.repeat(200); // Maximum autorisé

      const domainModule = new Module({
        id: EntityId.from(moduleId),
        title: longTitle,
        description: 'Description',
        imageMediaId: null,
        thematics: 'assurance',
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

      const domainModule = new Module({
        id: EntityId.from(moduleId),
        title: 'Module test',
        description: longDescription,
        imageMediaId: null,
        thematics: 'épargne',
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

    it('devrait gérer un imageMediaId très long', async () => {
      const longMediaId = `media-${'a'.repeat(200)}`;

      const domainModule = new Module({
        id: EntityId.from(moduleId),
        title: 'Module avec long mediaId',
        description: 'Description',
        imageMediaId: longMediaId,
        thematics: 'investissement',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
        lessons: [],
        quizzes: [],
      });

      mockRepository.findById.mockResolvedValue(domainModule);

      const result = await useCase.execute({ id: moduleId });

      expect(result.imageMediaId).toBe(longMediaId);
    });

    it('devrait appeler toDTO() une seule fois', async () => {
      const domainModule = new Module({
        id: EntityId.from(moduleId),
        title: 'Module test',
        description: 'Description',
        imageMediaId: null,
        thematics: 'finance et comptabilité',
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
