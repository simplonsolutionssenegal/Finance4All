// Mock Clerk middleware to avoid authentication issues in tests
jest.mock('@clerk/express', () => ({
  clerkMiddleware: jest.fn(() => (_req: any, _res: any, next: any) => next()),
}));

jest.mock('@/infrastructure/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/infrastructure/config/prismaClient', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
  },
}));

import createApp from '@/infrastructure/web/app';
const app = createApp();
import request from 'supertest';

describe('Index', () => {
  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('should have a health check endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('should have a 404 handler', async () => {
    const response = await request(app).get('/404');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Route not found');
  });
});
