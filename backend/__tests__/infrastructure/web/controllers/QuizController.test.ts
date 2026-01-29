import type { Request, Response, NextFunction } from 'express';
import { QuizController } from '@/infrastructure/web/controllers/QuizController';
import type { GetQuizByIdUseCase } from '@/domain/formations/ports/in/GetQuizByIdUseCase';

describe('QuizController (unit) — 100% coverage', () => {
  let controller: QuizController;
  let mockGetQuizByIdUseCase: jest.Mocked<GetQuizByIdUseCase>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockGetQuizByIdUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new QuizController(mockGetQuizByIdUseCase);

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
});
