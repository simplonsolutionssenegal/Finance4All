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

export const validateLessonId = [param('id').isUUID().withMessage('Invalid lesson ID format')];

export const validateUpdateLesson = [
  // Vérifier qu'au moins un champ est fourni
  body().custom((value, { req }) => {
    const allowedFields = [
      'title',
      'description',
      'duration',
      'order',
      'status',
      'chapters',
      'quizzes',
    ];
    const hasAtLeastOneField = allowedFields.some(field => req.body[field] !== undefined);

    if (!hasAtLeastOneField) {
      throw new Error('Au moins un champ doit être fourni pour la mise à jour');
    }
    return true;
  }),

  body('title')
    .optional()
    .notEmpty()
    .withMessage('Le titre ne peut pas être vide')
    .isLength({ max: 200 })
    .withMessage('Le titre ne peut pas dépasser 200 caractères'),

  body('description').optional().notEmpty().withMessage('La description ne peut pas être vide'),

  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La durée doit être un entier supérieur à 0'),

  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage("L'ordre doit être un entier positif ou zéro"),

  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED'])
    .withMessage('Statut invalide'),

  body('chapters').optional().isArray().withMessage('Les chapitres doivent être un tableau'),

  body('chapters.*.title')
    .if(body('chapters').exists())
    .notEmpty()
    .withMessage('Le titre du chapitre ne peut pas être vide'),

  body('chapters.*.description')
    .if(body('chapters').exists())
    .notEmpty()
    .withMessage('La description du chapitre ne peut pas être vide'),

  body('chapters.*.order')
    .if(body('chapters').exists())
    .isInt({ min: 0 })
    .withMessage("L'ordre du chapitre doit être un entier positif ou zéro"),

  body('quizzes').optional().isArray().withMessage('Les quizzes doivent être un tableau'),

  body('quizzes.*.title')
    .if(body('quizzes').exists())
    .notEmpty()
    .withMessage('Le titre du quiz ne peut pas être vide'),

  body('quizzes.*.scoreMinimum')
    .if(body('quizzes').exists())
    .isInt({ min: 0, max: 100 })
    .withMessage('Le score minimum doit être entre 0 et 100'),

  body('quizzes.*.nombreTentatives')
    .if(body('quizzes').exists())
    .isInt({ min: 1, max: 3 })
    .withMessage('Le nombre de tentatives doit être entre 1 et 3'),

  body('quizzes.*.questions')
    .if(body('quizzes').exists())
    .isArray({ min: 1 })
    .withMessage('Le quiz doit avoir au moins une question'),
];
