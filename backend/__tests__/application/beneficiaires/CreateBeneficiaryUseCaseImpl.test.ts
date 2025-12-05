import { CreateBeneficiaryUseCaseImpl } from '@/application/beneficiaires/use-cases/CreateBeneficiaryUseCaseImpl';
import type { BeneficiaryRepository } from '@/domain/Beneficiary/ports/out/BeneficiaryRepository';
import type { OrganizationIdentityPort } from '@/domain/Beneficiary/ports/out/OrganizationIdentityPort';
import { BeneficiaryStatus, type Beneficiary } from '@/domain/Beneficiary/entities/Beneficiary';

describe('CreateBeneficiaryUseCaseImpl', () => {
  let useCase: CreateBeneficiaryUseCaseImpl;
  let mockBeneficiaryRepo: jest.Mocked<BeneficiaryRepository>;
  let mockOrgIdentity: jest.Mocked<OrganizationIdentityPort>;

  beforeEach(() => {
    mockBeneficiaryRepo = {
      findByOrgAndEmail: jest.fn(),
      findByIdInOrg: jest.fn(),
      findByOrgId: jest.fn(),
      create: jest.fn(),
      updateInOrg: jest.fn(),
    } as jest.Mocked<BeneficiaryRepository>;

    mockOrgIdentity = {
      upsertUser: jest.fn(),
      ensureMembership: jest.fn(),
    } as jest.Mocked<OrganizationIdentityPort>;

    useCase = new CreateBeneficiaryUseCaseImpl(mockBeneficiaryRepo, mockOrgIdentity);
  });

  describe('execute', () => {
    const validCommand = {
      organizationId: 'org-123',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      phone: '+221771234567',
      generateTempPassword: true,
    };

    it('should create a beneficiary successfully with temp password', async () => {
      const mockBeneficiary: Beneficiary = {
        id: 'ben-1',
        organizationId: 'org-123',
        clerkUserId: 'clerk-user-123',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '+221771234567',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBeneficiaryRepo.findByOrgAndEmail.mockResolvedValue(null);
      mockOrgIdentity.upsertUser.mockResolvedValue({ clerkUserId: 'clerk-user-123' });
      mockOrgIdentity.ensureMembership.mockResolvedValue(undefined);
      mockBeneficiaryRepo.create.mockResolvedValue(mockBeneficiary);

      const result = await useCase.execute(validCommand);

      expect(result.beneficiary).toEqual(mockBeneficiary);
      expect(result.tempPassword).toBeDefined();
      expect(typeof result.tempPassword).toBe('string');
      expect(mockBeneficiaryRepo.findByOrgAndEmail).toHaveBeenCalledWith(
        'org-123',
        'jean.dupont@example.com'
      );
      expect(mockOrgIdentity.upsertUser).toHaveBeenCalledWith({
        email: 'jean.dupont@example.com',
        firstName: 'Jean',
        lastName: 'Dupont',
        tempPassword: expect.any(String),
      });
      expect(mockOrgIdentity.ensureMembership).toHaveBeenCalledWith({
        organizationId: 'org-123',
        clerkUserId: 'clerk-user-123',
        role: 'org:recipient',
      });
      expect(mockBeneficiaryRepo.create).toHaveBeenCalledWith({
        organizationId: 'org-123',
        clerkUserId: 'clerk-user-123',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '+221771234567',
      });
    });

    it('should create a beneficiary without temp password when generateTempPassword is false', async () => {
      const commandWithoutPassword = { ...validCommand, generateTempPassword: false };
      const mockBeneficiary: Beneficiary = {
        id: 'ben-2',
        organizationId: 'org-123',
        clerkUserId: 'clerk-user-456',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '+221771234567',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBeneficiaryRepo.findByOrgAndEmail.mockResolvedValue(null);
      mockOrgIdentity.upsertUser.mockResolvedValue({ clerkUserId: 'clerk-user-456' });
      mockOrgIdentity.ensureMembership.mockResolvedValue(undefined);
      mockBeneficiaryRepo.create.mockResolvedValue(mockBeneficiary);

      const result = await useCase.execute(commandWithoutPassword);

      expect(result.beneficiary).toEqual(mockBeneficiary);
      expect(result.tempPassword).toBeUndefined();
      expect(mockOrgIdentity.upsertUser).toHaveBeenCalledWith({
        email: 'jean.dupont@example.com',
        firstName: 'Jean',
        lastName: 'Dupont',
        tempPassword: undefined,
      });
    });

    it('should throw error when beneficiary already exists', async () => {
      const existingBeneficiary: Beneficiary = {
        id: 'ben-existing',
        organizationId: 'org-123',
        clerkUserId: 'clerk-user-existing',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '+221771234567',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBeneficiaryRepo.findByOrgAndEmail.mockResolvedValue(existingBeneficiary);

      await expect(useCase.execute(validCommand)).rejects.toThrow(
        'Bénéficiaire déjà existant dans cette organisation.'
      );

      expect(mockBeneficiaryRepo.findByOrgAndEmail).toHaveBeenCalledWith(
        'org-123',
        'jean.dupont@example.com'
      );
      expect(mockOrgIdentity.upsertUser).not.toHaveBeenCalled();
      expect(mockBeneficiaryRepo.create).not.toHaveBeenCalled();
    });

    it('should handle phone as null when not provided', async () => {
      const commandWithoutPhone = { ...validCommand, phone: undefined };
      const mockBeneficiary: Beneficiary = {
        id: 'ben-3',
        organizationId: 'org-123',
        clerkUserId: 'clerk-user-789',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: null,
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBeneficiaryRepo.findByOrgAndEmail.mockResolvedValue(null);
      mockOrgIdentity.upsertUser.mockResolvedValue({ clerkUserId: 'clerk-user-789' });
      mockOrgIdentity.ensureMembership.mockResolvedValue(undefined);
      mockBeneficiaryRepo.create.mockResolvedValue(mockBeneficiary);

      const result = await useCase.execute(commandWithoutPhone);

      expect(result.beneficiary).toEqual(mockBeneficiary);
      expect(mockBeneficiaryRepo.create).toHaveBeenCalledWith({
        organizationId: 'org-123',
        clerkUserId: 'clerk-user-789',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: null,
      });
    });

    it('should propagate errors from OrganizationIdentityPort', async () => {
      mockBeneficiaryRepo.findByOrgAndEmail.mockResolvedValue(null);
      mockOrgIdentity.upsertUser.mockRejectedValue(new Error('Clerk API error'));

      await expect(useCase.execute(validCommand)).rejects.toThrow('Clerk API error');

      expect(mockBeneficiaryRepo.create).not.toHaveBeenCalled();
    });
  });
});
