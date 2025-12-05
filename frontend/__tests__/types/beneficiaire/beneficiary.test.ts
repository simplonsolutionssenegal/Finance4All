import {
  BeneficiaryStatus,
  type Beneficiary,
  type BeneficiaryRole,
} from '@/types/beneficiaire/beneficiary';

describe('BeneficiaryStatus', () => {
  describe('Enum values', () => {
    it('should have ACTIVE status', () => {
      expect(BeneficiaryStatus.ACTIVE).toBe('ACTIVE');
    });

    it('should have INACTIVE status', () => {
      expect(BeneficiaryStatus.INACTIVE).toBe('INACTIVE');
    });

    it('should have PENDING status', () => {
      expect(BeneficiaryStatus.PENDING).toBe('PENDING');
    });

    it('should have exactly 3 status values', () => {
      const statuses = Object.values(BeneficiaryStatus);
      expect(statuses).toHaveLength(3);
    });

    it('should contain all expected statuses', () => {
      const statuses = Object.values(BeneficiaryStatus);
      expect(statuses).toContain('ACTIVE');
      expect(statuses).toContain('INACTIVE');
      expect(statuses).toContain('PENDING');
    });

    it('should use string values', () => {
      Object.values(BeneficiaryStatus).forEach(status => {
        expect(typeof status).toBe('string');
      });
    });
  });

  describe('Enum keys', () => {
    it('should have correct keys', () => {
      expect(BeneficiaryStatus).toHaveProperty('ACTIVE');
      expect(BeneficiaryStatus).toHaveProperty('INACTIVE');
      expect(BeneficiaryStatus).toHaveProperty('PENDING');
    });

    it('should have keys matching values', () => {
      expect(BeneficiaryStatus.ACTIVE).toBe('ACTIVE');
      expect(BeneficiaryStatus.INACTIVE).toBe('INACTIVE');
      expect(BeneficiaryStatus.PENDING).toBe('PENDING');
    });
  });

  describe('Enum usage', () => {
    it('should be usable in comparisons', () => {
      const activeStatus: BeneficiaryStatus = BeneficiaryStatus.ACTIVE;
      expect(activeStatus === BeneficiaryStatus.ACTIVE).toBe(true);

      const inactiveStatus: BeneficiaryStatus = BeneficiaryStatus.INACTIVE;
      expect(inactiveStatus === BeneficiaryStatus.INACTIVE).toBe(true);
    });

    it('should be usable in switch statements', () => {
      const getStatusLabel = (status: BeneficiaryStatus): string => {
        switch (status) {
          case BeneficiaryStatus.ACTIVE:
            return 'Actif';
          case BeneficiaryStatus.INACTIVE:
            return 'Inactif';
          case BeneficiaryStatus.PENDING:
            return 'En attente';
          default:
            return 'Inconnu';
        }
      };

      expect(getStatusLabel(BeneficiaryStatus.ACTIVE)).toBe('Actif');
      expect(getStatusLabel(BeneficiaryStatus.INACTIVE)).toBe('Inactif');
      expect(getStatusLabel(BeneficiaryStatus.PENDING)).toBe('En attente');
    });

    it('should be usable in object keys', () => {
      const statusMap = {
        [BeneficiaryStatus.ACTIVE]: 'Active users',
        [BeneficiaryStatus.INACTIVE]: 'Inactive users',
        [BeneficiaryStatus.PENDING]: 'Pending users',
      };

      expect(statusMap[BeneficiaryStatus.ACTIVE]).toBe('Active users');
      expect(statusMap[BeneficiaryStatus.INACTIVE]).toBe('Inactive users');
      expect(statusMap[BeneficiaryStatus.PENDING]).toBe('Pending users');
    });
  });

  describe('Type guards', () => {
    it('should validate string as BeneficiaryStatus', () => {
      const isValidStatus = (status: string): status is BeneficiaryStatus => {
        return Object.values(BeneficiaryStatus).includes(status as BeneficiaryStatus);
      };

      expect(isValidStatus('ACTIVE')).toBe(true);
      expect(isValidStatus('INACTIVE')).toBe(true);
      expect(isValidStatus('PENDING')).toBe(true);
      expect(isValidStatus('INVALID')).toBe(false);
      expect(isValidStatus('active')).toBe(false);
      expect(isValidStatus('')).toBe(false);
    });
  });
});

