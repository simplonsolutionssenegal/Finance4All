import { PrismaUserRepository } from '@/infrastructure/persistence/repositories/PrismaUserRepository';
import type { User as PrismaUser } from '@prisma/client';
import { User } from '@/domain/entities/User';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    repository = new PrismaUserRepository(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find user by id successfully', async () => {
      // Arrange
      const userId = 'user_123';
      const prismaUser: PrismaUser = {
        id: userId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+221771234567',
      };
      mockPrisma.user.findUnique.mockResolvedValue(prismaUser);

      // Act
      const result = await repository.findById(userId);

      // Assert
      expect(result).toEqual(
        new User(userId, 'John Doe', 'john.doe@example.com', 'BENEFICIARY', '+221771234567')
      );
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 'non_existent_user';
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findById(userId);

      // Assert
      expect(result).toBeNull();
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should handle database error', async () => {
      // Arrange
      const userId = 'user_123';
      const dbError = new Error('Database connection failed');
      mockPrisma.user.findUnique.mockRejectedValue(dbError);

      // Act & Assert
      await expect(repository.findById(userId)).rejects.toThrow('Database connection failed');
    });
  });

  describe('save', () => {
    it('should save user successfully', async () => {
      // Arrange
      const user = new User(
        'clerk_123',
        'John Doe',
        'john.doe@example.com',
        'beneficiary',
        '+221771234567'
      );
      const prismaUser: PrismaUser = {
        id: 'clerk_123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+221771234567',
      };
      mockPrisma.user.create.mockResolvedValue(prismaUser);

      // Act
      const result = await repository.save(user);

      // Assert
      expect(result).toEqual(
        new User('clerk_123', 'John Doe', 'john.doe@example.com', 'BENEFICIARY', '+221771234567')
      );
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          id: 'clerk_123',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+221771234567',
        },
      });
    });

    it('should save user without phone number', async () => {
      // Arrange
      const user = new User('clerk_123', 'John Doe', 'john.doe@example.com', 'beneficiary');
      const prismaUser: PrismaUser = {
        id: 'clerk_123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: null,
      };
      mockPrisma.user.create.mockResolvedValue(prismaUser);

      // Act
      const result = await repository.save(user);

      // Assert
      expect(result).toEqual(
        new User('clerk_123', 'John Doe', 'john.doe@example.com', 'BENEFICIARY')
      );
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          id: 'clerk_123',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phoneNumber: undefined,
        },
      });
    });

    it('should handle unique constraint error (duplicate email)', async () => {
      // Arrange
      const user = new User(
        'clerk_123',
        'John Doe',
        'john.doe@example.com',
        'beneficiary',
        '+221771234567'
      );
      const prismaError = {
        code: 'P2002',
        meta: { target: ['email'] },
        message: 'Unique constraint failed on the field: email',
      };
      mockPrisma.user.create.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(repository.save(user)).rejects.toEqual(prismaError);
    });

    it('should handle database connection error', async () => {
      // Arrange
      const user = new User(
        'clerk_123',
        'John Doe',
        'john.doe@example.com',
        'beneficiary',
        '+221771234567'
      );
      const dbError = new Error('Database connection failed');
      mockPrisma.user.create.mockRejectedValue(dbError);

      // Act & Assert
      await expect(repository.save(user)).rejects.toThrow('Database connection failed');
    });

    it('should handle validation error', async () => {
      // Arrange
      const user = new User(
        'clerk_123',
        'John Doe',
        'invalid-email',
        'beneficiary',
        '+221771234567'
      );
      const validationError = {
        code: 'P2003',
        message: 'Foreign key constraint failed',
      };
      mockPrisma.user.create.mockRejectedValue(validationError);

      // Act & Assert
      await expect(repository.save(user)).rejects.toEqual(validationError);
    });
  });

  describe('toDomain', () => {
    it('should convert PrismaUser to Domain User with phone number', () => {
      // Arrange
      const prismaUser: PrismaUser = {
        id: 'user_123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+221771234567',
      };

      // Act
      // @ts-ignore - accessing private method for testing
      const result = repository.toDomain(prismaUser);

      // Assert
      expect(result).toEqual(
        new User('user_123', 'John Doe', 'john.doe@example.com', 'BENEFICIARY', '+221771234567')
      );
    });

    it('should convert PrismaUser to Domain User without phone number', () => {
      // Arrange
      const prismaUser: PrismaUser = {
        id: 'user_123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: null,
      };

      // Act
      // @ts-ignore - accessing private method for testing
      const result = repository.toDomain(prismaUser);

      // Assert
      expect(result).toEqual(
        new User('user_123', 'John Doe', 'john.doe@example.com', 'BENEFICIARY')
      );
    });
  });

  describe('toPrismaData', () => {
    it('should convert Domain User to Prisma data with phone number', () => {
      // Arrange
      const user = new User(
        'clerk_123',
        'John Doe',
        'john.doe@example.com',
        'beneficiary',
        '+221771234567'
      );

      // Act
      // @ts-ignore - accessing private method for testing
      const result = repository.toPrismaData(user);

      // Assert
      expect(result).toEqual({
        id: 'clerk_123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+221771234567',
      });
    });

    it('should convert Domain User to Prisma data without phone number', () => {
      // Arrange
      const user = new User('clerk_123', 'John Doe', 'john.doe@example.com', 'beneficiary');

      // Act
      // @ts-ignore - accessing private method for testing
      const result = repository.toPrismaData(user);

      // Assert
      expect(result).toEqual({
        id: 'clerk_123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: undefined,
      });
    });
  });
});
