import { UpdateLessonUseCaseImpl } from '@/application/formations/use-cases/UpdateLessonUseCaseImpl';
import type { LessonRepository } from '@/domain/formations/ports/out/LessonRepository';
import type { UpdateLessonCommand } from '@/domain/formations/ports/in/UpdateLessonUseCase';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { EntityId } from '@/domain/shared/EntityId';
import { Lesson, LessonStatus } from '@/domain/formations/entities/Lesson';
import { Chapter } from '@/domain/formations/entities/Chapter';
import { Quiz, QuizStatus } from '@/domain/formations/entities/Quiz';
import {
  QuestionChoixMultiple,
  QuestionChoixUnique,
  TypeQuestion,
} from '@/domain/formations/entities/Question';

describe('UpdateLessonUseCaseImpl', () => {
  let useCase: UpdateLessonUseCaseImpl;
  let mockLessonRepository: jest.Mocked<LessonRepository>;
  let existingLesson: Lesson;

  const lessonId = '123e4567-e89b-12d3-a456-426614174001';
  const moduleId = '123e4567-e89b-12d3-a456-426614174002';
  const chapterId = '123e4567-e89b-12d3-a456-426614174003';
  const chapterQuizId = '123e4567-e89b-12d3-a456-426614174004';
  const lessonQuizId = '123e4567-e89b-12d3-a456-426614174005';

  const uniqueQuestion = new QuestionChoixUnique(
    'Question unique',
    1,
    [
      { text: 'A', isCorrect: true },
      { text: 'B', isCorrect: false },
    ],
    'Explication'
  );

  beforeEach(() => {
    mockLessonRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as any;

    const chapterQuiz = new Quiz({
      id: EntityId.from(chapterQuizId),
      moduleId,
      lessonId,
      chapterId,
      title: 'Quiz chapitre',
      description: 'Desc quiz chapitre',
      status: QuizStatus.PUBLISHED,
      scoreMinimum: 10,
      duree: 15,
      nombreTentatives: 1,
      questions: [uniqueQuestion],
    });

    const chapter = new Chapter(
      EntityId.from(chapterId),
      'Chapitre 1',
      'Description chapitre',
      'media-1',
      0,
      undefined,
      [chapterQuiz]
    );

    const lessonQuiz = new Quiz({
      id: EntityId.from(lessonQuizId),
      moduleId,
      lessonId,
      title: 'Quiz lecon',
      description: 'Desc quiz lecon',
      status: QuizStatus.DRAFT,
      scoreMinimum: 12,
      duree: 20,
      nombreTentatives: 2,
      questions: [uniqueQuestion],
    });

    existingLesson = new Lesson({
      id: EntityId.from(lessonId),
      moduleId,
      title: 'Titre initial',
      description: 'Description initiale',
      duration: 30,
      order: 0,
      status: LessonStatus.DRAFT,
      chapters: [chapter],
      quizzes: [lessonQuiz],
    });

    mockLessonRepository.update.mockImplementation(async lesson => lesson);

    useCase = new UpdateLessonUseCaseImpl(mockLessonRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundError if lesson does not exist', async () => {
    const command: UpdateLessonCommand = { id: 'missing-id' } as any;
    mockLessonRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(command)).rejects.toThrow(NotFoundError);
    await expect(useCase.execute(command)).rejects.toThrow('Lesson with id missing-id not found');

    expect(mockLessonRepository.findById).toHaveBeenCalledWith('missing-id');
    expect(mockLessonRepository.update).not.toHaveBeenCalled();
  });

  it('should keep existing chapters and quizzes when not provided in command', async () => {
    const command: UpdateLessonCommand = {
      id: lessonId,
      title: 'Titre modifie',
    } as any;

    mockLessonRepository.findById.mockResolvedValue(existingLesson);

    const result = await useCase.execute(command);

    const updatedLesson = (mockLessonRepository.update as jest.Mock).mock.calls[0][0] as Lesson;

    expect(updatedLesson.title).toBe('Titre modifie');
    expect(updatedLesson.chapters).toBe(existingLesson.chapters);
    expect(updatedLesson.quizzes).toHaveLength(existingLesson.quizzes.length);
    expect(updatedLesson.quizzes[0].id.getValue()).toBe(existingLesson.quizzes[0].id.getValue());
    expect(result).toBeDefined();
  });

  it('should map chapters/quizzes and keep existing quiz status if not provided', async () => {
    const command: UpdateLessonCommand = {
      id: lessonId,
      chapters: [
        {
          id: chapterId,
          title: 'Chapitre modifie',
          description: 'Nouvelle desc',
          mediaId: 'media-2',
          order: 1,
          quizzes: [
            {
              id: chapterQuizId,
              title: 'Quiz chapitre modifie',
              description: 'Desc',
              scoreMinimum: 15,
              duree: 10,
              nombreTentatives: 1,
              questions: [
                {
                  type: TypeQuestion.CHOIX_MULTIPLE,
                  question: 'Q mult',
                  points: 2,
                  options: [
                    { text: 'A', isCorrect: true },
                    { text: 'B', isCorrect: true },
                    { text: 'C', isCorrect: false },
                  ],
                },
              ],
            },
          ],
        },
      ],
      quizzes: [
        {
          title: 'Quiz lecon modifie',
          description: 'Desc lecon',
          status: QuizStatus.PUBLISHED,
          scoreMinimum: 20,
          duree: 25,
          nombreTentatives: 2,
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
          ],
        },
      ],
    } as any;

    mockLessonRepository.findById.mockResolvedValue(existingLesson);

    await useCase.execute(command);

    const updatedLesson = (mockLessonRepository.update as jest.Mock).mock.calls[0][0] as Lesson;
    const updatedChapter = updatedLesson.chapters[0];
    const updatedChapterQuiz = updatedChapter.quizzes[0];

    expect(updatedChapter.title).toBe('Chapitre modifie');
    expect(updatedChapter.mediaId).toBe('media-2');

    // status should fallback to existing quiz status (PUBLISHED)
    expect(updatedChapterQuiz.status).toBe(QuizStatus.PUBLISHED);
    expect(updatedChapterQuiz.questions[0]).toBeInstanceOf(QuestionChoixMultiple);

    expect(updatedLesson.quizzes).toHaveLength(1);
    expect(updatedLesson.quizzes[0].title).toBe('Quiz lecon modifie');
    expect(updatedLesson.quizzes[0].questions[0]).toBeInstanceOf(QuestionChoixUnique);
  });
});
