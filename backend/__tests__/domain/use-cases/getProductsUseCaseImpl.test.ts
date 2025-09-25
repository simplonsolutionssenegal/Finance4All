// backend/__tests__/domain/use-cases/getProductsUseCaseImpl.test.ts
import { GetProductsUseCaseImpl } from '@/domain/use-cases/getProductsUseCaseImpl';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';
import type { ProductFilter, PaginationOptions } from '@/domain/entities/Product';

describe('GetProductsUseCaseImpl', () => {
  let useCase: GetProductsUseCaseImpl;
  let mockRepository: jest.Mocked<ProductRepository>;

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

  describe('pagination validation', () => {
    it('should validate page number', async () => {
      const filters: ProductFilter = {};
      const invalidPagination: PaginationOptions = { page: 0, limit: 10 };

      await expect(useCase.execute(filters, invalidPagination)).rejects.toThrow(
        'Le numéro de page doit être supérieur à 0'
      );
    });

    it('should validate limit bounds', async () => {
      const filters: ProductFilter = {};

      await expect(useCase.execute(filters, { page: 1, limit: 0 })).rejects.toThrow(
        'La limite doit être entre 1 et 100'
      );

      await expect(useCase.execute(filters, { page: 1, limit: 101 })).rejects.toThrow(
        'La limite doit être entre 1 et 100'
      );
    });

    it('should accept valid pagination', async () => {
      const filters: ProductFilter = {};
      const pagination: PaginationOptions = { page: 1, limit: 50 };

      mockRepository.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
      });

      await useCase.execute(filters, pagination);

      expect(mockRepository.findAll).toHaveBeenCalledWith(filters, pagination);
    });
  });
});
