import { PrismaUserRepository } from '@/infrastructure/database/PrismaUserRepository';
import { prisma } from '@/infrastructure/database/prisma';

// Mock Prisma User type (aligned with current schema expectations)
type PrismaUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  role: string;
  avatar: string | null;
  organisationId: number | null;
  username: string | null;
  clerkId: string | null;
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

  describe('findByEmail/findByClerkId', () => {
    it('should find a user by email successfully', async () => {
      const mockPrismaUser: PrismaUser = {
        id: 1,
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        status: 'ACTIF',
        isActive: true,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: 'BENEFICIAIRE',
        avatar: null,
        organisationId: null,
        username: null,
        clerkId: 'clrk_1',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findByEmail('john@example.com');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });
      expect(result?.email).toBe('john@example.com');
      expect(result?.firstName).toBe('John');
    });

    it('should return null when user is not found by email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('missing@example.com');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'missing@example.com' } });
      expect(result).toBeNull();
    });

    it('should find a user by clerkId successfully', async () => {
      const mockPrismaUser: PrismaUser = {
        id: 2,
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        status: 'ACTIF',
        isActive: true,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: 'BENEFICIAIRE',
        avatar: null,
        organisationId: null,
        username: null,
        clerkId: 'clrk_2',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findByClerkId('clrk_2');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { clerkId: 'clrk_2' } });
      expect(result?.clerkId).toBe('clrk_2');
      expect(result?.email).toBe('jane@example.com');
    });
  });

  describe('createFromClerk', () => {
    it('should create a user from Clerk data successfully', async () => {
      const input = {
        email: 'john@example.com',
        clerkId: 'clrk_123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'BENEFICIAIRE',
        status: 'ACTIF',
      } as any;

      const mockPrismaUser: PrismaUser = {
        id: 10,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        status: input.status,
        isActive: true,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: input.role,
        avatar: null,
        organisationId: null,
        username: null,
        clerkId: input.clerkId,
      };

      mockPrisma.user.create.mockResolvedValue(mockPrismaUser);

      const result = await repository.createFromClerk(input);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: input.email,
          clerkId: input.clerkId,
          firstName: input.firstName,
          lastName: input.lastName,
          role: input.role,
          status: input.status,
        },
      });
      expect(result.email).toBe('john@example.com');
      expect(result.clerkId).toBe('clrk_123');
    });

    it('should propagate creation errors', async () => {
      const error = new Error('Unique constraint failed');
      mockPrisma.user.create.mockRejectedValue(error);

      await expect(
        repository.createFromClerk({
          email: 'x@example.com',
          clerkId: 'clrk_x',
          firstName: 'X',
          lastName: 'Y',
          role: 'BENEFICIAIRE',
          status: 'ACTIF',
        } as any),
      ).rejects.toThrow('Unique constraint failed');
    });
  });

  describe('basic read conversion', () => {
    it('should return a plain object with expected fields from Prisma result', async () => {
      const mockPrismaUser: PrismaUser = {
        id: 42,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        status: 'ACTIF',
        isActive: true,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: 'BENEFICIAIRE',
        avatar: null,
        organisationId: null,
        username: null,
        clerkId: 'clrk_42',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findByEmail('test@example.com');

      expect(result?.id).toBe(42);
      expect(result?.email).toBe('test@example.com');
      expect(result?.firstName).toBe('Test');
      expect(result?.clerkId).toBe('clrk_42');
    });
  });
});
