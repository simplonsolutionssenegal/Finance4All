/**
 * @jest-environment node
 */

import type { PrismaClient } from '@prisma/client';

import { PrismaLessonRepository } from '@/infrastructure/persistence/repositories/PrismaLessonRepository';

// --------------------
// Mock questionsFromJson
// --------------------
const questionsFromJsonMock = jest.fn();
jest.mock('@/infrastructure/persistence/repositories/mappers/QuestionMapper', () => ({
  questionsFromJson: (json: unknown) => questionsFromJsonMock(json),
}));

const UUID = {
  module1: '9c201c45-895c-49cc-9929-6bbc6e779ac1',
  lesson1: '38a9c0dc-30e2-4aa6-b8c4-930f2de69746',
  lessonA: '11111111-1111-4111-8111-111111111111',
  lessonB: '22222222-2222-4222-8222-222222222222',
  chapter1: 'e1c885ef-5530-488c-a19f-fb1c0ee07bea',
  quizLesson1: 'b4affe45-7885-4c13-b17e-e2c7e316accb',
  quizChapter1: '03e3f7dc-c00f-43af-ae8b-a2ead6fa15f9',
  media1: 'b87b97b8-95fa-43eb-91de-31c12ed5426c',
};

function makePrismaLesson(overrides: Partial<any> = {}) {
  const lessonQuiz = {
    id: UUID.quizLesson1,
    moduleId: UUID.module1,
    lessonId: UUID.lesson1,
    chapterId: null,
    title: 'Quiz lesson',
    description: 'Desc quiz lesson',
    status: 'DRAFT',
    scoreMinimum: 70,
    duree: null,
    nombreTentatives: 3,
    questions: [{ tag: 'lesson-quiz' }],
    createdAt: new Date('2026-02-02T00:00:00Z'),
    updatedAt: new Date('2026-02-02T00:00:00Z'),
  };

  const chapterQuiz = {
    id: UUID.quizChapter1,
    moduleId: UUID.module1,
    lessonId: null,
    chapterId: UUID.chapter1,
    title: 'Quiz chapter',
    description: 'Desc quiz chapter',
    status: 'DRAFT',
    scoreMinimum: 80,
    duree: 20,
    nombreTentatives: 3,
    questions: [{ tag: 'chapter-quiz' }],
    createdAt: new Date('2026-02-02T00:00:00Z'),
    updatedAt: new Date('2026-02-02T00:00:00Z'),
  };

  const base = {
    id: UUID.lesson1,
    moduleId: UUID.module1,
    title: 'Lesson title',
    description: 'Lesson desc',
    duration: 20,
    order: 1,
    status: 'DRAFT',
    createdAt: new Date('2026-02-02T00:00:00Z'),
    updatedAt: new Date('2026-02-02T00:00:00Z'),

    quizzes: [lessonQuiz],

    chapters: [
      {
        id: UUID.chapter1,
        lessonId: UUID.lesson1,
        title: 'Chapter 1',
        description: 'Chapter desc',
        mediaId: UUID.media1,
        order: 0,
        createdAt: new Date('2026-02-02T00:00:00Z'),
        updatedAt: new Date('2026-02-02T00:00:00Z'),
        media: null,
        quizzes: [chapterQuiz],
      },
    ],
  };

  return { ...base, ...overrides };
}

