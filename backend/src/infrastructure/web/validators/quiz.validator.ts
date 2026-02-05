import { body, param, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware pour gérer les erreurs de validation
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array(),
    });
    return;
  }
  next();
};

export const validateQuizId = [param('id').isUUID().withMessage('Invalid quiz ID format')];

export const validateSubmitQuizAttempt = [
  body('answers').isArray({ min: 1 }).withMessage('answers must be a non-empty array'),
  body('answers.*.questionIndex')
    .isInt({ min: 0 })
    .withMessage('questionIndex must be an integer >= 0'),
  body('answers.*.selectedOptionIndexes')
    .isArray()
    .withMessage('selectedOptionIndexes must be an array'),
  body('answers.*.selectedOptionIndexes.*')
    .isInt({ min: 0 })
    .withMessage('selectedOptionIndexes values must be integers >= 0'),
];
