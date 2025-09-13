import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { PrismaUserRepository } from '@/infrastructure/database/PrismaUserRepository';
import { User as DomainUser } from '@/domain/entities/User';

// Mock Prisma
jest.mock('@/infrastructure/database/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockPrisma = require('@/infrastructure/database/prisma').prisma;

describe('PrismaUserRepository', () => {
  let userRepository: PrismaUserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new PrismaUserRepository();
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const mockPrismaUser = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await userRepository.findById('user-123');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toBeInstanceOf(DomainUser);
      expect(result?.id).toBe('user-123');
      expect(result?.name).toBe('John Doe');
      expect(result?.email).toBe('john@example.com');
    });

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.findById('non-existent');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent' },
      });
      expect(result).toBeNull();
    });

    it('should handle user with null name', async () => {
      const mockPrismaUser = {
        id: 'user-123',
        name: null,
        email: 'john@example.com',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await userRepository.findById('user-123');

      expect(result).toBeInstanceOf(DomainUser);
      expect(result?.name).toBe(''); // null name converted to empty string
      expect(result?.email).toBe('john@example.com');
    });
  });

  describe('save', () => {
    it('should create and return user', async () => {
      const domainUser = new DomainUser('user-456', 'Jane Doe', 'jane@example.com');
      const mockCreatedUser = {
        id: 'user-456',
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);

      const result = await userRepository.save(domainUser);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          id: 'user-456',
          name: 'Jane Doe',
          email: 'jane@example.com',
        },
      });
      expect(result).toBeInstanceOf(DomainUser);
      expect(result.id).toBe('user-456');
      expect(result.name).toBe('Jane Doe');
      expect(result.email).toBe('jane@example.com');
    });

    it('should handle user with empty name', async () => {
      const domainUser = new DomainUser('user-789', '', 'empty@example.com');
      const mockCreatedUser = {
        id: 'user-789',
        name: '',
        email: 'empty@example.com',
      };

      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);

      const result = await userRepository.save(domainUser);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          id: 'user-789',
          name: '',
          email: 'empty@example.com',
        },
      });
      expect(result).toBeInstanceOf(DomainUser);
      expect(result.name).toBe('');
    });
  });

  describe('toDomain function', () => {
    it('should convert Prisma user to domain user with valid name', async () => {
      const mockPrismaUser = {
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await userRepository.findById('test-id');

      // This tests the toDomain function indirectly
      expect(result).toBeInstanceOf(DomainUser);
      expect(result?.id).toBe('test-id');
      expect(result?.name).toBe('Test User');
      expect(result?.email).toBe('test@example.com');
    });

    it('should convert Prisma user to domain user with null name', async () => {
      const mockPrismaUser = {
        id: 'test-id',
        name: null,
        email: 'test@example.com',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await userRepository.findById('test-id');

      // This tests the toDomain function with null name handling
      expect(result).toBeInstanceOf(DomainUser);
      expect(result?.name).toBe(''); // null converted to empty string
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors in findById', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database connection error'));

      await expect(userRepository.findById('user-123')).rejects.toThrow('Database connection error');
    });

    it('should handle database errors in save', async () => {
      const domainUser = new DomainUser('user-456', 'Jane Doe', 'jane@example.com');
      mockPrisma.user.create.mockRejectedValue(new Error('Constraint violation'));

      await expect(userRepository.save(domainUser)).rejects.toThrow('Constraint violation');
    });
  });
});
