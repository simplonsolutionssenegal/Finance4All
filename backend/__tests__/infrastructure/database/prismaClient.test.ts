import { prisma } from '@/infrastructure/config/prismaClient';

describe('PrismaClient', () => {
  it('should have user property', () => {
    expect(prisma).toHaveProperty('user');
  });
});
