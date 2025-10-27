import { body, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

export const validateCreateBeneficiary = [
  body('clerkUserId')
    .trim()
    .notEmpty()
    .withMessage("L'ID Clerk est requis")
    .isLength({ min: 1 })
    .withMessage("L'ID Clerk ne peut pas être vide"),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage("L'email est requis")
    .isEmail()
    .withMessage("Format d'email invalide")
    .normalizeEmail(),

  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Le numéro de téléphone est requis')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Format de numéro de téléphone invalide (format international attendu)'),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array(),
      message: 'Données invalides',
    });
    return;
  }

  next();
};
