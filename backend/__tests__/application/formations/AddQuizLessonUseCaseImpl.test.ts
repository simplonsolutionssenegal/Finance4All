import { AddQuizLessonUseCaseImpl } from '@/application/formations/use-cases/AddQuizLessonUseCaseImpl';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';

import { LessonStatus } from '@/domain/formations/entities/Lesson'; // si ton Quiz status réutilise LessonStatus
import {
  TypeQuestion,
  QuestionChoixUnique,
  QuestionChoixMultiple,
} from '@/domain/formations/entities/Question';

// ⚠️ Adapte l’import du status du Quiz si tu as un enum dédié QuizStatus
// Exemple: import { QuizStatus } from '@/domain/formations/entities/Quiz';

describe('AddQuizLessonUseCaseImpl', () => {
  const makeRepo = () => ({
    findById: jest.fn(),
    update: jest.fn(),
  });

  const makeLesson = (dto: any = { id: 'lesson-1' }) => ({
    addQuiz: jest.fn(),
    toDTO: jest.fn().mockReturnValue(dto),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throw NotFoundError si lesson introuvable', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValueOnce(null);

    const uc = new AddQuizLessonUseCaseImpl(repo as any);

    await expect(
      uc.execute({
        lessonId: 'lesson-404',
        title: 'Quiz',
        description: 'Desc',
        status: LessonStatus.DRAFT as any,
        scoreMinimum: 50,
        duree: 10,
        nombreTentatives: 2,
        questions: [],
      } as any)
    ).rejects.toThrow(new NotFoundError('Lesson with id lesson-404 not found'));

    expect(repo.update).not.toHaveBeenCalled();
  });

  it('crée un quiz, mappe les questions (unique + multiple), update et retourne savedLesson.toDTO()', async () => {
    const repo = makeRepo();
    const existingLesson = makeLesson({ ok: true });
    const savedLesson = makeLesson({ ok: true, saved: true });

    repo.findById.mockResolvedValueOnce(existingLesson);
    repo.update.mockResolvedValueOnce(savedLesson);

    const uc = new AddQuizLessonUseCaseImpl(repo as any);

    const command = {
      lessonId: 'lesson-1',
      title: 'Quiz 1',
      description: 'Desc quiz',
      status: LessonStatus.DRAFT as any,
      scoreMinimum: 60,
      duree: 15,
      nombreTentatives: 3,
      questions: [
        {
          type: TypeQuestion.CHOIX_UNIQUE,
          question: 'Q1',
          points: 10,
          options: [
            { label: 'A', isCorrect: true },
            { label: 'B', isCorrect: false },
          ],
          explication: 'Parce que A',
        },
        {
          type: TypeQuestion.CHOIX_MULTIPLE,
          question: 'Q2',
          points: 20,
          options: [
            { label: 'A', isCorrect: true },
            { label: 'B', isCorrect: true },
            { label: 'C', isCorrect: false },
          ],
          explication: 'A et B',
        },
      ],
    };

    const result = await uc.execute(command as any);

    // addQuiz called with a Quiz instance
    expect(existingLesson.addQuiz).toHaveBeenCalledTimes(1);
    const quizArg = existingLesson.addQuiz.mock.calls[0][0];

    expect(quizArg).toBeTruthy();
    expect(quizArg.title).toBe('Quiz 1');
    expect(quizArg.description).toBe('Desc quiz');
    expect(quizArg.scoreMinimum).toBe(60);
    expect(quizArg.duree).toBe(15);
    expect(quizArg.nombreTentatives).toBe(3);

    // questions mapped to proper classes
    expect(Array.isArray(quizArg.questions)).toBe(true);
    expect(quizArg.questions).toHaveLength(2);
    expect(quizArg.questions[0]).toBeInstanceOf(QuestionChoixUnique);
    expect(quizArg.questions[1]).toBeInstanceOf(QuestionChoixMultiple);

    // update called with same lesson instance
    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith(existingLesson);

    // returned dto from savedLesson.toDTO()
    expect(savedLesson.toDTO).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: true, saved: true });
  });

  it('questions undefined => crée un quiz avec 0 question', async () => {
    const repo = makeRepo();
    const existingLesson = makeLesson({ ok: true });
    const savedLesson = makeLesson({ ok: true, saved: true });

    repo.findById.mockResolvedValueOnce(existingLesson);
    repo.update.mockResolvedValueOnce(savedLesson);

    const uc = new AddQuizLessonUseCaseImpl(repo as any);

    await uc.execute({
      lessonId: 'lesson-1',
      title: 'Quiz sans questions',
      description: 'Desc',
      status: LessonStatus.DRAFT as any,
      scoreMinimum: 0,
      duree: 5,
      nombreTentatives: 1,
      questions: undefined, // ✅ couvre (command.questions ?? [])
    } as any);

    const quizArg = existingLesson.addQuiz.mock.calls[0][0];
    expect(quizArg.questions).toHaveLength(0);
  });

  it('couvre mapQuestion: type inconnu => throw', () => {
    const repo = makeRepo();
    const uc = new AddQuizLessonUseCaseImpl(repo as any);

    expect(() =>
      (uc as any).mapQuestion({
        type: 'UNKNOWN',
        question: 'Q',
        points: 1,
        options: [],
        explication: '',
      })
    ).toThrow('TypeQuestion inconnu: UNKNOWN');
  });
});
