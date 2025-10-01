import { PrismaProductRepository } from '@/infrastructure/database/PrismaProductRepository';

const mockPrisma = {
  product: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
} as any;

describe('PrismaProductRepository', () => {
  let repository: PrismaProductRepository;
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
    it('should throw if count fails', async () => {
      (mockPrisma.product.count as jest.Mock).mockRejectedValue(new Error('fail'));
      await expect(repository.findAll({}, { page: 1, limit: 1 })).rejects.toThrow('fail');
    });
    it('should throw if findMany fails', async () => {
      (mockPrisma.product.count as jest.Mock).mockResolvedValue(1);
      (mockPrisma.product.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
      await expect(repository.findAll({}, { page: 1, limit: 1 })).rejects.toThrow('fail');
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
    it('should throw if create fails', async () => {
      (mockPrisma.product.create as jest.Mock).mockRejectedValue(new Error('fail'));
      await expect(
        repository.create({
          designation: 'X',
          type: 'credit',
          montantMinimum: 1,
          montantMaximum: 2,
          remboursement: {
            dureeMinimum: 1,
            dureeMaximum: 2,
            modalites: ['mensuel'],
            tauxInteret: 1,
            typeRemboursement: 'fixe',
            remboursementAnticipe: false,
          },
          conditionsEligibilite: {
            ageMinimum: 18,
            revenuMinimum: 1000,
            situationsProfessionnelles: ['CDI'],
            documentsRequis: ['ID'],
            autresConditions: [],
          },
        })
      ).rejects.toThrow('fail');
    });
  });

  describe('update', () => {
    it('should update and return the product if found', async () => {
      (mockPrisma.product.findUnique as jest.Mock).mockResolvedValue({ ...mockPrismaProduct });
      (mockPrisma.product.update as jest.Mock).mockResolvedValue({
        ...mockPrismaProduct,
        designation: 'Updated',
      });
      const result = await repository.update('test-id', { designation: 'Updated' });
      expect(result).not.toBeNull();
      expect(result?.designation).toBe('Updated');
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { designation: 'Updated' },
      });
    });
    it('should return null if product not found', async () => {
      (mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await repository.update('not-found', { designation: 'X' });
      expect(result).toBeNull();
      expect(mockPrisma.product.update).not.toHaveBeenCalled();
    });
    it('should throw if update fails', async () => {
      (mockPrisma.product.findUnique as jest.Mock).mockResolvedValue({ ...mockPrismaProduct });
      (mockPrisma.product.update as jest.Mock).mockRejectedValue(new Error('Update failed'));
      await expect(repository.update('test-id', { designation: 'X' })).rejects.toThrow(
        'Update failed'
      );
    });
  });

  describe('delete', () => {
    it('should return true if product deleted', async () => {
      (mockPrisma.product.delete as jest.Mock).mockResolvedValue({});
      const result = await repository.delete('test-id');
      expect(result).toBe(true);
      expect(mockPrisma.product.delete).toHaveBeenCalledWith({ where: { id: 'test-id' } });
    });
    it('should return false if product not found (P2025)', async () => {
      const error = { code: 'P2025' };
      (mockPrisma.product.delete as jest.Mock).mockRejectedValue(error);
      const result = await repository.delete('not-found');
      expect(result).toBe(false);
    });
    it('should throw for other errors', async () => {
      const error = new Error('fail');
      Object.assign(error, { code: 'OTHER' });
      (mockPrisma.product.delete as jest.Mock).mockRejectedValue(error);
      await expect(repository.delete('fail')).rejects.toThrow('fail');
    });
  });

  describe('findByType', () => {
    it('should return products of the given type', async () => {
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([mockPrismaProduct]);
      const result = await repository.findByType('credit');
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].type).toBe('credit');
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { type: 'credit' },
        orderBy: { createdAt: 'desc' },
      });
    });
    it('should throw if db fails', async () => {
      (mockPrisma.product.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
      await expect(repository.findByType('credit')).rejects.toThrow('fail');
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
