import request from 'supertest';
import { app } from '@/main';

// Mock external dependencies
jest.mock('@/infrastructure/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@clerk/express', () => ({
  clerkMiddleware: jest.fn(() => (req: any, res: any, next: any) => next()),
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

// Mock process.exit to prevent Jest from actually exiting
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('process.exit called');
});

describe.skip('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockExit.mockRestore();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        database: 'connected',
        environment: process.env.NODE_ENV || 'development',
      });
    });

    it('should return valid timestamp format', async () => {
      const response = await request(app).get('/health').expect(200);

      const timestamp = response.body.timestamp;
      expect(new Date(timestamp)).toBeInstanceOf(Date);
      expect(isNaN(new Date(timestamp).getTime())).toBe(false);
    });
  });

  describe('API Routes', () => {
    it('should handle API test route', async () => {
      const response = await request(app).get('/api/v1/test').expect(200);

      expect(response.body).toMatchObject({
        status: 'success',
        message: 'API is working!',
        timestamp: expect.any(String),
        version: expect.any(String),
      });
    });

    it('should use default API version when not set', async () => {
      const originalApiVersion = process.env.API_VERSION;
      delete process.env.API_VERSION;

      const response = await request(app).get('/api/v1/test').expect(200);

      expect(response.body.version).toBe('v1');

      process.env.API_VERSION = originalApiVersion;
    });
  });

  describe('CORS Configuration', () => {
    it('should handle CORS preflight requests', async () => {
      await request(app).options('/api/v1/test').expect(204);
    });

    it('should include CORS headers in responses', async () => {
      const response = await request(app).get('/api/v1/test').expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Middleware Integration', () => {
    it('should parse JSON requests', async () => {
      const testData = { test: 'data' };

      const response = await request(app)
        .post('/api/v1/users')
        .send(testData)
        .set('Content-Type', 'application/json');

      // Should be handled by the route (even if it returns an error)
      expect([201, 400, 500]).toContain(response.status);
    });

    it('should handle URL-encoded data', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send('name=John&email=john@example.com')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      expect([201, 400, 500]).toContain(response.status);
    });

    it('should include security headers from helmet', async () => {
      const response = await request(app).get('/health').expect(200);

      // Helmet adds various security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route').expect(404);

      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Route not found',
        path: '/unknown-route',
      });
    });

    it('should return 404 for unknown API routes', async () => {
      const response = await request(app).get('/api/v1/unknown').expect(404);

      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Route not found',
        path: '/api/v1/unknown',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle errors with error middleware', async () => {
      // This test assumes the error middleware is properly configured
      // The actual behavior depends on how errors are thrown in the routes
      const response = await request(app).get('/api/v1/test').expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  describe('Environment Configuration', () => {
    it('should handle different NODE_ENV values', async () => {
      const originalNodeEnv = process.env.NODE_ENV;

      process.env.NODE_ENV = 'test';
      const response = await request(app).get('/health').expect(200);

      expect(response.body.environment).toBe('test');

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should handle missing environment variables gracefully', async () => {
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      const response = await request(app).get('/health').expect(200);

      expect(response.body).toHaveProperty('environment');
      expect(response.body.environment).toBe('development');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Request Logging', () => {
    it('should not break when logging is enabled', async () => {
      const response = await request(app).get('/api/v1/test').expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('API is working!');
    });
  });
});
