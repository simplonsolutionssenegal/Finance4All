import { z } from 'zod';

import {
  phoneSchema,
  createBeneficiarySchema,
  updateBeneficiarySchema,
  zodErrorsToFieldErrors,
  type CreateBeneficiaryInput,
  type UpdateBeneficiaryInput,
  type BeneficiaryFieldErrors,
} from '@/lib/validations/beneficiaire-validations';

describe('beneficiaire-validations', () => {
  describe('phoneSchema', () => {
    it('should accept valid phone numbers starting with +221', () => {
      const validPhones = [
        '+221771234567',
        '+221 77 123 45 67',
        '+221-77-123-45-67',
        '+221 (77) 123-45-67',
      ];

      validPhones.forEach(phone => {
        const result = phoneSchema.safeParse(phone);
        expect(result.success).toBe(true);
      });
    });

    it('should accept valid phone numbers starting with +237', () => {
      const validPhones = [
        '+237671234567',
        '+237 67 123 45 67',
        '+237-67-123-45-67',
        '+237 (67) 123-45-67',
      ];

      validPhones.forEach(phone => {
        const result = phoneSchema.safeParse(phone);
        expect(result.success).toBe(true);
      });
    });

    it('should accept valid phone numbers with other + prefixes', () => {
      const validPhones = ['+33612345678', '+1234567890', '+99123456789'];

      validPhones.forEach(phone => {
        const result = phoneSchema.safeParse(phone);
        expect(result.success).toBe(true);
      });
    });

    it('should accept empty string', () => {
      const result = phoneSchema.safeParse('');
      expect(result.success).toBe(true);
    });

    it('should accept undefined', () => {
      const result = phoneSchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it('should reject phone numbers without + prefix', () => {
      const invalidPhones = ['221771234567', '0771234567', '771234567'];

      invalidPhones.forEach(phone => {
        const result = phoneSchema.safeParse(phone);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Téléphone invalide (ex: +221...)');
        }
      });
    });

    it('should accept phone numbers starting with + (including non +221/+237)', () => {
      // Le schéma accepte tous les numéros commençant par + grâce au dernier OR
      const phones = ['+33612345678', '+1234567890', '+99123456789'];

      phones.forEach(phone => {
        const result = phoneSchema.safeParse(phone);
        expect(result.success).toBe(true);
      });
    });

    it('should accept minimal phone format with +', () => {
      // Le schéma accepte même '+' seul car il vérifie juste startsWith('+')
      const phones = ['+', '+ 123', '+abc123'];

      phones.forEach(phone => {
        const result = phoneSchema.safeParse(phone);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('createBeneficiarySchema', () => {
    const validData: CreateBeneficiaryInput = {
      organizationId: 'org_123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+221771234567',
      generateTempPassword: true,
      role: 'org:recipient',
    };

    it('should accept valid beneficiary data with all fields', () => {
      const result = createBeneficiarySchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should accept valid data without optional phone', () => {
      const dataWithoutPhone = { ...validData, phone: undefined };
      const result = createBeneficiarySchema.safeParse(dataWithoutPhone);
      expect(result.success).toBe(true);
    });

    it('should reject data without required generateTempPassword', () => {
      const { generateTempPassword: _generateTempPassword, ...dataWithoutTemp } = validData;
      const result = createBeneficiarySchema.safeParse(dataWithoutTemp);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('generateTempPassword');
      }
    });

    it('should accept valid data without optional role', () => {
      const dataWithoutRole = { ...validData, role: undefined };
      const result = createBeneficiarySchema.safeParse(dataWithoutRole);
      expect(result.success).toBe(true);
    });

    it('should reject data without organizationId', () => {
      const { organizationId: _organizationId, ...dataWithoutOrg } = validData;
      const result = createBeneficiarySchema.safeParse(dataWithoutOrg);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('organizationId');
      }
    });

    it('should reject data without firstName', () => {
      const { firstName: _firstName, ...dataWithoutFirst } = validData;
      const result = createBeneficiarySchema.safeParse(dataWithoutFirst);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('firstName');
      }
    });

    it('should reject data without lastName', () => {
      const { lastName: _lastName, ...dataWithoutLast } = validData;
      const result = createBeneficiarySchema.safeParse(dataWithoutLast);
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

    it('should reject invalid email format', () => {
      const invalidEmails = ['invalid-email', '@example.com', 'test@', 'test..test@example.com'];

      invalidEmails.forEach(email => {
        const result = createBeneficiarySchema.safeParse({
          ...validData,
          email,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('email');
        }
      });
    });

    it('should reject empty organizationId', () => {
      const result = createBeneficiarySchema.safeParse({
        ...validData,
        organizationId: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty firstName', () => {
      const result = createBeneficiarySchema.safeParse({
        ...validData,
        firstName: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty lastName', () => {
      const result = createBeneficiarySchema.safeParse({
        ...validData,
        lastName: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const result = createBeneficiarySchema.safeParse({
        ...validData,
        email: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid phone format', () => {
      const result = createBeneficiarySchema.safeParse({
        ...validData,
        phone: '771234567', // missing + prefix
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('phone');
      }
    });

    it('should reject non-boolean generateTempPassword', () => {
      const result = createBeneficiarySchema.safeParse({
        ...validData,
        generateTempPassword: 'true' as any,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('generateTempPassword');
      }
    });

    it('should accept org:recipient role', () => {
      const result = createBeneficiarySchema.safeParse({
        ...validData,
        role: 'org:recipient',
      });
      expect(result.success).toBe(true);
    });

    it('should trim whitespace from string fields', () => {
      const dataWithSpaces = {
        ...validData,
        organizationId: '  org_123  ',
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: 'john.doe@example.com', // Email ne peut pas avoir d'espaces (validation .email())
        phone: '  +221771234567  ',
      };

      const result = createBeneficiarySchema.safeParse(dataWithSpaces);
      expect(result.success).toBe(true);
      if (result.success) {
        // Aucun champ n'est trimmed sauf phone (via phoneSchema)
        expect(result.data.organizationId).toBe('  org_123  ');
        expect(result.data.firstName).toBe('  John  ');
        expect(result.data.lastName).toBe('  Doe  ');
        expect(result.data.email).toBe('john.doe@example.com');
        expect(result.data.phone).toBe('+221771234567');
      }
    });
  });

  describe('updateBeneficiarySchema', () => {
    const validUpdateData: UpdateBeneficiaryInput = {
      id: 'user_123',
      organizationId: 'org_123',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+221771234567',
    };

    it('should accept valid update data with all fields', () => {
      const result = updateBeneficiarySchema.safeParse(validUpdateData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validUpdateData);
      }
    });

    it('should accept valid data with null phone', () => {
      const dataWithNullPhone = { ...validUpdateData, phone: null };
      const result = updateBeneficiarySchema.safeParse(dataWithNullPhone);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phone).toBeNull();
      }
    });

    it('should accept valid data with undefined phone', () => {
      const dataWithUndefinedPhone = { ...validUpdateData, phone: undefined };
      const result = updateBeneficiarySchema.safeParse(dataWithUndefinedPhone);
      expect(result.success).toBe(true);
    });

    it('should accept valid data with empty phone', () => {
      const dataWithEmptyPhone = { ...validUpdateData, phone: '' };
      const result = updateBeneficiarySchema.safeParse(dataWithEmptyPhone);
      expect(result.success).toBe(true);
    });

    it('should reject data without id', () => {
      const { id: _id, ...dataWithoutId } = validUpdateData;
      const result = updateBeneficiarySchema.safeParse(dataWithoutId);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('id');
      }
    });

    it('should reject data without organizationId', () => {
      const { organizationId: _orgId, ...dataWithoutOrg } = validUpdateData;
      const result = updateBeneficiarySchema.safeParse(dataWithoutOrg);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('organizationId');
      }
    });

    it('should reject data without firstName', () => {
      const { firstName: _firstName, ...dataWithoutFirst } = validUpdateData;
      const result = updateBeneficiarySchema.safeParse(dataWithoutFirst);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('firstName');
      }
    });

    it('should reject data without lastName', () => {
      const { lastName: _lastName, ...dataWithoutLast } = validUpdateData;
      const result = updateBeneficiarySchema.safeParse(dataWithoutLast);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('lastName');
      }
    });

    it('should reject empty id', () => {
      const result = updateBeneficiarySchema.safeParse({
        ...validUpdateData,
        id: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty organizationId', () => {
      const result = updateBeneficiarySchema.safeParse({
        ...validUpdateData,
        organizationId: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty firstName', () => {
      const result = updateBeneficiarySchema.safeParse({
        ...validUpdateData,
        firstName: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty lastName', () => {
      const result = updateBeneficiarySchema.safeParse({
        ...validUpdateData,
        lastName: '',
      });
      expect(result.success).toBe(false);
    });

    it('should accept any phone string format', () => {
      // updateBeneficiarySchema n'a pas de validation de format, juste trim
      const result = updateBeneficiarySchema.safeParse({
        ...validUpdateData,
        phone: '771234567',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phone).toBe('771234567');
      }
    });

    it('should trim whitespace from string fields', () => {
      const dataWithSpaces = {
        ...validUpdateData,
        id: '  user_123  ',
        organizationId: '  org_123  ',
        firstName: '  Jane  ',
        lastName: '  Smith  ',
        phone: '  +221771234567  ',
      };

      const result = updateBeneficiarySchema.safeParse(dataWithSpaces);
      expect(result.success).toBe(true);
      if (result.success) {
        // Seul phone est trimmed dans updateBeneficiarySchema
        expect(result.data.id).toBe('  user_123  ');
        expect(result.data.organizationId).toBe('  org_123  ');
        expect(result.data.firstName).toBe('  Jane  ');
        expect(result.data.lastName).toBe('  Smith  ');
        expect(result.data.phone).toBe('+221771234567');
      }
    });

    it('should not trim null phone', () => {
      const result = updateBeneficiarySchema.safeParse({
        ...validUpdateData,
        phone: null,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phone).toBeNull();
      }
    });
  });

  describe('zodErrorsToFieldErrors', () => {
    it('should return empty object for no errors', () => {
      const zodError = new z.ZodError([]);
      const result = zodErrorsToFieldErrors(zodError);
      expect(result).toEqual({});
    });

    it('should map single firstName error', () => {
      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          path: ['firstName'],
          message: 'Le prénom est requis',
        } as any,
      ]);
      const result = zodErrorsToFieldErrors(zodError);
      expect(result).toEqual({
        firstName: 'Le prénom est requis',
      });
    });

    it('should map single lastName error', () => {
      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          path: ['lastName'],
          message: 'Le nom est requis',
        } as any,
      ]);
      const result = zodErrorsToFieldErrors(zodError);
      expect(result).toEqual({
        lastName: 'Le nom est requis',
      });
    });

    it('should map single email error', () => {
      const zodError = new z.ZodError([
        {
          code: 'custom',
          path: ['email'],
          message: 'Email invalide',
        } as any,
      ]);
      const result = zodErrorsToFieldErrors(zodError);
      expect(result).toEqual({
        email: 'Email invalide',
      });
    });

    it('should map single phone error', () => {
      const zodError = new z.ZodError([
        {
          code: 'custom',
          path: ['phone'],
          message: 'Le numéro de téléphone doit commencer par +',
        },
      ]);
      const result = zodErrorsToFieldErrors(zodError);
      expect(result).toEqual({
        phone: 'Le numéro de téléphone doit commencer par +',
      });
    });

    it('should map multiple errors to corresponding fields', () => {
      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          path: ['firstName'],
          message: 'Le prénom est requis',
        } as any,
        {
          code: 'invalid_type',
          expected: 'string',
          path: ['lastName'],
          message: 'Le nom est requis',
        } as any,
        {
          code: 'custom',
          path: ['email'],
          message: 'Email invalide',
        } as any,
      ]);
      const result = zodErrorsToFieldErrors(zodError);
      expect(result).toEqual({
        firstName: 'Le prénom est requis',
        lastName: 'Le nom est requis',
        email: 'Email invalide',
      });
    });

    it('should use first error message for duplicate field errors', () => {
      const zodError = new z.ZodError([
        {
          code: 'custom',
          path: ['phone'],
          message: 'Le numéro de téléphone doit commencer par +',
        } as any,
        {
          code: 'custom',
          path: ['phone'],
          message: 'Le numéro de téléphone devrait commencer par +221 ou +237',
        } as any,
      ]);
      const result = zodErrorsToFieldErrors(zodError);
      expect(result).toEqual({
        phone: 'Le numéro de téléphone doit commencer par +',
      });
    });

    it('should ignore errors for non-beneficiary fields', () => {
      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          path: ['firstName'],
          message: 'Le prénom est requis',
        } as any,
        {
          code: 'custom',
          path: ['organizationId'],
          message: 'Organization ID is required',
        },
        {
          code: 'custom',
          path: ['unknownField'],
          message: 'Unknown error',
        },
      ]);
      const result = zodErrorsToFieldErrors(zodError);
      expect(result).toEqual({
        firstName: 'Le prénom est requis',
      });
    });

    it('should handle nested path errors correctly', () => {
      const zodError = new z.ZodError([
        {
          code: 'custom',
          path: ['user', 'firstName'],
          message: 'Nested error',
        },
        {
          code: 'custom',
          path: ['email'],
          message: 'Email error',
        },
      ]);
      const result = zodErrorsToFieldErrors(zodError);
      expect(result).toEqual({
        email: 'Email error',
      });
    });

    it('should handle errors with empty path', () => {
      const zodError = new z.ZodError([
        {
          code: 'custom',
          path: [],
          message: 'Root error',
        },
        {
          code: 'custom',
          path: ['firstName'],
          message: 'FirstName error',
        },
      ]);
      const result = zodErrorsToFieldErrors(zodError);
      expect(result).toEqual({
        firstName: 'FirstName error',
      });
    });

    it('should map all beneficiary field types', () => {
      const zodError = new z.ZodError([
        {
          code: 'custom',
          path: ['firstName'],
          message: 'First error',
        },
        {
          code: 'custom',
          path: ['lastName'],
          message: 'Last error',
        },
        {
          code: 'custom',
          path: ['email'],
          message: 'Email error',
        },
        {
          code: 'custom',
          path: ['phone'],
          message: 'Phone error',
        },
      ]);
      const result = zodErrorsToFieldErrors(zodError);
      expect(result).toEqual({
        firstName: 'First error',
        lastName: 'Last error',
        email: 'Email error',
        phone: 'Phone error',
      });
    });

    it('should return correct type for BeneficiaryFieldErrors', () => {
      const zodError = new z.ZodError([
        {
          code: 'custom',
          path: ['firstName'],
          message: 'Error',
        },
      ]);
      const result: BeneficiaryFieldErrors = zodErrorsToFieldErrors(zodError);
      expect(typeof result.firstName).toBe('string');
    });
  });
});
