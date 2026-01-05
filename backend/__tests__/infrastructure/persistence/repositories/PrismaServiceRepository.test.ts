import { Service, TypeService } from '@/domain/institutions/entities/Service';
import { FraisGratuit, FraisFixes, FraisPourcentage } from '@/domain/institutions/entities/Frais';
import { EntityId } from '@/domain/shared/EntityId';
import type { PrismaClient } from '@prisma/client';
import { PrismaServiceRepository } from '@/infrastructure/persistence/repositories/PrismaServiceRepository';

// Mock de PrismaClient
const createMockPrisma = () => ({
  service: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
});

const VALID_SERVICE_ID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_INSTITUTION_ID = '550e8400-e29b-41d4-a716-446655440001';
const VALID_SERVICE_ID_2 = '550e8400-e29b-41d4-a716-446655440002';
const VALID_INSTITUTION_ID_2 = '550e8400-e29b-41d4-a716-446655440003';

describe('PrismaServiceRepository', () => {
  let repository: PrismaServiceRepository;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    repository = new PrismaServiceRepository(mockPrisma as unknown as PrismaClient);
  });

  describe('findById', () => {
    it('devrait retourner un service existant', async () => {
      const mockPrismaService = {
        id: VALID_SERVICE_ID,
        name: 'Transfert',
        longName: "Transfert d'argent national",
        type: 'TRANSFERT_ARGENT',
        montantMin: 100,
        montantMax: 1000000,
        frais: {
          type: 'FIX',
          amount: 500,
        },
        conditionAccess: ["Carte d'identité"],
        plafonds: ['1M par jour'],
        infrastructureAccess: ['Agence', 'Mobile'],
        createdAt: new Date(),
        updatedAt: new Date(),
        institutionId: VALID_INSTITUTION_ID,
      };

      mockPrisma.service.findUnique.mockResolvedValue(mockPrismaService);

      const result = await repository.findById(VALID_SERVICE_ID);

      expect(result).not.toBeNull();
      expect(result?.id.getValue()).toBe(VALID_SERVICE_ID);
      expect(result?.name).toBe('Transfert');
      expect(result?.type).toBe(TypeService.TRANSFERT_ARGENT);
      expect(mockPrisma.service.findUnique).toHaveBeenCalledWith({
        where: { id: VALID_SERVICE_ID },
      });
    });

    it("devrait retourner null si le service n'existe pas", async () => {
      mockPrisma.service.findUnique.mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByInstitutionId', () => {
    it("devrait retourner tous les services d'une institution", async () => {
      const mockServices = [
        {
          id: VALID_SERVICE_ID,
          name: 'Service 1',
          longName: 'Service 1 Long',
          type: 'DEPOT_SIMPLE',
          montantMin: 0,
          montantMax: 500000,
          frais: { type: 'FREE' },
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          institutionId: VALID_INSTITUTION_ID,
        },
        {
          id: VALID_SERVICE_ID_2,
          name: 'Service 2',
          longName: 'Service 2 Long',
          type: 'RETRAIT_SIMPLE',
          montantMin: 0,
          montantMax: 100000,
          frais: { type: 'POURCENTAGE', rate: 0.01, cap: 1000 },
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          institutionId: VALID_INSTITUTION_ID,
        },
      ];

      mockPrisma.service.findMany.mockResolvedValue(mockServices);

      const result = await repository.findByInstitutionId(VALID_INSTITUTION_ID);

      expect(result).toHaveLength(2);
      expect(result[0].id.getValue()).toBe(VALID_SERVICE_ID);
      expect(result[1].id.getValue()).toBe(VALID_SERVICE_ID_2);
      expect(mockPrisma.service.findMany).toHaveBeenCalledWith({
        where: { institutionId: VALID_INSTITUTION_ID },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('update', () => {
    it('devrait mettre à jour un service', async () => {
      const service = new Service({
        id: EntityId.from(VALID_SERVICE_ID),
        name: 'Transfert Modifié',
        longName: "Transfert d'argent modifié",
        type: TypeService.TRANSFERT_ARGENT,
        montantMin: 200,
        montantMax: 2000000,
        frais: new FraisFixes(1000),
        conditionAccess: ['Passeport'],
        plafonds: ['2M par jour'],
        infrastructureAccess: ['Mobile'],
      });

      const mockUpdated = {
        id: VALID_SERVICE_ID,
        name: 'Transfert Modifié',
        longName: "Transfert d'argent modifié",
        type: 'TRANSFERT_ARGENT',
        montantMin: 200,
        montantMax: 2000000,
        frais: { type: 'FIX', amount: 1000 },
        conditionAccess: ['Passeport'],
        plafonds: ['2M par jour'],
        infrastructureAccess: ['Mobile'],
        createdAt: new Date(),
        updatedAt: new Date(),
        institutionId: VALID_INSTITUTION_ID,
      };

      mockPrisma.service.update.mockResolvedValue(mockUpdated);

      const result = await repository.update(service);

      expect(result.name).toBe('Transfert Modifié');
      expect(result.montantMin).toBe(200);
      expect(mockPrisma.service.update).toHaveBeenCalledWith({
        where: { id: VALID_SERVICE_ID },
        data: expect.objectContaining({
          name: 'Transfert Modifié',
          montantMin: 200,
        }),
      });
    });
  });

  describe('delete', () => {
    it('devrait supprimer un service', async () => {
      mockPrisma.service.delete.mockResolvedValue({});

      await repository.delete(VALID_SERVICE_ID);

      expect(mockPrisma.service.delete).toHaveBeenCalledWith({
        where: { id: VALID_SERVICE_ID },
      });
    });
  });

  describe('findAll', () => {
    it('devrait retourner une liste paginée de services avec institutions', async () => {
      const mockServicesWithInstitution = [
        {
          id: VALID_SERVICE_ID,
          name: 'Service 1',
          longName: 'Service 1 Long',
          type: 'DEPOT_SIMPLE',
          montantMin: 0,
          montantMax: 500000,
          frais: { type: 'FREE' },
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          institutionId: VALID_INSTITUTION_ID,
          institution: {
            id: VALID_INSTITUTION_ID,
            name: 'Wave',
            logoUrl: 'https://example.com/wave.png',
            description: 'Service mobile money',
            website: 'https://wave.com',
            geographicZones: [],
            status: 'ACTIVE',
            type: 'MOBILE_MONEY',
            pays: 'SN',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      mockPrisma.service.findMany.mockResolvedValue(mockServicesWithInstitution);
      mockPrisma.service.count.mockResolvedValue(1);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].institution).toBeDefined();
      expect(result.data[0].institution?.name).toBe('Wave');
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
    });

    it('devrait filtrer par type de service', async () => {
      mockPrisma.service.findMany.mockResolvedValue([]);
      mockPrisma.service.count.mockResolvedValue(0);

      await repository.findAll({
        page: 1,
        limit: 10,
        type: TypeService.TRANSFERT_ARGENT,
      } as any);

      expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: 'TRANSFERT_ARGENT' },
        })
      );
    });
  });

  describe('findByName', () => {
    it('devrait rechercher des services par nom (insensible à la casse)', async () => {
      const mockServices = [
        {
          id: VALID_SERVICE_ID,
          name: 'Transfert Express',
          longName: 'Transfert Express International',
          type: 'TRANSFERT_ARGENT',
          montantMin: 0,
          montantMax: 5000000,
          frais: { type: 'FREE' },
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          institutionId: VALID_INSTITUTION_ID,
        },
      ];

      mockPrisma.service.findMany.mockResolvedValue(mockServices);

      const result = await repository.findByName('transfert');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Transfert Express');
      expect(mockPrisma.service.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'transfert',
            mode: 'insensitive',
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findForComparison', () => {
    it('devrait retourner des services avec leurs institutions pour comparaison', async () => {
      const mockServicesWithInstitution = [
        {
          id: VALID_SERVICE_ID,
          name: 'Transfert Wave',
          longName: 'Transfert Wave National',
          type: 'TRANSFERT_ARGENT',
          montantMin: 100,
          montantMax: 1000000,
          frais: { type: 'FIX', amount: 500 },
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          institutionId: VALID_INSTITUTION_ID,
          institution: {
            id: VALID_INSTITUTION_ID,
            name: 'Wave',
            logoUrl: 'https://example.com/wave.png',
            description: 'Service mobile',
            website: 'https://wave.com',
            geographicZones: [],
            status: 'ACTIVE',
            type: 'MOBILE_MONEY',
            pays: 'SN',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          id: VALID_SERVICE_ID_2,
          name: 'Transfert Orange Money',
          longName: 'Transfert Orange Money National',
          type: 'TRANSFERT_ARGENT',
          montantMin: 50,
          montantMax: 500000,
          frais: { type: 'POURCENTAGE', rate: 0.02, cap: 2000 },
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          institutionId: VALID_INSTITUTION_ID_2,
          institution: {
            id: VALID_INSTITUTION_ID_2,
            name: 'Orange Money',
            logoUrl: 'https://example.com/om.png',
            description: 'Service mobile',
            website: 'https://om.com',
            geographicZones: [],
            status: 'ACTIVE',
            type: 'MOBILE_MONEY',
            pays: 'SN',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      mockPrisma.service.findMany.mockResolvedValue(mockServicesWithInstitution);

      const result = await repository.findForComparison([VALID_SERVICE_ID, VALID_SERVICE_ID_2]);

      expect(result).toHaveLength(2);
      expect(result[0].institution?.name).toBe('Wave');
      expect(result[1].institution?.name).toBe('Orange Money');
      expect(mockPrisma.service.findMany).toHaveBeenCalledWith({
        where: { id: { in: [VALID_SERVICE_ID, VALID_SERVICE_ID_2] } },
        include: { institution: true },
      });
    });

    it("devrait retourner un tableau vide si aucun ID n'est fourni", async () => {
      const result = await repository.findForComparison([]);

      expect(result).toEqual([]);
      expect(mockPrisma.service.findMany).not.toHaveBeenCalled();
    });
  });

  describe('Mapping des frais', () => {
    it('devrait mapper FraisGratuit correctement', async () => {
      const mockService = {
        id: VALID_SERVICE_ID,
        name: 'Service Gratuit',
        longName: 'Service Gratuit Long',
        type: 'DEPOT_SIMPLE',
        montantMin: 0,
        montantMax: 100000,
        frais: { type: 'FREE' },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        institutionId: VALID_INSTITUTION_ID,
      };

      mockPrisma.service.findUnique.mockResolvedValue(mockService);

      const result = await repository.findById(VALID_SERVICE_ID);

      expect(result?.frais).toBeInstanceOf(FraisGratuit);
    });

    it('devrait mapper FraisFixes avec taux et frais de change', async () => {
      const mockService = {
        id: VALID_SERVICE_ID,
        name: 'Service Fixe',
        longName: 'Service Fixe Long',
        type: 'TRANSFERT_ARGENT',
        montantMin: 0,
        montantMax: 100000,
        frais: {
          type: 'FIX',
          amount: 500,
          rate: 0.01,
          fraisChange: {
            fxSurcharge: 2.5,
            devise: 'EUR',
          },
        },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        institutionId: VALID_INSTITUTION_ID,
      };

      mockPrisma.service.findUnique.mockResolvedValue(mockService);

      const result = await repository.findById(VALID_SERVICE_ID);

      expect(result?.frais).toBeInstanceOf(FraisFixes);
      const frais = result?.frais as FraisFixes;
      expect(frais.amount).toBe(500);
      expect(frais.rate).toBe(0.01);
      expect(frais.fraisChange).toEqual({
        fxSurcharge: 2.5,
        devise: 'EUR',
      });
    });

    it('devrait mapper FraisPourcentage avec cap et floor', async () => {
      const mockService = {
        id: VALID_SERVICE_ID,
        name: 'Service Pourcentage',
        longName: 'Service Pourcentage Long',
        type: 'RETRAIT_SIMPLE',
        montantMin: 0,
        montantMax: 100000,
        frais: {
          type: 'POURCENTAGE',
          rate: 0.015,
          cap: 5000,
          floor: 100,
        },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        institutionId: VALID_INSTITUTION_ID,
      };

      mockPrisma.service.findUnique.mockResolvedValue(mockService);

      const result = await repository.findById(VALID_SERVICE_ID);

      expect(result?.frais).toBeInstanceOf(FraisPourcentage);
      const frais = result?.frais as FraisPourcentage;
      expect(frais.rate).toBe(0.015);
      expect(frais.cap).toBe(5000);
      expect(frais.floor).toBe(100);
    });
  });

  describe('Mapping des types de service', () => {
    it('devrait mapper tous les types de service correctement', async () => {
      const typesMapping = [
        { prisma: 'PAIEMENT_MARCHAND', domain: TypeService.PAIEMENT_MARCHAND },
        { prisma: 'ACHAT_CREDIT', domain: TypeService.ACHAT_CREDIT },
        { prisma: 'TRANSFERT_ARGENT', domain: TypeService.TRANSFERT_ARGENT },
        { prisma: 'EPARGNE', domain: TypeService.EPARGNE },
      ];

      for (const mapping of typesMapping) {
        const mockService = {
          id: VALID_SERVICE_ID,
          name: 'Test',
          longName: 'Test Long',
          type: mapping.prisma,
          montantMin: 0,
          montantMax: 100000,
          frais: { type: 'FREE' },
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          institutionId: VALID_INSTITUTION_ID,
        };

        mockPrisma.service.findUnique.mockResolvedValue(mockService);

        const result = await repository.findById(VALID_SERVICE_ID);

        expect(result?.type).toBe(mapping.domain);
      }
    });
  });
});
