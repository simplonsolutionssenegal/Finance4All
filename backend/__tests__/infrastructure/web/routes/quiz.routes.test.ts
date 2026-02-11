import request from 'supertest';
import express from 'express';

const mockQuizController = {
  getById: jest.fn(),
  update: jest.fn(),
  submitAttempt: jest.fn(),
  getMyProgress: jest.fn(),
  delete: jest.fn(),
};

jest.mock('@/infrastructure/config/container', () => ({
  container: {
    get: jest.fn().mockReturnValue(mockQuizController),
  },
  TYPES: {
    QuizController: 'QuizController',
  },
}));

jest.mock('@/infrastructure/web/validators/quiz.validator', () => ({
  handleValidationErrors: jest.fn((req, res, next) => next()),
  validateQuizId: [],
  validateSubmitQuizAttempt: [],
}));

describe('QuizRoutes', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();

    const { QuizRoutes } = require('@/infrastructure/web/routes/quiz.route');

    app = express();
    app.use(express.json());
    app.use('/quizzes', QuizRoutes());
  });

  it('GET /quizzes/:id should call controller.getById', async () => {
    mockQuizController.getById.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, data: { id: req.params.id } });
    });

    const res = await request(app).get('/quizzes/quiz-1').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('quiz-1');
    expect(mockQuizController.getById).toHaveBeenCalledTimes(1);
  });

  it('PUT /quizzes/:id should call controller.update', async () => {
    mockQuizController.update.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, data: { id: req.params.id, ...req.body } });
    });

    const payload = { title: 'Quiz updated', scoreMinimum: 80 };

    const res = await request(app).put('/quizzes/quiz-2').send(payload).expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('quiz-2');
    expect(res.body.data.title).toBe('Quiz updated');
    expect(mockQuizController.update).toHaveBeenCalledTimes(1);
  });

  it('DELETE /quizzes/:id should call controller.delete', async () => {
    mockQuizController.delete.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'deleted' });
    });

    const res = await request(app).delete('/quizzes/quiz-5').expect(200);

    expect(res.body.success).toBe(true);
    expect(mockQuizController.delete).toHaveBeenCalledTimes(1);
  });

  it('POST /quizzes/:id/attempts should call controller.submitAttempt', async () => {
    mockQuizController.submitAttempt.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, data: { quizId: req.params.id } });
    });

    const payload = { answers: [{ questionIndex: 0, selectedOptionIndexes: [1] }] };

    const res = await request(app).post('/quizzes/quiz-3/attempts').send(payload).expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.quizId).toBe('quiz-3');
    expect(mockQuizController.submitAttempt).toHaveBeenCalledTimes(1);
  });

  it('GET /quizzes/:id/progress/me should call controller.getMyProgress', async () => {
    mockQuizController.getMyProgress.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, data: { quizId: req.params.id } });
    });

    const res = await request(app).get('/quizzes/quiz-4/progress/me').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.quizId).toBe('quiz-4');
    expect(mockQuizController.getMyProgress).toHaveBeenCalledTimes(1);
  });

  it('should bind controller context for all handlers', async () => {
    mockQuizController.getById.mockImplementation(function (this: any, req: any, res: any) {
      expect(this).toBe(mockQuizController);
      res.status(200).json({ success: true, data: { id: req.params.id } });
    });

    await request(app).get('/quizzes/quiz-ctx').expect(200);
    expect(mockQuizController.getById).toHaveBeenCalledTimes(1);
  });
});
