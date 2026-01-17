import express, { type Express } from 'express';
import request from 'supertest';
import { setupSwagger } from '@/infrastructure/docs/swagger';
import * as fs from 'fs';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn(),
}));

describe('Swagger Documentation', () => {
  let app: Express;
  const mockOpenApiContent = `
openapi: '3.0.0'
info:
  title: Finance4All API
  version: '1.0.0'
paths:
  /health:
    get:
      summary: Health check
      responses:
        '200':
          description: OK
`;

  beforeEach(() => {
    app = express();
    (fs.readFileSync as jest.Mock).mockReturnValue(mockOpenApiContent);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setupSwagger', () => {
    it('should setup swagger routes', () => {
      expect(() => setupSwagger(app)).not.toThrow();
    });

    it('should read openapi.yaml file', () => {
      setupSwagger(app);
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('openapi.yaml'),
        'utf-8'
      );
    });
  });

  describe('GET /openapi.json', () => {
    it('should return OpenAPI spec as JSON', async () => {
      setupSwagger(app);

      const response = await request(app).get('/openapi.json');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body).toBeDefined();
      expect(response.body.openapi).toBe('3.0.0');
      expect(response.body.info.title).toBe('Finance4All API');
    });

    it('should return valid JSON structure', async () => {
      setupSwagger(app);

      const response = await request(app).get('/openapi.json');

      expect(response.body.info).toBeDefined();
      expect(response.body.paths).toBeDefined();
    });
  });

  describe('GET /openapi.yaml', () => {
    it('should return OpenAPI spec as YAML', async () => {
      setupSwagger(app);

      const response = await request(app).get('/openapi.yaml');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/yaml/);
      expect(response.text).toContain('openapi:');
      expect(response.text).toContain('Finance4All API');
    });

    it('should return raw YAML content', async () => {
      setupSwagger(app);

      const response = await request(app).get('/openapi.yaml');

      expect(response.text).toBe(mockOpenApiContent);
    });
  });

  describe('GET /api-docs', () => {
    it('should serve Swagger UI', async () => {
      setupSwagger(app);

      const response = await request(app).get('/api-docs/');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });

    it('should redirect /api-docs to /api-docs/', async () => {
      setupSwagger(app);

      const response = await request(app).get('/api-docs');

      expect([200, 301, 302]).toContain(response.status);
    });
  });

  describe('Swagger UI Options', () => {
    it('should configure swagger with custom options', () => {
      setupSwagger(app);

      // The setup should not throw any errors
      expect(app).toBeDefined();
    });
  });
});
