import request from 'supertest';
import express from 'express';
import webhookRoutes from '@/infrastructure/web/routes/webhook.routes';
import { logger } from '@/utils/logger';
import { sendInvitationEmail } from '@/utils/emailService';

// Mock dependencies
jest.mock('../../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../../../src/utils/emailService', () => ({
  sendInvitationEmail: jest.fn(),
}));

jest.mock('../../../../src/infrastructure/web/middleware/webhook.middleware', () => ({
  logWebhookRequest: jest.fn((req, res, next) => next()),
  webhookRateLimit: jest.fn((req, res, next) => next()),
}));

const mockLogger = logger as any;
const mockSendInvitationEmail = sendInvitationEmail as jest.MockedFunction<typeof sendInvitationEmail>;

describe('Webhook Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/webhook', webhookRoutes);

    // Set default environment
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  describe('POST /webhook/clerk', () => {
    const validInvitationEvent = {
      type: 'organizationInvitation.created',
      data: {
        id: 'orginv_123',
        email_address: 'test@example.com',
        organization_id: 'org_123',
        organization: {
          id: 'org_123',
          name: 'Test Organization',
        },
        role: 'admin',
        created_by: {
          email_addresses: [
            {
              email_address: 'inviter@example.com',
            },
          ],
        },
      },
    } as any;

    it('should handle organizationInvitation.created event successfully', async () => {
      mockSendInvitationEmail.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/webhook/clerk')
        .send(validInvitationEvent)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Webhook traité avec succès',
        eventType: 'organizationInvitation.created',
        environment: 'test',
      });

      expect(mockLogger.info).toHaveBeenCalledWith('Webhook Clerk reçu', {
        type: 'organizationInvitation.created',
        eventId: 'orginv_123',
        environment: 'test',
      });

      expect(mockSendInvitationEmail).toHaveBeenCalledWith({
        recipientEmail: 'test@example.com',
        organizationName: 'Test Organization',
        role: 'admin',
        inviterEmail: 'inviter@example.com',
        invitationId: 'orginv_123',
        organizationId: 'org_123',
      });
    });

    it('should handle minimal invitation data with defaults', async () => {
      const minimalEvent = {
        type: 'organizationInvitation.created',
        data: {
          id: 'orginv_456',
          email_address: 'minimal@example.com',
        },
      } as any;

      mockSendInvitationEmail.mockResolvedValue(undefined);

      await request(app)
        .post('/webhook/clerk')
        .send(minimalEvent)
        .expect(200);

      expect(mockSendInvitationEmail).toHaveBeenCalledWith({
        recipientEmail: 'minimal@example.com',
        organizationName: 'Finance4All',
        role: 'member',
        inviterEmail: undefined,
        invitationId: 'orginv_456',
        organizationId: undefined,
      });
    });

    it('should handle organizationInvitation.accepted event', async () => {
      const acceptedEvent = {
        type: 'organizationInvitation.accepted',
        data: {
          id: 'orginv_accepted',
          email_address: 'accepted@example.com',
        },
      } as any;

      await request(app)
        .post('/webhook/clerk')
        .send(acceptedEvent)
        .expect(200);

      expect(mockLogger.info).toHaveBeenCalledWith('Invitation acceptée', {
        invitationId: 'orginv_accepted',
        email: 'accepted@example.com',
      });

      expect(mockSendInvitationEmail).not.toHaveBeenCalled();
    });

    it('should handle organizationInvitation.revoked event', async () => {
      const revokedEvent = {
        type: 'organizationInvitation.revoked',
        data: {
          id: 'orginv_revoked',
          email_address: 'revoked@example.com',
        },
      } as any;

      await request(app)
        .post('/webhook/clerk')
        .send(revokedEvent)
        .expect(200);

      expect(mockLogger.info).toHaveBeenCalledWith('Invitation révoquée', {
        invitationId: 'orginv_revoked',
        email: 'revoked@example.com',
      });

      expect(mockSendInvitationEmail).not.toHaveBeenCalled();
    });

    it('should handle unknown event types', async () => {
      const unknownEvent = {
        type: 'user.created' as any,
        data: {
          id: 'user_123',
        },
      } as any;

      await request(app)
        .post('/webhook/clerk')
        .send(unknownEvent)
        .expect(200);

      expect(mockLogger.info).toHaveBeenCalledWith('Événement webhook non traité', {
        type: 'user.created',
        environment: 'test',
      });

      expect(mockSendInvitationEmail).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid webhook payload without type', async () => {
      const invalidPayload = {
        data: { id: 'test' },
      };

      const response = await request(app)
        .post('/webhook/clerk')
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Payload invalide',
        message: 'Le type d\'événement est requis',
      });

      expect(mockLogger.error).toHaveBeenCalledWith('Webhook event invalide - pas de type', {
        body: invalidPayload,
      });
    });

    it('should continue processing when email sending fails', async () => {
      const emailError = new Error('SMTP connection failed');
      mockSendInvitationEmail.mockRejectedValue(emailError);

      const response = await request(app)
        .post('/webhook/clerk')
        .send(validInvitationEvent)
        .expect(200);

      expect(response.body.message).toBe('Webhook traité avec succès');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Erreur lors de l\'envoi de l\'email d\'invitation',
        {
          emailError,
          recipient: 'test@example.com',
          isTestEnvironment: true,
        }
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Mode test détecté - erreur d\'email ignorée pour le webhook'
      );
    });

    it('should handle invalid invitation data gracefully', async () => {
      const invalidInvitationEvent = {
        type: 'organizationInvitation.created',
        data: {
          // Missing required fields
          invalid: 'data',
        },
      } as any;

      await request(app)
        .post('/webhook/clerk')
        .send(invalidInvitationEvent)
        .expect(200);

      expect(mockLogger.error).toHaveBeenCalledWith('Données d\'invitation invalides reçues', {
        eventType: 'organizationInvitation.created',
        data: { invalid: 'data' },
      });

      expect(mockSendInvitationEmail).not.toHaveBeenCalled();
    });

    it('should handle missing required fields in invitation data', async () => {
      const incompleteEvent = {
        type: 'organizationInvitation.created',
        data: {
          id: 'orginv_incomplete',
          // Missing email_address
        },
      } as any;

      await request(app)
        .post('/webhook/clerk')
        .send(incompleteEvent)
        .expect(200);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Données d\'invitation invalides reçues',
        {
          eventType: 'organizationInvitation.created',
          data: { id: 'orginv_incomplete' },
        }
      );
    });

    it('should extract organization ID from nested properties', async () => {
      const eventWithNestedOrgId = {
        type: 'organizationInvitation.created',
        data: {
          id: 'orginv_nested',
          email_address: 'nested@example.com',
          organization: {
            id: 'org_nested_123',
            name: 'Nested Org',
          },
        },
      } as any;

      mockSendInvitationEmail.mockResolvedValue(undefined);

      await request(app)
        .post('/webhook/clerk')
        .send(eventWithNestedOrgId)
        .expect(200);

      expect(mockSendInvitationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: 'org_nested_123',
        })
      );
    });

    it('should handle server errors gracefully', async () => {
      // Mock a server error by making logger.info throw
      mockLogger.info.mockImplementationOnce(() => {
        throw new Error('Unexpected server error');
      });

      const response = await request(app)
        .post('/webhook/clerk')
        .send(validInvitationEvent)
        .expect(500);

      expect(response.body).toEqual({
        error: 'Erreur interne du serveur',
        message: 'Impossible de traiter le webhook',
        environment: 'test',
      });
    });

    it('should warn when organization ID is not found', async () => {
      const eventWithoutOrgId = {
        type: 'organizationInvitation.created',
        data: {
          id: 'orginv_no_org',
          email_address: 'no-org@example.com',
          organization: {
            name: 'No ID Org',
          },
        },
      } as any;

      mockSendInvitationEmail.mockResolvedValue(undefined);

      await request(app)
        .post('/webhook/clerk')
        .send(eventWithoutOrgId)
        .expect(200);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'organizationId non trouvé dans le webhook, il sera récupéré côté frontend'
      );
    });

    it('should handle email error in production differently', async () => {
      process.env.NODE_ENV = 'production';

      const emailError = new Error('SMTP connection failed');
      mockSendInvitationEmail.mockRejectedValue(emailError);

      await request(app)
        .post('/webhook/clerk')
        .send(validInvitationEvent)
        .expect(200);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Email d\'invitation échoué mais webhook traité comme succès'
      );
    });
  });
});