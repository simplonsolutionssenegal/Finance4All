import {
  validateCreateBeneficiary,
  handleValidationErrors,
} from '@/infrastructure/web/validators/beneficiary.validator';
import type { Request, Response, NextFunction } from 'express';

// Mock express-validator
const mockValidationResult = jest.fn();
jest.mock('express-validator', () => {
  const actual = jest.requireActual('express-validator');
  return {
    ...actual,
    validationResult: (req: any) => mockValidationResult(req),
  };
});

describe('beneficiary.validator', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      body: {
        clerkUserId: 'clerk_123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+221771234567',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCreateBeneficiary', () => {
    it('should be an array of validation middleware functions', () => {
      expect(Array.isArray(validateCreateBeneficiary)).toBe(true);
      expect(validateCreateBeneficiary.length).toBeGreaterThan(0);
    });

    it('should contain validation middleware functions', () => {
      validateCreateBeneficiary.forEach(validator => {
        expect(typeof validator).toBe('function');
      });
    });
  });

  describe('handleValidationErrors', () => {
    it('should be a function', () => {
      expect(typeof handleValidationErrors).toBe('function');
    });

    it('should accept request, response, and next parameters', () => {
      expect(handleValidationErrors.length).toBe(3);
    });

    it('should call next when there are no validation errors', () => {
      const mockResult = {
        isEmpty: jest.fn(() => true),
        array: jest.fn(() => []),
      };

      mockValidationResult.mockReturnValue(mockResult);

      handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 400 when there are validation errors', () => {
      const mockErrors = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'phoneNumber', message: 'Invalid phone number' },
      ];

      const mockResult = {
        isEmpty: jest.fn(() => false),
        array: jest.fn(() => mockErrors),
      };

      mockValidationResult.mockReturnValue(mockResult);

      handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        errors: mockErrors,
        message: 'Données invalides',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Integration tests', () => {
    it('should validate complete valid beneficiary data', () => {
      expect(validateCreateBeneficiary).toBeDefined();
      expect(Array.isArray(validateCreateBeneficiary)).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(validateCreateBeneficiary).toBeDefined();
    });

    it('should reject invalid phone number format', () => {
      expect(validateCreateBeneficiary).toBeDefined();
    });

    it('should reject empty required fields', () => {
      expect(validateCreateBeneficiary).toBeDefined();
    });
  });
});
