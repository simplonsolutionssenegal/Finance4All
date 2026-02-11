import { SubmitQuizAttemptUseCaseImpl } from '@/application/formations/use-cases/SubmitQuizAttemptUseCaseImpl';
import type { QuizRepository } from '@/domain/formations/ports/out/QuizRepository';
import type { IQuizProgressRepository } from '@/domain/formations/ports/out/IQuizProgressRepository';
import { Quiz, QuizStatus } from '@/domain/formations/entities/Quiz';
import { QuestionChoixMultiple, QuestionChoixUnique } from '@/domain/formations/entities/Question';
import { EntityId } from '@/domain/shared/EntityId';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';

describe('SubmitQuizAttemptUseCaseImpl', () => {
  let useCase: SubmitQuizAttemptUseCaseImpl;
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
      questions: [
        new QuestionChoixUnique('Q1', 2, [
          { text: 'A', isCorrect: false },
          { text: 'B', isCorrect: true },
        ]),
        new QuestionChoixMultiple('Q2', 3, [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: true },
          { text: 'C', isCorrect: false },
        ]),
      ],
    });

    useCase = new SubmitQuizAttemptUseCaseImpl(mockQuizRepository, mockProgressRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundError when quiz does not exist', async () => {
    mockQuizRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        quizId: 'missing-quiz',
        userId: 'user-1',
        answers: [],
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('should prevent attempts when limit is reached', async () => {
    mockQuizRepository.findById.mockResolvedValue(quiz);
    mockProgressRepository.countAttemptsByUser.mockResolvedValue(3);

    await expect(
      useCase.execute({
        quizId: 'quiz-1',
        userId: 'user-1',
        answers: [],
      })
    ).rejects.toThrow('Nombre maximal de tentatives atteint pour ce quiz');
  });

  it('should compute score, save answers and return result', async () => {
    mockQuizRepository.findById.mockResolvedValue(quiz);
    mockProgressRepository.countAttemptsByUser.mockResolvedValue(0);
    mockProgressRepository.hasPassedQuiz.mockResolvedValue(false);
    mockProgressRepository.save.mockImplementation(async attempt => attempt);

    const result = await useCase.execute({
      quizId: 'quiz-1',
      userId: 'user-1',
      answers: [
        { questionIndex: 0, selectedOptionIndexes: [1] },
        { questionIndex: 1, selectedOptionIndexes: [1, 0] },
      ],
    });

    expect(mockProgressRepository.save).toHaveBeenCalledTimes(1);
    const savedAttempt = mockProgressRepository.save.mock.calls[0][0];

    expect(savedAttempt.answers).toEqual([
      { questionIndex: 0, selectedOptionIndexes: [1] },
      { questionIndex: 1, selectedOptionIndexes: [0, 1] },
    ]);

    expect(result.earnedPoints).toBe(5); // 2 + 3
    expect(result.totalPoints).toBe(5);
    expect(result.scorePercent).toBe(100);
    expect(result.isPassed).toBe(true);
    expect(result.maxAttempts).toBe(3);
    expect(result.remainingAttempts).toBe(2);
  });

  it('should mark attempt as failed when score is below minimum', async () => {
    mockQuizRepository.findById.mockResolvedValue(quiz);
    mockProgressRepository.countAttemptsByUser.mockResolvedValue(0);
    mockProgressRepository.hasPassedQuiz.mockResolvedValue(false);
    mockProgressRepository.save.mockImplementation(async attempt => attempt);

    const result = await useCase.execute({
      quizId: 'quiz-1',
      userId: 'user-1',
      answers: [
        { questionIndex: 0, selectedOptionIndexes: [0] },
        { questionIndex: 1, selectedOptionIndexes: [0] },
      ],
    });

    expect(result.earnedPoints).toBe(0);
    expect(result.scorePercent).toBe(0);
    expect(result.isPassed).toBe(false);
  });

  it('should handle unknown question type as incorrect', async () => {
    const customQuiz = new Quiz({
      id: EntityId.generate(),
      title: 'Quiz',
      description: 'Description',
      status: QuizStatus.PUBLISHED,
      scoreMinimum: 50,
      nombreTentatives: 3,
      questions: [
        new QuestionChoixUnique('Q1', 2, [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: false },
        ]),
      ],
    });

    mockQuizRepository.findById.mockResolvedValue(customQuiz);
    mockProgressRepository.countAttemptsByUser.mockResolvedValue(0);
    mockProgressRepository.hasPassedQuiz.mockResolvedValue(false);
    mockProgressRepository.save.mockImplementation(async attempt => attempt);

    const result = await useCase.execute({
      quizId: 'quiz-1',
      userId: 'user-1',
      answers: [{ questionIndex: 0, selectedOptionIndexes: [0] }],
    });

    expect(result.earnedPoints).toBe(2);
    expect(result.isPassed).toBe(true);
  });
});
