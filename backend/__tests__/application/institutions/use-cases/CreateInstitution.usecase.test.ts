import { CreateInstitutionUseCaseImpl } from '@/application/institutions/use-cases/CreateInsitution.usecase';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import type { InstitutionDomainService } from '@/domain/institutions/services/InstitutionDomainService';
import { Institution, InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { DuplicateError } from '@/domain/shared/errors';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
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
      website: 'https://test.com',
      geographicZones: ['EURO', 'USD'],
      logoUrl: 'https://test.com/logo.png',
    };

    it('should create an institution successfully with all fields', async () => {
      const testUuid = randomUUID();
      mockDomainService.isNameUnique.mockResolvedValue(true);

      const savedInstitution = new Institution({
        id: EntityId.from(testUuid),
        name: validCommand.name,
        description: validCommand.description,
        website: UrlValueObject.from(validCommand.website),
        geographicZones: validCommand.geographicZones,
        logoUrl: UrlValueObject.from(validCommand.logoUrl),
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
      };

      mockDomainService.isNameUnique.mockResolvedValue(true);

      const savedInstitution = new Institution({
        id: EntityId.from(testUuid),
        name: commandWithoutOptionalFields.name,
        description: commandWithoutOptionalFields.description,
        website: UrlValueObject.from(null),
        geographicZones: commandWithoutOptionalFields.geographicZones,
        logoUrl: UrlValueObject.from(null),
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
        website: UrlValueObject.from(validCommand.website),
        geographicZones: validCommand.geographicZones,
        logoUrl: UrlValueObject.from(validCommand.logoUrl),
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
        website: UrlValueObject.from(null),
        geographicZones: commandWithEmptyWebsite.geographicZones,
        logoUrl: UrlValueObject.from(commandWithEmptyWebsite.logoUrl),
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
        website: UrlValueObject.from(commandWithEmptyLogo.website),
        geographicZones: commandWithEmptyLogo.geographicZones,
        logoUrl: UrlValueObject.from(null),
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
        website: UrlValueObject.from(validCommand.website),
        geographicZones: validCommand.geographicZones,
        logoUrl: UrlValueObject.from(validCommand.logoUrl),
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
  });
});
