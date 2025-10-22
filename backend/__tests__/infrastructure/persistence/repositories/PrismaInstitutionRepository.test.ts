import { PrismaInstitutionRepository } from '@/infrastructure/persistence/repositories/PrismaInstitutionRepository';
import { Institution, InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import type { PrismaClient, Institution as PrismaInstitution } from '@prisma/client';
import { randomUUID } from 'crypto';
import {
  Frais,
  FraisFixes,
  FraisGratuit,
  FraisPourcentage,
  TypeCalculation,
} from '@/domain/institutions/entities/Frais';
import { Service, TypeService } from '@/domain/institutions/entities/Service';
import type { FraisDTO } from '@/domain/institutions/value-objects/FraisDTO';

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

      const prismaInstitution: any = {
        id: testUuid1,
        name: 'Test Institution',
        description: 'Test Description',
        website: 'https://test.com',
        geographicZones: ['EURO', 'USD'],
        logoUrl: 'https://test.com/logo.png',
        status: 'PENDING' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [],
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
        include: {
          services: true,
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
        include: {
          services: true,
        },
      });

      expect(result.website.getValue()).toBeNull();
      expect(result.logoUrl.getValue()).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find an institution by id', async () => {
      const prismaInstitution: any = {
        id: testUuid1,
        name: 'Test Institution',
        description: 'Test Description',
        website: 'https://test.com',
        geographicZones: ['EURO'],
        logoUrl: 'https://test.com/logo.png',
        status: 'ACTIVE' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [],
      };

      (mockPrisma.institution.findUnique as jest.Mock).mockResolvedValue(prismaInstitution);

      const result = await repository.findById(testUuid1);

      expect(mockPrisma.institution.findUnique).toHaveBeenCalledWith({
        where: { id: testUuid1 },
        include: {
          services: true,
        },
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
        include: {
          services: true,
        },
      });

      expect(result).toBeNull();
    });

    it('should handle institutions with null website and logoUrl', async () => {
      const prismaInstitution: any = {
        id: testUuid3,
        name: 'Test Institution 3',
        description: 'Test Description 3',
        website: null,
        geographicZones: ['USD'],
        logoUrl: null,
        status: 'INACTIVE' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [],
      };

      (mockPrisma.institution.findUnique as jest.Mock).mockResolvedValue(prismaInstitution);

      const result = await repository.findById(testUuid3);

      expect(result?.website.getValue()).toBeNull();
      expect(result?.logoUrl.getValue()).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should find institutions by name', async () => {
      const prismaInstitutions: any[] = [
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
          services: [],
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
          services: [],
        },
      ];

      (mockPrisma.institution.findMany as jest.Mock).mockResolvedValue(prismaInstitutions);

      const result = await repository.findByName('Test Bank');

      expect(mockPrisma.institution.findMany).toHaveBeenCalledWith({
        where: { name: 'Test Bank' },
        include: {
          services: true,
        },
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
        include: {
          services: true,
        },
      });

      expect(result).toEqual([]);
    });

    it('should handle institutions with different statuses', async () => {
      const prismaInstitutions: any[] = [
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
          services: [],
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
          services: [],
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
          services: [],
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

      const prismaInstitution: any = {
        id: testUuid1,
        name: 'Updated Name',
        description: 'Updated Description',
        website: 'https://updated.com',
        geographicZones: ['CEMAC'],
        logoUrl: 'https://updated.com/logo.png',
        status: 'ACTIVE' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [],
      };
      (mockPrisma.institution.findUnique as jest.Mock).mockResolvedValue(prismaInstitution);
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
          services: {
            create: [],
          },
        },
        include: {
          services: true,
        },
      });

      expect(result).toBeInstanceOf(Institution);
      expect(result.name).toBe('Updated Name');
    });

    it('should not create new services if they already exist', async () => {
      const serviceId = randomUUID();
      const service = new Service({
        id: EntityId.from(serviceId),
        name: 'Existing Service',
        longName: 'Existing Service Long Name',
        type: TypeService.AUTRES,
        frais: new FraisGratuit(),
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      });

      const institution = new Institution({
        id: EntityId.from(testUuid1),
        name: 'Updated Name',
        description: 'Updated Description',
        website: UrlValueObject.from(null),
        geographicZones: ['CEMAC'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [service],
      });

      const existingPrismaService = {
        id: serviceId,
        name: 'Existing Service',
        longName: 'Existing Service Long Name',
        type: 'AUTRES',
        frais: { type: 'FREE' },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
        institutionId: testUuid1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const existingInstitution: any = {
        id: testUuid1,
        name: 'Old Name',
        description: 'Old Description',
        website: null,
        geographicZones: ['UEMOA'],
        logoUrl: null,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [existingPrismaService],
      };

      const updatedInstitution: any = { ...existingInstitution, name: 'Updated Name' };

      (mockPrisma.institution.findUnique as jest.Mock).mockResolvedValue(existingInstitution);
      (mockPrisma.institution.update as jest.Mock).mockResolvedValue(updatedInstitution);

      await repository.update(institution);

      expect(mockPrisma.institution.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            services: {
              create: [], // Should be empty
            },
          }),
        })
      );
    });

    it('should throw an error when updating a non-existent institution', async () => {
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

      (mockPrisma.institution.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.institution.update as jest.Mock).mockRejectedValue(
        new Error('Institution not found')
      );

      await expect(repository.update(institution)).rejects.toThrow('Institution not found');
    });
  });

  describe('findAll', () => {
    it('should return paginated institutions', async () => {
      const prismaInstitutions: any[] = [
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
          services: [],
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
          services: [],
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

  describe('services mapping', () => {
    it('should save institution with FraisFixes service', async () => {
      const serviceId = randomUUID();
      const _service = new Service({
        id: EntityId.from(serviceId),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.PAIEMENT_MARCHAND,
        frais: new FraisFixes(100, 0.02, 50),
        conditionAccess: ['Condition 1'],
        plafonds: ['Plafond 1'],
        infrastructureAccess: ['Infra 1'],
      });

      const institution = new Institution({
        id: EntityId.from(testUuid1),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from('https://test.com'),
        geographicZones: ['EURO'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.PENDING,
        services: [],
      });

      const prismaInstitution: any = {
        id: testUuid1,
        name: 'Test Institution',
        description: 'Test Description',
        website: 'https://test.com',
        geographicZones: ['EURO'],
        logoUrl: null,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [
          {
            id: serviceId,
            name: 'Test Service',
            longName: 'Test Service Long Name',
            type: 'PAIEMENT_MARCHAND',
            frais: { type: 'FIX', amount: 100, rate: 0.02, fxSurcharge: 50 },
            conditionAccess: ['Condition 1'],
            plafonds: ['Plafond 1'],
            infrastructureAccess: ['Infra 1'],
            institutionId: testUuid1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      (mockPrisma.institution.create as jest.Mock).mockResolvedValue(prismaInstitution);

      const result = await repository.save(institution);

      expect(result.services).toHaveLength(1);
      expect(result.services[0].name).toBe('Test Service');
      expect(result.services[0].frais).toBeInstanceOf(FraisFixes);
    });

    it('should save institution with FraisPourcentage service', async () => {
      const serviceId = randomUUID();

      const institution = new Institution({
        id: EntityId.from(testUuid1),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from(null),
        geographicZones: ['EURO'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      const prismaInstitution: any = {
        id: testUuid1,
        name: 'Test Institution',
        description: 'Test Description',
        website: null,
        geographicZones: ['EURO'],
        logoUrl: null,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [
          {
            id: serviceId,
            name: 'Test Service',
            longName: 'Test Service Long Name',
            type: 'EPARGNE',
            frais: { type: 'POURCENTAGE', rate: 0.02, cap: 500, floor: 50 },
            conditionAccess: [],
            plafonds: [],
            infrastructureAccess: [],
            institutionId: testUuid1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      (mockPrisma.institution.create as jest.Mock).mockResolvedValue(prismaInstitution);

      const result = await repository.save(institution);

      expect(result.services).toHaveLength(1);
      expect(result.services[0].frais).toBeInstanceOf(FraisPourcentage);
      expect(result.services[0].type).toBe(TypeService.EPARGNE);
    });

    it('should save institution with FraisGratuit service', async () => {
      const serviceId = randomUUID();

      const institution = new Institution({
        id: EntityId.from(testUuid1),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from(null),
        geographicZones: ['EURO'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      const prismaInstitution: any = {
        id: testUuid1,
        name: 'Test Institution',
        description: 'Test Description',
        website: null,
        geographicZones: ['EURO'],
        logoUrl: null,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [
          {
            id: serviceId,
            name: 'Free Service',
            longName: 'Free Service Long Name',
            type: 'CREDIT',
            frais: { type: 'FREE' },
            conditionAccess: [],
            plafonds: [],
            infrastructureAccess: [],
            institutionId: testUuid1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      (mockPrisma.institution.create as jest.Mock).mockResolvedValue(prismaInstitution);

      const result = await repository.save(institution);

      expect(result.services).toHaveLength(1);
      expect(result.services[0].frais).toBeInstanceOf(FraisGratuit);
      expect(result.services[0].type).toBe(TypeService.CREDIT);
    });

    it('should handle service with null/undefined frais', async () => {
      const serviceId = randomUUID();

      const institution = new Institution({
        id: EntityId.from(testUuid1),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from(null),
        geographicZones: ['EURO'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      const prismaInstitution: any = {
        id: testUuid1,
        name: 'Test Institution',
        description: 'Test Description',
        website: null,
        geographicZones: ['EURO'],
        logoUrl: null,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [
          {
            id: serviceId,
            name: 'Service',
            longName: 'Service Long Name',
            type: 'AUTRES',
            frais: null,
            conditionAccess: [],
            plafonds: [],
            infrastructureAccess: [],
            institutionId: testUuid1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      (mockPrisma.institution.create as jest.Mock).mockResolvedValue(prismaInstitution);

      const result = await repository.save(institution);

      expect(result.services[0].frais).toBeInstanceOf(FraisGratuit);
    });

    it('should update institution with new services', async () => {
      const serviceId = randomUUID();
      const service = new Service({
        id: EntityId.from(serviceId),
        name: 'New Service',
        longName: 'New Service Long Name',
        type: TypeService.TRANSFERT_ARGENT,
        frais: new FraisFixes(150),
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      });

      const institution = new Institution({
        id: EntityId.from(testUuid1),
        name: 'Updated Name',
        description: 'Updated Description',
        website: UrlValueObject.from(null),
        geographicZones: ['CEMAC'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [service],
      });

      const existingInstitution: any = {
        id: testUuid1,
        name: 'Old Name',
        description: 'Old Description',
        website: null,
        geographicZones: ['UEMOA'],
        logoUrl: null,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [],
      };

      const updatedInstitution: any = {
        id: testUuid1,
        name: 'Updated Name',
        description: 'Updated Description',
        website: null,
        geographicZones: ['CEMAC'],
        logoUrl: null,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [
          {
            id: serviceId,
            name: 'New Service',
            longName: 'New Service Long Name',
            type: 'TRANSFERT_ARGENT',
            frais: { type: 'FIX', amount: 150 },
            conditionAccess: [],
            plafonds: [],
            infrastructureAccess: [],
            institutionId: testUuid1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      (mockPrisma.institution.findUnique as jest.Mock).mockResolvedValue(existingInstitution);
      (mockPrisma.institution.update as jest.Mock).mockResolvedValue(updatedInstitution);

      const result = await repository.update(institution);

      expect(mockPrisma.institution.findUnique).toHaveBeenCalledWith({
        where: { id: testUuid1 },
        include: { services: true },
      });

      expect(mockPrisma.institution.update).toHaveBeenCalledWith({
        where: { id: testUuid1 },
        data: expect.objectContaining({
          name: 'Updated Name',
          services: {
            create: expect.arrayContaining([
              expect.objectContaining({
                id: serviceId,
                name: 'New Service',
                type: 'TRANSFERT_ARGENT',
              }),
            ]),
          },
        }),
        include: { services: true },
      });

      expect(result.services).toHaveLength(1);
      expect(result.services[0].name).toBe('New Service');
    });

    it('should map all TypeService values correctly from Prisma to Domain', async () => {
      const serviceTypeMapping: Record<string, string> = {
        [TypeService.PAIEMENT_MARCHAND]: 'PAIEMENT_MARCHAND',
        [TypeService.ACHAT_CREDIT]: 'ACHAT_CREDIT',
        [TypeService.PAIEMENT_FACTURES]: 'PAIEMENT_FACTURES',
        [TypeService.DEPOT_SIMPLE]: 'DEPOT_SIMPLE',
        [TypeService.DEPOT_RETRAIT_SIMPLE]: 'DEPOT_RETRAIT_SIMPLE',
        [TypeService.RETRAIT_SIMPLE]: 'RETRAIT_SIMPLE',
        [TypeService.TRANSFERT_ARGENT]: 'TRANSFERT_ARGENT',
        [TypeService.BANQUE_WALLET]: 'BANQUE_WALLET',
        [TypeService.WALLET_BANQUE]: 'WALLET_BANQUE',
        [TypeService.EPARGNE]: 'EPARGNE',
        [TypeService.CREDIT]: 'CREDIT',
        [TypeService.ASSURANCE]: 'ASSURANCE',
        [TypeService.AUTRES]: 'AUTRES',
      };

      const serviceTypes = Object.keys(TypeService) as (keyof typeof TypeService)[];

      for (const serviceTypeKey of serviceTypes) {
        const serviceType = TypeService[serviceTypeKey];
        const serviceId = randomUUID();
        const institution = new Institution({
          id: EntityId.from(testUuid1),
          name: 'Test',
          description: 'Test',
          website: UrlValueObject.from(null),
          geographicZones: [],
          logoUrl: UrlValueObject.from(null),
          status: InstitutionStatus.ACTIVE,
          services: [],
        });

        const prismaInstitution: any = {
          id: testUuid1,
          name: 'Test',
          description: 'Test',
          website: null,
          geographicZones: [],
          logoUrl: null,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
          services: [
            {
              id: serviceId,
              name: 'Service',
              longName: 'Service Long',
              type: serviceTypeMapping[serviceType],
              frais: { type: 'FREE' },
              conditionAccess: [],
              plafonds: [],
              infrastructureAccess: [],
              institutionId: testUuid1,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        };

        (mockPrisma.institution.create as jest.Mock).mockResolvedValue(prismaInstitution);

        const result = await repository.save(institution);

        expect(result.services[0].type).toBe(serviceType);
      }
    });

    it('should handle FraisFixes without rate and fxSurcharge', async () => {
      const serviceId = randomUUID();
      const institution = new Institution({
        id: EntityId.from(testUuid1),
        name: 'Test',
        description: 'Test',
        website: UrlValueObject.from(null),
        geographicZones: [],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      const prismaInstitution: any = {
        id: testUuid1,
        name: 'Test',
        description: 'Test',
        website: null,
        geographicZones: [],
        logoUrl: null,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [
          {
            id: serviceId,
            name: 'Service',
            longName: 'Service Long',
            type: 'PAIEMENT_MARCHAND',
            frais: { type: 'FIX', amount: 100 },
            conditionAccess: [],
            plafonds: [],
            infrastructureAccess: [],
            institutionId: testUuid1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      (mockPrisma.institution.create as jest.Mock).mockResolvedValue(prismaInstitution);

      const result = await repository.save(institution);

      expect(result.services[0].frais).toBeInstanceOf(FraisFixes);
      expect((result.services[0].frais as any).amount).toBe(100);
    });

    it('should handle FraisPourcentage without cap and floor', async () => {
      const serviceId = randomUUID();
      const institution = new Institution({
        id: EntityId.from(testUuid1),
        name: 'Test',
        description: 'Test',
        website: UrlValueObject.from(null),
        geographicZones: [],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      const prismaInstitution: any = {
        id: testUuid1,
        name: 'Test',
        description: 'Test',
        website: null,
        geographicZones: [],
        logoUrl: null,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [
          {
            id: serviceId,
            name: 'Service',
            longName: 'Service Long',
            type: 'EPARGNE',
            frais: { type: 'POURCENTAGE', rate: 0.015 },
            conditionAccess: [],
            plafonds: [],
            infrastructureAccess: [],
            institutionId: testUuid1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      (mockPrisma.institution.create as jest.Mock).mockResolvedValue(prismaInstitution);

      const result = await repository.save(institution);

      expect(result.services[0].frais).toBeInstanceOf(FraisPourcentage);
      expect((result.services[0].frais as any).rate).toBe(0.015);
    });

    it('should update institution with FraisGratuit service', async () => {
      const serviceId = randomUUID();
      const service = new Service({
        id: EntityId.from(serviceId),
        name: 'Free Service',
        longName: 'Free Service Long Name',
        type: TypeService.AUTRES,
        frais: new FraisGratuit(),
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      });

      const institution = new Institution({
        id: EntityId.from(testUuid1),
        name: 'Test',
        description: 'Test',
        website: UrlValueObject.from(null),
        geographicZones: [],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [service],
      });

      const existingInstitution: any = {
        id: testUuid1,
        name: 'Test',
        description: 'Test',
        website: null,
        geographicZones: [],
        logoUrl: null,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [],
      };

      const updatedInstitution: any = {
        id: testUuid1,
        name: 'Test',
        description: 'Test',
        website: null,
        geographicZones: [],
        logoUrl: null,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [
          {
            id: serviceId,
            name: 'Free Service',
            longName: 'Free Service Long Name',
            type: 'AUTRES',
            frais: { type: 'FREE' },
            conditionAccess: [],
            plafonds: [],
            infrastructureAccess: [],
            institutionId: testUuid1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      (mockPrisma.institution.findUnique as jest.Mock).mockResolvedValue(existingInstitution);
      (mockPrisma.institution.update as jest.Mock).mockResolvedValue(updatedInstitution);

      const result = await repository.update(institution);

      expect(result.services).toHaveLength(1);
      expect(result.services[0].frais).toBeInstanceOf(FraisGratuit);
    });

    it('should update institution with FraisPourcentage service', async () => {
      const serviceId = randomUUID();
      const service = new Service({
        id: EntityId.from(serviceId),
        name: 'Percent Service',
        longName: 'Percent Service Long Name',
        type: TypeService.EPARGNE,
        frais: new FraisPourcentage(0.03, 1000, 100),
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      });

      const institution = new Institution({
        id: EntityId.from(testUuid1),
        name: 'Test',
        description: 'Test',
        website: UrlValueObject.from(null),
        geographicZones: [],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [service],
      });

      const existingInstitution: any = {
        id: testUuid1,
        name: 'Test',
        description: 'Test',
        website: null,
        geographicZones: [],
        logoUrl: null,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [],
      };

      const updatedInstitution: any = {
        id: testUuid1,
        name: 'Test',
        description: 'Test',
        website: null,
        geographicZones: [],
        logoUrl: null,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [
          {
            id: serviceId,
            name: 'Percent Service',
            longName: 'Percent Service Long Name',
            type: 'EPARGNE',
            frais: { type: 'POURCENTAGE', rate: 0.03, cap: 1000, floor: 100 },
            conditionAccess: [],
            plafonds: [],
            infrastructureAccess: [],
            institutionId: testUuid1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      (mockPrisma.institution.findUnique as jest.Mock).mockResolvedValue(existingInstitution);
      (mockPrisma.institution.update as jest.Mock).mockResolvedValue(updatedInstitution);

      const result = await repository.update(institution);

      expect(result.services).toHaveLength(1);
      expect(result.services[0].frais).toBeInstanceOf(FraisPourcentage);
    });

    it('should handle invalid FraisData types', async () => {
      const serviceId = randomUUID();
      const institution = new Institution({
        id: EntityId.from(testUuid1),
        name: 'Test',
        description: 'Test',
        website: UrlValueObject.from(null),
        geographicZones: [],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      // Test with FIX type but no amount
      const prismaInstitution1: any = {
        id: testUuid1,
        name: 'Test',
        description: 'Test',
        website: null,
        geographicZones: [],
        logoUrl: null,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [
          {
            id: serviceId,
            name: 'Service',
            longName: 'Service Long',
            type: 'AUTRES',
            frais: { type: 'FIX' }, // Missing amount
            conditionAccess: [],
            plafonds: [],
            infrastructureAccess: [],
            institutionId: testUuid1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      (mockPrisma.institution.create as jest.Mock).mockResolvedValue(prismaInstitution1);

      const result1 = await repository.save(institution);
      expect(result1.services[0].frais).toBeInstanceOf(FraisGratuit);

      // Test with POURCENTAGE type but no rate
      const prismaInstitution2: any = {
        ...prismaInstitution1,
        services: [
          {
            ...prismaInstitution1.services[0],
            frais: { type: 'POURCENTAGE' }, // Missing rate
          },
        ],
      };

      (mockPrisma.institution.create as jest.Mock).mockResolvedValue(prismaInstitution2);

      const result2 = await repository.save(institution);
      expect(result2.services[0].frais).toBeInstanceOf(FraisGratuit);
    });

    it('should handle unknown prisma service type and default to AUTRES', async () => {
      const serviceId = randomUUID();
      const prismaInstitution: any = {
        id: testUuid1,
        name: 'Test Institution',
        description: 'Test Description',
        website: 'https://test.com',
        geographicZones: ['EURO'],
        logoUrl: null,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [
          {
            id: serviceId,
            name: 'Unknown Service',
            longName: 'Unknown Service Long Name',
            type: 'UNKNOWN_TYPE',
            frais: { type: 'FREE' },
            conditionAccess: [],
            plafonds: [],
            infrastructureAccess: [],
            institutionId: testUuid1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      (mockPrisma.institution.findUnique as jest.Mock).mockResolvedValue(prismaInstitution);
      const result = await repository.findById(testUuid1);
      expect(result).not.toBeNull();
      expect(result!.services[0].type).toBe(TypeService.AUTRES);
    });

    it('should handle unknown domain service type and default to AUTRES', async () => {
      const serviceId = randomUUID();
      const service = new Service({
        id: EntityId.from(serviceId),
        name: 'New Service',
        longName: 'New Service Long Name',
        type: 'UNKNOWN_TYPE' as TypeService, // Force unknown type
        frais: new FraisGratuit(),
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      });

      const institution = new Institution({
        id: EntityId.from(testUuid1),
        name: 'Updated Name',
        description: 'Updated Description',
        website: UrlValueObject.from(null),
        geographicZones: ['CEMAC'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [service],
      });

      const mockPrismaInstitution: any = {
        id: testUuid1,
        name: 'Updated Name',
        description: 'Updated Description',
        website: null,
        geographicZones: ['CEMAC'],
        logoUrl: null,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [],
      };

      (mockPrisma.institution.findUnique as jest.Mock).mockResolvedValue(mockPrismaInstitution);
      (mockPrisma.institution.update as jest.Mock).mockResolvedValue(mockPrismaInstitution);

      await repository.update(institution);

      expect(mockPrisma.institution.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            services: {
              create: expect.arrayContaining([expect.objectContaining({ type: 'AUTRES' })]),
            },
          }),
        })
      );
    });

    // Remplacez ce test dans votre fichier de test existant (ligne ~827)

    it('should handle unknown Frais type and default to FREE', async () => {
      class UnknownFrais extends Frais {
        readonly _typeCalculation = TypeCalculation.FREE;

        describe(): string {
          return 'Unknown frais';
        }

        toDTO(): FraisDTO {
          return {
            typeCalculation: this._typeCalculation,
          };
        }
      }

      const serviceId = randomUUID();
      const service = new Service({
        id: EntityId.from(serviceId),
        name: 'New Service',
        longName: 'New Service Long Name',
        type: TypeService.AUTRES,
        frais: new UnknownFrais(),
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      });

      const institution = new Institution({
        id: EntityId.from(testUuid1),
        name: 'Updated Name',
        description: 'Updated Description',
        website: UrlValueObject.from(null),
        geographicZones: ['CEMAC'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [service],
      });

      const mockPrismaInstitution: any = {
        id: testUuid1,
        name: 'Updated Name',
        description: 'Updated Description',
        website: null,
        geographicZones: ['CEMAC'],
        logoUrl: null,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [],
      };

      (mockPrisma.institution.findUnique as jest.Mock).mockResolvedValue(mockPrismaInstitution);
      (mockPrisma.institution.update as jest.Mock).mockResolvedValue(mockPrismaInstitution);

      await repository.update(institution);

      expect(mockPrisma.institution.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            services: {
              create: expect.arrayContaining([
                expect.objectContaining({ frais: { type: 'FREE' } }),
              ]),
            },
          }),
        })
      );
    });
  });
});
