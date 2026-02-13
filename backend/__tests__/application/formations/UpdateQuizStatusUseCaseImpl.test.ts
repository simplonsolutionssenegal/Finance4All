import { UpdateQuizStatusUseCaseImpl } from '@/application/formations/use-cases/UpdateQuizStatusUseCaseImpl';
import type { QuizRepository } from '@/domain/formations/ports/out/QuizRepository';
import type { UpdateQuizStatusCommand } from '@/domain/formations/ports/in/UpdateStatusQuizUseCase';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { EntityId } from '@/domain/shared/EntityId';
import { Quiz } from '@/domain/formations/entities/Quiz';
import { QuestionChoixUnique } from '@/domain/formations/entities/Question';
import { QuizStatus } from '@prisma/client';

describe('UpdateQuizStatusUseCaseImpl', () => {
  let useCase: UpdateQuizStatusUseCaseImpl;
  let mockQuizRepository: jest.Mocked<QuizRepository>;

  const quizId = '123e4567-e89b-12d3-a456-426614174010';
  const moduleId = '123e4567-e89b-12d3-a456-426614174011';
  const lessonId = '123e4567-e89b-12d3-a456-426614174012';

  const buildQuiz = (status: QuizStatus, withQuestion = false) =>
    new Quiz({
      id: EntityId.from(quizId),
      moduleId,
      lessonId,
      title: 'Quiz test',
      description: 'Desc quiz',
      status: status as any,
      scoreMinimum: 10,
      duree: 15,
      nombreTentatives: 1,
      questions: withQuestion
        ? [
            new QuestionChoixUnique('Q1', 1, [
              { text: 'A', isCorrect: true },
              { text: 'B', isCorrect: false },
            ]),
          ]
        : [],
    });

  beforeEach(() => {
    mockQuizRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new UpdateQuizStatusUseCaseImpl(mockQuizRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundError if quiz is not found', async () => {
    const command: UpdateQuizStatusCommand = {
      id: 'missing-quiz',
      status: QuizStatus.DRAFT,
    } as any;

    mockQuizRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(command)).rejects.toThrow(NotFoundError);
    await expect(useCase.execute(command)).rejects.toThrow('Quiz with id missing-quiz not found');

    expect(mockQuizRepository.findById).toHaveBeenCalledWith('missing-quiz');
    expect(mockQuizRepository.update).not.toHaveBeenCalled();
  });

  it('should archive a quiz when status is ARCHIVED', async () => {
    const existingQuiz = buildQuiz(QuizStatus.DRAFT, false);

    mockQuizRepository.findById.mockResolvedValue(existingQuiz);
    mockQuizRepository.update.mockResolvedValue(existingQuiz);

    const command: UpdateQuizStatusCommand = {
      id: quizId,
      status: QuizStatus.ARCHIVED,
    } as any;

    const result = await useCase.execute(command);

    expect(existingQuiz.status).toBe(QuizStatus.ARCHIVED);
    expect(mockQuizRepository.update).toHaveBeenCalledWith(existingQuiz);
    expect(result.id).toBe(quizId);
  });

  it('should publish a quiz when status is PUBLISHED', async () => {
    const existingQuiz = buildQuiz(QuizStatus.DRAFT, true);

    mockQuizRepository.findById.mockResolvedValue(existingQuiz);
    mockQuizRepository.update.mockResolvedValue(existingQuiz);

    const command: UpdateQuizStatusCommand = {
      id: quizId,
      status: QuizStatus.PUBLISHED,
    } as any;

    const result = await useCase.execute(command);

    expect(existingQuiz.status).toBe(QuizStatus.PUBLISHED);
    expect(mockQuizRepository.update).toHaveBeenCalledWith(existingQuiz);
    expect(result.id).toBe(quizId);
  });

  it('should set quiz to DRAFT when status is DRAFT', async () => {
    const existingQuiz = buildQuiz(QuizStatus.PUBLISHED, true);

    mockQuizRepository.findById.mockResolvedValue(existingQuiz);
    mockQuizRepository.update.mockResolvedValue(existingQuiz);

    const command: UpdateQuizStatusCommand = {
      id: quizId,
      status: QuizStatus.DRAFT,
    } as any;

    const result = await useCase.execute(command);

    expect(existingQuiz.status).toBe(QuizStatus.DRAFT);
    expect(mockQuizRepository.update).toHaveBeenCalledWith(existingQuiz);
    expect(result.id).toBe(quizId);
  });
});
