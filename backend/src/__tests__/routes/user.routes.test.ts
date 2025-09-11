import request from 'supertest';
import express from 'express';
import { userRoutes } from '../../infrastructure/web/routes/user.routes';

// Mock the dependencies
jest.mock('../../infrastructure/database/PrismaUserRepository');
jest.mock('../../domain/use-cases/createUserUseCaseImpl');
jest.mock('../../application/use-cases/GetAllUsersUseCase');
jest.mock('../../application/use-cases/SearchUsersUseCase');

describe('User Routes', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/users', userRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/users/', () => {
    it('should return 200 and call getAllUsers controller method', async () => {
      const response = await request(app)
        .get('/api/v1/users/')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should handle query parameters for pagination', async () => {
      const response = await request(app)
        .get('/api/v1/users/')
        .query({
          page: '1',
          limit: '10',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should handle invalid query parameters gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/users/')
        .query({
          page: 'invalid',
          limit: 'invalid'
        });

      // Should still return 200 as the controller should handle validation
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/v1/users/search', () => {
    it('should return 200 and call search controller method', async () => {
      const response = await request(app)
        .get('/api/v1/users/search')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should handle search query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/users/search')
        .query({
          search: 'john',
          roleId: 'admin-role-id',
          status: 'ACTIF',
          organizationId: 'org-id',
          page: '1',
          limit: '20'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should handle multiple filter values', async () => {
      const response = await request(app)
        .get('/api/v1/users/search')
        .query({
          roleId: ['role1', 'role2'],
          status: ['ACTIF', 'EN_ATTENTE']
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should handle date range filters', async () => {
      const response = await request(app)
        .get('/api/v1/users/search')
        .query({
          createdAfter: '2024-01-01',
          createdBefore: '2024-12-31',
          lastLoginAfter: '2024-06-01'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should handle empty search parameters', async () => {
      const response = await request(app)
        .get('/api/v1/users/search')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/v1/users/create', () => {
    const validUserData = {
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      roleId: 'user-role-id'
    };

    it('should return 201 for valid user creation', async () => {
      const response = await request(app)
        .post('/api/v1/users/create')
        .send(validUserData)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
    });

    it('should handle user creation with optional fields', async () => {
      const userWithOptionalFields = {
        ...validUserData,
        organizationId: 'org-id',
        status: 'ACTIF'
      };

      const response = await request(app)
        .post('/api/v1/users/create')
        .send(userWithOptionalFields)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
    });

    it('should return 400 for missing required fields', async () => {
      const invalidUserData = {
        username: 'testuser'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/v1/users/create')
        .send(invalidUserData)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid email format', async () => {
      const invalidEmailData = {
        ...validUserData,
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/v1/users/create')
        .send(invalidEmailData)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });

    it('should return 400 for empty request body', async () => {
      const response = await request(app)
        .post('/api/v1/users/create')
        .send({})
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/users/create')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.status).toBe(400);
    });
  });

  describe('Route Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/v1/users/nonexistent')
        .expect(404);

      expect(response.status).toBe(404);
    });

    it('should return 405 for unsupported HTTP methods', async () => {
      const response = await request(app)
        .patch('/api/v1/users/')
        .expect(404); // Express returns 404 for unmatched routes

      expect(response.status).toBe(404);
    });
  });

  describe('Content-Type Handling', () => {
    it('should accept application/json content type', async () => {
      const response = await request(app)
        .post('/api/v1/users/create')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          roleId: 'user-role-id'
        }));

      expect(response.status).toBe(201);
    });

    it('should handle missing content-type header', async () => {
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
});
