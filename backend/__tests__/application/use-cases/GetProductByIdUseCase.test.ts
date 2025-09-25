// backend/__tests__/application/use-cases/GetProductByIdUseCase.test.ts
import type { GetProductByIdUseCase } from '@/domain/use-cases/getProductByIdUseCaseImpl';
// eslint-disable-next-line no-duplicate-imports
import { GetProductByIdUseCaseImpl } from '@/domain/use-cases/getProductByIdUseCaseImpl';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';
import type { Product } from '@/domain/entities/Product';

describe('GetProductByIdUseCase', () => {
  let useCase: GetProductByIdUseCase;
  let mockRepository: jest.Mocked<ProductRepository>;

  const mockProduct: Product = {
    id: 'test-product-001',
    designation: 'Crédit Test',
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
      ageMaximum: 75,
      revenuMinimum: 1500,
      situationsProfessionnelles: ['CDI', 'CDD'],
      documentsRequis: ["Pièce d'identité"],
      autresConditions: ['Résidence en France'],
    },
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
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

    useCase = new GetProductByIdUseCaseImpl(mockRepository);
  });

  describe('execute', () => {
    it('should return product when found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockProduct);

      // Act
      const result = await useCase.execute('test-product-001');

      // Assert
      expect(result).toEqual(mockProduct);
      expect(mockRepository.findById).toHaveBeenCalledWith('test-product-001');
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should return null when product not found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await useCase.execute('non-existent-id');

      // Assert
      expect(result).toBeNull();
      expect(mockRepository.findById).toHaveBeenCalledWith('non-existent-id');
    });

    it('should throw error when id is empty', async () => {
      // Act & Assert
      await expect(useCase.execute('')).rejects.toThrow('ID du produit requis');
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error when id is null', async () => {
      // Act & Assert
      await expect(useCase.execute(null as any)).rejects.toThrow('ID du produit requis');
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockRepository.findById.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute('test-product-001')).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
