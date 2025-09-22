import request from 'supertest';
import express from 'express';
import { apiRoutes } from '@/routes';

// Mock user routes
jest.mock('@/infrastructure/web/routes/user.routes', () => {
  const router = require('express').Router();

  router.post('/', (req: any, res: any) => {
    if (!req.body.name || !req.body.email) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Name and email are required',
      });
    }
    res.status(201).json({
      id: '1',
      name: req.body.name,
      email: req.body.email,
    });
  });

  return router;
});

describe('API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1', apiRoutes);
  });

  describe('Test Route', () => {
    it('should return success response for test route', async () => {
      const response = await request(app).get('/api/v1/test').expect(200);

      expect(response.body).toMatchObject({
        status: 'success',
        message: 'API is working!',
        timestamp: expect.any(String),
        version: expect.any(String),
      });
    });

    it('should return valid timestamp in ISO format', async () => {
      const response = await request(app).get('/api/v1/test').expect(200);

      const timestamp = response.body.timestamp;
      expect(() => new Date(timestamp).toISOString()).not.toThrow();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should use API version from environment or default to v1', async () => {
      const originalApiVersion = process.env.API_VERSION;

      // Test with custom API version
      process.env.API_VERSION = 'v2';
      const response1 = await request(app).get('/api/v1/test').expect(200);
      expect(response1.body.version).toBe('v2');

      // Test with default API version
      delete process.env.API_VERSION;
      const response2 = await request(app).get('/api/v1/test').expect(200);
      expect(response2.body.version).toBe('v1');

      // Restore original
      process.env.API_VERSION = originalApiVersion;
    });
  });

  describe('User Routes Integration', () => {
    it('should route POST requests to user routes', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const response = await request(app).post('/api/v1/users').send(userData).expect(201);

      expect(response.body).toMatchObject({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    it('should handle validation errors from user routes', async () => {
      const incompleteData = {
        name: 'John Doe',
        // missing email
      };

      const response = await request(app).post('/api/v1/users').send(incompleteData).expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation failed',
        message: 'Name and email are required',
      });
    });
  });

  describe('Route Structure', () => {
    it('should have users route mounted', () => {
      expect(apiRoutes).toBeDefined();
      expect(typeof apiRoutes).toBe('function');
    });

    it('should handle unsupported methods gracefully', async () => {
      await request(app).put('/api/v1/test').expect(404);
    });

    it('should handle DELETE requests as unsupported', async () => {
      await request(app).delete('/api/v1/test').expect(404);
    });

    it('should handle PATCH requests as unsupported', async () => {
      await request(app).patch('/api/v1/test').expect(404);
    });
  });

  describe('Content Type Handling', () => {
    it('should handle JSON content type', async () => {
      const response = await request(app)
        .get('/api/v1/test')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('status');
    });

    it('should handle requests without explicit content type', async () => {
      const response = await request(app).get('/api/v1/test').expect(200);

      expect(response.body).toHaveProperty('status', 'success');
    });
  });

  describe('Route Parameters', () => {
    it('should handle routes without parameters', async () => {
      const response = await request(app).get('/api/v1/test').expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should not interfere with user route parameters', async () => {
      // Test that user routes can still handle their own parameters
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      const response = await request(app).post('/api/v1/users').send(userData).expect(201);

      expect(response.body.name).toBe('Jane Doe');
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors from user routes', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({}) // Empty body should trigger validation error
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
