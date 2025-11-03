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
  const { prisma } = require('@/infrastructure/config/prismaClient');

  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('should log requests in development mode', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    jest.resetModules();

    const createApp = require('@/infrastructure/web/app').default;
    const devApp = createApp();
    // Réimporter le logger après resetModules pour avoir la nouvelle référence au mock
    const { logger: devLogger } = require('@/infrastructure/utils/logger');

    await request(devApp).get('/health');

    expect(devLogger.info).toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
    jest.resetModules();
  });

  it('should handle database connection failure in health check', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error('Connection failed'));

    const response = await request(app).get('/health');

    expect(response.status).toBe(503);
    expect(response.body.status).toBe('unhealthy');
    expect(response.body.database).toBe('disconnected');
  });
});
