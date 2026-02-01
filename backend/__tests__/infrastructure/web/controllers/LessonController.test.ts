import type { Request, Response } from 'express';
import { LessonController } from '@/infrastructure/web/controllers/LessonController';
import type { GetLessonByIdUseCase } from '@/domain/formations/ports/in/GetLessonByIdUseCase';
import type { AddQuizLessonUseCase } from '@/domain/formations/ports/in/AddQuizLessonUseCase';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { LessonStatus } from '@/domain/formations/entities/Lesson';
import { QuizStatus } from '@/domain/formations/entities/Quiz';
import { TypeQuestion } from '@/domain/formations/entities/Question';

describe('LessonController', () => {
  const createMockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  let getLessonByIdUseCase: jest.Mocked<GetLessonByIdUseCase>;
  let addQuizLessonUseCase: jest.Mocked<AddQuizLessonUseCase>;
  let controller: LessonController;

  beforeEach(() => {
    getLessonByIdUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetLessonByIdUseCase>;

    addQuizLessonUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<AddQuizLessonUseCase>;

    controller = new LessonController(getLessonByIdUseCase, addQuizLessonUseCase);

    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // getById
  // ---------------------------------------------------------------------------

  describe('getById', () => {
    it('should return lesson by id successfully', async () => {
      const req = {
        params: {
          id: 'lesson-123',
        },
      } as unknown as Request;
      const res = createMockResponse();

      const mockLesson = {
        id: 'lesson-123',
        moduleId: 'module-456',
        title: 'Introduction à TypeScript',
        description: 'Apprendre les bases de TypeScript',
        duration: 60,
        order: 1,
        status: LessonStatus.PUBLISHED,
        chapters: [],
        quizzes: [],
        chaptersCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getLessonByIdUseCase.execute.mockResolvedValueOnce(mockLesson as any);

      await controller.getById(req, res);

      expect(getLessonByIdUseCase.execute).toHaveBeenCalledWith({
        id: 'lesson-123',
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockLesson,
      });
    });

    it('should return 500 when lesson not found (NotFoundError without statusCode)', async () => {
      const req = {
        params: {
          id: 'non-existent',
        },
      } as unknown as Request;
      const res = createMockResponse();

      const error = new NotFoundError('Lesson with id non-existent not found');

      getLessonByIdUseCase.execute.mockRejectedValueOnce(error);

      await controller.getById(req, res);

      expect(getLessonByIdUseCase.execute).toHaveBeenCalledWith({
        id: 'non-existent',
      });

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Lesson with id non-existent not found',
      });
    });

    it('should return 500 when use case throws an error without statusCode', async () => {
      const req = {
        params: {
          id: 'lesson-123',
        },
      } as unknown as Request;
      const res = createMockResponse();

      const error = new Error('Database connection failed');

      getLessonByIdUseCase.execute.mockRejectedValueOnce(error);

      await controller.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Database connection failed',
      });
    });

    it('should handle lesson with chapters and quizzes', async () => {
      const req = {
        params: {
          id: 'lesson-123',
        },
      } as unknown as Request;
      const res = createMockResponse();

      const mockLesson = {
        id: 'lesson-123',
        moduleId: 'module-456',
        title: 'Advanced TypeScript',
        description: 'Deep dive into TypeScript',
        duration: 120,
        order: 2,
        status: LessonStatus.PUBLISHED,
        chapters: [
          {
            id: 'chapter-1',
            title: 'Generics',
            content: 'Content about generics',
            order: 1,
          },
        ],
        quizzes: [
          {
            id: 'quiz-1',
            title: 'TypeScript Quiz',
            description: 'Test your knowledge',
            status: QuizStatus.PUBLISHED,
            questions: [],
          },
        ],
        chaptersCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getLessonByIdUseCase.execute.mockResolvedValueOnce(mockLesson as any);

      await controller.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockLesson,
      });
    });

    it('should handle custom error with statusCode', async () => {
      const req = {
        params: {
          id: 'lesson-123',
        },
      } as unknown as Request;
      const res = createMockResponse();

      const error = new Error('Unauthorized access') as any;
      error.statusCode = 403;

      getLessonByIdUseCase.execute.mockRejectedValueOnce(error);

      await controller.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Unauthorized access',
      });
    });
  });

  // ---------------------------------------------------------------------------
  // addQuiz
  // ---------------------------------------------------------------------------

  describe('addQuiz', () => {
    it('should add quiz to lesson successfully without questions', async () => {
      const req = {
        params: {
          id: 'lesson-123',
        },
        body: {
          title: 'Quiz de test',
          description: 'Description du quiz',
          status: QuizStatus.DRAFT,
          scoreMinimum: 50,
          duree: 30,
          nombreTentatives: 3,
          questions: [],
        },
      } as unknown as Request;
      const res = createMockResponse();

      const mockUpdatedLesson = {
        id: 'lesson-123',
        moduleId: 'module-456',
        title: 'Ma leçon',
        description: 'Description',
        duration: 60,
        order: 1,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [
          {
            id: 'quiz-123',
            title: 'Quiz de test',
            description: 'Description du quiz',
            status: QuizStatus.DRAFT,
            scoreMinimum: 50,
            duree: 30,
            nombreTentatives: 3,
            questions: [],
          },
        ],
        chaptersCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addQuizLessonUseCase.execute.mockResolvedValueOnce(mockUpdatedLesson as any);

      await controller.addQuiz(req, res);

      expect(addQuizLessonUseCase.execute).toHaveBeenCalledWith({
        lessonId: 'lesson-123',
        title: 'Quiz de test',
        description: 'Description du quiz',
        status: QuizStatus.DRAFT,
        scoreMinimum: 50,
        duree: 30,
        nombreTentatives: 3,
        questions: [],
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUpdatedLesson,
      });
    });

    it('should add quiz with CHOIX_UNIQUE question successfully', async () => {
      const req = {
        params: {
          id: 'lesson-123',
        },
        body: {
          title: 'Quiz géographie',
          description: 'Testez vos connaissances',
          status: QuizStatus.PUBLISHED,
          scoreMinimum: 70,
          duree: 20,
          nombreTentatives: 2,
          questions: [
            {
              type: TypeQuestion.CHOIX_UNIQUE,
              question: 'Quelle est la capitale de la France ?',
              points: 10,
              options: [
                { text: 'Paris', isCorrect: true },
                { text: 'Lyon', isCorrect: false },
                { text: 'Marseille', isCorrect: false },
              ],
              explication: 'Paris est la capitale de la France.',
            },
          ],
        },
      } as unknown as Request;
      const res = createMockResponse();

      const mockUpdatedLesson = {
        id: 'lesson-123',
        moduleId: 'module-456',
        title: 'Ma leçon',
        description: 'Description',
        duration: 60,
        order: 1,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [
          {
            id: 'quiz-456',
            title: 'Quiz géographie',
            description: 'Testez vos connaissances',
            status: QuizStatus.PUBLISHED,
            scoreMinimum: 70,
            duree: 20,
            nombreTentatives: 2,
            questions: [
              {
                type: TypeQuestion.CHOIX_UNIQUE,
                question: 'Quelle est la capitale de la France ?',
                points: 10,
                options: [
                  { text: 'Paris', isCorrect: true },
                  { text: 'Lyon', isCorrect: false },
                  { text: 'Marseille', isCorrect: false },
                ],
                explication: 'Paris est la capitale de la France.',
              },
            ],
          },
        ],
        chaptersCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addQuizLessonUseCase.execute.mockResolvedValueOnce(mockUpdatedLesson as any);

      await controller.addQuiz(req, res);

      expect(addQuizLessonUseCase.execute).toHaveBeenCalledWith({
        lessonId: 'lesson-123',
        title: 'Quiz géographie',
        description: 'Testez vos connaissances',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 70,
        duree: 20,
        nombreTentatives: 2,
        questions: [
          {
            type: TypeQuestion.CHOIX_UNIQUE,
            question: 'Quelle est la capitale de la France ?',
            points: 10,
            options: [
              { text: 'Paris', isCorrect: true },
              { text: 'Lyon', isCorrect: false },
              { text: 'Marseille', isCorrect: false },
            ],
            explication: 'Paris est la capitale de la France.',
          },
        ],
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUpdatedLesson,
      });
    });

    it('should add quiz with CHOIX_MULTIPLE question successfully', async () => {
      const req = {
        params: {
          id: 'lesson-456',
        },
        body: {
          title: 'Quiz programmation',
          description: 'Langages de programmation',
          status: QuizStatus.DRAFT,
          scoreMinimum: 60,
          duree: 25,
          nombreTentatives: 5,
          questions: [
            {
              type: TypeQuestion.CHOIX_MULTIPLE,
              question: 'Quels sont des langages de programmation ?',
              points: 15,
              options: [
                { text: 'JavaScript', isCorrect: true },
                { text: 'Python', isCorrect: true },
                { text: 'HTML', isCorrect: false },
                { text: 'TypeScript', isCorrect: true },
              ],
            },
          ],
        },
      } as unknown as Request;
      const res = createMockResponse();

      const mockUpdatedLesson = {
        id: 'lesson-456',
        moduleId: 'module-789',
        title: 'Leçon de programmation',
        description: 'Apprendre à programmer',
        duration: 90,
        order: 1,
        status: LessonStatus.PUBLISHED,
        chapters: [],
        quizzes: [
          {
            id: 'quiz-789',
            title: 'Quiz programmation',
            description: 'Langages de programmation',
            status: QuizStatus.DRAFT,
            scoreMinimum: 60,
            duree: 25,
            nombreTentatives: 5,
            questions: [
              {
                type: TypeQuestion.CHOIX_MULTIPLE,
                question: 'Quels sont des langages de programmation ?',
                points: 15,
                options: [
                  { text: 'JavaScript', isCorrect: true },
                  { text: 'Python', isCorrect: true },
                  { text: 'HTML', isCorrect: false },
                  { text: 'TypeScript', isCorrect: true },
                ],
              },
            ],
          },
        ],
        chaptersCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addQuizLessonUseCase.execute.mockResolvedValueOnce(mockUpdatedLesson as any);

      await controller.addQuiz(req, res);

      expect(addQuizLessonUseCase.execute).toHaveBeenCalledWith({
        lessonId: 'lesson-456',
        title: 'Quiz programmation',
        description: 'Langages de programmation',
        status: QuizStatus.DRAFT,
        scoreMinimum: 60,
        duree: 25,
        nombreTentatives: 5,
        questions: [
          {
            type: TypeQuestion.CHOIX_MULTIPLE,
            question: 'Quels sont des langages de programmation ?',
            points: 15,
            options: [
              { text: 'JavaScript', isCorrect: true },
              { text: 'Python', isCorrect: true },
              { text: 'HTML', isCorrect: false },
              { text: 'TypeScript', isCorrect: true },
            ],
          },
        ],
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUpdatedLesson,
      });
    });

    it('should add quiz with multiple questions of different types', async () => {
      const req = {
        params: {
          id: 'lesson-123',
        },
        body: {
          title: 'Quiz complet',
          description: 'Questions variées',
          status: QuizStatus.PUBLISHED,
          scoreMinimum: 75,
          duree: 45,
          nombreTentatives: 3,
          questions: [
            {
              type: TypeQuestion.CHOIX_UNIQUE,
              question: 'Question 1',
              points: 10,
              options: [
                { text: 'A', isCorrect: true },
                { text: 'B', isCorrect: false },
              ],
            },
            {
              type: TypeQuestion.CHOIX_MULTIPLE,
              question: 'Question 2',
              points: 20,
              options: [
                { text: 'A', isCorrect: true },
                { text: 'B', isCorrect: true },
                { text: 'C', isCorrect: false },
              ],
            },
          ],
        },
      } as unknown as Request;
      const res = createMockResponse();

      const mockUpdatedLesson = {
        id: 'lesson-123',
        moduleId: 'module-456',
        title: 'Ma leçon',
        description: 'Description',
        duration: 60,
        order: 1,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [
          {
            id: 'quiz-mixed',
            title: 'Quiz complet',
            description: 'Questions variées',
            status: QuizStatus.PUBLISHED,
            scoreMinimum: 75,
            duree: 45,
            nombreTentatives: 3,
            questions: req.body.questions,
          },
        ],
        chaptersCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addQuizLessonUseCase.execute.mockResolvedValueOnce(mockUpdatedLesson as any);

      await controller.addQuiz(req, res);

      expect(addQuizLessonUseCase.execute).toHaveBeenCalledWith({
        lessonId: 'lesson-123',
        title: 'Quiz complet',
        description: 'Questions variées',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 75,
        duree: 45,
        nombreTentatives: 3,
        questions: req.body.questions,
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 500 when lesson not found (NotFoundError without statusCode)', async () => {
      const req = {
        params: {
          id: 'non-existent',
        },
        body: {
          title: 'Quiz test',
          description: 'Description',
          status: QuizStatus.DRAFT,
          scoreMinimum: 50,
          duree: 30,
          nombreTentatives: 3,
          questions: [],
        },
      } as unknown as Request;
      const res = createMockResponse();

      const error = new NotFoundError('Lesson with id non-existent not found');

      addQuizLessonUseCase.execute.mockRejectedValueOnce(error);

      await controller.addQuiz(req, res);

      expect(addQuizLessonUseCase.execute).toHaveBeenCalledWith({
        lessonId: 'non-existent',
        title: 'Quiz test',
        description: 'Description',
        status: QuizStatus.DRAFT,
        scoreMinimum: 50,
        duree: 30,
        nombreTentatives: 3,
        questions: [],
      });

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Lesson with id non-existent not found',
        details: error.stack,
      });
    });

    it('should return 500 when use case throws an error without statusCode', async () => {
      const req = {
        params: {
          id: 'lesson-123',
        },
        body: {
          title: 'Quiz test',
          description: 'Description',
          status: QuizStatus.DRAFT,
          scoreMinimum: 50,
          duree: 30,
          nombreTentatives: 3,
          questions: [],
        },
      } as unknown as Request;
      const res = createMockResponse();

      const error = new Error('Database error');

      addQuizLessonUseCase.execute.mockRejectedValueOnce(error);

      await controller.addQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Database error',
        details: error.stack,
      });
    });

    it('should handle validation error from use case', async () => {
      const req = {
        params: {
          id: 'lesson-123',
        },
        body: {
          title: 'Quiz test',
          description: 'Description',
          status: QuizStatus.DRAFT,
          scoreMinimum: 50,
          duree: 30,
          nombreTentatives: 3,
          questions: [
            {
              type: TypeQuestion.CHOIX_UNIQUE,
              question: 'Question invalide',
              points: 10,
              options: [
                { text: 'A', isCorrect: true },
                { text: 'B', isCorrect: true }, // Deux réponses correctes pour choix unique
              ],
            },
          ],
        },
      } as unknown as Request;
      const res = createMockResponse();

      const error = new Error(
        'Une question à choix unique doit avoir exactement une réponse correcte'
      ) as any;
      error.statusCode = 400;

      addQuizLessonUseCase.execute.mockRejectedValueOnce(error);

      await controller.addQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Une question à choix unique doit avoir exactement une réponse correcte',
        details: error.stack,
      });
    });

    it('should include error stack in response details', async () => {
      const req = {
        params: {
          id: 'lesson-123',
        },
        body: {
          title: 'Quiz test',
          description: 'Description',
          status: QuizStatus.DRAFT,
          scoreMinimum: 50,
          duree: 30,
          nombreTentatives: 3,
          questions: [],
        },
      } as unknown as Request;
      const res = createMockResponse();

      const error = new Error('Test error');
      const errorStack = error.stack;

      addQuizLessonUseCase.execute.mockRejectedValueOnce(error);

      await controller.addQuiz(req, res);

      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Test error',
        details: errorStack,
      });
    });

    it('should merge lessonId with body data correctly', async () => {
      const req = {
        params: {
          id: 'lesson-999',
        },
        body: {
          title: 'Quiz merge test',
          description: 'Test de fusion',
          status: QuizStatus.DRAFT,
          scoreMinimum: 50,
          duree: 30,
          nombreTentatives: 3,
          questions: [],
        },
      } as unknown as Request;
      const res = createMockResponse();

      const mockUpdatedLesson = {
        id: 'lesson-999',
        moduleId: 'module-111',
        title: 'Leçon test',
        description: 'Description',
        duration: 60,
        order: 1,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [
          {
            id: 'quiz-new',
            title: 'Quiz merge test',
            description: 'Test de fusion',
            status: QuizStatus.DRAFT,
            scoreMinimum: 50,
            duree: 30,
            nombreTentatives: 3,
            questions: [],
          },
        ],
        chaptersCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addQuizLessonUseCase.execute.mockResolvedValueOnce(mockUpdatedLesson as any);

      await controller.addQuiz(req, res);

      expect(addQuizLessonUseCase.execute).toHaveBeenCalledWith({
        lessonId: 'lesson-999',
        title: 'Quiz merge test',
        description: 'Test de fusion',
        status: QuizStatus.DRAFT,
        scoreMinimum: 50,
        duree: 30,
        nombreTentatives: 3,
        questions: [],
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
