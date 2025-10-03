// __tests__/domain/use-cases/getProductsUseCaseImpl.test.ts
import { GetProductsUseCaseImpl } from '@/domain/use-cases/getProductsUseCaseImpl';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';
import type { Product, ProductFilter, ProductType } from '@/domain/entities/Product';

describe('GetProductsUseCaseImpl', () => {
  let useCase: GetProductsUseCaseImpl;
  let mockRepository: jest.Mocked<ProductRepository>;

  const mockProduct1: Product = {
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
      documentsRequis: ['Pièce identité'],
      autresConditions: [],
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockProduct2: Product = {
    id: '2',
    designation: 'Épargne Retraite',
    type: 'EPARGNE' as ProductType,
    montantMinimum: 10000,
    montantMaximum: 1000000,
    remboursement: {
      dureeMinimum: 60,
      dureeMaximum: 360,
      modalites: ['mensuel'],
      tauxInteret: 3.5,
      typeRemboursement: 'fixe',
      remboursementAnticipe: false,
    },
    conditionsEligibilite: {
      ageMinimum: 18,
      revenuMinimum: 0,
      situationsProfessionnelles: ['CDI', 'CDD'],
      documentsRequis: ['Pièce identité'],
      autresConditions: [],
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  };

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByType: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ProductRepository>;

    useCase = new GetProductsUseCaseImpl(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return all products when no filters provided', async () => {
      const filters: ProductFilter = {};
      const mockProducts = [mockProduct1, mockProduct2];
      mockRepository.findAll.mockResolvedValue(mockProducts);

      const result = await useCase.execute(filters);

      expect(result).toEqual(mockProducts);
      expect(result).toHaveLength(2);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return filtered products by type', async () => {
      const filters: ProductFilter = { type: 'CREDIT' as ProductType };
      mockRepository.findAll.mockResolvedValue([mockProduct1]);

      const result = await useCase.execute(filters);

      expect(result).toEqual([mockProduct1]);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('CREDIT');
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return filtered products by designation', async () => {
      const filters: ProductFilter = { designation: 'Immobilier' };
      mockRepository.findAll.mockResolvedValue([mockProduct1]);

      const result = await useCase.execute(filters);

      expect(result).toEqual([mockProduct1]);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return filtered products by montant range', async () => {
      const filters: ProductFilter = {
        montantMinimum: 1000000,
        montantMaximum: 50000000,
      };
      mockRepository.findAll.mockResolvedValue([mockProduct1]);

      const result = await useCase.execute(filters);

      expect(result).toEqual([mockProduct1]);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return filtered products with multiple filters', async () => {
      const filters: ProductFilter = {
        type: 'CREDIT' as ProductType,
        designation: 'Immobilier',
        montantMinimum: 1000000,
        montantMaximum: 50000000,
      };
      mockRepository.findAll.mockResolvedValue([mockProduct1]);

      const result = await useCase.execute(filters);

      expect(result).toEqual([mockProduct1]);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return empty array when no products match filters', async () => {
      const filters: ProductFilter = { type: 'INVESTISSEMENT' as ProductType };
      mockRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute(filters);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should handle repository errors', async () => {
      const filters: ProductFilter = {};
      const error = new Error('Database connection failed');
      mockRepository.findAll.mockRejectedValue(error);

      await expect(useCase.execute(filters)).rejects.toThrow('Database connection failed');
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should call repository with empty filters object', async () => {
      const filters: ProductFilter = {};
      mockRepository.findAll.mockResolvedValue([]);

      await useCase.execute(filters);

      expect(mockRepository.findAll).toHaveBeenCalledWith({});
    });

    it('should preserve product data structure', async () => {
      const filters: ProductFilter = {};
      mockRepository.findAll.mockResolvedValue([mockProduct1]);

      const result = await useCase.execute(filters);

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('designation');
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('montantMinimum');
      expect(result[0]).toHaveProperty('montantMaximum');
      expect(result[0]).toHaveProperty('remboursement');
      expect(result[0]).toHaveProperty('conditionsEligibilite');
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0]).toHaveProperty('updatedAt');
    });

    it('should handle undefined filters gracefully', async () => {
      const filters: ProductFilter = {
        type: undefined,
        designation: undefined,
        montantMinimum: undefined,
        montantMaximum: undefined,
      };
      mockRepository.findAll.mockResolvedValue([mockProduct1, mockProduct2]);

      const result = await useCase.execute(filters);

      expect(result).toHaveLength(2);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });
  });
});
