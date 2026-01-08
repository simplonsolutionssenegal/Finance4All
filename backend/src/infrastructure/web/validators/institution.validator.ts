import { body, query, param, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

const INSTITUTION_TYPES = [
  'ETABLISSEMENT_MONNAIE_ELECTRONIQUE',
  'PORTEFEUILLE_NUMERIQUE',
  'SERVICE_PAIEMENT_ELECTRONIQUE',
  'BANQUE_NUMERIQUE',
  'SERVICE_FINANCIER_DECENTRALISE',
  'SERVICE_FINANCEMENT_PARTICIPATIF',
  'SERVICE_INVESTISSEMENT',
  'SERVICE_GESTION_FINANCIERE',
  'SERVICE_ASSURANCE_NUMERIQUE',
] as const;

const COUNTRIES = ['SENEGAL', 'CAMEROUN'] as const;

const institutionName = () =>
  body('name')
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters');

const institutionDescription = () =>
  body('description').isString().trim().notEmpty().withMessage('Description is required');

const institutionWebsite = () =>
  body('website').optional().isURL().withMessage('Invalid website URL');

const institutionLogo = () => body('logoUrl').optional().isURL().withMessage('Invalid logo URL');

const institutionZones = () =>
  body('geographicZones').isArray().withMessage('Geographic zones must be an array');

const institutionType = (optional = false) =>
  (optional ? body('type').optional() : body('type'))
    .isIn(INSTITUTION_TYPES)
    .withMessage('Invalid institution type');

const institutionCountry = (optional = false) =>
  (optional ? body('pays').optional() : body('pays'))
    .isIn(COUNTRIES)
    .withMessage('Country must be either SENEGAL or CAMEROUN');

export const validateCreateInstitution = [
  institutionName(),
  institutionDescription(),
  institutionWebsite(),
  institutionZones(),
  institutionLogo(),
  institutionType(),
  institutionCountry(),
];

export const validateUpdateInstitution = [
  param('id').isUUID().withMessage('Invalid institution ID format'),
  institutionName(),
  institutionDescription(),
  institutionWebsite(),
  institutionZones(),
  institutionLogo(),
  institutionType(true),
  institutionCountry(true),
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
