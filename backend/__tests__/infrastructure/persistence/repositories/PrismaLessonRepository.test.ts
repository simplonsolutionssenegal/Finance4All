// __tests__/infrastructure/persistence/repositories/PrismaLessonRepository.test.ts

import { PrismaLessonRepository } from '@/infrastructure/persistence/repositories/PrismaLessonRepository';
import { EntityId } from '@/domain/shared/EntityId';
import { Lesson, LessonStatus } from '@/domain/formations/entities/Lesson';
import { Chapter } from '@/domain/formations/entities/Chapter';
import { Quiz, QuizStatus } from '@/domain/formations/entities/Quiz';
import {
  QuestionChoixUnique,
  QuestionChoixMultiple,
  TypeQuestion,
} from '@/domain/formations/entities/Question';

describe('PrismaLessonRepository', () => {
  const makePrismaMock = () => ({
    lesson: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  });

  const makePrismaLesson = (overrides: Partial<any> = {}) => {
    const lessonId = EntityId.generate().getValue();
    const chapterId = EntityId.generate().getValue();
    const quizId = EntityId.generate().getValue();

    return {
      id: lessonId,
      moduleId: 'module-1',
      title: 'Lesson title',
      description: 'Lesson desc',
      duration: 30,
      order: 0,
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
      chapters: [
        {
          id: chapterId,
          title: 'Chap 1',
          description: 'Chap desc',
          mediaId: null,
          order: 0,
          lessonId,
          createdAt: new Date(),
          updatedAt: new Date(),
          media: null,
        },
      ],
      quizzes: [
        {
          id: quizId,
          moduleId: null,
          lessonId,
          chapterId: null,
          title: 'Quiz 1',
          description: 'Quiz desc',
          status: 'DRAFT',
          scoreMinimum: 50,
          duree: 600,
          nombreTentatives: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          questions: [
            {
              type: TypeQuestion.CHOIX_UNIQUE,
              question: 'Q1',
              points: 10,
              options: [
                { label: 'A', isCorrect: true },
                { label: 'B', isCorrect: false },
              ],
              explication: 'exp',
            },
            {
              type: TypeQuestion.CHOIX_MULTIPLE,
              question: 'Q2',
              points: 20,
              options: [
                { label: 'A', isCorrect: true },
                { label: 'B', isCorrect: true },
              ],
              explication: 'exp2',
            },
          ],
        },
      ],
      ...overrides,
    };
  };

  describe('findById', () => {
    const uuid = () => EntityId.generate().getValue();

    it('devrait retourner null si la lesson prisma est introuvable', async () => {
      const prisma = makePrismaMock();
      prisma.lesson.findUnique.mockResolvedValueOnce(null);

      const repo = new PrismaLessonRepository(prisma as any);

      const result = await repo.findById('unknown');

      expect(result).toBeNull();
      expect(prisma.lesson.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'unknown' },
          include: {
            chapters: { include: { media: true } },
            quizzes: true,
          },
        })
      );
    });

    it('devrait mapper Prisma -> Domain (chapters + quizzes + questions)', async () => {
      const prisma = makePrismaMock();
      const prismaLesson = makePrismaLesson();
      prisma.lesson.findUnique.mockResolvedValueOnce(prismaLesson);

      const repo = new PrismaLessonRepository(prisma as any);

      const result = await repo.findById(prismaLesson.id);

      expect(result).toBeInstanceOf(Lesson);
      expect(result?.id.getValue()).toBe(prismaLesson.id);
      expect(result?.moduleId).toBe('module-1');
      expect(result?.title).toBe('Lesson title');
      expect(result?.description).toBe('Lesson desc');
      expect(result?.duration).toBe(30);
      expect(result?.order).toBe(0);
      expect(result?.status).toBe(LessonStatus.DRAFT);
      expect(result?.chapters).toHaveLength(1);
      expect(result?.quizzes).toHaveLength(1);
    });

    it('devrait mapper correctement les chapters', async () => {
      const prisma = makePrismaMock();
      const prismaLesson = makePrismaLesson();
      prisma.lesson.findUnique.mockResolvedValueOnce(prismaLesson);

      const repo = new PrismaLessonRepository(prisma as any);

      const result = await repo.findById(prismaLesson.id);

      expect(result?.chapters[0]).toBeInstanceOf(Chapter);
      expect(result?.chapters[0].title).toBe('Chap 1');
      expect(result?.chapters[0].description).toBe('Chap desc');
      expect(result?.chapters[0].order).toBe(0);
      expect(result?.chapters[0].mediaId).toBeUndefined(); // null → undefined
    });

    it('devrait mapper correctement les quizzes avec leurs questions', async () => {
      const prisma = makePrismaMock();
      const prismaLesson = makePrismaLesson();
      prisma.lesson.findUnique.mockResolvedValueOnce(prismaLesson);

      const repo = new PrismaLessonRepository(prisma as any);

      const result = await repo.findById(prismaLesson.id);

      expect(result?.quizzes[0]).toBeInstanceOf(Quiz);
      expect(result?.quizzes[0].title).toBe('Quiz 1');
      expect(result?.quizzes[0].questions).toHaveLength(2);
      expect(result?.quizzes[0].questions[0]).toBeInstanceOf(QuestionChoixUnique);
      expect(result?.quizzes[0].questions[1]).toBeInstanceOf(QuestionChoixMultiple);
    });

    it('devrait gérer un lesson avec mediaId défini', async () => {
      const prisma = makePrismaMock();

      const lessonId = uuid();
      const chapterId = uuid();
      const mediaId = uuid();

      const prismaLesson = makePrismaLesson({
        id: lessonId,
        chapters: [
          {
            id: chapterId,
            title: 'Chapter with media',
            description: 'Desc',
            mediaId,
            order: 0,
            lessonId,
            createdAt: new Date(),
            updatedAt: new Date(),
            media: { id: mediaId },
          },
        ],
      });

      prisma.lesson.findUnique.mockResolvedValueOnce(prismaLesson);

      const repo = new PrismaLessonRepository(prisma as any);

      const result = await repo.findById(prismaLesson.id);

      expect(result?.chapters[0].mediaId).toBe(mediaId);
    });

    it('devrait gérer un lesson sans chapters', async () => {
      const prisma = makePrismaMock();
      const prismaLesson = makePrismaLesson({ chapters: [] });
      prisma.lesson.findUnique.mockResolvedValueOnce(prismaLesson);

      const repo = new PrismaLessonRepository(prisma as any);

      const result = await repo.findById(prismaLesson.id);

      expect(result?.chapters).toHaveLength(0);
    });

    it('devrait gérer un lesson sans quizzes', async () => {
      const prisma = makePrismaMock();
      const prismaLesson = makePrismaLesson({ quizzes: [] });
      prisma.lesson.findUnique.mockResolvedValueOnce(prismaLesson);

      const repo = new PrismaLessonRepository(prisma as any);

      const result = await repo.findById(prismaLesson.id);

      expect(result?.quizzes).toHaveLength(0);
    });

    it('devrait convertir null en undefined pour duree du quiz', async () => {
      const prisma = makePrismaMock();

      const lessonId = uuid();
      const quizId = uuid();

      const prismaLesson = makePrismaLesson({
        id: lessonId,
        quizzes: [
          {
            id: quizId,
            moduleId: null,
            lessonId,
            chapterId: null,
            title: 'Quiz illimité',
            description: 'Desc',
            status: 'DRAFT',
            scoreMinimum: 50,
            duree: null,
            nombreTentatives: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            questions: [],
          },
        ],
      });

      prisma.lesson.findUnique.mockResolvedValueOnce(prismaLesson);

      const repo = new PrismaLessonRepository(prisma as any);

      const result = await repo.findById(prismaLesson.id);

      expect(result?.quizzes[0].duree).toBeUndefined();
      expect(result?.quizzes[0].isIllimite).toBe(true);
    });
  });

  describe('findAll', () => {
    it('devrait retourner une pagination + mapper les lessons', async () => {
      const prisma = makePrismaMock();

      const lesson1 = makePrismaLesson({ title: 'Lesson 1' });
      const lesson2 = makePrismaLesson({ title: 'Lesson 2' });

      prisma.lesson.findMany.mockResolvedValueOnce([lesson1, lesson2]);
      prisma.lesson.count.mockResolvedValueOnce(5);

      const repo = new PrismaLessonRepository(prisma as any);

      const result = await repo.findAll({ page: 2, limit: 2 });

      expect(prisma.lesson.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 2, // (page-1)*limit = (2-1)*2
          take: 2,
          orderBy: { createdAt: 'desc' },
          include: {
            chapters: { include: { media: true } },
            quizzes: true,
          },
        })
      );

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(Lesson);
      expect(result.data[0].title).toBe('Lesson 1');
      expect(result.data[1].title).toBe('Lesson 2');
      expect(result.pagination).toEqual({
        page: 2,
        limit: 2,
        total: 5,
        totalPages: 3, // ceil(5/2)
      });
    });

    it('devrait gérer une page sans résultats', async () => {
      const prisma = makePrismaMock();

      prisma.lesson.findMany.mockResolvedValueOnce([]);
      prisma.lesson.count.mockResolvedValueOnce(0);

      const repo = new PrismaLessonRepository(prisma as any);

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

      const lessons = [makePrismaLesson(), makePrismaLesson(), makePrismaLesson()];
      prisma.lesson.findMany.mockResolvedValueOnce(lessons);
      prisma.lesson.count.mockResolvedValueOnce(7);

      const repo = new PrismaLessonRepository(prisma as any);

      const result = await repo.findAll({ page: 1, limit: 3 });

      expect(result.pagination.totalPages).toBe(3); // ceil(7/3)
    });
  });

  describe('update', () => {
    it('devrait créer les nouveaux quizzes si certains sont absents côté prisma', async () => {
      const prisma = makePrismaMock();

      const lessonId = EntityId.generate().getValue();
      const quizAId = EntityId.generate().getValue();
      const quizBId = EntityId.generate().getValue();

      // Lesson existante avec seulement quizA
      prisma.lesson.findUnique.mockResolvedValueOnce({
        ...makePrismaLesson({ id: lessonId }),
        quizzes: [{ id: quizAId }],
      });

      // Domain lesson contient quizA + quizB (quizB est nouveau)
      const domainLesson = new Lesson({
        id: EntityId.from(lessonId),
        moduleId: 'module-1',
        title: 'Updated',
        description: 'Updated desc',
        duration: 10,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [
          new Quiz({
            id: EntityId.from(quizAId),
            lessonId,
            title: 'Quiz A',
            description: 'A',
            status: QuizStatus.DRAFT,
            scoreMinimum: 0,
            duree: undefined,
            nombreTentatives: 1,
            questions: [],
          }),
          new Quiz({
            id: EntityId.from(quizBId),
            lessonId,
            title: 'Quiz B',
            description: 'B',
            status: QuizStatus.DRAFT,
            scoreMinimum: 0,
            duree: undefined,
            nombreTentatives: 1,
            questions: [],
          }),
        ],
      });

      // Résultat de l'update Prisma
      const updatedPrismaLesson = makePrismaLesson({
        id: lessonId,
        title: 'Updated',
        description: 'Updated desc',
        duration: 10,
        quizzes: [
          {
            id: quizAId,
            moduleId: null,
            lessonId,
            chapterId: null,
            questions: [],
            status: 'DRAFT',
            title: 'Quiz A',
            description: 'A',
            scoreMinimum: 0,
            duree: null,
            nombreTentatives: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: quizBId,
            moduleId: null,
            lessonId,
            chapterId: null,
            questions: [],
            status: 'DRAFT',
            title: 'Quiz B',
            description: 'B',
            scoreMinimum: 0,
            duree: null,
            nombreTentatives: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        chapters: [],
      });

      prisma.lesson.update.mockResolvedValueOnce(updatedPrismaLesson);

      const repo = new PrismaLessonRepository(prisma as any);

      const result = await repo.update(domainLesson);

      // Vérifier que update a été appelé avec quizzes.create contenant seulement quizB
      expect(prisma.lesson.update).toHaveBeenCalledTimes(1);
      const updateArgs = prisma.lesson.update.mock.calls[0][0];

      expect(updateArgs.where).toEqual({ id: lessonId });
      expect(updateArgs.data).toEqual(
        expect.objectContaining({
          title: 'Updated',
          description: 'Updated desc',
          duration: 10,
          order: 0,
          status: LessonStatus.DRAFT,
          quizzes: {
            create: [
              expect.objectContaining({
                id: quizBId,
                title: 'Quiz B',
              }),
            ],
          },
        })
      );

      expect(result).toBeInstanceOf(Lesson);
      expect(result.title).toBe('Updated');
      expect(result.quizzes).toHaveLength(2);
    });

    it('devrait ne pas créer quizzes.create si aucun nouveau quiz', async () => {
      const prisma = makePrismaMock();

      const lessonId = EntityId.generate().getValue();
      const quizAId = EntityId.generate().getValue();

      prisma.lesson.findUnique.mockResolvedValueOnce({
        ...makePrismaLesson({ id: lessonId }),
        quizzes: [{ id: quizAId }],
      });

      const domainLesson = new Lesson({
        id: EntityId.from(lessonId),
        moduleId: 'module-1',
        title: 'Updated',
        description: 'Updated desc',
        duration: 10,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [
          new Quiz({
            id: EntityId.from(quizAId),
            lessonId,
            title: 'Quiz A',
            description: 'A',
            status: QuizStatus.DRAFT,
            scoreMinimum: 0,
            duree: undefined,
            nombreTentatives: 1,
            questions: [],
          }),
        ],
      });

      const updatedPrismaLesson = makePrismaLesson({
        id: lessonId,
        title: 'Updated',
        description: 'Updated desc',
        duration: 10,
        quizzes: [
          {
            id: quizAId,
            moduleId: null,
            lessonId,
            chapterId: null,
            questions: [],
            status: 'DRAFT',
            title: 'Quiz A',
            description: 'A',
            scoreMinimum: 0,
            duree: null,
            nombreTentatives: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        chapters: [],
      });

      prisma.lesson.update.mockResolvedValueOnce(updatedPrismaLesson);

      const repo = new PrismaLessonRepository(prisma as any);

      await repo.update(domainLesson);

      const updateArgs = prisma.lesson.update.mock.calls[0][0];

      // ✅ ne doit PAS contenir quizzes.create
      expect(updateArgs.data.quizzes).toBeUndefined();
    });

    it('devrait convertir duree undefined en null dans mapQuizToPrisma', async () => {
      const prisma = makePrismaMock();

      const lessonId = EntityId.generate().getValue();
      const quizId = EntityId.generate().getValue();

      prisma.lesson.findUnique.mockResolvedValueOnce({
        ...makePrismaLesson({ id: lessonId }),
        quizzes: [],
      });

      const domainLesson = new Lesson({
        id: EntityId.from(lessonId),
        moduleId: 'module-1',
        title: 'Lesson',
        description: 'Desc',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [
          new Quiz({
            id: EntityId.from(quizId),
            lessonId,
            title: 'Quiz illimité',
            description: 'Sans limite',
            status: QuizStatus.DRAFT,
            scoreMinimum: 50,
            duree: undefined, // Pas de limite de temps
            nombreTentatives: 1,
            questions: [],
          }),
        ],
      });

      const updatedPrismaLesson = makePrismaLesson({ id: lessonId });
      prisma.lesson.update.mockResolvedValueOnce(updatedPrismaLesson);

      const repo = new PrismaLessonRepository(prisma as any);

      await repo.update(domainLesson);

      const updateArgs = prisma.lesson.update.mock.calls[0][0];
      const quizData = updateArgs.data.quizzes.create[0];

      expect(quizData.duree).toBeNull();
    });

    it('devrait sérialiser correctement les questions du quiz', async () => {
      const prisma = makePrismaMock();

      const lessonId = EntityId.generate().getValue();
      const quizId = EntityId.generate().getValue();

      prisma.lesson.findUnique.mockResolvedValueOnce({
        ...makePrismaLesson({ id: lessonId }),
        quizzes: [],
      });

      const domainLesson = new Lesson({
        id: EntityId.from(lessonId),
        moduleId: 'module-1',
        title: 'Lesson',
        description: 'Desc',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [
          new Quiz({
            id: EntityId.from(quizId),
            lessonId,
            title: 'Quiz',
            description: 'Desc',
            status: QuizStatus.DRAFT,
            scoreMinimum: 50,
            nombreTentatives: 1,
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
                ],
                'Exp2'
              ),
            ],
          }),
        ],
      });

      const updatedPrismaLesson = makePrismaLesson({ id: lessonId });
      prisma.lesson.update.mockResolvedValueOnce(updatedPrismaLesson);

      const repo = new PrismaLessonRepository(prisma as any);

      await repo.update(domainLesson);

      const updateArgs = prisma.lesson.update.mock.calls[0][0];
      const quizData = updateArgs.data.quizzes.create[0];
      const questions = quizData.questions as any[];

      expect(Array.isArray(questions)).toBe(true);
      expect(questions).toHaveLength(2);
      expect(questions[0]).toHaveProperty('type');
      expect(questions[0]).toHaveProperty('question');
      expect(questions[0]).toHaveProperty('points');
      expect(questions[0]).toHaveProperty('options');
    });

    it('devrait mettre à jour tous les champs de la lesson', async () => {
      const prisma = makePrismaMock();

      const lessonId = EntityId.generate().getValue();

      prisma.lesson.findUnique.mockResolvedValueOnce({
        ...makePrismaLesson({ id: lessonId }),
        quizzes: [],
      });

      const domainLesson = new Lesson({
        id: EntityId.from(lessonId),
        moduleId: 'module-999',
        title: 'Nouveau titre',
        description: 'Nouvelle description',
        duration: 45,
        order: 5,
        status: LessonStatus.PUBLISHED,
        chapters: [],
        quizzes: [],
      });

      const updatedPrismaLesson = makePrismaLesson({
        id: lessonId,
        title: 'Nouveau titre',
        description: 'Nouvelle description',
        duration: 45,
        order: 5,
        status: 'PUBLISHED',
      });

      prisma.lesson.update.mockResolvedValueOnce(updatedPrismaLesson);

      const repo = new PrismaLessonRepository(prisma as any);

      const result = await repo.update(domainLesson);

      const updateArgs = prisma.lesson.update.mock.calls[0][0];

      expect(updateArgs.data).toEqual(
        expect.objectContaining({
          title: 'Nouveau titre',
          description: 'Nouvelle description',
          duration: 45,
          order: 5,
          status: LessonStatus.PUBLISHED,
        })
      );

      expect(result.title).toBe('Nouveau titre');
      expect(result.status).toBe(LessonStatus.PUBLISHED);
    });
  });

  describe('Edge cases', () => {
    const uuid = () => EntityId.generate().getValue();

    it('devrait gérer chapters et quizzes null', async () => {
      const prisma = makePrismaMock();
      const prismaLesson = makePrismaLesson({
        chapters: null,
        quizzes: null,
      });
      prisma.lesson.findUnique.mockResolvedValueOnce(prismaLesson);

      const repo = new PrismaLessonRepository(prisma as any);

      const result = await repo.findById(prismaLesson.id);

      expect(result?.chapters).toHaveLength(0);
      expect(result?.quizzes).toHaveLength(0);
    });

    it('devrait gérer un quiz avec questions null', async () => {
      const prisma = makePrismaMock();

      const lessonId = uuid();
      const quizId = uuid();

      const prismaLesson = makePrismaLesson({
        id: lessonId,
        quizzes: [
          {
            id: quizId,
            moduleId: null,
            lessonId,
            chapterId: null,
            title: 'Quiz sans questions',
            description: 'Desc',
            status: 'DRAFT',
            scoreMinimum: 50,
            duree: 600,
            nombreTentatives: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            questions: null,
          },
        ],
      });

      prisma.lesson.findUnique.mockResolvedValueOnce(prismaLesson);

      const repo = new PrismaLessonRepository(prisma as any);

      const result = await repo.findById(prismaLesson.id);

      expect(result?.quizzes[0].questions).toHaveLength(0);
    });

    it('devrait gérer tous les statuts de lesson', async () => {
      const prisma = makePrismaMock();

      const statuses = [
        LessonStatus.DRAFT,
        LessonStatus.PUBLISHED,
        LessonStatus.ARCHIVED,
        LessonStatus.SCHEDULED,
      ];

      for (const status of statuses) {
        const prismaLesson = makePrismaLesson({ status });
        prisma.lesson.findUnique.mockResolvedValueOnce(prismaLesson);

        const repo = new PrismaLessonRepository(prisma as any);
        const result = await repo.findById(prismaLesson.id);

        expect(result?.status).toBe(status);
      }
    });
  });
});
