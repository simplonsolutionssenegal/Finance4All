import { body, param, type ValidationChain, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

export const validateBeneficiaryId: ValidationChain[] = [
  param('beneficiaryId').isUUID().withMessage('beneficiaryId invalide'),
];

export const validateAssignModules: ValidationChain[] = [
  param('beneficiaryId').isUUID().withMessage('beneficiaryId invalide'),
  body('organizationId').isString().notEmpty().withMessage('organizationId manquant'),
  body('moduleIds').isArray({ min: 1 }).withMessage('moduleIds doit être un tableau non vide'),
  body('moduleIds.*').isUUID().withMessage('Chaque moduleId doit être un UUID'),
];
export const validateRemoveModules: ValidationChain[] = [
  param('beneficiaryId').isUUID().withMessage('beneficiaryId invalide'),
  body('organizationId').isString().notEmpty().withMessage('organizationId manquant'),
  body('moduleIds').isArray({ min: 1 }).withMessage('moduleIds doit être un tableau non vide'),
  body('moduleIds.*').isUUID().withMessage('Chaque moduleId doit être un UUID'),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};
