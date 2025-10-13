// backend/__tests__/infrastructure/web/controllers/ProductController.test.ts
import type { Request, Response } from 'express';
import { ServiceController } from '@/infrastructure/web/controllers/ServiceController';
import type { GetServiceByIdUseCaseImpl } from '@/domain/use-cases/getServiceByIdUseCaseImpl';

import type { Service } from '@/domain/entities/Service';
import { TypeService } from '@/domain/institutions/entities/Service';
import { logger } from '@/infrastructure/utils/logger';
import type { GetServicesUseCaseImpl } from '@/domain/use-cases/getServiceUseCaseImpl';

// Mock du logger
jest.mock('@/infrastructure/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('ServiceController', () => {
  let serviceController: ServiceController;
  let mockGetServiceByIdUseCase: jest.Mocked<GetServiceByIdUseCaseImpl>;
  let mockGetServicesUseCase: jest.Mocked<GetServicesUseCaseImpl>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const mockService: Service = {
    id: '1',
    name: 'Service de Crédit Immobilier',
    longName: 'Service de Crédit Immobilier pour particuliers',
    type: TypeService.CREDIT,
    frais: {
      ouverture: 50000,
      gestion: 2000,
      commission: 1.5,
      assurance: 0.8,
    },
    conditionAccess: ['Age minimum 18 ans', 'Revenus réguliers', 'CDI ou profession libérale'],
    plafonds: ['Minimum 1 000 000 FCFA', 'Maximum 50 000 000 FCFA'],
    infrastructureAccess: ['Agences physiques', 'Plateforme digitale', 'Mobile Banking'],
    institutionId: 'institution-1',
    institution: {
      id: 'institution-1',
      name: 'Banque Immobilière',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Reset des mocks
    jest.clearAllMocks();

    // Mock des use cases
    mockGetServiceByIdUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetServiceByIdUseCaseImpl>;

    mockGetServicesUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetServicesUseCaseImpl>;

    // Initialisation du controller
    serviceController = new ServiceController(mockGetServiceByIdUseCase, mockGetServicesUseCase);

    // Mock de la réponse
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockResponse = {
      json: jsonMock,
      status: statusMock,
    };

    // Mock de la requête
    mockRequest = {
      params: {},
      query: {},
    };
  });

  describe('getServiceById', () => {
    it('should return service when id is valid', async () => {
      mockRequest.params = { id: '1' };
      mockGetServiceByIdUseCase.execute.mockResolvedValue(mockService);

      await serviceController.getServiceById(mockRequest as Request, mockResponse as Response);

      expect(mockGetServiceByIdUseCase.execute).toHaveBeenCalledWith('1');
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'success',
        data: mockService,
      });
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 404 when service is not found', async () => {
      mockRequest.params = { id: '999' };
      mockGetServiceByIdUseCase.execute.mockResolvedValue(null);

      await serviceController.getServiceById(mockRequest as Request, mockResponse as Response);

      expect(mockGetServiceByIdUseCase.execute).toHaveBeenCalledWith('999');
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Service non trouvé',
      });
    });

    it('should return 400 when id is missing', async () => {
      mockRequest.params = {};

      await serviceController.getServiceById(mockRequest as Request, mockResponse as Response);

      expect(mockGetServiceByIdUseCase.execute).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'ID du service requis',
      });
    });

    it('should return 400 when id is empty string', async () => {
      mockRequest.params = { id: '   ' };

      await serviceController.getServiceById(mockRequest as Request, mockResponse as Response);

      expect(mockGetServiceByIdUseCase.execute).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'ID du service requis',
      });
    });

    it('should return 400 when id is empty string', async () => {
      mockRequest.params = { id: '   ' };

      await serviceController.getServiceById(mockRequest as Request, mockResponse as Response);

      expect(mockGetServiceByIdUseCase.execute).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'ID du service requis',
      });
    });

    it('should return 400 when use case throws validation error', async () => {
      mockRequest.params = { id: '1' };
      const error = new Error('ID requis');
      mockGetServiceByIdUseCase.execute.mockRejectedValue(error);

      await serviceController.getServiceById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'ID requis',
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should return 500 when unexpected error occurs', async () => {
      mockRequest.params = { id: '1' };
      const error = new Error('Database connection failed');
      mockGetServiceByIdUseCase.execute.mockRejectedValue(error);

      await serviceController.getServiceById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Erreur interne du serveur',
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle when req.params is undefined', async () => {
      mockRequest.params = undefined;

      await serviceController.getServiceById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'ID du service requis',
      });
    });
  });

  describe('getProducts', () => {
    const mockProducts = [mockService];

    it('should return all products when no filters are provided', async () => {
      mockRequest.query = {};
      mockGetServicesUseCase.execute.mockResolvedValue(mockProducts);

      await serviceController.getServices(mockRequest as Request, mockResponse as Response);

      expect(mockGetServicesUseCase.execute).toHaveBeenCalledWith({
        type: undefined,
        name: undefined,
        institutionId: undefined,
      });
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'success',
        data: mockProducts,
      });
    });

    it('should filter services by type', async () => {
      mockRequest.query = { type: TypeService.CREDIT }; // Utiliser la valeur de l'enum
      mockGetServicesUseCase.execute.mockResolvedValue(mockProducts);

      await serviceController.getServices(mockRequest as Request, mockResponse as Response);

      expect(mockGetServicesUseCase.execute).toHaveBeenCalledWith({
        type: TypeService.CREDIT,
        name: undefined,
        institutionId: undefined,
      });
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'success',
        data: mockProducts,
      });
    });

    it('should filter services by name', async () => {
      mockRequest.query = { name: 'Crédit' };
      mockGetServicesUseCase.execute.mockResolvedValue(mockProducts);

      await serviceController.getServices(mockRequest as Request, mockResponse as Response);

      expect(mockGetServicesUseCase.execute).toHaveBeenCalledWith({
        type: undefined,
        name: 'Crédit',
        institutionId: undefined,
      });
    });

    it('should filter services by institutionId', async () => {
      mockRequest.query = { institutionId: 'institution-1' };
      mockGetServicesUseCase.execute.mockResolvedValue(mockProducts);

      await serviceController.getServices(mockRequest as Request, mockResponse as Response);

      expect(mockGetServicesUseCase.execute).toHaveBeenCalledWith({
        type: undefined,
        name: undefined,
        institutionId: 'institution-1',
      });
    });

    it('should filter products with multiple filters', async () => {
      mockRequest.query = {
        type: TypeService.CREDIT, // Utiliser la valeur de l'enum directement
        name: 'Crédit',
        institutionId: 'institution-1',
      };
      mockGetServicesUseCase.execute.mockResolvedValue(mockProducts);

      await serviceController.getServices(mockRequest as Request, mockResponse as Response);

      expect(mockGetServicesUseCase.execute).toHaveBeenCalledWith({
        type: TypeService.CREDIT,
        name: 'Crédit',
        institutionId: 'institution-1',
      });
    });

    it('should ignore invalid service type', async () => {
      mockRequest.query = { type: 'INVALID_TYPE' };
      mockGetServicesUseCase.execute.mockResolvedValue(mockProducts);

      await serviceController.getServices(mockRequest as Request, mockResponse as Response);

      expect(mockGetServicesUseCase.execute).toHaveBeenCalledWith({
        type: undefined,
        name: undefined,
        institutionId: undefined,
      });
    });

    it('should handle when req.query is undefined', async () => {
      mockRequest.query = undefined;
      mockGetServicesUseCase.execute.mockResolvedValue(mockProducts);

      await serviceController.getServices(mockRequest as Request, mockResponse as Response);

      expect(mockGetServicesUseCase.execute).toHaveBeenCalledWith({
        type: undefined,
        name: undefined,
        institutionId: undefined,
      });
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'success',
        data: mockProducts,
      });
    });

    it('should return 400 when use case throws validation error about page', async () => {
      mockRequest.query = {};
      const error = new Error('La page doit être un nombre positif');
      mockGetServicesUseCase.execute.mockRejectedValue(error);

      await serviceController.getServices(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'La page doit être un nombre positif',
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should return 400 when use case throws validation error about limit', async () => {
      mockRequest.query = {};
      const error = new Error('La limite doit être un nombre positif');
      mockGetServicesUseCase.execute.mockRejectedValue(error);

      await serviceController.getServices(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'La limite doit être un nombre positif',
      });
    });

    it('should return 500 when unexpected error occurs', async () => {
      mockRequest.query = {};
      const error = new Error('Database connection failed');
      mockGetServicesUseCase.execute.mockRejectedValue(error);

      await serviceController.getServices(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Erreur interne du serveur',
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle empty string filters', async () => {
      mockRequest.query = { name: '', institutionId: '' };
      mockGetServicesUseCase.execute.mockResolvedValue(mockProducts);

      await serviceController.getServices(mockRequest as Request, mockResponse as Response);

      expect(mockGetServicesUseCase.execute).toHaveBeenCalledWith({
        type: undefined,
        name: '',
        institutionId: '',
      });
    });

    it('should handle array query parameters correctly', async () => {
      mockRequest.query = { type: [TypeService.CREDIT, TypeService.EPARGNE] as any };
      mockGetServicesUseCase.execute.mockResolvedValue(mockProducts);

      await serviceController.getServices(mockRequest as Request, mockResponse as Response);

      expect(mockGetServicesUseCase.execute).toHaveBeenCalledWith({
        type: TypeService.CREDIT, // Should use first element
        name: undefined,
        institutionId: undefined,
      });
    });
  });
});
