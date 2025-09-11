import request from 'supertest';
import express from 'express';
import { apiRoutes } from '../../routes';

// Mock all the dependencies
jest.mock('../../infrastructure/database/PrismaUserRepository');
jest.mock('../../infrastructure/database/PrismaRoleRepository');
jest.mock('../../infrastructure/database/PrismaOrganizationRepository');
jest.mock('../../domain/use-cases/createUserUseCaseImpl');
jest.mock('../../application/use-cases/GetAllUsersUseCase');
jest.mock('../../application/use-cases/SearchUsersUseCase');
jest.mock('../../application/use-cases/GetAllRolesUseCase');
jest.mock('../../application/use-cases/GetAllOrganizationsUseCase');
jest.mock('../../application/use-cases/SearchOrganizationsUseCase');
jest.mock('../../application/use-cases/GetOrganizationTypesUseCase');

describe('API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1', apiRoutes);
    
    // Add health endpoint
    app.get('/health', (_req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      });
    });

    // Add 404 handler
    app.use((req, res) => {
      res.status(404).json({
        status: 'error',
        message: 'Route not found',
        path: req.originalUrl,
      });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('API Test Endpoint', () => {
    it('should return API status information', async () => {
      const response = await request(app)
        .get('/api/v1/test')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'API is working!',
        timestamp: expect.any(String),
        version: expect.any(String),
      });

      // Validate timestamp format
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('should handle concurrent requests to test endpoint', async () => {
      const requests = Array(10).fill(null).map(() => 
        request(app).get('/api/v1/test')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBe('API is working!');
      });
    });
  });

  describe('Health Check Endpoint', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: expect.any(String),
      });

      // Validate timestamp format
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return consistent uptime values', async () => {
      const response1 = await request(app).get('/health');
      
      // Wait a small amount of time
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response2 = await request(app).get('/health');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response2.body.uptime).toBeGreaterThanOrEqual(response1.body.uptime);
    });
  });

  describe('Cross-Route Integration', () => {
    it('should handle requests to all main endpoints', async () => {
      const endpoints = [
        '/api/v1/test',
        '/api/v1/users/',
        '/api/v1/users/search',
        '/api/v1/roles/',
        '/api/v1/organizations/',
        '/api/v1/organizations/search',
        '/api/v1/organizations/types',
        '/health'
      ];

      const requests = endpoints.map(endpoint => 
        request(app).get(endpoint)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/json/);
        console.log(`✓ ${endpoints[index]} - Status: ${response.status}`);
      });
    });

    it('should maintain consistent response format across endpoints', async () => {
      const endpoints = [
        '/api/v1/users/',
        '/api/v1/roles/',
        '/api/v1/organizations/'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.body).toBeDefined();
      }
    });
  });

  describe('API Versioning', () => {
    it('should handle API version in path correctly', async () => {
      const response = await request(app)
        .get('/api/v1/test')
        .expect(200);

      expect(response.body.version).toBeDefined();
    });

    it('should return 404 for invalid API versions', async () => {
      const response = await request(app)
        .get('/api/v2/test')
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Route not found');
    });
  });

  describe('Error Handling Integration', () => {
    it('should return 404 for completely invalid routes', async () => {
      const invalidRoutes = [
        '/api/v1/invalid',
        '/api/v1/users/invalid',
        '/api/v1/roles/invalid',
        '/api/v1/organizations/invalid',
        '/completely/invalid/path'
      ];

      for (const route of invalidRoutes) {
        const response = await request(app)
          .get(route)
          .expect(404);

        expect(response.body).toEqual({
          status: 'error',
          message: 'Route not found',
          path: route,
        });
      }
    });

    it('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/users/create')
        .set('Content-Type', 'application/json')
        .send('invalid json string')
        .expect(400);

      expect(response.status).toBe(400);
    });
  });

  describe('HTTP Methods Integration', () => {
    it('should only allow GET for read-only endpoints', async () => {
      const readOnlyEndpoints = [
        '/api/v1/test',
        '/api/v1/users/',
        '/api/v1/users/search',
        '/api/v1/roles/',
        '/api/v1/organizations/',
        '/api/v1/organizations/search',
        '/api/v1/organizations/types',
        '/health'
      ];

      for (const endpoint of readOnlyEndpoints) {
        // POST should return 404 (no route defined)
        const postResponse = await request(app)
          .post(endpoint)
          .expect(404);

        expect(postResponse.body.status).toBe('error');

        // GET should work
        const getResponse = await request(app)
          .get(endpoint)
          .expect(200);

        expect(getResponse.status).toBe(200);
      }
    });

    it('should allow POST for create endpoints', async () => {
      const response = await request(app)
        .post('/api/v1/users/create')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          roleId: 'user-role-id'
        });

      expect(response.status).toBe(201);
    });
  });

  describe('Performance Integration', () => {
    it('should handle mixed load across all endpoints', async () => {
      const mixedRequests = [
        request(app).get('/api/v1/test'),
        request(app).get('/api/v1/users/'),
        request(app).get('/api/v1/roles/'),
        request(app).get('/api/v1/organizations/types'),
        request(app).get('/health'),
        request(app).post('/api/v1/users/create').send({
          username: 'loadtest',
          email: 'load@test.com',
          firstName: 'Load',
          lastName: 'Test',
          roleId: 'test-role'
        }),
        request(app).get('/api/v1/users/search').query({ search: 'test' }),
        request(app).get('/api/v1/organizations/search').query({ type: 'BANK' })
      ];

      const startTime = Date.now();
      const responses = await Promise.all(mixedRequests);
      const endTime = Date.now();

      // All requests should complete successfully
      responses.forEach((response, index) => {
        if (index === 5) { // POST request
          expect(response.status).toBe(201);
        } else {
          expect(response.status).toBe(200);
        }
      });

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(10000);
    });
  });

  describe('Content Negotiation', () => {
    it('should handle various Accept headers', async () => {
      const acceptHeaders = [
        'application/json',
        'application/*',
        '*/*',
        'text/html,application/json'
      ];

      for (const acceptHeader of acceptHeaders) {
        const response = await request(app)
          .get('/api/v1/test')
          .set('Accept', acceptHeader);

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/json/);
      }
    });
  });
});
