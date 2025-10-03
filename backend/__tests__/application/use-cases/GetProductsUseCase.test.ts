// backend/__tests__/application/use-cases/GetProductsUseCase.test.ts

import type { GetProductsUseCase } from '@/domain/use-cases/getProductsUseCaseImpl';
// eslint-disable-next-line no-duplicate-imports
import { GetProductsUseCaseImpl } from '@/domain/use-cases/getProductsUseCaseImpl';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';
import type { ProductFilter } from '@/domain/entities/Product';

describe('GetProductsUseCase', () => {
  let useCase: GetProductsUseCase;
  let mockRepository: jest.Mocked<ProductRepository>;

  const mockProducts = [
    {
      id: 'test-1',
      designation: 'Test Product 1',
      type: 'CREDIT' as import('@/domain/entities/Product').ProductType,
      montantMinimum: 1000,
      montantMaximum: 50000,
      remboursement: {} as any,
      conditionsEligibilite: {} as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByType: jest.fn(),
    };
    useCase = new GetProductsUseCaseImpl(mockRepository);
  });

  it('doit retourner la liste des produits depuis le repository', async () => {
    const filters: ProductFilter = { type: 'CREDIT' };
    mockRepository.findAll.mockResolvedValue(mockProducts);

    const result = await useCase.execute(filters);
    expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    expect(result).toEqual(mockProducts);
  });
});
