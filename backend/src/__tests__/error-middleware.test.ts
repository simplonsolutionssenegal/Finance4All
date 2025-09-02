// @ts-nocheck
import { describe, it, expect, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { AppError, errorMiddleware } from '../infrastructure/web/middleware/error.middleware';
import { ZodError, z } from 'zod';

describe('Error Middleware', () => {
  // Mock objects
  const mockRequest = {} as Request;
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;
  const mockNext = jest.fn() as NextFunction;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle AppError correctly', () => {
    const appError = new AppError('Test error', 400);
    
    errorMiddleware(appError, mockRequest, mockResponse, mockNext);
    
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should handle ZodError correctly', () => {
    // Create a Zod schema and validation error
    const schema = z.object({ name: z.string() });
    let zodError: ZodError;
    
    try {
      schema.parse({ name: 123 });
    } catch (error) {
      zodError = error as ZodError;
      
      errorMiddleware(zodError, mockRequest, mockResponse, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    }
  });

  it('should handle generic error correctly', () => {
    const genericError = new Error('Generic error');
    
    errorMiddleware(genericError, mockRequest, mockResponse, mockNext);
    
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should create AppError with correct properties', () => {
    const error = new AppError('Test error', 400);
    
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
    expect(error.stack).toBeDefined();
  });
});
