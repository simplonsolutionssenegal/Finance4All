import { prisma } from '@/infrastructure/config/prismaClient';

describe.skip('PrismaClient', () => {
  it('should have user property', () => {
    expect(prisma).toHaveProperty('user');
  });
});
