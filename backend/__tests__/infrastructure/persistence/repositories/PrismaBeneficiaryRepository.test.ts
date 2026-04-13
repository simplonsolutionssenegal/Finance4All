import { PrismaBeneficiaryRepository } from '@/infrastructure/persistence/repositories/PrismaBeneficiaryRepository';
import { Beneficiary, BeneficiaryStatus } from '@/domain/Beneficiary/entities/Beneficiary';
import type { PrismaClient } from '@prisma/client';

describe('PrismaBeneficiaryRepository', () => {
  let repository: PrismaBeneficiaryRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      beneficiary: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
      },
    };

    repository = new PrismaBeneficiaryRepository(mockPrisma as PrismaClient);
    jest.clearAllMocks();
  });

  describe('findByClerkUserId', () => {
    it('should return beneficiary when found', async () => {
      const mockRow = {
        id: 'ben-1',
        organizationId: 'org-123',
        clerkUserId: 'clerk-user-1',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        phone: '+221771234567',
        status: 'ACTIVE',
        progressPercent: 50,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };
      mockPrisma.beneficiary.findUnique.mockResolvedValue(mockRow);

      const result = await repository.findByClerkUserId('clerk-user-1');

      expect(mockPrisma.beneficiary.findUnique).toHaveBeenCalledWith({
        where: { clerkUserId: 'clerk-user-1' },
      });
      expect(result).toBeInstanceOf(Beneficiary);
      expect(result?.id).toBe('ben-1');
      expect(result?.clerkUserId).toBe('clerk-user-1');
    });

    it('should return null when not found', async () => {
      mockPrisma.beneficiary.findUnique.mockResolvedValue(null);

      const result = await repository.findByClerkUserId('clerk-unknown');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return beneficiary when found by email', async () => {
      const mockRow = {
        id: 'ben-email-1',
        organizationId: 'org-123',
        clerkUserId: 'clerk-email-1',
        firstName: 'Fatou',
        lastName: 'Diallo',
        email: 'fatou@example.com',
        phone: '+221771234567',
        birthDate: new Date('1995-06-15'),
        gender: 'FEMME',
        status: 'ACTIVE',
        progressPercent: 60,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };
      mockPrisma.beneficiary.findUnique.mockResolvedValue(mockRow);

      const result = await repository.findByEmail('fatou@example.com');

      expect(result).toBeInstanceOf(Beneficiary);
      expect(result?.id).toBe('ben-email-1');
      expect(result?.email).toBe('fatou@example.com');
      expect(result?.firstName).toBe('Fatou');
      expect(result?.organizationId).toBe('org-123');
    });

    it('should return null when email not found', async () => {
      mockPrisma.beneficiary.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('unknown@example.com');

      expect(result).toBeNull();
    });

    it('should call prisma.beneficiary.findUnique with correct where clause', async () => {
      mockPrisma.beneficiary.findUnique.mockResolvedValue(null);

      await repository.findByEmail('test@example.com');

      expect(mockPrisma.beneficiary.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('findByEmail with null organizationId', () => {
    it('should correctly map toDomain with null organizationId for self-registered beneficiaries', async () => {
      const mockRow = {
        id: 'ben-self-reg',
        organizationId: null,
        clerkUserId: 'clerk-self-1',
        firstName: 'Amadou',
        lastName: 'Ba',
        email: 'amadou@example.com',
        phone: null,
        birthDate: null,
        gender: null,
        status: 'ACTIVE',
        progressPercent: 0,
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01'),
      };
      mockPrisma.beneficiary.findUnique.mockResolvedValue(mockRow);

      const result = await repository.findByEmail('amadou@example.com');

      expect(result).toBeInstanceOf(Beneficiary);
      expect(result?.organizationId).toBeNull();
      expect(result?.id).toBe('ben-self-reg');
      expect(result?.clerkUserId).toBe('clerk-self-1');
      expect(result?.birthDate).toBeNull();
      expect(result?.gender).toBeNull();
    });
  });

  describe('findByOrgId', () => {
    it('should return array of beneficiaries for given organization', async () => {
      const mockData = [
        {
          id: 'ben-1',
          organizationId: 'org-123',
          clerkUserId: 'clerk-1',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean@example.com',
          phone: '+221771234567',
          status: 'ACTIVE',
          progressPercent: 50,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        },
        {
          id: 'ben-2',
          organizationId: 'org-123',
          clerkUserId: 'clerk-2',
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'marie@example.com',
          phone: null,
          status: 'INACTIVE',
          progressPercent: 25,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-04'),
        },
      ];

      mockPrisma.beneficiary.findMany.mockResolvedValue(mockData);

      const result = await repository.findByOrgId('org-123');

      expect(mockPrisma.beneficiary.findMany).toHaveBeenCalledWith({
        where: { organizationId: 'org-123' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Beneficiary);
      expect(result[0].id).toBe('ben-1');
      expect(result[0].status).toBe(BeneficiaryStatus.ACTIVE);
      expect(result[1].id).toBe('ben-2');
      expect(result[1].status).toBe(BeneficiaryStatus.INACTIVE);
    });

    it('should return empty array when no beneficiaries found', async () => {
      mockPrisma.beneficiary.findMany.mockResolvedValue([]);

      const result = await repository.findByOrgId('org-empty');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should order results by createdAt desc', async () => {
      mockPrisma.beneficiary.findMany.mockResolvedValue([]);

      await repository.findByOrgId('org-123');

      expect(mockPrisma.beneficiary.findMany).toHaveBeenCalledWith({
        where: { organizationId: 'org-123' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByOrgAndEmail', () => {
    it('should return beneficiary when found by org and email', async () => {
      const mockData = {
        id: 'ben-found',
        organizationId: 'org-456',
        clerkUserId: 'clerk-456',
        firstName: 'Found',
        lastName: 'User',
        email: 'found@example.com',
        phone: '+221771111111',
        status: 'ACTIVE',
        progressPercent: 75,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-02'),
      };

      mockPrisma.beneficiary.findFirst.mockResolvedValue(mockData);

      const result = await repository.findByOrgAndEmail('org-456', 'found@example.com');

      expect(mockPrisma.beneficiary.findFirst).toHaveBeenCalledWith({
        where: { organizationId: 'org-456', email: 'found@example.com' },
      });
      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(Beneficiary);
      expect(result?.id).toBe('ben-found');
      expect(result?.email).toBe('found@example.com');
    });

    it('should return null when beneficiary not found', async () => {
      mockPrisma.beneficiary.findFirst.mockResolvedValue(null);

      const result = await repository.findByOrgAndEmail('org-789', 'notfound@example.com');

      expect(result).toBeNull();
    });

    it('should convert Prisma status to domain status', async () => {
      const mockData = {
        id: 'ben-status',
        organizationId: 'org-123',
        clerkUserId: 'clerk-123',
        firstName: 'Test',
        lastName: 'Status',
        email: 'status@example.com',
        phone: null,
        status: 'INACTIVE',
        progressPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.beneficiary.findFirst.mockResolvedValue(mockData);

      const result = await repository.findByOrgAndEmail('org-123', 'status@example.com');

      expect(result?.status).toBe(BeneficiaryStatus.INACTIVE);
    });
  });

  describe('findByIdInOrg', () => {
    it('should return beneficiary when found by id in organization', async () => {
      const mockData = {
        id: 'ben-123',
        organizationId: 'org-123',
        clerkUserId: 'clerk-123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: null,
        status: 'ACTIVE',
        progressPercent: 40,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.beneficiary.findFirst.mockResolvedValue(mockData);

      const result = await repository.findByIdInOrg('org-123', 'ben-123');

      expect(mockPrisma.beneficiary.findFirst).toHaveBeenCalledWith({
        where: { id: 'ben-123', organizationId: 'org-123' },
      });
      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(Beneficiary);
      expect(result?.id).toBe('ben-123');
      expect(result?.organizationId).toBe('org-123');
    });

    it('should return null when beneficiary not found', async () => {
      mockPrisma.beneficiary.findFirst.mockResolvedValue(null);

      const result = await repository.findByIdInOrg('org-456', 'ben-nonexistent');

      expect(result).toBeNull();
    });

    it('should return null when beneficiary belongs to different organization', async () => {
      mockPrisma.beneficiary.findFirst.mockResolvedValue(null);

      const result = await repository.findByIdInOrg('org-wrong', 'ben-123');

      expect(mockPrisma.beneficiary.findFirst).toHaveBeenCalledWith({
        where: { id: 'ben-123', organizationId: 'org-wrong' },
      });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create beneficiary with all required fields', async () => {
      const now = new Date();
      const mockCreated = {
        id: 'ben-new',
        organizationId: 'org-123',
        clerkUserId: 'clerk-new',
        firstName: 'New',
        lastName: 'Beneficiary',
        email: 'new@example.com',
        phone: '+221772222222',
        status: 'ACTIVE',
        progressPercent: 0,
        createdAt: now,
        updatedAt: now,
      };

      mockPrisma.beneficiary.create.mockResolvedValue(mockCreated);

      const input = {
        organizationId: 'org-123',
        clerkUserId: 'clerk-new',
        firstName: 'New',
        lastName: 'Beneficiary',
        email: 'new@example.com',
        phone: '+221772222222',
      };

      const result = await repository.create(input);

      expect(mockPrisma.beneficiary.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org-123',
          clerkUserId: 'clerk-new',
          firstName: 'New',
          lastName: 'Beneficiary',
          email: 'new@example.com',
          phone: '+221772222222',
          birthDate: null,
          gender: null,
        },
      });
      expect(result).toBeInstanceOf(Beneficiary);
      expect(result.id).toBe('ben-new');
      expect(result.firstName).toBe('New');
      expect(result.lastName).toBe('Beneficiary');
      expect(result.email).toBe('new@example.com');
      expect(result.phone).toBe('+221772222222');
      expect(result.status).toBe(BeneficiaryStatus.ACTIVE);
      expect(result.progressPercent).toBe(0);
    });

    it('should create beneficiary without phone', async () => {
      const mockCreated = {
        id: 'ben-no-phone',
        organizationId: 'org-456',
        clerkUserId: 'clerk-456',
        firstName: 'No',
        lastName: 'Phone',
        email: 'nophone@example.com',
        phone: null,
        status: 'ACTIVE',
        progressPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.beneficiary.create.mockResolvedValue(mockCreated);

      const input = {
        organizationId: 'org-456',
        clerkUserId: 'clerk-456',
        firstName: 'No',
        lastName: 'Phone',
        email: 'nophone@example.com',
      };

      const result = await repository.create(input);

      expect(mockPrisma.beneficiary.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org-456',
          clerkUserId: 'clerk-456',
          firstName: 'No',
          lastName: 'Phone',
          email: 'nophone@example.com',
          phone: null,
          birthDate: null,
          gender: null,
        },
      });
      expect(result.phone).toBeNull();
    });

    it('should handle phone as null explicitly', async () => {
      const mockCreated = {
        id: 'ben-null-phone',
        organizationId: 'org-789',
        clerkUserId: 'clerk-789',
        firstName: 'Null',
        lastName: 'Phone',
        email: 'nullphone@example.com',
        phone: null,
        status: 'ACTIVE',
        progressPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.beneficiary.create.mockResolvedValue(mockCreated);

      const input = {
        organizationId: 'org-789',
        clerkUserId: 'clerk-789',
        firstName: 'Null',
        lastName: 'Phone',
        email: 'nullphone@example.com',
        phone: null,
      };

      const result = await repository.create(input);

      expect(mockPrisma.beneficiary.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phone: null,
        }),
      });
      expect(result.phone).toBeNull();
    });
  });

  describe('updateInOrg', () => {
    it('should update beneficiary with partial data', async () => {
      const mockExists = {
        id: 'ben-update',
        organizationId: 'org-123',
        clerkUserId: 'clerk-123',
        firstName: 'Old',
        lastName: 'Name',
        email: 'test@example.com',
        phone: '+221773333333',
        status: 'ACTIVE',
        progressPercent: 50,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const mockUpdated = {
        ...mockExists,
        firstName: 'Updated',
        lastName: 'NewName',
        updatedAt: new Date(),
      };

      mockPrisma.beneficiary.findFirst.mockResolvedValue(mockExists);
      mockPrisma.beneficiary.update.mockResolvedValue(mockUpdated);

      const input = {
        organizationId: 'org-123',
        beneficiaryId: 'ben-update',
        firstName: 'Updated',
        lastName: 'NewName',
      };

      const result = await repository.updateInOrg(input);

      expect(mockPrisma.beneficiary.findFirst).toHaveBeenCalledWith({
        where: { id: 'ben-update', organizationId: 'org-123' },
      });
      expect(mockPrisma.beneficiary.update).toHaveBeenCalledWith({
        where: { id: 'ben-update' },
        data: {
          firstName: 'Updated',
          lastName: 'NewName',
        },
      });
      expect(result).toBeInstanceOf(Beneficiary);
      expect(result.firstName).toBe('Updated');
      expect(result.lastName).toBe('NewName');
    });

    it('should update only status field', async () => {
      const mockExists = {
        id: 'ben-status',
        organizationId: 'org-456',
        clerkUserId: 'clerk-456',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: null,
        status: 'ACTIVE',
        progressPercent: 80,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdated = {
        ...mockExists,
        status: 'INACTIVE',
        updatedAt: new Date(),
      };

      mockPrisma.beneficiary.findFirst.mockResolvedValue(mockExists);
      mockPrisma.beneficiary.update.mockResolvedValue(mockUpdated);

      const input = {
        organizationId: 'org-456',
        beneficiaryId: 'ben-status',
        status: 'INACTIVE' as const,
      };

      const result = await repository.updateInOrg(input);

      expect(mockPrisma.beneficiary.update).toHaveBeenCalledWith({
        where: { id: 'ben-status' },
        data: {
          status: 'INACTIVE',
        },
      });
      expect(result.status).toBe(BeneficiaryStatus.INACTIVE);
    });

    it('should update phone to null', async () => {
      const mockExists = {
        id: 'ben-remove-phone',
        organizationId: 'org-789',
        clerkUserId: 'clerk-789',
        firstName: 'No',
        lastName: 'Phone',
        email: 'nophone@example.com',
        phone: '+221774444444',
        status: 'ACTIVE',
        progressPercent: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdated = {
        ...mockExists,
        phone: null,
        updatedAt: new Date(),
      };

      mockPrisma.beneficiary.findFirst.mockResolvedValue(mockExists);
      mockPrisma.beneficiary.update.mockResolvedValue(mockUpdated);

      const input = {
        organizationId: 'org-789',
        beneficiaryId: 'ben-remove-phone',
        phone: null,
      };

      const result = await repository.updateInOrg(input);

      expect(mockPrisma.beneficiary.update).toHaveBeenCalledWith({
        where: { id: 'ben-remove-phone' },
        data: {
          phone: null,
        },
      });
      expect(result.phone).toBeNull();
    });

    it('should throw error when beneficiary not found', async () => {
      mockPrisma.beneficiary.findFirst.mockResolvedValue(null);

      const input = {
        organizationId: 'org-123',
        beneficiaryId: 'ben-nonexistent',
        firstName: 'Updated',
      };

      await expect(repository.updateInOrg(input)).rejects.toThrow(
        'Accès refusé (organisation) ou bénéficiaire introuvable.'
      );

      expect(mockPrisma.beneficiary.update).not.toHaveBeenCalled();
    });

    it('should throw error when beneficiary belongs to different organization', async () => {
      mockPrisma.beneficiary.findFirst.mockResolvedValue(null);

      const input = {
        organizationId: 'org-wrong',
        beneficiaryId: 'ben-123',
        firstName: 'Updated',
      };

      await expect(repository.updateInOrg(input)).rejects.toThrow(
        'Accès refusé (organisation) ou bénéficiaire introuvable.'
      );

      expect(mockPrisma.beneficiary.findFirst).toHaveBeenCalledWith({
        where: { id: 'ben-123', organizationId: 'org-wrong' },
      });
    });

    it('should update all optional fields together', async () => {
      const mockExists = {
        id: 'ben-all',
        organizationId: 'org-all',
        clerkUserId: 'clerk-all',
        firstName: 'Old',
        lastName: 'Name',
        email: 'all@example.com',
        phone: '+221771111111',
        status: 'ACTIVE',
        progressPercent: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdated = {
        ...mockExists,
        firstName: 'All',
        lastName: 'Updated',
        phone: '+221775555555',
        status: 'INACTIVE',
        updatedAt: new Date(),
      };

      mockPrisma.beneficiary.findFirst.mockResolvedValue(mockExists);
      mockPrisma.beneficiary.update.mockResolvedValue(mockUpdated);

      const input = {
        organizationId: 'org-all',
        beneficiaryId: 'ben-all',
        firstName: 'All',
        lastName: 'Updated',
        phone: '+221775555555',
        status: 'INACTIVE' as const,
      };

      const result = await repository.updateInOrg(input);

      expect(mockPrisma.beneficiary.update).toHaveBeenCalledWith({
        where: { id: 'ben-all' },
        data: {
          firstName: 'All',
          lastName: 'Updated',
          phone: '+221775555555',
          status: 'INACTIVE',
        },
      });
      expect(result.firstName).toBe('All');
      expect(result.lastName).toBe('Updated');
      expect(result.phone).toBe('+221775555555');
      expect(result.status).toBe(BeneficiaryStatus.INACTIVE);
    });

    it('should not include undefined fields in update data', async () => {
      const mockExists = {
        id: 'ben-partial',
        organizationId: 'org-123',
        clerkUserId: 'clerk-123',
        firstName: 'Keep',
        lastName: 'Me',
        email: 'keep@example.com',
        phone: '+221776666666',
        status: 'ACTIVE',
        progressPercent: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdated = {
        ...mockExists,
        firstName: 'OnlyThis',
        updatedAt: new Date(),
      };

      mockPrisma.beneficiary.findFirst.mockResolvedValue(mockExists);
      mockPrisma.beneficiary.update.mockResolvedValue(mockUpdated);

      const input = {
        organizationId: 'org-123',
        beneficiaryId: 'ben-partial',
        firstName: 'OnlyThis',
        // lastName, phone, status are undefined - should not be in data
      };

      await repository.updateInOrg(input);

      expect(mockPrisma.beneficiary.update).toHaveBeenCalledWith({
        where: { id: 'ben-partial' },
        data: {
          firstName: 'OnlyThis',
          // No other fields
        },
      });
    });
  });

  describe('deleteByIdAndOrgId', () => {
    it('should delete beneficiary and return true when found', async () => {
      mockPrisma.beneficiary.deleteMany.mockResolvedValue({ count: 1 });

      const result = await repository.deleteByIdAndOrgId('ben-123', 'org-123');

      expect(mockPrisma.beneficiary.deleteMany).toHaveBeenCalledWith({
        where: { id: 'ben-123', organizationId: 'org-123' },
      });
      expect(result).toBe(true);
    });

    it('should return false when beneficiary not found', async () => {
      mockPrisma.beneficiary.deleteMany.mockResolvedValue({ count: 0 });

      const result = await repository.deleteByIdAndOrgId('ben-nonexistent', 'org-123');

      expect(mockPrisma.beneficiary.deleteMany).toHaveBeenCalledWith({
        where: { id: 'ben-nonexistent', organizationId: 'org-123' },
      });
      expect(result).toBe(false);
    });

    it('should return false when beneficiary belongs to different organization', async () => {
      mockPrisma.beneficiary.deleteMany.mockResolvedValue({ count: 0 });

      const result = await repository.deleteByIdAndOrgId('ben-123', 'org-wrong');

      expect(mockPrisma.beneficiary.deleteMany).toHaveBeenCalledWith({
        where: { id: 'ben-123', organizationId: 'org-wrong' },
      });
      expect(result).toBe(false);
    });
  });

  describe('Status Conversion', () => {
    it('should convert ACTIVE status from Prisma to domain', async () => {
      const mockData = {
        id: 'ben-active',
        organizationId: 'org-123',
        clerkUserId: 'clerk-123',
        firstName: 'Active',
        lastName: 'User',
        email: 'active@example.com',
        phone: null,
        status: 'ACTIVE',
        progressPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.beneficiary.findFirst.mockResolvedValue(mockData);

      const result = await repository.findByOrgAndEmail('org-123', 'active@example.com');

      expect(result?.status).toBe(BeneficiaryStatus.ACTIVE);
    });

    it('should convert INACTIVE status from Prisma to domain', async () => {
      const mockData = {
        id: 'ben-inactive',
        organizationId: 'org-123',
        clerkUserId: 'clerk-123',
        firstName: 'Inactive',
        lastName: 'User',
        email: 'inactive@example.com',
        phone: null,
        status: 'INACTIVE',
        progressPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.beneficiary.findFirst.mockResolvedValue(mockData);

      const result = await repository.findByOrgAndEmail('org-123', 'inactive@example.com');

      expect(result?.status).toBe(BeneficiaryStatus.INACTIVE);
    });

    it('should convert any non-ACTIVE status to INACTIVE', async () => {
      const mockData = {
        id: 'ben-other',
        organizationId: 'org-123',
        clerkUserId: 'clerk-123',
        firstName: 'Other',
        lastName: 'User',
        email: 'other@example.com',
        phone: null,
        status: 'PENDING', // Any other value
        progressPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.beneficiary.findFirst.mockResolvedValue(mockData);

      const result = await repository.findByOrgAndEmail('org-123', 'other@example.com');

      expect(result?.status).toBe(BeneficiaryStatus.INACTIVE);
    });
  });
});
