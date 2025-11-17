import { CreateInstitutionUseCaseImpl } from '@/application/institutions/use-cases/CreateInstitutionUseCaseImpl';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import type { InstitutionDomainService } from '@/domain/institutions/services/InstitutionDomainService';
import { Institution, InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { DuplicateError } from '@/domain/shared/errors';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import { InstitutionType } from '@/domain/institutions/value-objects/InstitutionType';
import { Country } from '@/domain/institutions/value-objects/Country';
import { randomUUID } from 'crypto';

describe('CreateInstitutionUseCaseImpl', () => {
  let useCase: CreateInstitutionUseCaseImpl;
  let mockRepository: jest.Mocked<InstitutionRepository>;
  let mockDomainService: jest.Mocked<InstitutionDomainService>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockDomainService = {
      isNameUnique: jest.fn(),
    } as any;

    useCase = new CreateInstitutionUseCaseImpl(mockRepository, mockDomainService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validCommand = {
      name: 'Test Institution',
      description: 'Test Description',
      type: InstitutionType.BANQUE_NUMERIQUE,
      website: 'https://test.com',
      geographicZones: ['EURO', 'USD'],
      logoUrl: 'https://test.com/logo.png',
      pays: Country.SENEGAL,
    };

    it('should create an institution successfully with all fields', async () => {
      const testUuid = randomUUID();
      mockDomainService.isNameUnique.mockResolvedValue(true);

      const savedInstitution = new Institution({
        id: EntityId.from(testUuid),
        name: validCommand.name,
        description: validCommand.description,
        type: validCommand.type,
        website: UrlValueObject.from(validCommand.website),
        geographicZones: validCommand.geographicZones,
        logoUrl: UrlValueObject.from(validCommand.logoUrl),
        pays: validCommand.pays,
        status: InstitutionStatus.PENDING,
        services: [],
      });

      mockRepository.save.mockResolvedValue(savedInstitution);

      const result = await useCase.execute(validCommand);

      expect(mockDomainService.isNameUnique).toHaveBeenCalledWith(validCommand.name);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: testUuid,
        name: validCommand.name,
        description: validCommand.description,
        website: validCommand.website,
        geographicZones: validCommand.geographicZones,
        logoUrl: validCommand.logoUrl,
        status: InstitutionStatus.PENDING,
        type: validCommand.type,
        pays: validCommand.pays,
        services: [],
        createdAt: savedInstitution.createdAt,
        updatedAt: savedInstitution.updatedAt,
      });
    });

    it('should create an institution without optional fields', async () => {
      const testUuid = randomUUID();
      const commandWithoutOptionalFields = {
        name: 'Test Institution',
        description: 'Test Description',
        geographicZones: ['EURO'],
        type: InstitutionType.BANQUE_NUMERIQUE,
        pays: Country.SENEGAL,
      };

      mockDomainService.isNameUnique.mockResolvedValue(true);

      const savedInstitution = new Institution({
        id: EntityId.from(testUuid),
        name: commandWithoutOptionalFields.name,
        description: commandWithoutOptionalFields.description,
        type: commandWithoutOptionalFields.type,
        website: UrlValueObject.from(null),
        geographicZones: commandWithoutOptionalFields.geographicZones,
        logoUrl: UrlValueObject.from(null),
        pays: commandWithoutOptionalFields.pays,
        status: InstitutionStatus.PENDING,
        services: [],
      });

      mockRepository.save.mockResolvedValue(savedInstitution);

      const result = await useCase.execute(commandWithoutOptionalFields);

      expect(result).toEqual({
        id: testUuid,
        name: commandWithoutOptionalFields.name,
        description: commandWithoutOptionalFields.description,
        website: null,
        geographicZones: commandWithoutOptionalFields.geographicZones,
        logoUrl: null,
        status: InstitutionStatus.PENDING,
        type: commandWithoutOptionalFields.type,
        pays: commandWithoutOptionalFields.pays,
        services: [],
        createdAt: savedInstitution.createdAt,
        updatedAt: savedInstitution.updatedAt,
      });
    });

    it('should throw DuplicateError when name is not unique', async () => {
      mockDomainService.isNameUnique.mockResolvedValue(false);

      await expect(useCase.execute(validCommand)).rejects.toThrow(DuplicateError);
      await expect(useCase.execute(validCommand)).rejects.toThrow(
        'Entity institution with name Test Institution already exists'
      );

      expect(mockDomainService.isNameUnique).toHaveBeenCalledWith(validCommand.name);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository save errors', async () => {
      mockDomainService.isNameUnique.mockResolvedValue(true);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(validCommand)).rejects.toThrow('Database error');
      expect(mockDomainService.isNameUnique).toHaveBeenCalledWith(validCommand.name);
    });

    it('should set status to PENDING for new institutions', async () => {
      const testUuid = randomUUID();
      mockDomainService.isNameUnique.mockResolvedValue(true);

      const savedInstitution = new Institution({
        id: EntityId.from(testUuid),
        name: validCommand.name,
        description: validCommand.description,
        type: validCommand.type,
        website: UrlValueObject.from(validCommand.website),
        geographicZones: validCommand.geographicZones,
        logoUrl: UrlValueObject.from(validCommand.logoUrl),
        pays: validCommand.pays,
        status: InstitutionStatus.PENDING,
        services: [],
      });

      mockRepository.save.mockResolvedValue(savedInstitution);

      const result = await useCase.execute(validCommand);

      expect(result.status).toBe(InstitutionStatus.PENDING);
    });

    it('should handle empty website URL', async () => {
      const testUuid = randomUUID();
      const commandWithEmptyWebsite = {
        ...validCommand,
        website: '',
      };

      mockDomainService.isNameUnique.mockResolvedValue(true);

      const savedInstitution = new Institution({
        id: EntityId.from(testUuid),
        name: commandWithEmptyWebsite.name,
        description: commandWithEmptyWebsite.description,
        type: commandWithEmptyWebsite.type,
        website: UrlValueObject.from(null),
        geographicZones: commandWithEmptyWebsite.geographicZones,
        logoUrl: UrlValueObject.from(commandWithEmptyWebsite.logoUrl),
        pays: commandWithEmptyWebsite.pays,
        status: InstitutionStatus.PENDING,
        services: [],
      });

      mockRepository.save.mockResolvedValue(savedInstitution);

      const result = await useCase.execute(commandWithEmptyWebsite);

      expect(result.website).toBeNull();
    });

    it('should handle empty logoUrl', async () => {
      const testUuid = randomUUID();
      const commandWithEmptyLogo = {
        ...validCommand,
        logoUrl: '',
      };

      mockDomainService.isNameUnique.mockResolvedValue(true);

      const savedInstitution = new Institution({
        id: EntityId.from(testUuid),
        name: commandWithEmptyLogo.name,
        description: commandWithEmptyLogo.description,
        type: commandWithEmptyLogo.type,
        website: UrlValueObject.from(commandWithEmptyLogo.website),
        geographicZones: commandWithEmptyLogo.geographicZones,
        logoUrl: UrlValueObject.from(null),
        pays: commandWithEmptyLogo.pays,
        status: InstitutionStatus.PENDING,
        services: [],
      });

      mockRepository.save.mockResolvedValue(savedInstitution);

      const result = await useCase.execute(commandWithEmptyLogo);

      expect(result.logoUrl).toBeNull();
    });

    it('should convert institution to DTO correctly', async () => {
      const testUuid = randomUUID();
      mockDomainService.isNameUnique.mockResolvedValue(true);

      const savedInstitution = new Institution({
        id: EntityId.from(testUuid),
        name: validCommand.name,
        description: validCommand.description,
        type: validCommand.type,
        website: UrlValueObject.from(validCommand.website),
        geographicZones: validCommand.geographicZones,
        logoUrl: UrlValueObject.from(validCommand.logoUrl),
        pays: validCommand.pays,
        status: InstitutionStatus.PENDING,
        services: [],
      });

      mockRepository.save.mockResolvedValue(savedInstitution);

      const result = await useCase.execute(validCommand);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('website');
      expect(result).toHaveProperty('geographicZones');
      expect(result).toHaveProperty('logoUrl');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should convert institution with services to DTO correctly', async () => {
      const { Service, TypeService } = await import('@/domain/institutions/entities/Service');
      const { FraisFixes } = await import('@/domain/institutions/entities/Frais');

      const testUuid = randomUUID();
      const serviceUuid = randomUUID();
      mockDomainService.isNameUnique.mockResolvedValue(true);

      const mockService = new Service({
        id: EntityId.from(serviceUuid),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.PAIEMENT_MARCHAND,
        frais: new FraisFixes(100),
        conditionAccess: ['Condition 1'],
        plafonds: ['Plafond 1'],
        infrastructureAccess: ['Infra 1'],
      });

      const savedInstitution = new Institution({
        id: EntityId.from(testUuid),
        name: validCommand.name,
        description: validCommand.description,
        type: validCommand.type,
        website: UrlValueObject.from(validCommand.website),
        geographicZones: validCommand.geographicZones,
        logoUrl: UrlValueObject.from(validCommand.logoUrl),
        pays: validCommand.pays,
        status: InstitutionStatus.PENDING,
        services: [mockService],
      });

      mockRepository.save.mockResolvedValue(savedInstitution);

      const result = await useCase.execute(validCommand);

      expect(result).toHaveProperty('services');
      expect(result.services).toHaveLength(1);
      expect(result.services[0]).toEqual({
        id: serviceUuid,
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.PAIEMENT_MARCHAND,
        frais: expect.any(FraisFixes),
        conditionAccess: ['Condition 1'],
        plafonds: ['Plafond 1'],
        infrastructureAccess: ['Infra 1'],
      });
    });
  });
});
