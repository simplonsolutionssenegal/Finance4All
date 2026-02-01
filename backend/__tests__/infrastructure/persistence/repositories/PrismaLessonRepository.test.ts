import { PrismaLessonRepository } from '@/infrastructure/persistence/repositories/PrismaLessonRepository';
import { EntityId } from '@/domain/shared/EntityId';
import { Lesson, LessonStatus } from '@/domain/formations/entities/Lesson';
import { Chapter } from '@/domain/formations/entities/Chapter';
import { Quiz } from '@/domain/formations/entities/Quiz';
import { TypeQuestion } from '@/domain/formations/entities/Question';

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
          media: { id: 'm1' },
        },
      ],
      quizzes: [
        {
          id: quizId,
          lessonId,
          title: 'Quiz 1',
          description: 'Quiz desc',
          status: 'DRAFT',
          scoreMinimum: 50,
          duree: 600,
          nombreTentatives: 2,
          questions: [
            {
              type: TypeQuestion.CHOIX_UNIQUE,
              question: 'Q1',
              points: 10,
              options: [{ label: 'A', isCorrect: true }],
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

  it('findById: retourne null si la lesson prisma est introuvable', async () => {
    const prisma = makePrismaMock();
    prisma.lesson.findUnique.mockResolvedValueOnce(null);

    const repo = new PrismaLessonRepository(prisma as any);

    const res = await repo.findById('unknown');
    expect(res).toBeNull();

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

  it('findById: mappe Prisma -> Domain (chapters + quizzes + questions)', async () => {
    const prisma = makePrismaMock();
    const prismaLesson = makePrismaLesson();
    prisma.lesson.findUnique.mockResolvedValueOnce(prismaLesson);

    const repo = new PrismaLessonRepository(prisma as any);

    const res = await repo.findById(prismaLesson.id);

    expect(res).toBeInstanceOf(Lesson);
    expect(res?.id.getValue()).toBe(prismaLesson.id);
    expect(res?.moduleId).toBe('module-1');
    expect(res?.title).toBe('Lesson title');
    expect(res?.chapters).toHaveLength(1);
    expect(res?.quizzes).toHaveLength(1);

    // chapter mapped
    expect(res?.chapters[0]).toBeInstanceOf(Chapter);
    expect(res?.chapters[0].mediaId).toBeUndefined(); // mediaId null => undefined

    // quiz mapped
    expect(res?.quizzes[0]).toBeInstanceOf(Quiz);
    expect(res?.quizzes[0].questions).toHaveLength(2);
  });

  it('findAll: retourne une pagination + mappe les lessons', async () => {
    const prisma = makePrismaMock();

    const l1 = makePrismaLesson({ title: 'L1' });
    const l2 = makePrismaLesson({ title: 'L2' });

    prisma.lesson.findMany.mockResolvedValueOnce([l1, l2]);
    prisma.lesson.count.mockResolvedValueOnce(5);

    const repo = new PrismaLessonRepository(prisma as any);

    const res = await repo.findAll({ page: 2, limit: 2 });

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

    expect(res.data).toHaveLength(2);
    expect(res.data[0]).toBeInstanceOf(Lesson);
    expect(res.pagination).toEqual({
      page: 2,
      limit: 2,
      total: 5,
      totalPages: 3, // ceil(5/2)
    });
  });

  it('update: crée les nouveaux quizzes si certains sont absents côté prisma', async () => {
    const prisma = makePrismaMock();

    // existing lesson in DB has only quizA
    const lessonId = EntityId.generate().getValue();
    const quizAId = EntityId.generate().getValue();
    const quizBId = EntityId.generate().getValue();

    prisma.lesson.findUnique.mockResolvedValueOnce({
      ...makePrismaLesson({ id: lessonId }),
      quizzes: [{ id: quizAId }],
    });

    // domain lesson contains quizA + quizB (quizB is new)
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
          status: 'DRAFT' as any,
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
          status: 'DRAFT' as any,
          scoreMinimum: 0,
          duree: undefined,
          nombreTentatives: 1,
          questions: [],
        }),
      ],
    });

    // prisma update result
    const updatedPrismaLesson = makePrismaLesson({
      id: lessonId,
      title: 'Updated',
      description: 'Updated desc',
      duration: 10,
      quizzes: [
        {
          id: quizAId,
          questions: [],
          status: 'DRAFT',
          title: 'Quiz A',
          description: 'A',
          scoreMinimum: 0,
          duree: null,
          nombreTentatives: 1,
          lessonId,
        },
        {
          id: quizBId,
          questions: [],
          status: 'DRAFT',
          title: 'Quiz B',
          description: 'B',
          scoreMinimum: 0,
          duree: null,
          nombreTentatives: 1,
          lessonId,
        },
      ],
      chapters: [],
    });

    prisma.lesson.update.mockResolvedValueOnce(updatedPrismaLesson);

    const repo = new PrismaLessonRepository(prisma as any);

    const result = await repo.update(domainLesson);

    // update called with quizzes.create containing only quizB
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

  it('update: ne crée pas quizzes.create si aucun nouveau quiz', async () => {
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
          status: 'DRAFT' as any,
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
          questions: [],
          status: 'DRAFT',
          title: 'Quiz A',
          description: 'A',
          scoreMinimum: 0,
          duree: null,
          nombreTentatives: 1,
          lessonId,
        },
      ],
      chapters: [],
    });

    prisma.lesson.update.mockResolvedValueOnce(updatedPrismaLesson);

    const repo = new PrismaLessonRepository(prisma as any);

    await repo.update(domainLesson);

    const updateArgs = prisma.lesson.update.mock.calls[0][0];

    // ✅ doit NE PAS contenir quizzes.create
    expect(updateArgs.data.quizzes).toBeUndefined();
  });

  it('couvre mapQuestionToDomain: type inconnu => throw', () => {
    const prisma = makePrismaMock();
    const repo = new PrismaLessonRepository(prisma as any);

    expect(() => (repo as any).mapQuestionToDomain({ type: 'UNKNOWN' })).toThrow(
      'TypeQuestion inconnu: UNKNOWN'
    );
  });
});
