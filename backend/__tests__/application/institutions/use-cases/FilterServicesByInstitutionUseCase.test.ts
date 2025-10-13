import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import type { FilterServicesByInstitutionQuery } from '@/domain/institutions/ports/in/FilterServicesByInstitutionUseCase';
import type { ServiceDTO } from '@/domain/institutions/value-objects/ServiceDTO';
import { Service, TypeService } from '@/domain/institutions/entities/Service';
import { EntityId } from '@/domain/shared/EntityId';
import { FraisGratuit, FraisFixes, FraisPourcentage } from '@/domain/institutions/entities/Frais';
import { randomUUID } from 'crypto';
import { FilterServicesByInstitutionUseCaseImpl } from '@/application/institutions/use-cases/FilterServicesByInstitutionUseCase';

describe('FilterServicesByInstitutionUseCaseImpl', () => {
  let useCase: FilterServicesByInstitutionUseCaseImpl;
  let mockRepository: jest.Mocked<InstitutionRepository>;
  let testInstitutionId: string;

  beforeEach(() => {
    testInstitutionId = randomUUID();

    mockRepository = {
      findByFilters: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new FilterServicesByInstitutionUseCaseImpl(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should filter services by institution id and return paginated DTOs', async () => {
      const query: FilterServicesByInstitutionQuery = {
        institutionId: testInstitutionId,
        page: 1,
        limit: 10,
      };

      const services = [
        new Service({
          id: EntityId.from(randomUUID()),
          name: 'Service 1',
          longName: 'Service 1 Long Name',
          type: TypeService.PAIEMENT_MARCHAND,
          frais: new FraisGratuit(),
          conditionAccess: ['Condition 1'],
          plafonds: ['Plafond 1'],
          infrastructureAccess: ['Infra 1'],
        }),
        new Service({
          id: EntityId.from(randomUUID()),
          name: 'Service 2',
          longName: 'Service 2 Long Name',
          type: TypeService.ACHAT_CREDIT,
          frais: new FraisFixes(100),
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
        }),
      ];

      const repositoryResult = {
        data: services,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      mockRepository.findByFilters.mockResolvedValue(repositoryResult);

      const result = await useCase.execute(query);

      expect(mockRepository.findByFilters).toHaveBeenCalledWith({
        institutionId: testInstitutionId,
        page: 1,
        limit: 10,
        types: undefined,
        fromDate: undefined,
      });

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual(services[0].toDTO());
      expect(result.data[1]).toEqual(services[1].toDTO());
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('should filter services by types', async () => {
      const query: FilterServicesByInstitutionQuery = {
        institutionId: testInstitutionId,
        page: 1,
        limit: 10,
        types: [TypeService.PAIEMENT_MARCHAND, TypeService.ACHAT_CREDIT],
      };

      const services = [
        new Service({
          id: EntityId.from(randomUUID()),
          name: 'Payment Service',
          longName: 'Payment Service Long Name',
          type: TypeService.PAIEMENT_MARCHAND,
          frais: new FraisGratuit(),
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
        }),
      ];

      const repositoryResult = {
        data: services,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockRepository.findByFilters.mockResolvedValue(repositoryResult);

      const result = await useCase.execute(query);

      expect(mockRepository.findByFilters).toHaveBeenCalledWith({
        institutionId: testInstitutionId,
        page: 1,
        limit: 10,
        types: [TypeService.PAIEMENT_MARCHAND, TypeService.ACHAT_CREDIT],
        fromDate: undefined,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe(TypeService.PAIEMENT_MARCHAND);
    });

    it('should filter services by fromDate', async () => {
      const fromDate = new Date('2024-01-01');
      const query: FilterServicesByInstitutionQuery = {
        institutionId: testInstitutionId,
        page: 1,
        limit: 10,
        fromDate,
      };

      const services = [
        new Service({
          id: EntityId.from(randomUUID()),
          name: 'Recent Service',
          longName: 'Recent Service Long Name',
          type: TypeService.TRANSFERT_ARGENT,
          frais: new FraisPourcentage(0.02, 500, 50),
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
        }),
      ];

      const repositoryResult = {
        data: services,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockRepository.findByFilters.mockResolvedValue(repositoryResult);

      const result = await useCase.execute(query);

      expect(mockRepository.findByFilters).toHaveBeenCalledWith({
        institutionId: testInstitutionId,
        page: 1,
        limit: 10,
        types: undefined,
        fromDate,
      });

      expect(result.data).toHaveLength(1);
    });

    it('should filter services with multiple criteria', async () => {
      const fromDate = new Date('2024-01-01');
      const query: FilterServicesByInstitutionQuery = {
        institutionId: testInstitutionId,
        page: 2,
        limit: 5,
        types: [TypeService.EPARGNE, TypeService.CREDIT],
        fromDate,
      };

      const services = [
        new Service({
          id: EntityId.from(randomUUID()),
          name: 'Epargne Service',
          longName: 'Epargne Service Long Name',
          type: TypeService.EPARGNE,
          frais: new FraisFixes(50, 0.01, 25),
          conditionAccess: ['KYC required'],
          plafonds: ['Max 1000000'],
          infrastructureAccess: ['Mobile App'],
        }),
      ];

      const repositoryResult = {
        data: services,
        pagination: {
          page: 2,
          limit: 5,
          total: 8,
          totalPages: 2,
        },
      };

      mockRepository.findByFilters.mockResolvedValue(repositoryResult);

      const result = await useCase.execute(query);

      expect(mockRepository.findByFilters).toHaveBeenCalledWith({
        institutionId: testInstitutionId,
        page: 2,
        limit: 5,
        types: [TypeService.EPARGNE, TypeService.CREDIT],
        fromDate,
      });

      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 8,
        totalPages: 2,
      });
    });

    it('should return empty array when no services match', async () => {
      const query: FilterServicesByInstitutionQuery = {
        institutionId: testInstitutionId,
        page: 1,
        limit: 10,
      };

      const repositoryResult = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      mockRepository.findByFilters.mockResolvedValue(repositoryResult);

      const result = await useCase.execute(query);

      expect(mockRepository.findByFilters).toHaveBeenCalledWith({
        institutionId: testInstitutionId,
        page: 1,
        limit: 10,
        types: undefined,
        fromDate: undefined,
      });

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('should handle pagination correctly', async () => {
      const query: FilterServicesByInstitutionQuery = {
        institutionId: testInstitutionId,
        page: 3,
        limit: 20,
      };

      const services = Array.from(
        { length: 20 },
        (_, i) =>
          new Service({
            id: EntityId.from(randomUUID()),
            name: `Service ${i + 1}`,
            longName: `Service ${i + 1} Long Name`,
            type: TypeService.AUTRES,
            frais: new FraisGratuit(),
            conditionAccess: [],
            plafonds: [],
            infrastructureAccess: [],
          })
      );

      const repositoryResult = {
        data: services,
        pagination: {
          page: 3,
          limit: 20,
          total: 75,
          totalPages: 4,
        },
      };

      mockRepository.findByFilters.mockResolvedValue(repositoryResult);

      const result = await useCase.execute(query);

      expect(mockRepository.findByFilters).toHaveBeenCalledWith({
        institutionId: testInstitutionId,
        page: 3,
        limit: 20,
        types: undefined,
        fromDate: undefined,
      });

      expect(result.data).toHaveLength(20);
      expect(result.pagination).toEqual({
        page: 3,
        limit: 20,
        total: 75,
        totalPages: 4,
      });
    });

    it('should correctly map all service types to DTOs', async () => {
      const query: FilterServicesByInstitutionQuery = {
        institutionId: testInstitutionId,
        page: 1,
        limit: 50,
      };

      const allServiceTypes = [
        TypeService.PAIEMENT_MARCHAND,
        TypeService.ACHAT_CREDIT,
        TypeService.PAIEMENT_FACTURES,
        TypeService.DEPOT_SIMPLE,
        TypeService.DEPOT_RETRAIT_SIMPLE,
        TypeService.RETRAIT_SIMPLE,
        TypeService.TRANSFERT_ARGENT,
        TypeService.BANQUE_WALLET,
        TypeService.WALLET_BANQUE,
        TypeService.EPARGNE,
        TypeService.CREDIT,
        TypeService.ASSURANCE,
        TypeService.AUTRES,
      ];

      const services = allServiceTypes.map(
        type =>
          new Service({
            id: EntityId.from(randomUUID()),
            name: `Service ${type}`,
            longName: `Service ${type} Long Name`,
            type,
            frais: new FraisGratuit(),
            conditionAccess: [],
            plafonds: [],
            infrastructureAccess: [],
          })
      );

      const repositoryResult = {
        data: services,
        pagination: {
          page: 1,
          limit: 50,
          total: allServiceTypes.length,
          totalPages: 1,
        },
      };

      mockRepository.findByFilters.mockResolvedValue(repositoryResult);

      const result = await useCase.execute(query);

      expect(result.data).toHaveLength(allServiceTypes.length);
      result.data.forEach((dto: ServiceDTO, index: number) => {
        expect(dto.type).toBe(allServiceTypes[index]);
        expect(dto.name).toBe(`Service ${allServiceTypes[index]}`);
      });
    });

    it('should correctly map different frais types to DTOs', async () => {
      const query: FilterServicesByInstitutionQuery = {
        institutionId: testInstitutionId,
        page: 1,
        limit: 10,
      };

      const services = [
        new Service({
          id: EntityId.from(randomUUID()),
          name: 'Free Service',
          longName: 'Free Service Long Name',
          type: TypeService.AUTRES,
          frais: new FraisGratuit(),
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
        }),
        new Service({
          id: EntityId.from(randomUUID()),
          name: 'Fixed Service',
          longName: 'Fixed Service Long Name',
          type: TypeService.PAIEMENT_MARCHAND,
          frais: new FraisFixes(100, 0.02, 50),
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
        }),
        new Service({
          id: EntityId.from(randomUUID()),
          name: 'Percentage Service',
          longName: 'Percentage Service Long Name',
          type: TypeService.TRANSFERT_ARGENT,
          frais: new FraisPourcentage(0.03, 1000, 100),
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
        }),
      ];

      const repositoryResult = {
        data: services,
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1,
        },
      };

      mockRepository.findByFilters.mockResolvedValue(repositoryResult);

      const result = await useCase.execute(query);

      expect(result.data).toHaveLength(3);

      // Verify the DTOs contain the correct frais information
      const dto1 = result.data[0];
      expect(dto1.frais).toEqual(services[0].frais);

      const dto2 = result.data[1];
      expect(dto2.frais).toEqual(services[1].frais);

      const dto3 = result.data[2];
      expect(dto3.frais).toEqual(services[2].frais);
    });

    it('should handle repository errors', async () => {
      const query: FilterServicesByInstitutionQuery = {
        institutionId: testInstitutionId,
        page: 1,
        limit: 10,
      };

      const error = new Error('Database connection error');
      mockRepository.findByFilters.mockRejectedValue(error);

      await expect(useCase.execute(query)).rejects.toThrow('Database connection error');

      expect(mockRepository.findByFilters).toHaveBeenCalledWith({
        institutionId: testInstitutionId,
        page: 1,
        limit: 10,
        types: undefined,
        fromDate: undefined,
      });
    });

    it('should pass all query parameters to repository', async () => {
      const fromDate = new Date('2024-06-01');
      const query: FilterServicesByInstitutionQuery = {
        institutionId: testInstitutionId,
        page: 5,
        limit: 15,
        types: [TypeService.BANQUE_WALLET, TypeService.WALLET_BANQUE],
        fromDate,
      };

      const repositoryResult = {
        data: [],
        pagination: {
          page: 5,
          limit: 15,
          total: 0,
          totalPages: 0,
        },
      };

      mockRepository.findByFilters.mockResolvedValue(repositoryResult);

      await useCase.execute(query);

      expect(mockRepository.findByFilters).toHaveBeenCalledTimes(1);
      expect(mockRepository.findByFilters).toHaveBeenCalledWith({
        institutionId: testInstitutionId,
        page: 5,
        limit: 15,
        types: [TypeService.BANQUE_WALLET, TypeService.WALLET_BANQUE],
        fromDate,
      });
    });
  });
});
