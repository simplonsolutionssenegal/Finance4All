import {
  validateCreateInstitution,
  validatePagination,
  validateInstitutionId,
  handleValidationErrors,
} from '@/infrastructure/web/validators/institution.validator';
import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

jest.mock('express-validator', () => {
  const mockChain = {
    isString: jest.fn().mockReturnThis(),
    trim: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    notEmpty: jest.fn().mockReturnThis(),
    isArray: jest.fn().mockReturnThis(),
    isURL: jest.fn().mockReturnThis(),
    isUUID: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    toInt: jest.fn().mockReturnThis(),
  };

  return {
    validationResult: jest.fn(),
    body: jest.fn(() => mockChain),
    check: jest.fn(() => mockChain),
    param: jest.fn(() => mockChain),
    query: jest.fn(() => mockChain),
  };
});

describe('Institution Validator', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockValidationResult: jest.MockedFunction<typeof validationResult>;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
    mockValidationResult = validationResult as jest.MockedFunction<typeof validationResult>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCreateInstitution', () => {
    it('should have validators for all required fields', () => {
      expect(validateCreateInstitution).toBeDefined();
      expect(Array.isArray(validateCreateInstitution)).toBe(true);
      expect(validateCreateInstitution.length).toBe(5);
    });
  });

  describe('validatePagination', () => {
    it('should have validators for pagination fields', () => {
      expect(validatePagination).toBeDefined();
      expect(Array.isArray(validatePagination)).toBe(true);
      expect(validatePagination.length).toBe(2);
    });
  });

  describe('validateInstitutionId', () => {
    it('should have validator for institution id', () => {
      expect(validateInstitutionId).toBeDefined();
      expect(Array.isArray(validateInstitutionId)).toBe(true);
      expect(validateInstitutionId.length).toBe(1);
    });
  });

  describe('handleValidationErrors', () => {
    it('should call next when there are no validation errors', () => {
      const mockResult = {
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn().mockReturnValue([]),
      };

      mockValidationResult.mockReturnValue(mockResult as any);

      handleValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResult.isEmpty).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 400 status with errors when validation fails', () => {
      const errors = [
        {
          msg: 'Name must be between 2 and 255 characters',
          param: 'name',
          location: 'body',
        },
        {
          msg: 'Description is required',
          param: 'description',
          location: 'body',
        },
      ];

      const mockResult = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(errors),
      };

      mockValidationResult.mockReturnValue(mockResult as any);

      handleValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResult.isEmpty).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        errors,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle multiple validation errors', () => {
      const errors = [
        {
          msg: 'Name must be between 2 and 255 characters',
          param: 'name',
          location: 'body',
        },
        {
          msg: 'Description is required',
          param: 'description',
          location: 'body',
        },
        {
          msg: 'Invalid website URL',
          param: 'website',
          location: 'body',
        },
        {
          msg: 'Geographic zones must be an array',
          param: 'geographicZones',
          location: 'body',
        },
      ];

      const mockResult = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(errors),
      };

      mockValidationResult.mockReturnValue(mockResult as any);

      handleValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        errors,
      });
    });

    it('should handle single validation error', () => {
      const errors = [
        {
          msg: 'Invalid logo URL',
          param: 'logoUrl',
          location: 'body',
        },
      ];

      const mockResult = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(errors),
      };

      mockValidationResult.mockReturnValue(mockResult as any);

      handleValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        errors,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return early when validation errors exist', () => {
      const errors = [{ msg: 'Error', param: 'name', location: 'body' }];

      const mockResult = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(errors),
      };

      mockValidationResult.mockReturnValue(mockResult as any);

      const result = handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // The function returns the response object when there are errors
      expect(result).toBe(mockResponse);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});
