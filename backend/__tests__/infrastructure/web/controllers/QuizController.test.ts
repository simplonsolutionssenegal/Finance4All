import type { Request, Response, NextFunction } from 'express';
import { QuizController } from '@/infrastructure/web/controllers/QuizController';
import type { GetQuizByIdUseCase } from '@/domain/formations/ports/in/GetQuizByIdUseCase';
import type { SubmitQuizAttemptUseCase } from '@/domain/formations/ports/in/SubmitQuizAttemptUseCase';
import type { GetQuizProgressUseCase } from '@/domain/formations/ports/in/GetQuizProgressUseCase';
import { getAuth } from '@clerk/express';

jest.mock('@clerk/express', () => ({
  getAuth: jest.fn(),
}));

describe('QuizController (unit)', () => {
  let controller: QuizController;
  let mockGetQuizByIdUseCase: jest.Mocked<GetQuizByIdUseCase>;
  let mockSubmitQuizAttemptUseCase: jest.Mocked<SubmitQuizAttemptUseCase>;
  let mockGetQuizProgressUseCase: jest.Mocked<GetQuizProgressUseCase>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  const mockGetAuth = getAuth as jest.Mock;

  beforeEach(() => {
    mockGetQuizByIdUseCase = {
      execute: jest.fn(),
    } as any;

    mockSubmitQuizAttemptUseCase = {
      execute: jest.fn(),
    } as any;

    mockGetQuizProgressUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new QuizController(
      mockGetQuizByIdUseCase,
      mockSubmitQuizAttemptUseCase,
      mockGetQuizProgressUseCase
    );

    req = { params: { id: 'quiz-123' } } as any;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and the quiz when found', async () => {
    const quizDTO = { id: 'quiz-123', title: 'Quiz 1' } as any;
    mockGetQuizByIdUseCase.execute.mockResolvedValue(quizDTO);

    await controller.getById(req as Request, res as Response, next);

    expect(mockGetQuizByIdUseCase.execute).toHaveBeenCalledWith({ id: 'quiz-123' });
    expect(mockGetQuizByIdUseCase.execute).toHaveBeenCalledTimes(1);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: quizDTO,
    });

    expect(next).not.toHaveBeenCalled();
  });

  it('should call next(error) when use case throws', async () => {
    const error = new Error('Boom');
    mockGetQuizByIdUseCase.execute.mockRejectedValue(error);

    await controller.getById(req as Request, res as Response, next);

    expect(mockGetQuizByIdUseCase.execute).toHaveBeenCalledWith({ id: 'quiz-123' });
    expect(next).toHaveBeenCalledWith(error);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  describe('submitAttempt', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetAuth.mockReturnValue({ userId: null });

      await controller.submitAttempt(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Non autorise',
        message: 'Utilisateur non authentifie',
      });
      expect(mockSubmitQuizAttemptUseCase.execute).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should submit an attempt successfully', async () => {
      mockGetAuth.mockReturnValue({ userId: 'user-123' });
      req = {
        params: { id: 'quiz-123' },
        body: {
          answers: [{ questionIndex: 0, selectedOptionIndexes: [1] }],
        },
      } as any;

      const result = { id: 'attempt-1' } as any;
      mockSubmitQuizAttemptUseCase.execute.mockResolvedValue(result);

      await controller.submitAttempt(req as Request, res as Response, next);

      expect(mockSubmitQuizAttemptUseCase.execute).toHaveBeenCalledWith({
        quizId: 'quiz-123',
        userId: 'user-123',
        answers: [{ questionIndex: 0, selectedOptionIndexes: [1] }],
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
    });

    it('should call next(error) when submit attempt fails', async () => {
      mockGetAuth.mockReturnValue({ userId: 'user-123' });
      req = {
        params: { id: 'quiz-123' },
        body: { answers: [{ questionIndex: 0, selectedOptionIndexes: [1] }] },
      } as any;
      const error = new Error('Submit failed');
      mockSubmitQuizAttemptUseCase.execute.mockRejectedValue(error);

      await controller.submitAttempt(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('getMyProgress', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetAuth.mockReturnValue({ userId: null });

      await controller.getMyProgress(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Non autorise',
        message: 'Utilisateur non authentifie',
      });
      expect(mockGetQuizProgressUseCase.execute).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should return progress for authenticated user', async () => {
      mockGetAuth.mockReturnValue({ userId: 'user-123' });
      const result = { quizId: 'quiz-123', totalAttempts: 1 } as any;
      mockGetQuizProgressUseCase.execute.mockResolvedValue(result);

      await controller.getMyProgress(req as Request, res as Response, next);

      expect(mockGetQuizProgressUseCase.execute).toHaveBeenCalledWith({
        quizId: 'quiz-123',
        userId: 'user-123',
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
    });

    it('should call next(error) when progress retrieval fails', async () => {
      mockGetAuth.mockReturnValue({ userId: 'user-123' });
      const error = new Error('Progress failed');
      mockGetQuizProgressUseCase.execute.mockRejectedValue(error);

      await controller.getMyProgress(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
