// Mock Clerk middleware to avoid authentication issues in tests
jest.mock('@clerk/express', () => ({
  clerkMiddleware: jest.fn(() => (_req: any, _res: any, next: any) => next()),
}));

import app from '@/infrastructure/web/app';
import request from 'supertest';

describe('Index', () => {
  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('should have a health check endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  it('should have a 404 handler', async () => {
    const response = await request(app).get('/404');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Route not found');
  });
});
