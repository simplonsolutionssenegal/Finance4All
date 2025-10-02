// backend/__tests__/domain/use-cases/getProductByIdUseCaseImpl.test.ts
import { GetProductByIdUseCaseImpl } from '@/domain/use-cases/getProductByIdUseCaseImpl';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';
import type { Product } from '@/domain/entities/Product';

describe('GetProductByIdUseCaseImpl', () => {
  let useCase: GetProductByIdUseCaseImpl;
  let mockRepository: jest.Mocked<ProductRepository>;

  const mockProduct: Product = {
    id: 'test-id',
    designation: 'Test Product',
    type: 'credit',
    montantMinimum: 1000,
    montantMaximum: 50000,
    remboursement: {
      dureeMinimum: 12,
      dureeMaximum: 84,
      modalites: ['mensuel'],
      tauxInteret: 4.5,
      typeRemboursement: 'fixe',
      penalitesRetard: 8.0,
      remboursementAnticipe: true,
    },
    conditionsEligibilite: {
      ageMinimum: 18,
      revenuMinimum: 1500,
      situationsProfessionnelles: ['CDI'],
      documentsRequis: ['ID'],
      autresConditions: [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByType: jest.fn(),
    };

    useCase = new GetProductByIdUseCaseImpl(mockRepository);
  });

  describe('business logic validation', () => {
    it('should validate input parameters', async () => {
      await expect(useCase.execute('')).rejects.toThrow('ID du produit requis');
      await expect(useCase.execute('   ')).rejects.toThrow('ID du produit requis');
    });

    it('should call repository with correct parameters', async () => {
      mockRepository.findById.mockResolvedValue(mockProduct);

      await useCase.execute('test-id');

      expect(mockRepository.findById).toHaveBeenCalledWith('test-id');
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should return repository result unchanged', async () => {
      mockRepository.findById.mockResolvedValue(mockProduct);

      const result = await useCase.execute('test-id');

      expect(result).toBe(mockProduct);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Repository error');
      mockRepository.findById.mockRejectedValue(error);

      await expect(useCase.execute('test-id')).rejects.toThrow('Repository error');
    });
  });
});
