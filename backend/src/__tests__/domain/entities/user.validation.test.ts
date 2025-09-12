// @ts-nocheck
import { describe, it, expect } from '@jest/globals';
<<<<<<<< HEAD:backend/__tests__/domain/entities/user.validation.test.ts
import { User } from 'backend/src/domain/entities/User';
import { CreateUserUseCaseImpl } from 'backend/src/domain/use-cases/createUserUseCaseImpl';
========
import { User } from '@/domain/entities/User';
import { CreateUserUseCaseImpl } from '@/domain/use-cases/createUserUseCaseImpl';
>>>>>>>> 98c576e (:white_check_mark: Mise à jour des tests backend):backend/src/__tests__/domain/entities/user.validation.test.ts

describe('User Entity and Use Cases', () => {
  describe('User Entity', () => {
    it('should create a user with correct properties', () => {
      const id = '123';
      const name = 'Test User';
      const email = 'test@example.com';

      const user = new User(id, name, email);

      expect(user.id).toBe(id);
      expect(user.name).toBe(name);
      expect(user.email).toBe(email);
    });
  });

  describe('CreateUserUseCase', () => {
    // Mock repository implementation
    const mockUserRepository = {
      save: jest.fn(user => Promise.resolve(user)),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      getAll: jest.fn(),
    };

    it('should throw error when name is missing', async () => {
      const createUserUseCase = new CreateUserUseCaseImpl(mockUserRepository);

      await expect(createUserUseCase.execute('', 'test@example.com')).rejects.toThrow(
        "Le nom et l'email sont requis"
      );
    });

    it('should throw error when email is missing', async () => {
      const createUserUseCase = new CreateUserUseCaseImpl(mockUserRepository);

      await expect(createUserUseCase.execute('Test User', '')).rejects.toThrow(
        "Le nom et l'email sont requis"
      );
    });

    it('should throw error when email is invalid', async () => {
      const createUserUseCase = new CreateUserUseCaseImpl(mockUserRepository);

      await expect(createUserUseCase.execute('Test User', 'invalid-email')).rejects.toThrow(
        "Format d'email invalide"
      );
    });

    it('should create user when input is valid', async () => {
      const createUserUseCase = new CreateUserUseCaseImpl(mockUserRepository);
      const name = 'Test User';
      const email = 'test@example.com';

      const user = await createUserUseCase.execute(name, email);

      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(user.name).toBe(name);
      expect(user.email).toBe(email);
      expect(user.id).toBeDefined();
    });
  });
});
