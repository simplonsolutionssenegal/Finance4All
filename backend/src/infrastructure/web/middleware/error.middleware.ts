import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logError } from '@/utils/logger';

// Interface pour les erreurs personnalisées
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Gestionnaires d'erreurs spécialisés
const handleAppError = (error: AppError, res: Response): void => {
  res.status(error.statusCode).json({
    status: 'error',
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

const handleZodError = (error: ZodError, res: Response): void => {
  const formattedErrors = error.issues.map(err => ({
    field: Array.isArray(err.path) ? err.path.join('.') : String(err.path),
    message: err.message,
    code: err.code,
  }));

  res.status(400).json({
    status: 'error',
    message: 'Validation failed',
    errors: formattedErrors,
  });
};

interface PrismaError extends Error {
  code?: string;
  meta?: {
    target?: string[];
    [key: string]: unknown;
  };
}

const handlePrismaError = (error: PrismaError, res: Response): void => {
  const prismaErrorHandlers: Record<string, () => void> = {
    P2002: () =>
      res.status(409).json({
        status: 'error',
        message: 'Duplicate entry',
        field: error.meta?.target,
      }),
    P2025: () =>
      res.status(404).json({
        status: 'error',
        message: 'Record not found',
      }),
    P2003: () =>
      res.status(400).json({
        status: 'error',
        message: 'Foreign key constraint failed',
      }),
  };

  const errorCode = error.code ?? '';
  const handler = errorCode ? prismaErrorHandlers[errorCode] : undefined;

  if (handler) {
    handler();
    return;
  }

  res.status(500).json({
    status: 'error',
    message: 'Database error',
    ...(process.env.NODE_ENV === 'development' && {
      code: error.code,
      details: error.message,
    }),
  });
};

interface ErrorWithConstructor extends Error {
  constructor: {
    name: string;
  };
  body?: unknown;
}

const handleSpecialErrors = (error: ErrorWithConstructor, res: Response): boolean => {
  const errorHandlers: Record<string, () => void> = {
    PrismaClientValidationError: () =>
      res.status(400).json({
        status: 'error',
        message: 'Invalid data provided',
        ...(process.env.NODE_ENV === 'development' && { details: error.message }),
      }),
    PrismaClientInitializationError: () =>
      res.status(503).json({
        status: 'error',
        message: 'Database connection failed',
      }),
    JsonWebTokenError: () =>
      res.status(401).json({
        status: 'error',
        message: 'Invalid token',
      }),
    TokenExpiredError: () =>
      res.status(401).json({
        status: 'error',
        message: 'Token expired',
      }),
  };

  const handler = errorHandlers[error.constructor.name] || errorHandlers[error.name];
  if (handler) {
    handler();
    return true;
  }

  if ('body' in error) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid JSON in request body',
    });
    return true;
  }

  return false;
};

// Middleware de gestion d'erreurs
export const errorMiddleware = (
  error: Error | PrismaError | ErrorWithConstructor,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logError(error, req);

  if (error instanceof AppError) {
    handleAppError(error, res);
    return;
  }

  if (error instanceof ZodError) {
    handleZodError(error, res);
    return;
  }

  if ('code' in error && typeof error.code === 'string') {
    handlePrismaError(error as Error & { code: string }, res);
    return;
  }

  if (handleSpecialErrors(error, res)) {
    return;
  }

  const statusCode = error.name === 'CastError' ? 400 : 500;
  const message = process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message;

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      name: error.name,
    }),
  });
};

// Middleware pour capturer les erreurs async
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware pour les routes non trouvées
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};
