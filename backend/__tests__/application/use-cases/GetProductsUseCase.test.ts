// backend/__tests__/application/use-cases/GetProductsUseCase.test.ts

import type { GetProductsUseCase } from '@/domain/use-cases/getProductsUseCaseImpl';
// eslint-disable-next-line no-duplicate-imports
import { GetProductsUseCaseImpl } from '@/domain/use-cases/getProductsUseCaseImpl';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';
import type {
  ProductFilter,
  PaginationOptions,
  PaginatedResult,
  Product,
} from '@/domain/entities/Product';

describe('GetProductsUseCase', () => {
  let useCase: GetProductsUseCase;
  let mockRepository: jest.Mocked<ProductRepository>;

  const mockPaginatedResult: PaginatedResult<Product> = {
    data: [
      {
        id: 'test-1',
        designation: 'Test Product 1',
        type: 'credit',
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

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByType: jest.fn(),
    };

    useCase = new GetProductsUseCaseImpl(mockRepository);
  });

  describe('execute', () => {
    const validFilters: ProductFilter = { type: 'credit' };
    const validPagination: PaginationOptions = { page: 1, limit: 10 };

    it('should return paginated products successfully', async () => {
      // Arrange
      mockRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await useCase.execute(validFilters, validPagination);

      // Assert
      expect(result).toEqual(mockPaginatedResult);
      expect(mockRepository.findAll).toHaveBeenCalledWith(validFilters, validPagination);
    });

    it('should throw error when page number is invalid', async () => {
      // Arrange
      const invalidPagination = { page: 0, limit: 10 };

      // Act & Assert
      await expect(useCase.execute(validFilters, invalidPagination)).rejects.toThrow(
        'Le numéro de page doit être supérieur à 0'
      );
    });

    it('should throw error when limit is invalid', async () => {
      // Arrange
      const invalidPagination = { page: 1, limit: 0 };

      // Act & Assert
      await expect(useCase.execute(validFilters, invalidPagination)).rejects.toThrow(
        'La limite doit être entre 1 et 100'
      );
    });
  });
});
