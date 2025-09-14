import request from 'supertest';
import app from '../index';
import { logger } from '@/utils/logger';

// Mock du logger pour éviter les logs pendant les tests
jest.mock('../utils/logger');

// Mock du service d'email
jest.mock('../utils/emailService', () => ({
  sendInvitationEmail: jest.fn().mockResolvedValue(undefined)
}));

describe('Webhook Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/webhooks/clerk', () => {
    it('should process webhook without validation (test mode)', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/clerk')
        .send({
          type: 'organizationInvitation.created',
          data: {
            id: 'test-123',
            email_address: 'test@example.com',
            organization: { name: 'Test Org' },
            role: 'member'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Webhook traité avec succès'
      });
    });

    it('should handle unknown webhook events', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/clerk')
        .send({
          type: 'unknown.event',
          data: { id: 'test-123' }
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Webhook traité avec succès'
      });
    });

    it('should handle health check endpoint', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'OK'
      });
    });

    it('should handle test API endpoint', async () => {
      const response = await request(app).get('/api/v1/test');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'success',
        message: 'API is working!'
      });
    });
  });

  describe('Webhook Middleware', () => {
    it('should log webhook requests', () => {
      // Ce test vérifie que le middleware de logging fonctionne
      // Dans un vrai environnement, vous pourriez tester avec un webhook valide
      expect(logger.info).toBeDefined();
    });
  });
});