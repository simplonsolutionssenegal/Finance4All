import request from 'supertest';
import express from 'express';

const mockLessonController = {
  getById: jest.fn(),
  addQuiz: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('@/infrastructure/config/container', () => ({
  container: {
    get: jest.fn().mockReturnValue(mockLessonController),
  },
  TYPES: {
    LessonController: 'LessonController',
  },
}));

jest.mock('@/infrastructure/web/validators/lesson.validator', () => ({
  handleValidationErrors: jest.fn((req, res, next) => next()),
  validateLessonId: [],
  validateUpdateLesson: [],
}));

describe('LessonRoutes', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();

    const { LessonRoutes } = require('@/infrastructure/web/routes/lesson.route');

    app = express();
    app.use(express.json());
    app.use('/lessons', LessonRoutes());
  });

  it('GET /lessons/:id should call controller.getById', async () => {
    mockLessonController.getById.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, data: { id: req.params.id } });
    });

    const res = await request(app).get('/lessons/lesson-1').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('lesson-1');
    expect(mockLessonController.getById).toHaveBeenCalledTimes(1);
  });

  it('PUT /lessons/:id/quizzes should call controller.addQuiz', async () => {
    mockLessonController.addQuiz.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, data: { lessonId: req.params.id } });
    });

    const payload = {
      title: 'Quiz',
      description: 'Desc',
      status: 'DRAFT',
      scoreMinimum: 70,
      nombreTentatives: 2,
      questions: [],
    };

    const res = await request(app).put('/lessons/lesson-2/quizzes').send(payload).expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.lessonId).toBe('lesson-2');
    expect(mockLessonController.addQuiz).toHaveBeenCalledTimes(1);
  });

  it('PUT /lessons/:id should call controller.update', async () => {
    mockLessonController.update.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, data: { id: req.params.id, ...req.body } });
    });

    const payload = {
      title: 'Lesson updated',
      description: 'New desc',
      duration: 45,
    };

    const res = await request(app).put('/lessons/lesson-3').send(payload).expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('lesson-3');
    expect(res.body.data.title).toBe('Lesson updated');
    expect(mockLessonController.update).toHaveBeenCalledTimes(1);
  });

  it('DELETE /lessons/:id should call controller.delete', async () => {
    mockLessonController.delete.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'deleted' });
    });

    const res = await request(app).delete('/lessons/lesson-4').expect(200);

    expect(res.body.success).toBe(true);
    expect(mockLessonController.delete).toHaveBeenCalledTimes(1);
  });

  it('should bind controller context for all handlers', async () => {
    mockLessonController.getById.mockImplementation(function (this: any, req: any, res: any) {
      expect(this).toBe(mockLessonController);
      res.status(200).json({ success: true, data: { id: req.params.id } });
    });

    await request(app).get('/lessons/lesson-ctx').expect(200);
    expect(mockLessonController.getById).toHaveBeenCalledTimes(1);
  });
});
