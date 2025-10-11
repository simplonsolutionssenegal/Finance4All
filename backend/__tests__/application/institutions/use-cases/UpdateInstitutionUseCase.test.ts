import { UpdateInstitutionUseCaseImpl } from '@/application/institutions/use-cases/UpdateInstitutionUseCase';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import { Institution, InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { randomUUID } from 'crypto';

describe('UpdateInstitutionUseCaseImpl', () => {
  let useCase: UpdateInstitutionUseCaseImpl;
  let mockRepository: jest.Mocked<InstitutionRepository>;
  const testId = randomUUID();

  const existingInstitution = new Institution({
    id: EntityId.from(testId),
    name: 'Old Name',
    description: 'Old Description',
    website: UrlValueObject.from('https://old.com'),
    geographicZones: ['UEMOA'],
    logoUrl: UrlValueObject.from('https://old.com/logo.png'),
    status: InstitutionStatus.ACTIVE,
    services: [],
  });

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    useCase = new UpdateInstitutionUseCaseImpl(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const updateCommand = {
      id: testId,
      name: 'New Name',
      description: 'New Description',
      website: 'https://new.com',
      geographicZones: ['UEMOA', 'CEMAC'],
      logoUrl: 'https://new.com/logo.png',
    };

    it('should throw NotFoundError if institution does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(updateCommand)).rejects.toThrow(NotFoundError);
      await expect(useCase.execute(updateCommand)).rejects.toThrow(
        `Institution with id ${testId} not found`
      );
      expect(mockRepository.findById).toHaveBeenCalledWith(testId);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should update an institution successfully', async () => {
      mockRepository.findById.mockResolvedValue(existingInstitution);

      const updatedInstitution = new Institution({
        id: EntityId.from(testId),
        name: updateCommand.name,
        description: updateCommand.description,
        website: UrlValueObject.from(updateCommand.website),
        geographicZones: updateCommand.geographicZones,
        logoUrl: UrlValueObject.from(updateCommand.logoUrl),
        status: existingInstitution.status,
        services: [],
      });
      mockRepository.update.mockResolvedValue(updatedInstitution);

      const result = await useCase.execute(updateCommand);

      expect(mockRepository.findById).toHaveBeenCalledWith(testId);
      expect(mockRepository.update).toHaveBeenCalledWith(expect.any(Institution));

      const updatedArgument = mockRepository.update.mock.calls[0][0];
      expect(updatedArgument.name).toBe(updateCommand.name);
      expect(updatedArgument.description).toBe(updateCommand.description);

      expect(result).toEqual({
        id: testId,
        name: updateCommand.name,
        description: updateCommand.description,
        website: updateCommand.website,
        geographicZones: updateCommand.geographicZones,
        logoUrl: updateCommand.logoUrl,
        status: existingInstitution.status,
        createdAt: updatedInstitution.createdAt,
        updatedAt: updatedInstitution.updatedAt,
      });
    });

    it('should handle null website and logoUrl', async () => {
      const commandWithNulls = {
        ...updateCommand,
        website: null,
        logoUrl: null,
      };
      mockRepository.findById.mockResolvedValue(existingInstitution);

      const updatedInstitution = new Institution({
        id: EntityId.from(testId),
        name: commandWithNulls.name,
        description: commandWithNulls.description,
        website: UrlValueObject.from(null),
        geographicZones: commandWithNulls.geographicZones,
        logoUrl: UrlValueObject.from(null),
        status: existingInstitution.status,
        services: [],
      });
      mockRepository.update.mockResolvedValue(updatedInstitution);

      const result = await useCase.execute(commandWithNulls);

      expect(result.website).toBeNull();
      expect(result.logoUrl).toBeNull();
    });

    it('should handle empty string for website and logoUrl as null', async () => {
      const commandWithEmptyStrings = {
        ...updateCommand,
        website: '',
        logoUrl: '',
      };
      mockRepository.findById.mockResolvedValue(existingInstitution);

      const updatedInstitution = new Institution({
        id: EntityId.from(testId),
        name: commandWithEmptyStrings.name,
        description: commandWithEmptyStrings.description,
        website: UrlValueObject.from(null),
        geographicZones: commandWithEmptyStrings.geographicZones,
        logoUrl: UrlValueObject.from(null),
        status: existingInstitution.status,
        services: [],
      });
      mockRepository.update.mockResolvedValue(updatedInstitution);

      const result = await useCase.execute(commandWithEmptyStrings);

      expect(result.website).toBeNull();
      expect(result.logoUrl).toBeNull();
    });

    it('should preserve the existing status', async () => {
      mockRepository.findById.mockResolvedValue(existingInstitution);
      const updatedInstitution = new Institution({
        id: existingInstitution.id,
        name: 'New Name',
        description: existingInstitution.description,
        website: existingInstitution.website,
        geographicZones: existingInstitution.geographicZones,
        status: existingInstitution.status,
        logoUrl: existingInstitution.logoUrl,
        services: [],
      });
      mockRepository.update.mockResolvedValue(updatedInstitution);

      const result = await useCase.execute(updateCommand);

      expect(result.status).toBe(existingInstitution.status);
    });
  });
});
