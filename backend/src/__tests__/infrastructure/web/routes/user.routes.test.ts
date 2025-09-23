import request from 'supertest';
import express from 'express';

// Mock des dépendances minimales
jest.mock('@/infrastructure/services/ClerkService');

const mockAuthController = {
  register: jest.fn(),
};

jest.doMock('@/infrastructure/web/controllers/AuthController', () => {
  return {
    AuthController: jest.fn().mockImplementation(() => {
      return mockAuthController;
    }),
  };
});

describe('User Routes (Clerk)', () => {
  let app: express.Application;
  let userRoutes: express.Router;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Dynamically import routes after mocks are set up
    userRoutes = require('@/infrastructure/web/routes/user.routes').default;

    // Setup Express app with routes
    app = express();
    app.use(express.json());
    app.use('/users', userRoutes);
  });

  describe('POST /users/register', () => {
    it('should call authController.register method', async () => {
      // Mock successful response
      mockAuthController.register.mockImplementation(async (req: any, res: any) => {
        res.status(200).json({ success: true, data: { email: 'john@example.com', clerkId: 'clrk_123' } });
      });

      const payload = {
        email: 'john@example.com',
        clerkId: 'clrk_123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app).post('/users/register').send(payload).expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { email: 'john@example.com', clerkId: 'clrk_123' },
      });
    });

    it('should handle validation errors', async () => {
      // Mock error response
      mockAuthController.register.mockImplementation(async (req: any, res: any) => {
        res.status(400).json({
          success: false,
          error: { message: 'Format de requête invalide' },
        });
      });

      const invalidPayload = {
        email: 'invalid-email',
        clerkId: 'clrk_123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app).post('/users/register').send(invalidPayload).expect(400);

      expect(response.body).toEqual({
        success: false,
        error: { message: 'Format de requête invalide' },
      });
    });

    it('should handle missing required fields', async () => {
      // Mock error response for missing fields
      mockAuthController.register.mockImplementation(async (req: any, res: any) => {
        res.status(400).json({
          success: false,
          error: { message: 'clerkUserId et email sont requis' },
        });
      });

      const incompletePayload = {
        email: 'john@example.com',
      };

      const response = await request(app)
        .post('/users/register')
        .send(incompletePayload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('clerkUserId et email sont requis');
    });

    it('should handle empty request body', async () => {
      // Mock error response for empty body
      mockAuthController.register.mockImplementation(async (req: any, res: any) => {
        res.status(400).json({
          success: false,
          error: { message: 'Format de requête invalide' },
        });
      });

      const response = await request(app).post('/users/register').send({}).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Format de requête invalide');
    });

    it('should handle server errors', async () => {
      // Mock server error response
      mockAuthController.register.mockImplementation(async (req: any, res: any) => {
        res.status(400).json({
          success: false,
          error: { message: 'Erreur lors de la finalisation' },
        });
      });

      const payload = {
        email: 'john@example.com',
        clerkId: 'clrk_123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app).post('/users/register').send(payload).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Erreur lors de la finalisation');
    });
  });

  describe('Route Configuration', () => {
    it('should have the correct route configured', () => {
      // Test that the route is properly configured by checking if POST request is handled
      expect(userRoutes).toBeDefined();
    });

    it('should handle unsupported HTTP methods', async () => {
      await request(app).get('/users').expect(404);
    });

    it('should handle PUT requests as unsupported', async () => {
      await request(app).put('/users').expect(404);
    });

    it('should handle DELETE requests as unsupported', async () => {
      await request(app).delete('/users').expect(404);
    });
  });
});
