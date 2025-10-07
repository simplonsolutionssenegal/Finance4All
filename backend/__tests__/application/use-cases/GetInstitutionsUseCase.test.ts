import { GetInstitutionsUseCaseImpl } from '@/application/use-cases/GetInstitutionsUseCase';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import { Institution, InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';

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
      });

      const institution2 = new Institution({
        id: EntityId.generate(),
        name: 'Institution 2',
        description: 'Description 2',
        website: UrlValueObject.from('https://test2.com'),
        geographicZones: ['EURO'],
        logoUrl: UrlValueObject.from('https://test2.com/logo.png'),
        status: InstitutionStatus.PENDING,
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
  });
});
