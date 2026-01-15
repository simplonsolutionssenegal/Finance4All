import { body, param, query, type ValidationChain, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { MediaType, MAX_FILE_SIZES, isValidMimeType } from '@/domain/media/value-objects/MediaType';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (isValidMimeType(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: video, pdf, audio`));
  }
};

// Get max file size across all types
const maxFileSize = Math.max(...Object.values(MAX_FILE_SIZES));

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
  },
}).single('file');

export const validateMediaId: ValidationChain[] = [
  param('id').isUUID().withMessage('Invalid media ID format'),
];

export const validateGetMedias: ValidationChain[] = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(Object.values(MediaType))
    .withMessage(`Type must be one of: ${Object.values(MediaType).join(', ')}`),
];

export const validatePresignedUrl: ValidationChain[] = [
  param('id').isUUID().withMessage('Invalid media ID format'),
  query('expiresIn')
    .optional()
    .isInt({ min: 60, max: 604800 })
    .withMessage('ExpiresIn must be between 60 and 604800 seconds (1 minute to 7 days)'),
];

export const validateUploadMetadata: ValidationChain[] = [
  body('metadata')
    .optional()
    .custom(value => {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('Metadata must be a JSON object');
          }
        } catch {
          throw new Error('Invalid JSON format for metadata');
        }
      }
      return true;
    }),
];

export const validateTemporaryUpload: ValidationChain[] = [
  body('metadata')
    .optional()
    .custom(value => {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('Metadata must be a JSON object');
          }
        } catch {
          throw new Error('Invalid JSON format for metadata');
        }
      }
      return true;
    }),
  body('expiresInHours')
    .optional()
    .isInt({ min: 1, max: 168 })
    .withMessage('expiresInHours must be between 1 and 168 hours (1 week max)'),
];

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

interface MulterError extends Error {
  code?: string;
  field?: string;
}

export const handleMulterError = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  const multerError = err as MulterError;
  if (multerError.code) {
    if (multerError.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'File size exceeds maximum allowed size',
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }
  if (err.message.includes('Invalid file type')) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }
  next(err);
};
