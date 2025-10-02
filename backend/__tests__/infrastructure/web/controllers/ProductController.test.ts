// backend/__tests__/infrastructure/web/controllers/ProductController.test.ts
import type { Request, Response } from 'express';
import { ProductController } from '@/infrastructure/web/controllers/ProductController';
import { GetProductByIdUseCaseImpl } from '@/domain/use-cases/getProductByIdUseCaseImpl';
import { GetProductsUseCaseImpl } from '@/domain/use-cases/getProductsUseCaseImpl';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';

// Mock le repository au lieu des use cases
const mockRepository: jest.Mocked<ProductRepository> = {
  findById: jest.fn(),
  findByType: jest.fn(),
  findAll: jest.fn(),
};

describe('ProductController', () => {
  let controller: ProductController;
  let getProductByIdUseCase: GetProductByIdUseCaseImpl;
  let getProductsUseCase: GetProductsUseCaseImpl;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // Créer les instances réelles des use cases avec le repository mocké
    getProductByIdUseCase = new GetProductByIdUseCaseImpl(mockRepository);
    getProductsUseCase = new GetProductsUseCaseImpl(mockRepository);

    controller = new ProductController(getProductByIdUseCase, getProductsUseCase);

    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();

    mockRequest = {
      params: {},
      query: {},
      body: {},
    };

    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };

    // Reset tous les mocks
    jest.clearAllMocks();
  });

  describe('getProductById', () => {
    const mockProduct = {
      id: 'test-id',
      designation: 'Test Product',
      type: 'credit' as const,
      montantMinimum: 1000,
      montantMaximum: 50000,
      remboursement: {
        dureeMinimum: 12,
        dureeMaximum: 84,
        modalites: ['mensuel'],
        tauxInteret: 4.5,
        typeRemboursement: 'fixe' as const,
        penalitesRetard: 8.0,
        remboursementAnticipe: true,
      },
      conditionsEligibilite: {
        ageMinimum: 18,
        ageMaximum: 75,
        revenuMinimum: 1500,
        situationsProfessionnelles: ['CDI', 'CDD'],
        documentsRequis: ["Pièce d'identité"],
        autresConditions: ['Résidence en France'],
      },
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
    };

    it('should return product when found', async () => {
      // Arrange
      mockRequest.params = { id: 'test-id' };
      mockRepository.findById.mockResolvedValue(mockProduct);

      // Act
      await controller.getProductById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith('test-id');
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        data: mockProduct,
      });
      expect(mockStatus).not.toHaveBeenCalled(); // Status 200 par défaut
    });

    it('should return 404 when product not found', async () => {
      // Arrange
      mockRequest.params = { id: 'non-existent' };
      mockRepository.findById.mockResolvedValue(null);

      // Act
      await controller.getProductById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith('non-existent');
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Produit non trouvé',
      });
    });

    it('should return 400 for validation errors', async () => {
      // Arrange
      mockRequest.params = { id: '' }; // ID vide

      // Act
      await controller.getProductById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'ID du produit requis',
      });
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should return 500 for unexpected errors', async () => {
      // Arrange
      mockRequest.params = { id: 'test-id' };
      mockRepository.findById.mockRejectedValue(new Error('Database connection failed'));

      // Act
      await controller.getProductById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Erreur interne du serveur',
      });
    });

    it('should handle whitespace-only id', async () => {
      // Arrange
      mockRequest.params = { id: '   ' }; // ID avec espaces

      // Act
      await controller.getProductById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'ID du produit requis',
      });
    });
  });

  describe('getProducts', () => {
    const mockPaginatedResult = {
      data: [
        {
          id: 'test-1',
          designation: 'Test Product 1',
          type: 'credit' as const,
          montantMinimum: 1000,
          montantMaximum: 50000,
          remboursement: {} as any,
          conditionsEligibilite: {} as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };

    it('should return products list with default pagination', async () => {
      // Arrange
      mockRequest.query = {};
      mockRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      await controller.getProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        {
          type: undefined,
          designation: undefined,
          montantMinimum: undefined,
          montantMaximum: undefined,
        },
        { page: 1, limit: 10 }
      );
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        data: mockPaginatedResult.data,
        pagination: mockPaginatedResult.pagination,
      });
    });

    it('should handle type filter correctly', async () => {
      // Arrange
      mockRequest.query = { type: 'credit' };
      mockRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      await controller.getProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'credit' }),
        expect.any(Object)
      );
    });

    it('should ignore invalid type filter', async () => {
      // Arrange
      mockRequest.query = { type: 'invalid_type' };
      mockRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      await controller.getProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ type: undefined }), // Type invalide ignoré
        expect.any(Object)
      );
    });

    it('should handle all query parameters', async () => {
      // Arrange
      mockRequest.query = {
        type: 'epargne',
        designation: 'Premium',
        montantMinimum: '1000',
        montantMaximum: '50000',
        page: '2',
        limit: '5',
      };
      mockRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      await controller.getProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        {
          type: 'epargne',
          designation: 'Premium',
          montantMinimum: 1000,
          montantMaximum: 50000,
        },
        { page: 2, limit: 5 }
      );
    });

    it('should limit pagination to maximum 100', async () => {
      // Arrange
      mockRequest.query = { limit: '150' }; // Dépasse la limite
      mockRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      await controller.getProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ limit: 100 }) // Limité à 100
      );
    });

    it('should return 400 for invalid pagination', async () => {
      // Arrange
      mockRequest.query = { page: '0' }; // Page invalide

      // Act
      await controller.getProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Le numéro de page doit être supérieur à 0',
      });
    });

    it('should handle repository errors', async () => {
      // Arrange
      mockRequest.query = {};
      mockRepository.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      await controller.getProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Erreur interne du serveur',
      });
    });
  });

  describe('error handling edge cases', () => {
    it('should handle missing params object', async () => {
      const req = {} as any; // params est totalement absent
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await controller.getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'ID du produit requis',
      });
    });

    it('should handle missing query object', async () => {
      // Arrange
      delete mockRequest.query;
      mockRepository.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      // Act
      await controller.getProducts(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        {
          type: undefined,
          designation: undefined,
          montantMinimum: undefined,
          montantMaximum: undefined,
        },
        { page: 1, limit: 10 }
      );
    });
  });
});
