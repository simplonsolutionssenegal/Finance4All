import { DuplicateError, NotFoundError, InvalidError } from '@/domain/shared/errors';

describe('Domain Errors', () => {
  describe('DuplicateError', () => {
    it('should create error with correct message', () => {
      const error = new DuplicateError('Test Name', 'institution');

      expect(error.message).toBe('Entity institution with name Test Name already exists');
      expect(error.name).toBe('DuplicateError');
      expect(error).toBeInstanceOf(Error);
    });

    it('should create error for different entities', () => {
      const userError = new DuplicateError('john@example.com', 'user');

      expect(userError.message).toBe('Entity user with name john@example.com already exists');
      expect(userError.name).toBe('DuplicateError');
    });
  });

  describe('NotFoundError', () => {
    it('should create error with correct message', () => {
      const error = new NotFoundError('123', 'institution');

      expect(error.message).toBe('Entity institution with id 123 not found');
      expect(error.name).toBe('NotFoundError');
      expect(error).toBeInstanceOf(Error);
    });

    it('should create error for different entities', () => {
      const userError = new NotFoundError('user_456', 'user');

      expect(userError.message).toBe('Entity user with id user_456 not found');
      expect(userError.name).toBe('NotFoundError');
    });
  });

  describe('InvalidError', () => {
    it('should create error with correct message', () => {
      const error = new InvalidError('Name is required', 'institution');

      expect(error.message).toBe('Invalid entitiy institution: Name is required');
      expect(error.name).toBe('InvalidError');
      expect(error).toBeInstanceOf(Error);
    });

    it('should create error for different entities', () => {
      const userError = new InvalidError('Email format is invalid', 'user');

      expect(userError.message).toBe('Invalid entitiy user: Email format is invalid');
      expect(userError.name).toBe('InvalidError');
    });

    it('should handle complex validation messages', () => {
      const error = new InvalidError('Password must be at least 8 characters', 'account');

      expect(error.message).toBe('Invalid entitiy account: Password must be at least 8 characters');
      expect(error.name).toBe('InvalidError');
    });
  });
});
