// backend/__tests__/infrastructure/database/PrismaProductRepository.test.ts
import { PrismaProductRepository } from '@/infrastructure/database/PrismaProductRepository';

// Mock Prisma Client
const mockPrisma = {
  product: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
} as any; // Utiliser 'as any' pour éviter l'erreur TS2339

describe('PrismaProductRepository', () => {
  let repository: PrismaProductRepository;

  beforeEach(() => {
    repository = new PrismaProductRepository(mockPrisma);
    jest.clearAllMocks();
  });

  const mockPrismaProduct = {
    id: 'test-id',
    designation: 'Test Product',
    type: 'credit',
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

      const filters = { type: 'credit' as const, designation: 'Test' };
      const pagination = { page: 1, limit: 10 };

      await repository.findAll(filters, pagination);

      expect(mockPrisma.product.count).toHaveBeenCalledWith({
        where: {
          type: 'credit',
          designation: {
            contains: 'Test',
            mode: 'insensitive',
          },
        },
      });
    });
  });

  describe('create', () => {
    it('should create product with correct data mapping', async () => {
      const createData = {
        designation: 'New Product',
        type: 'credit' as const,
        montantMinimum: 2000,
        montantMaximum: 30000,
        remboursement: {
          dureeMinimum: 12,
          dureeMaximum: 60,
          modalites: ['mensuel'],
          tauxInteret: 4.2,
          typeRemboursement: 'fixe' as const,
          remboursementAnticipe: true,
        },
        conditionsEligibilite: {
          ageMinimum: 21,
          revenuMinimum: 2000,
          situationsProfessionnelles: ['CDI'],
          documentsRequis: ['ID'],
          autresConditions: [],
        },
      };

      const createdProduct = { ...mockPrismaProduct, ...createData, id: 'new-id' };
      (mockPrisma.product.create as jest.Mock).mockResolvedValue(createdProduct);

      const result = await repository.create(createData);

      expect(result.designation).toBe('New Product');
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          designation: createData.designation,
          type: createData.type,
          montantMinimum: createData.montantMinimum,
          montantMaximum: createData.montantMaximum,
          remboursement: createData.remboursement,
          conditionsEligibilite: createData.conditionsEligibilite,
        },
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
