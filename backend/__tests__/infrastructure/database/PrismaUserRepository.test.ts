import { PrismaUserRepository } from '@/infrastructure/database/PrismaUserRepository';
import { User } from '@/domain/entities/User';
import { prisma } from '@/infrastructure/database/prisma';

// Mock Prisma User type
type PrismaUser = {
  id: number;
  name: string;
  email: string;
};

// Mock Prisma client
jest.mock('@/infrastructure/database/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as unknown as {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
};

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;

  beforeEach(() => {
    repository = new PrismaUserRepository();
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find a user by id successfully', async () => {
      const mockPrismaUser: PrismaUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findById('1');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('1');
      expect(result?.name).toBe('John Doe');
      expect(result?.email).toBe('john@example.com');
    });

    it('should return null when id is not numeric', async () => {
      const result = await repository.findById('nonexistent');

      // Should not call Prisma when id is not numeric
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      mockPrisma.user.findUnique.mockRejectedValue(error);

      await expect(repository.findById('1')).rejects.toThrow('Database connection failed');
    });
  });

  describe('save', () => {
    it('should save a user successfully', async () => {
      const domainUser = new User('1', 'John Doe', 'john@example.com');
      const mockPrismaUser: PrismaUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      };

      mockPrisma.user.create.mockResolvedValue(mockPrismaUser);

      const result = await repository.save(domainUser);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
        },
      });
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe('1');
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
    });

    it('should handle save errors', async () => {
      const domainUser = new User('1', 'John Doe', 'invalid-email');
      const error = new Error('Unique constraint failed');
      mockPrisma.user.create.mockRejectedValue(error);

      await expect(repository.save(domainUser)).rejects.toThrow('Unique constraint failed');
    });

    it('should save user with another numeric id', async () => {
      const domainUser = new User('2', 'Jane Smith', 'jane.smith@example.com');
      const mockPrismaUser: PrismaUser = {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
      };

      mockPrisma.user.create.mockResolvedValue(mockPrismaUser);

      const result = await repository.save(domainUser);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
      });
      expect(result.id).toBe('2');
      expect(result.name).toBe('Jane Smith');
      expect(result.email).toBe('jane.smith@example.com');
    });
  });

  describe('toDomain conversion', () => {
    it('should correctly convert Prisma user to domain user', async () => {
      const mockPrismaUser: PrismaUser = {
        id: 42,
        name: 'Test User',
        email: 'test@example.com',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findById('42');

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe(mockPrismaUser.id.toString());
      expect(result?.name).toBe(mockPrismaUser.name);
      expect(result?.email).toBe(mockPrismaUser.email);
    });
  });
});
