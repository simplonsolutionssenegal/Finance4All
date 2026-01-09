import {
  createBeneficiarySchema,
  updateBeneficiarySchema,
} from '@/infrastructure/web/validators/beneficiary.validator';

describe('beneficiary.validator', () => {
  describe('createBeneficiarySchema', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+221771234567',
      generateTempPassword: true,
    };

    describe('Valid data', () => {
      it('should accept valid data with all fields', () => {
        const result = createBeneficiarySchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      it('should accept data without optional phone', () => {
        const { phone: _phone, ...dataWithoutPhone } = validData;
        const result = createBeneficiarySchema.safeParse(dataWithoutPhone);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.phone).toBeUndefined();
        }
      });

      it('should accept data without optional generateTempPassword', () => {
        const { generateTempPassword: _generateTempPassword, ...dataWithoutPassword } = validData;
        const result = createBeneficiarySchema.safeParse(dataWithoutPassword);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.generateTempPassword).toBeUndefined();
        }
      });

      it('should accept phone as undefined', () => {
        const dataWithUndefinedPhone = { ...validData, phone: undefined };
        const result = createBeneficiarySchema.safeParse(dataWithUndefinedPhone);
        expect(result.success).toBe(true);
      });

      it('should accept generateTempPassword as false', () => {
        const dataWithFalsePassword = { ...validData, generateTempPassword: false };
        const result = createBeneficiarySchema.safeParse(dataWithFalsePassword);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.generateTempPassword).toBe(false);
        }
      });
    });

    describe('Required fields validation', () => {
      it('should reject data without firstName', () => {
        const { firstName: _firstName, ...dataWithoutFirstName } = validData;
        const result = createBeneficiarySchema.safeParse(dataWithoutFirstName);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('firstName');
        }
      });

      it('should reject data without lastName', () => {
        const { lastName: _lastName, ...dataWithoutLastName } = validData;
        const result = createBeneficiarySchema.safeParse(dataWithoutLastName);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('lastName');
        }
      });

      it('should reject data without email', () => {
        const { email: _email, ...dataWithoutEmail } = validData;
        const result = createBeneficiarySchema.safeParse(dataWithoutEmail);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('email');
        }
      });

      it('should reject empty firstName', () => {
        const dataWithEmptyFirstName = { ...validData, firstName: '' };
        const result = createBeneficiarySchema.safeParse(dataWithEmptyFirstName);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('firstName');
          expect(result.error.issues[0].message).toBe('firstName requis');
        }
      });

      it('should reject empty lastName', () => {
        const dataWithEmptyLastName = { ...validData, lastName: '' };
        const result = createBeneficiarySchema.safeParse(dataWithEmptyLastName);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('lastName');
          expect(result.error.issues[0].message).toBe('lastName requis');
        }
      });
    });

    describe('Email validation', () => {
      it('should reject invalid email format', () => {
        const invalidEmails = [
          'invalid-email',
          'missing@domain',
          '@nodomain.com',
          'no-at-sign.com',
          'spaces in@email.com',
        ];

        invalidEmails.forEach(email => {
          const result = createBeneficiarySchema.safeParse({ ...validData, email });
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues[0].path).toContain('email');
          }
        });
      });

      it('should accept valid email formats', () => {
        const validEmails = [
          'test@example.com',
          'user.name@example.com',
          'user+tag@example.co.uk',
          'test123@test-domain.com',
        ];

        validEmails.forEach(email => {
          const result = createBeneficiarySchema.safeParse({ ...validData, email });
          expect(result.success).toBe(true);
        });
      });
    });

    describe('Type validation', () => {
      it('should reject non-string firstName', () => {
        const dataWithNumberFirstName = { ...validData, firstName: 123 };
        const result = createBeneficiarySchema.safeParse(dataWithNumberFirstName);
        expect(result.success).toBe(false);
      });

      it('should reject non-string lastName', () => {
        const dataWithNumberLastName = { ...validData, lastName: 123 };
        const result = createBeneficiarySchema.safeParse(dataWithNumberLastName);
        expect(result.success).toBe(false);
      });

      it('should reject non-string email', () => {
        const dataWithNumberEmail = { ...validData, email: 123 };
        const result = createBeneficiarySchema.safeParse(dataWithNumberEmail);
        expect(result.success).toBe(false);
      });

      it('should reject non-string phone', () => {
        const dataWithNumberPhone = { ...validData, phone: 123 };
        const result = createBeneficiarySchema.safeParse(dataWithNumberPhone);
        expect(result.success).toBe(false);
      });

      it('should reject non-boolean generateTempPassword', () => {
        const dataWithStringPassword = { ...validData, generateTempPassword: 'true' };
        const result = createBeneficiarySchema.safeParse(dataWithStringPassword);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('updateBeneficiarySchema', () => {
    const validData = {
      organizationId: 'org-123',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+221771234567',
      status: 'ACTIVE' as const,
    };

    describe('Valid data', () => {
      it('should accept valid data with all fields', () => {
        const result = updateBeneficiarySchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      it('should accept data with only organizationId', () => {
        const dataWithOnlyOrg = { organizationId: 'org-123' };
        const result = updateBeneficiarySchema.safeParse(dataWithOnlyOrg);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.organizationId).toBe('org-123');
          expect(result.data.firstName).toBeUndefined();
          expect(result.data.lastName).toBeUndefined();
          expect(result.data.phone).toBeUndefined();
          expect(result.data.status).toBeUndefined();
        }
      });

      it('should accept data without optional firstName', () => {
        const { firstName: _firstName, ...dataWithoutFirstName } = validData;
        const result = updateBeneficiarySchema.safeParse(dataWithoutFirstName);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.firstName).toBeUndefined();
        }
      });

      it('should accept data without optional lastName', () => {
        const { lastName: _lastName, ...dataWithoutLastName } = validData;
        const result = updateBeneficiarySchema.safeParse(dataWithoutLastName);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.lastName).toBeUndefined();
        }
      });

      it('should accept data without optional phone', () => {
        const { phone: _phone, ...dataWithoutPhone } = validData;
        const result = updateBeneficiarySchema.safeParse(dataWithoutPhone);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.phone).toBeUndefined();
        }
      });

      it('should accept data without optional status', () => {
        const { status: _status, ...dataWithoutStatus } = validData;
        const result = updateBeneficiarySchema.safeParse(dataWithoutStatus);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.status).toBeUndefined();
        }
      });

      it('should accept phone as null', () => {
        const dataWithNullPhone = { ...validData, phone: null };
        const result = updateBeneficiarySchema.safeParse(dataWithNullPhone);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.phone).toBeNull();
        }
      });

      it('should accept status as INACTIVE', () => {
        const dataWithInactive = { ...validData, status: 'INACTIVE' as const };
        const result = updateBeneficiarySchema.safeParse(dataWithInactive);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.status).toBe('INACTIVE');
        }
      });
    });

    describe('Required fields validation', () => {
      it('should reject data without organizationId', () => {
        const { organizationId: _organizationId, ...dataWithoutOrg } = validData;
        const result = updateBeneficiarySchema.safeParse(dataWithoutOrg);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('organizationId');
        }
      });

      it('should reject empty organizationId', () => {
        const dataWithEmptyOrg = { ...validData, organizationId: '' };
        const result = updateBeneficiarySchema.safeParse(dataWithEmptyOrg);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('organizationId');
        }
      });
    });

    describe('Optional fields validation', () => {
      it('should reject empty firstName when provided', () => {
        const dataWithEmptyFirstName = { ...validData, firstName: '' };
        const result = updateBeneficiarySchema.safeParse(dataWithEmptyFirstName);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('firstName');
        }
      });

      it('should reject empty lastName when provided', () => {
        const dataWithEmptyLastName = { ...validData, lastName: '' };
        const result = updateBeneficiarySchema.safeParse(dataWithEmptyLastName);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('lastName');
        }
      });

      it('should accept firstName with minimum 1 character', () => {
        const dataWithMinFirstName = { ...validData, firstName: 'J' };
        const result = updateBeneficiarySchema.safeParse(dataWithMinFirstName);
        expect(result.success).toBe(true);
      });

      it('should accept lastName with minimum 1 character', () => {
        const dataWithMinLastName = { ...validData, lastName: 'S' };
        const result = updateBeneficiarySchema.safeParse(dataWithMinLastName);
        expect(result.success).toBe(true);
      });
    });

    describe('Status validation', () => {
      it('should reject invalid status values', () => {
        const invalidStatuses = ['PENDING', 'DELETED', 'SUSPENDED', 'active', 'inactive'];

        invalidStatuses.forEach(status => {
          const result = updateBeneficiarySchema.safeParse({ ...validData, status });
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues[0].path).toContain('status');
          }
        });
      });

      it('should accept ACTIVE status', () => {
        const dataWithActive = { ...validData, status: 'ACTIVE' as const };
        const result = updateBeneficiarySchema.safeParse(dataWithActive);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.status).toBe('ACTIVE');
        }
      });

      it('should accept INACTIVE status', () => {
        const dataWithInactive = { ...validData, status: 'INACTIVE' as const };
        const result = updateBeneficiarySchema.safeParse(dataWithInactive);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.status).toBe('INACTIVE');
        }
      });
    });

    describe('Type validation', () => {
      it('should reject non-string organizationId', () => {
        const dataWithNumberOrg = { ...validData, organizationId: 123 };
        const result = updateBeneficiarySchema.safeParse(dataWithNumberOrg);
        expect(result.success).toBe(false);
      });

      it('should reject non-string firstName', () => {
        const dataWithNumberFirstName = { ...validData, firstName: 123 };
        const result = updateBeneficiarySchema.safeParse(dataWithNumberFirstName);
        expect(result.success).toBe(false);
      });

      it('should reject non-string lastName', () => {
        const dataWithNumberLastName = { ...validData, lastName: 123 };
        const result = updateBeneficiarySchema.safeParse(dataWithNumberLastName);
        expect(result.success).toBe(false);
      });

      it('should reject non-string phone when not null', () => {
        const dataWithNumberPhone = { ...validData, phone: 123 };
        const result = updateBeneficiarySchema.safeParse(dataWithNumberPhone);
        expect(result.success).toBe(false);
      });
    });

    describe('Partial updates', () => {
      it('should accept update with only firstName', () => {
        const partialData = { organizationId: 'org-123', firstName: 'UpdatedName' };
        const result = updateBeneficiarySchema.safeParse(partialData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.firstName).toBe('UpdatedName');
          expect(result.data.lastName).toBeUndefined();
        }
      });

      it('should accept update with only lastName', () => {
        const partialData = { organizationId: 'org-123', lastName: 'UpdatedLastName' };
        const result = updateBeneficiarySchema.safeParse(partialData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.lastName).toBe('UpdatedLastName');
          expect(result.data.firstName).toBeUndefined();
        }
      });

      it('should accept update with only phone', () => {
        const partialData = { organizationId: 'org-123', phone: '+221779999999' };
        const result = updateBeneficiarySchema.safeParse(partialData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.phone).toBe('+221779999999');
        }
      });

      it('should accept update with only status', () => {
        const partialData = { organizationId: 'org-123', status: 'INACTIVE' as const };
        const result = updateBeneficiarySchema.safeParse(partialData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.status).toBe('INACTIVE');
        }
      });

      it('should accept update with firstName and lastName only', () => {
        const partialData = {
          organizationId: 'org-123',
          firstName: 'New',
          lastName: 'Name',
        };
        const result = updateBeneficiarySchema.safeParse(partialData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.firstName).toBe('New');
          expect(result.data.lastName).toBe('Name');
          expect(result.data.phone).toBeUndefined();
          expect(result.data.status).toBeUndefined();
        }
      });
    });
  });
});
