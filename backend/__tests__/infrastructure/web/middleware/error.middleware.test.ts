import type { Request, Response, NextFunction } from 'express';
import { z, type ZodError } from 'zod';

import {
  AppError,
  errorMiddleware,
  asyncHandler,
  notFoundHandler,
} from '@/infrastructure/web/middleware/error.middleware';

import * as loggerModule from '@/utils/logger';

describe('Error Middleware', () => {
  beforeAll(() => {
    jest.spyOn(loggerModule, 'logError').mockImplementation(jest.fn());
  });
  const mockRequest = {} as Request;
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;
  const mockNext = jest.fn() as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('appelle logError à chaque erreur', () => {
    const error = new Error('Erreur log');
    errorMiddleware(error, mockRequest, mockResponse, mockNext);
    expect(loggerModule.logError).toHaveBeenCalledWith(error, mockRequest);
  });

  it('gère une erreur avec body non string', () => {
    const error = { body: { foo: 'bar' } } as any;
    errorMiddleware(error, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Invalid JSON in request body',
    });
  });

  it('gère une erreur avec constructor non string', () => {
    const error = { constructor: 123 } as any;
    errorMiddleware(error, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });

  it('ne fuite pas de stack en production', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('secret prod');
    errorMiddleware(error, mockRequest, mockResponse, mockNext);
    const json = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(json.stack).toBeUndefined();
    expect(json.message).toBe('Something went wrong');
  });

  it('ajoute code et details pour Prisma inconnu en dev', () => {
    process.env.NODE_ENV = 'development';
    const error = { name: 'PrismaError', code: 'P9999', message: '??' } as any;
    errorMiddleware(error, mockRequest, mockResponse, mockNext);
    const json = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(json.code).toBe('P9999');
    expect(json.details).toBe('??');
  });

  it('should handle AppError correctly', () => {
    const appError = new AppError('Test error', 400);
    errorMiddleware(appError, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect((mockResponse.json as jest.Mock).mock.calls[0][0]).toMatchObject({
      status: 'error',
      message: 'Test error',
    });
  });

  it('should handle ZodError correctly', () => {
    const schema = z.object({ name: z.string() });
    try {
      schema.parse({ name: 123 });
    } catch (error) {
      const zodError = error as ZodError;
      errorMiddleware(zodError, mockRequest, mockResponse, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Validation failed',
        errors: [
          {
            field: 'name',
            message: 'Invalid input: expected string, received number',
            code: 'invalid_type',
          },
        ],
      });
    }
  });

  it('should handle generic error correctly', () => {
    const genericError = new Error('Generic error');
    errorMiddleware(genericError, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect((mockResponse.json as jest.Mock).mock.calls[0][0]).toMatchObject({
      status: 'error',
      message: 'Generic error',
    });
  });

  it('should handle Prisma P2002 error', () => {
    const prismaError = {
      name: 'PrismaError',
      code: 'P2002',
      meta: { target: ['email'] },
    } as any;
    errorMiddleware(prismaError, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Duplicate entry',
      field: ['email'],
    });
  });

  it('should handle Prisma P2025 error', () => {
    const prismaError = { name: 'PrismaError', code: 'P2025' } as any;
    errorMiddleware(prismaError, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Record not found',
    });
  });

  it('should handle Prisma P2003 error', () => {
    const prismaError = { name: 'PrismaError', code: 'P2003' } as any;
    errorMiddleware(prismaError, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Foreign key constraint failed',
    });
  });

  it('should handle PrismaClientValidationError', () => {
    const error = { name: 'PrismaClientValidationError' } as any;
    errorMiddleware(error, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Invalid data provided',
    });
  });

  it('should handle PrismaClientInitializationError', () => {
    const error = { name: 'PrismaClientInitializationError' } as any;
    errorMiddleware(error, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Database connection failed',
    });
  });

  it('should handle JsonWebTokenError', () => {
    const error = { name: 'JsonWebTokenError' } as any;
    errorMiddleware(error, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Invalid token',
    });
  });

  it('should handle TokenExpiredError', () => {
    const error = { name: 'TokenExpiredError' } as any;
    errorMiddleware(error, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Token expired',
    });
  });

  it('should handle error with body', () => {
    const error = { body: '{}' } as any;
    errorMiddleware(error, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Invalid JSON in request body',
    });
  });

  it('should call next for unhandled errors', () => {
    const error = new Error('Unhandled error');
    errorMiddleware(error, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect((mockResponse.json as jest.Mock).mock.calls[0][0]).toMatchObject({
      status: 'error',
      message: 'Unhandled error',
    });
  });

  describe('asyncHandler', () => {
    it('should call next with error if promise rejects', async () => {
      const error = new Error('Async error');
      const fn = jest.fn().mockRejectedValue(error);
      const handler = asyncHandler(fn);
      await handler(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('notFoundHandler', () => {
    it('should call next with AppError', () => {
      const req = { originalUrl: '/not-found' } as Request;
      notFoundHandler(req, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(new AppError('Route /not-found not found', 404));
    });
  });

  describe('branches avancées errorMiddleware', () => {
    const OLD_ENV = process.env;
    let mockRes: Response;
    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
    });
    afterAll(() => {
      process.env = OLD_ENV;
    });

    it('affiche stack et détails en mode développement', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('dev error');
      errorMiddleware(error, {} as Request, mockRes, jest.fn());
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect((mockRes.json as jest.Mock).mock.calls[0][0]).toMatchObject({
        status: 'error',
        message: 'dev error',
        stack: expect.any(String),
        name: 'Error',
      });
    });

    it('masque le message en production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('secret');
      errorMiddleware(error, {} as Request, mockRes, jest.fn());
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Something went wrong',
      });
    });

    it('gère CastError avec code 400', () => {
      const error = { name: 'CastError', message: 'bad cast' } as any;
      errorMiddleware(error, {} as Request, mockRes, jest.fn());
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect((mockRes.json as jest.Mock).mock.calls[0][0]).toMatchObject({
        status: 'error',
        message: 'bad cast',
        name: 'CastError',
      });
    });

    it('gère une erreur Prisma inconnue', () => {
      const error = { name: 'PrismaError', code: 'P9999', message: '??' } as any;
      errorMiddleware(error, {} as Request, mockRes, jest.fn());
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect((mockRes.json as jest.Mock).mock.calls[0][0]).toMatchObject({
        status: 'error',
        message: 'Database error',
      });
    });

    it('gère une erreur sans message', () => {
      const error = {} as any;
      errorMiddleware(error, {} as Request, mockRes, jest.fn());
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect((mockRes.json as jest.Mock).mock.calls[0][0]).toMatchObject({
        status: 'error',
        message: undefined,
      });
    });
  });
});
