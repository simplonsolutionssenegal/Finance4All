import { prisma } from 'backend/src/infrastructure/database/prismaClient';

describe('PrismaClient', () => {
  it('should have user property', () => {
    expect(prisma).toHaveProperty('user');
  });
});
