import { body, param, type ValidationChain, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { StreamQuality } from '@/domain/streaming/value-objects/StreamQuality';

export const validateMediaId: ValidationChain[] = [
  param('id').isUUID().withMessage('Invalid media ID format'),
];

export const validateStartTranscoding: ValidationChain[] = [
  body('qualities').optional().isArray().withMessage('Qualities must be an array'),
  body('qualities.*')
    .optional()
    .isIn(Object.values(StreamQuality))
    .withMessage(`Quality must be one of: ${Object.values(StreamQuality).join(', ')}`),
];

export const validateUpdateProgress: ValidationChain[] = [
  body('currentPosition')
    .isFloat({ min: 0 })
    .withMessage('Current position must be a non-negative number'),
  body('duration').isFloat({ min: 0 }).withMessage('Duration must be a non-negative number'),
];

export const validateQuality: ValidationChain[] = [
  param('quality').custom(value => {
    const validQualities = Object.values(StreamQuality).map(q => q.toLowerCase());
    if (!validQualities.includes(value.toLowerCase())) {
      throw new Error(`Quality must be one of: ${Object.values(StreamQuality).join(', ')}`);
    }
    return true;
  }),
];

export const validateSegment: ValidationChain[] = [
  param('segment')
    .matches(/^segment\d{3}\.ts$/)
    .withMessage('Invalid segment format. Expected format: segmentXXX.ts'),
];

export const validateGenerateToken: ValidationChain[] = [
  body('expiresInSeconds')
    .optional()
    .isInt({ min: 60, max: 86400 })
    .withMessage('expiresInSeconds must be between 60 and 86400'),
];

export const handleStreamingValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
