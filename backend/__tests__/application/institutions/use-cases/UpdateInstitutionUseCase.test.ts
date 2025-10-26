import { UpdateInstitutionUseCaseImpl } from '@/application/institutions/use-cases/UpdateInstitutionUseCaseImpl';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import { Institution, InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import { InstitutionType } from '@/domain/institutions/value-objects/InstitutionType';
import { Country } from '@/domain/institutions/value-objects/Country';
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
    type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
    pays: Country.SENEGAL,
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
        type: existingInstitution.type,
        pays: existingInstitution.pays,
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
        type: existingInstitution.type,
        pays: existingInstitution.pays,
        services: [],
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
        type: existingInstitution.type,
        pays: existingInstitution.pays,
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
        type: existingInstitution.type,
        pays: existingInstitution.pays,
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
        type: existingInstitution.type,
        pays: existingInstitution.pays,
        services: [],
      });
      mockRepository.update.mockResolvedValue(updatedInstitution);

      const result = await useCase.execute(updateCommand);

      expect(result.status).toBe(existingInstitution.status);
    });

    it('should preserve existing services when updating institution', async () => {
      const { Service, TypeService, TypeCalculation } = await import(
        '@/domain/institutions/entities/Service'
      );
      const { FraisFixes } = await import('@/domain/institutions/entities/Frais');

      const serviceId = randomUUID();
      const mockService = new Service({
        id: EntityId.from(serviceId),
        name: 'Existing Service',
        longName: 'Existing Service Long Name',
        type: TypeService.ASSURANCE,
        typeFrais: TypeCalculation.FIX,
        frais: new FraisFixes(200, 0.01),
        conditionAccess: ['Condition 1'],
        plafonds: ['Plafond 1'],
        infrastructureAccess: ['Infra 1'],
      });

      const institutionWithService = new Institution({
        id: EntityId.from(testId),
        name: 'Old Name',
        description: 'Old Description',
        website: UrlValueObject.from('https://old.com'),
        geographicZones: ['UEMOA'],
        logoUrl: UrlValueObject.from('https://old.com/logo.png'),
        status: InstitutionStatus.ACTIVE,
        type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
        pays: Country.SENEGAL,
        services: [mockService],
      });

      mockRepository.findById.mockResolvedValue(institutionWithService);

      const updatedInstitutionWithService = new Institution({
        id: EntityId.from(testId),
        name: updateCommand.name,
        description: updateCommand.description,
        website: UrlValueObject.from(updateCommand.website),
        geographicZones: updateCommand.geographicZones,
        logoUrl: UrlValueObject.from(updateCommand.logoUrl),
        status: institutionWithService.status,
        type: institutionWithService.type,
        pays: institutionWithService.pays,
        services: [mockService],
      });

      mockRepository.update.mockResolvedValue(updatedInstitutionWithService);

      const result = await useCase.execute(updateCommand);

      expect(result.services).toHaveLength(1);
      expect(result.services[0]).toMatchObject({
        id: serviceId,
        name: 'Existing Service',
        longName: 'Existing Service Long Name',
        type: TypeService.ASSURANCE,
        typeFrais: TypeCalculation.FIX,
        conditionAccess: ['Condition 1'],
        plafonds: ['Plafond 1'],
        infrastructureAccess: ['Infra 1'],
      });
      expect(result.services[0].frais).toHaveProperty('typeCalculation');
      expect(result.services[0].frais).toHaveProperty('montantFixe', 200);
      expect(result.services[0].frais).toHaveProperty('pourcentage', 0.01);
    });
  });
});
