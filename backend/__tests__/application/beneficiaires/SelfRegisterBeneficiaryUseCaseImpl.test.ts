import { SelfRegisterBeneficiaryUseCaseImpl } from '@/application/beneficiaires/use-cases/SelfRegisterBeneficiaryUseCaseImpl';
import type { BeneficiaryRepository } from '@/domain/Beneficiary/ports/out/BeneficiaryRepository';
import { BeneficiaryStatus, Beneficiary } from '@/domain/Beneficiary/entities/Beneficiary';

describe('SelfRegisterBeneficiaryUseCaseImpl', () => {
  let useCase: SelfRegisterBeneficiaryUseCaseImpl;
  let mockBeneficiaryRepo: jest.Mocked<BeneficiaryRepository>;

  beforeEach(() => {
    mockBeneficiaryRepo = {
      getDemographicStats: jest.fn(),
      findByClerkUserId: jest.fn(),
      findByOrgId: jest.fn(),
      findByOrgAndEmail: jest.fn(),
      findByIdInOrg: jest.fn(),
      deleteByIdAndOrgId: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      updateInOrg: jest.fn(),
    } as jest.Mocked<BeneficiaryRepository>;

    useCase = new SelfRegisterBeneficiaryUseCaseImpl(mockBeneficiaryRepo);
  });

  describe('execute', () => {
    const validCommand = {
      clerkUserId: 'clerk-user-123',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      phone: '+221771234567',
      birthDate: '1990-05-15',
      gender: 'HOMME' as const,
    };

    const now = new Date();

    const makeBeneficiary = (): Beneficiary => {
      return new Beneficiary(
        'ben-1',
        null,
        'clerk-user-123',
        'Jean',
        'Dupont',
        'jean.dupont@example.com',
        '+221771234567',
        new Date('1990-05-15'),
        'HOMME',
        BeneficiaryStatus.ACTIVE,
        0,
        now,
        now
      );
    };

    it('should create a new beneficiary when none exists', async () => {
      const mockBeneficiary = makeBeneficiary();

      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockBeneficiaryRepo.findByEmail.mockResolvedValue(null);
      mockBeneficiaryRepo.create.mockResolvedValue(mockBeneficiary);

      const result = await useCase.execute(validCommand);

      expect(result).toEqual(mockBeneficiary);
      expect(mockBeneficiaryRepo.findByClerkUserId).toHaveBeenCalledWith('clerk-user-123');
      expect(mockBeneficiaryRepo.findByEmail).toHaveBeenCalledWith('jean.dupont@example.com');
      expect(mockBeneficiaryRepo.create).toHaveBeenCalledWith({
        organizationId: null,
        clerkUserId: 'clerk-user-123',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '+221771234567',
        birthDate: new Date('1990-05-15'),
        gender: 'HOMME',
      });
    });

    it('should return existing beneficiary when found by clerkUserId (idempotent)', async () => {
      const existingBeneficiary = makeBeneficiary();

      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(existingBeneficiary);

      const result = await useCase.execute(validCommand);

      expect(result).toEqual(existingBeneficiary);
      expect(mockBeneficiaryRepo.findByClerkUserId).toHaveBeenCalledWith('clerk-user-123');
      expect(mockBeneficiaryRepo.findByEmail).not.toHaveBeenCalled();
      expect(mockBeneficiaryRepo.create).not.toHaveBeenCalled();
    });

    it('should return existing beneficiary when found by email', async () => {
      const existingBeneficiary = makeBeneficiary();

      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockBeneficiaryRepo.findByEmail.mockResolvedValue(existingBeneficiary);

      const result = await useCase.execute(validCommand);

      expect(result).toEqual(existingBeneficiary);
      expect(mockBeneficiaryRepo.findByClerkUserId).toHaveBeenCalledWith('clerk-user-123');
      expect(mockBeneficiaryRepo.findByEmail).toHaveBeenCalledWith('jean.dupont@example.com');
      expect(mockBeneficiaryRepo.create).not.toHaveBeenCalled();
    });

    it('should pass organizationId as null to create', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockBeneficiaryRepo.findByEmail.mockResolvedValue(null);
      mockBeneficiaryRepo.create.mockResolvedValue(makeBeneficiary());

      await useCase.execute(validCommand);

      expect(mockBeneficiaryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ organizationId: null })
      );
    });

    it('should handle optional phone (undefined → null)', async () => {
      const commandWithoutPhone = { ...validCommand, phone: undefined };

      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockBeneficiaryRepo.findByEmail.mockResolvedValue(null);
      mockBeneficiaryRepo.create.mockResolvedValue(makeBeneficiary());

      await useCase.execute(commandWithoutPhone);

      expect(mockBeneficiaryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ phone: null })
      );
    });

    it('should handle optional birthDate (undefined → null)', async () => {
      const commandWithoutBirthDate = { ...validCommand, birthDate: undefined };

      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockBeneficiaryRepo.findByEmail.mockResolvedValue(null);
      mockBeneficiaryRepo.create.mockResolvedValue(makeBeneficiary());

      await useCase.execute(commandWithoutBirthDate);

      expect(mockBeneficiaryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ birthDate: null })
      );
    });

    it('should convert birthDate string to Date when provided', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockBeneficiaryRepo.findByEmail.mockResolvedValue(null);
      mockBeneficiaryRepo.create.mockResolvedValue(makeBeneficiary());

      await useCase.execute(validCommand);

      expect(mockBeneficiaryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ birthDate: new Date('1990-05-15') })
      );
    });

    it('should handle optional gender (undefined → null)', async () => {
      const commandWithoutGender = { ...validCommand, gender: undefined };

      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockBeneficiaryRepo.findByEmail.mockResolvedValue(null);
      mockBeneficiaryRepo.create.mockResolvedValue(makeBeneficiary());

      await useCase.execute(commandWithoutGender);

      expect(mockBeneficiaryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ gender: null })
      );
    });

    it('should propagate repository errors', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(useCase.execute(validCommand)).rejects.toThrow('Database connection failed');

      expect(mockBeneficiaryRepo.create).not.toHaveBeenCalled();
    });
  });
});
