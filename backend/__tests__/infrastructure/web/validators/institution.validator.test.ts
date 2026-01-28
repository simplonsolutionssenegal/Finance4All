import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import {
  validateCreateInstitution,
  validateUpdateInstitution,
  validatePagination,
  validateInstitutionId,
  handleValidationErrors,
  validateAddService,
  validatePatchService,
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
      type: 'ETABLISSEMENT_MONNAIE_ELECTRONIQUE',
      pays: 'SENEGAL',
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

    it('should fail if name is too short', async () => {
      mockRequest.body = { ...validData, name: 'A' };
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

    it('should fail if name is too long', async () => {
      mockRequest.body = { ...validData, name: 'A'.repeat(256) };
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

    it('should fail if description is missing', async () => {
      mockRequest.body = { ...validData, description: '' };
      const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'description',
            msg: 'Description is required',
          }),
        ])
      );
    });

    it('should fail if website is invalid URL', async () => {
      mockRequest.body = { ...validData, website: 'not-a-valid-url' };
      const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'website',
            msg: 'Invalid website URL',
          }),
        ])
      );
    });

    it('should pass without website (optional)', async () => {
      const { website: _website, ...dataWithoutWebsite } = validData;
      mockRequest.body = dataWithoutWebsite;
      const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail if geographicZones is not an array', async () => {
      mockRequest.body = { ...validData, geographicZones: 'not-an-array' };
      const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'geographicZones',
            msg: 'Geographic zones must be an array',
          }),
        ])
      );
    });

    it('should fail if logoUrl is invalid URL', async () => {
      mockRequest.body = { ...validData, logoUrl: 'not-a-valid-url' };
      const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'logoUrl',
            msg: 'Invalid logo URL',
          }),
        ])
      );
    });

    it('should pass without logoUrl (optional)', async () => {
      const { logoUrl: _logoUrl, ...dataWithoutLogo } = validData;
      mockRequest.body = dataWithoutLogo;
      const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail if type is missing', async () => {
      const { type: _type, ...dataWithoutType } = validData;
      mockRequest.body = dataWithoutType;
      const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'type',
            msg: 'Invalid institution type',
          }),
        ])
      );
    });

    it('should fail if type is invalid', async () => {
      mockRequest.body = { ...validData, type: 'INVALID_TYPE' };
      const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'type',
            msg: 'Invalid institution type',
          }),
        ])
      );
    });

    it('should pass with all valid institution types', async () => {
      const validTypes = [
        'ETABLISSEMENT_MONNAIE_ELECTRONIQUE',
        'PORTEFEUILLE_NUMERIQUE',
        'SERVICE_PAIEMENT_ELECTRONIQUE',
        'BANQUE_NUMERIQUE',
        'SERVICE_FINANCIER_DECENTRALISE',
        'SERVICE_FINANCEMENT_PARTICIPATIF',
        'SERVICE_INVESTISSEMENT',
        'SERVICE_GESTION_FINANCIERE',
        'SERVICE_ASSURANCE_NUMERIQUE',
      ];

      for (const type of validTypes) {
        mockRequest.body = { ...validData, type };
        const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
        expect(errors.isEmpty()).toBe(true);
      }
    });

    it('should fail if pays is missing', async () => {
      const { pays: _pays, ...dataWithoutPays } = validData;
      mockRequest.body = dataWithoutPays;
      const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'pays',
            msg: 'Country must be either SENEGAL or CAMEROUN',
          }),
        ])
      );
    });

    it('should fail if pays is invalid', async () => {
      mockRequest.body = { ...validData, pays: 'FRANCE' };
      const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'pays',
            msg: 'Country must be either SENEGAL or CAMEROUN',
          }),
        ])
      );
    });

    it('should pass with CAMEROUN as pays', async () => {
      mockRequest.body = { ...validData, pays: 'CAMEROUN' };
      const errors = await runValidation(mockRequest as Request, validateCreateInstitution);
      expect(errors.isEmpty()).toBe(true);
    });
  });

  describe('validateUpdateInstitution', () => {
    const validData = {
      name: 'Updated Institution',
      description: 'Updated description',
      website: 'https://updated.com',
      geographicZones: ['Zone 2'],
      logoUrl: 'https://updated.com/logo.png',
      type: 'ETABLISSEMENT_MONNAIE_ELECTRONIQUE',
      pays: 'SENEGAL',
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

    it('should fail if name is too short', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validData, name: 'A' };
      const errors = await runValidation(mockRequest as Request, validateUpdateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'name',
            msg: 'Name must be between 2 and 255 characters',
          }),
        ])
      );
    });

    it('should fail if description is empty', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validData, description: '' };
      const errors = await runValidation(mockRequest as Request, validateUpdateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'description',
            msg: 'Description is required',
          }),
        ])
      );
    });

    it('should fail if website is invalid URL', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validData, website: 'invalid-url' };
      const errors = await runValidation(mockRequest as Request, validateUpdateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'website',
            msg: 'Invalid website URL',
          }),
        ])
      );
    });

    it('should fail if geographicZones is not an array', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validData, geographicZones: 'not-an-array' };
      const errors = await runValidation(mockRequest as Request, validateUpdateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'geographicZones',
            msg: 'Geographic zones must be an array',
          }),
        ])
      );
    });

    it('should pass with optional type when valid', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = {
        ...validData,
        type: 'SERVICE_PAIEMENT_ELECTRONIQUE',
      };
      const errors = await runValidation(mockRequest as Request, validateUpdateInstitution);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail with invalid type', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validData, type: 'INVALID_TYPE' };
      const errors = await runValidation(mockRequest as Request, validateUpdateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'type',
            msg: 'Invalid institution type',
          }),
        ])
      );
    });

    it('should pass with optional pays when valid', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = {
        ...validData,
        pays: 'CAMEROUN',
      };
      const errors = await runValidation(mockRequest as Request, validateUpdateInstitution);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail with invalid pays', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validData, pays: 'FRANCE' };
      const errors = await runValidation(mockRequest as Request, validateUpdateInstitution);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'pays',
            msg: 'Country must be either SENEGAL or CAMEROUN',
          }),
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

    it('should pass with default values (no query params)', async () => {
      mockRequest.query = {};
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

    it('should fail if page is zero', async () => {
      mockRequest.query = { page: '0' };
      const errors = await runValidation(mockRequest as Request, validatePagination);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'page', msg: 'Page must be a positive integer' }),
        ])
      );
    });

    it('should fail if page is negative', async () => {
      mockRequest.query = { page: '-1' };
      const errors = await runValidation(mockRequest as Request, validatePagination);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'page', msg: 'Page must be a positive integer' }),
        ])
      );
    });

    it('should fail if limit is out of range (too high)', async () => {
      mockRequest.query = { limit: '200' };
      const errors = await runValidation(mockRequest as Request, validatePagination);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'limit', msg: 'Limit must be between 1 and 100' }),
        ])
      );
    });

    it('should fail if limit is zero', async () => {
      mockRequest.query = { limit: '0' };
      const errors = await runValidation(mockRequest as Request, validatePagination);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'limit', msg: 'Limit must be between 1 and 100' }),
        ])
      );
    });

    it('should pass with limit at boundary (1)', async () => {
      mockRequest.query = { limit: '1' };
      const errors = await runValidation(mockRequest as Request, validatePagination);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with limit at boundary (100)', async () => {
      mockRequest.query = { limit: '100' };
      const errors = await runValidation(mockRequest as Request, validatePagination);
      expect(errors.isEmpty()).toBe(true);
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

    it('should fail with empty string', async () => {
      mockRequest.params = { id: '' };
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

    it('should fail if institution id is invalid', async () => {
      mockRequest.params = { id: 'invalid-id' };
      mockRequest.body = validService;
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'id', msg: 'Invalid institution ID format' }),
        ])
      );
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

    it('should fail if service name is too long', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validService, name: 'A'.repeat(256) };
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

    it('should fail if longName is too short', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validService, longName: 'a' };
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'longName',
            msg: 'Long name must be between 2 and 255 characters',
          }),
        ])
      );
    });

    it('should fail if type is empty', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validService, type: '' };
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'type',
            msg: 'Service type is required',
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

    it('should fail if frais is an array', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validService, frais: [] };
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'frais', msg: 'Frais must be an object' }),
        ])
      );
    });

    it('should fail if frais is null', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validService, frais: null };
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

    it('should fail if frais.pourcentage is negative', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validService, frais: { ...validService.frais, pourcentage: -1 } };
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

    it('should pass with only montantFixe', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = {
        ...validService,
        frais: {
          montantFixe: 100,
        },
      };
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with only pourcentage', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = {
        ...validService,
        frais: {
          pourcentage: 2.5,
        },
      };
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with minimum and maximum', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = {
        ...validService,
        frais: {
          pourcentage: 2.5,
          minimum: 50,
          maximum: 500,
        },
      };
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail if montantFixe is not a number', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = {
        ...validService,
        frais: {
          montantFixe: 'not-a-number',
        },
      };
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'frais.montantFixe',
            msg: 'Montant fixe must be a number',
          }),
        ])
      );
    });

    it('should fail if minimum is not a number', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = {
        ...validService,
        frais: {
          minimum: 'not-a-number',
        },
      };
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'frais.minimum',
            msg: 'Minimum must be a number',
          }),
        ])
      );
    });

    it('should fail if maximum is not a number', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = {
        ...validService,
        frais: {
          maximum: 'not-a-number',
        },
      };
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'frais.maximum',
            msg: 'Maximum must be a number',
          }),
        ])
      );
    });

    it('should fail if minimum is greater than maximum', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = {
        ...validService,
        frais: {
          pourcentage: 2.5,
          minimum: 1000,
          maximum: 500,
        },
      };
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'frais.minimum',
            msg: 'Minimum cannot be greater than maximum',
          }),
        ])
      );
    });

    it('should fail if conditionAccess is not an array', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validService, conditionAccess: 'not-an-array' };
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'conditionAccess',
            msg: 'Condition access must be an array',
          }),
        ])
      );
    });

    it('should fail if plafonds is not an array', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validService, plafonds: 'not-an-array' };
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'plafonds',
            msg: 'Plafonds must be an array',
          }),
        ])
      );
    });

    it('should fail if infrastructureAccess is not an array', async () => {
      mockRequest.params = { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' };
      mockRequest.body = { ...validService, infrastructureAccess: 'not-an-array' };
      const errors = await runValidation(mockRequest as Request, validateAddService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'infrastructureAccess',
            msg: 'Infrastructure access must be an array',
          }),
        ])
      );
    });
  });

  describe('validatePatchService', () => {
    const validParams = {
      institutionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      serviceId: 'a47ac10b-58cc-4372-a567-0e02b2c3d480',
    };

    it('should pass with valid params and no body (empty PATCH)', async () => {
      mockRequest.params = validParams;
      mockRequest.body = {};
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with valid name update', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { name: 'Updated Service Name' };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with valid longName update', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { longName: 'Updated Long Name' };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with valid type update', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { type: 'NewType' };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with valid montantMin update', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { montantMin: 100 };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with valid montantMax update', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { montantMax: 5000 };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with valid montantMin and montantMax', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { montantMin: 100, montantMax: 5000 };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with equal montantMin and montantMax', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { montantMin: 1000, montantMax: 1000 };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with valid arrays update', async () => {
      mockRequest.params = validParams;
      mockRequest.body = {
        conditionAccess: ['Condition 1', 'Condition 2'],
        plafonds: ['Plafond 1'],
        infrastructureAccess: ['Web', 'Mobile'],
      };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with valid frais update', async () => {
      mockRequest.params = validParams;
      mockRequest.body = {
        frais: {
          montantFixe: 200,
          pourcentage: 2.5,
          minimum: 50,
          maximum: 1000,
        },
      };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with all valid fields', async () => {
      mockRequest.params = validParams;
      mockRequest.body = {
        name: 'Complete Update',
        longName: 'Complete Update Long Name',
        type: 'CompleteType',
        montantMin: 200,
        montantMax: 10000,
        conditionAccess: ['New Condition'],
        plafonds: ['New Plafond'],
        infrastructureAccess: ['New Infra'],
        frais: {
          montantFixe: 150,
          pourcentage: 1.5,
        },
      };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.isEmpty()).toBe(true);
    });

    // Validation d'erreurs pour les params
    it('should fail if institutionId is not a UUID', async () => {
      mockRequest.params = { ...validParams, institutionId: 'invalid-id' };
      mockRequest.body = {};
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'institutionId',
            msg: 'Invalid institutionId format',
          }),
        ])
      );
    });

    it('should fail if serviceId is not a UUID', async () => {
      mockRequest.params = { ...validParams, serviceId: 'invalid-id' };
      mockRequest.body = {};
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'serviceId',
            msg: 'Invalid serviceId format',
          }),
        ])
      );
    });

    // Validation d'erreurs pour name
    it('should fail if name is too short', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { name: 'A' };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'name',
            msg: 'Service name must be between 2 and 255 characters',
          }),
        ])
      );
    });

    it('should fail if name is too long', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { name: 'A'.repeat(256) };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'name',
            msg: 'Service name must be between 2 and 255 characters',
          }),
        ])
      );
    });

    // Validation d'erreurs pour longName
    it('should fail if longName is too short', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { longName: 'A' };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'longName',
            msg: 'Long name must be between 2 and 255 characters',
          }),
        ])
      );
    });

    it('should fail if longName is too long', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { longName: 'A'.repeat(256) };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'longName',
            msg: 'Long name must be between 2 and 255 characters',
          }),
        ])
      );
    });

    // Validation d'erreurs pour type
    it('should fail if type is empty string', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { type: '' };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'type',
            msg: 'Service type must be a non-empty string',
          }),
        ])
      );
    });

    // Validation d'erreurs pour montantMin/Max
    it('should fail if montantMin is not numeric', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { montantMin: 'not-a-number' };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'montantMin',
            msg: 'montantMin must be a number',
          }),
        ])
      );
    });

    it('should fail if montantMax is not numeric', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { montantMax: 'not-a-number' };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'montantMax',
            msg: 'montantMax must be a number',
          }),
        ])
      );
    });

    it('should fail if montantMin is greater than montantMax', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { montantMin: 5000, montantMax: 100 };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'montantMin',
            msg: 'montantMin cannot be greater than montantMax',
          }),
        ])
      );
    });

    // Validation d'erreurs pour les arrays
    it('should fail if conditionAccess is not an array', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { conditionAccess: 'not-an-array' };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'conditionAccess',
            msg: 'conditionAccess must be an array',
          }),
        ])
      );
    });

    it('should fail if plafonds is not an array', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { plafonds: 'not-an-array' };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'plafonds',
            msg: 'plafonds must be an array',
          }),
        ])
      );
    });

    it('should fail if infrastructureAccess is not an array', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { infrastructureAccess: 'not-an-array' };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'infrastructureAccess',
            msg: 'infrastructureAccess must be an array',
          }),
        ])
      );
    });

    // Validation d'erreurs pour frais
    it('should fail if frais is not an object', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { frais: 'not-an-object' };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'frais',
            msg: 'frais must be an object',
          }),
        ])
      );
    });

    it('should fail if frais is an array', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { frais: [] };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'frais',
            msg: 'frais must be an object',
          }),
        ])
      );
    });

    it('should fail if frais is null', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { frais: null };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'frais',
            msg: 'frais must be an object',
          }),
        ])
      );
    });

    it('should fail if frais.montantFixe is not numeric', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { frais: { montantFixe: 'not-a-number' } };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'frais.montantFixe',
            msg: 'frais.montantFixe must be a number',
          }),
        ])
      );
    });

    it('should fail if frais.pourcentage is not in range', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { frais: { pourcentage: 101 } };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'frais.pourcentage',
            msg: 'frais.pourcentage must be between 0 and 100',
          }),
        ])
      );
    });

    it('should fail if frais.pourcentage is negative', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { frais: { pourcentage: -1 } };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'frais.pourcentage',
            msg: 'frais.pourcentage must be between 0 and 100',
          }),
        ])
      );
    });

    it('should pass with frais.pourcentage at boundary (0)', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { frais: { pourcentage: 0 } };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with frais.pourcentage at boundary (100)', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { frais: { pourcentage: 100 } };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail if frais.minimum is not numeric', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { frais: { minimum: 'not-a-number' } };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'frais.minimum',
            msg: 'frais.minimum must be a number',
          }),
        ])
      );
    });

    it('should fail if frais.maximum is not numeric', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { frais: { maximum: 'not-a-number' } };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'frais.maximum',
            msg: 'frais.maximum must be a number',
          }),
        ])
      );
    });

    it('should fail if frais.minimum is greater than frais.maximum', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { frais: { minimum: 1000, maximum: 500 } };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'frais.minimum',
            msg: 'frais.minimum cannot be greater than frais.maximum',
          }),
        ])
      );
    });

    it('should pass with equal frais.minimum and frais.maximum', async () => {
      mockRequest.params = validParams;
      mockRequest.body = { frais: { minimum: 500, maximum: 500 } };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.isEmpty()).toBe(true);
    });

    // Tests combinés d'erreurs multiples
    it('should report multiple errors when multiple fields are invalid', async () => {
      mockRequest.params = { institutionId: 'invalid', serviceId: 'invalid' };
      mockRequest.body = {
        name: 'A',
        longName: 'B',
        type: '',
        montantMin: 'not-number',
        montantMax: 'not-number',
        conditionAccess: 'not-array',
        plafonds: 'not-array',
        infrastructureAccess: 'not-array',
        frais: null,
      };
      const errors = await runValidation(mockRequest as Request, validatePatchService);
      expect(errors.array().length).toBeGreaterThan(5);
    });
  });
});
