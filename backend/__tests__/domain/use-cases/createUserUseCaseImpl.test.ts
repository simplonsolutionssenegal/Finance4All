import { CreateUserUseCaseImpl } from '@/domain/use-cases/createUserUseCaseImpl';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { User } from '@/domain/entities/User';

// Helper function for test assertions
function fail(message: string): never {
  throw new Error(message);
}

// Mock the UserRepository
const mockUserRepository: jest.Mocked<UserRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
};

describe('CreateUserUseCaseImpl', () => {
  let createUserUseCase: CreateUserUseCaseImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    createUserUseCase = new CreateUserUseCaseImpl(mockUserRepository);
  });

  describe('execute', () => {
    it('should create user successfully with valid data', async () => {
      const name = 'John Doe';
      const email = 'john.doe@example.com';
      const mockUser = new User('123', name, email);

      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await createUserUseCase.execute(name, email);

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name,
          email,
          id: expect.any(String),
        })
      );
      expect(result).toEqual(mockUser);
      expect(result.name).toBe(name);
      expect(result.email).toBe(email);
    });

    it('should throw error when name is empty', async () => {
      await expect(createUserUseCase.execute('', 'test@example.com')).rejects.toThrow(
        'Le nom et l\'email sont requis'
      );

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when name is null/undefined', async () => {
      await expect(createUserUseCase.execute(null as any, 'test@example.com')).rejects.toThrow(
        'Le nom et l\'email sont requis'
      );

      await expect(createUserUseCase.execute(undefined as any, 'test@example.com')).rejects.toThrow(
        'Le nom et l\'email sont requis'
      );

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when email is empty', async () => {
      await expect(createUserUseCase.execute('John Doe', '')).rejects.toThrow(
        'Le nom et l\'email sont requis'
      );

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when email is null/undefined', async () => {
      await expect(createUserUseCase.execute('John Doe', null as any)).rejects.toThrow(
        'Le nom et l\'email sont requis'
      );

      await expect(createUserUseCase.execute('John Doe', undefined as any)).rejects.toThrow(
        'Le nom et l\'email sont requis'
      );

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for invalid email format', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test@.com',
        'test@example',
      ];

      for (const invalidEmail of invalidEmails) {
        mockUserRepository.save.mockClear(); // Clear previous calls
        try {
          await createUserUseCase.execute('John Doe', invalidEmail);
          fail(`Expected error for invalid email: ${invalidEmail}`);
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe('Format d\'email invalide');
        }
      }

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'test123@subdomain.example.org',
        'user_name@example-domain.com',
      ];

      for (const validEmail of validEmails) {
        const mockUser = new User('123', 'Test User', validEmail);
        mockUserRepository.save.mockResolvedValue(mockUser);

        const result = await createUserUseCase.execute('Test User', validEmail);

        expect(result.email).toBe(validEmail);
        expect(mockUserRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            email: validEmail,
          })
        );
      }
    });

    it('should generate unique user IDs', async () => {
      const name = 'John Doe';
      const email = 'john.doe@example.com';

      // Mock to return the saved user as-is
      mockUserRepository.save.mockImplementation((user) => Promise.resolve(user));

      // Execute twice with a small delay to ensure different timestamps
      await createUserUseCase.execute(name, email);

      // Wait a millisecond to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 2));

      await createUserUseCase.execute(name, email);

      expect(mockUserRepository.save).toHaveBeenCalledTimes(2);

      const firstCall = mockUserRepository.save.mock.calls[0][0];
      const secondCall = mockUserRepository.save.mock.calls[1][0];

      expect(firstCall.id).not.toBe(secondCall.id);
      expect(firstCall.name).toBe(name);
      expect(firstCall.email).toBe(email);
      expect(secondCall.name).toBe(name);
      expect(secondCall.email).toBe(email);
    });

    it('should propagate repository errors', async () => {
      const repositoryError = new Error('Database connection failed');
      mockUserRepository.save.mockRejectedValue(repositoryError);

      await expect(createUserUseCase.execute('John Doe', 'john@example.com')).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should create User entity with correct properties', async () => {
      const name = 'Jane Smith';
      const email = 'jane.smith@example.com';
      const mockUser = new User('123', name, email);

      mockUserRepository.save.mockResolvedValue(mockUser);

      await createUserUseCase.execute(name, email);

      const savedUser = mockUserRepository.save.mock.calls[0][0];
      expect(savedUser).toBeInstanceOf(User);
      expect(savedUser.name).toBe(name);
      expect(savedUser.email).toBe(email);
      expect(savedUser.id).toBeDefined();
      expect(typeof savedUser.id).toBe('string');
    });
  });

  describe('email validation', () => {
    it('should validate email format correctly', async () => {
      // Test the private method indirectly through execute
      const testCases = [
        { email: 'valid@example.com', shouldBeValid: true },
        { email: 'user.name@domain.co.uk', shouldBeValid: true },
        { email: 'user+tag@example.org', shouldBeValid: true },
        { email: 'invalid-email', shouldBeValid: false },
        { email: '@domain.com', shouldBeValid: false },
        { email: 'user@', shouldBeValid: false },
        { email: 'user@domain', shouldBeValid: false },
      ];

      for (const { email, shouldBeValid } of testCases) {
        if (shouldBeValid) {
          const mockUser = new User('123', 'Test User', email);
          mockUserRepository.save.mockResolvedValue(mockUser);

          await expect(createUserUseCase.execute('Test User', email)).resolves.toBeDefined();
        } else {
          await expect(createUserUseCase.execute('Test User', email)).rejects.toThrow(
            'Format d\'email invalide'
          );
        }
      }
    });
  });
});