describe('Beneficiary interface', () => {
  describe('Valid beneficiary objects', () => {
    it('should accept valid beneficiary with string id', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 75,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(beneficiary.id).toBe('ben_123');
      expect(beneficiary.firstName).toBe('John');
      expect(beneficiary.lastName).toBe('Doe');
      expect(beneficiary.email).toBe('john.doe@example.com');
      expect(beneficiary.status).toBe(BeneficiaryStatus.ACTIVE);
      expect(beneficiary.progressPercent).toBe(75);
      expect(beneficiary.createdAt).toBe('2024-01-01T00:00:00Z');
    });

    it('should accept valid beneficiary with number id', () => {
      const beneficiary: Beneficiary = {
        id: 12345,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        status: BeneficiaryStatus.INACTIVE,
        progressPercent: 0,
        createdAt: '2024-01-02T00:00:00Z',
      };

      expect(beneficiary.id).toBe(12345);
      expect(typeof beneficiary.id).toBe('number');
    });

    it('should accept beneficiary with phone', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+221771234567',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 50,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(beneficiary.phone).toBe('+221771234567');
    });

    it('should accept beneficiary without phone', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 50,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(beneficiary.phone).toBeUndefined();
    });

    it('should accept beneficiary with undefined phone', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: undefined,
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 50,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(beneficiary.phone).toBeUndefined();
    });
  });

  describe('Status field', () => {
    it('should accept ACTIVE status', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(beneficiary.status).toBe(BeneficiaryStatus.ACTIVE);
    });

    it('should accept INACTIVE status', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: BeneficiaryStatus.INACTIVE,
        progressPercent: 0,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(beneficiary.status).toBe(BeneficiaryStatus.INACTIVE);
    });

    it('should accept PENDING status', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: BeneficiaryStatus.PENDING,
        progressPercent: 0,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(beneficiary.status).toBe(BeneficiaryStatus.PENDING);
    });
  });

  describe('Progress field', () => {
    it('should accept 0 percent progress', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(beneficiary.progressPercent).toBe(0);
    });

    it('should accept 100 percent progress', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 100,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(beneficiary.progressPercent).toBe(100);
    });

    it('should accept decimal progress', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 33.33,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(beneficiary.progressPercent).toBe(33.33);
    });

    it('should accept negative progress', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: -10,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(beneficiary.progressPercent).toBe(-10);
    });

    it('should accept progress over 100', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 150,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(beneficiary.progressPercent).toBe(150);
    });
  });

  describe('Name fields', () => {
    it('should accept empty strings for names', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: '',
        lastName: '',
        email: 'test@example.com',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(beneficiary.firstName).toBe('');
      expect(beneficiary.lastName).toBe('');
    });

    it('should accept names with special characters', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: "O'Neill",
        lastName: 'François-René',
        email: 'test@example.com',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(beneficiary.firstName).toBe("O'Neill");
      expect(beneficiary.lastName).toBe('François-René');
    });

    it('should accept very long names', () => {
      const longName = 'A'.repeat(100);
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: longName,
        lastName: longName,
        email: 'test@example.com',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(beneficiary.firstName).toHaveLength(100);
      expect(beneficiary.lastName).toHaveLength(100);
    });
  });

  describe('Email field', () => {
    it('should accept standard email format', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(beneficiary.email).toBe('john.doe@example.com');
    });

    it('should accept email with plus sign', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john+test@example.com',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(beneficiary.email).toBe('john+test@example.com');
    });

    it('should accept empty email string', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: 'John',
        lastName: 'Doe',
        email: '',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(beneficiary.email).toBe('');
    });
  });

  describe('CreatedAt field', () => {
    it('should accept ISO date string', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      expect(beneficiary.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should accept any date string format', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: '2024-01-01',
      };

      expect(beneficiary.createdAt).toBe('2024-01-01');
    });

    it('should accept empty date string', () => {
      const beneficiary: Beneficiary = {
        id: 'ben_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: '',
      };

      expect(beneficiary.createdAt).toBe('');
    });
  });

  describe('Array operations', () => {
    it('should work in arrays', () => {
      const beneficiaries: Beneficiary[] = [
        {
          id: 'ben_1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          status: BeneficiaryStatus.ACTIVE,
          progressPercent: 50,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'ben_2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          status: BeneficiaryStatus.INACTIVE,
          progressPercent: 0,
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];

      expect(beneficiaries).toHaveLength(2);
      expect(beneficiaries[0].id).toBe('ben_1');
      expect(beneficiaries[1].id).toBe('ben_2');
    });

    it('should filter by status', () => {
      const beneficiaries: Beneficiary[] = [
        {
          id: 'ben_1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          status: BeneficiaryStatus.ACTIVE,
          progressPercent: 50,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'ben_2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          status: BeneficiaryStatus.INACTIVE,
          progressPercent: 0,
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];

      const active = beneficiaries.filter(b => b.status === BeneficiaryStatus.ACTIVE);
      expect(active).toHaveLength(1);
      expect(active[0].firstName).toBe('John');
    });

    it('should sort by progress', () => {
      const beneficiaries: Beneficiary[] = [
        {
          id: 'ben_1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          status: BeneficiaryStatus.ACTIVE,
          progressPercent: 75,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'ben_2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          status: BeneficiaryStatus.ACTIVE,
          progressPercent: 25,
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];

      const sorted = [...beneficiaries].sort((a, b) => b.progressPercent - a.progressPercent);
      expect(sorted[0].progressPercent).toBe(75);
      expect(sorted[1].progressPercent).toBe(25);
    });
  });
});

describe('BeneficiaryRole interface', () => {
  describe('Valid role objects', () => {
    it('should accept valid role object', () => {
      const role: BeneficiaryRole = {
        id: 'role_123',
        role: 'org:recipient',
        description: 'Beneficiary role',
      };

      expect(role.id).toBe('role_123');
      expect(role.role).toBe('org:recipient');
      expect(role.description).toBe('Beneficiary role');
    });

    it('should accept role without prefix', () => {
      const role: BeneficiaryRole = {
        id: 'role_123',
        role: 'recipient',
        description: 'Recipient role',
      };

      expect(role.role).toBe('recipient');
    });

    it('should accept admin role', () => {
      const role: BeneficiaryRole = {
        id: 'role_admin',
        role: 'org:admin',
        description: 'Administrator role',
      };

      expect(role.role).toBe('org:admin');
    });

    it('should accept member role', () => {
      const role: BeneficiaryRole = {
        id: 'role_member',
        role: 'org:member',
        description: 'Member role',
      };

      expect(role.role).toBe('org:member');
    });

    it('should accept empty strings', () => {
      const role: BeneficiaryRole = {
        id: '',
        role: '',
        description: '',
      };

      expect(role.id).toBe('');
      expect(role.role).toBe('');
      expect(role.description).toBe('');
    });
  });

  describe('Description field', () => {
    it('should accept long descriptions', () => {
      const longDescription = 'A'.repeat(500);
      const role: BeneficiaryRole = {
        id: 'role_123',
        role: 'org:recipient',
        description: longDescription,
      };

      expect(role.description).toHaveLength(500);
    });

    it('should accept descriptions with special characters', () => {
      const role: BeneficiaryRole = {
        id: 'role_123',
        role: 'org:recipient',
        description: 'Role with special chars: @#$%^&*()_+-=[]{}|;\':"<>?,./',
      };

      expect(role.description).toContain('@#$%^&*()');
    });

    it('should accept multilingual descriptions', () => {
      const role: BeneficiaryRole = {
        id: 'role_123',
        role: 'org:recipient',
        description: 'Rôle de bénéficiaire / Recipient role / دور المستفيد',
      };

      expect(role.description).toContain('Rôle');
      expect(role.description).toContain('دور');
    });
  });

  describe('Role field variations', () => {
    it('should accept uppercase roles', () => {
      const role: BeneficiaryRole = {
        id: 'role_123',
        role: 'ORG:RECIPIENT',
        description: 'Uppercase role',
      };

      expect(role.role).toBe('ORG:RECIPIENT');
    });

    it('should accept roles with whitespace', () => {
      const role: BeneficiaryRole = {
        id: 'role_123',
        role: '  org:recipient  ',
        description: 'Role with spaces',
      };

      expect(role.role).toBe('  org:recipient  ');
    });

    it('should accept custom role formats', () => {
      const role: BeneficiaryRole = {
        id: 'role_123',
        role: 'custom_role_format',
        description: 'Custom format',
      };

      expect(role.role).toBe('custom_role_format');
    });
  });

  describe('Array operations', () => {
    it('should work in arrays', () => {
      const roles: BeneficiaryRole[] = [
        {
          id: 'role_1',
          role: 'org:recipient',
          description: 'Beneficiary',
        },
        {
          id: 'role_2',
          role: 'org:admin',
          description: 'Administrator',
        },
      ];

      expect(roles).toHaveLength(2);
      expect(roles[0].role).toBe('org:recipient');
      expect(roles[1].role).toBe('org:admin');
    });

    it('should find role by id', () => {
      const roles: BeneficiaryRole[] = [
        {
          id: 'role_1',
          role: 'org:recipient',
          description: 'Beneficiary',
        },
        {
          id: 'role_2',
          role: 'org:admin',
          description: 'Administrator',
        },
      ];

      const found = roles.find(r => r.id === 'role_2');
      expect(found?.role).toBe('org:admin');
    });

    it('should filter by role prefix', () => {
      const roles: BeneficiaryRole[] = [
        {
          id: 'role_1',
          role: 'org:recipient',
          description: 'Beneficiary',
        },
        {
          id: 'role_2',
          role: 'org:admin',
          description: 'Administrator',
        },
        {
          id: 'role_3',
          role: 'recipient',
          description: 'No prefix',
        },
      ];

      const orgRoles = roles.filter(r => r.role.startsWith('org:'));
      expect(orgRoles).toHaveLength(2);
    });
  });
});

describe('Type integration', () => {
  it('should use BeneficiaryStatus in Beneficiary', () => {
    const beneficiary: Beneficiary = {
      id: 'ben_123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      status: BeneficiaryStatus.ACTIVE,
      progressPercent: 0,
      createdAt: '2024-01-01T00:00:00Z',
    };

    expect(Object.values(BeneficiaryStatus)).toContain(beneficiary.status);
  });

  it('should combine beneficiary with role information', () => {
    const beneficiary: Beneficiary = {
      id: 'ben_123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      status: BeneficiaryStatus.ACTIVE,
      progressPercent: 50,
      createdAt: '2024-01-01T00:00:00Z',
    };

    const role: BeneficiaryRole = {
      id: 'role_123',
      role: 'org:recipient',
      description: 'Beneficiary role',
    };

    const combined = {
      ...beneficiary,
      roleInfo: role,
    };

    expect(combined.firstName).toBe('John');
    expect(combined.roleInfo.role).toBe('org:recipient');
  });

  it('should handle partial updates', () => {
    const original: Beneficiary = {
      id: 'ben_123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      status: BeneficiaryStatus.ACTIVE,
      progressPercent: 50,
      createdAt: '2024-01-01T00:00:00Z',
    };

    const updated: Beneficiary = {
      ...original,
      progressPercent: 75,
      status: BeneficiaryStatus.INACTIVE,
    };

    expect(updated.progressPercent).toBe(75);
    expect(updated.status).toBe(BeneficiaryStatus.INACTIVE);
    expect(updated.firstName).toBe('John');
  });
});
