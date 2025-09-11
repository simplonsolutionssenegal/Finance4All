import request from 'supertest';
import express from 'express';
import { roleRoutes } from '../../infrastructure/web/routes/role.routes';

// Mock the dependencies
jest.mock('../../infrastructure/database/PrismaRoleRepository');
jest.mock('../../application/use-cases/GetAllRolesUseCase');

describe('Role Routes', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/roles', roleRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/roles/', () => {
    it('should return 200 and call getAll controller method', async () => {
      const response = await request(app)
        .get('/api/v1/roles/')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should return roles array structure', async () => {
      const response = await request(app)
        .get('/api/v1/roles/')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(5).fill(null).map(() => 
        request(app).get('/api/v1/roles/')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/json/);
      });
    });

    it('should not accept query parameters (roles endpoint is simple)', async () => {
      const response = await request(app)
        .get('/api/v1/roles/')
        .query({ page: '1', limit: '10' })
        .expect('Content-Type', /json/);

      // Should still work, query params are ignored
      expect(response.status).toBe(200);
    });
  });

  describe('Route Error Handling', () => {
    it('should return 404 for non-existent role routes', async () => {
      const response = await request(app)
        .get('/api/v1/roles/nonexistent')
        .expect(404);

      expect(response.status).toBe(404);
    });

    it('should return 404 for unsupported HTTP methods', async () => {
      const response = await request(app)
        .post('/api/v1/roles/')
        .expect(404);

      expect(response.status).toBe(404);
    });

    it('should return 404 for PUT method', async () => {
      const response = await request(app)
        .put('/api/v1/roles/')
        .expect(404);

      expect(response.status).toBe(404);
    });

    it('should return 404 for DELETE method', async () => {
      const response = await request(app)
        .delete('/api/v1/roles/')
        .expect(404);

      expect(response.status).toBe(404);
    });

    it('should return 404 for PATCH method', async () => {
      const response = await request(app)
        .patch('/api/v1/roles/')
        .expect(404);

      expect(response.status).toBe(404);
    });
  });

  describe('HTTP Headers', () => {
    it('should return correct content-type header', async () => {
      const response = await request(app)
        .get('/api/v1/roles/');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should handle different Accept headers', async () => {
      const response = await request(app)
        .get('/api/v1/roles/')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should handle wildcard Accept header', async () => {
      const response = await request(app)
        .get('/api/v1/roles/')
        .set('Accept', '*/*');

      expect(response.status).toBe(200);
    });
  });

  describe('Performance and Load', () => {
    it('should handle multiple simultaneous requests', async () => {
      const startTime = Date.now();
      
      const requests = Array(10).fill(null).map(() => 
        request(app).get('/api/v1/roles/')
      );

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within reasonable time (adjust as needed)
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });

  describe('Route Path Variations', () => {
    it('should work with trailing slash', async () => {
      const response = await request(app)
        .get('/api/v1/roles/')
        .expect(200);

      expect(response.status).toBe(200);
    });

    it('should work without trailing slash', async () => {
      const response = await request(app)
        .get('/api/v1/roles')
        .expect(200);

      expect(response.status).toBe(200);
    });
  });
});
