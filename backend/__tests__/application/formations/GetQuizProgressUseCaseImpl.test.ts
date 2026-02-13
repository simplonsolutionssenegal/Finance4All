import { GetQuizProgressUseCaseImpl } from '@/application/formations/use-cases/GetQuizProgressUseCaseImpl';
import type { QuizRepository } from '@/domain/formations/ports/out/QuizRepository';
import type { IQuizProgressRepository } from '@/domain/formations/ports/out/IQuizProgressRepository';
import { Quiz, QuizStatus } from '@/domain/formations/entities/Quiz';
import { EntityId } from '@/domain/shared/EntityId';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { QuizAttempt } from '@/domain/formations/entities/QuizAttempt';

describe('GetQuizProgressUseCaseImpl', () => {
  let useCase: GetQuizProgressUseCaseImpl;
  let mockQuizRepository: jest.Mocked<QuizRepository>;
  let mockProgressRepository: jest.Mocked<IQuizProgressRepository>;
  let quiz: Quiz;

  beforeEach(() => {
    mockQuizRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as any;

    mockProgressRepository = {
      save: jest.fn(),
      countAttemptsByUser: jest.fn(),
      hasPassedQuiz: jest.fn(),
      findLatestAttemptByUser: jest.fn(),
      findBestAttemptByUser: jest.fn(),
    } as any;

    quiz = new Quiz({
      id: EntityId.generate(),
      title: 'Quiz',
      description: 'Description',
      status: QuizStatus.PUBLISHED,
      scoreMinimum: 70,
      nombreTentatives: 3,
      questions: [],
    });

    useCase = new GetQuizProgressUseCaseImpl(mockQuizRepository, mockProgressRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundError when quiz does not exist', async () => {
    mockQuizRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ quizId: 'missing-quiz', userId: 'user-1' })).rejects.toThrow(
      NotFoundError
    );
  });

  it('should return progress with attempts and scores', async () => {
    const latestAttempt = new QuizAttempt({
      id: 'attempt-2',
      quizId: 'quiz-1',
      userId: 'user-1',
      attemptNumber: 2,
      earnedPoints: 6,
      totalPoints: 10,
      scorePercent: 60,
      isPassed: false,
      createdAt: new Date('2026-02-05T10:00:00.000Z'),
      updatedAt: new Date('2026-02-05T10:00:00.000Z'),
      answers: [],
    });

    const bestAttempt = new QuizAttempt({
      id: 'attempt-1',
      quizId: 'quiz-1',
      userId: 'user-1',
      attemptNumber: 1,
      earnedPoints: 8,
      totalPoints: 10,
      scorePercent: 80,
      isPassed: true,
      createdAt: new Date('2026-02-04T10:00:00.000Z'),
      updatedAt: new Date('2026-02-04T10:00:00.000Z'),
      answers: [],
    });

    mockQuizRepository.findById.mockResolvedValue(quiz);
    mockProgressRepository.countAttemptsByUser.mockResolvedValue(2);
    mockProgressRepository.hasPassedQuiz.mockResolvedValue(true);
    mockProgressRepository.findLatestAttemptByUser.mockResolvedValue(latestAttempt);
    mockProgressRepository.findBestAttemptByUser.mockResolvedValue(bestAttempt);

    const result = await useCase.execute({ quizId: 'quiz-1', userId: 'user-1' });

    expect(result).toEqual({
      quizId: 'quiz-1',
      userId: 'user-1',
      totalAttempts: 2,
      maxAttempts: 3,
      remainingAttempts: 1,
      hasPassed: true,
      bestScorePercent: 80,
      lastScorePercent: 60,
      lastAttemptAt: new Date('2026-02-05T10:00:00.000Z'),
    });
  });
});
