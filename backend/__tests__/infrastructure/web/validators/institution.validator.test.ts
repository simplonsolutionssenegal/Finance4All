import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import {
  validateCreateInstitution,
  validateUpdateInstitution,
  validatePagination,
  validateInstitutionId,
  handleValidationErrors,
  validateAddService,
} from '@/infrastructure/web/validators/institution.validator';

// Helper to run validation middleware
const runValidation = async (req: Request, validations: any[]) => {
  await Promise.all(validations.map(validation => validation.run(req)));
  return validationResult(req);
};

describe('Institution Validator', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('handleValidationErrors', () => {
    it('should call next() if there are no validation errors', async () => {
      mockRequest.body = { name: 'test' }; // no validation rules applied yet
      handleValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 400 with errors if validation fails', async () => {
      mockRequest.params = { id: 'invalid-id' };
      await runValidation(mockRequest as Request, validateInstitutionId);

      handleValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        errors: expect.any(Array),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateCreateInstitution', () => {
    const validData = {
      name: 'Test Institution',
      description: 'A great institution',
      website: 'https://test.com',
      geographicZones: ['Zone 1'],
      logoUrl: 'https://test.com/logo.png',
    };

    it('should pass with valid data', async () => {
      mockRequest.body = validData;
      const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail if name is missing', async () => {
      mockRequest.body = { ...validData, name: '' };
      const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'name',
            msg: 'Name must be between 2 and 255 characters',
          }),
        ])
      );
    });
  });

  describe('validateUpdateInstitution', () => {
    const validData = {
      name: 'Updated Institution',
      description: 'Updated description',
      website: 'https://updated.com',
      geographicZones: ['Zone 2'],
      logoUrl: 'https://updated.com/logo.png',
    };

    it('should pass with valid data', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = validData;
      const errors = await runValidation(mockRequest as Request, validateUpdateInstitution);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail if id is not a UUID', async () => {
      mockRequest.params = { id: 'invalid-id' };
      mockRequest.body = validData;
      const errors = await runValidation(mockRequest as Request, validateUpdateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'id', msg: 'Invalid institution ID format' }),
        ])
      );
    });
  });

  describe('validatePagination', () => {
    it('should pass with valid pagination data', async () => {
      mockRequest.query = { page: '2', limit: '20' };
      const errors = await runValidation(mockRequest as Request, validatePagination);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail if page is not an integer', async () => {
      mockRequest.query = { page: 'a' };
      const errors = await runValidation(mockRequest as Request, validatePagination);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'page', msg: 'Page must be a positive integer' }),
        ])
      );
    });

    it('should fail if limit is out of range', async () => {
      mockRequest.query = { limit: '200' };
      const errors = await runValidation(mockRequest as Request, validatePagination);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'limit', msg: 'Limit must be between 1 and 100' }),
        ])
      );
    });
  });

  describe('validateInstitutionId', () => {
    it('should pass with a valid UUID', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      const errors = await runValidation(mockRequest as Request, validateInstitutionId);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail with an invalid UUID', async () => {
      mockRequest.params = { id: 'not-a-uuid' };
      const errors = await runValidation(mockRequest as Request, validateInstitutionId);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'id', msg: 'Invalid institution ID format' }),
        ])
      );
    });
  });

  describe('validateAddService', () => {
    const validService = {
      name: 'Test Service',
      longName: 'Test Service Long Name',
      type: 'Loan',
      frais: {
        montantFixe: 100,
        pourcentage: 1.5,
        minimum: 10,
        maximum: 1000,
      },
      conditionAccess: ['Condition 1'],
      plafonds: ['Plafond 1'],
      infrastructureAccess: ['Infra 1'],
    };

    it('should pass with valid service data', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = validService;
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail if service name is too short', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validService, name: 'a' };
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'name',
            msg: 'Service name must be between 2 and 255 characters',
          }),
        ])
      );
    });

    it('should fail if frais is not an object', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validService, frais: 'not-an-object' };
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'frais', msg: 'Frais must be an object' }),
        ])
      );
    });

    it('should fail if frais.pourcentage is out of range', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validService, frais: { ...validService.frais, pourcentage: 101 } };
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'frais.pourcentage',
            msg: 'Pourcentage must be between 0 and 100',
          }),
        ])
      );
    });
  });
});
