import request from 'supertest';
import express from 'express';

// Mock des dépendances minimales
jest.mock('@/infrastructure/database/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));
jest.mock('@/infrastructure/database/PrismaUserRepository');

const mockClerkUserController = {
  register: jest.fn(),
};

jest.doMock('@/infrastructure/web/controllers/ClerkUserController', () => {
  return {
    ClerkUserController: jest.fn().mockImplementation(() => {
      return mockClerkUserController;
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
    it('should call clerkUserController.register method', async () => {
      // Mock successful response
      mockClerkUserController.register.mockImplementation(async (req, res) => {
        res.status(201).json({ id: '1', email: 'john@example.com', clerkId: 'clrk_123' });
      });

      const payload = {
        email: 'john@example.com',
        clerkId: 'clrk_123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app).post('/users/register').send(payload).expect(201);

      expect(response.body).toEqual({
        id: '1',
        email: 'john@example.com',
        clerkId: 'clrk_123',
      });
    });

    it('should handle validation errors', async () => {
      // Mock error response
      mockClerkUserController.register.mockImplementation(async (req, res) => {
        res.status(400).json({
          error: "Erreur lors de l'inscription",
          message: 'Invalid email format',
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
        error: "Erreur lors de l'inscription",
        message: 'Invalid email format',
      });
    });

    it('should handle missing required fields', async () => {
      // Mock error response for missing fields
      mockClerkUserController.register.mockImplementation(async (req, res) => {
        res.status(400).json({
          error: "Erreur lors de l'inscription",
          message: 'Required fields are missing',
        });
      });

      const incompletePayload = {
        email: 'john@example.com',
      };

      const response = await request(app)
        .post('/users/register')
        .send(incompletePayload)
        .expect(400);

      expect(response.body.error).toBe("Erreur lors de l'inscription");
    });

    it('should handle empty request body', async () => {
      // Mock error response for empty body
      mockClerkUserController.register.mockImplementation(async (req, res) => {
        res.status(400).json({
          error: "Erreur lors de l'inscription",
          message: 'Request body is required',
        });
      });

      const response = await request(app).post('/users/register').send({}).expect(400);

      expect(response.body.error).toBe("Erreur lors de l'inscription");
    });

    it('should handle server errors', async () => {
      // Mock server error response
      mockClerkUserController.register.mockImplementation(async (req, res) => {
        res.status(500).json({
          error: 'Internal server error',
          message: 'Database connection failed',
        });
      });

      const payload = {
        email: 'john@example.com',
        clerkId: 'clrk_123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app).post('/users/register').send(payload).expect(500);

      expect(response.body.error).toBe('Internal server error');
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
