import { UpdateBeneficiaryUseCaseImpl } from '@/application/beneficiaires/use-cases/UpdateBeneficiaryUseCaseImpl';
import type { BeneficiaryRepository } from '@/domain/Beneficiary/ports/out/BeneficiaryRepository';
import { BeneficiaryStatus, type Beneficiary } from '@/domain/Beneficiary/entities/Beneficiary';

describe('UpdateBeneficiaryUseCaseImpl', () => {
  let useCase: UpdateBeneficiaryUseCaseImpl;
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

    useCase = new UpdateBeneficiaryUseCaseImpl(mockRepo);
  });

  describe('execute', () => {
    const validCommand = {
      organizationId: 'org-123',
      beneficiaryId: 'ben-1',
      firstName: 'Jean',
      lastName: 'Martin',
      phone: '+221771234567',
      status: BeneficiaryStatus.ACTIVE,
    };

    const existingBeneficiary: Beneficiary = {
      id: 'ben-1',
      organizationId: 'org-123',
      clerkUserId: 'clerk-user-123',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      phone: '+221770000000',
      birthDate: null,
      gender: null,
      status: BeneficiaryStatus.ACTIVE,
      progressPercent: 50,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    const updatedBeneficiary: Beneficiary = {
      ...existingBeneficiary,
      firstName: 'Jean',
      lastName: 'Martin',
      phone: '+221771234567',
      updatedAt: new Date(),
    };

    it('should update beneficiary successfully', async () => {
      mockRepo.findByIdInOrg.mockResolvedValue(existingBeneficiary);
      mockRepo.updateInOrg.mockResolvedValue(updatedBeneficiary);

      const result = await useCase.execute(validCommand);

      expect(result).toEqual(updatedBeneficiary);
      expect(mockRepo.findByIdInOrg).toHaveBeenCalledWith('org-123', 'ben-1');
      expect(mockRepo.updateInOrg).toHaveBeenCalledWith({
        organizationId: 'org-123',
        beneficiaryId: 'ben-1',
        firstName: 'Jean',
        lastName: 'Martin',
        phone: '+221771234567',
        status: BeneficiaryStatus.ACTIVE,
      });
    });

    it('should throw error when beneficiary not found', async () => {
      mockRepo.findByIdInOrg.mockResolvedValue(null);

      await expect(useCase.execute(validCommand)).rejects.toThrow('Bénéficiaire introuvable.');

      expect(mockRepo.findByIdInOrg).toHaveBeenCalledWith('org-123', 'ben-1');
      expect(mockRepo.updateInOrg).not.toHaveBeenCalled();
    });

    it('should update beneficiary with status change', async () => {
      const commandWithStatusChange = {
        ...validCommand,
        status: BeneficiaryStatus.INACTIVE,
      };

      const inactiveBeneficiary: Beneficiary = {
        ...updatedBeneficiary,
        status: BeneficiaryStatus.INACTIVE,
      };

      mockRepo.findByIdInOrg.mockResolvedValue(existingBeneficiary);
      mockRepo.updateInOrg.mockResolvedValue(inactiveBeneficiary);

      const result = await useCase.execute(commandWithStatusChange);

      expect(result.status).toBe(BeneficiaryStatus.INACTIVE);
      expect(mockRepo.updateInOrg).toHaveBeenCalledWith({
        organizationId: 'org-123',
        beneficiaryId: 'ben-1',
        firstName: 'Jean',
        lastName: 'Martin',
        phone: '+221771234567',
        status: BeneficiaryStatus.INACTIVE,
      });
    });

    it('should update beneficiary with undefined phone', async () => {
      const commandWithoutPhone = {
        ...validCommand,
        phone: undefined,
      };

      const beneficiaryWithoutPhone: Beneficiary = {
        ...updatedBeneficiary,
        phone: null,
      };

      mockRepo.findByIdInOrg.mockResolvedValue(existingBeneficiary);
      mockRepo.updateInOrg.mockResolvedValue(beneficiaryWithoutPhone);

      const result = await useCase.execute(commandWithoutPhone);

      expect(result.phone).toBeNull();
      expect(mockRepo.updateInOrg).toHaveBeenCalledWith({
        organizationId: 'org-123',
        beneficiaryId: 'ben-1',
        firstName: 'Jean',
        lastName: 'Martin',
        phone: undefined,
        status: BeneficiaryStatus.ACTIVE,
      });
    });

    it('should convert birthDate string to Date when provided', async () => {
      const commandWithBirthDate = {
        ...validCommand,
        birthDate: '1995-06-15',
      };

      const beneficiaryWithBirthDate: Beneficiary = {
        ...updatedBeneficiary,
        birthDate: new Date('1995-06-15'),
      };

      mockRepo.findByIdInOrg.mockResolvedValue(existingBeneficiary);
      mockRepo.updateInOrg.mockResolvedValue(beneficiaryWithBirthDate);

      await useCase.execute(commandWithBirthDate);

      expect(mockRepo.updateInOrg).toHaveBeenCalledWith(
        expect.objectContaining({
          birthDate: new Date('1995-06-15'),
        })
      );
    });

    it('should pass null for birthDate when explicitly set to null', async () => {
      const commandWithNullBirthDate = {
        ...validCommand,
        birthDate: null,
      };

      mockRepo.findByIdInOrg.mockResolvedValue(existingBeneficiary);
      mockRepo.updateInOrg.mockResolvedValue(updatedBeneficiary);

      await useCase.execute(commandWithNullBirthDate);

      expect(mockRepo.updateInOrg).toHaveBeenCalledWith(
        expect.objectContaining({
          birthDate: null,
        })
      );
    });

    it('should pass undefined for birthDate when not provided', async () => {
      const commandWithoutBirthDate = {
        ...validCommand,
        // birthDate is not set, so it is undefined
      };

      mockRepo.findByIdInOrg.mockResolvedValue(existingBeneficiary);
      mockRepo.updateInOrg.mockResolvedValue(updatedBeneficiary);

      await useCase.execute(commandWithoutBirthDate);

      expect(mockRepo.updateInOrg).toHaveBeenCalledWith(
        expect.objectContaining({
          birthDate: undefined,
        })
      );
    });

    it('should pass gender to updateInOrg', async () => {
      const commandWithGender = {
        ...validCommand,
        gender: 'FEMME' as const,
      };

      const beneficiaryWithGender: Beneficiary = {
        ...updatedBeneficiary,
        gender: 'FEMME',
      };

      mockRepo.findByIdInOrg.mockResolvedValue(existingBeneficiary);
      mockRepo.updateInOrg.mockResolvedValue(beneficiaryWithGender);

      const result = await useCase.execute(commandWithGender);

      expect(result.gender).toBe('FEMME');
      expect(mockRepo.updateInOrg).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: 'FEMME',
        })
      );
    });

    it('should propagate repository errors', async () => {
      mockRepo.findByIdInOrg.mockResolvedValue(existingBeneficiary);
      mockRepo.updateInOrg.mockRejectedValue(new Error('Database connection error'));

      await expect(useCase.execute(validCommand)).rejects.toThrow('Database connection error');

      expect(mockRepo.findByIdInOrg).toHaveBeenCalled();
      expect(mockRepo.updateInOrg).toHaveBeenCalled();
    });

    it('should handle beneficiary from different organization', async () => {
      mockRepo.findByIdInOrg.mockResolvedValue(null);

      const commandDifferentOrg = {
        ...validCommand,
        organizationId: 'org-456',
      };

      await expect(useCase.execute(commandDifferentOrg)).rejects.toThrow(
        'Bénéficiaire introuvable.'
      );

      expect(mockRepo.findByIdInOrg).toHaveBeenCalledWith('org-456', 'ben-1');
      expect(mockRepo.updateInOrg).not.toHaveBeenCalled();
    });
  });
});
