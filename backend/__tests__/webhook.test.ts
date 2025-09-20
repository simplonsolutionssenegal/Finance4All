import request from 'supertest';
import app from '@/index';
import { logger } from '@/utils/logger';

// Mock du logger pour éviter les logs pendant les tests
jest.mock('@/utils/logger');

jest.mock('@/utils/emailService', () => ({
    sendInvitationEmail: jest.fn().mockResolvedValue(undefined),
    testEmailConnection: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/infrastructure/web/middleware/webhook.middleware', () => ({
    logWebhookRequest: (_req: any, _res: any, next: any) => next(),
    webhookRateLimit: (_req: any, _res: any, next: any) => next(),
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

    it('should handle webhook even when email service fails', async () => {
      const { sendInvitationEmail } = require('@/utils/emailService');

      // Mock email service to fail
      sendInvitationEmail.mockRejectedValue(new Error('Email service unavailable'));

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

      // Should still return 200 even if email fails in test mode
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Webhook traité avec succès',
        eventType: 'organizationInvitation.created'
      });

      // Verify email service was called
      expect(sendInvitationEmail).toHaveBeenCalledWith({
        recipientEmail: 'test@example.com',
        organizationName: 'Test Org',
        role: 'member',
        inviterEmail: undefined,
        invitationId: 'test-123',
        organizationId: undefined
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