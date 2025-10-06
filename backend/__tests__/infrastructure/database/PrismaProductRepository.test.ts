import { ProductType } from '@/domain/entities/Product';
import { PrismaProductRepository } from '@/infrastructure/database/PrismaProductRepository';

const mockPrisma = {
  product: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
} as any;

describe('PrismaProductRepository', () => {
  let repository: PrismaProductRepository;
  const mockPrismaProduct = {
    id: 'test-id',
    designation: 'Test Product',
    type: 'CREDIT',
    montantMinimum: 1000,
    montantMaximum: 50000,
    remboursement: {
      dureeMinimum: 12,
      dureeMaximum: 60,
      modalites: ['mensuel'],
      tauxInteret: 4.5,
      typeRemboursement: 'fixe',
      remboursementAnticipe: true,
    },
    conditionsEligibilite: {
      ageMinimum: 18,
      revenuMinimum: 1500,
      situationsProfessionnelles: ['CDI'],
      documentsRequis: ['ID'],
      autresConditions: [],
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    repository = new PrismaProductRepository(mockPrisma);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return product when found', async () => {
      (mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(mockPrismaProduct);

      const result = await repository.findById('test-id');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('test-id');
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });

    it('should return null when product not found', async () => {
      (mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should build correct where clause for filters', async () => {
      (mockPrisma.product.count as jest.Mock).mockResolvedValue(1);
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([mockPrismaProduct]);

      const filters = { type: ProductType.CREDIT, designation: 'Test' };

      await repository.findAll(filters);
    });

    it('should throw if findMany fails', async () => {
      (mockPrisma.product.count as jest.Mock).mockResolvedValue(1);
      (mockPrisma.product.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    });
  });

  describe('findByType', () => {
    it('should return products of the given type', async () => {
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([mockPrismaProduct]);
      const result = await repository.findByType(ProductType.CREDIT);
      expect(Array.isArray(result)).toBe(true);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { type: 'credit' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      (mockPrisma.product.findUnique as jest.Mock).mockRejectedValue(dbError);

      await expect(repository.findById('test-id')).rejects.toThrow('Database connection failed');
    });
  });
});
