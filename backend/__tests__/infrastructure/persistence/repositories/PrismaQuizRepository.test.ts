// __tests__/infrastructure/persistence/repositories/PrismaQuizRepository.test.ts

import { PrismaQuizRepository } from '@/infrastructure/persistence/repositories/PrismaQuizRepository';
import { EntityId } from '@/domain/shared/EntityId';
import { Quiz, QuizStatus } from '@/domain/formations/entities/Quiz';
import {
  QuestionChoixUnique,
  QuestionChoixMultiple,
  TypeQuestion,
} from '@/domain/formations/entities/Question';

describe('PrismaQuizRepository', () => {
  const makePrismaMock = () => ({
    quiz: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  });

  const makePrismaQuiz = (overrides: Partial<any> = {}) => {
    const quizId = EntityId.generate().getValue();

    return {
      id: quizId,
      moduleId: 'module-123',
      lessonId: null,
      chapterId: null,
      title: 'Quiz de test',
      description: 'Description du quiz',
      status: 'DRAFT',
      scoreMinimum: 70,
      duree: 600,
      nombreTentatives: 3,
      questions: [
        {
          type: TypeQuestion.CHOIX_UNIQUE,
          question: 'Question à choix unique?',
          points: 10,
          options: [
            { label: 'Réponse A', isCorrect: true },
            { label: 'Réponse B', isCorrect: false },
          ],
          explication: 'Explication de la réponse',
        },
        {
          type: TypeQuestion.CHOIX_MULTIPLE,
          question: 'Question à choix multiples?',
          points: 20,
          options: [
            { label: 'Réponse A', isCorrect: true },
            { label: 'Réponse B', isCorrect: true },
            { label: 'Réponse C', isCorrect: false },
          ],
          explication: 'Plusieurs réponses possibles',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  describe('findById', () => {
    it('devrait retourner null si le quiz prisma est introuvable', async () => {
      const prisma = makePrismaMock();
      prisma.quiz.findUnique.mockResolvedValueOnce(null);

      const repo = new PrismaQuizRepository(prisma as any);

      const result = await repo.findById('unknown-id');

      expect(result).toBeNull();
      expect(prisma.quiz.findUnique).toHaveBeenCalledWith({
        where: { id: 'unknown-id' },
      });
    });

    it('devrait mapper Prisma -> Domain Quiz avec toutes les propriétés', async () => {
      const prisma = makePrismaMock();
      const prismaQuiz = makePrismaQuiz();
      prisma.quiz.findUnique.mockResolvedValueOnce(prismaQuiz);

      const repo = new PrismaQuizRepository(prisma as any);

      const result = await repo.findById(prismaQuiz.id);

      expect(result).toBeInstanceOf(Quiz);
      expect(result?.id.getValue()).toBe(prismaQuiz.id);
      expect(result?.moduleId).toBe('module-123');
      expect(result?.lessonId).toBeUndefined();
      expect(result?.chapterId).toBeUndefined();
      expect(result?.title).toBe('Quiz de test');
      expect(result?.description).toBe('Description du quiz');
      expect(result?.status).toBe(QuizStatus.DRAFT);
      expect(result?.scoreMinimum).toBe(70);
      expect(result?.duree).toBe(600);
      expect(result?.nombreTentatives).toBe(3);
      expect(result?.questions).toHaveLength(2);
    });

    it('devrait mapper correctement les questions du quiz', async () => {
      const prisma = makePrismaMock();
      const prismaQuiz = makePrismaQuiz();
      prisma.quiz.findUnique.mockResolvedValueOnce(prismaQuiz);

      const repo = new PrismaQuizRepository(prisma as any);

      const result = await repo.findById(prismaQuiz.id);

      // Vérifier question choix unique
      expect(result?.questions[0]).toBeInstanceOf(QuestionChoixUnique);
      expect(result?.questions[0].question).toBe('Question à choix unique?');
      expect(result?.questions[0].points).toBe(10);

      // Vérifier question choix multiple
      expect(result?.questions[1]).toBeInstanceOf(QuestionChoixMultiple);
      expect(result?.questions[1].question).toBe('Question à choix multiples?');
      expect(result?.questions[1].points).toBe(20);
    });

    it('devrait convertir null en undefined pour les champs optionnels', async () => {
      const prisma = makePrismaMock();
      const prismaQuiz = makePrismaQuiz({
        moduleId: null,
        lessonId: null,
        chapterId: null,
        duree: null,
      });
      prisma.quiz.findUnique.mockResolvedValueOnce(prismaQuiz);

      const repo = new PrismaQuizRepository(prisma as any);

      const result = await repo.findById(prismaQuiz.id);

      expect(result?.moduleId).toBeUndefined();
      expect(result?.lessonId).toBeUndefined();
      expect(result?.chapterId).toBeUndefined();
      expect(result?.duree).toBeUndefined();
      expect(result?.isIllimite).toBe(true);
    });

    it('devrait calculer correctement totalPoints', async () => {
      const prisma = makePrismaMock();
      const prismaQuiz = makePrismaQuiz();
      prisma.quiz.findUnique.mockResolvedValueOnce(prismaQuiz);

      const repo = new PrismaQuizRepository(prisma as any);

      const result = await repo.findById(prismaQuiz.id);

      expect(result?.totalPoints).toBe(30); // 10 + 20
    });
  });

  describe('findAll', () => {
    it('devrait retourner une pagination avec les quizzes mappés', async () => {
      const prisma = makePrismaMock();

      const quiz1 = makePrismaQuiz({ title: 'Quiz 1' });
      const quiz2 = makePrismaQuiz({ title: 'Quiz 2' });

      prisma.quiz.findMany.mockResolvedValueOnce([quiz1, quiz2]);
      prisma.quiz.count.mockResolvedValueOnce(10);

      const repo = new PrismaQuizRepository(prisma as any);

      const result = await repo.findAll({ page: 2, limit: 2 });

      expect(prisma.quiz.findMany).toHaveBeenCalledWith({
        skip: 2, // (page-1)*limit = (2-1)*2
        take: 2,
        orderBy: { createdAt: 'desc' },
      });

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(Quiz);
      expect(result.data[0].title).toBe('Quiz 1');
      expect(result.data[1].title).toBe('Quiz 2');

      expect(result.pagination).toEqual({
        page: 2,
        limit: 2,
        total: 10,
        totalPages: 5, // ceil(10/2)
      });
    });

    it('devrait gérer une page sans résultats', async () => {
      const prisma = makePrismaMock();

      prisma.quiz.findMany.mockResolvedValueOnce([]);
      prisma.quiz.count.mockResolvedValueOnce(0);

      const repo = new PrismaQuizRepository(prisma as any);

      const result = await repo.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(0);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });

    it('devrait calculer correctement totalPages avec reste', async () => {
      const prisma = makePrismaMock();

      const quizzes = [makePrismaQuiz(), makePrismaQuiz(), makePrismaQuiz()];
      prisma.quiz.findMany.mockResolvedValueOnce(quizzes);
      prisma.quiz.count.mockResolvedValueOnce(7);

      const repo = new PrismaQuizRepository(prisma as any);

      const result = await repo.findAll({ page: 1, limit: 3 });

      expect(result.pagination.totalPages).toBe(3); // ceil(7/3)
    });
  });

  describe('update', () => {
    it('devrait mettre à jour un quiz et le retourner mappé', async () => {
      const prisma = makePrismaMock();

      const quizId = EntityId.generate().getValue();

      // Quiz domain à mettre à jour
      const domainQuiz = new Quiz({
        id: EntityId.from(quizId),
        moduleId: 'module-456',
        lessonId: 'lesson-789',
        title: 'Quiz mis à jour',
        description: 'Nouvelle description',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 80,
        duree: 1200,
        nombreTentatives: 2,
        questions: [
          new QuestionChoixUnique(
            'Question mise à jour?',
            15,
            [
              { text: 'Oui', isCorrect: true },
              { text: 'Non', isCorrect: false },
            ],
            'Explication mise à jour'
          ),
        ],
      });

      // Quiz Prisma après update
      const updatedPrismaQuiz = {
        id: quizId,
        moduleId: 'module-456',
        lessonId: 'lesson-789',
        chapterId: null,
        title: 'Quiz mis à jour',
        description: 'Nouvelle description',
        status: 'PUBLISHED',
        scoreMinimum: 80,
        duree: 1200,
        nombreTentatives: 2,
        questions: [
          {
            type: TypeQuestion.CHOIX_UNIQUE,
            question: 'Question mise à jour?',
            points: 15,
            options: [
              { label: 'Oui', isCorrect: true },
              { label: 'Non', isCorrect: false },
            ],
            explication: 'Explication mise à jour',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.quiz.update.mockResolvedValueOnce(updatedPrismaQuiz);

      const repo = new PrismaQuizRepository(prisma as any);

      const result = await repo.update(domainQuiz);

      expect(prisma.quiz.update).toHaveBeenCalledTimes(1);
      const updateArgs = prisma.quiz.update.mock.calls[0][0];

      expect(updateArgs.where).toEqual({ id: quizId });
      expect(updateArgs.data).toEqual({
        title: 'Quiz mis à jour',
        description: 'Nouvelle description',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 80,
        duree: 1200,
        nombreTentatives: 2,
        questions: expect.any(Array),
      });

      expect(result).toBeInstanceOf(Quiz);
      expect(result.title).toBe('Quiz mis à jour');
      expect(result.status).toBe(QuizStatus.PUBLISHED);
    });

    it("devrait convertir duree undefined en null lors de l'update", async () => {
      const prisma = makePrismaMock();

      const quizId = EntityId.generate().getValue();

      const domainQuiz = new Quiz({
        id: EntityId.from(quizId),
        title: 'Quiz illimité',
        description: 'Sans limite de temps',
        status: QuizStatus.DRAFT,
        scoreMinimum: 50,
        duree: undefined, // Pas de limite de temps
        nombreTentatives: 1,
        questions: [],
      });

      const updatedPrismaQuiz = makePrismaQuiz({
        id: quizId,
        title: 'Quiz illimité',
        duree: null,
        questions: [],
      });

      prisma.quiz.update.mockResolvedValueOnce(updatedPrismaQuiz);

      const repo = new PrismaQuizRepository(prisma as any);

      await repo.update(domainQuiz);

      const updateArgs = prisma.quiz.update.mock.calls[0][0];

      expect(updateArgs.data.duree).toBeNull();
    });

    it('devrait sérialiser correctement les questions en JSON', async () => {
      const prisma = makePrismaMock();

      const quizId = EntityId.generate().getValue();

      const domainQuiz = new Quiz({
        id: EntityId.from(quizId),
        title: 'Quiz',
        description: 'Test',
        status: QuizStatus.DRAFT,
        scoreMinimum: 60,
        nombreTentatives: 3,
        questions: [
          new QuestionChoixUnique(
            'Q1',
            10,
            [
              { text: 'A', isCorrect: true },
              { text: 'B', isCorrect: false },
            ],
            'Exp'
          ),
          new QuestionChoixMultiple(
            'Q2',
            20,
            [
              { text: 'A', isCorrect: true },
              { text: 'B', isCorrect: true },
              { text: 'C', isCorrect: false },
            ],
            'Exp2'
          ),
        ],
      });

      const updatedPrismaQuiz = makePrismaQuiz({ id: quizId });
      prisma.quiz.update.mockResolvedValueOnce(updatedPrismaQuiz);

      const repo = new PrismaQuizRepository(prisma as any);

      await repo.update(domainQuiz);

      const updateArgs = prisma.quiz.update.mock.calls[0][0];
      const questions = updateArgs.data.questions as any[];

      expect(Array.isArray(questions)).toBe(true);
      expect(questions).toHaveLength(2);
      expect(questions[0]).toHaveProperty('type');
      expect(questions[0]).toHaveProperty('question');
      expect(questions[0]).toHaveProperty('points');
      expect(questions[0]).toHaveProperty('options');
      expect(questions[0]).toHaveProperty('explication');
    });

    it('devrait gérer tous les statuts de quiz', async () => {
      const prisma = makePrismaMock();

      const statuses = [QuizStatus.DRAFT, QuizStatus.PUBLISHED, QuizStatus.ARCHIVED];

      for (const status of statuses) {
        const quizId = EntityId.generate().getValue();

        const domainQuiz = new Quiz({
          id: EntityId.from(quizId),
          title: `Quiz ${status}`,
          description: 'Description',
          status,
          scoreMinimum: 50,
          nombreTentatives: 1,
          questions: [],
        });

        const updatedPrismaQuiz = makePrismaQuiz({
          id: quizId,
          status,
          questions: [],
        });

        prisma.quiz.update.mockResolvedValueOnce(updatedPrismaQuiz);

        const repo = new PrismaQuizRepository(prisma as any);
        const result = await repo.update(domainQuiz);

        expect(result.status).toBe(status);
      }
    });
  });

  describe('Edge cases', () => {
    it('devrait gérer un quiz sans questions', async () => {
      const prisma = makePrismaMock();
      const prismaQuiz = makePrismaQuiz({ questions: [] });
      prisma.quiz.findUnique.mockResolvedValueOnce(prismaQuiz);

      const repo = new PrismaQuizRepository(prisma as any);

      const result = await repo.findById(prismaQuiz.id);

      expect(result?.questions).toHaveLength(0);
      expect(result?.totalPoints).toBe(0);
    });

    it('devrait gérer questions qui est null', async () => {
      const prisma = makePrismaMock();
      const prismaQuiz = makePrismaQuiz({ questions: null });
      prisma.quiz.findUnique.mockResolvedValueOnce(prismaQuiz);

      const repo = new PrismaQuizRepository(prisma as any);

      const result = await repo.findById(prismaQuiz.id);

      expect(result?.questions).toHaveLength(0);
    });

    it('devrait gérer les valeurs limites de scoreMinimum', async () => {
      const prisma = makePrismaMock();

      const quiz0 = makePrismaQuiz({ scoreMinimum: 0 });
      const quiz100 = makePrismaQuiz({ scoreMinimum: 100 });

      prisma.quiz.findUnique.mockResolvedValueOnce(quiz0);
      const repo = new PrismaQuizRepository(prisma as any);
      const result0 = await repo.findById(quiz0.id);
      expect(result0?.scoreMinimum).toBe(0);

      prisma.quiz.findUnique.mockResolvedValueOnce(quiz100);
      const result100 = await repo.findById(quiz100.id);
      expect(result100?.scoreMinimum).toBe(100);
    });

    it('devrait gérer les valeurs limites de nombreTentatives', async () => {
      const prisma = makePrismaMock();

      const quiz1 = makePrismaQuiz({ nombreTentatives: 1 });
      const quiz3 = makePrismaQuiz({ nombreTentatives: 3 });

      prisma.quiz.findUnique.mockResolvedValueOnce(quiz1);
      const repo = new PrismaQuizRepository(prisma as any);
      const result1 = await repo.findById(quiz1.id);
      expect(result1?.nombreTentatives).toBe(1);

      prisma.quiz.findUnique.mockResolvedValueOnce(quiz3);
      const result3 = await repo.findById(quiz3.id);
      expect(result3?.nombreTentatives).toBe(3);
    });
  });

  describe('delete', () => {
    it('should call prisma.quiz.delete with id', async () => {
      const prisma = makePrismaMock();
      prisma.quiz.delete.mockResolvedValueOnce(makePrismaQuiz());

      const repo = new PrismaQuizRepository(prisma as any);

      await repo.delete('quiz-1');

      expect(prisma.quiz.delete).toHaveBeenCalledWith({
        where: { id: 'quiz-1' },
      });
    });
  });
});
