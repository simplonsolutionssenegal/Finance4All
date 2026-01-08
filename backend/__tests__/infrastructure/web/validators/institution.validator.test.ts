import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import {
  validateCreateInstitution,
  validateUpdateInstitution,
  validatePagination,
  validateInstitutionId,
  handleValidationErrors,
  validateAddService,
} from '../../../../src/infrastructure/web/validators/institution.validator';

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

  /* =====================================================
     handleValidationErrors
  ===================================================== */
  describe('handleValidationErrors', () => {
    it('should call next() if there are no validation errors', () => {
      handleValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 400 if validation errors exist', async () => {
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

    it('should not return response when no validation errors', () => {
      handleValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  /* =====================================================
     validateCreateInstitution
  ===================================================== */
  describe('validateCreateInstitution', () => {
    const validData = {
      name: 'Test Institution',
      description: 'A great institution',
      website: 'https://test.com',
      geographicZones: ['Zone 1'],
      logoUrl: 'https://test.com/logo.png',
      type: 'ETABLISSEMENT_MONNAIE_ELECTRONIQUE',
      pays: 'SENEGAL',
    };

    it('should pass with valid data', async () => {
      mockRequest.body = validData;
      const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail if name is invalid', async () => {
      mockRequest.body = { ...validData, name: '' };
      const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'name' })])
      );
    });

    it('should fail if type is missing', async () => {
      const { ...data } = validData;
      mockRequest.body = data;
      const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'type' })])
      );
    });

    it('should fail if pays is invalid', async () => {
      mockRequest.body = { ...validData, pays: 'FRANCE' };
      const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'pays' })])
      );
    });

    it('should pass without optional fields (website, logoUrl)', async () => {
      mockRequest.body = {
        name: 'Institution',
        description: 'Description',
        geographicZones: ['Zone'],
        type: 'BANQUE_NUMERIQUE',
        pays: 'SENEGAL',
      };

      const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
      expect(errors.isEmpty()).toBe(true);
    });
  });

  /* =====================================================
     validateUpdateInstitution
  ===================================================== */
  describe('validateUpdateInstitution', () => {
    const validData = {
      name: 'Updated Institution',
      description: 'Updated description',
      geographicZones: ['Zone 2'],
      website: 'https://updated.com',
      logoUrl: 'https://updated.com/logo.png',
    };

    it('should pass with valid required fields only', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = validData;
      const errors = await runValidation(mockRequest as Request, validateUpdateInstitution);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with optional type and pays', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = {
        ...validData,
        type: 'SERVICE_PAIEMENT_ELECTRONIQUE',
        pays: 'CAMEROUN',
      };
      const errors = await runValidation(mockRequest as Request, validateUpdateInstitution);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail with invalid UUID', async () => {
      mockRequest.params = { id: 'invalid-id' };
      mockRequest.body = validData;
      const errors = await runValidation(mockRequest as Request, validateUpdateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'id' })])
      );
    });

    it('should pass when type and pays are not provided', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = {
        name: 'Institution',
        description: 'Desc',
        geographicZones: ['Zone'],
      };

      const errors = await runValidation(mockRequest as Request, validateUpdateInstitution);
      expect(errors.isEmpty()).toBe(true);
    });
  });

  /* =====================================================
     validatePagination
  ===================================================== */
  describe('validatePagination', () => {
    it('should pass with valid pagination', async () => {
      mockRequest.query = { page: '1', limit: '20' };
      const errors = await runValidation(mockRequest as Request, validatePagination);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail if limit is out of range', async () => {
      mockRequest.query = { limit: '200' };
      const errors = await runValidation(mockRequest as Request, validatePagination);
      expect(errors.array()).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'limit' })])
      );
    });

    it('should pass when pagination is empty', async () => {
      mockRequest.query = {};
      const errors = await runValidation(mockRequest as Request, validatePagination);
      expect(errors.isEmpty()).toBe(true);
    });
  });

  /* =====================================================
     validateInstitutionId
  ===================================================== */
  describe('validateInstitutionId', () => {
    it('should pass with valid UUID', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      const errors = await runValidation(mockRequest as Request, validateInstitutionId);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail with invalid UUID', async () => {
      mockRequest.params = { id: 'not-a-uuid' };
      const errors = await runValidation(mockRequest as Request, validateInstitutionId);
      expect(errors.array()).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'id' })])
      );
    });
  });

  /* =====================================================
     validateAddService
  ===================================================== */
  describe('validateAddService', () => {
    const validService = {
      name: 'Test Service',
      longName: 'Test Service Long Name',
      type: 'Loan',
      frais: {
        montantFixe: 100,
        pourcentage: 2.5,
      },
      conditionAccess: ['Condition'],
      plafonds: ['Plafond'],
      infrastructureAccess: ['Infra'],
    };

    it('should pass with valid service', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = validService;
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail if frais is invalid', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validService, frais: 'invalid' };
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'frais' })])
      );
    });

    it('should fail if minimum > maximum', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = {
        ...validService,
        frais: {
          minimum: 1000,
          maximum: 500,
        },
      };
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'frais.minimum' })])
      );
    });
  });
});
