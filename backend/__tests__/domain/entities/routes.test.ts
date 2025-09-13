import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock des routes enfants
jest.mock('@/infrastructure/web/routes/user.routes');
jest.mock('@/infrastructure/web/routes/institutionFinanciere.routes');

const mockUserRoutes = jest.fn((req: any, res: any, next: any) => {
  if (req.path === '/profile') {
    res.json({ user: 'profile' });
  } else {
    next();
  }
});

const mockInstitutionRoutes = jest.fn((req: any, res: any, next: any) => {
  if (req.path === '/list') {
    res.json({ institutions: [] });
  } else {
    next();
  }
});

jest.mocked(require('@/infrastructure/web/routes/user.routes')).default = mockUserRoutes;
jest.mocked(require('@/infrastructure/web/routes/institutionFinanciere.routes')).default = mockInstitutionRoutes;

describe('API Routes', () => {
  let app: express.Application;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.clearAllMocks();
    
    // Créer une app Express pour les tests
    app = express();
    app.use(express.json());
    
    // Importer et utiliser les routes après la configuration des mocks
  const { apiRoutes } = require('@/routes/index');
    app.use('/api', apiRoutes);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Test Route', () => {
    it('should return API status with default version', async () => {
      // Supprimer la version pour tester la valeur par défaut
      delete process.env.API_VERSION;

      const response = await request(app)
        .get('/api/test')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'API is working!',
        timestamp: expect.any(String),
        version: 'v1',
      });

      // Vérifier que le timestamp est une date valide
      expect(new Date(response.body.timestamp).getTime()).not.toBeNaN();
    });

    it('should return API status with custom version', async () => {
      process.env.API_VERSION = 'v2';

      const response = await request(app)
        .get('/api/test')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'API is working!',
        timestamp: expect.any(String),
        version: 'v2',
      });
    });

    it('should have correct content type headers', async () => {
      const response = await request(app)
        .get('/api/test')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Users Routes Integration', () => {
    it('should mount user routes under /users', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(200);

      expect(response.body).toEqual({ user: 'profile' });
      expect(mockUserRoutes).toHaveBeenCalled();
    });

    it('should handle user routes with different paths', async () => {
      await request(app)
        .get('/api/users/other-endpoint')
        .expect(404);

      expect(mockUserRoutes).toHaveBeenCalled();
    });
  });

  describe('Institutions Routes Integration', () => {
    it('should mount institution routes under /institutions', async () => {
      const response = await request(app)
        .get('/api/institutions/list')
        .expect(200);

      expect(response.body).toEqual({ institutions: [] });
      expect(mockInstitutionRoutes).toHaveBeenCalled();
    });

    it('should handle institution routes with different paths', async () => {
      await request(app)
        .get('/api/institutions/other-endpoint')
        .expect(404);

      expect(mockInstitutionRoutes).toHaveBeenCalled();
    });
  });

  describe('Route Structure', () => {
    it('should handle unmatched routes correctly', async () => {
      await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });

    it('should handle POST requests to test route', async () => {
      // La route test est définie seulement pour GET
      await request(app)
        .post('/api/test')
        .expect(404);
    });

    it('should handle different HTTP methods', async () => {
      // Test différentes méthodes HTTP sur la route test
      await request(app)
        .put('/api/test')
        .expect(404);

      await request(app)
        .delete('/api/test')
        .expect(404);

      await request(app)
        .patch('/api/test')
        .expect(404);
    });
  });

  describe('Router Configuration', () => {
    it('should export apiRoutes correctly', () => {
  const { apiRoutes } = require('@/routes/index');
      expect(apiRoutes).toBeDefined();
      expect(typeof apiRoutes).toBe('function'); // Express Router is a function
    });

    it('should be configurable as Express middleware', () => {
  const { apiRoutes } = require('@/routes/index');
      const testApp = express();
      
      // Ne devrait pas lever d'erreur
      expect(() => {
        testApp.use('/api', apiRoutes);
      }).not.toThrow();
    });
  });

  describe('Environment Integration', () => {
    it('should handle missing environment variables gracefully', async () => {
      // Supprimer toutes les variables d'environnement liées à l'API
      delete process.env.API_VERSION;
      delete process.env.NODE_ENV;

      const response = await request(app)
        .get('/api/test')
        .expect(200);

      expect(response.body.version).toBe('v1');
    });

    it('should handle empty environment variables', async () => {
      process.env.API_VERSION = '';

      const response = await request(app)
        .get('/api/test')
        .expect(200);

      // Avec ??, une chaîne vide n'est pas remplacée par la valeur par défaut
      expect(response.body.version).toBe('');
    });
  });
});
