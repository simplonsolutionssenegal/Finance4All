import { body, validationResult } from 'express-validator';
import type { NextFunction, Request, Response } from 'express';

export const validateContactEmail = [
  body('firstName')
    .isString()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Le prénom doit contenir entre 2 et 80 caractères'),
  body('lastName')
    .isString()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Le nom doit contenir entre 2 et 80 caractères'),
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('phone')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 6, max: 30 })
    .withMessage('Téléphone invalide'),
  body('country')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le pays est invalide'),
  body('subject')
    .isString()
    .trim()
    .isLength({ min: 5, max: 150 })
    .withMessage('Le sujet doit contenir entre 5 et 150 caractères'),
  body('message')
    .isString()
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Le message doit contenir entre 20 et 5000 caractères'),
  // Honeypot anti-bot: ce champ doit rester vide
  body('website').optional({ values: 'falsy' }).isEmpty().withMessage('Requête invalide'),
];

export const handleContactValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};
