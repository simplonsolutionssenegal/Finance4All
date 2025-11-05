import { InstitutionDomainService } from '@/domain/institutions/services/InstitutionDomainService';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import { Institution, InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import { InstitutionType } from '@/domain/institutions/value-objects/InstitutionType';
import { Country } from '@/domain/institutions/value-objects/Country';
import { randomUUID } from 'node:crypto';

describe('InstitutionDomainService', () => {
  let service: InstitutionDomainService;
  let mockRepository: jest.Mocked<InstitutionRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    service = new InstitutionDomainService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isNameUnique', () => {
    it('should return true when name is unique (no institutions found)', async () => {
      mockRepository.findByName.mockResolvedValue([]);

      const result = await service.isNameUnique('Unique Institution');

      expect(mockRepository.findByName).toHaveBeenCalledWith('Unique Institution');
      expect(result).toBe(true);
    });

    it('should return false when name is not unique (institutions found)', async () => {
      const existingInstitution = new Institution({
        id: EntityId.from(randomUUID()),
        name: 'Existing Institution',
        description: 'Description',
        website: UrlValueObject.from(null),
        geographicZones: ['EURO'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
        type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
        pays: Country.SENEGAL,
      });

      mockRepository.findByName.mockResolvedValue([existingInstitution]);

      const result = await service.isNameUnique('Existing Institution');

      expect(mockRepository.findByName).toHaveBeenCalledWith('Existing Institution');
      expect(result).toBe(false);
    });

    it('should return false when multiple institutions with same name exist', async () => {
      const institution1 = new Institution({
        id: EntityId.from(randomUUID()),
        name: 'Duplicate Institution',
        description: 'Description 1',
        website: UrlValueObject.from(null),
        geographicZones: ['EURO'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
        type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
        pays: Country.SENEGAL,
      });

      const institution2 = new Institution({
        id: EntityId.from(randomUUID()),
        name: 'Duplicate Institution',
        description: 'Description 2',
        website: UrlValueObject.from(null),
        geographicZones: ['USD'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.PENDING,
        services: [],
        type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
        pays: Country.SENEGAL,
      });

      mockRepository.findByName.mockResolvedValue([institution1, institution2]);

      const result = await service.isNameUnique('Duplicate Institution');

      expect(mockRepository.findByName).toHaveBeenCalledWith('Duplicate Institution');
      expect(result).toBe(false);
    });

    it('should handle different institution names', async () => {
      mockRepository.findByName.mockResolvedValue([]);

      const result1 = await service.isNameUnique('Bank A');
      const result2 = await service.isNameUnique('Bank B');

      expect(mockRepository.findByName).toHaveBeenCalledWith('Bank A');
      expect(mockRepository.findByName).toHaveBeenCalledWith('Bank B');
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(mockRepository.findByName).toHaveBeenCalledTimes(2);
    });
  });
});
