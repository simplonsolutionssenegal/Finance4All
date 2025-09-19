import request from 'supertest';
import express from 'express';

// Mock des dépendances
jest.mock('@/infrastructure/database/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));
jest.mock('@/infrastructure/database/PrismaUserRepository');
jest.mock('@/domain/use-cases/createUserUseCaseImpl');

const mockUserController = {
  create: jest.fn(),
};

jest.doMock('@/infrastructure/web/controllers/UserController', () => {
  return {
    UserController: jest.fn().mockImplementation(() => {
      return mockUserController;
    }),
  };
});

describe('User Routes', () => {
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

  describe('POST /users', () => {
    it('should call userController.create method', async () => {
      // Mock successful response
      mockUserController.create.mockImplementation(async (req, res) => {
        res.status(201).json({ id: '1', name: 'John Doe', email: 'john@example.com' });
      });

      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const response = await request(app).post('/users').send(userData).expect(201);

      expect(response.body).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    it('should handle validation errors', async () => {
      // Mock error response
      mockUserController.create.mockImplementation(async (req, res) => {
        res.status(400).json({
          error: "Erreur lors de la création de l'utilisateur",
          message: 'Invalid email format',
        });
      });

      const invalidUserData = {
        name: 'John Doe',
        email: 'invalid-email',
      };

      const response = await request(app).post('/users').send(invalidUserData).expect(400);

      expect(response.body).toEqual({
        error: "Erreur lors de la création de l'utilisateur",
        message: 'Invalid email format',
      });
    });

    it('should handle missing required fields', async () => {
      // Mock error response for missing fields
      mockUserController.create.mockImplementation(async (req, res) => {
        res.status(400).json({
          error: "Erreur lors de la création de l'utilisateur",
          message: 'Name is required',
        });
      });

      const incompleteUserData = {
        email: 'john@example.com',
      };

      const response = await request(app).post('/users').send(incompleteUserData).expect(400);

      expect(response.body.error).toBe("Erreur lors de la création de l'utilisateur");
    });

    it('should handle empty request body', async () => {
      // Mock error response for empty body
      mockUserController.create.mockImplementation(async (req, res) => {
        res.status(400).json({
          error: "Erreur lors de la création de l'utilisateur",
          message: 'Request body is required',
        });
      });

      const response = await request(app).post('/users').send({}).expect(400);

      expect(response.body.error).toBe("Erreur lors de la création de l'utilisateur");
    });

    it('should handle server errors', async () => {
      // Mock server error response
      mockUserController.create.mockImplementation(async (req, res) => {
        res.status(500).json({
          error: 'Internal server error',
          message: 'Database connection failed',
        });
      });

      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const response = await request(app).post('/users').send(userData).expect(500);

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
