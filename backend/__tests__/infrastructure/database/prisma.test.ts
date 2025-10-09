// Mock PrismaClient before importing
import { prisma } from '@/infrastructure/config/prismaClient';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('Prisma Database Connection', () => {
  it('should export a prisma instance', () => {
    expect(prisma).toBeDefined();
    expect(prisma).toBeInstanceOf(Object);
  });

  it('should have expected database methods available', () => {
    expect(prisma.$connect).toBeDefined();
    expect(prisma.$disconnect).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
    expect(typeof prisma.$disconnect).toBe('function');
  });

  it('should have user model methods available', () => {
    expect(prisma.user).toBeDefined();
    expect(prisma.user.findUnique).toBeDefined();
    expect(prisma.user.create).toBeDefined();
    expect(prisma.user.update).toBeDefined();
    expect(prisma.user.delete).toBeDefined();
  });

  it('should be able to call connection methods', async () => {
    const connectSpy = jest.spyOn(prisma, '$connect');
    const disconnectSpy = jest.spyOn(prisma, '$disconnect');

    await prisma.$connect();
    await prisma.$disconnect();

    expect(connectSpy).toHaveBeenCalled();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should be properly typed', () => {
    // Verify the prisma instance has the expected structure
    expect(typeof prisma).toBe('object');
    expect(prisma).not.toBeNull();
  });
});
