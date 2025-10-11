import { body, query, param, validationResult } from 'express-validator';
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

export const validateUpdateInstitution = [
  param('id').isUUID().withMessage('Invalid institution ID format'),
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

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
];

export const validateInstitutionId = [
  param('id').isUUID().withMessage('Invalid institution ID format'),
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

export const validateAddService = [
  param('id').isUUID().withMessage('Invalid institution ID format'),
  body('name')
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Service name must be between 2 and 255 characters'),
  body('longName')
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Long name must be between 2 and 255 characters'),
  body('type').isString().notEmpty().withMessage('Service type is required'),
  body('frais').isObject().withMessage('Frais must be an object'),
  body('frais.montantFixe').optional().isNumeric().withMessage('Montant fixe must be a number'),
  body('frais.pourcentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Pourcentage must be between 0 and 100'),
  body('frais.minimum').optional().isNumeric().withMessage('Minimum must be a number'),
  body('frais.maximum').optional().isNumeric().withMessage('Maximum must be a number'),
  body('conditionAccess').isArray().withMessage('Condition access must be an array'),
  body('plafonds').isArray().withMessage('Plafonds must be an array'),
  body('infrastructureAccess').isArray().withMessage('Infrastructure access must be an array'),
];
