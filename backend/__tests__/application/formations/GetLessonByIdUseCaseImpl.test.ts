// application/formations/use-cases/__tests__/GetLessonByIdUseCaseImpl.test.ts

import { GetLessonByIdUseCaseImpl } from '@/application/formations/use-cases/GetLessonByIdUseCaseImpl';
import type { LessonRepository } from '@/domain/formations/ports/out/LessonRepository';
import type { GetLessonByIdUseCaseQuery } from '@/domain/formations/ports/in/GetLessonByIdUseCase';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { EntityId } from '@/domain/shared/EntityId';
import { Lesson, LessonStatus } from '@/domain/formations/entities/Lesson';
import { Chapter } from '@/domain/formations/entities/Chapter';

describe('GetLessonByIdUseCaseImpl', () => {
  let useCase: GetLessonByIdUseCaseImpl;
  let mockLessonRepository: jest.Mocked<LessonRepository>;
  let mockLesson: Lesson;
  const lessonId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    // Mock du repository
    mockLessonRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as any;

    // Créer une leçon de test avec chapitres
    const chapters = [
      new Chapter('Chapitre 1', 'Description chapitre 1', 'media-1', 0),
      new Chapter('Chapitre 2', 'Description chapitre 2', 'media-2', 1),
    ];

    mockLesson = new Lesson({
      id: EntityId.from(lessonId),
      title: 'Leçon de test',
      description: 'Description de la leçon de test',
      duration: 60,
      order: 0,
      status: LessonStatus.PUBLISHED,
      chapters,
    });

    // Mock de la méthode toDTO
    jest.spyOn(mockLesson, 'toDTO');

    useCase = new GetLessonByIdUseCaseImpl(mockLessonRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return a lesson DTO when lesson exists', async () => {
      // Arrange
      const query: GetLessonByIdUseCaseQuery = {
        id: lessonId,
      };

      mockLessonRepository.findById.mockResolvedValue(mockLesson);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(mockLessonRepository.findById).toHaveBeenCalledWith(lessonId);
      expect(mockLessonRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockLesson.toDTO).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(lessonId);
      expect(result.title).toBe('Leçon de test');
      expect(result.description).toBe('Description de la leçon de test');
      expect(result.duration).toBe(60);
      expect(result.order).toBe(0);
      expect(result.status).toBe(LessonStatus.PUBLISHED);
      expect(result.chapters).toHaveLength(2);
      expect(result.chaptersCount).toBe(2);
    });

    it('should return a lesson DTO with empty chapters array', async () => {
      // Arrange
      const lessonWithoutChapters = new Lesson({
        id: EntityId.from(lessonId),
        title: 'Leçon sans chapitres',
        description: 'Description',
        duration: 30,
        order: 1,
        status: LessonStatus.DRAFT,
        chapters: [],
      });

      const query: GetLessonByIdUseCaseQuery = {
        id: lessonId,
      };

      mockLessonRepository.findById.mockResolvedValue(lessonWithoutChapters);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(mockLessonRepository.findById).toHaveBeenCalledWith(lessonId);
      expect(result).toBeDefined();
      expect(result.chapters).toHaveLength(0);
      expect(result.chaptersCount).toBe(0);
    });

    it('should return correct chapter information in DTO', async () => {
      // Arrange
      const query: GetLessonByIdUseCaseQuery = {
        id: lessonId,
      };

      mockLessonRepository.findById.mockResolvedValue(mockLesson);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.chapters).toHaveLength(2);
      expect(result.chapters[0]).toEqual({
        title: 'Chapitre 1',
        description: 'Description chapitre 1',
        mediaId: 'media-1',
        order: 0,
      });
      expect(result.chapters[1]).toEqual({
        title: 'Chapitre 2',
        description: 'Description chapitre 2',
        mediaId: 'media-2',
        order: 1,
      });
    });

    it('should throw NotFoundError when lesson does not exist', async () => {
      // Arrange
      const query: GetLessonByIdUseCaseQuery = {
        id: 'inexistant-lesson-id',
      };

      mockLessonRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(query)).rejects.toThrow(NotFoundError);
      await expect(useCase.execute(query)).rejects.toThrow(
        'lesson with id inexistant-lesson-id not found'
      );

      expect(mockLessonRepository.findById).toHaveBeenCalledWith('inexistant-lesson-id');
      expect(mockLessonRepository.findById).toHaveBeenCalledTimes(2); // Called twice due to two assertions
    });

    it('should throw NotFoundError when findById returns undefined', async () => {
      // Arrange
      const query: GetLessonByIdUseCaseQuery = {
        id: 'undefined-lesson-id',
      };

      mockLessonRepository.findById.mockResolvedValue(undefined as any);

      // Act & Assert
      await expect(useCase.execute(query)).rejects.toThrow(NotFoundError);
      await expect(useCase.execute(query)).rejects.toThrow(
        'lesson with id undefined-lesson-id not found'
      );
    });

    it('should return lesson with different statuses', async () => {
      // Arrange
      const draftLesson = new Lesson({
        id: EntityId.from(lessonId),
        title: 'Leçon brouillon',
        description: 'Description',
        duration: 45,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
      });

      const query: GetLessonByIdUseCaseQuery = {
        id: lessonId,
      };

      mockLessonRepository.findById.mockResolvedValue(draftLesson);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.status).toBe(LessonStatus.DRAFT);
    });

    it('should include createdAt and updatedAt in DTO', async () => {
      // Arrange
      const query: GetLessonByIdUseCaseQuery = {
        id: lessonId,
      };

      mockLessonRepository.findById.mockResolvedValue(mockLesson);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });
});
