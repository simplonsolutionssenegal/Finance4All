//infrastructure/web/validators/module.validator.ts

import { body, query, validationResult, type ValidationChain } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { DifficultyLevel, ModuleStatus } from '@/domain/formations/entities/ModuleFormation';

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

/**
 * Validation pour la création d'un module
 */
export const validateCreateModule: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Le titre est obligatoire')
    .isLength({ max: 200 })
    .withMessage('Le titre ne peut pas dépasser 200 caractères'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('La description est obligatoire')
    .isLength({ min: 10 })
    .withMessage('La description doit contenir au moins 10 caractères'),

  body('thematics')
    .trim()
    .notEmpty()
    .withMessage('Au moins une thématique est requise')
    .isLength({ min: 10 })
    .withMessage('Thématique existe déjà'),

  body('difficultyLevel')
    .isIn(Object.values(DifficultyLevel))
    .withMessage('Niveau de difficulté invalide'),

  body('estimatedDuration')
    .isFloat({ min: 0.1 })
    .withMessage('La durée estimée doit être supérieure à 0'),
];

/**
 * Validation pour la récupération de modules
 */
export const validateGetModules: ValidationChain[] = [
  query('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Le titre ne peut pas dépasser 200 caractères'),
  query('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères'),
  query('objective')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("L'objectif pédagogique ne peut pas dépasser 200 caractères"),
  query('status').optional().isIn(Object.values(ModuleStatus)).withMessage('Statut invalide'),

  query('difficultyLevel')
    .optional()
    .isIn(Object.values(DifficultyLevel))
    .withMessage('Niveau de difficulté invalide'),
  query('thematics')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Ne peut pas dépasser 20 caractères'),

  query('imageUrl').optional().isURL().withMessage("URL de l'image invalide"),
];
