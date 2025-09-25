// backend/__tests__/domain/use-cases/createProductUseCaseImpl.test.ts
import { CreateProductUseCaseImpl } from '@/domain/use-cases/createProductUseCaseImpl';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';

describe('CreateProductUseCaseImpl', () => {
  let useCase: CreateProductUseCaseImpl;
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
      documentsRequis: ['ID'],
      autresConditions: [],
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

    useCase = new CreateProductUseCaseImpl(mockRepository);
  });

  describe('data validation', () => {
    it('should validate designation', async () => {
      await expect(useCase.execute({ ...validProductData, designation: '' })).rejects.toThrow(
        'La désignation du produit est requise'
      );
    });

    it('should validate montant coherence', async () => {
      await expect(
        useCase.execute({
          ...validProductData,
          montantMinimum: 50000,
          montantMaximum: 1000,
        })
      ).rejects.toThrow('Le montant maximum doit être supérieur au montant minimum');
    });

    it('should validate taux interet', async () => {
      await expect(
        useCase.execute({
          ...validProductData,
          remboursement: {
            ...validProductData.remboursement,
            tauxInteret: -2.5,
          },
        })
      ).rejects.toThrow("Le taux d'intérêt ne peut pas être négatif");
    });
  });
});
