import { TypeService } from '@/domain/institutions/entities/Service';
import { TypeService as PrismaTypeService } from '@prisma/client';
import { PrismaServiceRepository } from '@/infrastructure/config/ServiceRepository';

const mockPrisma = {
  service: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
} as any;

describe('PrismaServiceRepository', () => {
  let repository: PrismaServiceRepository;
  const mockInstitution = {
    id: 'institution-id',
    name: 'Test Institution',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    description: 'Test description',
    website: 'https://test.com',
    geographicZones: ['Dakar'],
    logoUrl: null,
    status: 'ACTIVE',
  };

  const mockPrismaService = {
    id: 'test-id',
    name: 'Service de Crédit',
    longName: 'Service de Crédit à la Consommation',
    type: 'CREDIT',
    frais: {
      ouverture: 5000,
      gestion: 1000,
      commission: 2.5,
    },
    conditionAccess: ['Age minimum 18 ans', 'Revenus réguliers'],
    plafonds: ['Minimum 100 000 FCFA', 'Maximum 5 000 000 FCFA'],
    infrastructureAccess: ['Agences', 'Mobile Banking', 'Internet Banking'],
    institutionId: 'institution-id',
    institution: mockInstitution,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    repository = new PrismaServiceRepository(mockPrisma);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return product when found', async () => {
      (mockPrisma.service.findUnique as jest.Mock).mockResolvedValue(mockPrismaService);

      const result = await repository.findById('test-id');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('test-id');
      expect(result?.name).toBe('Service de Crédit');
      expect(result?.longName).toBe('Service de Crédit à la Consommation');
      expect(result?.type).toBe(TypeService.CREDIT); // Valeur du domaine attendue
      expect(result?.institutionId).toBe('institution-id');
      expect(mockPrisma.service.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: {
          institution: true,
        },
      });
    });

    it('should return null when product not found', async () => {
      (mockPrisma.service.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      (mockPrisma.service.findUnique as jest.Mock).mockRejectedValue(dbError);

      await expect(repository.findById('test-id')).rejects.toThrow('Database connection failed');
    });
  });

  describe('findAll', () => {
    it('should build correct where clause for filters', async () => {
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([mockPrismaService]);

      const filters = {
        type: TypeService.CREDIT,
        name: 'Service de Crédit',
        institutionId: 'institution-id',
      };

      const result = await repository.findAll(filters);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(mockPrisma.service.findMany).toHaveBeenCalledWith({
        where: {
          type: PrismaTypeService.CREDIT, // Valeur Prisma attendue
          name: {
            contains: 'Service de Crédit',
            mode: 'insensitive',
          },
          institutionId: 'institution-id',
        },
        include: {
          institution: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle empty filters', async () => {
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([mockPrismaService]);

      const result = await repository.findAll({});

      expect(Array.isArray(result)).toBe(true);
      expect(mockPrisma.service.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          institution: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should throw if findMany fails', async () => {
      (mockPrisma.service.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(repository.findAll({})).rejects.toThrow('Database error');
    });
  });

  describe('findByType', () => {
    it('should return products of the given type', async () => {
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([mockPrismaService]);

      const result = await repository.findByType(TypeService.CREDIT);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe(TypeService.CREDIT); // Valeur du domaine attendue
      expect(mockPrisma.service.findMany).toHaveBeenCalledWith({
        where: { type: PrismaTypeService.CREDIT }, // Valeur Prisma attendue
        include: {
          institution: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle empty results', async () => {
      (mockPrisma.service.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.findByType(TypeService.EPARGNE);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should throw if findMany fails', async () => {
      (mockPrisma.service.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(repository.findByType(TypeService.CREDIT)).rejects.toThrow('Database error');
    });
  });
});
