// @ts-nocheck
import { describe, it, expect } from '@jest/globals';
import { validateCreateInstitutionFinanciere } from '../infrastructure/web/middleware/institutionFinanciere.validation';

describe('InstitutionFinanciere Validation Middleware', () => {
  const mockRequest = {
    body: {},
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  const mockNext = jest.fn();

  const validData = {
    nom: 'Banque Test',
    type: 'BANQUE',
    description: 'Une description valide avec plus de 10 caractères',
    siteWeb: 'https://test.com',
    regionsDesservies: ['Île-de-France'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCreateInstitutionFinanciere', () => {
    it('should pass validation with valid data', () => {
      mockRequest.body = validData;

      validateCreateInstitutionFinanciere(
        mockRequest as any,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should fail validation when nom is missing', () => {
      mockRequest.body = { ...validData, nom: '' };

      validateCreateInstitutionFinanciere(
        mockRequest as any,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation échouée',
        errors: expect.arrayContaining([expect.stringContaining('nom')]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail validation when nom is too short', () => {
      mockRequest.body = { ...validData, nom: 'A' };

      validateCreateInstitutionFinanciere(
        mockRequest as any,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail validation when type is missing', () => {
      mockRequest.body = { ...validData, type: '' };

      validateCreateInstitutionFinanciere(
        mockRequest as any,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail validation when description is missing', () => {
      mockRequest.body = { ...validData, description: '' };

      validateCreateInstitutionFinanciere(
        mockRequest as any,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail validation when description is too short', () => {
      mockRequest.body = { ...validData, description: 'court' };

      validateCreateInstitutionFinanciere(
        mockRequest as any,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail validation when siteWeb is invalid', () => {
      mockRequest.body = { ...validData, siteWeb: 'invalid-url' };

      validateCreateInstitutionFinanciere(
        mockRequest as any,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail validation when regionsDesservies is empty', () => {
      mockRequest.body = { ...validData, regionsDesservies: [] };

      validateCreateInstitutionFinanciere(
        mockRequest as any,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail validation when contactEmail is invalid', () => {
      mockRequest.body = { ...validData, contactEmail: 'invalid-email' };

      validateCreateInstitutionFinanciere(
        mockRequest as any,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should pass validation with optional valid contactEmail', () => {
      mockRequest.body = { ...validData, contactEmail: 'test@example.com' };

      validateCreateInstitutionFinanciere(
        mockRequest as any,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass validation with optional valid contactTelephone', () => {
      mockRequest.body = { ...validData, contactTelephone: '+33123456789' };

      validateCreateInstitutionFinanciere(
        mockRequest as any,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
