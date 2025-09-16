// @ts-nocheck
import { describe, it, expect } from '@jest/globals';
import { User } from '@/domain/entities/User';
import { CreateUserUseCaseImpl } from '@/domain/use-cases/createUserUseCaseImpl';

describe('User Entity and Use Cases', () => {
  describe('User Entity', () => {
    it('should create a user with correct properties', () => {
      const id = 123;
      const email = 'test@example.com';
      const password: string | null = null;
      const firstName = 'Test';
      const lastName = 'User';
      const status = 0 as any; // placeholder; not asserted directly
      const isActive = true;
      const now = new Date();
      const role = 0 as any; // placeholder; not asserted directly

      const user = new User(
        id,
        email,
        password,
        firstName,
        lastName,
        status,
        isActive,
        now,
        now,
        now,
        role,
      );

      expect(user.id).toBe(id);
      expect(user.email).toBe(email);
      expect(user.firstName).toBe(firstName);
      expect(user.lastName).toBe(lastName);
      expect(user.isActive).toBe(true);
    });
  });

  describe('CreateUserUseCase', () => {
    // Mock repository implementation aligned with current API
    const mockUserRepository = {
      signUp: jest.fn(userData =>
        Promise.resolve({
          id: '1',
          email: userData.email,
          firstName: userData.firstname || '',
          lastName: userData.lastname || '',
          role: userData.role,
          status: userData.status,
          isActive: true,
          lastLoginAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          password: userData.password || '',
          avatar: null,
          organisationId: null,
          username: null,
          clerkId: userData.clerkId || null,
        }),
      ),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      getAll: jest.fn(),
    } as any;

    it('should throw error when name is missing', async () => {
      const createUserUseCase = new CreateUserUseCaseImpl(mockUserRepository);

      await expect(createUserUseCase.execute('', 'test@example.com')).rejects.toThrow(
        "Le nom et l'email sont requis",
      );
    });

    it('should throw error when email is missing', async () => {
      const createUserUseCase = new CreateUserUseCaseImpl(mockUserRepository);

      await expect(createUserUseCase.execute('Test User', '')).rejects.toThrow(
        "Le nom et l'email sont requis",
      );
    });

    it('should throw error when email is invalid', async () => {
      const createUserUseCase = new CreateUserUseCaseImpl(mockUserRepository);

      await expect(createUserUseCase.execute('Test User', 'invalid-email')).rejects.toThrow(
        "Format d'email invalide",
      );
    });

    it('should create user when input is valid', async () => {
      const createUserUseCase = new CreateUserUseCaseImpl(mockUserRepository as any);
      const name = 'Test User';
      const email = 'test@example.com';

      const user = await createUserUseCase.execute(name, email);

      expect(mockUserRepository.signUp).toHaveBeenCalled();
      expect(user.email).toBe(email);
      expect(user.id).toBeDefined();
    });
  });
});
