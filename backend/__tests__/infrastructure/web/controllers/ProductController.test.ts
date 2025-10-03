// backend/__tests__/infrastructure/web/controllers/ProductController.test.ts
import type { Request, Response } from 'express';
import { ProductController } from '@/infrastructure/web/controllers/ProductController';
import type { GetProductByIdUseCaseImpl } from '@/domain/use-cases/getProductByIdUseCaseImpl';
import type { GetProductsUseCaseImpl } from '@/domain/use-cases/getProductsUseCaseImpl';
import type { Product, ProductType } from '@/domain/entities/Product';
import { logger } from '@/utils/logger';

// Mock du logger
jest.mock('@/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('ProductController', () => {
  let productController: ProductController;
  let mockGetProductByIdUseCase: jest.Mocked<GetProductByIdUseCaseImpl>;
  let mockGetProductsUseCase: jest.Mocked<GetProductsUseCaseImpl>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const mockProduct: Product = {
    id: '1',
    designation: 'Crédit Immobilier',
    type: 'CREDIT' as ProductType,
    montantMinimum: 1000000,
    montantMaximum: 50000000,
    remboursement: {
      dureeMinimum: 12,
      dureeMaximum: 240,
      modalites: ['mensuel'],
      tauxInteret: 5.5,
      typeRemboursement: 'fixe',
      remboursementAnticipe: true,
    },
    conditionsEligibilite: {
      ageMinimum: 18,
      revenuMinimum: 500000,
      situationsProfessionnelles: ['CDI'],
      documentsRequis: ['Pièce identité', 'Bulletin de salaire'],
      autresConditions: [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Reset des mocks
    jest.clearAllMocks();

    // Mock des use cases
    mockGetProductByIdUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetProductByIdUseCaseImpl>;

    mockGetProductsUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetProductsUseCaseImpl>;

    // Initialisation du controller
    productController = new ProductController(mockGetProductByIdUseCase, mockGetProductsUseCase);

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

  describe('getProductById', () => {
    it('should return product when id is valid', async () => {
      mockRequest.params = { id: '1' };
      mockGetProductByIdUseCase.execute.mockResolvedValue(mockProduct);

      await productController.getProductById(mockRequest as Request, mockResponse as Response);

      expect(mockGetProductByIdUseCase.execute).toHaveBeenCalledWith('1');
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'success',
        data: mockProduct,
      });
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 404 when product is not found', async () => {
      mockRequest.params = { id: '999' };
      mockGetProductByIdUseCase.execute.mockResolvedValue(null);

      await productController.getProductById(mockRequest as Request, mockResponse as Response);

      expect(mockGetProductByIdUseCase.execute).toHaveBeenCalledWith('999');
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Produit non trouvé',
      });
    });

    it('should return 400 when id is missing', async () => {
      mockRequest.params = {};

      await productController.getProductById(mockRequest as Request, mockResponse as Response);

      expect(mockGetProductByIdUseCase.execute).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'ID du produit requis',
      });
    });

    it('should return 400 when id is empty string', async () => {
      mockRequest.params = { id: '   ' };

      await productController.getProductById(mockRequest as Request, mockResponse as Response);

      expect(mockGetProductByIdUseCase.execute).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'ID du produit requis',
      });
    });

    it('should return 400 when use case throws validation error', async () => {
      mockRequest.params = { id: '1' };
      const error = new Error('ID requis');
      mockGetProductByIdUseCase.execute.mockRejectedValue(error);

      await productController.getProductById(mockRequest as Request, mockResponse as Response);

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
      mockGetProductByIdUseCase.execute.mockRejectedValue(error);

      await productController.getProductById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Erreur interne du serveur',
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle when req.params is undefined', async () => {
      mockRequest.params = undefined;

      await productController.getProductById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'ID du produit requis',
      });
    });
  });

  describe('getProducts', () => {
    const mockProducts = [mockProduct];

    it('should return all products when no filters are provided', async () => {
      mockRequest.query = {};
      mockGetProductsUseCase.execute.mockResolvedValue(mockProducts);

      await productController.getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockGetProductsUseCase.execute).toHaveBeenCalledWith({
        type: undefined,
        designation: undefined,
        montantMinimum: undefined,
        montantMaximum: undefined,
      });
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'success',
        data: mockProducts,
      });
    });

    it('should filter products by type', async () => {
      mockRequest.query = { type: 'CREDIT' };
      mockGetProductsUseCase.execute.mockResolvedValue(mockProducts);

      await productController.getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockGetProductsUseCase.execute).toHaveBeenCalledWith({
        type: 'CREDIT',
        designation: undefined,
        montantMinimum: undefined,
        montantMaximum: undefined,
      });
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'success',
        data: mockProducts,
      });
    });

    it('should filter products by designation', async () => {
      mockRequest.query = { designation: 'Immobilier' };
      mockGetProductsUseCase.execute.mockResolvedValue(mockProducts);

      await productController.getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockGetProductsUseCase.execute).toHaveBeenCalledWith({
        type: undefined,
        designation: 'Immobilier',
        montantMinimum: undefined,
        montantMaximum: undefined,
      });
    });

    it('should filter products by montant range', async () => {
      mockRequest.query = { montantMinimum: '1000', montantMaximum: '5000' };
      mockGetProductsUseCase.execute.mockResolvedValue(mockProducts);

      await productController.getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockGetProductsUseCase.execute).toHaveBeenCalledWith({
        type: undefined,
        designation: undefined,
        montantMinimum: 1000,
        montantMaximum: 5000,
      });
    });

    it('should filter products with multiple filters', async () => {
      mockRequest.query = {
        type: 'CREDIT',
        designation: 'Immobilier',
        montantMinimum: '1000000',
        montantMaximum: '50000000',
      };
      mockGetProductsUseCase.execute.mockResolvedValue(mockProducts);

      await productController.getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockGetProductsUseCase.execute).toHaveBeenCalledWith({
        type: 'CREDIT',
        designation: 'Immobilier',
        montantMinimum: 1000000,
        montantMaximum: 50000000,
      });
    });

    it('should ignore invalid product type', async () => {
      mockRequest.query = { type: 'INVALID_TYPE' };
      mockGetProductsUseCase.execute.mockResolvedValue(mockProducts);

      await productController.getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockGetProductsUseCase.execute).toHaveBeenCalledWith({
        type: undefined,
        designation: undefined,
        montantMinimum: undefined,
        montantMaximum: undefined,
      });
    });

    it('should handle when req.query is undefined', async () => {
      mockRequest.query = undefined;
      mockGetProductsUseCase.execute.mockResolvedValue(mockProducts);

      await productController.getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockGetProductsUseCase.execute).toHaveBeenCalledWith({
        type: undefined,
        designation: undefined,
        montantMinimum: undefined,
        montantMaximum: undefined,
      });
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'success',
        data: mockProducts,
      });
    });

    it('should return 400 when use case throws validation error about page', async () => {
      mockRequest.query = {};
      const error = new Error('La page doit être un nombre positif');
      mockGetProductsUseCase.execute.mockRejectedValue(error);

      await productController.getProducts(mockRequest as Request, mockResponse as Response);

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
      mockGetProductsUseCase.execute.mockRejectedValue(error);

      await productController.getProducts(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'La limite doit être un nombre positif',
      });
    });

    it('should return 500 when unexpected error occurs', async () => {
      mockRequest.query = {};
      const error = new Error('Database connection failed');
      mockGetProductsUseCase.execute.mockRejectedValue(error);

      await productController.getProducts(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Erreur interne du serveur',
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should parse numeric strings correctly', async () => {
      mockRequest.query = { montantMinimum: '1000.50', montantMaximum: '5000.75' };
      mockGetProductsUseCase.execute.mockResolvedValue(mockProducts);

      await productController.getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockGetProductsUseCase.execute).toHaveBeenCalledWith({
        type: undefined,
        designation: undefined,
        montantMinimum: 1000.5,
        montantMaximum: 5000.75,
      });
    });

    it('should handle NaN values for montant', async () => {
      mockRequest.query = { montantMinimum: 'invalid', montantMaximum: 'invalid' };
      mockGetProductsUseCase.execute.mockResolvedValue(mockProducts);

      await productController.getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockGetProductsUseCase.execute).toHaveBeenCalledWith({
        type: undefined,
        designation: undefined,
        montantMinimum: NaN,
        montantMaximum: NaN,
      });
    });
  });
});
