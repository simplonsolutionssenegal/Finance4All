// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { 
  AppError, 
  errorMiddleware, 
  asyncHandler, 
  notFoundHandler 
} from '../infrastructure/web/middleware/error.middleware';
import { ZodError, z } from 'zod';

// Mock logger
jest.mock('../utils/logger');

describe('Error Middleware', () => {
  // Mock objects
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      originalUrl: '/test',
      method: 'GET',
      body: { test: 'data' },
      params: { id: '123' },
      query: { search: 'test' },
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    mockNext = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('AppError', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError('Test error', 400);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.stack).toBeDefined();
    });

    it('should create AppError with default statusCode', () => {
      const error = new AppError('Test error');

      expect(error.statusCode).toBe(500);
    });

    it('should handle AppError correctly', () => {
      const appError = new AppError('Test error', 400);

      errorMiddleware(appError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Test error',
      });
    });

    it('should include stack in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const appError = new AppError('Test error', 400);
      errorMiddleware(appError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Test error',
          stack: expect.any(String),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('ZodError handling', () => {
    it('should handle ZodError correctly', () => {
      const schema = z.object({ name: z.string() });
      let zodError: ZodError;

      try {
        schema.parse({ name: 123 });
      } catch (error) {
        zodError = error as ZodError;

        errorMiddleware(zodError, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
              message: expect.any(String),
              code: 'invalid_type',
            }),
          ]),
        });
      }
    });

    it('should handle nested field paths in ZodError', () => {
      const schema = z.object({ 
        user: z.object({ 
          profile: z.object({ 
            name: z.string() 
          }) 
        }) 
      });
      
      try {
        schema.parse({ user: { profile: { name: 123 } } });
      } catch (error) {
        const zodError = error as ZodError;
        errorMiddleware(zodError, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'user.profile.name',
            }),
          ]),
        });
      }
    });
  });

  describe('Prisma Error handling', () => {
    it('should handle P2002 (duplicate entry) error', () => {
      const prismaError = {
        name: 'PrismaClientKnownRequestError',
        code: 'P2002',
        meta: { target: ['email'] },
        message: 'Unique constraint failed',
      } as any;

      errorMiddleware(prismaError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Duplicate entry',
        field: ['email'],
      });
    });

    it('should handle P2025 (record not found) error', () => {
      const prismaError = {
        name: 'PrismaClientKnownRequestError',
        code: 'P2025',
        message: 'Record not found',
      } as any;

      errorMiddleware(prismaError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Record not found',
      });
    });

    it('should handle P2003 (foreign key constraint) error', () => {
      const prismaError = {
        name: 'PrismaClientKnownRequestError',
        code: 'P2003',
        message: 'Foreign key constraint failed',
      } as any;

      errorMiddleware(prismaError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Foreign key constraint failed',
      });
    });

    it('should handle unknown Prisma error codes', () => {
      const prismaError = {
        name: 'PrismaClientKnownRequestError',
        code: 'P9999',
        message: 'Unknown prisma error',
      } as any;

      errorMiddleware(prismaError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Database error',
      });
    });

    it('should include debug info in development for Prisma errors', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const prismaError = {
        name: 'PrismaClientKnownRequestError',
        code: 'P9999',
        message: 'Unknown prisma error',
      } as any;

      errorMiddleware(prismaError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Database error',
        code: 'P9999',
        details: 'Unknown prisma error',
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Special Error handling', () => {
    it('should handle PrismaClientValidationError', () => {
      const error = {
        name: 'PrismaClientValidationError',
        constructor: { name: 'PrismaClientValidationError' },
        message: 'Invalid data provided',
      } as any;

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid data provided',
      });
    });

    it('should handle PrismaClientInitializationError', () => {
      const error = {
        name: 'PrismaClientInitializationError',
        constructor: { name: 'PrismaClientInitializationError' },
        message: 'Database connection failed',
      } as any;

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Database connection failed',
      });
    });

    it('should handle JsonWebTokenError', () => {
      const error = {
        name: 'JsonWebTokenError',
        constructor: { name: 'JsonWebTokenError' },
        message: 'Invalid token',
      } as any;

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid token',
      });
    });

    it('should handle TokenExpiredError', () => {
      const error = {
        name: 'TokenExpiredError',
        constructor: { name: 'TokenExpiredError' },
        message: 'Token expired',
      } as any;

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Token expired',
      });
    });

    it('should handle JSON body parsing errors', () => {
      const error = {
        name: 'SyntaxError',
        constructor: { name: 'SyntaxError' },
        body: 'invalid json',
        message: 'Unexpected token',
      } as any;

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid JSON in request body',
      });
    });

    it('should include debug details in development for validation errors', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = {
        name: 'PrismaClientValidationError',
        constructor: { name: 'PrismaClientValidationError' },
        message: 'Invalid data provided to database',
      } as any;

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid data provided',
        details: 'Invalid data provided to database',
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Generic Error handling', () => {
    it('should handle CastError with 400 status', () => {
      const castError = {
        name: 'CastError',
        message: 'Cast to ObjectId failed',
      } as any;

      errorMiddleware(castError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle generic error in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const genericError = new Error('Generic error');
      errorMiddleware(genericError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Something went wrong',
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle generic error in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const genericError = new Error('Generic error');
      errorMiddleware(genericError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Generic error',
        stack: expect.any(String),
        name: 'Error',
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('asyncHandler', () => {
    it('should handle successful async operations', async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should catch and forward async errors', async () => {
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('notFoundHandler', () => {
    it('should create 404 AppError for unknown routes', () => {
      notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Route /test not found',
          statusCode: 404,
        })
      );
    });
  });
});
