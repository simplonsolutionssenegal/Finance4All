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
import { TypeQuestion } from '@/domain/formations/entities/Question';

describe('AddLessonUseCaseImpl', () => {
  let useCase: AddLessonUseCaseImpl;
  let mockModuleRepository: jest.Mocked<ModuleRepository>;
  let mockModule: Module;

  const moduleId = '123e4567-e89b-12d3-a456-426614174000'; // ✅ Valid UUID format

  beforeEach(() => {
    mockModuleRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as any;

    mockModule = new Module({
      id: EntityId.from(moduleId),
      title: 'Module de test',
      description: 'Description du module',
      imageMediaId: '',
      thematics: 'comptabilité',
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      estimatedDuration: 120,
      status: ModuleStatus.DRAFT,
      lessons: [],
      quizzes: [],
    });

    jest.spyOn(mockModule, 'addLesson');
    jest.spyOn(mockModule, 'toDTO').mockReturnValue({
      id: moduleId,
      title: 'Module de test',
      description: 'Description du module',
      imageMediaId: null,
      thematics: 'comptabilité',
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      estimatedDuration: 120,
      status: ModuleStatus.DRAFT,
      lessons: [],
      quizzes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    // ✅ Default mock for update returns the module
    mockModuleRepository.update.mockResolvedValue(mockModule);

    useCase = new AddLessonUseCaseImpl(mockModuleRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - Basic scenarios', () => {
    it('should throw NotFoundError if module is not found', async () => {
      const command: AddLessonCommand = {
        moduleId: 'non-existent-module',
        title: 'Test Lesson',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(command)).rejects.toThrow(
        'Module non-existent-module not found'
      );
      await expect(useCase.execute(command)).rejects.toThrow(NotFoundError);

      expect(mockModuleRepository.findById).toHaveBeenCalledWith('non-existent-module');
      expect(mockModuleRepository.findById).toHaveBeenCalledTimes(2); // Called twice due to two expects
      expect(mockModuleRepository.update).not.toHaveBeenCalled();
    });

    it('should create a lesson with undefined chapters (uses empty array)', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon sans chapitres',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: undefined, // ✅ Tests (command.chapters ?? [])
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      const result = await useCase.execute(command);

      expect(mockModuleRepository.findById).toHaveBeenCalledWith(moduleId);
      expect(mockModule.addLesson).toHaveBeenCalledTimes(1);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg.moduleId).toBe(moduleId);
      expect(lessonArg.title).toBe('Leçon sans chapitres');
      expect(lessonArg.chapters).toHaveLength(0);

      expect(mockModuleRepository.update).toHaveBeenCalledWith(mockModule);
      expect(result).toBeDefined();
    });

    it('should create a lesson with empty chapters array', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon vide',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      const result = await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg.chapters).toHaveLength(0);
      expect(result).toBeDefined();
    });
  });

  describe('execute - Chapters mapping', () => {
    it('should map chapters with id present', async () => {
      const validChapterId = EntityId.generate().getValue();

      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon avec chapitres',
        description: 'Description',
        duration: 45,
        order: 1,
        status: LessonStatus.DRAFT,
        chapters: [
          {
            id: validChapterId, // ✅ Tests EntityId.from(dto.id)
            title: 'Chapitre 1',
            description: 'Description chapitre 1',
            mediaId: 'media-123',
            order: 0,
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg.chapters).toHaveLength(1);
      expect(lessonArg.chapters[0].title).toBe('Chapitre 1');
    });

    it('should map chapters without id (generates new id)', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [
          {
            // No id => EntityId.generate()
            title: 'Chapitre sans ID',
            description: 'Description',
            mediaId: 'media-456',
            order: 0,
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg.chapters).toHaveLength(1);
      expect(lessonArg.chapters[0].id).toBeDefined();
    });

    it('should map chapters with mediaId as null (becomes undefined)', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [
          {
            title: 'Chapitre sans media',
            description: 'Description',
            mediaId: null, // ✅ Tests (dto.mediaId ?? undefined)
            order: 0,
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg.chapters).toHaveLength(1);
      // mediaId should be undefined
      const chapterMediaId = lessonArg.chapters[0].mediaId;
      expect(chapterMediaId).toBeUndefined();
    });

    it('should map chapters with mediaId as string', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [
          {
            title: 'Chapitre avec media',
            description: 'Description',
            mediaId: 'media-789',
            order: 0,
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg.chapters[0].mediaId).toBe('media-789');
    });

    it('should map multiple chapters with different configurations', async () => {
      const validId = EntityId.generate().getValue();

      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon multiple chapitres',
        description: 'Description',
        duration: 60,
        order: 2,
        status: LessonStatus.DRAFT,
        chapters: [
          {
            id: validId,
            title: 'Chapitre 1 avec ID',
            description: 'Desc 1',
            mediaId: 'media-1',
            order: 0,
          },
          {
            // Sans ID
            title: 'Chapitre 2 sans ID',
            description: 'Desc 2',
            mediaId: null,
            order: 1,
          },
          {
            title: 'Chapitre 3',
            description: 'Desc 3',
            mediaId: 'media-3',
            order: 2,
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg.chapters).toHaveLength(3);
      expect(lessonArg.chapters[0].title).toBe('Chapitre 1 avec ID');
      expect(lessonArg.chapters[1].title).toBe('Chapitre 2 sans ID');
      expect(lessonArg.chapters[2].title).toBe('Chapitre 3');
    });
  });

  describe('execute - Chapter quizzes mapping', () => {
    it('should map chapter with undefined quizzes (uses empty array)', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [
          {
            title: 'Chapitre sans quizzes',
            description: 'Description',
            order: 0,
            quizzes: undefined, // ✅ Tests (chapterDto.quizzes ?? [])
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg.chapters[0].quizzes).toHaveLength(0);
    });

    it('should map chapter with quiz having CHOIX_UNIQUE question', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [
          {
            title: 'Chapitre avec quiz',
            description: 'Description',
            order: 0,
            quizzes: [
              {
                title: 'Quiz chapitre',
                description: 'Description quiz',
                status: 'DRAFT',
                scoreMinimum: 10,
                duree: 15,
                nombreTentatives: 1,
                questions: [
                  {
                    type: TypeQuestion.CHOIX_UNIQUE,
                    question: 'Question 1',
                    points: 1,
                    options: [
                      { text: 'A', isCorrect: true },
                      { text: 'B', isCorrect: false },
                    ],
                    explication: 'Explication',
                  },
                ],
              },
            ],
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg.chapters[0].quizzes).toHaveLength(1);
      expect(lessonArg.chapters[0].quizzes[0].questions).toHaveLength(1);
    });

    it('should map chapter with quiz having CHOIX_MULTIPLE question', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [
          {
            title: 'Chapitre',
            description: 'Description',
            order: 0,
            quizzes: [
              {
                title: 'Quiz',
                description: 'Description',
                status: 'DRAFT',
                scoreMinimum: 10,
                duree: 15,
                nombreTentatives: 1,
                questions: [
                  {
                    type: TypeQuestion.CHOIX_MULTIPLE,
                    question: 'Question multiple',
                    points: 2,
                    options: [
                      { text: 'A', isCorrect: true },
                      { text: 'B', isCorrect: true },
                      { text: 'C', isCorrect: false },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg.chapters[0].quizzes[0].questions).toHaveLength(1);
    });

    it('should map chapter quiz with id present', async () => {
      const quizId = EntityId.generate().getValue();

      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [
          {
            title: 'Chapitre',
            description: 'Description',
            order: 0,
            quizzes: [
              {
                id: quizId, // ✅ Tests EntityId.from(dto.id)
                title: 'Quiz avec ID',
                description: 'Description',
                status: 'DRAFT',
                scoreMinimum: 10,
                duree: 15,
                nombreTentatives: 1,
                questions: [],
              },
            ],
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg.chapters[0].quizzes[0].id.getValue()).toBe(quizId);
    });

    it('should map chapter quiz without id (generates new id)', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [
          {
            title: 'Chapitre',
            description: 'Description',
            order: 0,
            quizzes: [
              {
                // No id
                title: 'Quiz sans ID',
                description: 'Description',
                status: 'DRAFT',
                scoreMinimum: 10,
                duree: 15,
                nombreTentatives: 1,
                questions: [],
              },
            ],
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg.chapters[0].quizzes[0].id).toBeDefined();
    });

    it('should set correct IDs on chapter quiz (chapterId, lessonId, moduleId)', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [
          {
            title: 'Chapitre',
            description: 'Description',
            order: 0,
            quizzes: [
              {
                title: 'Quiz',
                description: 'Description',
                status: 'DRAFT',
                scoreMinimum: 10,
                duree: 15,
                nombreTentatives: 1,
                questions: [],
              },
            ],
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      const chapterQuiz = lessonArg.chapters[0].quizzes[0];

      expect(chapterQuiz.chapterId).toBeDefined();
      expect(chapterQuiz.lessonId).toBeDefined();
      expect(chapterQuiz.moduleId).toBe(moduleId);
    });
  });

  describe('execute - Lesson quizzes mapping', () => {
    it('should create lesson with undefined quizzes (uses empty array)', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon sans quiz',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: undefined, // ✅ Tests (command.quizzes ?? [])
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg.quizzes).toHaveLength(0);
    });

    it('should map lesson quiz with CHOIX_UNIQUE question', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [
          {
            title: 'Quiz leçon',
            description: 'Description',
            status: 'DRAFT',
            scoreMinimum: 10,
            duree: 15,
            nombreTentatives: 1,
            questions: [
              {
                type: TypeQuestion.CHOIX_UNIQUE,
                question: 'Question leçon',
                points: 1,
                options: [
                  { text: 'A', isCorrect: true },
                  { text: 'B', isCorrect: false },
                ],
              },
            ],
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg.quizzes).toHaveLength(1);
      expect(lessonArg.quizzes[0].questions).toHaveLength(1);
    });

    it('should map lesson quiz with CHOIX_MULTIPLE question', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [
          {
            title: 'Quiz',
            description: 'Description',
            status: 'DRAFT',
            scoreMinimum: 10,
            duree: 15,
            nombreTentatives: 1,
            questions: [
              {
                type: TypeQuestion.CHOIX_MULTIPLE,
                question: 'Question',
                points: 2,
                options: [
                  { text: 'A', isCorrect: true },
                  { text: 'B', isCorrect: true },
                  { text: 'C', isCorrect: false },
                ],
              },
            ],
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg.quizzes[0].questions).toHaveLength(1);
    });

    it('should map lesson quiz with id present', async () => {
      const quizId = EntityId.generate().getValue();

      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [
          {
            id: quizId,
            title: 'Quiz avec ID',
            description: 'Description',
            status: 'DRAFT',
            scoreMinimum: 10,
            duree: 15,
            nombreTentatives: 1,
            questions: [],
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg.quizzes[0].id.getValue()).toBe(quizId);
    });

    it('should map lesson quiz without id (generates new id)', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [
          {
            title: 'Quiz sans ID',
            description: 'Description',
            status: 'DRAFT',
            scoreMinimum: 10,
            duree: 15,
            nombreTentatives: 1,
            questions: [],
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      expect(lessonArg.quizzes[0].id).toBeDefined();
    });

    it('should set correct IDs on lesson quiz (lessonId, moduleId, no chapterId)', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [
          {
            title: 'Quiz',
            description: 'Description',
            status: 'DRAFT',
            scoreMinimum: 10,
            duree: 15,
            nombreTentatives: 1,
            questions: [],
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
      const lessonQuiz = lessonArg.quizzes[0];

      expect(lessonQuiz.lessonId).toBeDefined();
      expect(lessonQuiz.moduleId).toBe(moduleId);
      expect(lessonQuiz.chapterId).toBeUndefined();
    });
  });

  describe('mapQuestion - error handling', () => {
    it('should throw error for unknown TypeQuestion', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [
          {
            title: 'Quiz',
            description: 'Description',
            status: 'DRAFT',
            scoreMinimum: 10,
            duree: 15,
            nombreTentatives: 1,
            questions: [
              {
                type: 'UNKNOWN_TYPE',
                question: 'Question',
                points: 1,
                options: [],
              },
            ],
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await expect(useCase.execute(command)).rejects.toThrow('TypeQuestion inconnu: UNKNOWN_TYPE');
    });

    it('should throw error for null TypeQuestion', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [
          {
            title: 'Quiz',
            description: 'Description',
            status: 'DRAFT',
            scoreMinimum: 10,
            duree: 15,
            nombreTentatives: 1,
            questions: [
              {
                type: null,
                question: 'Question',
                points: 1,
                options: [],
              },
            ],
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await expect(useCase.execute(command)).rejects.toThrow('TypeQuestion inconnu: null');
    });

    it('should throw error for undefined TypeQuestion', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [
          {
            title: 'Quiz',
            description: 'Description',
            status: 'DRAFT',
            scoreMinimum: 10,
            duree: 15,
            nombreTentatives: 1,
            questions: [
              {
                // type undefined
                question: 'Question',
                points: 1,
                options: [],
              },
            ],
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await expect(useCase.execute(command)).rejects.toThrow('TypeQuestion inconnu: undefined');
    });
  });

  describe('Complex integration scenarios', () => {
    it('should create complete lesson with chapters (with quizzes) and lesson quizzes', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Leçon complète',
        description: 'Description complète',
        duration: 90,
        order: 5,
        status: LessonStatus.PUBLISHED,
        chapters: [
          {
            title: 'Chapitre 1',
            description: 'Desc 1',
            mediaId: 'media-1',
            order: 0,
            quizzes: [
              {
                title: 'Quiz chapitre 1',
                description: 'Description',
                status: 'DRAFT',
                scoreMinimum: 10,
                duree: 10,
                nombreTentatives: 2,
                questions: [
                  {
                    type: TypeQuestion.CHOIX_UNIQUE,
                    question: 'Q1',
                    points: 1,
                    options: [
                      { text: 'A', isCorrect: true },
                      { text: 'B', isCorrect: false },
                    ],
                  },
                ],
              },
            ],
          },
          {
            title: 'Chapitre 2',
            description: 'Desc 2',
            order: 1,
            quizzes: [],
          },
        ],
        quizzes: [
          {
            title: 'Quiz final leçon',
            description: 'Quiz de fin',
            status: 'PUBLISHED',
            scoreMinimum: 15,
            duree: 20,
            nombreTentatives: 3,
            questions: [
              {
                type: TypeQuestion.CHOIX_MULTIPLE,
                question: 'Question finale',
                points: 3,
                options: [
                  { text: 'A', isCorrect: true },
                  { text: 'B', isCorrect: true },
                  { text: 'C', isCorrect: false },
                ],
              },
            ],
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];

      expect(lessonArg.title).toBe('Leçon complète');
      expect(lessonArg.chapters).toHaveLength(2);
      expect(lessonArg.chapters[0].quizzes).toHaveLength(1);
      expect(lessonArg.chapters[1].quizzes).toHaveLength(0);
      expect(lessonArg.quizzes).toHaveLength(1);

      expect(mockModuleRepository.update).toHaveBeenCalledWith(mockModule);
    });

    it('should generate unique IDs for lesson, chapters, and quizzes', async () => {
      const spy = jest.spyOn(EntityId, 'generate');

      const command: AddLessonCommand = {
        moduleId,
        title: 'Test IDs',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [
          {
            title: 'Chapitre',
            description: 'Desc',
            order: 0,
            quizzes: [
              {
                title: 'Quiz',
                description: 'Desc',
                status: 'DRAFT',
                scoreMinimum: 10,
                duree: 10,
                nombreTentatives: 1,
                questions: [],
              },
            ],
          },
        ],
        quizzes: [
          {
            title: 'Quiz leçon',
            description: 'Desc',
            status: 'DRAFT',
            scoreMinimum: 10,
            duree: 10,
            nombreTentatives: 1,
            questions: [],
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await useCase.execute(command);

      // Should generate IDs for: lesson, chapter, chapter quiz, lesson quiz
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls.length).toBeGreaterThanOrEqual(4);
    });

    it('should handle all lesson statuses', async () => {
      const statuses = [
        LessonStatus.DRAFT,
        LessonStatus.PUBLISHED,
        LessonStatus.ARCHIVED,
        LessonStatus.SCHEDULED,
      ];

      for (const status of statuses) {
        jest.clearAllMocks();
        mockModuleRepository.findById.mockResolvedValue(mockModule);

        const command: AddLessonCommand = {
          moduleId,
          title: `Leçon ${status}`,
          description: 'Description',
          duration: 30,
          order: 0,
          status,
          chapters: [],
        } as any;

        await useCase.execute(command);

        const lessonArg = (mockModule.addLesson as any).mock.calls[0][0];
        expect(lessonArg.status).toBe(status);
      }
    });
  });

  describe('Repository interaction', () => {
    it('should call repository methods in correct order', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Test',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
      } as any;

      const callOrder: string[] = [];

      mockModuleRepository.findById.mockImplementation(async () => {
        callOrder.push('findById');
        return mockModule;
      });

      mockModuleRepository.update.mockImplementation(async module => {
        callOrder.push('update');
        return module; // ✅ Return the module instead of void
      });

      await useCase.execute(command);

      expect(callOrder).toEqual(['findById', 'update', 'findById']);
    });

    it('should return refreshed module DTO', async () => {
      const command: AddLessonCommand = {
        moduleId,
        title: 'Test',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
      } as any;

      const expectedDTO = {
        id: moduleId,
        title: 'Module rafraîchi',
        lessons: [{ id: 'lesson-1' }],
      };

      mockModuleRepository.findById.mockResolvedValue(mockModule);
      (mockModule.toDTO as jest.Mock).mockReturnValue(expectedDTO as any);

      const result = await useCase.execute(command);

      expect(result).toEqual(expectedDTO);
      expect(mockModule.toDTO).toHaveBeenCalled();
    });
  });
});
