// backend/__tests__/application/use-cases/CreateProductUseCase.test.ts

import type { CreateProductUseCase } from '@/domain/use-cases/createProductUseCaseImpl';
// eslint-disable-next-line no-duplicate-imports
import { CreateProductUseCaseImpl } from '@/domain/use-cases/createProductUseCaseImpl';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';
import type { Product } from '@/domain/entities/Product';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let mockRepository: jest.Mocked<ProductRepository>;

  const validProductData = {
    designation: 'Nouveau Crédit',
    type: 'credit' as const,
    montantMinimum: 1000,
    montantMaximum: 50000,
    remboursement: {
      dureeMinimum: 12,
      dureeMaximum: 84,
      modalites: ['mensuel'],
      tauxInteret: 4.5,
      typeRemboursement: 'fixe' as const,
      remboursementAnticipe: true,
    },
    conditionsEligibilite: {
      ageMinimum: 18,
      revenuMinimum: 1500,
      situationsProfessionnelles: ['CDI'],
      documentsRequis: ["Pièce d'identité"],
      autresConditions: [],
    },
  };

  const mockCreatedProduct: Product = {
    ...validProductData,
    id: 'new-product-001',
    createdAt: new Date(),
    updatedAt: new Date(),
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

    useCase = new CreateProductUseCaseImpl(mockRepository);
  });

  describe('execute', () => {
    it('should create product successfully', async () => {
      // Arrange
      mockRepository.create.mockResolvedValue(mockCreatedProduct);

      // Act
      const result = await useCase.execute(validProductData);

      // Assert
      expect(result).toEqual(mockCreatedProduct);
      expect(mockRepository.create).toHaveBeenCalledWith(validProductData);
    });

    it('should throw error for invalid data', async () => {
      // Arrange
      const invalidData = { ...validProductData, designation: '' };

      // Act & Assert
      await expect(useCase.execute(invalidData)).rejects.toThrow(
        'La désignation du produit est requise'
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });
});
