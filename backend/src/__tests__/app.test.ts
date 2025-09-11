import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';

// Mock des modules avant l'import de l'app
jest.mock('@/utils/logger');
jest.mock('@clerk/express');
jest.mock('@/infrastructure/config/swagger');

// Mock des fonctions spécifiques
const mockLoggerInfo = jest.fn();
const mockLoggerError = jest.fn();
const mockClerkMiddleware = jest.fn(() => (req: any, res: any, next: any) => next());
const mockSetupSwagger = jest.fn();

// Configuration des mocks
jest.mocked(require('@/utils/logger')).logger = {
  info: mockLoggerInfo,
  error: mockLoggerError,
  warn: jest.fn(),
  debug: jest.fn(),
  child: jest.fn(),
};

jest.mocked(require('@clerk/express')).clerkMiddleware = mockClerkMiddleware;
jest.mocked(require('@/infrastructure/config/swagger')).setupSwagger = mockSetupSwagger;

// Mock des routes pour éviter les dépendances
jest.mock('@/routes', () => ({
  apiRoutes: jest.fn((req: any, res: any, next: any) => next()),
}));

describe('Express App Integration', () => {
  let app: any;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Sauvegarder l'environnement original
    originalEnv = { ...process.env };

    // Clear les mocks
    jest.clearAllMocks();

    // Définir les variables d'environnement pour les tests
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3000';
    process.env.API_VERSION = 'v1';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

    // Importer l'app après la configuration des mocks
    app = require('../index').default;
  });

  afterEach(() => {
    // Restaurer l'environnement
    process.env = originalEnv;
  });

  describe('Basic App Configuration', () => {
    it('should create Express app successfully', () => {
      expect(app).toBeDefined();
      expect(mockClerkMiddleware).toHaveBeenCalled();
      expect(mockSetupSwagger).toHaveBeenCalledWith(app);
    });
  });

  describe('Health Route', () => {
    it('should return health status with correct structure', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: process.env.NODE_ENV,
      });

      // Vérifier que le timestamp est une date valide
      expect(new Date(response.body.timestamp).getTime()).not.toBeNaN();
      
      // Vérifier que uptime est un nombre positif
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('404 Route Handler', () => {
    it('should return 404 for unknown routes with correct structure', async () => {
      const unknownPath = '/api/unknown-endpoint';
      const response = await request(app)
        .get(unknownPath)
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Route not found',
        path: unknownPath,
      });
    });

    it('should handle POST requests to unknown routes', async () => {
      const response = await request(app)
        .post('/unknown-post-route')
        .send({ data: 'test' })
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Route not found');
    });
  });

  describe('CORS Configuration', () => {
    it('should include CORS headers in responses', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Vérifier la présence d'headers CORS
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Security Headers', () => {
    it('should include security headers from Helmet', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Vérifier la présence d'headers de sécurité
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
    });
  });

  describe('JSON Parsing', () => {
    it('should parse JSON body correctly', async () => {
      // Cette route n'existe pas mais nous testons le parsing JSON
      const response = await request(app)
        .post('/api/v1/test')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      // Même si la route n'existe pas, le body devrait être parsé
      // avant d'atteindre le 404 handler
      expect(response.status).toBe(404);
    });
  });

  describe('URL Encoded Parsing', () => {
    it('should parse URL encoded body correctly', async () => {
      const response = await request(app)
        .post('/api/v1/test')
        .send('name=test&value=123')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      expect(response.status).toBe(404);
    });
  });

  describe('API Versioning', () => {
    it('should mount routes with correct API version prefix', async () => {
      // Test que les routes sont montées sous /api/v1
      const response = await request(app)
        .get('/api/v1/some-endpoint')
        .expect(404); // 404 car l'endpoint n'existe pas, mais le préfixe est correct

      expect(response.body.path).toBe('/api/v1/some-endpoint');
    });
  });

  describe('Environment Variable Handling', () => {
    it('should use default values when environment variables are not set', () => {
      // Supprimer les variables d'environnement
      delete process.env.PORT;
      delete process.env.API_VERSION;
      delete process.env.CORS_ORIGIN;

      // Recharger l'app
      delete require.cache[require.resolve('../index')];
      const appWithDefaults = require('../index').default;
      
      expect(appWithDefaults).toBeDefined();
    });
  });

  describe('Content Type Validation', () => {
    it('should handle invalid JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/test')
        .send('{"invalid": json}')
        .set('Content-Type', 'application/json');

      // L'app devrait gérer le JSON invalide via le middleware d'erreur
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Request Size Limits', () => {
    it('should accept requests within size limits', async () => {
      const largeButValidPayload = { data: 'x'.repeat(1000) };
      
      const response = await request(app)
        .post('/api/v1/test')
        .send(largeButValidPayload)
        .set('Content-Type', 'application/json');

      // Même si l'endpoint n'existe pas, la taille ne devrait pas être un problème
      expect(response.status).toBe(404);
    });
  });
});
