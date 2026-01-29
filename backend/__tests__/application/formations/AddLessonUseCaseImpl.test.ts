// application/formations/use-cases/__tests__/AddLessonUseCaseImpl.test.ts

import { AddLessonUseCaseImpl } from '@/application/formations/use-cases/AddLessonUseCaseImpl';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import type { AddLessonCommand } from '@/domain/formations/ports/in/AddLessonUseCase';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { EntityId } from '@/domain/shared/EntityId';
import {
  Module,
  ModuleStatus,
  DifficultyLevel,
} from '@/domain/formations/entities/ModuleFormation';
import { LessonStatus } from '@/domain/formations/entities/Lesson';
import { Chapter } from '@/domain/formations/entities/Chapter';

describe('AddLessonUseCaseImpl', () => {
  let useCase: AddLessonUseCaseImpl;
  let mockModuleRepository: jest.Mocked<ModuleRepository>;
  let mockModule: Module;
  const moduleId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    // Mock du repository
    mockModuleRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as any;

    // Créer un module de test
    mockModule = new Module({
      id: EntityId.from(moduleId),
      title: 'Module de test',
      description: 'Description du module',
      imageUrl: null,
      thematics: [],
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      estimatedDuration: 120,
      status: ModuleStatus.DRAFT,
      lessons: [],
      quizzes: [],
    });

    // Mock de la méthode addLesson
    jest.spyOn(mockModule, 'addLesson');
    jest.spyOn(mockModule, 'toDTO').mockReturnValue({
      id: moduleId,
      title: 'Module de test',
      description: 'Description du module',
      imageUrl: null,
      thematics: [],
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      estimatedDuration: 120,
      status: ModuleStatus.DRAFT,
      lessons: [],
      quizzes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    useCase = new AddLessonUseCaseImpl(mockModuleRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should add a lesson successfully without chapters', async () => {
      // Arrange
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon 1',
        description: 'Description de la leçon 1',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
      };

      mockModuleRepository.findById.mockResolvedValue(mockModule);
      mockModuleRepository.update.mockResolvedValue(mockModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(mockModuleRepository.findById).toHaveBeenCalledWith(moduleId);
      expect(mockModuleRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockModule.addLesson).toHaveBeenCalledTimes(1);
      expect(mockModule.addLesson).toHaveBeenCalledWith(
        expect.objectContaining({
          _title: 'Leçon 1',
          _description: 'Description de la leçon 1',
          _duration: 30,
          _order: 0,
          _status: LessonStatus.DRAFT,
        })
      );
      expect(mockModuleRepository.update).toHaveBeenCalledWith(mockModule);
      expect(mockModuleRepository.update).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(moduleId);
    });

    it('should add a lesson with chapters', async () => {
      // Arrange
      const chapters = [
        new Chapter('Chapitre 1', 'Description chapitre 1', 'media-1', 0),
        new Chapter('Chapitre 2', 'Description chapitre 2', 'media-2', 1),
      ];

      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon avec chapitres',
        description: 'Description de la leçon avec chapitres',
        duration: 60,
        order: 1,
        status: LessonStatus.PUBLISHED,
        chapters,
      };

      mockModuleRepository.findById.mockResolvedValue(mockModule);
      mockModuleRepository.update.mockResolvedValue(mockModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(mockModuleRepository.findById).toHaveBeenCalledWith(moduleId);
      expect(mockModule.addLesson).toHaveBeenCalledTimes(1);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg._title).toBe('Leçon avec chapitres');
      expect(lessonArg._chapters).toHaveLength(2);
      expect(lessonArg._chapters[0].title).toBe('Chapitre 1');
      expect(lessonArg._chapters[0].description).toBe('Description chapitre 1');
      expect(lessonArg._chapters[0].mediaId).toBe('media-1');
      expect(lessonArg._chapters[0].order).toBe(0);
      expect(lessonArg._chapters[1].title).toBe('Chapitre 2');
      expect(lessonArg._chapters[1].description).toBe('Description chapitre 2');
      expect(lessonArg._chapters[1].mediaId).toBe('media-2');
      expect(lessonArg._chapters[1].order).toBe(1);

      expect(mockModuleRepository.update).toHaveBeenCalledWith(mockModule);
      expect(result).toBeDefined();
    });

    it('should add a lesson with undefined chapters (uses empty array)', async () => {
      // Arrange
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon sans chapters définis',
        description: 'Description',
        duration: 45,
        order: 2,
        status: LessonStatus.SCHEDULED,
        // chapters est undefined
      };

      mockModuleRepository.findById.mockResolvedValue(mockModule);
      mockModuleRepository.update.mockResolvedValue(mockModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(mockModuleRepository.findById).toHaveBeenCalledWith(moduleId);
      expect(mockModule.addLesson).toHaveBeenCalledTimes(1);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg._chapters).toHaveLength(0);

      expect(mockModuleRepository.update).toHaveBeenCalledWith(mockModule);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundError if module does not exist', async () => {
      // Arrange
      const command: AddLessonCommand = {
        moduleId: 'inexistant-module-id',
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
      };

      mockModuleRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(NotFoundError);
      await expect(useCase.execute(command)).rejects.toThrow(
        'Module with id inexistant-module-id not found'
      );

      expect(mockModuleRepository.findById).toHaveBeenCalledWith('inexistant-module-id');
      expect(mockModule.addLesson).not.toHaveBeenCalled();
      expect(mockModuleRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if findById returns undefined', async () => {
      // Arrange
      const command: AddLessonCommand = {
        moduleId: 'undefined-module-id',
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
      };

      mockModuleRepository.findById.mockResolvedValue(undefined as any);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(NotFoundError);
      await expect(useCase.execute(command)).rejects.toThrow(
        'Module with id undefined-module-id not found'
      );
    });

    it('should propagate Lesson validation errors', async () => {
      // Arrange - invalid duration (0)
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon invalide',
        description: 'Description',
        duration: 0, // ❌ invalide
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
      };

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('La durée doit être supérieure à 0');
      expect(mockModuleRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate Chapter validation errors', async () => {
      // Arrange - chapter DTO with empty title
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [
          {
            title: '', // ❌ invalide
            description: 'Description',
            mediaId: 'media-1',
            order: 0,
          },
        ],
      };

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'Le titre du chapitre ne peut pas être vide'
      );

      expect(mockModuleRepository.update).not.toHaveBeenCalled();
      expect(mockModule.addLesson).not.toHaveBeenCalled();
    });

    it('should handle multiple chapters with different orders', async () => {
      // Arrange
      const chapters = [
        new Chapter('Introduction', "Chapitre d'introduction", 'media-intro', 0),
        new Chapter('Développement', 'Chapitre de développement', 'media-dev', 1),
        new Chapter('Conclusion', 'Chapitre de conclusion', 'media-conclusion', 2),
      ];

      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon complète',
        description: 'Une leçon avec plusieurs chapitres',
        duration: 90,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters,
      };

      mockModuleRepository.findById.mockResolvedValue(mockModule);
      mockModuleRepository.update.mockResolvedValue(mockModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg._chapters).toHaveLength(3);
      expect(lessonArg._chapters[0].order).toBe(0);
      expect(lessonArg._chapters[1].order).toBe(1);
      expect(lessonArg._chapters[2].order).toBe(2);
      expect(result).toBeDefined();
    });

    it('should generate a unique ID for each lesson', async () => {
      // Arrange
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
      };

      mockModuleRepository.findById.mockResolvedValue(mockModule);
      mockModuleRepository.update.mockResolvedValue(mockModule);

      // Act
      await useCase.execute(command);

      // Assert
      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg._id).toBeDefined();
      expect(typeof lessonArg._id.getValue()).toBe('string');
    });
  });
});
