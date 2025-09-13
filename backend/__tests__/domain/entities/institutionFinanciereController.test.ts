// @ts-nocheck
import { describe, it, expect } from '@jest/globals';
import { InstitutionFinanciereController } from '@/infrastructure/web/controllers/InstitutionFinanciereController';
import { InstitutionNotFoundError } from '@/domain/errors/InstitutionNotFoundError';
import { InstitutionFinanciere } from '@/domain/entities/InstitutionFinanciere';

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
  const mockRequest: any = {
    body: {},
    params: {},
    query: {},
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  const mockPaginatedUseCase = { execute: jest.fn() };
  const controller = new InstitutionFinanciereController(
    mockCreateUseCase,
    mockGetAllUseCase,
    mockPaginatedUseCase,
    mockGetByIdUseCase,
    mockDeleteUseCase,
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
    mockRequest.body = {};
    mockRequest.params = {};
    mockRequest.query = {};
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

    it('should return paginated result when query params provided', async () => {
      mockRequest.query = { page: '2', limit: '5' };
      const paginatedResult = {
        data: [validInstitution],
        meta: { page: 2, limit: 5, totalItems: 12, totalPages: 3, hasNextPage: true, hasPrevPage: true },
      };
      mockPaginatedUseCase.execute.mockResolvedValue(paginatedResult);
      await controller.getAll(mockRequest as any, mockResponse as any);
      expect(mockPaginatedUseCase.execute).toHaveBeenCalledWith({ page: 2, limit: 5 });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: paginatedResult.data,
        meta: paginatedResult.meta,
        message: 'Institutions financières récupérées avec succès (pagination)'
      }));
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
  const error = new InstitutionNotFoundError('999');
      mockGetByIdUseCase.execute.mockRejectedValue(error);

      await controller.getById(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Institution financière non trouvée',
      });
    });
    it('should handle use case not initialized error in getById', async () => {
      // Créer un contrôleur sans le use case getById
      const controllerWithoutGetById = new InstitutionFinanciereController(
        mockCreateUseCase,
        mockGetAllUseCase,
        undefined, // paginated
        undefined, // getById
        mockDeleteUseCase,
      );
      
      mockRequest.params = { id: '123' };

      await controllerWithoutGetById.getById(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur lors de la récupération de l'institution financière",
        error: 'Use case not initialized',
      });
    });

    it('should handle generic errors in getById', async () => {
      mockRequest.params = { id: '123' };
      const error = new Error('Database connection failed');
      mockGetByIdUseCase.execute.mockRejectedValue(error);

      await controller.getById(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur lors de la récupération de l'institution financière",
        error: 'Database connection failed',
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

    it('should handle use case not initialized error in delete', async () => {
      // Créer un contrôleur sans le use case delete
      const controllerWithoutDelete = new InstitutionFinanciereController(
        mockCreateUseCase,
        mockGetAllUseCase,
        undefined, // paginated
        mockGetByIdUseCase,
        undefined, // delete
      );
      
      mockRequest.params = { id: '123' };

      await controllerWithoutDelete.delete(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur lors de la suppression de l'institution financière",
        error: 'Use case not initialized',
      });
    });

    it('should handle not found error in delete', async () => {
      mockRequest.params = { id: '999' };
  const error = new InstitutionNotFoundError('999');
      mockDeleteUseCase.execute.mockRejectedValue(error);

      await controller.delete(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Institution financière non trouvée',
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
