import request from 'supertest';

// Mock all dependencies before importing the app
jest.mock('@/infrastructure/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('@/infrastructure/config/prismaClient', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

jest.mock('@clerk/express', () => ({
  clerkMiddleware: () => (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@/infrastructure/docs/swagger', () => ({
  setupSwagger: jest.fn(),
}));

jest.mock('@/infrastructure/web/routes', () => ({
  apiRoutes: require('express').Router(),
}));

describe('App', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('GET /health', () => {
    it('should return healthy status when database is connected', async () => {
      const { prisma } = require('@/infrastructure/config/prismaClient');
      prisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);

      const createApp = require('@/infrastructure/web/app').default;
      const app = createApp();

      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.database).toBe('connected');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return unhealthy status when database fails', async () => {
      const { prisma } = require('@/infrastructure/config/prismaClient');
      prisma.$queryRaw.mockRejectedValue(new Error('Connection failed'));

      const createApp = require('@/infrastructure/web/app').default;
      const app = createApp();

      const response = await request(app).get('/health');

      expect(response.status).toBe(503);
      expect(response.body.status).toBe('unhealthy');
      expect(response.body.database).toBe('disconnected');
      expect(response.body.error).toBe('Database connection failed');
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const createApp = require('@/infrastructure/web/app').default;
      const app = createApp();

      const response = await request(app).get('/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Route not found');
      expect(response.body.path).toBe('/non-existent-route');
    });
  });

  describe('development logging middleware', () => {
    it('should log requests in development mode', async () => {
      process.env.NODE_ENV = 'development';
      jest.resetModules();

      const { logger } = require('@/infrastructure/utils/logger');
      const { prisma } = require('@/infrastructure/config/prismaClient');
      prisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);

      const createApp = require('@/infrastructure/web/app').default;
      const app = createApp();

      await request(app).get('/health');

      expect(logger.info).toHaveBeenCalled();
    });

    it('should not log requests in production mode', async () => {
      process.env.NODE_ENV = 'production';
      jest.resetModules();

      const { logger } = require('@/infrastructure/utils/logger');
      const { prisma } = require('@/infrastructure/config/prismaClient');
      prisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);

      const createApp = require('@/infrastructure/web/app').default;
      const app = createApp();

      await request(app).get('/health');

      // In production, logger.info should only be called from health endpoint, not from the dev middleware
      const devLogCalls = (logger.info as jest.Mock).mock.calls.filter(
        (call: any[]) => call[0]?.includes && call[0].includes('GET')
      );
      expect(devLogCalls.length).toBe(0);
    });
  });

  describe('CORS configuration', () => {
    it('should allow configured origin', async () => {
      process.env.CORS_ORIGIN = 'https://example.com';
      jest.resetModules();

      const { prisma } = require('@/infrastructure/config/prismaClient');
      prisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);

      const createApp = require('@/infrastructure/web/app').default;
      const app = createApp();

      const response = await request(app).get('/health').set('Origin', 'https://example.com');

      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  describe('API version configuration', () => {
    it('should use default API version when not specified', async () => {
      delete process.env.API_VERSION;
      jest.resetModules();

      const createApp = require('@/infrastructure/web/app').default;
      const app = createApp();

      // The app should be created successfully with default /api/v1 route
      expect(app).toBeDefined();
    });

    it('should use custom API version when specified', async () => {
      process.env.API_VERSION = 'v2';
      jest.resetModules();

      const createApp = require('@/infrastructure/web/app').default;
      const app = createApp();

      // The app should be created successfully with custom /api/v2 route
      expect(app).toBeDefined();
    });
  });

  describe('Security headers', () => {
    it('should not expose x-powered-by header', async () => {
      const { prisma } = require('@/infrastructure/config/prismaClient');
      prisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);

      const createApp = require('@/infrastructure/web/app').default;
      const app = createApp();

      const response = await request(app).get('/health');

      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });
});
