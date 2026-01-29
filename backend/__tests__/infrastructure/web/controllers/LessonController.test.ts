import type { Request, Response, NextFunction } from 'express';
import { LessonController } from '@/infrastructure/web/controllers/LessonController';
import type { GetLessonByIdUseCase } from '@/domain/formations/ports/in/GetLessonByIdUseCase';

describe('LessonController (unit) — 100% coverage', () => {
  let controller: LessonController;
  let mockGetLessonByIdUseCase: jest.Mocked<GetLessonByIdUseCase>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockGetLessonByIdUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new LessonController(mockGetLessonByIdUseCase);

    req = { params: { id: 'lesson-123' } } as any;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and the lesson when found', async () => {
    const lessonDTO = { id: 'lesson-123', title: 'Leçon 1' } as any;
    mockGetLessonByIdUseCase.execute.mockResolvedValue(lessonDTO);

    await controller.getById(req as Request, res as Response, next);

    expect(mockGetLessonByIdUseCase.execute).toHaveBeenCalledWith({ id: 'lesson-123' });
    expect(mockGetLessonByIdUseCase.execute).toHaveBeenCalledTimes(1);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: lessonDTO,
    });

    expect(next).not.toHaveBeenCalled();
  });

  it('should call next(error) when use case throws', async () => {
    const error = new Error('Boom');
    mockGetLessonByIdUseCase.execute.mockRejectedValue(error);

    await controller.getById(req as Request, res as Response, next);

    expect(mockGetLessonByIdUseCase.execute).toHaveBeenCalledWith({ id: 'lesson-123' });
    expect(next).toHaveBeenCalledWith(error);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
