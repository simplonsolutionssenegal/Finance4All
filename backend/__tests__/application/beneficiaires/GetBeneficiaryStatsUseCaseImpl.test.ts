import { GetBeneficiaryStatsUseCaseImpl } from '@/application/beneficiaires/use-cases/GetBeneficiaryStatsUseCaseImpl';
import type {
  BeneficiaryRepository,
  DemographicStats,
} from '@/domain/Beneficiary/ports/out/BeneficiaryRepository';

describe('GetBeneficiaryStatsUseCaseImpl', () => {
  let useCase: GetBeneficiaryStatsUseCaseImpl;
  let mockRepo: jest.Mocked<BeneficiaryRepository>;

  beforeEach(() => {
    mockRepo = {
      getDemographicStats: jest.fn(),
      findByClerkUserId: jest.fn(),
      findByOrgAndEmail: jest.fn(),
      findByIdInOrg: jest.fn(),
      findByOrgId: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      updateInOrg: jest.fn(),
      deleteByIdAndOrgId: jest.fn(),
    } as jest.Mocked<BeneficiaryRepository>;

    useCase = new GetBeneficiaryStatsUseCaseImpl(mockRepo);
  });

  describe('execute', () => {
    const mockStats: DemographicStats = {
      total: 100,
      women: 45,
      youth: 30,
      inTraining: 60,
    };

    it('should return demographic stats for a specific organization', async () => {
      mockRepo.getDemographicStats.mockResolvedValue(mockStats);

      const result = await useCase.execute('org-123');

      expect(result).toEqual(mockStats);
      expect(mockRepo.getDemographicStats).toHaveBeenCalledWith('org-123');
    });

    it('should return demographic stats for all organizations when no organizationId provided', async () => {
      mockRepo.getDemographicStats.mockResolvedValue(mockStats);

      const result = await useCase.execute();

      expect(result).toEqual(mockStats);
      expect(mockRepo.getDemographicStats).toHaveBeenCalledWith(undefined);
    });

    it('should propagate repository errors', async () => {
      mockRepo.getDemographicStats.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute('org-123')).rejects.toThrow('Database error');
    });
  });
});
