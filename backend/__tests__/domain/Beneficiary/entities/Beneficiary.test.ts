import { Beneficiary, BeneficiaryStatus } from '@/domain/Beneficiary/entities/Beneficiary';

describe('Beneficiary Entity', () => {
  const validBeneficiaryData = {
    id: 'ben-123',
    organizationId: 'org-456',
    clerkUserId: 'clerk-789',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    phone: '+221771234567',
    birthDate: null,
    gender: null,
    status: BeneficiaryStatus.ACTIVE,
    progressPercent: 50,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  };

  describe('Constructor', () => {
    it('should create a Beneficiary instance with all properties', () => {
      const beneficiary = new Beneficiary(
        validBeneficiaryData.id,
        validBeneficiaryData.organizationId,
        validBeneficiaryData.clerkUserId,
        validBeneficiaryData.firstName,
        validBeneficiaryData.lastName,
        validBeneficiaryData.email,
        validBeneficiaryData.phone,
        validBeneficiaryData.birthDate,
        validBeneficiaryData.gender,
        validBeneficiaryData.status,
        validBeneficiaryData.progressPercent,
        validBeneficiaryData.createdAt,
        validBeneficiaryData.updatedAt
      );

      expect(beneficiary.id).toBe('ben-123');
      expect(beneficiary.organizationId).toBe('org-456');
      expect(beneficiary.clerkUserId).toBe('clerk-789');
      expect(beneficiary.firstName).toBe('Jean');
      expect(beneficiary.lastName).toBe('Dupont');
      expect(beneficiary.email).toBe('jean.dupont@example.com');
      expect(beneficiary.phone).toBe('+221771234567');
      expect(beneficiary.status).toBe(BeneficiaryStatus.ACTIVE);
      expect(beneficiary.progressPercent).toBe(50);
      expect(beneficiary.createdAt).toEqual(new Date('2024-01-15'));
      expect(beneficiary.updatedAt).toEqual(new Date('2024-01-20'));
    });

    it('should create a Beneficiary with null phone', () => {
      const beneficiary = new Beneficiary(
        'ben-456',
        'org-789',
        'clerk-012',
        'Marie',
        'Martin',
        'marie@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        0,
        new Date(),
        new Date()
      );

      expect(beneficiary.phone).toBeNull();
    });

    it('should create a Beneficiary with INACTIVE status', () => {
      const beneficiary = new Beneficiary(
        'ben-789',
        'org-012',
        'clerk-345',
        'Paul',
        'Diop',
        'paul@example.com',
        '+221775555555',
        null,
        null,
        BeneficiaryStatus.INACTIVE,
        75,
        new Date(),
        new Date()
      );

      expect(beneficiary.status).toBe(BeneficiaryStatus.INACTIVE);
    });
  });

  describe('Mutable Properties', () => {
    it('should allow updating firstName', () => {
      const beneficiary = new Beneficiary(
        'ben-1',
        'org-1',
        'clerk-1',
        'Jean',
        'Dupont',
        'jean@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        0,
        new Date(),
        new Date()
      );

      beneficiary.firstName = 'Jacques';
      expect(beneficiary.firstName).toBe('Jacques');
    });

    it('should allow updating lastName', () => {
      const beneficiary = new Beneficiary(
        'ben-2',
        'org-2',
        'clerk-2',
        'Marie',
        'Martin',
        'marie@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        0,
        new Date(),
        new Date()
      );

      beneficiary.lastName = 'Dupuis';
      expect(beneficiary.lastName).toBe('Dupuis');
    });

    it('should allow updating email', () => {
      const beneficiary = new Beneficiary(
        'ben-3',
        'org-3',
        'clerk-3',
        'Paul',
        'Diop',
        'paul@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        0,
        new Date(),
        new Date()
      );

      beneficiary.email = 'paul.new@example.com';
      expect(beneficiary.email).toBe('paul.new@example.com');
    });

    it('should allow updating phone', () => {
      const beneficiary = new Beneficiary(
        'ben-4',
        'org-4',
        'clerk-4',
        'Test',
        'User',
        'test@example.com',
        '+221771111111',
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        0,
        new Date(),
        new Date()
      );

      beneficiary.phone = '+221772222222';
      expect(beneficiary.phone).toBe('+221772222222');

      beneficiary.phone = null;
      expect(beneficiary.phone).toBeNull();
    });

    it('should allow updating status', () => {
      const beneficiary = new Beneficiary(
        'ben-5',
        'org-5',
        'clerk-5',
        'Active',
        'User',
        'active@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        0,
        new Date(),
        new Date()
      );

      beneficiary.status = BeneficiaryStatus.INACTIVE;
      expect(beneficiary.status).toBe(BeneficiaryStatus.INACTIVE);
    });

    it('should allow updating progressPercent', () => {
      const beneficiary = new Beneficiary(
        'ben-6',
        'org-6',
        'clerk-6',
        'Progress',
        'User',
        'progress@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        25,
        new Date(),
        new Date()
      );

      beneficiary.progressPercent = 75;
      expect(beneficiary.progressPercent).toBe(75);
    });
  });

  describe('BeneficiaryStatus Enum', () => {
    it('should have ACTIVE status', () => {
      expect(BeneficiaryStatus.ACTIVE).toBe('ACTIVE');
    });

    it('should have INACTIVE status', () => {
      expect(BeneficiaryStatus.INACTIVE).toBe('INACTIVE');
    });

    it('should only have two status values', () => {
      const values = Object.values(BeneficiaryStatus);
      expect(values).toHaveLength(2);
      expect(values).toContain('ACTIVE');
      expect(values).toContain('INACTIVE');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero progressPercent', () => {
      const beneficiary = new Beneficiary(
        'ben-7',
        'org-7',
        'clerk-7',
        'Zero',
        'Progress',
        'zero@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        0,
        new Date(),
        new Date()
      );

      expect(beneficiary.progressPercent).toBe(0);
    });

    it('should handle 100 progressPercent', () => {
      const beneficiary = new Beneficiary(
        'ben-8',
        'org-8',
        'clerk-8',
        'Full',
        'Progress',
        'full@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        100,
        new Date(),
        new Date()
      );

      expect(beneficiary.progressPercent).toBe(100);
    });

    it('should handle empty string names', () => {
      const beneficiary = new Beneficiary(
        'ben-9',
        'org-9',
        'clerk-9',
        '',
        '',
        'empty@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        0,
        new Date(),
        new Date()
      );

      expect(beneficiary.firstName).toBe('');
      expect(beneficiary.lastName).toBe('');
    });

    it('should handle very long names', () => {
      const longName = 'A'.repeat(100);
      const beneficiary = new Beneficiary(
        'ben-10',
        'org-10',
        'clerk-10',
        longName,
        longName,
        'long@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        0,
        new Date(),
        new Date()
      );

      expect(beneficiary.firstName).toBe(longName);
      expect(beneficiary.lastName).toBe(longName);
    });

    it('should handle negative progressPercent', () => {
      const beneficiary = new Beneficiary(
        'ben-11',
        'org-11',
        'clerk-11',
        'Negative',
        'Progress',
        'negative@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        -10,
        new Date(),
        new Date()
      );

      expect(beneficiary.progressPercent).toBe(-10);
    });

    it('should handle progressPercent greater than 100', () => {
      const beneficiary = new Beneficiary(
        'ben-12',
        'org-12',
        'clerk-12',
        'Over',
        'Progress',
        'over@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        150,
        new Date(),
        new Date()
      );

      expect(beneficiary.progressPercent).toBe(150);
    });

    it('should handle special characters in names', () => {
      const beneficiary = new Beneficiary(
        'ben-13',
        'org-13',
        'clerk-13',
        "Jean-Pierre O'Connor",
        'Ndao-Sène',
        'special@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        0,
        new Date(),
        new Date()
      );

      expect(beneficiary.firstName).toBe("Jean-Pierre O'Connor");
      expect(beneficiary.lastName).toBe('Ndao-Sène');
    });

    it('should handle Unicode characters in names', () => {
      const beneficiary = new Beneficiary(
        'ben-14',
        'org-14',
        'clerk-14',
        'Françoise',
        'Mbëkk',
        'unicode@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        0,
        new Date(),
        new Date()
      );

      expect(beneficiary.firstName).toBe('Françoise');
      expect(beneficiary.lastName).toBe('Mbëkk');
    });

    it('should preserve date instance references', () => {
      const createdDate = new Date('2024-01-15');
      const updatedDate = new Date('2024-01-20');

      const beneficiary = new Beneficiary(
        'ben-15',
        'org-15',
        'clerk-15',
        'Date',
        'Test',
        'date@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        0,
        createdDate,
        updatedDate
      );

      expect(beneficiary.createdAt).toBe(createdDate);
      expect(beneficiary.updatedAt).toBe(updatedDate);
    });

    it('should handle same createdAt and updatedAt dates', () => {
      const sameDate = new Date('2024-01-15');

      const beneficiary = new Beneficiary(
        'ben-16',
        'org-16',
        'clerk-16',
        'Same',
        'Date',
        'same@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        0,
        sameDate,
        sameDate
      );

      expect(beneficiary.createdAt).toEqual(sameDate);
      expect(beneficiary.updatedAt).toEqual(sameDate);
    });
  });

  describe('Property Types', () => {
    it('should have correct property types', () => {
      const beneficiary = new Beneficiary(
        'ben-type',
        'org-type',
        'clerk-type',
        'Type',
        'Test',
        'type@example.com',
        '+221771234567',
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        50,
        new Date(),
        new Date()
      );

      expect(typeof beneficiary.id).toBe('string');
      expect(typeof beneficiary.organizationId).toBe('string');
      expect(typeof beneficiary.clerkUserId).toBe('string');
      expect(typeof beneficiary.firstName).toBe('string');
      expect(typeof beneficiary.lastName).toBe('string');
      expect(typeof beneficiary.email).toBe('string');
      expect(typeof beneficiary.phone).toBe('string');
      expect(typeof beneficiary.status).toBe('string');
      expect(typeof beneficiary.progressPercent).toBe('number');
      expect(beneficiary.createdAt).toBeInstanceOf(Date);
      expect(beneficiary.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle phone as null correctly', () => {
      const beneficiary = new Beneficiary(
        'ben-null-phone',
        'org-null',
        'clerk-null',
        'Null',
        'Phone',
        'null@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        0,
        new Date(),
        new Date()
      );

      expect(beneficiary.phone).toBeNull();
      expect(typeof beneficiary.phone).toBe('object');
    });
  });

  describe('Multiple Instances', () => {
    it('should create independent instances', () => {
      const beneficiary1 = new Beneficiary(
        'ben-1',
        'org-1',
        'clerk-1',
        'First',
        'User',
        'first@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        25,
        new Date('2024-01-01'),
        new Date('2024-01-02')
      );

      const beneficiary2 = new Beneficiary(
        'ben-2',
        'org-2',
        'clerk-2',
        'Second',
        'User',
        'second@example.com',
        '+221771234567',
        null,
        null,
        BeneficiaryStatus.INACTIVE,
        75,
        new Date('2024-02-01'),
        new Date('2024-02-02')
      );

      expect(beneficiary1.id).not.toBe(beneficiary2.id);
      expect(beneficiary1.firstName).not.toBe(beneficiary2.firstName);
      expect(beneficiary1.status).not.toBe(beneficiary2.status);

      beneficiary1.firstName = 'Changed';
      expect(beneficiary2.firstName).toBe('Second');
    });

    it('should allow creating beneficiaries with duplicate data', () => {
      const beneficiary1 = new Beneficiary(
        'ben-1',
        'org-same',
        'clerk-1',
        'Duplicate',
        'User',
        'duplicate@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        0,
        new Date(),
        new Date()
      );

      const beneficiary2 = new Beneficiary(
        'ben-2',
        'org-same',
        'clerk-2',
        'Duplicate',
        'User',
        'duplicate@example.com',
        null,
        null,
        null,
        BeneficiaryStatus.ACTIVE,
        0,
        new Date(),
        new Date()
      );

      expect(beneficiary1.organizationId).toBe(beneficiary2.organizationId);
      expect(beneficiary1.firstName).toBe(beneficiary2.firstName);
      expect(beneficiary1.email).toBe(beneficiary2.email);
      expect(beneficiary1.id).not.toBe(beneficiary2.id);
    });
  });
});
