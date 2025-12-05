import { PrismaBeneficiaryRepository } from '@/infrastructure/persistence/repositories/PrismaBeneficiaryRepository';
import { Beneficiary, BeneficiaryStatus } from '@/domain/Beneficiary/entities/Beneficiary';
import { prisma } from '@/infrastructure/config/prismaClient';

// Mock Prisma client
jest.mock('@/infrastructure/config/prismaClient', () => ({
  prisma: {
    beneficiary: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('PrismaBeneficiaryRepository', () => {
  let repository: PrismaBeneficiaryRepository;

  beforeEach(() => {
    repository = new PrismaBeneficiaryRepository();
    jest.clearAllMocks();
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

      (prisma.beneficiary.findMany as jest.Mock).mockResolvedValue(mockData);

      const result = await repository.findByOrgId('org-123');

      expect(prisma.beneficiary.findMany).toHaveBeenCalledWith({
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
      (prisma.beneficiary.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.findByOrgId('org-empty');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should order results by createdAt desc', async () => {
      (prisma.beneficiary.findMany as jest.Mock).mockResolvedValue([]);

      await repository.findByOrgId('org-123');

      expect(prisma.beneficiary.findMany).toHaveBeenCalledWith({
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

      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue(mockData);

      const result = await repository.findByOrgAndEmail('org-456', 'found@example.com');

      expect(prisma.beneficiary.findFirst).toHaveBeenCalledWith({
        where: { organizationId: 'org-456', email: 'found@example.com' },
      });
      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(Beneficiary);
      expect(result?.id).toBe('ben-found');
      expect(result?.email).toBe('found@example.com');
    });

    it('should return null when beneficiary not found', async () => {
      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue(null);

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

      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue(mockData);

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

      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue(mockData);

      const result = await repository.findByIdInOrg('org-123', 'ben-123');

      expect(prisma.beneficiary.findFirst).toHaveBeenCalledWith({
        where: { id: 'ben-123', organizationId: 'org-123' },
      });
      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(Beneficiary);
      expect(result?.id).toBe('ben-123');
      expect(result?.organizationId).toBe('org-123');
    });

    it('should return null when beneficiary not found', async () => {
      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByIdInOrg('org-456', 'ben-nonexistent');

      expect(result).toBeNull();
    });

    it('should return null when beneficiary belongs to different organization', async () => {
      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByIdInOrg('org-wrong', 'ben-123');

      expect(prisma.beneficiary.findFirst).toHaveBeenCalledWith({
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

      (prisma.beneficiary.create as jest.Mock).mockResolvedValue(mockCreated);

      const input = {
        organizationId: 'org-123',
        clerkUserId: 'clerk-new',
        firstName: 'New',
        lastName: 'Beneficiary',
        email: 'new@example.com',
        phone: '+221772222222',
      };

      const result = await repository.create(input);

      expect(prisma.beneficiary.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org-123',
          clerkUserId: 'clerk-new',
          firstName: 'New',
          lastName: 'Beneficiary',
          email: 'new@example.com',
          phone: '+221772222222',
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

      (prisma.beneficiary.create as jest.Mock).mockResolvedValue(mockCreated);

      const input = {
        organizationId: 'org-456',
        clerkUserId: 'clerk-456',
        firstName: 'No',
        lastName: 'Phone',
        email: 'nophone@example.com',
      };

      const result = await repository.create(input);

      expect(prisma.beneficiary.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org-456',
          clerkUserId: 'clerk-456',
          firstName: 'No',
          lastName: 'Phone',
          email: 'nophone@example.com',
          phone: null,
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

      (prisma.beneficiary.create as jest.Mock).mockResolvedValue(mockCreated);

      const input = {
        organizationId: 'org-789',
        clerkUserId: 'clerk-789',
        firstName: 'Null',
        lastName: 'Phone',
        email: 'nullphone@example.com',
        phone: null,
      };

      const result = await repository.create(input);

      expect(prisma.beneficiary.create).toHaveBeenCalledWith({
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

      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue(mockExists);
      (prisma.beneficiary.update as jest.Mock).mockResolvedValue(mockUpdated);

      const input = {
        organizationId: 'org-123',
        beneficiaryId: 'ben-update',
        firstName: 'Updated',
        lastName: 'NewName',
      };

      const result = await repository.updateInOrg(input);

      expect(prisma.beneficiary.findFirst).toHaveBeenCalledWith({
        where: { id: 'ben-update', organizationId: 'org-123' },
      });
      expect(prisma.beneficiary.update).toHaveBeenCalledWith({
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

      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue(mockExists);
      (prisma.beneficiary.update as jest.Mock).mockResolvedValue(mockUpdated);

      const input = {
        organizationId: 'org-456',
        beneficiaryId: 'ben-status',
        status: 'INACTIVE' as const,
      };

      const result = await repository.updateInOrg(input);

      expect(prisma.beneficiary.update).toHaveBeenCalledWith({
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

      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue(mockExists);
      (prisma.beneficiary.update as jest.Mock).mockResolvedValue(mockUpdated);

      const input = {
        organizationId: 'org-789',
        beneficiaryId: 'ben-remove-phone',
        phone: null,
      };

      const result = await repository.updateInOrg(input);

      expect(prisma.beneficiary.update).toHaveBeenCalledWith({
        where: { id: 'ben-remove-phone' },
        data: {
          phone: null,
        },
      });
      expect(result.phone).toBeNull();
    });

    it('should throw error when beneficiary not found', async () => {
      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue(null);

      const input = {
        organizationId: 'org-123',
        beneficiaryId: 'ben-nonexistent',
        firstName: 'Updated',
      };

      await expect(repository.updateInOrg(input)).rejects.toThrow(
        'Accès refusé (organisation) ou bénéficiaire introuvable.'
      );

      expect(prisma.beneficiary.update).not.toHaveBeenCalled();
    });

    it('should throw error when beneficiary belongs to different organization', async () => {
      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue(null);

      const input = {
        organizationId: 'org-wrong',
        beneficiaryId: 'ben-123',
        firstName: 'Updated',
      };

      await expect(repository.updateInOrg(input)).rejects.toThrow(
        'Accès refusé (organisation) ou bénéficiaire introuvable.'
      );

      expect(prisma.beneficiary.findFirst).toHaveBeenCalledWith({
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

      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue(mockExists);
      (prisma.beneficiary.update as jest.Mock).mockResolvedValue(mockUpdated);

      const input = {
        organizationId: 'org-all',
        beneficiaryId: 'ben-all',
        firstName: 'All',
        lastName: 'Updated',
        phone: '+221775555555',
        status: 'INACTIVE' as const,
      };

      const result = await repository.updateInOrg(input);

      expect(prisma.beneficiary.update).toHaveBeenCalledWith({
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

      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue(mockExists);
      (prisma.beneficiary.update as jest.Mock).mockResolvedValue(mockUpdated);

      const input = {
        organizationId: 'org-123',
        beneficiaryId: 'ben-partial',
        firstName: 'OnlyThis',
        // lastName, phone, status are undefined - should not be in data
      };

      await repository.updateInOrg(input);

      expect(prisma.beneficiary.update).toHaveBeenCalledWith({
        where: { id: 'ben-partial' },
        data: {
          firstName: 'OnlyThis',
          // No other fields
        },
      });
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

      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue(mockData);

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

      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue(mockData);

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

      (prisma.beneficiary.findFirst as jest.Mock).mockResolvedValue(mockData);

      const result = await repository.findByOrgAndEmail('org-123', 'other@example.com');

      expect(result?.status).toBe(BeneficiaryStatus.INACTIVE);
    });
  });
});
