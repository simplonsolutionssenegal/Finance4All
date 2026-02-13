import type { Request, Response, NextFunction } from 'express';
import {
  handleValidationErrors,
  validateLessonId,
  validateUpdateLesson,
} from '@/infrastructure/web/validators/lesson.validator';
import { validationResult } from 'express-validator';

// ✅ on mock seulement validationResult
jest.mock('express-validator', () => {
  const actual = jest.requireActual('express-validator');
  return {
    ...actual,
    validationResult: jest.fn(),
  };
});

describe('lesson.validator', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;
  const { validationResult: realValidationResult } = jest.requireActual('express-validator');

  beforeEach(() => {
    req = { params: { id: 'x' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('handleValidationErrors', () => {
    it('should return 400 + errors when validationResult is not empty', () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid lesson ID format', param: 'id' }],
      });

      handleValidationErrors(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: [{ msg: 'Invalid lesson ID format', param: 'id' }],
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when validationResult is empty', () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      });

      handleValidationErrors(req as Request, res as Response, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateLessonId', () => {
    it('should be an array with a single validation chain', () => {
      expect(Array.isArray(validateLessonId)).toBe(true);
      expect(validateLessonId).toHaveLength(1);

      const chain = validateLessonId[0] as any;
      // express-validator ValidationChain expose run(req)
      expect(typeof chain.run).toBe('function');
    });
  });

  describe('validateUpdateLesson', () => {
    const runValidators = async (body: any) => {
      const req = { body } as Request;
      for (const chain of validateUpdateLesson as any[]) {
        await chain.run(req);
      }
      return realValidationResult(req);
    };

    it('should fail when no updatable fields are provided', async () => {
      const result = await runValidators({});
      expect(result.isEmpty()).toBe(false);
      const messages = result.array().map((e: any) => e.msg);
      expect(messages).toContain('Au moins un champ doit être fourni pour la mise à jour');
    });

    it('should pass with a valid title only', async () => {
      const result = await runValidators({ title: 'Ma leçon' });
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail with invalid status', async () => {
      const result = await runValidators({ status: 'INVALID' });
      expect(result.isEmpty()).toBe(false);
      const messages = result.array().map((e: any) => e.msg);
      expect(messages).toContain('Statut invalide');
    });

    it('should fail when quizzes provided without questions', async () => {
      const result = await runValidators({
        quizzes: [
          {
            title: 'Quiz',
            scoreMinimum: 50,
            nombreTentatives: 2,
            questions: [],
          },
        ],
      });
      expect(result.isEmpty()).toBe(false);
      const messages = result.array().map((e: any) => e.msg);
      expect(messages).toContain('Le quiz doit avoir au moins une question');
    });
  });
});
