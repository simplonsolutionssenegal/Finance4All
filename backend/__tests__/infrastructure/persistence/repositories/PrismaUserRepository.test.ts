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
});
