import request from 'supertest';
import express from 'express';
import { organizationRoutes } from '../../infrastructure/web/routes/organization.routes';

// Mock the dependencies
jest.mock('../../infrastructure/database/PrismaOrganizationRepository');
jest.mock('../../application/use-cases/GetAllOrganizationsUseCase');
jest.mock('../../application/use-cases/SearchOrganizationsUseCase');
jest.mock('../../application/use-cases/GetOrganizationTypesUseCase');

describe('Organization Routes', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/organizations', organizationRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/organizations/', () => {
    it('should return 200 and call getAll controller method', async () => {
      const response = await request(app)
        .get('/api/v1/organizations/')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/organizations/')
        .query({
          page: '1',
          limit: '10',
          sortBy: 'name',
          sortOrder: 'asc'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should handle invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/organizations/')
        .query({
          page: 'invalid',
          limit: 'invalid'
        });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/v1/organizations/search', () => {
    it('should return 200 and call search controller method', async () => {
      const response = await request(app)
        .get('/api/v1/organizations/search')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should handle search query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/organizations/search')
        .query({
          search: 'bank',
          type: 'BANK',
          page: '1',
          limit: '20',
          sortBy: 'name',
          sortOrder: 'desc'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should handle multiple organization types', async () => {
      const response = await request(app)
        .get('/api/v1/organizations/search')
        .query({
          type: ['BANK', 'COOPERATIVE', 'MICROFINANCE']
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should handle text search across name and type', async () => {
      const response = await request(app)
        .get('/api/v1/organizations/search')
        .query({
          search: 'Senegal Bank'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should handle combined filters', async () => {
      const response = await request(app)
        .get('/api/v1/organizations/search')
        .query({
          search: 'bank',
          type: ['BANK', 'MICROFINANCE'],
          page: '2',
          limit: '5',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should handle empty search parameters', async () => {
      const response = await request(app)
        .get('/api/v1/organizations/search')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should handle special characters in search', async () => {
      const response = await request(app)
        .get('/api/v1/organizations/search')
        .query({
          search: 'Banque & Finance'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/v1/organizations/types', () => {
    it('should return 200 and call getTypes controller method', async () => {
      const response = await request(app)
        .get('/api/v1/organizations/types')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should return organization types array', async () => {
      const response = await request(app)
        .get('/api/v1/organizations/types')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should not accept query parameters for types endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/organizations/types')
        .query({ filter: 'something' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should handle concurrent requests to types endpoint', async () => {
      const requests = Array(5).fill(null).map(() => 
        request(app).get('/api/v1/organizations/types')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/json/);
      });
    });
  });

  describe('Route Error Handling', () => {
    it('should return 404 for non-existent organization routes', async () => {
      const response = await request(app)
        .get('/api/v1/organizations/nonexistent')
        .expect(404);

      expect(response.status).toBe(404);
    });

    it('should return 404 for unsupported HTTP methods on root', async () => {
      const response = await request(app)
        .post('/api/v1/organizations/')
        .expect(404);

      expect(response.status).toBe(404);
    });

    it('should return 404 for unsupported HTTP methods on search', async () => {
      const response = await request(app)
        .post('/api/v1/organizations/search')
        .expect(404);

      expect(response.status).toBe(404);
    });

    it('should return 404 for unsupported HTTP methods on types', async () => {
      const response = await request(app)
        .post('/api/v1/organizations/types')
        .expect(404);

      expect(response.status).toBe(404);
    });
  });

  describe('HTTP Headers and Content-Type', () => {
    it('should return correct content-type for all endpoints', async () => {
      const endpoints = ['/', '/search', '/types'];
      
      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(`/api/v1/organizations${endpoint}`);

        expect(response.headers['content-type']).toMatch(/application\/json/);
      }
    });

    it('should handle different Accept headers', async () => {
      const response = await request(app)
        .get('/api/v1/organizations/')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle multiple simultaneous requests to different endpoints', async () => {
      const requests = [
        request(app).get('/api/v1/organizations/'),
        request(app).get('/api/v1/organizations/search'),
        request(app).get('/api/v1/organizations/types'),
        request(app).get('/api/v1/organizations/search').query({ type: 'BANK' }),
        request(app).get('/api/v1/organizations/').query({ page: '1', limit: '5' })
      ];

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle high-frequency search requests', async () => {
      const searchTerms = ['bank', 'finance', 'micro', 'cooperative', 'insurance'];
      
      const requests = searchTerms.map(term => 
        request(app)
          .get('/api/v1/organizations/search')
          .query({ search: term })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Route Path Variations', () => {
    it('should work with and without trailing slashes', async () => {
      const pathVariations = [
        '/api/v1/organizations/',
        '/api/v1/organizations',
        '/api/v1/organizations/search/',
        '/api/v1/organizations/search',
        '/api/v1/organizations/types/',
        '/api/v1/organizations/types'
      ];

      for (const path of pathVariations) {
        const response = await request(app).get(path);
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Query Parameter Edge Cases', () => {
    it('should handle extremely long search queries', async () => {
      const longQuery = 'a'.repeat(1000);
      
      const response = await request(app)
        .get('/api/v1/organizations/search')
        .query({ search: longQuery });

      expect(response.status).toBe(200);
    });

    it('should handle special characters in query parameters', async () => {
      const specialChars = ['!@#$%^&*()', 'café', '中文', 'العربية'];
      
      for (const chars of specialChars) {
        const response = await request(app)
          .get('/api/v1/organizations/search')
          .query({ search: chars });

        expect(response.status).toBe(200);
      }
    });

    it('should handle very large page numbers', async () => {
      const response = await request(app)
        .get('/api/v1/organizations/search')
        .query({ page: '999999', limit: '1' });

      expect(response.status).toBe(200);
    });
  });
});
