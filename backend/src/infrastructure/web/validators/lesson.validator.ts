//infrastructure/web/validators/module.validator.ts

import { param, validationResult } from 'express-validator';
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

export const validateLessonId = [param('id').isUUID().withMessage('Invalid lesson ID format')];
