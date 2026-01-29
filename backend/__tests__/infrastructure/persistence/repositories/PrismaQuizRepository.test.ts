import { PrismaQuizRepository } from '@/infrastructure/persistence/repositories/PrismaQuizRepository';
import { EntityId } from '@/domain/shared/EntityId';
import { Quiz, QuizStatus } from '@/domain/formations/entities/Quiz';
import {
  QuestionChoixUnique,
  QuestionChoixMultiple,
  TypeQuestion,
  type QuestionOption,
} from '@/domain/formations/entities/Question';
import type { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

type PrismaQuizRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  scoreMinimum: number;
  duree: number | null;
  nombreTentatives: number;
  questions: any;
  createdAt: Date;
  updatedAt: Date;
};

describe('PrismaQuizRepository — tests avec couverture 100%', () => {
  let repository: PrismaQuizRepository;
  let mockPrisma: Partial<PrismaClient> & { quiz?: any };
  let uuid1: string;
  let uuid2: string;

  beforeEach(() => {
    uuid1 = randomUUID();
    uuid2 = randomUUID();

    mockPrisma = {
      quiz: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    } as any;

    repository = new PrismaQuizRepository(mockPrisma as unknown as PrismaClient);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findById(id)', () => {
    it('devrait retourner un Quiz avec questions choix unique', async () => {
      const questionsData = [
        {
          question: 'Quelle est la capitale de la France?',
          type: TypeQuestion.CHOIX_UNIQUE,
          points: 10,
          options: [
            { text: 'Paris', isCorrect: true },
            { text: 'Lyon', isCorrect: false },
            { text: 'Marseille', isCorrect: false },
          ],
          explication: 'Paris est la capitale de la France',
        },
      ];

      const row: PrismaQuizRow = {
        id: uuid1,
        title: 'Quiz de géographie',
        description: 'Test sur les capitales',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 70,
        duree: 1800,
        nombreTentatives: 3,
        questions: questionsData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.quiz!.findUnique.mockResolvedValue(row);

      const found = await repository.findById(uuid1);

      expect(mockPrisma.quiz!.findUnique).toHaveBeenCalledWith({
        where: { id: uuid1 },
      });
      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(Quiz);
      expect(found?.title).toBe('Quiz de géographie');
      expect(found?.description).toBe('Test sur les capitales');
      expect(found?.status).toBe(QuizStatus.PUBLISHED);
      expect(found?.scoreMinimum).toBe(70);
      expect(found?.duree).toBe(1800);
      expect(found?.nombreTentatives).toBe(3);
      expect(found?.questions).toHaveLength(1);
      expect(found?.questions[0]).toBeInstanceOf(QuestionChoixUnique);

      const question = found?.questions[0] as QuestionChoixUnique;
      expect(question.question).toBe('Quelle est la capitale de la France?');
    });

    it('devrait retourner un Quiz avec questions choix multiple', async () => {
      const questionsData = [
        {
          question: 'Quels sont des langages de programmation?',
          type: TypeQuestion.CHOIX_MULTIPLE,
          points: 15,
          options: [
            { text: 'JavaScript', isCorrect: true },
            { text: 'Python', isCorrect: true },
            { text: 'HTML', isCorrect: false },
            { text: 'TypeScript', isCorrect: true },
          ],
          explication: 'HTML est un langage de balisage, pas de programmation',
        },
      ];

      const row: PrismaQuizRow = {
        id: uuid1,
        title: 'Quiz de programmation',
        description: 'Test sur les langages',
        status: QuizStatus.DRAFT,
        scoreMinimum: 50,
        duree: null,
        nombreTentatives: 2,
        questions: questionsData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.quiz!.findUnique.mockResolvedValue(row);

      const found = await repository.findById(uuid1);

      expect(found).not.toBeNull();
      expect(found?.questions[0]).toBeInstanceOf(QuestionChoixMultiple);

      const question = found?.questions[0] as QuestionChoixMultiple;
      expect(question.points).toBe(15);
      expect(found?.duree).toBeUndefined(); // null devient undefined
    });

    it('devrait retourner un Quiz avec plusieurs questions mixtes', async () => {
      const questionsData = [
        {
          question: 'Question 1',
          type: TypeQuestion.CHOIX_UNIQUE,
          points: 10,
          options: [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: false },
          ],
        },
        {
          question: 'Question 2',
          type: TypeQuestion.CHOIX_MULTIPLE,
          points: 20,
          options: [
            { text: 'X', isCorrect: true },
            { text: 'Y', isCorrect: true },
            { text: 'Z', isCorrect: false },
          ],
        },
        {
          question: 'Question 3',
          type: TypeQuestion.CHOIX_UNIQUE,
          points: 15,
          options: [
            { text: '1', isCorrect: false },
            { text: '2', isCorrect: true },
          ],
          explication: 'Explication question 3',
        },
      ];

      const row: PrismaQuizRow = {
        id: uuid1,
        title: 'Quiz mixte',
        description: 'Questions variées',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 60,
        duree: 3600,
        nombreTentatives: 1,
        questions: questionsData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.quiz!.findUnique.mockResolvedValue(row);

      const found = await repository.findById(uuid1);

      expect(found?.questions).toHaveLength(3);
      expect(found?.questions[0]).toBeInstanceOf(QuestionChoixUnique);
      expect(found?.questions[1]).toBeInstanceOf(QuestionChoixMultiple);
      expect(found?.questions[2]).toBeInstanceOf(QuestionChoixUnique);

      const question3 = found?.questions[2] as QuestionChoixUnique;
      expect(question3.explication).toBe('Explication question 3');
    });

    it('devrait retourner null si le quiz est introuvable', async () => {
      mockPrisma.quiz!.findUnique.mockResolvedValue(null);

      const found = await repository.findById('non-existent-id');

      expect(mockPrisma.quiz!.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      expect(found).toBeNull();
    });

    it('devrait gérer un quiz sans questions', async () => {
      const row: PrismaQuizRow = {
        id: uuid1,
        title: 'Quiz vide',
        description: 'Sans questions',
        status: QuizStatus.DRAFT,
        scoreMinimum: 0,
        duree: null,
        nombreTentatives: 3,
        questions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.quiz!.findUnique.mockResolvedValue(row);

      const found = await repository.findById(uuid1);

      expect(found).not.toBeNull();
      expect(found?.questions).toHaveLength(0);
    });

    it('devrait gérer les questions avec valeur null ou non-array', async () => {
      const row: PrismaQuizRow = {
        id: uuid1,
        title: 'Quiz test',
        description: 'Test null',
        status: QuizStatus.ARCHIVED,
        scoreMinimum: 80,
        duree: 600,
        nombreTentatives: 2,
        questions: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.quiz!.findUnique.mockResolvedValue(row);

      const found = await repository.findById(uuid1);

      expect(found).not.toBeNull();
      expect(found?.questions).toHaveLength(0);
    });

    it('devrait propager les erreurs de prisma', async () => {
      const error = new Error('Database connection failed');
      mockPrisma.quiz!.findUnique.mockRejectedValue(error);

      await expect(repository.findById(uuid1)).rejects.toThrow('Database connection failed');
    });

    it('devrait lever une erreur pour un type de question inconnu', async () => {
      const questionsData = [
        {
          question: 'Question invalide',
          type: 'TYPE_INCONNU',
          points: 10,
          options: [{ text: 'A', isCorrect: true }],
        },
      ];

      const row: PrismaQuizRow = {
        id: uuid1,
        title: 'Quiz invalide',
        description: 'Test erreur',
        status: QuizStatus.DRAFT,
        scoreMinimum: 50,
        duree: null,
        nombreTentatives: 1,
        questions: questionsData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.quiz!.findUnique.mockResolvedValue(row);

      await expect(repository.findById(uuid1)).rejects.toThrow(
        'TypeQuestion inconnu: TYPE_INCONNU'
      );
    });
  });

  describe('findAll(params)', () => {
    it('devrait utiliser skip/take et retourner la pagination correcte', async () => {
      const questionsData = [
        {
          question: 'Test',
          type: TypeQuestion.CHOIX_UNIQUE,
          points: 10,
          options: [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: false },
          ],
        },
      ];

      const rows: PrismaQuizRow[] = [
        {
          id: uuid1,
          title: 'Quiz 1',
          description: 'Description 1',
          status: QuizStatus.DRAFT,
          scoreMinimum: 70,
          duree: 1800,
          nombreTentatives: 3,
          questions: questionsData,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: uuid2,
          title: 'Quiz 2',
          description: 'Description 2',
          status: QuizStatus.PUBLISHED,
          scoreMinimum: 60,
          duree: null,
          nombreTentatives: 2,
          questions: [],
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      mockPrisma.quiz!.findMany.mockResolvedValue(rows);
      mockPrisma.quiz!.count.mockResolvedValue(20);

      const params = { page: 3, limit: 5 };
      const result = await repository.findAll(params);

      expect(mockPrisma.quiz!.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrisma.quiz!.count).toHaveBeenCalled();

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(Quiz);
      expect(result.data[0].title).toBe('Quiz 1');
      expect(result.data[1].title).toBe('Quiz 2');

      expect(result.pagination).toEqual({
        page: 3,
        limit: 5,
        total: 20,
        totalPages: 4,
      });
    });

    it('devrait gérer la première page', async () => {
      mockPrisma.quiz!.findMany.mockResolvedValue([]);
      mockPrisma.quiz!.count.mockResolvedValue(0);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(mockPrisma.quiz!.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      expect(result.data).toEqual([]);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('devrait gérer tous les statuts de quiz', async () => {
      const rows: PrismaQuizRow[] = [
        {
          id: randomUUID(),
          title: 'Quiz Draft',
          description: 'Desc',
          status: QuizStatus.DRAFT,
          scoreMinimum: 50,
          duree: 600,
          nombreTentatives: 1,
          questions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: randomUUID(),
          title: 'Quiz Published',
          description: 'Desc',
          status: QuizStatus.PUBLISHED,
          scoreMinimum: 70,
          duree: 1200,
          nombreTentatives: 2,
          questions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: randomUUID(),
          title: 'Quiz Archived',
          description: 'Desc',
          status: QuizStatus.ARCHIVED,
          scoreMinimum: 80,
          duree: null,
          nombreTentatives: 3,
          questions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.quiz!.findMany.mockResolvedValue(rows);
      mockPrisma.quiz!.count.mockResolvedValue(3);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(3);
      expect(result.data[0].status).toBe(QuizStatus.DRAFT);
      expect(result.data[1].status).toBe(QuizStatus.PUBLISHED);
      expect(result.data[2].status).toBe(QuizStatus.ARCHIVED);
    });

    it('devrait propager les erreurs de findMany', async () => {
      mockPrisma.quiz!.findMany.mockRejectedValue(new Error('Query failed'));
      mockPrisma.quiz!.count.mockResolvedValue(0);

      await expect(repository.findAll({ page: 1, limit: 10 })).rejects.toThrow('Query failed');
    });

    it('devrait propager les erreurs de count', async () => {
      mockPrisma.quiz!.findMany.mockResolvedValue([]);
      mockPrisma.quiz!.count.mockRejectedValue(new Error('Count failed'));

      await expect(repository.findAll({ page: 1, limit: 10 })).rejects.toThrow('Count failed');
    });
  });

  describe('update(quiz)', () => {
    it('devrait mettre à jour un quiz avec questions choix unique', async () => {
      const options: QuestionOption[] = [
        { text: 'Réponse A', isCorrect: true },
        { text: 'Réponse B', isCorrect: false },
      ];

      const question = new QuestionChoixUnique('Question test?', 10, options, 'Explication');

      const domainQuiz = new Quiz({
        id: EntityId.from(uuid1),
        title: 'Quiz modifié',
        description: 'Description modifiée',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 75,
        duree: 2400,
        nombreTentatives: 2,
        questions: [question],
      });

      const updatedRow: PrismaQuizRow = {
        id: uuid1,
        title: 'Quiz modifié',
        description: 'Description modifiée',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 75,
        duree: 2400,
        nombreTentatives: 2,
        questions: [question.toDTO()],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      };

      mockPrisma.quiz!.update.mockResolvedValue(updatedRow);

      const result = await repository.update(domainQuiz);

      expect(mockPrisma.quiz!.update).toHaveBeenCalledWith({
        where: { id: uuid1 },
        data: {
          title: 'Quiz modifié',
          description: 'Description modifiée',
          status: QuizStatus.PUBLISHED,
          scoreMinimum: 75,
          duree: 2400,
          nombreTentatives: 2,
          questions: [
            {
              question: 'Question test?',
              type: TypeQuestion.CHOIX_UNIQUE,
              points: 10,
              options,
              explication: 'Explication',
            },
          ],
        },
      });

      expect(result).toBeInstanceOf(Quiz);
      expect(result.title).toBe('Quiz modifié');
      expect(result.duree).toBe(2400);
      expect(result.questions).toHaveLength(1);
    });

    it('devrait mettre à jour un quiz avec questions choix multiple', async () => {
      const options: QuestionOption[] = [
        { text: 'Option 1', isCorrect: true },
        { text: 'Option 2', isCorrect: true },
        { text: 'Option 3', isCorrect: false },
      ];

      const question = new QuestionChoixMultiple(
        'Sélectionnez toutes les bonnes réponses',
        20,
        options
      );

      const domainQuiz = new Quiz({
        id: EntityId.from(uuid2),
        title: 'Quiz choix multiple',
        description: 'Test',
        status: QuizStatus.DRAFT,
        scoreMinimum: 50,
        duree: undefined,
        nombreTentatives: 3,
        questions: [question],
      });

      const updatedRow: PrismaQuizRow = {
        id: uuid2,
        title: 'Quiz choix multiple',
        description: 'Test',
        status: QuizStatus.DRAFT,
        scoreMinimum: 50,
        duree: null,
        nombreTentatives: 3,
        questions: [question.toDTO()],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.quiz!.update.mockResolvedValue(updatedRow);

      const result = await repository.update(domainQuiz);

      expect(mockPrisma.quiz!.update).toHaveBeenCalledWith({
        where: { id: uuid2 },
        data: {
          title: 'Quiz choix multiple',
          description: 'Test',
          status: QuizStatus.DRAFT,
          scoreMinimum: 50,
          duree: null, // undefined devient null
          nombreTentatives: 3,
          questions: [
            {
              question: 'Sélectionnez toutes les bonnes réponses',
              type: TypeQuestion.CHOIX_MULTIPLE,
              points: 20,
              options,
              explication: undefined,
            },
          ],
        },
      });

      expect(result.duree).toBeUndefined();
    });

    it('devrait mettre à jour un quiz sans questions', async () => {
      const domainQuiz = new Quiz({
        id: EntityId.from(uuid1),
        title: 'Quiz vide',
        description: 'Sans questions',
        status: QuizStatus.DRAFT,
        scoreMinimum: 60,
        duree: 900,
        nombreTentatives: 1,
        questions: [],
      });

      const updatedRow: PrismaQuizRow = {
        id: uuid1,
        title: 'Quiz vide',
        description: 'Sans questions',
        status: QuizStatus.DRAFT,
        scoreMinimum: 60,
        duree: 900,
        nombreTentatives: 1,
        questions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.quiz!.update.mockResolvedValue(updatedRow);

      const result = await repository.update(domainQuiz);

      expect(result.questions).toHaveLength(0);
    });

    it('devrait mettre à jour un quiz avec plusieurs questions mixtes', async () => {
      const question1 = new QuestionChoixUnique('Q1', 10, [
        { text: 'A', isCorrect: true },
        { text: 'B', isCorrect: false },
      ]);

      const question2 = new QuestionChoixMultiple('Q2', 15, [
        { text: 'X', isCorrect: true },
        { text: 'Y', isCorrect: true },
        { text: 'Z', isCorrect: false },
      ]);

      const question3 = new QuestionChoixUnique('Q3', 5, [
        { text: '1', isCorrect: false },
        { text: '2', isCorrect: true },
      ]);

      const domainQuiz = new Quiz({
        id: EntityId.from(uuid1),
        title: 'Quiz complet',
        description: 'Plusieurs questions',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 70,
        duree: 3000,
        nombreTentatives: 2,
        questions: [question1, question2, question3],
      });

      const updatedRow: PrismaQuizRow = {
        id: uuid1,
        title: 'Quiz complet',
        description: 'Plusieurs questions',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 70,
        duree: 3000,
        nombreTentatives: 2,
        questions: [question1.toDTO(), question2.toDTO(), question3.toDTO()],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.quiz!.update.mockResolvedValue(updatedRow);

      const result = await repository.update(domainQuiz);

      expect(result.questions).toHaveLength(3);
      expect(result.questions[0]).toBeInstanceOf(QuestionChoixUnique);
      expect(result.questions[1]).toBeInstanceOf(QuestionChoixMultiple);
      expect(result.questions[2]).toBeInstanceOf(QuestionChoixUnique);
    });

    it('devrait gérer tous les statuts de quiz', async () => {
      const statuses = [QuizStatus.DRAFT, QuizStatus.PUBLISHED, QuizStatus.ARCHIVED];

      for (const status of statuses) {
        const domainQuiz = new Quiz({
          id: EntityId.from(uuid1),
          title: `Quiz ${status}`,
          description: 'Test',
          status,
          scoreMinimum: 50,
          duree: 600,
          nombreTentatives: 3,
          questions: [],
        });

        const updatedRow: PrismaQuizRow = {
          id: uuid1,
          title: `Quiz ${status}`,
          description: 'Test',
          status,
          scoreMinimum: 50,
          duree: 600,
          nombreTentatives: 3,
          questions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrisma.quiz!.update.mockResolvedValue(updatedRow);

        const result = await repository.update(domainQuiz);

        expect(result.status).toBe(status);
      }
    });

    it('devrait gérer différents scores minimum', async () => {
      const scores = [0, 50, 70, 80, 100];

      for (const score of scores) {
        const domainQuiz = new Quiz({
          id: EntityId.from(uuid1),
          title: 'Quiz test',
          description: 'Test',
          status: QuizStatus.DRAFT,
          scoreMinimum: score,
          duree: 600,
          nombreTentatives: 1,
          questions: [],
        });

        const updatedRow: PrismaQuizRow = {
          id: uuid1,
          title: 'Quiz test',
          description: 'Test',
          status: QuizStatus.DRAFT,
          scoreMinimum: score,
          duree: 600,
          nombreTentatives: 1,
          questions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrisma.quiz!.update.mockResolvedValue(updatedRow);

        const result = await repository.update(domainQuiz);

        expect(result.scoreMinimum).toBe(score);
      }
    });

    it('devrait gérer différents nombres de tentatives', async () => {
      const tentatives = [1, 2, 3];

      for (const tentative of tentatives) {
        const domainQuiz = new Quiz({
          id: EntityId.from(uuid1),
          title: 'Quiz test',
          description: 'Test',
          status: QuizStatus.DRAFT,
          scoreMinimum: 50,
          duree: 600,
          nombreTentatives: tentative,
          questions: [],
        });

        const updatedRow: PrismaQuizRow = {
          id: uuid1,
          title: 'Quiz test',
          description: 'Test',
          status: QuizStatus.DRAFT,
          scoreMinimum: 50,
          duree: 600,
          nombreTentatives: tentative,
          questions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrisma.quiz!.update.mockResolvedValue(updatedRow);

        const result = await repository.update(domainQuiz);

        expect(result.nombreTentatives).toBe(tentative);
      }
    });

    it('devrait propager les erreurs de update', async () => {
      const domainQuiz = new Quiz({
        id: EntityId.from(uuid1),
        title: 'Test',
        description: 'Test',
        status: QuizStatus.DRAFT,
        scoreMinimum: 50,
        duree: 600,
        nombreTentatives: 1,
        questions: [],
      });

      const error = new Error('Update failed');
      mockPrisma.quiz!.update.mockRejectedValue(error);

      await expect(repository.update(domainQuiz)).rejects.toThrow('Update failed');
    });
  });

  describe('Mapping privé - toDomain', () => {
    it('devrait mapper correctement avec plusieurs questions de types différents', async () => {
      const questionsData = [
        {
          question: 'Question unique 1',
          type: TypeQuestion.CHOIX_UNIQUE,
          points: 10,
          options: [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: false },
          ],
          explication: 'Explication 1',
        },
        {
          question: 'Question multiple 1',
          type: TypeQuestion.CHOIX_MULTIPLE,
          points: 20,
          options: [
            { text: 'X', isCorrect: true },
            { text: 'Y', isCorrect: true },
            { text: 'Z', isCorrect: false },
          ],
        },
        {
          question: 'Question unique 2',
          type: TypeQuestion.CHOIX_UNIQUE,
          points: 15,
          options: [
            { text: '1', isCorrect: false },
            { text: '2', isCorrect: true },
          ],
        },
      ];

      const row: PrismaQuizRow = {
        id: uuid1,
        title: 'Quiz complet',
        description: 'Description complète',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 80,
        duree: 3600,
        nombreTentatives: 3,
        questions: questionsData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.quiz!.findUnique.mockResolvedValue(row);

      const found = await repository.findById(uuid1);

      expect(found).not.toBeNull();
      expect(found?.questions).toHaveLength(3);
      expect(found?.questions[0]).toBeInstanceOf(QuestionChoixUnique);

      const question1 = found?.questions[0] as QuestionChoixUnique;
      expect(question1.question).toBe('Question unique 1');
      expect(question1.points).toBe(10);
      expect(question1.explication).toBe('Explication 1');

      expect(found?.questions[1]).toBeInstanceOf(QuestionChoixMultiple);
      const question2 = found?.questions[1] as QuestionChoixMultiple;
      expect(question2.question).toBe('Question multiple 1');
      expect(question2.points).toBe(20);

      expect(found?.questions[2]).toBeInstanceOf(QuestionChoixUnique);
    });
  });

  describe('Mapping privé - toPrismaUpdateData', () => {
    it('devrait transformer correctement les questions en DTO pour Prisma', async () => {
      const question1 = new QuestionChoixUnique('Question A', 10, [
        { text: 'Option 1', isCorrect: true },
        { text: 'Option 2', isCorrect: false },
      ]);

      const question2 = new QuestionChoixMultiple('Question B', 15, [
        { text: 'Choice X', isCorrect: true },
        { text: 'Choice Y', isCorrect: true },
        { text: 'Choice Z', isCorrect: false },
      ]);

      const domainQuiz = new Quiz({
        id: EntityId.from(uuid1),
        title: 'Test mapping',
        description: 'Test',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 70,
        duree: 1800,
        nombreTentatives: 2,
        questions: [question1, question2],
      });

      const updatedRow: PrismaQuizRow = {
        id: uuid1,
        title: 'Test mapping',
        description: 'Test',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 70,
        duree: 1800,
        nombreTentatives: 2,
        questions: [question1.toDTO(), question2.toDTO()],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.quiz!.update.mockResolvedValue(updatedRow);

      await repository.update(domainQuiz);

      const callArgs = mockPrisma.quiz!.update.mock.calls[0][0];
      expect(callArgs.data.questions).toEqual([
        {
          question: 'Question A',
          type: TypeQuestion.CHOIX_UNIQUE,
          points: 10,
          options: [
            { text: 'Option 1', isCorrect: true },
            { text: 'Option 2', isCorrect: false },
          ],
          explication: undefined,
        },
        {
          question: 'Question B',
          type: TypeQuestion.CHOIX_MULTIPLE,
          points: 15,
          options: [
            { text: 'Choice X', isCorrect: true },
            { text: 'Choice Y', isCorrect: true },
            { text: 'Choice Z', isCorrect: false },
          ],
          explication: undefined,
        },
      ]);
    });
  });
});
