import type { NextFunction, Request, Response } from 'express';
import { LessonController } from '@/infrastructure/web/controllers/LessonController';
import type { GetLessonByIdUseCase } from '@/domain/formations/ports/in/GetLessonByIdUseCase';
import type { AddQuizLessonUseCase } from '@/domain/formations/ports/in/AddQuizLessonUseCase';
import type { UpdateLessonUseCase } from '@/domain/formations/ports/in/UpdateLessonUseCase';
import type { DeleteLessonUseCase } from '@/domain/formations/ports/in/DeleteLessonUseCase';

describe('LessonController', () => {
  const createMockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  let getLessonByIdUseCase: jest.Mocked<GetLessonByIdUseCase>;
  let addQuizLessonUseCase: jest.Mocked<AddQuizLessonUseCase>;
  let updateLessonUseCase: jest.Mocked<UpdateLessonUseCase>;
  let deleteLessonUseCase: jest.Mocked<DeleteLessonUseCase>;
  let controller: LessonController;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    getLessonByIdUseCase = { execute: jest.fn() } as any;
    addQuizLessonUseCase = { execute: jest.fn() } as any;
    updateLessonUseCase = { execute: jest.fn() } as any;
    deleteLessonUseCase = { execute: jest.fn() } as any;

    controller = new LessonController(
      getLessonByIdUseCase,
      addQuizLessonUseCase,
      updateLessonUseCase,
      deleteLessonUseCase
    );

    next = jest.fn();
  });

  it('getById should return lesson', async () => {
    const req = { params: { id: 'lesson-123' } } as unknown as Request;
    const res = createMockResponse();
    const lesson = { id: 'lesson-123' } as any;
    getLessonByIdUseCase.execute.mockResolvedValueOnce(lesson);

    await controller.getById(req, res, next);

    expect(getLessonByIdUseCase.execute).toHaveBeenCalledWith({ id: 'lesson-123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'success', data: lesson });
    expect(next).not.toHaveBeenCalled();
  });

  it('getById should call next on error', async () => {
    const req = { params: { id: 'lesson-123' } } as unknown as Request;
    const res = createMockResponse();
    const error = new Error('boom');
    getLessonByIdUseCase.execute.mockRejectedValueOnce(error);

    await controller.getById(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('addQuiz should return updated lesson', async () => {
    const req = {
      params: { id: 'lesson-123' },
      body: { title: 'Quiz', scoreMinimum: 50 },
    } as unknown as Request;
    const res = createMockResponse();
    const updatedLesson = { id: 'lesson-123' } as any;
    addQuizLessonUseCase.execute.mockResolvedValueOnce(updatedLesson);

    await controller.addQuiz(req, res, next);

    expect(addQuizLessonUseCase.execute).toHaveBeenCalledWith({
      lessonId: 'lesson-123',
      title: 'Quiz',
      scoreMinimum: 50,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ status: 'success', data: updatedLesson });
  });

  it('addQuiz should call next on error', async () => {
    const req = { params: { id: 'lesson-123' }, body: {} } as unknown as Request;
    const res = createMockResponse();
    const error = new Error('boom');
    addQuizLessonUseCase.execute.mockRejectedValueOnce(error);

    await controller.addQuiz(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('update should return updated lesson', async () => {
    const req = {
      params: { id: 'lesson-123' },
      body: { title: 'Lecon modifiee' },
    } as unknown as Request;
    const res = createMockResponse();
    const updatedLesson = { id: 'lesson-123' } as any;
    updateLessonUseCase.execute.mockResolvedValueOnce(updatedLesson);

    await controller.update(req, res, next);

    expect(updateLessonUseCase.execute).toHaveBeenCalledWith({
      id: 'lesson-123',
      title: 'Lecon modifiee',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'success', data: updatedLesson });
  });

  it('update should call next on error', async () => {
    const req = { params: { id: 'lesson-123' }, body: {} } as unknown as Request;
    const res = createMockResponse();
    const error = new Error('boom');
    updateLessonUseCase.execute.mockRejectedValueOnce(error);

    await controller.update(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('delete should return success', async () => {
    const req = { params: { id: 'lesson-123' } } as unknown as Request;
    const res = createMockResponse();
    deleteLessonUseCase.execute.mockResolvedValueOnce(undefined);

    await controller.delete(req, res, next);

    expect(deleteLessonUseCase.execute).toHaveBeenCalledWith('lesson-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Lesson deleted successfully',
    });
  });

  it('delete should call next on error', async () => {
    const req = { params: { id: 'lesson-123' } } as unknown as Request;
    const res = createMockResponse();
    const error = new Error('boom');
    deleteLessonUseCase.execute.mockRejectedValueOnce(error);

    await controller.delete(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
