// backend/__tests__/domain/use-cases/getServiceUseCaseImpl.test.ts
import { GetServicesUseCaseImpl } from '@/domain/use-cases/getServiceUseCaseImpl';
import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import type { Service, ServiceFilter } from '@/domain/entities/Service';
import { TypeService } from '@/domain/institutions/entities/Service';

describe('GetServicesUseCaseImpl', () => {
  let useCase: GetServicesUseCaseImpl;
  let mockRepository: jest.Mocked<ServiceRepository>;

  const mockService1: Service = {
    id: 'service-1',
    name: 'Crédit Immobilier',
    longName: 'Service de Crédit Immobilier',
    type: TypeService.CREDIT,
    frais: {},
    conditionAccess: ['Age minimum 18 ans', 'Revenus réguliers'],
    plafonds: ['Minimum 1 000 000 FCFA', 'Maximum 50 000 000 FCFA'],
    infrastructureAccess: ['Agences', 'Mobile Banking'],
    institutionId: 'institution-1',
    institution: {
      id: 'institution-1',
      name: 'Banque Test',
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockService2: Service = {
    id: 'service-2',
    name: 'Épargne Retraite',
    longName: "Service d'Épargne Retraite",
    type: TypeService.EPARGNE,
    frais: {},
    conditionAccess: ['Age minimum 21 ans'],
    plafonds: ['Minimum 50 000 FCFA'],
    infrastructureAccess: ['Mobile Banking', 'Internet Banking'],
    institutionId: 'institution-2',
    institution: {
      id: 'institution-2',
      name: 'Banque Épargne',
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  };

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByType: jest.fn(),
    } as jest.Mocked<ServiceRepository>;

    useCase = new GetServicesUseCaseImpl(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return all services when no filters provided', async () => {
      const filters: ServiceFilter = {};
      const mockServices = [mockService1, mockService2];
      mockRepository.findAll.mockResolvedValue(mockServices);

      const result = await useCase.execute(filters);

      expect(result).toEqual(mockServices);
      expect(result).toHaveLength(2);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return filtered services by type', async () => {
      const filters: ServiceFilter = { type: TypeService.CREDIT };
      mockRepository.findAll.mockResolvedValue([mockService1]);

      const result = await useCase.execute(filters);

      expect(result).toEqual([mockService1]);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(TypeService.CREDIT);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return filtered services by name', async () => {
      const filters: ServiceFilter = { name: 'Immobilier' };
      mockRepository.findAll.mockResolvedValue([mockService1]);

      const result = await useCase.execute(filters);

      expect(result).toEqual([mockService1]);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return filtered services by institutionId', async () => {
      const filters: ServiceFilter = { institutionId: 'institution-1' };
      mockRepository.findAll.mockResolvedValue([mockService1]);

      const result = await useCase.execute(filters);

      expect(result).toEqual([mockService1]);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return filtered services with multiple filters', async () => {
      const filters: ServiceFilter = {
        type: TypeService.CREDIT,
        name: 'Immobilier',
        institutionId: 'institution-1',
      };
      mockRepository.findAll.mockResolvedValue([mockService1]);

      const result = await useCase.execute(filters);

      expect(result).toEqual([mockService1]);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return empty array when no services match filters', async () => {
      const filters: ServiceFilter = { type: TypeService.AUTRES };
      mockRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute(filters);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should handle repository errors', async () => {
      const filters: ServiceFilter = {};
      const error = new Error('Database connection failed');
      mockRepository.findAll.mockRejectedValue(error);

      await expect(useCase.execute(filters)).rejects.toThrow('Database connection failed');
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should call repository with empty filters object', async () => {
      const filters: ServiceFilter = {};
      mockRepository.findAll.mockResolvedValue([]);

      await useCase.execute(filters);

      expect(mockRepository.findAll).toHaveBeenCalledWith({});
    });

    it('should preserve service data structure', async () => {
      const filters: ServiceFilter = {};
      mockRepository.findAll.mockResolvedValue([mockService1]);

      const result = await useCase.execute(filters);

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('longName');
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('frais');
      expect(result[0]).toHaveProperty('conditionAccess');
      expect(result[0]).toHaveProperty('plafonds');
      expect(result[0]).toHaveProperty('infrastructureAccess');
      expect(result[0]).toHaveProperty('institutionId');
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0]).toHaveProperty('updatedAt');
    });

    it('should handle undefined filters gracefully', async () => {
      const filters: ServiceFilter = {
        type: undefined,
        name: undefined,
        institutionId: undefined,
      };
      mockRepository.findAll.mockResolvedValue([mockService1, mockService2]);

      const result = await useCase.execute(filters);

      expect(result).toHaveLength(2);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return services with correct type filtering', async () => {
      const filters: ServiceFilter = { type: TypeService.EPARGNE };
      mockRepository.findAll.mockResolvedValue([mockService2]);

      const result = await useCase.execute(filters);

      expect(result).toEqual([mockService2]);
      expect(result[0].type).toBe(TypeService.EPARGNE);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should handle partial name matching filter', async () => {
      const filters: ServiceFilter = { name: 'Service' };
      mockRepository.findAll.mockResolvedValue([mockService1, mockService2]);

      const result = await useCase.execute(filters);

      expect(result).toHaveLength(2);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should handle specific institution filtering', async () => {
      const filters: ServiceFilter = { institutionId: 'institution-2' };
      mockRepository.findAll.mockResolvedValue([mockService2]);

      const result = await useCase.execute(filters);

      expect(result).toEqual([mockService2]);
      expect(result[0].institutionId).toBe('institution-2');
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });
  });
});
