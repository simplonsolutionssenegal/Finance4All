import { PrismaUserRepository } from '@/infrastructure/database/PrismaUserRepository';
import { User, UserRole, UserStatus } from '@/domain/entities/User';

// Mock the entire Prisma client
jest.mock('@prisma/client', () => {
  const mockUser = {
    findUnique: jest.fn(),
    create: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => ({
      user: mockUser,
      $disconnect: jest.fn(),
    })),
  };
});

// Import Prisma after setting up the mock
import { PrismaClient } from '@prisma/client';
const mockPrisma = new PrismaClient();
const mockFindUnique = mockPrisma.user.findUnique as jest.Mock;
const mockCreate = mockPrisma.user.create as jest.Mock;

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  const now = new Date();

  // Mock user data
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    status: UserStatus.ACTIF,
    isActive: true,
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
    role: UserRole.BENEFICIAIRE,
    avatar: null,
    organisationId: null,
    username: null,
    clerkId: 'clerk_123',
    password: null,
  } as User;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new PrismaUserRepository();
  });

  afterAll(async () => {
    await mockPrisma.$disconnect();
  });

  describe('findByEmail', () => {
    it('should find a user by email successfully', async () => {
      // Mock the Prisma client to return our mock user
      mockFindUnique.mockResolvedValue(mockUser);

      const result = await repository.findByEmail('test@example.com');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found by email', async () => {
      // Mock the Prisma client to return null (user not found)
      mockFindUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByClerkId', () => {
    it('should find a user by clerkId successfully', async () => {
      // Mock the Prisma client to return our mock user
      mockFindUnique.mockResolvedValue(mockUser);

      const result = await repository.findByClerkId('clerk_123');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { clerkId: 'clerk_123' } });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found by clerkId', async () => {
      // Mock the Prisma client to return null (user not found)
      mockFindUnique.mockResolvedValue(null);

      const result = await repository.findByClerkId('nonexistent_clerk_id');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: 'nonexistent_clerk_id' },
      });
      expect(result).toBeNull();
    });
  });

  describe('createFromClerk', () => {
    it('should create a new user from Clerk data', async () => {
      const userData = {
        email: 'new@example.com',
        clerkId: 'clerk_new',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.BENEFICIAIRE,
        status: UserStatus.ACTIF,
      };

      const createdUser = {
        ...userData,
        id: 2,
        isActive: true,
        lastLoginAt: now,
        createdAt: now,
        updatedAt: now,
        avatar: null,
        organisationId: null,
        username: null,
      };

      // Mock the Prisma client to return the created user
      mockCreate.mockResolvedValue(createdUser);

      const result = await repository.createFromClerk(userData);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: userData,
      });
      expect(result).toEqual(createdUser);
    });

    it('should handle errors during user creation', async () => {
      const userData = {
        email: 'error@example.com',
        clerkId: 'clerk_error',
        firstName: 'Error',
        lastName: 'User',
        role: UserRole.BENEFICIAIRE,
        status: UserStatus.ACTIF,
      };

      const error = new Error('Database error');
      // Mock the Prisma client to reject with an error
      mockCreate.mockRejectedValue(error);

      await expect(repository.createFromClerk(userData)).rejects.toThrow('Database error');
    });
  });

  describe('signUp', () => {
    it('should reject with error since password-based signup is not supported', async () => {
      await expect(
        repository.signUp({
          email: 'test@example.com',
          password: 'password',
        } as any),
      ).rejects.toThrow('Password-based sign up is not supported');
    });
  });

  describe('data mapping', () => {
    it('should map Prisma user data to domain model', async () => {
      const mockPrismaUser = {
        id: 42,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        status: 'ACTIF',
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'BENEFICIAIRE',
        avatar: null,
        organisationId: null,
        username: null,
        clerkId: 'clrk_42',
        password: null,
      };

      mockFindUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findByEmail('test@example.com');

      expect(result?.id).toBe(42);
      expect(result?.email).toBe('test@example.com');
      expect(result?.firstName).toBe('Test');
      expect(result?.clerkId).toBe('clrk_42');
    });
  });
});
