import type { Request, Response, NextFunction } from 'express';
import {
  handleValidationErrors,
  validateLessonId,
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
});
