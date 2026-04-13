import type { BeneficiaryRepository } from '@/domain/Beneficiary/repositories/BeneficiaryRepository';
import { BeneficiaryStatus, type Beneficiary } from '@/domain/Beneficiary/entities/Beneficiary';

describe('BeneficiaryRepository Interface', () => {
  describe('Interface Contract', () => {
    it('should define findByOrgId method', () => {
      const mockRepo: BeneficiaryRepository = {
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        create: jest.fn(),
      };

      expect(mockRepo).toHaveProperty('findByOrgId');
      expect(typeof mockRepo.findByOrgId).toBe('function');
    });

    it('should define findByOrgAndEmail method', () => {
      const mockRepo: BeneficiaryRepository = {
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        create: jest.fn(),
      };

      expect(mockRepo).toHaveProperty('findByOrgAndEmail');
      expect(typeof mockRepo.findByOrgAndEmail).toBe('function');
    });

    it('should define create method', () => {
      const mockRepo: BeneficiaryRepository = {
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        create: jest.fn(),
      };

      expect(mockRepo).toHaveProperty('create');
      expect(typeof mockRepo.create).toBe('function');
    });
  });

  describe('findByOrgId', () => {
    it('should return array of beneficiaries for organization', async () => {
      const mockBeneficiaries: Beneficiary[] = [
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
          status: BeneficiaryStatus.ACTIVE,
          progressPercent: 75,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockRepo: BeneficiaryRepository = {
        findByOrgId: jest.fn().mockResolvedValue(mockBeneficiaries),
        findByOrgAndEmail: jest.fn(),
        create: jest.fn(),
      };

      const result = await mockRepo.findByOrgId('org-123');

      expect(result).toEqual(mockBeneficiaries);
      expect(result).toHaveLength(2);
      expect(mockRepo.findByOrgId).toHaveBeenCalledWith('org-123');
    });

    it('should return empty array when no beneficiaries found', async () => {
      const mockRepo: BeneficiaryRepository = {
        findByOrgId: jest.fn().mockResolvedValue([]),
        findByOrgAndEmail: jest.fn(),
        create: jest.fn(),
      };

      const result = await mockRepo.findByOrgId('org-empty');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return Promise<Beneficiary[]>', () => {
      const mockRepo: BeneficiaryRepository = {
        findByOrgId: jest.fn().mockResolvedValue([]),
        findByOrgAndEmail: jest.fn(),
        create: jest.fn(),
      };

      const result = mockRepo.findByOrgId('org-123');

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('findByOrgAndEmail', () => {
    it('should return beneficiary when found', async () => {
      const mockBeneficiary: Beneficiary = {
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
      };

      const mockRepo: BeneficiaryRepository = {
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn().mockResolvedValue(mockBeneficiary),
        create: jest.fn(),
      };

      const result = await mockRepo.findByOrgAndEmail('org-123', 'jean@example.com');

      expect(result).toEqual(mockBeneficiary);
      expect(mockRepo.findByOrgAndEmail).toHaveBeenCalledWith('org-123', 'jean@example.com');
    });

    it('should return null when beneficiary not found', async () => {
      const mockRepo: BeneficiaryRepository = {
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      };

      const result = await mockRepo.findByOrgAndEmail('org-123', 'notfound@example.com');

      expect(result).toBeNull();
    });

    it('should return Promise<Beneficiary | null>', () => {
      const mockRepo: BeneficiaryRepository = {
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      };

      const result = mockRepo.findByOrgAndEmail('org-123', 'test@example.com');

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('create', () => {
    it('should create beneficiary with all fields', async () => {
      const input = {
        organizationId: 'org-123',
        clerkUserId: 'clerk-new',
        firstName: 'Paul',
        lastName: 'Diop',
        email: 'paul@example.com',
        phone: '+221775555555',
      };

      const createdBeneficiary: Beneficiary = {
        id: 'ben-new',
        ...input,
        birthDate: null,
        gender: null,
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRepo: BeneficiaryRepository = {
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        create: jest.fn().mockResolvedValue(createdBeneficiary),
      };

      const result = await mockRepo.create(input);

      expect(result).toEqual(createdBeneficiary);
      expect(result.id).toBe('ben-new');
      expect(result.firstName).toBe('Paul');
      expect(result.email).toBe('paul@example.com');
      expect(mockRepo.create).toHaveBeenCalledWith(input);
    });

    it('should create beneficiary with null phone', async () => {
      const input = {
        organizationId: 'org-456',
        clerkUserId: 'clerk-456',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: null,
      };

      const createdBeneficiary: Beneficiary = {
        id: 'ben-456',
        ...input,
        birthDate: null,
        gender: null,
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRepo: BeneficiaryRepository = {
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        create: jest.fn().mockResolvedValue(createdBeneficiary),
      };

      const result = await mockRepo.create(input);

      expect(result.phone).toBeNull();
    });

    it('should create beneficiary with optional phone field', async () => {
      const input = {
        organizationId: 'org-789',
        clerkUserId: 'clerk-789',
        firstName: 'Optional',
        lastName: 'Phone',
        email: 'optional@example.com',
      };

      const createdBeneficiary: Beneficiary = {
        id: 'ben-789',
        organizationId: input.organizationId,
        clerkUserId: input.clerkUserId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: null,
        birthDate: null,
        gender: null,
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRepo: BeneficiaryRepository = {
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        create: jest.fn().mockResolvedValue(createdBeneficiary),
      };

      const result = await mockRepo.create(input);

      expect(result).toBeDefined();
      expect(result.id).toBe('ben-789');
    });

    it('should return Promise<Beneficiary>', () => {
      const input = {
        organizationId: 'org-123',
        clerkUserId: 'clerk-123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      };

      const mockRepo: BeneficiaryRepository = {
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        create: jest.fn().mockResolvedValue({} as Beneficiary),
      };

      const result = mockRepo.create(input);

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('Type Safety', () => {
    it('should enforce required fields in create input', () => {
      const mockRepo: BeneficiaryRepository = {
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        create: jest.fn(),
      };

      // Valid input
      const validInput = {
        organizationId: 'org-123',
        clerkUserId: 'clerk-123',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
      };

      mockRepo.create(validInput);

      expect(mockRepo.create).toHaveBeenCalledWith(validInput);
    });

    it('should allow optional phone in create input', () => {
      const mockRepo: BeneficiaryRepository = {
        findByOrgId: jest.fn(),
        findByOrgAndEmail: jest.fn(),
        create: jest.fn(),
      };

      const inputWithPhone = {
        organizationId: 'org-123',
        clerkUserId: 'clerk-123',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        phone: '+221771234567',
      };

      const inputWithNullPhone = {
        organizationId: 'org-123',
        clerkUserId: 'clerk-123',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        phone: null,
      };

      mockRepo.create(inputWithPhone);
      mockRepo.create(inputWithNullPhone);

      expect(mockRepo.create).toHaveBeenCalledTimes(2);
    });
  });
});
