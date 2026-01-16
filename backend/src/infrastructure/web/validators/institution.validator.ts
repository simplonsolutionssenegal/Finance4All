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
  body('type')
    .isIn([
      'ETABLISSEMENT_MONNAIE_ELECTRONIQUE',
      'PORTEFEUILLE_NUMERIQUE',
      'SERVICE_PAIEMENT_ELECTRONIQUE',
      'BANQUE_NUMERIQUE',
      'SERVICE_FINANCIER_DECENTRALISE',
      'SERVICE_FINANCEMENT_PARTICIPATIF',
      'SERVICE_INVESTISSEMENT',
      'SERVICE_GESTION_FINANCIERE',
      'SERVICE_ASSURANCE_NUMERIQUE',
    ])
    .withMessage('Invalid institution type'),
  body('pays')
    .isIn(['SENEGAL', 'CAMEROUN'])
    .withMessage('Country must be either SENEGAL or CAMEROUN'),
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
  body('type')
    .optional()
    .isIn([
      'ETABLISSEMENT_MONNAIE_ELECTRONIQUE',
      'PORTEFEUILLE_NUMERIQUE',
      'SERVICE_PAIEMENT_ELECTRONIQUE',
      'BANQUE_NUMERIQUE',
      'SERVICE_FINANCIER_DECENTRALISE',
      'SERVICE_FINANCEMENT_PARTICIPATIF',
      'SERVICE_INVESTISSEMENT',
      'SERVICE_GESTION_FINANCIERE',
      'SERVICE_ASSURANCE_NUMERIQUE',
    ])
    .withMessage('Invalid institution type'),
  body('pays')
    .optional()
    .isIn(['SENEGAL', 'CAMEROUN'])
    .withMessage('Country must be either SENEGAL or CAMEROUN'),
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
  body('frais').custom(value => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error('Frais must be an object');
    }
    return true;
  }),
  body('frais.montantFixe').optional().isNumeric().withMessage('Montant fixe must be a number'),
  body('frais.pourcentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Pourcentage must be between 0 and 100'),
  body('frais.minimum').optional().isNumeric().withMessage('Minimum must be a number'),
  body('frais.maximum').optional().isNumeric().withMessage('Maximum must be a number'),
  body('frais.minimum').custom((value, { req }) => {
    if (value && req.body.frais?.maximum && Number(value) > Number(req.body.frais.maximum)) {
      throw new Error('Minimum cannot be greater than maximum');
    }
    return true;
  }),
  body('conditionAccess').isArray().withMessage('Condition access must be an array'),
  body('plafonds').isArray().withMessage('Plafonds must be an array'),
  body('infrastructureAccess').isArray().withMessage('Infrastructure access must be an array'),
];

export const validatePatchService = [
  // Params
  param('institutionId').isUUID().withMessage('Invalid institutionId format'),
  param('serviceId').isUUID().withMessage('Invalid serviceId format'),

  // Body (PATCH = tout optionnel)
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Service name must be between 2 and 255 characters'),

  body('longName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Long name must be between 2 and 255 characters'),

  body('type')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Service type must be a non-empty string'),

  body('montantMin').optional().isNumeric().withMessage('montantMin must be a number'),

  body('montantMax').optional().isNumeric().withMessage('montantMax must be a number'),

  // si les deux existent, min <= max
  body('montantMin').custom((value, { req }) => {
    if (value !== undefined && req.body.montantMax !== undefined) {
      if (Number(value) > Number(req.body.montantMax)) {
        throw new Error('montantMin cannot be greater than montantMax');
      }
    }
    return true;
  }),

  // Arrays (optionnels en PATCH)
  body('conditionAccess').optional().isArray().withMessage('conditionAccess must be an array'),

  body('plafonds').optional().isArray().withMessage('plafonds must be an array'),

  body('infrastructureAccess')
    .optional()
    .isArray()
    .withMessage('infrastructureAccess must be an array'),

  // Frais (optionnel)
  body('frais')
    .optional()
    .custom(value => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error('frais must be an object');
      }
      return true;
    }),

  body('frais.montantFixe')
    .optional()
    .isNumeric()
    .withMessage('frais.montantFixe must be a number'),

  body('frais.pourcentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('frais.pourcentage must be between 0 and 100'),

  body('frais.minimum').optional().isNumeric().withMessage('frais.minimum must be a number'),

  body('frais.maximum').optional().isNumeric().withMessage('frais.maximum must be a number'),

  body('frais.minimum').custom((value, { req }) => {
    if (value !== undefined && req.body.frais?.maximum !== undefined) {
      if (Number(value) > Number(req.body.frais.maximum)) {
        throw new Error('frais.minimum cannot be greater than frais.maximum');
      }
    }
    return true;
  }),
];
