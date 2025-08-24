import { describe, it, expect } from '@jest/globals';
import { createUserSchema } from '@/types/user.type';
import { Role } from '@/types';

describe('User Validation Schemas', () => {
  describe('createUserSchema', () => {
    it('should validate a correct user creation payload', () => {
      const validUser = {
        email: 'john.doe@example.com',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        password: 'StrongPass123',
        role: Role.USER
      };

      const result = createUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidUser = {
        email: 'invalid-email',
        username: 'johndoe',
        password: 'StrongPass123'
      };

      const result = createUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email format');
      }
    });
  });
});
