import { PrismaInstitutionRepository } from '@/infrastructure/persistence/repositories/PrismaInstitutionRepository';
import { Institution, InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import type { PrismaClient, Institution as PrismaInstitution } from '@prisma/client';
import { randomUUID } from 'crypto';

describe('PrismaInstitutionRepository', () => {
  let repository: PrismaInstitutionRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let testUuid1: string;
  let testUuid2: string;
  let testUuid3: string;

  beforeEach(() => {
    testUuid1 = randomUUID();
    testUuid2 = randomUUID();
    testUuid3 = randomUUID();

    mockPrisma = {
      institution: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    } as any;

    repository = new PrismaInstitutionRepository(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save an institution successfully', async () => {
      const institution = new Institution({
        id: EntityId.from(testUuid1),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from('https://test.com'),
        geographicZones: ['EURO', 'USD'],
        logoUrl: UrlValueObject.from('https://test.com/logo.png'),
        status: InstitutionStatus.PENDING,
        services: [],
      });

      const prismaInstitution: PrismaInstitution = {
        id: testUuid1,
        name: 'Test Institution',
        description: 'Test Description',
        website: 'https://test.com',
        geographicZones: ['EURO', 'USD'],
        logoUrl: 'https://test.com/logo.png',
        status: 'PENDING' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.institution.create as jest.Mock).mockResolvedValue(prismaInstitution);

      const result = await repository.save(institution);

      expect(mockPrisma.institution.create).toHaveBeenCalledWith({
        data: {
          id: testUuid1,
          name: 'Test Institution',
          description: 'Test Description',
          website: 'https://test.com',
          geographicZones: ['EURO', 'USD'],
          logoUrl: 'https://test.com/logo.png',
          status: 'PENDING',
        },
      });

      expect(result).toBeInstanceOf(Institution);
      expect(result.id.getValue()).toBe(testUuid1);
      expect(result.name).toBe('Test Institution');
    });

    it('should save an institution with null website and logoUrl', async () => {
      const institution = new Institution({
        id: EntityId.from(testUuid2),
        name: 'Test Institution 2',
        description: 'Test Description 2',
        website: UrlValueObject.from(null),
        geographicZones: ['USD'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      const prismaInstitution: PrismaInstitution = {
        id: testUuid2,
        name: 'Test Institution 2',
        description: 'Test Description 2',
        website: null,
        geographicZones: ['USD'],
        logoUrl: null,
        status: 'ACTIVE' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.institution.create as jest.Mock).mockResolvedValue(prismaInstitution);

      const result = await repository.save(institution);

      expect(mockPrisma.institution.create).toHaveBeenCalledWith({
        data: {
          id: testUuid2,
          name: 'Test Institution 2',
          description: 'Test Description 2',
          website: null,
          geographicZones: ['USD'],
          logoUrl: null,
          status: 'ACTIVE',
        },
      });

      expect(result.website.getValue()).toBeNull();
      expect(result.logoUrl.getValue()).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find an institution by id', async () => {
      const prismaInstitution: PrismaInstitution = {
        id: testUuid1,
        name: 'Test Institution',
        description: 'Test Description',
        website: 'https://test.com',
        geographicZones: ['EURO'],
        logoUrl: 'https://test.com/logo.png',
        status: 'ACTIVE' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.institution.findUnique as jest.Mock).mockResolvedValue(prismaInstitution);

      const result = await repository.findById(testUuid1);

      expect(mockPrisma.institution.findUnique).toHaveBeenCalledWith({
        where: { id: testUuid1 },
      });

      expect(result).toBeInstanceOf(Institution);
      expect(result?.id.getValue()).toBe(testUuid1);
      expect(result?.name).toBe('Test Institution');
    });

    it('should return null when institution is not found', async () => {
      const nonExistentId = randomUUID();
      (mockPrisma.institution.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById(nonExistentId);

      expect(mockPrisma.institution.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistentId },
      });

      expect(result).toBeNull();
    });

    it('should handle institutions with null website and logoUrl', async () => {
      const prismaInstitution: PrismaInstitution = {
        id: testUuid3,
        name: 'Test Institution 3',
        description: 'Test Description 3',
        website: null,
        geographicZones: ['USD'],
        logoUrl: null,
        status: 'INACTIVE' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.institution.findUnique as jest.Mock).mockResolvedValue(prismaInstitution);

      const result = await repository.findById(testUuid3);

      expect(result?.website.getValue()).toBeNull();
      expect(result?.logoUrl.getValue()).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should find institutions by name', async () => {
      const prismaInstitutions: PrismaInstitution[] = [
        {
          id: testUuid1,
          name: 'Test Bank',
          description: 'Description 1',
          website: 'https://test1.com',
          geographicZones: ['EURO'],
          logoUrl: 'https://test1.com/logo.png',
          status: 'ACTIVE' as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: testUuid2,
          name: 'Test Bank',
          description: 'Description 2',
          website: 'https://test2.com',
          geographicZones: ['USD'],
          logoUrl: null,
          status: 'PENDING' as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPrisma.institution.findMany as jest.Mock).mockResolvedValue(prismaInstitutions);

      const result = await repository.findByName('Test Bank');

      expect(mockPrisma.institution.findMany).toHaveBeenCalledWith({
        where: { name: 'Test Bank' },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Institution);
      expect(result[1]).toBeInstanceOf(Institution);
      expect(result[0].id.getValue()).toBe(testUuid1);
      expect(result[1].id.getValue()).toBe(testUuid2);
    });

    it('should return empty array when no institutions found', async () => {
      (mockPrisma.institution.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.findByName('Nonexistent Bank');

      expect(mockPrisma.institution.findMany).toHaveBeenCalledWith({
        where: { name: 'Nonexistent Bank' },
      });

      expect(result).toEqual([]);
    });

    it('should handle institutions with different statuses', async () => {
      const prismaInstitutions: PrismaInstitution[] = [
        {
          id: testUuid1,
          name: 'Bank',
          description: 'Description 1',
          website: null,
          geographicZones: ['EURO'],
          logoUrl: null,
          status: 'ACTIVE' as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: testUuid2,
          name: 'Bank',
          description: 'Description 2',
          website: null,
          geographicZones: ['USD'],
          logoUrl: null,
          status: 'PENDING' as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: testUuid3,
          name: 'Bank',
          description: 'Description 3',
          website: null,
          geographicZones: ['GBP'],
          logoUrl: null,
          status: 'INACTIVE' as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPrisma.institution.findMany as jest.Mock).mockResolvedValue(prismaInstitutions);

      const result = await repository.findByName('Bank');

      expect(result).toHaveLength(3);
      expect(result[0].status).toBe(InstitutionStatus.ACTIVE);
      expect(result[1].status).toBe(InstitutionStatus.PENDING);
      expect(result[2].status).toBe(InstitutionStatus.INACTIVE);
    });
  });

  describe('update', () => {
    it('should update an institution successfully', async () => {
      const institution = new Institution({
        id: EntityId.from(testUuid1),
        name: 'Updated Name',
        description: 'Updated Description',
        website: UrlValueObject.from('https://updated.com'),
        geographicZones: ['CEMAC'],
        logoUrl: UrlValueObject.from('https://updated.com/logo.png'),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      const prismaInstitution: PrismaInstitution = {
        id: testUuid1,
        name: 'Updated Name',
        description: 'Updated Description',
        website: 'https://updated.com',
        geographicZones: ['CEMAC'],
        logoUrl: 'https://updated.com/logo.png',
        status: 'ACTIVE' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.institution.update as jest.Mock).mockResolvedValue(prismaInstitution);

      const result = await repository.update(institution);

      expect(mockPrisma.institution.update).toHaveBeenCalledWith({
        where: { id: testUuid1 },
        data: {
          id: testUuid1,
          name: 'Updated Name',
          description: 'Updated Description',
          website: 'https://updated.com',
          geographicZones: ['CEMAC'],
          logoUrl: 'https://updated.com/logo.png',
          status: 'ACTIVE',
        },
      });

      expect(result).toBeInstanceOf(Institution);
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('findAll', () => {
    it('should return paginated institutions', async () => {
      const prismaInstitutions: PrismaInstitution[] = [
        {
          id: randomUUID(),
          name: 'Bank 1',
          description: 'Desc 1',
          website: null,
          geographicZones: [],
          logoUrl: null,
          status: 'ACTIVE' as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: randomUUID(),
          name: 'Bank 2',
          description: 'Desc 2',
          website: null,
          geographicZones: [],
          logoUrl: null,
          status: 'PENDING' as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPrisma.institution.findMany as jest.Mock).mockResolvedValue(prismaInstitutions);
      (mockPrisma.institution.count as jest.Mock).mockResolvedValue(5);

      const result = await repository.findAll({ page: 2, limit: 2 });

      expect(mockPrisma.institution.findMany).toHaveBeenCalledWith({
        skip: 2,
        take: 2,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrisma.institution.count).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({ page: 2, limit: 2, total: 5, totalPages: 3 });
    });
  });
});
