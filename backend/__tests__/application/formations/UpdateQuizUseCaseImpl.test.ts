import { UpdateQuizUseCaseImpl } from '@/application/formations/use-cases/UpdateQuizUseCaseImpl';
import type { QuizRepository } from '@/domain/formations/ports/out/QuizRepository';
import type { UpdateQuizCommand } from '@/domain/formations/ports/in/UpdateQuizUseCase';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { EntityId } from '@/domain/shared/EntityId';
import { Quiz, QuizStatus } from '@/domain/formations/entities/Quiz';
import {
  QuestionChoixMultiple,
  QuestionChoixUnique,
  TypeQuestion,
} from '@/domain/formations/entities/Question';

describe('UpdateQuizUseCaseImpl', () => {
  let useCase: UpdateQuizUseCaseImpl;
  let mockQuizRepository: jest.Mocked<QuizRepository>;
  let existingQuiz: Quiz;

  const quizId = '123e4567-e89b-12d3-a456-426614174020';
  const moduleId = '123e4567-e89b-12d3-a456-426614174021';
  const lessonId = '123e4567-e89b-12d3-a456-426614174022';

  const uniqueQuestion = new QuestionChoixUnique('Q1', 1, [
    { text: 'A', isCorrect: true },
    { text: 'B', isCorrect: false },
  ]);

  beforeEach(() => {
    mockQuizRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as any;

    existingQuiz = new Quiz({
      id: EntityId.from(quizId),
      moduleId,
      lessonId,
      title: 'Titre initial',
      description: 'Desc initiale',
      status: QuizStatus.DRAFT,
      scoreMinimum: 10,
      duree: 20,
      nombreTentatives: 2,
      questions: [uniqueQuestion],
    });

    mockQuizRepository.update.mockImplementation(async quiz => quiz);

    useCase = new UpdateQuizUseCaseImpl(mockQuizRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundError if quiz does not exist', async () => {
    const command: UpdateQuizCommand = { id: 'missing-quiz' } as any;
    mockQuizRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(command)).rejects.toThrow(NotFoundError);
    await expect(useCase.execute(command)).rejects.toThrow('Quiz with id missing-quiz not found');

    expect(mockQuizRepository.findById).toHaveBeenCalledWith('missing-quiz');
    expect(mockQuizRepository.update).not.toHaveBeenCalled();
  });

  it('should update fields and keep existing questions when not provided', async () => {
    const command: UpdateQuizCommand = {
      id: quizId,
      title: 'Titre modifie',
      scoreMinimum: 20,
    } as any;

    mockQuizRepository.findById.mockResolvedValue(existingQuiz);

    const result = await useCase.execute(command);

    const updatedQuiz = (mockQuizRepository.update as jest.Mock).mock.calls[0][0] as Quiz;

    expect(updatedQuiz.title).toBe('Titre modifie');
    expect(updatedQuiz.scoreMinimum).toBe(20);
    expect(updatedQuiz.description).toBe('Desc initiale');
    expect(updatedQuiz.questions).toHaveLength(1);
    expect(updatedQuiz.questions[0].question).toBe('Q1');
    expect(result.id).toBe(quizId);
  });

  it('should map questions when provided (unique and multiple)', async () => {
    const command: UpdateQuizCommand = {
      id: quizId,
      questions: [
        {
          type: TypeQuestion.CHOIX_UNIQUE,
          question: 'Q unique',
          points: 1,
          options: [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: false },
          ],
        },
        {
          type: TypeQuestion.CHOIX_MULTIPLE,
          question: 'Q multiple',
          points: 2,
          options: [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: true },
            { text: 'C', isCorrect: false },
          ],
        },
      ],
    } as any;

    mockQuizRepository.findById.mockResolvedValue(existingQuiz);

    await useCase.execute(command);

    const updatedQuiz = (mockQuizRepository.update as jest.Mock).mock.calls[0][0] as Quiz;

    expect(updatedQuiz.questions).toHaveLength(2);
    expect(updatedQuiz.questions[0]).toBeInstanceOf(QuestionChoixUnique);
    expect(updatedQuiz.questions[1]).toBeInstanceOf(QuestionChoixMultiple);
  });

  it('should throw error for unknown question type', async () => {
    const command: UpdateQuizCommand = {
      id: quizId,
      questions: [
        {
          type: 'UNKNOWN_TYPE',
          question: 'Q?',
          points: 1,
          options: [{ text: 'A', isCorrect: true }],
        },
      ],
    } as any;

    mockQuizRepository.findById.mockResolvedValue(existingQuiz);

    await expect(useCase.execute(command)).rejects.toThrow('TypeQuestion inconnu: UNKNOWN_TYPE');

    expect(mockQuizRepository.update).not.toHaveBeenCalled();
  });
});
