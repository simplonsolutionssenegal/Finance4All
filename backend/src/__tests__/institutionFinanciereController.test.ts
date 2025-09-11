// @ts-nocheck
import { describe, it, expect } from '@jest/globals';
import { InstitutionFinanciereController } from '../infrastructure/web/controllers/InstitutionFinanciereController';
import { InstitutionFinanciere } from '../domain/entities/InstitutionFinanciere';

describe('InstitutionFinanciereController', () => {
  // Mock use cases
  const mockCreateUseCase = {
    execute: jest.fn(),
  };

  const mockGetAllUseCase = {
    execute: jest.fn(),
  };

  const mockGetByIdUseCase = {
    execute: jest.fn(),
  };

  const mockDeleteUseCase = {
    execute: jest.fn(),
  };

  // Mock Express Request and Response
  const mockRequest = {
    body: {},
    params: {},
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  const controller = new InstitutionFinanciereController(
    mockCreateUseCase,
    mockGetAllUseCase,
    mockGetByIdUseCase,
    mockDeleteUseCase
  );

  const validInstitution: InstitutionFinanciere = {
    nom: 'Banque Test',
    type: 'BANQUE',
    description: 'Une description valide',
    siteWeb: 'https://test.com',
    regionsDesservies: ['Île-de-France'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create institution successfully', async () => {
      mockRequest.body = validInstitution;
      const createdInstitution = { ...validInstitution, id: '123' };
      mockCreateUseCase.execute.mockResolvedValue(createdInstitution);

      await controller.create(mockRequest as any, mockResponse as any);

      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(validInstitution);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: createdInstitution,
        message: 'Institution financière créée avec succès',
      });
    });

    it('should handle validation errors', async () => {
      mockRequest.body = { nom: '' };
      const error = new Error('Le nom est requis');
      mockCreateUseCase.execute.mockRejectedValue(error);

      await controller.create(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Le nom est requis',
      });
    });

    it('should handle generic errors', async () => {
      mockRequest.body = validInstitution;
      mockCreateUseCase.execute.mockRejectedValue('Unexpected error');

      await controller.create(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur interne du serveur',
      });
    });
  });

  describe('getAll', () => {
    it('should return all institutions', async () => {
      const institutions = [validInstitution];
      mockGetAllUseCase.execute.mockResolvedValue(institutions);

      await controller.getAll(mockRequest as any, mockResponse as any);

      expect(mockGetAllUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: institutions,
        message: 'Institutions financières récupérées avec succès',
        count: 1,
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockGetAllUseCase.execute.mockRejectedValue(error);

      await controller.getAll(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur lors de la récupération des institutions financières',
        error: 'Database error',
      });
    });
  });

  describe('getById', () => {
    it('should return institution by id', async () => {
      mockRequest.params = { id: '123' };
      mockGetByIdUseCase.execute.mockResolvedValue(validInstitution);

      await controller.getById(mockRequest as any, mockResponse as any);

      expect(mockGetByIdUseCase.execute).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: validInstitution,
        message: 'Institution financière récupérée avec succès',
      });
    });

    it('should handle not found', async () => {
      mockRequest.params = { id: '999' };
      const error = new Error('Institution financière non trouvée');
      mockGetByIdUseCase.execute.mockRejectedValue(error);

      await controller.getById(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Institution financière non trouvée',
      });
    });
  });

  describe('delete', () => {
    it('should delete institution successfully', async () => {
      mockRequest.params = { id: '123' };
      mockDeleteUseCase.execute.mockResolvedValue(true);

      await controller.delete(mockRequest as any, mockResponse as any);

      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Institution financière supprimée avec succès',
      });
    });

    it('should handle delete errors', async () => {
      mockRequest.params = { id: '123' };
      const error = new Error('Database error');
      mockDeleteUseCase.execute.mockRejectedValue(error);

      await controller.delete(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur lors de la suppression de l'institution financière",
        error: 'Database error',
      });
    });
  });
});
