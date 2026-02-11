import { DeleteQuizUseCaseImpl } from '@/application/formations/use-cases/DeleteQuizUseCaseImpl';
import type { QuizRepository } from '@/domain/formations/ports/out/QuizRepository';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { EntityId } from '@/domain/shared/EntityId';
import { Quiz, QuizStatus } from '@/domain/formations/entities/Quiz';

describe('DeleteQuizUseCaseImpl', () => {
  let useCase: DeleteQuizUseCaseImpl;
  let mockQuizRepository: jest.Mocked<QuizRepository>;

  const quizId = '123e4567-e89b-12d3-a456-426614174040';

  beforeEach(() => {
    mockQuizRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new DeleteQuizUseCaseImpl(mockQuizRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundError if quiz does not exist', async () => {
    mockQuizRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(quizId)).rejects.toThrow(NotFoundError);
    await expect(useCase.execute(quizId)).rejects.toThrow(`Quiz with id ${quizId} not found`);

    expect(mockQuizRepository.delete).not.toHaveBeenCalled();
  });

  it('should delete quiz when found', async () => {
    const quiz = new Quiz({
      id: EntityId.from(quizId),
      moduleId: '123e4567-e89b-12d3-a456-426614174041',
      lessonId: '123e4567-e89b-12d3-a456-426614174042',
      title: 'Quiz',
      description: 'Desc',
      status: QuizStatus.DRAFT,
      scoreMinimum: 10,
      duree: 10,
      nombreTentatives: 1,
      questions: [],
    });

    mockQuizRepository.findById.mockResolvedValue(quiz);
    mockQuizRepository.delete.mockResolvedValue();

    await useCase.execute(quizId);

    expect(mockQuizRepository.delete).toHaveBeenCalledWith(quizId);
  });
});
