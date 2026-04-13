import type { BeneficiaryRepository } from '@/domain/Beneficiary/ports/out/BeneficiaryRepository';
import type { Beneficiary } from '@/domain/Beneficiary/entities/Beneficiary';
// eslint-disable-next-line no-duplicate-imports
import { BeneficiaryStatus } from '@/domain/Beneficiary/entities/Beneficiary';

describe('BeneficiaryRepository Port (ports/out)', () => {
  describe('Interface Contract', () => {
    it('should define findByOrgId method', () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      expect(mockRepo).toHaveProperty('findByOrgId');
      expect(typeof mockRepo.findByOrgId).toBe('function');
    });

    it('should define findByOrgAndEmail method', () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      expect(mockRepo).toHaveProperty('findByOrgAndEmail');
      expect(typeof mockRepo.findByOrgAndEmail).toBe('function');
    });

    it('should define findByIdInOrg method', () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      expect(mockRepo).toHaveProperty('findByIdInOrg');
      expect(typeof mockRepo.findByIdInOrg).toBe('function');
    });

    it('should define create method', () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      expect(mockRepo).toHaveProperty('create');
      expect(typeof mockRepo.create).toBe('function');
    });

    it('should define updateInOrg method', () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      expect(mockRepo).toHaveProperty('updateInOrg');
      expect(typeof mockRepo.updateInOrg).toBe('function');
    });

    it('should define deleteByIdAndOrgId method', () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      expect(mockRepo).toHaveProperty('deleteByIdAndOrgId');
      expect(typeof mockRepo.deleteByIdAndOrgId).toBe('function');
    });
  });

  describe('findByOrgId', () => {
    it('should accept organizationId and return Promise<Beneficiary[]>', () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn().mockResolvedValue([]),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      const result = mockRepo.findByOrgId('org-123');

      expect(mockRepo.findByOrgId).toHaveBeenCalledWith('org-123');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return array of beneficiaries', async () => {
      const beneficiaries: Beneficiary[] = [
        {
          id: 'ben-1',
          organizationId: 'org-123',
          clerkUserId: 'clerk-1',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean@example.com',
          phone: '+221771234567',
          birthDate: null,
          gender: null,
          status: BeneficiaryStatus.ACTIVE,
          progressPercent: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ben-2',
          organizationId: 'org-123',
          clerkUserId: 'clerk-2',
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'marie@example.com',
          phone: null,
          birthDate: null,
          gender: null,
          status: BeneficiaryStatus.INACTIVE,
          progressPercent: 25,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn().mockResolvedValue(beneficiaries),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      const result = await mockRepo.findByOrgId('org-123');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('ben-1');
      expect(result[1].id).toBe('ben-2');
    });

    it('should return empty array when no beneficiaries found', async () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn().mockResolvedValue([]),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      const result = await mockRepo.findByOrgId('org-empty');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findByOrgAndEmail', () => {
    it('should accept organizationId and email, return Promise<Beneficiary | null>', () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn().mockResolvedValue(null),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      const result = mockRepo.findByOrgAndEmail('org-123', 'test@example.com');

      expect(mockRepo.findByOrgAndEmail).toHaveBeenCalledWith('org-123', 'test@example.com');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return beneficiary when found', async () => {
      const beneficiary: Beneficiary = {
        id: 'ben-found',
        organizationId: 'org-456',
        clerkUserId: 'clerk-456',
        firstName: 'Found',
        lastName: 'User',
        email: 'found@example.com',
        phone: '+221771111111',
        birthDate: null,
        gender: null,
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 75,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn().mockResolvedValue(beneficiary),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      const result = await mockRepo.findByOrgAndEmail('org-456', 'found@example.com');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('ben-found');
      expect(result?.email).toBe('found@example.com');
    });

    it('should return null when not found', async () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn().mockResolvedValue(null),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      const result = await mockRepo.findByOrgAndEmail('org-789', 'notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByIdInOrg', () => {
    it('should accept organizationId and beneficiaryId, return Promise<Beneficiary | null>', () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn().mockResolvedValue(null),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      const result = mockRepo.findByIdInOrg('org-123', 'ben-123');

      expect(mockRepo.findByIdInOrg).toHaveBeenCalledWith('org-123', 'ben-123');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return beneficiary when found in organization', async () => {
      const beneficiary: Beneficiary = {
        id: 'ben-123',
        organizationId: 'org-123',
        clerkUserId: 'clerk-123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: null,
        birthDate: null,
        gender: null,
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 40,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn().mockResolvedValue(beneficiary),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      const result = await mockRepo.findByIdInOrg('org-123', 'ben-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('ben-123');
      expect(result?.organizationId).toBe('org-123');
    });

    it('should return null when beneficiary not found', async () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn().mockResolvedValue(null),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      const result = await mockRepo.findByIdInOrg('org-456', 'ben-nonexistent');

      expect(result).toBeNull();
    });

    it('should return null when beneficiary belongs to different organization', async () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn().mockResolvedValue(null),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      const result = await mockRepo.findByIdInOrg('org-wrong', 'ben-123');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should accept create input and return Promise<Beneficiary>', () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn().mockResolvedValue({} as Beneficiary),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      const input = {
        organizationId: 'org-123',
        clerkUserId: 'clerk-123',
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
      };

      const result = mockRepo.create(input);

      expect(mockRepo.create).toHaveBeenCalledWith(input);
      expect(result).toBeInstanceOf(Promise);
    });

    it('should create beneficiary with all required fields', async () => {
      const now = new Date();
      const createdBeneficiary: Beneficiary = {
        id: 'ben-new',
        organizationId: 'org-123',
        clerkUserId: 'clerk-new',
        firstName: 'New',
        lastName: 'Beneficiary',
        email: 'new@example.com',
        phone: '+221772222222',
        birthDate: null,
        gender: null,
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: now,
        updatedAt: now,
      };

      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn().mockResolvedValue(createdBeneficiary),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      const result = await mockRepo.create({
        organizationId: 'org-123',
        clerkUserId: 'clerk-new',
        firstName: 'New',
        lastName: 'Beneficiary',
        email: 'new@example.com',
        phone: '+221772222222',
      });

      expect(result.id).toBe('ben-new');
      expect(result.firstName).toBe('New');
      expect(result.lastName).toBe('Beneficiary');
      expect(result.email).toBe('new@example.com');
      expect(result.phone).toBe('+221772222222');
      expect(result.status).toBe(BeneficiaryStatus.ACTIVE);
      expect(result.progressPercent).toBe(0);
    });

    it('should create beneficiary without phone', async () => {
      const createdBeneficiary: Beneficiary = {
        id: 'ben-no-phone',
        organizationId: 'org-456',
        clerkUserId: 'clerk-456',
        firstName: 'No',
        lastName: 'Phone',
        email: 'nophone@example.com',
        phone: null,
        birthDate: null,
        gender: null,
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn().mockResolvedValue(createdBeneficiary),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      const result = await mockRepo.create({
        organizationId: 'org-456',
        clerkUserId: 'clerk-456',
        firstName: 'No',
        lastName: 'Phone',
        email: 'nophone@example.com',
      });

      expect(result.phone).toBeNull();
    });
  });

  describe('updateInOrg', () => {
    it('should accept update input and return Promise<Beneficiary>', () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn().mockResolvedValue({} as Beneficiary),
        deleteByIdAndOrgId: jest.fn(),
      };

      const input = {
        organizationId: 'org-123',
        beneficiaryId: 'ben-123',
        firstName: 'Updated',
      };

      const result = mockRepo.updateInOrg(input);

      expect(mockRepo.updateInOrg).toHaveBeenCalledWith(input);
      expect(result).toBeInstanceOf(Promise);
    });

    it('should update beneficiary with partial data', async () => {
      const updatedBeneficiary: Beneficiary = {
        id: 'ben-update',
        organizationId: 'org-123',
        clerkUserId: 'clerk-123',
        firstName: 'Updated',
        lastName: 'Name',
        email: 'test@example.com',
        phone: '+221773333333',
        birthDate: null,
        gender: null,
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 50,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      };

      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn().mockResolvedValue(updatedBeneficiary),
        deleteByIdAndOrgId: jest.fn(),
      };

      const result = await mockRepo.updateInOrg({
        organizationId: 'org-123',
        beneficiaryId: 'ben-update',
        firstName: 'Updated',
        lastName: 'Name',
      });

      expect(result.firstName).toBe('Updated');
      expect(result.lastName).toBe('Name');
    });

    it('should update status field', async () => {
      const updatedBeneficiary: Beneficiary = {
        id: 'ben-status',
        organizationId: 'org-456',
        clerkUserId: 'clerk-456',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: null,
        birthDate: null,
        gender: null,
        status: BeneficiaryStatus.INACTIVE,
        progressPercent: 80,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn().mockResolvedValue(updatedBeneficiary),
        deleteByIdAndOrgId: jest.fn(),
      };

      const result = await mockRepo.updateInOrg({
        organizationId: 'org-456',
        beneficiaryId: 'ben-status',
        status: 'INACTIVE',
      });

      expect(result.status).toBe(BeneficiaryStatus.INACTIVE);
    });

    it('should update phone to null', async () => {
      const updatedBeneficiary: Beneficiary = {
        id: 'ben-remove-phone',
        organizationId: 'org-789',
        clerkUserId: 'clerk-789',
        firstName: 'No',
        lastName: 'Phone',
        email: 'nophone@example.com',
        phone: null,
        birthDate: null,
        gender: null,
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn().mockResolvedValue(updatedBeneficiary),
        deleteByIdAndOrgId: jest.fn(),
      };

      const result = await mockRepo.updateInOrg({
        organizationId: 'org-789',
        beneficiaryId: 'ben-remove-phone',
        phone: null,
      });

      expect(result.phone).toBeNull();
    });

    it('should handle all optional update fields', async () => {
      const updatedBeneficiary: Beneficiary = {
        id: 'ben-all',
        organizationId: 'org-all',
        clerkUserId: 'clerk-all',
        firstName: 'All',
        lastName: 'Updated',
        email: 'all@example.com',
        phone: '+221774444444',
        birthDate: null,
        gender: null,
        status: BeneficiaryStatus.INACTIVE,
        progressPercent: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn().mockResolvedValue(updatedBeneficiary),
        deleteByIdAndOrgId: jest.fn(),
      };

      const result = await mockRepo.updateInOrg({
        organizationId: 'org-all',
        beneficiaryId: 'ben-all',
        firstName: 'All',
        lastName: 'Updated',
        phone: '+221774444444',
        status: 'INACTIVE',
      });

      expect(result.firstName).toBe('All');
      expect(result.lastName).toBe('Updated');
      expect(result.phone).toBe('+221774444444');
      expect(result.status).toBe(BeneficiaryStatus.INACTIVE);
    });
  });

  describe('Type Safety', () => {
    it('should enforce correct types for create input', () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      const validInput = {
        organizationId: 'org-123',
        clerkUserId: 'clerk-123',
        firstName: 'Type',
        lastName: 'Safe',
        email: 'type@example.com',
        phone: '+221775555555',
      };

      mockRepo.create(validInput);

      expect(mockRepo.create).toHaveBeenCalledWith(validInput);
    });

    it('should enforce correct types for updateInOrg input', () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn(),
      };

      const validInput = {
        organizationId: 'org-123',
        beneficiaryId: 'ben-123',
        firstName: 'Updated',
        status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
      };

      mockRepo.updateInOrg(validInput);

      expect(mockRepo.updateInOrg).toHaveBeenCalledWith(validInput);
    });
  });

  describe('deleteByIdAndOrgId', () => {
    it('should accept beneficiaryId and organizationId, return Promise<boolean>', () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn().mockResolvedValue(true),
      };

      const result = mockRepo.deleteByIdAndOrgId('ben-123', 'org-123');

      expect(mockRepo.deleteByIdAndOrgId).toHaveBeenCalledWith('ben-123', 'org-123');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return true when beneficiary is deleted', async () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn().mockResolvedValue(true),
      };

      const result = await mockRepo.deleteByIdAndOrgId('ben-123', 'org-123');

      expect(result).toBe(true);
    });

    it('should return false when beneficiary not found', async () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn().mockResolvedValue(false),
      };

      const result = await mockRepo.deleteByIdAndOrgId('ben-nonexistent', 'org-123');

      expect(result).toBe(false);
    });

    it('should return false when beneficiary belongs to different organization', async () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn().mockResolvedValue(false),
      };

      const result = await mockRepo.deleteByIdAndOrgId('ben-123', 'org-wrong');

      expect(result).toBe(false);
    });

    it('should enforce correct parameter order (beneficiaryId first, organizationId second)', async () => {
      const mockRepo: BeneficiaryRepository = {
        getDemographicStats: jest.fn(),
        findByClerkUserId: jest.fn(),
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        findByIdInOrg: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateInOrg: jest.fn(),
        deleteByIdAndOrgId: jest.fn().mockResolvedValue(true),
      };

      await mockRepo.deleteByIdAndOrgId('ben-delete', 'org-delete');

      expect(mockRepo.deleteByIdAndOrgId).toHaveBeenCalledWith('ben-delete', 'org-delete');
      // Verify order: first arg is beneficiaryId, second is organizationId
      const callArgs = (mockRepo.deleteByIdAndOrgId as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toBe('ben-delete');
      expect(callArgs[1]).toBe('org-delete');
    });
  });
});
