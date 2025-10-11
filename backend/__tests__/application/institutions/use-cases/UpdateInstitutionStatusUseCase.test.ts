import { UpdateInstitutionStatusUseCaseImpl } from '@/application/institutions/use-cases/UpdateInstitutionStatusUseCase';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import { Institution, InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { randomUUID } from 'crypto';

// Helper to create a new Institution instance from an existing one for tests
const cloneInstitution = (institution: Institution, newStatus: InstitutionStatus): Institution => {
  return new Institution({
    id: institution.id,
    name: institution.name,
    description: institution.description,
    website: institution.website,
    geographicZones: institution.geographicZones,
    logoUrl: institution.logoUrl,
    status: newStatus,
    services: [],
  });
};

describe('UpdateInstitutionStatusUseCaseImpl', () => {
  let useCase: UpdateInstitutionStatusUseCaseImpl;
  let mockRepository: jest.Mocked<InstitutionRepository>;
  const testId = randomUUID();

  const existingInstitution = new Institution({
    id: EntityId.from(testId),
    name: 'Old Name',
    description: 'Old Description',
    website: UrlValueObject.from('https://old.com'),
    geographicZones: ['UEMOA'],
    logoUrl: UrlValueObject.from('https://old.com/logo.png'),
    status: InstitutionStatus.PENDING,
    services: [],
  });

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    useCase = new UpdateInstitutionStatusUseCaseImpl(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should throw NotFoundError if institution does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const command = { id: testId, status: InstitutionStatus.ACTIVE };
      await expect(useCase.execute(command)).rejects.toThrow(NotFoundError);
      await expect(useCase.execute(command)).rejects.toThrow(
        `Institution with id ${testId} not found`
      );
      expect(mockRepository.findById).toHaveBeenCalledWith(testId);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should activate an institution', async () => {
      const institutionToActivate = cloneInstitution(
        existingInstitution,
        InstitutionStatus.PENDING
      );
      mockRepository.findById.mockResolvedValue(institutionToActivate);

      const updatedInstitution = cloneInstitution(institutionToActivate, InstitutionStatus.ACTIVE);
      mockRepository.update.mockResolvedValue(updatedInstitution);

      const command = { id: testId, status: InstitutionStatus.ACTIVE };
      const result = await useCase.execute(command);

      expect(mockRepository.findById).toHaveBeenCalledWith(testId);
      expect(mockRepository.update).toHaveBeenCalledWith(expect.any(Institution));
      const updatedArgument = mockRepository.update.mock.calls[0][0];
      expect(updatedArgument.status).toBe(InstitutionStatus.ACTIVE);
      expect(result.status).toBe(InstitutionStatus.ACTIVE);
    });

    it('should deactivate an institution', async () => {
      const institutionToDeactivate = cloneInstitution(
        existingInstitution,
        InstitutionStatus.ACTIVE
      );
      mockRepository.findById.mockResolvedValue(institutionToDeactivate);

      const updatedInstitution = cloneInstitution(
        institutionToDeactivate,
        InstitutionStatus.INACTIVE
      );
      mockRepository.update.mockResolvedValue(updatedInstitution);

      const command = { id: testId, status: InstitutionStatus.INACTIVE };
      const result = await useCase.execute(command);

      expect(mockRepository.findById).toHaveBeenCalledWith(testId);
      expect(mockRepository.update).toHaveBeenCalledWith(expect.any(Institution));
      const updatedArgument = mockRepository.update.mock.calls[0][0];
      expect(updatedArgument.status).toBe(InstitutionStatus.INACTIVE);
      expect(result.status).toBe(InstitutionStatus.INACTIVE);
    });

    it('should not change status if command status is not ACTIVE or INACTIVE', async () => {
      mockRepository.findById.mockResolvedValue(existingInstitution);
      mockRepository.update.mockResolvedValue(existingInstitution);

      const command = { id: testId, status: InstitutionStatus.PENDING };
      const result = await useCase.execute(command);

      expect(mockRepository.findById).toHaveBeenCalledWith(testId);
      expect(mockRepository.update).toHaveBeenCalledWith(existingInstitution);
      expect(result.status).toBe(InstitutionStatus.PENDING);
    });

    it('should convert institution to DTO correctly', async () => {
      mockRepository.findById.mockResolvedValue(existingInstitution);
      const updatedInstitution = cloneInstitution(existingInstitution, InstitutionStatus.ACTIVE);
      mockRepository.update.mockResolvedValue(updatedInstitution);

      const command = { id: testId, status: InstitutionStatus.ACTIVE };
      const result = await useCase.execute(command);

      expect(result).toEqual({
        id: testId,
        name: existingInstitution.name,
        description: existingInstitution.description,
        website: existingInstitution.website.getValue(),
        geographicZones: existingInstitution.geographicZones,
        logoUrl: existingInstitution.logoUrl.getValue(),
        status: InstitutionStatus.ACTIVE,
        createdAt: updatedInstitution.createdAt,
        updatedAt: updatedInstitution.updatedAt,
      });
    });
  });
});
