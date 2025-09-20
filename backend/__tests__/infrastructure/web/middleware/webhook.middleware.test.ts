import { Request, Response, NextFunction } from 'express';
import { validateClerkWebhook, logWebhookRequest, webhookRateLimit } from '@/infrastructure/web/middleware/webhook.middleware';
import { Webhook } from 'svix';
import { logger } from '@/utils/logger';

// Mock dependencies
jest.mock('svix');
jest.mock('../../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const MockedWebhook = Webhook as jest.MockedClass<typeof Webhook>;
const mockLogger = logger as any;

describe('Webhook Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      headers: {},
      body: {},
      method: 'POST',
      url: '/webhook',
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' } as any,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    // Reset environment variables
    delete process.env.CLERK_WEBHOOK_SECRET;
  });

  describe('validateClerkWebhook', () => {
    const validHeaders = {
      'svix-id': 'msg_123',
      'svix-timestamp': '1234567890',
      'svix-signature': 'v1,signature123',
      'user-agent': 'Svix-Webhooks/1.0',
    };

    const mockWebhookEvent = {
      type: 'user.created',
      data: { id: 'user_123' },
    };

    it('should validate webhook successfully with correct headers and signature', () => {
      process.env.CLERK_WEBHOOK_SECRET = 'whsec_test123';
      mockRequest.headers = validHeaders;
      mockRequest.body = { type: 'user.created', data: { id: 'user_123' } };

      const mockWebhookInstance = {
        verify: jest.fn().mockReturnValue(mockWebhookEvent),
      };
      MockedWebhook.mockImplementation(() => mockWebhookInstance as any);

      validateClerkWebhook(mockRequest as Request, mockResponse as Response, mockNext);

      expect(MockedWebhook).toHaveBeenCalledWith('whsec_test123');
      expect(mockWebhookInstance.verify).toHaveBeenCalledWith(
        JSON.stringify({ type: 'user.created', data: { id: 'user_123' } }),
        {
          'svix-id': 'msg_123',
          'svix-timestamp': '1234567890',
          'svix-signature': 'v1,signature123',
        }
      );
      expect(mockLogger.info).toHaveBeenCalledWith('Webhook Clerk validé avec succès', {
        eventType: 'user.created',
        eventId: 'msg_123',
        timestamp: '1234567890',
      });
      expect(mockRequest.body).toEqual(mockWebhookEvent);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 400 when svix-id header is missing', () => {
      mockRequest.headers = {
        'svix-timestamp': '1234567890',
        'svix-signature': 'v1,signature123',
      };

      validateClerkWebhook(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith('Headers de signature Clerk manquants', {
        svixId: false,
        svixTimestamp: true,
        svixSignature: true,
        userAgent: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Headers de signature manquants',
        message: 'Les headers svix-id, svix-timestamp et svix-signature sont requis',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when svix-timestamp header is missing', () => {
      mockRequest.headers = {
        'svix-id': 'msg_123',
        'svix-signature': 'v1,signature123',
      };

      validateClerkWebhook(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when svix-signature header is missing', () => {
      mockRequest.headers = {
        'svix-id': 'msg_123',
        'svix-timestamp': '1234567890',
      };

      validateClerkWebhook(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 500 when CLERK_WEBHOOK_SECRET is not configured', () => {
      mockRequest.headers = validHeaders;

      validateClerkWebhook(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith('CLERK_WEBHOOK_SECRET non configuré');
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Configuration manquante',
        message: 'Le secret du webhook n\'est pas configuré',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when signature verification fails', () => {
      process.env.CLERK_WEBHOOK_SECRET = 'whsec_test123';
      mockRequest.headers = validHeaders;
      mockRequest.body = { type: 'user.created', data: {} };

      const verificationError = new Error('Invalid signature');
      const mockWebhookInstance = {
        verify: jest.fn().mockImplementation(() => {
          throw verificationError;
        }),
      };
      MockedWebhook.mockImplementation(() => mockWebhookInstance as any);

      validateClerkWebhook(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith('Échec de la validation du webhook Clerk', {
        error: verificationError,
        svixId: 'msg_123',
        svixTimestamp: '1234567890',
        userAgent: 'Svix-Webhooks/1.0',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Signature invalide',
        message: 'La signature du webhook n\'a pas pu être vérifiée',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors gracefully', () => {
      process.env.CLERK_WEBHOOK_SECRET = 'whsec_test123';
      mockRequest.headers = validHeaders;
      mockRequest.body = { type: 'user.created', data: {} };

      // Simulate an unexpected error in Webhook constructor
      MockedWebhook.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      validateClerkWebhook(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith('Erreur dans le middleware de validation webhook', {
        error: expect.any(Error),
        url: '/webhook',
        method: 'POST',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Erreur interne',
        message: 'Erreur lors de la validation du webhook',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('logWebhookRequest', () => {
    it('should log webhook request details', () => {
      mockRequest = {
        method: 'POST',
        url: '/webhook/clerk',
        headers: {
          'user-agent': 'Svix-Webhooks/1.0',
          'content-type': 'application/json',
          'content-length': '150',
          'svix-id': 'msg_123',
        },
      };

      logWebhookRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.info).toHaveBeenCalledWith('Webhook reçu', {
        method: 'POST',
        url: '/webhook/clerk',
        userAgent: 'Svix-Webhooks/1.0',
        contentType: 'application/json',
        contentLength: '150',
        svixId: 'msg_123',
        timestamp: expect.any(String),
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle missing headers gracefully', () => {
      mockRequest = {
        method: 'POST',
        url: '/webhook',
        headers: {},
      };

      logWebhookRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.info).toHaveBeenCalledWith('Webhook reçu', {
        method: 'POST',
        url: '/webhook',
        userAgent: undefined,
        contentType: undefined,
        contentLength: undefined,
        svixId: undefined,
        timestamp: expect.any(String),
      });
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('webhookRateLimit', () => {
    it('should log rate limit check with IP from req.ip', () => {
      mockRequest = {
        ...mockRequest,
        ip: '192.168.1.1',
        headers: {
          'user-agent': 'Svix-Webhooks/1.0',
        },
      };

      webhookRateLimit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledWith('Webhook rate limit check', {
        clientIp: '192.168.1.1',
        userAgent: 'Svix-Webhooks/1.0',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should use connection.remoteAddress when req.ip is not available', () => {
      mockRequest = {
        ...mockRequest,
        ip: undefined,
        connection: { remoteAddress: '10.0.0.1' } as any,
      };

      webhookRateLimit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledWith('Webhook rate limit check', {
        clientIp: '10.0.0.1',
        userAgent: undefined,
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should use "unknown" when no IP is available', () => {
      mockRequest = {
        ...mockRequest,
        ip: undefined,
        connection: {} as any,
      };

      webhookRateLimit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.debug).toHaveBeenCalledWith('Webhook rate limit check', {
        clientIp: 'unknown',
        userAgent: undefined,
      });
      expect(mockNext).toHaveBeenCalled();
    });
  });
});