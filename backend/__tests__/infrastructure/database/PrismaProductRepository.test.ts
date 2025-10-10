// __tests__/infrastructure/database/PrismaProductRepository.test.ts

const productFindMany = jest.fn();
const institutionFindUnique = jest.fn();

jest.mock('@prisma/client', () => {
  // new PrismaClient() retournera cet objet simulé
  const MockedPrismaClient = function () {
    return {
      product: { findMany: productFindMany },
      institution: { findUnique: institutionFindUnique },
    };
  };

  // On expose aussi Prisma pour éviter d’importer des vrais types/Decimal
  return {
    PrismaClient: MockedPrismaClient,
    Prisma: {
      Decimal: class {},
    },
  };
});

import { ProductType } from '@/domain/entities/types/ProductType';
import { PrismaProductRepository } from '@/infrastructure/config/PrismaProductRepository';
// ------- Import du repo APRÈS le mock -------

// Helper pour reset les mocks
const resetPrismaMocks = () => {
  productFindMany.mockReset();
  institutionFindUnique.mockReset();
};

describe('PrismaProductRepository', () => {
  const repo = new PrismaProductRepository();

  beforeEach(() => {
    resetPrismaMocks();
  });

  describe('findByInstitution', () => {
    it('retourne les produits mappés et appelle findMany avec les bons paramètres', async () => {
      productFindMany.mockResolvedValueOnce([
        {
          id: 'p1',
          designation: 'Crédit A',
          montantMin: 1000, // number OK (toDomain fait Number())
          montantMax: 5000,
          type: 'CREDIT',
          modesRemboursement: 'AGENCE',
          institutionId: 'inst-123',
          zones: ['Z1'],
          createdAt: new Date('2025-01-01T00:00:00Z'),
          updatedAt: new Date('2025-01-02T00:00:00Z'),
        },
        {
          id: 'p2',
          designation: 'Épargne B',
          montantMin: 0,
          montantMax: 0,
          type: 'EPARGNE',
          modesRemboursement: 'USSD',
          institutionId: 'inst-123',
          zones: ['Z2'],
          createdAt: new Date('2025-02-01T00:00:00Z'),
          updatedAt: new Date('2025-02-02T00:00:00Z'),
        },
      ]);

      const res = await repo.findByInstitution('inst-123');

      expect(productFindMany).toHaveBeenCalledTimes(1);
      expect(productFindMany).toHaveBeenCalledWith({
        where: { institutionId: 'inst-123' },
        orderBy: [{ designation: 'asc' }],
      });

      expect(res).toHaveLength(2);
      expect(res[0].id).toBe('p1');
      expect(res[1].id).toBe('p2');
      // si ton entité Product expose un champ zoneCode, décommente :
      // expect(res[0].zoneCode).toBe('Z1');
      // expect(res[1].zoneCode).toBe('Z2');
    });
  });

  describe('findByFilters', () => {
    it('applique types + zones + fromDate correctement', async () => {
      productFindMany.mockResolvedValueOnce([]);

      const fromDate = new Date('2024-01-01T00:00:00Z');
      await repo.findByFilters(
        'inst-999',
        [ProductType.CREDIT, ProductType.EPARGNE],
        ['dkr', 'ths'],
        fromDate
      );

      expect(productFindMany).toHaveBeenCalledTimes(1);
      expect(productFindMany).toHaveBeenCalledWith({
        where: {
          institutionId: 'inst-999',
          type: { in: ['CREDIT', 'EPARGNE'] },
          zones: { hasSome: ['dkr', 'ths'] },
          createdAt: { gte: fromDate },
        },
        orderBy: [{ designation: 'asc' }],
      });
    });

    it('query vide → passe seulement institutionId', async () => {
      productFindMany.mockResolvedValueOnce([]);
      await repo.findByFilters('inst_ONLY', undefined, undefined, undefined);

      expect(productFindMany).toHaveBeenCalledWith({
        where: { institutionId: 'inst_ONLY' },
        orderBy: [{ designation: 'asc' }],
      });
    });
  });

  describe('institutionExists', () => {
    it('renvoie true si trouvé', async () => {
      institutionFindUnique.mockResolvedValueOnce({ id: 'inst-42' });
      await expect(repo.institutionExists('inst-42')).resolves.toBe(true);

      expect(institutionFindUnique).toHaveBeenCalledTimes(1);
      expect(institutionFindUnique).toHaveBeenCalledWith({
        where: { id: 'inst-42' },
        select: { id: true },
      });
    });

    it('renvoie false si non trouvé', async () => {
      institutionFindUnique.mockResolvedValueOnce(null);
      await expect(repo.institutionExists('inst-404')).resolves.toBe(false);

      expect(institutionFindUnique).toHaveBeenCalledTimes(1);
      expect(institutionFindUnique).toHaveBeenCalledWith({
        where: { id: 'inst-404' },
        select: { id: true },
      });
    });
  });
});