function makePrismaMock() {
  return {
    lesson: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaClient;
}

describe('PrismaLessonRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // le domain Quiz utilise totalPoints -> il faut un objet avec "points"
    questionsFromJsonMock.mockImplementation(() => {
      // retourne 1 question "fake" avec points
      return [{ points: 2, toDTO: () => ({}) }];
    });
  });

  it('findById: retourne null si Prisma retourne null', async () => {
    const prisma = makePrismaMock();
    (prisma as any).lesson.findUnique.mockResolvedValueOnce(null);

    const repo = new PrismaLessonRepository(prisma);

    const res = await repo.findById(UUID.lesson1);
    expect(res).toBeNull();

    expect((prisma as any).lesson.findUnique).toHaveBeenCalledWith({
      where: { id: UUID.lesson1 },
      include: {
        chapters: { include: { media: true, quizzes: true } },
        quizzes: true,
      },
    });
  });

  it('findById: mappe lesson + quizzes (lesson et chapitre) + appelle questionsFromJson', async () => {
    const prisma = makePrismaMock();
    (prisma as any).lesson.findUnique.mockResolvedValueOnce(makePrismaLesson());

    const repo = new PrismaLessonRepository(prisma);

    const lesson = await repo.findById(UUID.lesson1);
    expect(lesson).not.toBeNull();

    // vérifie que les quizzes sont bien mappés
    const l: any = lesson;
    expect(l.quizzes).toHaveLength(1);
    expect(l.chapters).toHaveLength(1);
    expect(l.chapters[0].quizzes).toHaveLength(1);

    // mapper questionsFromJson appelé pour le quiz de lesson + quiz de chapitre
    expect(questionsFromJsonMock).toHaveBeenCalledWith([{ tag: 'lesson-quiz' }]);
    expect(questionsFromJsonMock).toHaveBeenCalledWith([{ tag: 'chapter-quiz' }]);
  });

  it('findAll: pagination + totalPages + includes corrects', async () => {
    const prisma = makePrismaMock();

    (prisma as any).lesson.findMany.mockResolvedValueOnce([
      makePrismaLesson({ id: UUID.lessonA }),
      makePrismaLesson({ id: UUID.lessonB }),
    ]);
    (prisma as any).lesson.count.mockResolvedValueOnce(22);

    const repo = new PrismaLessonRepository(prisma);

    const result = await repo.findAll({ page: 2, limit: 10 });

    expect((prisma as any).lesson.findMany).toHaveBeenCalledWith({
      skip: 10,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        chapters: { include: { media: true, quizzes: true } },
        quizzes: true,
      },
    });

    expect(result.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 22,
      totalPages: 3,
    });

    expect(result.data).toHaveLength(2);
  });

  it('update: crée uniquement les nouveaux quizzes (branche newQuizzes > 0)', async () => {
    const prisma = makePrismaMock();

    // existing lesson a déjà "q1" (string => pas besoin uuid ici, juste comparaison)
    (prisma as any).lesson.findUnique.mockResolvedValueOnce(
      makePrismaLesson({
        quizzes: [{ id: 'q1' }],
      })
    );

    // update retourne une lesson prisma valide (uuid)
    (prisma as any).lesson.update.mockResolvedValueOnce(makePrismaLesson());

    const repo = new PrismaLessonRepository(prisma);

    const fakeLesson: any = {
      id: { getValue: () => UUID.lesson1 },
      title: 'T',
      description: 'D',
      duration: 10,
      order: 1,
      status: 'DRAFT',
      quizzes: [
        { id: { getValue: () => 'q1' } }, // déjà existant
        {
          id: { getValue: () => 'q2' }, // nouveau
          title: 'Q2',
          description: 'd2',
          status: 'DRAFT',
          scoreMinimum: 80,
          duree: undefined,
          nombreTentatives: 3,
          questions: [
            { toDTO: () => ({ question: 'x', type: 'CHOIX_UNIQUE', points: 1, options: [] }) },
          ],
        },
      ],
    };

    await repo.update(fakeLesson);

    const updateArgs = (prisma as any).lesson.update.mock.calls[0][0];

    expect(updateArgs.where).toEqual({ id: UUID.lesson1 });
    expect(updateArgs.include).toEqual({
      chapters: { include: { media: true, quizzes: true } },
      quizzes: true,
    });

    // doit créer uniquement q2
    expect(updateArgs.data.quizzes.create).toHaveLength(1);
    expect(updateArgs.data.quizzes.create[0]).toEqual(
      expect.objectContaining({
        id: 'q2',
        title: 'Q2',
        scoreMinimum: 80,
        duree: null, // undefined => null
      })
    );
  });

  it("update: si aucun nouveau quiz, n'envoie pas quizzes.create (branche newQuizzes.length===0)", async () => {
    const prisma = makePrismaMock();

    (prisma as any).lesson.findUnique.mockResolvedValueOnce(
      makePrismaLesson({
        quizzes: [{ id: 'q1' }],
      })
    );

    (prisma as any).lesson.update.mockResolvedValueOnce(makePrismaLesson());

    const repo = new PrismaLessonRepository(prisma);

    const fakeLesson: any = {
      id: { getValue: () => UUID.lesson1 },
      title: 'T',
      description: 'D',
      duration: 10,
      order: 1,
      status: 'DRAFT',
      quizzes: [{ id: { getValue: () => 'q1' } }], // aucun nouveau
    };

    await repo.update(fakeLesson);

    const updateArgs = (prisma as any).lesson.update.mock.calls[0][0];
    expect(updateArgs.data).not.toHaveProperty('quizzes'); // ✅ branche vide
  });
});
