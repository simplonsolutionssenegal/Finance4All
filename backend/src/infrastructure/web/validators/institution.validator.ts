import { body, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

export const validateCreateInstitution = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  body('description').isString().trim().notEmpty().withMessage('Description is required'),
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('geographicZones').isArray().withMessage('Geographic zones must be an array'),
  body('logoUrl').optional().isURL().withMessage('Invalid logo URL'),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array(),
    });
  }
  next();
};
