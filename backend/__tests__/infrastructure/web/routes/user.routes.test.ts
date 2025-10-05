import request from 'supertest';
import express from 'express';

// Mock des dépendances
jest.mock('backend/src/infrastructure/database/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));
jest.mock('backend/src/infrastructure/database/PrismaUserRepository');
jest.mock('backend/src/domain/use-cases/createUserUseCaseImpl');

const mockUserController = {
  create: jest.fn(),
  remove: jest.fn(),
  updateRole: jest.fn(),
};

jest.doMock('backend/src/infrastructure/web/controllers/UserController', () => {
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
    userRoutes = require('backend/src/infrastructure/web/routes/user.routes').default;

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

  describe('DELETE /users/:userId', () => {
    it('should call userController.remove method', async () => {
      mockUserController.remove.mockImplementation(async (req, res) => {
        res.status(200).json({ success: true, message: 'User removed successfully' });
      });

      const response = await request(app)
        .delete('/users/user_123')
        .send({ organizationId: 'org_123' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'User removed successfully',
      });
      expect(mockUserController.remove).toHaveBeenCalled();
    });

    it('should handle missing userId parameter', async () => {
      mockUserController.remove.mockImplementation(async (req, res) => {
        res.status(400).json({
          error: 'Paramètres manquants',
          message: 'userId et organizationId sont requis',
        });
      });

      await request(app).delete('/users/').send({ organizationId: 'org_123' }).expect(404); // Route not found for empty userId

      expect(mockUserController.remove).not.toHaveBeenCalled();
    });

    it('should handle missing organizationId in body', async () => {
      mockUserController.remove.mockImplementation(async (req, res) => {
        res.status(400).json({
          error: 'Paramètres manquants',
          message: 'userId et organizationId sont requis',
        });
      });

      const response = await request(app).delete('/users/user_123').send({}).expect(400);

      expect(response.body).toEqual({
        error: 'Paramètres manquants',
        message: 'userId et organizationId sont requis',
      });
      expect(mockUserController.remove).toHaveBeenCalled();
    });

    it('should handle removal failure', async () => {
      mockUserController.remove.mockImplementation(async (req, res) => {
        res.status(400).json({
          success: false,
          message: 'Failed to remove user from organization',
        });
      });

      const response = await request(app)
        .delete('/users/user_123')
        .send({ organizationId: 'org_123' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Failed to remove user from organization',
      });
      expect(mockUserController.remove).toHaveBeenCalled();
    });

    it('should handle server errors during removal', async () => {
      mockUserController.remove.mockImplementation(async (req, res) => {
        res.status(500).json({
          success: false,
          message: "Erreur serveur lors de la suppression de l'utilisateur",
          error: 'Internal server error',
        });
      });

      const response = await request(app)
        .delete('/users/user_123')
        .send({ organizationId: 'org_123' })
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: "Erreur serveur lors de la suppression de l'utilisateur",
        error: 'Internal server error',
      });
      expect(mockUserController.remove).toHaveBeenCalled();
    });
  });

  describe('PATCH /users/:userId', () => {
    it('should call userController.updateRole method', async () => {
      mockUserController.updateRole.mockImplementation(async (req, res) => {
        res.status(200).json({
          success: true,
          message: "Rôle de l'utilisateur modifié avec succès vers admin",
        });
      });

      const response = await request(app)
        .patch('/users/user_123')
        .send({ organizationId: 'org_123', role: 'admin' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: "Rôle de l'utilisateur modifié avec succès vers admin",
      });
      expect(mockUserController.updateRole).toHaveBeenCalled();
    });

    it('should handle missing userId parameter', async () => {
      mockUserController.updateRole.mockImplementation(async (req, res) => {
        res.status(400).json({
          error: 'Paramètres manquants',
          message: 'userId, organizationId et role sont requis',
        });
      });

      await request(app)
        .patch('/users/')
        .send({ organizationId: 'org_123', role: 'admin' })
        .expect(404); // Route not found for empty userId

      expect(mockUserController.updateRole).not.toHaveBeenCalled();
    });

    it('should handle missing organizationId in body', async () => {
      mockUserController.updateRole.mockImplementation(async (req, res) => {
        res.status(400).json({
          error: 'Paramètres manquants',
          message: 'userId, organizationId et role sont requis',
        });
      });

      const response = await request(app)
        .patch('/users/user_123')
        .send({ role: 'admin' })
        .expect(400);

      expect(response.body).toEqual({
        error: 'Paramètres manquants',
        message: 'userId, organizationId et role sont requis',
      });
      expect(mockUserController.updateRole).toHaveBeenCalled();
    });

    it('should handle missing role in body', async () => {
      mockUserController.updateRole.mockImplementation(async (req, res) => {
        res.status(400).json({
          error: 'Paramètres manquants',
          message: 'userId, organizationId et role sont requis',
        });
      });

      const response = await request(app)
        .patch('/users/user_123')
        .send({ organizationId: 'org_123' })
        .expect(400);

      expect(response.body).toEqual({
        error: 'Paramètres manquants',
        message: 'userId, organizationId et role sont requis',
      });
      expect(mockUserController.updateRole).toHaveBeenCalled();
    });

    it('should handle role update failure', async () => {
      mockUserController.updateRole.mockImplementation(async (req, res) => {
        res.status(400).json({
          success: false,
          message: 'Failed to update user role',
        });
      });

      const response = await request(app)
        .patch('/users/user_123')
        .send({ organizationId: 'org_123', role: 'admin' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Failed to update user role',
      });
      expect(mockUserController.updateRole).toHaveBeenCalled();
    });

    it('should handle server errors during role update', async () => {
      mockUserController.updateRole.mockImplementation(async (req, res) => {
        res.status(500).json({
          success: false,
          message: "Erreur serveur lors de la modification du rôle de l'utilisateur",
          error: 'Internal server error',
        });
      });

      const response = await request(app)
        .patch('/users/user_123')
        .send({ organizationId: 'org_123', role: 'admin' })
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: "Erreur serveur lors de la modification du rôle de l'utilisateur",
        error: 'Internal server error',
      });
      expect(mockUserController.updateRole).toHaveBeenCalled();
    });

    it('should handle different role values', async () => {
      const roles = ['member', 'viewer', 'editor', 'manager'];

      for (const role of roles) {
        mockUserController.updateRole.mockImplementation(async (req, res) => {
          res.status(200).json({
            success: true,
            message: `Rôle de l'utilisateur modifié avec succès vers ${role}`,
          });
        });

        const response = await request(app)
          .patch('/users/user_123')
          .send({ organizationId: 'org_123', role })
          .expect(200);

        expect(response.body).toEqual({
          success: true,
          message: `Rôle de l'utilisateur modifié avec succès vers ${role}`,
        });
        expect(mockUserController.updateRole).toHaveBeenCalled();
      }
    });
  });
});
