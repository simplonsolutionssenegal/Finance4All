import type { Request, Response, NextFunction } from 'express';
import {
  handleValidationErrors,
  validateQuizId,
} from '@/infrastructure/web/validators/quiz.validator';
import { validationResult } from 'express-validator';

// ✅ on mock seulement validationResult
jest.mock('express-validator', () => {
  const actual = jest.requireActual('express-validator');
  return {
    ...actual,
    validationResult: jest.fn(),
  };
});

describe('quiz.validator', () => {
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
        array: () => [{ msg: 'Invalid quiz ID format', param: 'id' }],
      });

      handleValidationErrors(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: [{ msg: 'Invalid quiz ID format', param: 'id' }],
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

  describe('validateQuizId', () => {
    it('should be an array with a single validation chain', () => {
      expect(Array.isArray(validateQuizId)).toBe(true);
      expect(validateQuizId).toHaveLength(1);

      const chain = validateQuizId[0] as any;
      expect(typeof chain.run).toBe('function');
    });
  });
});
