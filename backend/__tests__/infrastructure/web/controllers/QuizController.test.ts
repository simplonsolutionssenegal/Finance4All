import type { NextFunction, Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { QuizController } from '@/infrastructure/web/controllers/QuizController';
import type { GetQuizByIdUseCase } from '@/domain/formations/ports/in/GetQuizByIdUseCase';
import type { SubmitQuizAttemptUseCase } from '@/domain/formations/ports/in/SubmitQuizAttemptUseCase';
import type { GetQuizProgressUseCase } from '@/domain/formations/ports/in/GetQuizProgressUseCase';
import type { UpdateQuizUseCase } from '@/domain/formations/ports/in/UpdateQuizUseCase';
import type { UpdateQuizStatusUseCase } from '@/domain/formations/ports/in/UpdateStatusQuizUseCase';
import type { DeleteQuizUseCase } from '@/domain/formations/ports/in/DeleteQuizUseCase';
import { QuizStatus } from '@/domain/formations/entities/Quiz';

jest.mock('@clerk/express', () => ({
  getAuth: jest.fn(),
}));

describe('QuizController', () => {
  let controller: QuizController;
  let getByIdUseCase: jest.Mocked<GetQuizByIdUseCase>;
  let updateUseCase: jest.Mocked<UpdateQuizUseCase>;
  let updateStatusUseCase: jest.Mocked<UpdateQuizStatusUseCase>;
  let deleteUseCase: jest.Mocked<DeleteQuizUseCase>;
  let submitUseCase: jest.Mocked<SubmitQuizAttemptUseCase>;
  let progressUseCase: jest.Mocked<GetQuizProgressUseCase>;

  const mockGetAuth = getAuth as jest.Mock;

  const createRes = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(() => {
    mockGetAuth.mockReset();
    mockGetAuth.mockReturnValue({ userId: null });
    getByIdUseCase = { execute: jest.fn() } as any;
    updateUseCase = { execute: jest.fn() } as any;
    updateStatusUseCase = { execute: jest.fn() } as any;
    deleteUseCase = { execute: jest.fn() } as any;
    submitUseCase = { execute: jest.fn() } as any;
    progressUseCase = { execute: jest.fn() } as any;

    controller = new QuizController(
      getByIdUseCase,
      updateUseCase,
      updateStatusUseCase,
      deleteUseCase,
      submitUseCase,
      progressUseCase
    );
  });

  it('getById should return quiz', async () => {
    const req = { params: { id: 'quiz-123' } } as unknown as Request;
    const res = createRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;
    const quiz = { id: 'quiz-123' } as any;
    getByIdUseCase.execute.mockResolvedValueOnce(quiz);

    await controller.getById(req, res, next);

    expect(getByIdUseCase.execute).toHaveBeenCalledWith({ id: 'quiz-123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: quiz });
  });

  it('update should return updated quiz', async () => {
    const req = { params: { id: 'quiz-123' }, body: { title: 'New quiz' } } as unknown as Request;
    const res = createRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;
    const quiz = { id: 'quiz-123' } as any;
    updateUseCase.execute.mockResolvedValueOnce(quiz);

    await controller.update(req, res, next);

    expect(updateUseCase.execute).toHaveBeenCalledWith({ id: 'quiz-123', title: 'New quiz' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'success', data: quiz });
  });

  it('update should call next on error', async () => {
    const req = { params: { id: 'quiz-123' }, body: {} } as unknown as Request;
    const res = createRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;
    const error = new Error('boom');
    updateUseCase.execute.mockRejectedValueOnce(error);

    await controller.update(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('delete should return success', async () => {
    const req = { params: { id: 'quiz-123' } } as unknown as Request;
    const res = createRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;
    deleteUseCase.execute.mockResolvedValueOnce(undefined);

    await controller.delete(req, res, next);

    expect(deleteUseCase.execute).toHaveBeenCalledWith('quiz-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Quiz deleted successfully' });
  });

  it('delete should call next on error', async () => {
    const req = { params: { id: 'quiz-123' } } as unknown as Request;
    const res = createRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;
    const error = new Error('boom');
    deleteUseCase.execute.mockRejectedValueOnce(error);

    await controller.delete(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('publie/archive/draft should call status use case', async () => {
    const req = { params: { id: 'quiz-123' } } as unknown as Request;
    const res = createRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;
    updateStatusUseCase.execute.mockResolvedValue({ id: 'quiz-123' } as any);

    await controller.publie(req, res, next);
    await controller.archive(req, res, next);
    await controller.draft(req, res, next);

    expect(updateStatusUseCase.execute).toHaveBeenNthCalledWith(1, {
      id: 'quiz-123',
      status: QuizStatus.PUBLISHED,
    });
    expect(updateStatusUseCase.execute).toHaveBeenNthCalledWith(2, {
      id: 'quiz-123',
      status: QuizStatus.ARCHIVED,
    });
    expect(updateStatusUseCase.execute).toHaveBeenNthCalledWith(3, {
      id: 'quiz-123',
      status: QuizStatus.DRAFT,
    });
  });

  it('submitAttempt should return 401 when unauthenticated', async () => {
    const req = {
      params: { id: 'quiz-123' },
      body: { answers: [] },
      query: {},
    } as unknown as Request;
    const res = createRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;
    mockGetAuth.mockImplementation(() => ({ userId: null }));

    await controller.submitAttempt(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Non autorise', message: 'Utilisateur non authentifie' })
    );
    expect(submitUseCase.execute).not.toHaveBeenCalled();
  });

  it('submitAttempt should submit answers when authenticated', async () => {
    const req = {
      params: { id: 'quiz-123' },
      body: { answers: [{ questionIndex: 0, selectedOptionIndexes: [1] }] },
    } as unknown as Request;
    const res = createRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;
    mockGetAuth.mockReturnValue({ userId: 'user-1' });
    submitUseCase.execute.mockResolvedValue({ id: 'attempt-1' } as any);

    await controller.submitAttempt(req, res, next);

    expect(submitUseCase.execute).toHaveBeenCalledWith({
      quizId: 'quiz-123',
      userId: 'user-1',
      answers: [{ questionIndex: 0, selectedOptionIndexes: [1] }],
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getMyProgress should return 401 when unauthenticated', async () => {
    const req = { params: { id: 'quiz-123' }, query: {} } as unknown as Request;
    const res = createRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;
    mockGetAuth.mockImplementation(() => ({ userId: null }));

    await controller.getMyProgress(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Non autorise', message: 'Utilisateur non authentifie' })
    );
    expect(progressUseCase.execute).not.toHaveBeenCalled();
  });

  it('getMyProgress should return progress when authenticated', async () => {
    const req = { params: { id: 'quiz-123' } } as unknown as Request;
    const res = createRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;
    mockGetAuth.mockReturnValue({ userId: 'user-1' });
    const result = { totalAttempts: 2 } as any;
    progressUseCase.execute.mockResolvedValueOnce(result);

    await controller.getMyProgress(req, res, next);

    expect(progressUseCase.execute).toHaveBeenCalledWith({ quizId: 'quiz-123', userId: 'user-1' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: result });
  });
});
