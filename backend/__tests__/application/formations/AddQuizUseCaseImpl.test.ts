import { AddQuizUseCaseImpl } from '@/application/formations/use-cases/AddQuizUseCaseImpl';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import type { AddQuizCommand } from '@/domain/formations/ports/in/AddQuizUseCase';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { EntityId } from '@/domain/shared/EntityId';
import {
  Module,
  ModuleStatus,
  DifficultyLevel,
} from '@/domain/formations/entities/ModuleFormation';
import {
  TypeQuestion,
  QuestionChoixUnique,
  QuestionChoixMultiple,
} from '@/domain/formations/entities/Question';

describe('AddQuizUseCaseImpl', () => {
  let useCase: AddQuizUseCaseImpl;
  let mockModuleRepository: jest.Mocked<ModuleRepository>;
  let mockModule: Module;

  const moduleId = '123e4567-e89b-12d3-a456-426614174000';

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
      imageUrl: null,
      thematics: [],
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      estimatedDuration: 120,
      status: ModuleStatus.DRAFT,
      lessons: [],
      quizzes: [],
    });

    jest.spyOn(mockModule, 'addQuiz');

    // On contrôle le retour final du use case
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

    useCase = new AddQuizUseCaseImpl(mockModuleRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should add a quiz successfully with undefined questions (uses empty array)', async () => {
      const command: AddQuizCommand = {
        moduleId,
        title: 'Quiz sans questions',
        description: 'Description',
        status: 'DRAFT' as any,
        scoreMinimum: 10,
        duree: 15,
        nombreTentatives: 1,
        // questions undefined
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);
      mockModuleRepository.update.mockResolvedValue(mockModule);

      const result = await useCase.execute(command);

      expect(mockModuleRepository.findById).toHaveBeenCalledWith(moduleId);
      expect(mockModule.addQuiz).toHaveBeenCalledTimes(1);

      const quizArg = (mockModule.addQuiz as any).mock.calls[0][0];

      const quizTitle = quizArg.title ?? quizArg._title;
      expect(quizTitle).toBe('Quiz sans questions');

      const quizQuestions = quizArg.questions ?? quizArg._questions;
      expect(Array.isArray(quizQuestions)).toBe(true);
      expect(quizQuestions).toHaveLength(0);

      expect(mockModuleRepository.update).toHaveBeenCalledWith(mockModule);
      expect(result).toBeDefined();
      expect(result.id).toBe(moduleId);
    });

    it('should add a quiz with CHOIX_UNIQUE and CHOIX_MULTIPLE questions', async () => {
      const command: AddQuizCommand = {
        moduleId,
        title: 'Quiz 1',
        description: 'Description quiz',
        status: 'PUBLISHED' as any,
        scoreMinimum: 12,
        duree: 20,
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
            explication: 'Parce que A',
          },
          {
            type: TypeQuestion.CHOIX_MULTIPLE,
            question: 'Q2',
            points: 2,
            options: [
              { text: 'A', isCorrect: true },
              { text: 'B', isCorrect: true },
              { text: 'C', isCorrect: false },
            ],
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);
      mockModuleRepository.update.mockResolvedValue(mockModule);

      const result = await useCase.execute(command);

      expect(mockModuleRepository.findById).toHaveBeenCalledWith(moduleId);
      expect(mockModule.addQuiz).toHaveBeenCalledTimes(1);

      const quizArg = (mockModule.addQuiz as any).mock.calls[0][0];

      const quizQuestions = quizArg.questions ?? quizArg._questions;
      expect(quizQuestions).toHaveLength(2);

      // ✅ vérifie le mapping réel des classes
      expect(quizQuestions[0]).toBeInstanceOf(QuestionChoixUnique);
      expect(quizQuestions[1]).toBeInstanceOf(QuestionChoixMultiple);

      expect(mockModuleRepository.update).toHaveBeenCalledWith(mockModule);
      expect(result).toBeDefined();
      expect(result.id).toBe(moduleId);
    });

    it('should throw NotFoundError if module does not exist', async () => {
      const command: AddQuizCommand = {
        moduleId: 'inexistant-module-id',
        title: 'Quiz',
        description: 'Description',
        status: 'DRAFT' as any,
        scoreMinimum: 10,
        duree: 15,
        nombreTentatives: 1,
        questions: [],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(command)).rejects.toThrow(NotFoundError);
      await expect(useCase.execute(command)).rejects.toThrow(
        'Module with id inexistant-module-id not found'
      );

      expect(mockModuleRepository.findById).toHaveBeenCalledWith('inexistant-module-id');
      expect(mockModule.addQuiz).not.toHaveBeenCalled();
      expect(mockModuleRepository.update).not.toHaveBeenCalled();
    });

    it('should throw if TypeQuestion is unknown (covers else branch)', async () => {
      const command: AddQuizCommand = {
        moduleId,
        title: 'Quiz',
        description: 'Description',
        status: 'DRAFT' as any,
        scoreMinimum: 10,
        duree: 15,
        nombreTentatives: 1,
        questions: [
          {
            type: 'UNKNOWN_TYPE',
            question: 'Q?',
            points: 1,
            options: [{ text: 'A', isCorrect: true }],
          },
        ],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);

      await expect(useCase.execute(command)).rejects.toThrow('TypeQuestion inconnu: UNKNOWN_TYPE');

      expect(mockModule.addQuiz).not.toHaveBeenCalled();
      expect(mockModuleRepository.update).not.toHaveBeenCalled();
    });

    it('should generate a unique ID for each quiz', async () => {
      const spy = jest.spyOn(EntityId, 'generate');

      const command: AddQuizCommand = {
        moduleId,
        title: 'Quiz ID',
        description: 'Description',
        status: 'DRAFT' as any,
        scoreMinimum: 10,
        duree: 15,
        nombreTentatives: 1,
        questions: [],
      } as any;

      mockModuleRepository.findById.mockResolvedValue(mockModule);
      mockModuleRepository.update.mockResolvedValue(mockModule);

      await useCase.execute(command);

      expect(spy).toHaveBeenCalledTimes(1);

      const quizArg = (mockModule.addQuiz as any).mock.calls[0][0];
      const quizId = quizArg._id ?? quizArg.id;
      // selon ton DomainEntity, _id est souvent un EntityId avec getValue()
      if (quizId?.getValue) {
        expect(typeof quizId.getValue()).toBe('string');
      } else {
        expect(quizId).toBeDefined();
      }
    });
  });
});
