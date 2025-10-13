import { GetInstitutionByIdUseCaseImpl } from '@/application/institutions/use-cases/GetInstitutionByIdUseCase';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import { Institution, InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';

describe('GetInstitutionByIdUseCase', () => {
  let useCase: GetInstitutionByIdUseCaseImpl;
  let mockRepository: jest.Mocked<InstitutionRepository>;
  let testInstitution: Institution;
  const testId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    testInstitution = new Institution({
      id: EntityId.from(testId),
      name: 'Test Institution',
      description: 'Test Description',
      website: UrlValueObject.from('https://test.com'),
      geographicZones: ['UEMOA', 'CEMAC'],
      logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
      status: InstitutionStatus.ACTIVE,
      services: [],
    });

    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new GetInstitutionByIdUseCaseImpl(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return an institution when found by id', async () => {
      mockRepository.findById.mockResolvedValue(testInstitution);

      const result = await useCase.execute({ id: testId });

      expect(mockRepository.findById).toHaveBeenCalledWith(testId);
      expect(result).toEqual({
        id: testId,
        name: 'Test Institution',
        description: 'Test Description',
        website: 'https://test.com',
        geographicZones: ['UEMOA', 'CEMAC'],
        logoUrl: 'https://logo.com/logo.png',
        status: 'ACTIVE',
        services: [],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should throw NotFoundError when institution is not found', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174001';
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute({ id: nonExistentId })).rejects.toThrow(NotFoundError);
      await expect(useCase.execute({ id: nonExistentId })).rejects.toThrow(
        `Institution with id ${nonExistentId} not found`
      );

      expect(mockRepository.findById).toHaveBeenCalledWith(nonExistentId);
    });

    it('should handle institutions with null website and logoUrl', async () => {
      const institutionWithNulls = new Institution({
        id: EntityId.from(testId),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from(null),
        geographicZones: ['UEMOA'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.PENDING,
        services: [],
      });

      mockRepository.findById.mockResolvedValue(institutionWithNulls);

      const result = await useCase.execute({ id: testId });

      expect(result).toEqual({
        id: testId,
        name: 'Test Institution',
        description: 'Test Description',
        website: null,
        geographicZones: ['UEMOA'],
        logoUrl: null,
        status: 'PENDING',
        services: [],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should handle different institution statuses', async () => {
      const statuses = [
        InstitutionStatus.ACTIVE,
        InstitutionStatus.INACTIVE,
        InstitutionStatus.PENDING,
      ];

      for (const status of statuses) {
        const institution = new Institution({
          id: EntityId.from(testId),
          name: 'Test Institution',
          description: 'Test Description',
          website: UrlValueObject.from('https://test.com'),
          geographicZones: ['UEMOA'],
          logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
          status,
          services: [],
        });

        mockRepository.findById.mockResolvedValue(institution);

        const result = await useCase.execute({ id: testId });

        expect(result.status).toBe(status);
      }
    });

    it('should return institution with services correctly', async () => {
      const { Service, TypeService } = await import('@/domain/institutions/entities/Service');
      const { FraisFixes } = await import('@/domain/institutions/entities/Frais');
      const { randomUUID } = await import('crypto');

      const serviceId = randomUUID();
      const mockService = new Service({
        id: EntityId.from(serviceId),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.TRANSFERT_ARGENT,
        frais: new FraisFixes(100),
        conditionAccess: ['Condition 1'],
        plafonds: ['Plafond 1'],
        infrastructureAccess: ['Infra 1'],
      });

      const institutionWithService = new Institution({
        id: EntityId.from(testId),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from('https://test.com'),
        geographicZones: ['UEMOA', 'CEMAC'],
        logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
        status: InstitutionStatus.ACTIVE,
        services: [mockService],
      });

      mockRepository.findById.mockResolvedValue(institutionWithService);

      const result = await useCase.execute({ id: testId });

      expect(result.services).toHaveLength(1);
      expect(result.services[0]).toEqual({
        id: serviceId,
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.TRANSFERT_ARGENT,
        frais: expect.any(FraisFixes),
        conditionAccess: ['Condition 1'],
        plafonds: ['Plafond 1'],
        infrastructureAccess: ['Infra 1'],
      });
    });
  });
});
