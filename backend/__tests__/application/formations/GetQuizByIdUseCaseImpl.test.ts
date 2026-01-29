// application/formations/use-cases/__tests__/GetQuizByIdUseCaseImpl.test.ts

import { GetQuizByIdUseCaseImpl } from '@/application/formations/use-cases/GetQuizByIdUseCaseImpl';
import type { QuizRepository } from '@/domain/formations/ports/out/QuizRepository';
import type { GetQuizByIdUseCaseQuery } from '@/domain/formations/ports/in/GetQuizByIdUseCase';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { EntityId } from '@/domain/shared/EntityId';
import { Quiz, QuizStatus } from '@/domain/formations/entities/Quiz';
import {
  QuestionChoixUnique,
  QuestionChoixMultiple,
  TypeQuestion,
} from '@/domain/formations/entities/Question';

describe('GetQuizByIdUseCaseImpl', () => {
  let useCase: GetQuizByIdUseCaseImpl;
  let mockQuizRepository: jest.Mocked<QuizRepository>;
  let mockQuiz: Quiz;
  const quizId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    // Mock du repository
    mockQuizRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as any;

    // Créer un quiz de test avec questions
    const questions = [
      new QuestionChoixUnique(
        'Quelle est la capitale de la France ?',
        10,
        [
          { text: 'Paris', isCorrect: true },
          { text: 'Lyon', isCorrect: false },
          { text: 'Marseille', isCorrect: false },
        ],
        'Paris est la capitale de la France'
      ),
      new QuestionChoixMultiple(
        'Quels sont des langages de programmation ?',
        15,
        [
          { text: 'JavaScript', isCorrect: true },
          { text: 'Python', isCorrect: true },
          { text: 'HTML', isCorrect: false },
          { text: 'TypeScript', isCorrect: true },
        ],
        'JavaScript, Python et TypeScript sont des langages de programmation'
      ),
    ];

    mockQuiz = new Quiz({
      id: EntityId.from(quizId),
      title: 'Quiz de test',
      description: 'Description du quiz de test',
      scoreMinimum: 70,
      duree: 30,
      nombreTentatives: 2,
      status: QuizStatus.PUBLISHED,
      questions,
    });

    // Mock de la méthode toDTO
    jest.spyOn(mockQuiz, 'toDTO');

    useCase = new GetQuizByIdUseCaseImpl(mockQuizRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return a quiz DTO when quiz exists', async () => {
      // Arrange
      const query: GetQuizByIdUseCaseQuery = {
        id: quizId,
      };

      mockQuizRepository.findById.mockResolvedValue(mockQuiz);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(mockQuizRepository.findById).toHaveBeenCalledWith(quizId);
      expect(mockQuizRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockQuiz.toDTO).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(quizId);
      expect(result.title).toBe('Quiz de test');
      expect(result.description).toBe('Description du quiz de test');
      expect(result.scoreMinimum).toBe(70);
      expect(result.duree).toBe(30);
      expect(result.nombreTentatives).toBe(2);
      expect(result.status).toBe(QuizStatus.PUBLISHED);
      expect(result.questions).toHaveLength(2);
    });

    it('should return a quiz DTO with empty questions array', async () => {
      // Arrange
      const quizWithoutQuestions = new Quiz({
        id: EntityId.from(quizId),
        title: 'Quiz sans questions',
        description: 'Description',
        scoreMinimum: 50,
        duree: 15,
        nombreTentatives: 1,
        status: QuizStatus.DRAFT,
        questions: [],
      });

      const query: GetQuizByIdUseCaseQuery = {
        id: quizId,
      };

      mockQuizRepository.findById.mockResolvedValue(quizWithoutQuestions);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(mockQuizRepository.findById).toHaveBeenCalledWith(quizId);
      expect(result).toBeDefined();
      expect(result.questions).toHaveLength(0);
    });

    it('should return a quiz with unlimited duration (duree undefined)', async () => {
      // Arrange
      const unlimitedQuiz = new Quiz({
        id: EntityId.from(quizId),
        title: 'Quiz illimité',
        description: 'Quiz sans limite de temps',
        scoreMinimum: 60,
        duree: undefined, // ✅ Quiz sans durée = illimité
        nombreTentatives: 3,
        status: QuizStatus.PUBLISHED,
        questions: [],
      });

      const query: GetQuizByIdUseCaseQuery = {
        id: quizId,
      };

      mockQuizRepository.findById.mockResolvedValue(unlimitedQuiz);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.duree).toBeUndefined();
    });

    it('should return correct question information for QuestionChoixUnique', async () => {
      // Arrange
      const query: GetQuizByIdUseCaseQuery = {
        id: quizId,
      };

      mockQuizRepository.findById.mockResolvedValue(mockQuiz);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.questions).toHaveLength(2);

      // Vérifier la première question (Choix Unique)
      const question1 = result.questions[0];
      expect(question1.question).toBe('Quelle est la capitale de la France ?');
      expect(question1.type).toBe(TypeQuestion.CHOIX_UNIQUE);
      expect(question1.points).toBe(10);
      expect(question1.options).toHaveLength(3);
      expect(question1.options[0]).toEqual({ text: 'Paris', isCorrect: true });
      expect(question1.options[1]).toEqual({ text: 'Lyon', isCorrect: false });
      expect(question1.options[2]).toEqual({ text: 'Marseille', isCorrect: false });
      expect(question1.explication).toBe('Paris est la capitale de la France');
    });

    it('should return correct question information for QuestionChoixMultiple', async () => {
      // Arrange
      const query: GetQuizByIdUseCaseQuery = {
        id: quizId,
      };

      mockQuizRepository.findById.mockResolvedValue(mockQuiz);

      // Act
      const result = await useCase.execute(query);

      // Assert
      // Vérifier la deuxième question (Choix Multiple)
      const question2 = result.questions[1];
      expect(question2.question).toBe('Quels sont des langages de programmation ?');
      expect(question2.type).toBe(TypeQuestion.CHOIX_MULTIPLE);
      expect(question2.points).toBe(15);
      expect(question2.options).toHaveLength(4);
      expect(question2.options[0]).toEqual({ text: 'JavaScript', isCorrect: true });
      expect(question2.options[1]).toEqual({ text: 'Python', isCorrect: true });
      expect(question2.options[2]).toEqual({ text: 'HTML', isCorrect: false });
      expect(question2.options[3]).toEqual({ text: 'TypeScript', isCorrect: true });
      expect(question2.explication).toBe(
        'JavaScript, Python et TypeScript sont des langages de programmation'
      );
    });

    it('should throw NotFoundError when quiz does not exist', async () => {
      // Arrange
      const query: GetQuizByIdUseCaseQuery = {
        id: 'inexistant-quiz-id',
      };

      mockQuizRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(query)).rejects.toThrow(NotFoundError);
      await expect(useCase.execute(query)).rejects.toThrow(
        'quiz with id inexistant-quiz-id not found'
      );

      expect(mockQuizRepository.findById).toHaveBeenCalledWith('inexistant-quiz-id');
    });

    it('should throw NotFoundError when findById returns undefined', async () => {
      // Arrange
      const query: GetQuizByIdUseCaseQuery = {
        id: 'undefined-quiz-id',
      };

      mockQuizRepository.findById.mockResolvedValue(undefined as any);

      // Act & Assert
      await expect(useCase.execute(query)).rejects.toThrow(NotFoundError);
      await expect(useCase.execute(query)).rejects.toThrow(
        'quiz with id undefined-quiz-id not found'
      );
    });

    it('should return quiz with DRAFT status', async () => {
      // Arrange
      const draftQuiz = new Quiz({
        id: EntityId.from(quizId),
        title: 'Quiz brouillon',
        description: 'Description',
        scoreMinimum: 60,
        duree: 20,
        nombreTentatives: 1,
        status: QuizStatus.DRAFT,
        questions: [],
      });

      const query: GetQuizByIdUseCaseQuery = {
        id: quizId,
      };

      mockQuizRepository.findById.mockResolvedValue(draftQuiz);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.status).toBe(QuizStatus.DRAFT);
    });

    it('should return quiz with ARCHIVED status', async () => {
      // Arrange
      const archivedQuiz = new Quiz({
        id: EntityId.from(quizId),
        title: 'Quiz archivé',
        description: 'Description',
        scoreMinimum: 80,
        duree: 25,
        nombreTentatives: 2,
        status: QuizStatus.ARCHIVED,
        questions: [],
      });

      const query: GetQuizByIdUseCaseQuery = {
        id: quizId,
      };

      mockQuizRepository.findById.mockResolvedValue(archivedQuiz);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.status).toBe(QuizStatus.ARCHIVED);
    });

    it('should include createdAt and updatedAt in DTO', async () => {
      // Arrange
      const query: GetQuizByIdUseCaseQuery = {
        id: quizId,
      };

      mockQuizRepository.findById.mockResolvedValue(mockQuiz);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should calculate total points correctly', async () => {
      // Arrange
      const query: GetQuizByIdUseCaseQuery = {
        id: quizId,
      };

      mockQuizRepository.findById.mockResolvedValue(mockQuiz);

      // Act
      const result = await useCase.execute(query);

      // Assert
      // Le quiz a 2 questions : 10 points + 15 points = 25 points total
      expect(result.totalPoints).toBe(25);
    });

    it('should handle quiz with mixed question types', async () => {
      // Arrange
      const mixedQuestions = [
        new QuestionChoixUnique('Question 1', 5, [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: false },
        ]),
        new QuestionChoixMultiple('Question 2', 10, [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: true },
          { text: 'C', isCorrect: false },
        ]),
        new QuestionChoixUnique('Question 3', 8, [
          { text: 'Oui', isCorrect: false },
          { text: 'Non', isCorrect: true },
        ]),
      ];

      const mixedQuiz = new Quiz({
        id: EntityId.from(quizId),
        title: 'Quiz mixte',
        description: 'Quiz avec différents types de questions',
        scoreMinimum: 70,
        duree: 45,
        nombreTentatives: 3,
        status: QuizStatus.PUBLISHED,
        questions: mixedQuestions,
      });

      const query: GetQuizByIdUseCaseQuery = {
        id: quizId,
      };

      mockQuizRepository.findById.mockResolvedValue(mixedQuiz);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.questions).toHaveLength(3);
      expect(result.questions[0].type).toBe(TypeQuestion.CHOIX_UNIQUE);
      expect(result.questions[1].type).toBe(TypeQuestion.CHOIX_MULTIPLE);
      expect(result.questions[2].type).toBe(TypeQuestion.CHOIX_UNIQUE);
      expect(result.totalPoints).toBe(23); // 5 + 10 + 8
    });

    it('should handle quiz with questions without explication', async () => {
      // Arrange
      const questionsWithoutExplication = [
        new QuestionChoixUnique(
          'Question sans explication',
          10,
          [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: false },
          ]
          // Pas d'explication fournie
        ),
      ];

      const quiz = new Quiz({
        id: EntityId.from(quizId),
        title: 'Quiz',
        description: 'Description',
        scoreMinimum: 50,
        duree: 15,
        nombreTentatives: 1,
        status: QuizStatus.PUBLISHED,
        questions: questionsWithoutExplication,
      });

      const query: GetQuizByIdUseCaseQuery = {
        id: quizId,
      };

      mockQuizRepository.findById.mockResolvedValue(quiz);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.questions[0].explication).toBeUndefined();
    });

    it('should handle quiz with different nombreTentatives values', async () => {
      // Arrange
      const quiz1Tentative = new Quiz({
        id: EntityId.from(quizId),
        title: 'Quiz 1 tentative',
        description: 'Description',
        scoreMinimum: 70,
        duree: 30,
        nombreTentatives: 1, // ✅ Minimum
        status: QuizStatus.PUBLISHED,
        questions: [],
      });

      const query: GetQuizByIdUseCaseQuery = {
        id: quizId,
      };

      mockQuizRepository.findById.mockResolvedValue(quiz1Tentative);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.nombreTentatives).toBe(1);
    });

    it('should handle quiz with maximum nombreTentatives', async () => {
      // Arrange
      const quiz3Tentatives = new Quiz({
        id: EntityId.from(quizId),
        title: 'Quiz 3 tentatives',
        description: 'Description',
        scoreMinimum: 70,
        duree: 30,
        nombreTentatives: 3, // ✅ Maximum
        status: QuizStatus.PUBLISHED,
        questions: [],
      });

      const query: GetQuizByIdUseCaseQuery = {
        id: quizId,
      };

      mockQuizRepository.findById.mockResolvedValue(quiz3Tentatives);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result.nombreTentatives).toBe(3);
    });
  });
});
