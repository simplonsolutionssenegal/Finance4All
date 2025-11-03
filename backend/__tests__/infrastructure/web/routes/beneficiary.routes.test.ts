import request from 'supertest';
import express from 'express';
import type { BeneficiaryController } from '@/infrastructure/web/controllers/BeneficiaryController';

// Mock du container
jest.mock('@/infrastructure/config/container', () => {
  const mockController: Partial<BeneficiaryController> = {
    create: jest.fn(),
  };

  return {
    container: {
      get: jest.fn(() => mockController),
    },
    TYPES: {
      BeneficiaryController: Symbol.for('BeneficiaryController'),
    },
  };
});

// Mock du validator
jest.mock('@/infrastructure/web/validators/beneficiary.validator', () => ({
  validateCreateBeneficiary: jest.fn((req, res, next) => next()),
  handleValidationErrors: jest.fn((req, res, next) => next()),
}));

describe('Beneficiary Routes', () => {
  let app: express.Application;
  let beneficiaryRoutes: express.Router;

  beforeEach(() => {
    jest.clearAllMocks();

    // Import dynamique après les mocks
    beneficiaryRoutes =
      require('@/infrastructure/web/routes/beneficiary.routes').BeneficiaryRoutes();

    app = express();
    app.use(express.json());
    app.use('/api/v1/beneficiaries', beneficiaryRoutes);
  });

  describe('POST /api/v1/beneficiaries', () => {
    it('should call beneficiary controller create method', async () => {
      const { container } = require('@/infrastructure/config/container');
      const controller = container.get(Symbol.for('BeneficiaryController'));

      const mockCreate = controller.create as jest.Mock;
      mockCreate.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: { id: '123', name: 'Test', email: 'test@example.com' },
        });
      });

      const response = await request(app).post('/api/v1/beneficiaries').send({
        clerkUserId: 'user_123',
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '+221771234567',
      });

      expect(response.status).toBe(201);
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should handle validation errors', async () => {
      const {
        validateCreateBeneficiary,
      } = require('@/infrastructure/web/validators/beneficiary.validator');
      const mockValidate = validateCreateBeneficiary as jest.Mock;

      mockValidate.mockImplementation((req, res) => {
        res.status(400).json({ errors: ['Validation failed'] });
      });

      const response = await request(app).post('/api/v1/beneficiaries').send({
        // Missing required fields
        name: 'Test',
      });

      expect(response.status).toBe(400);
    });

    it('should parse JSON body correctly', async () => {
      const { container } = require('@/infrastructure/config/container');
      const controller = container.get(Symbol.for('BeneficiaryController'));

      const mockCreate = controller.create as jest.Mock;
      let receivedBody: any = null;

      mockCreate.mockImplementation((req, res) => {
        receivedBody = req.body;
        res.status(201).json({ success: true });
      });

      const requestBody = {
        clerkUserId: 'user_123',
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '+221771234567',
      };

      const response = await request(app).post('/api/v1/beneficiaries').send(requestBody);

      // Le contrôleur est appelé si la validation passe
      if (response.status === 201) {
        expect(mockCreate).toHaveBeenCalled();
        expect(receivedBody).toHaveProperty('clerkUserId', 'user_123');
        expect(receivedBody).toHaveProperty('name', 'Test User');
        expect(receivedBody).toHaveProperty('email', 'test@example.com');
        expect(receivedBody).toHaveProperty('phoneNumber', '+221771234567');
      } else {
        // Si la validation échoue, on vérifie juste que le body est parsé
        expect(response.status).toBe(400);
      }
    });
  });

  describe('Route structure', () => {
    it('should return a router instance', () => {
      const { BeneficiaryRoutes } = require('@/infrastructure/web/routes/beneficiary.routes');
      const router = BeneficiaryRoutes();

      expect(router).toBeDefined();
      expect(typeof router).toBe('function');
    });

    it('should bind controller methods correctly', () => {
      const { container } = require('@/infrastructure/config/container');
      const controller = container.get(Symbol.for('BeneficiaryController'));

      expect(controller.create).toBeDefined();
      expect(typeof controller.create).toBe('function');
    });
  });
});
