// __tests__/infrastructure/web/routes/service.routes.test.ts
import request from 'supertest';
import express from 'express';

// Mock des dépendances
jest.mock('@/infrastructure/config/ServiceRepository');
jest.mock('@/domain/use-cases/getServiceUseCaseImpl');
jest.mock('@/domain/use-cases/getServiceByIdUseCaseImpl');

const mockServiceController = {
  getServices: jest.fn(),
  getServiceById: jest.fn(),
};

jest.doMock('@/infrastructure/web/controllers/ServiceController', () => {
  return {
    ServiceController: jest.fn().mockImplementation(() => {
      return mockServiceController;
    }),
  };
});

describe('Service Routes', () => {
  let app: express.Application;
  let serviceRoutes: express.Router;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Dynamically import routes after mocks are set up
    serviceRoutes = require('@/infrastructure/web/routes/service.routes').default;

    // Setup Express app with routes
    app = express();
    app.use(express.json());
    app.use('/api/services', serviceRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/services', () => {
    it('should return list of services successfully', async () => {
      // Mock successful response
      mockServiceController.getServices.mockImplementation(async (req, res) => {
        res.status(200).json({
          status: 'success',
          data: [
            {
              id: 'service-1',
              name: 'Service de Test 1',
              type: 'crédit',
            },
            {
              id: 'service-2',
              name: 'Service de Test 2',
              type: 'épargne',
            },
          ],
        });
      });

      const response = await request(app).get('/api/services').expect(200);

      expect(mockServiceController.getServices).toHaveBeenCalledTimes(1);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveLength(2);
    });

    it('should pass query parameters to controller', async () => {
      mockServiceController.getServices.mockImplementation(async (req, res) => {
        res.status(200).json({
          status: 'success',
          data: [],
        });
      });

      await request(app)
        .get('/api/services')
        .query({
          type: 'crédit',
          name: 'Service de Crédit',
          institutionId: 'institution-1',
        })
        .expect(200);

      expect(mockServiceController.getServices).toHaveBeenCalledTimes(1);

      // Vérifier que les paramètres de requête sont passés au contrôleur
      const call = mockServiceController.getServices.mock.calls[0];
      const req = call[0];
      expect(req.query).toEqual({
        type: 'crédit',
        name: 'Service de Crédit',
        institutionId: 'institution-1',
      });
    });

    it('should handle controller errors gracefully', async () => {
      mockServiceController.getServices.mockImplementation(async (req, res) => {
        res.status(500).json({
          status: 'error',
          message: 'Erreur interne du serveur',
        });
      });

      const response = await request(app).get('/api/services').expect(500);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Erreur interne du serveur',
      });
    });
  });

  describe('GET /api/services/:id', () => {
    it('should return service by id successfully', async () => {
      const serviceId = 'service-123';

      mockServiceController.getServiceById.mockImplementation(async (req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            id: serviceId,
            name: 'Service de Test',
            type: 'crédit',
          },
        });
      });

      const response = await request(app).get(`/api/services/${serviceId}`).expect(200);

      expect(mockServiceController.getServiceById).toHaveBeenCalledTimes(1);

      // Vérifier que l'ID est passé correctement
      const call = mockServiceController.getServiceById.mock.calls[0];
      const req = call[0];
      expect(req.params.id).toBe(serviceId);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(serviceId);
    });

    it('should handle service not found', async () => {
      mockServiceController.getServiceById.mockImplementation(async (req, res) => {
        res.status(404).json({
          status: 'error',
          message: 'Service non trouvé',
        });
      });

      const response = await request(app).get('/api/services/non-existent-id').expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Service non trouvé',
      });
    });

    it('should handle controller errors gracefully', async () => {
      mockServiceController.getServiceById.mockImplementation(async (req, res) => {
        res.status(500).json({
          status: 'error',
          message: 'Erreur interne du serveur',
        });
      });

      const response = await request(app).get('/api/services/service-123').expect(500);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Erreur interne du serveur',
      });
    });
  });

  describe('HTTP Methods', () => {
    it('should only accept GET method for / route', async () => {
      await request(app).post('/api/services').expect(404);

      await request(app).put('/api/services').expect(404);

      await request(app).delete('/api/services').expect(404);
    });

    it('should only accept GET method for /:id route', async () => {
      await request(app).post('/api/services/123').expect(404);

      await request(app).put('/api/services/123').expect(404);

      await request(app).delete('/api/services/123').expect(404);
    });
  });

  describe('Route Parameters', () => {
    it('should handle special characters in service id', async () => {
      const specialId = 'service-123-abc_def';

      mockServiceController.getServiceById.mockImplementation(async (req, res) => {
        res.status(200).json({
          status: 'success',
          data: { id: req.params.id, name: 'Service Special' },
        });
      });

      await request(app).get(`/api/services/${specialId}`).expect(200);

      expect(mockServiceController.getServiceById).toHaveBeenCalledTimes(1);

      // Vérifier que l'ID est passé correctement
      const call = mockServiceController.getServiceById.mock.calls[0];
      const req = call[0];
      expect(req.params.id).toBe(specialId);
    });

    it('should handle URL encoded characters in service id', async () => {
      const encodedId = 'service%20with%20spaces';
      const decodedId = 'service with spaces';

      mockServiceController.getServiceById.mockImplementation(async (req, res) => {
        res.status(200).json({
          status: 'success',
          data: { id: req.params.id, name: 'Service with Spaces' },
        });
      });

      await request(app).get(`/api/services/${encodedId}`).expect(200);

      expect(mockServiceController.getServiceById).toHaveBeenCalledTimes(1);

      // Vérifier que l'ID décodé est passé correctement
      const call = mockServiceController.getServiceById.mock.calls[0];
      const req = call[0];
      expect(req.params.id).toBe(decodedId);
    });
  });
});
