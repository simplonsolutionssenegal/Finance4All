import { GetInstitutionsUseCaseImpl } from '@/application/institutions/use-cases/GetInstitutionsUseCase';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import { Institution, InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import { InstitutionType } from '@/domain/institutions/value-objects/InstitutionType';
import { Country } from '@/domain/institutions/value-objects/Country';

describe('GetInstitutionsUseCase', () => {
  let useCase: GetInstitutionsUseCaseImpl;
  let mockRepository: jest.Mocked<InstitutionRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new GetInstitutionsUseCaseImpl(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should retrieve paginated institutions successfully', async () => {
      const institution1 = new Institution({
        id: EntityId.generate(),
        name: 'Institution 1',
        description: 'Description 1',
        website: UrlValueObject.from('https://test1.com'),
        geographicZones: ['USD'],
        logoUrl: UrlValueObject.from('https://test1.com/logo.png'),
        status: InstitutionStatus.ACTIVE,
        type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
        pays: Country.SENEGAL,
        services: [],
      });

      const institution2 = new Institution({
        id: EntityId.generate(),
        name: 'Institution 2',
        description: 'Description 2',
        website: UrlValueObject.from('https://test2.com'),
        geographicZones: ['EURO'],
        logoUrl: UrlValueObject.from('https://test2.com/logo.png'),
        status: InstitutionStatus.PENDING,
        type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
        pays: Country.SENEGAL,
        services: [],
      });

      const paginatedResult = {
        data: [institution1, institution2],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      mockRepository.findAll.mockResolvedValue(paginatedResult);

      const result = await useCase.execute({ page: 1, limit: 10 });

      expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({
        id: institution1.id.getValue(),
        name: 'Institution 1',
        description: 'Description 1',
        website: 'https://test1.com',
        geographicZones: ['USD'],
        logoUrl: 'https://test1.com/logo.png',
        status: InstitutionStatus.ACTIVE,
      });
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('should retrieve empty list when no institutions exist', async () => {
      const paginatedResult = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      mockRepository.findAll.mockResolvedValue(paginatedResult);

      const result = await useCase.execute({ page: 1, limit: 10 });

      expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should handle custom pagination parameters', async () => {
      const institution = new Institution({
        id: EntityId.generate(),
        name: 'Institution',
        description: 'Description',
        website: UrlValueObject.from('https://test.com'),
        geographicZones: ['GBP'],
        logoUrl: UrlValueObject.from('https://test.com/logo.png'),
        status: InstitutionStatus.ACTIVE,
        type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
        pays: Country.SENEGAL,
        services: [],
      });

      const paginatedResult = {
        data: [institution],
        pagination: {
          page: 2,
          limit: 5,
          total: 10,
          totalPages: 2,
        },
      };

      mockRepository.findAll.mockResolvedValue(paginatedResult);

      const result = await useCase.execute({ page: 2, limit: 5 });

      expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 2, limit: 5 });
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database error');
      mockRepository.findAll.mockRejectedValue(error);

      await expect(useCase.execute({ page: 1, limit: 10 })).rejects.toThrow('Database error');
      expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('should retrieve institutions with services correctly', async () => {
      const { Service, TypeService, TypeCalculation } = await import(
        '@/domain/institutions/entities/Service'
      );
      const { FraisPourcentage } = await import('@/domain/institutions/entities/Frais');
      const { randomUUID } = await import('crypto');

      const serviceId = randomUUID();
      const mockService = new Service({
        id: EntityId.from(serviceId),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.EPARGNE,
        montantMin: 100000,
        montantMax: 100000,
        typeFrais: TypeCalculation.POURCENTAGE,
        frais: new FraisPourcentage(0.02, 500, 50),
        conditionAccess: ['Condition 1'],
        plafonds: ['Plafond 1'],
        infrastructureAccess: ['Infra 1'],
      });

      const institution = new Institution({
        id: EntityId.generate(),
        name: 'Institution with Service',
        description: 'Description',
        website: UrlValueObject.from('https://test.com'),
        geographicZones: ['USD'],
        logoUrl: UrlValueObject.from('https://test.com/logo.png'),
        status: InstitutionStatus.ACTIVE,
        type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
        pays: Country.SENEGAL,
        services: [mockService],
      });

      const paginatedResult = {
        data: [institution],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockRepository.findAll.mockResolvedValue(paginatedResult);

      const result = await useCase.execute({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].services).toHaveLength(1);
      expect(result.data[0].services[0]).toMatchObject({
        id: serviceId,
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.EPARGNE,
        typeFrais: TypeCalculation.POURCENTAGE,
        conditionAccess: ['Condition 1'],
        plafonds: ['Plafond 1'],
        infrastructureAccess: ['Infra 1'],
      });
      expect(result.data[0].services[0].frais).toHaveProperty('typeCalculation');
      expect(result.data[0].services[0].frais).toHaveProperty('pourcentage', 0.02);
      expect(result.data[0].services[0].frais).toHaveProperty('maximum', 500);
      expect(result.data[0].services[0].frais).toHaveProperty('minimum', 50);
    });
  });
});
