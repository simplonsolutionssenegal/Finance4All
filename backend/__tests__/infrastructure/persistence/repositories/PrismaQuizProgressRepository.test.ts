import { PrismaQuizProgressRepository } from '@/infrastructure/persistence/repositories/PrismaQuizProgressRepository';
import { QuizAttempt } from '@/domain/formations/entities/QuizAttempt';

describe('PrismaQuizProgressRepository', () => {
  const makePrismaMock = () => ({
    quizAttempt: {
      create: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
  });

  const makeAttempt = (overrides: Partial<QuizAttempt> = {}) =>
    new QuizAttempt({
      id: 'attempt-1',
      quizId: 'quiz-1',
      userId: 'user-1',
      attemptNumber: 1,
      earnedPoints: 5,
      totalPoints: 10,
      scorePercent: 50,
      isPassed: false,
      answers: [{ questionIndex: 0, selectedOptionIndexes: [1] }],
      ...overrides,
    });

  it('should save attempt including answers', async () => {
    const prisma = makePrismaMock();
    const repo = new PrismaQuizProgressRepository(prisma as any);

    const attempt = makeAttempt();
    prisma.quizAttempt.create.mockResolvedValue({
      id: attempt.id,
      quizId: attempt.quizId,
      userId: attempt.userId,
      attemptNumber: attempt.attemptNumber,
      earnedPoints: attempt.earnedPoints,
      totalPoints: attempt.totalPoints,
      scorePercent: attempt.scorePercent,
      isPassed: attempt.isPassed,
      answers: attempt.answers,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await repo.save(attempt);

    expect(prisma.quizAttempt.create).toHaveBeenCalledWith({
      data: {
        id: attempt.id,
        quizId: attempt.quizId,
        userId: attempt.userId,
        attemptNumber: attempt.attemptNumber,
        earnedPoints: attempt.earnedPoints,
        totalPoints: attempt.totalPoints,
        scorePercent: attempt.scorePercent,
        isPassed: attempt.isPassed,
        answers: attempt.answers,
      },
    });

    expect(result.answers).toEqual([{ questionIndex: 0, selectedOptionIndexes: [1] }]);
  });

  it('should count attempts by user', async () => {
    const prisma = makePrismaMock();
    const repo = new PrismaQuizProgressRepository(prisma as any);

    prisma.quizAttempt.count.mockResolvedValue(2);

    const result = await repo.countAttemptsByUser('quiz-1', 'user-1');

    expect(prisma.quizAttempt.count).toHaveBeenCalledWith({
      where: { quizId: 'quiz-1', userId: 'user-1' },
    });
    expect(result).toBe(2);
  });

  it('should return true when user has passed', async () => {
    const prisma = makePrismaMock();
    const repo = new PrismaQuizProgressRepository(prisma as any);

    prisma.quizAttempt.count.mockResolvedValue(1);

    const result = await repo.hasPassedQuiz('quiz-1', 'user-1');

    expect(prisma.quizAttempt.count).toHaveBeenCalledWith({
      where: { quizId: 'quiz-1', userId: 'user-1', isPassed: true },
    });
    expect(result).toBe(true);
  });

  it('should return false when user has not passed', async () => {
    const prisma = makePrismaMock();
    const repo = new PrismaQuizProgressRepository(prisma as any);

    prisma.quizAttempt.count.mockResolvedValue(0);

    const result = await repo.hasPassedQuiz('quiz-1', 'user-1');

    expect(result).toBe(false);
  });

  it('should find latest attempt', async () => {
    const prisma = makePrismaMock();
    const repo = new PrismaQuizProgressRepository(prisma as any);
    const attempt = makeAttempt({ scorePercent: 40 });

    prisma.quizAttempt.findFirst.mockResolvedValue({
      id: attempt.id,
      quizId: attempt.quizId,
      userId: attempt.userId,
      attemptNumber: attempt.attemptNumber,
      earnedPoints: attempt.earnedPoints,
      totalPoints: attempt.totalPoints,
      scorePercent: attempt.scorePercent,
      isPassed: attempt.isPassed,
      answers: attempt.answers,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await repo.findLatestAttemptByUser('quiz-1', 'user-1');

    expect(prisma.quizAttempt.findFirst).toHaveBeenCalledWith({
      where: { quizId: 'quiz-1', userId: 'user-1' },
      orderBy: { createdAt: 'desc' },
    });
    expect(result?.scorePercent).toBe(40);
  });

  it('should return null when no latest attempt exists', async () => {
    const prisma = makePrismaMock();
    const repo = new PrismaQuizProgressRepository(prisma as any);

    prisma.quizAttempt.findFirst.mockResolvedValue(null);

    const result = await repo.findLatestAttemptByUser('quiz-1', 'user-1');

    expect(result).toBeNull();
  });

  it('should find best attempt', async () => {
    const prisma = makePrismaMock();
    const repo = new PrismaQuizProgressRepository(prisma as any);
    const attempt = makeAttempt({ scorePercent: 90 });

    prisma.quizAttempt.findFirst.mockResolvedValue({
      id: attempt.id,
      quizId: attempt.quizId,
      userId: attempt.userId,
      attemptNumber: attempt.attemptNumber,
      earnedPoints: attempt.earnedPoints,
      totalPoints: attempt.totalPoints,
      scorePercent: attempt.scorePercent,
      isPassed: attempt.isPassed,
      answers: attempt.answers,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await repo.findBestAttemptByUser('quiz-1', 'user-1');

    expect(prisma.quizAttempt.findFirst).toHaveBeenCalledWith({
      where: { quizId: 'quiz-1', userId: 'user-1' },
      orderBy: [{ scorePercent: 'desc' }, { createdAt: 'asc' }],
    });
    expect(result?.scorePercent).toBe(90);
  });
});
