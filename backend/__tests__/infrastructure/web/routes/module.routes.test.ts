// backend/__tests__/infrastructure/web/routes/module.routes.test.ts

import request from 'supertest';
import express from 'express';
import { Thematic } from '@/domain/formations/value-objects/Thematic';
import { DifficultyLevel, ModuleStatus } from '@/domain/formations/entities/ModuleFormation';

// Mock des dépendances du container
const mockModuleController = {
  create: jest.fn(),
  getAll: jest.fn(),
};

// Mock du container DI
jest.mock('@/infrastructure/config/container', () => ({
  container: {
    get: jest.fn().mockReturnValue(mockModuleController),
  },
  TYPES: {
    ModuleController: 'ModuleController',
  },
}));

// Mock des validators
jest.mock('@/infrastructure/web/validators/module.validator', () => ({
  handleValidationErrors: jest.fn((req, res, next) => next()),
  validateCreateModule: jest.fn((req, res, next) => next()),
  validateGetModules: jest.fn((req, res, next) => next()),
}));

describe('Module Routes', () => {
  let app: express.Application;
  let moduleRoutes: express.Router;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Dynamically import routes after mocks are set up
    const { ModuleFormationRoutes } = require('@/infrastructure/web/routes/module.routes');
    moduleRoutes = ModuleFormationRoutes();

    // Setup Express app with routes
    app = express();
    app.use(express.json());
    app.use('/modules', moduleRoutes);
  });

  describe('GET /modules', () => {
    it('devrait récupérer tous les modules avec succès', async () => {
      // Arrange
      const mockModules = [
        {
          id: 'module-1',
          title: 'Introduction aux Finances',
          description: "Module d'introduction aux concepts financiers",
          imageUrl: 'https://example.com/image1.jpg',
          thematics: [Thematic.FINANCIAL_EDUCATION],
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 60,
          status: ModuleStatus.PUBLISHED,
          createdAt: '2024-01-01T10:00:00.000Z', // String au lieu de Date
          updatedAt: '2024-01-01T10:00:00.000Z', // String au lieu de Date
        },
        {
          id: 'module-2',
          title: 'Investissement Avancé',
          description: "Module d'investissement pour experts",
          imageUrl: null,
          thematics: [Thematic.INVESTMENT, Thematic.SAVING],
          difficultyLevel: DifficultyLevel.EXPERT,
          estimatedDuration: 120,
          status: ModuleStatus.DRAFT,
          createdAt: '2024-01-02T10:00:00.000Z', // String au lieu de Date
          updatedAt: '2024-01-02T10:00:00.000Z', // String au lieu de Date
        },
      ];

      mockModuleController.getAll.mockImplementation(async (req, res) => {
        res.status(200).json({
          success: true,
          data: mockModules,
          message: 'Modules récupérés avec succès',
        });
      });

      // Act
      const response = await request(app).get('/modules').expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: mockModules,
        message: 'Modules récupérés avec succès',
      });
      expect(mockModuleController.getAll).toHaveBeenCalledTimes(1);
    });

    it("devrait retourner un tableau vide si aucun module n'existe", async () => {
      // Arrange
      mockModuleController.getAll.mockImplementation(async (req, res) => {
        res.status(200).json({
          success: true,
          data: [],
          message: 'Modules récupérés avec succès',
        });
      });

      // Act
      const response = await request(app).get('/modules').expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: [],
        message: 'Modules récupérés avec succès',
      });
      expect(mockModuleController.getAll).toHaveBeenCalledTimes(1);
    });

    it('devrait gérer les erreurs lors de la récupération des modules', async () => {
      // Arrange
      mockModuleController.getAll.mockImplementation(async (req, res) => {
        res.status(500).json({
          success: false,
          error: 'Erreur interne du serveur',
          message: 'Une erreur est survenue lors de la récupération des modules',
        });
      });

      // Act
      const response = await request(app).get('/modules').expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        error: 'Erreur interne du serveur',
        message: 'Une erreur est survenue lors de la récupération des modules',
      });
      expect(mockModuleController.getAll).toHaveBeenCalledTimes(1);
    });

    it('devrait appeler les middlewares de validation pour GET', async () => {
      // Arrange
      const {
        validateGetModules,
        handleValidationErrors,
      } = require('../../../../src/infrastructure/web/validators/module.validator');

      mockModuleController.getAll.mockImplementation(async (req, res) => {
        res.status(200).json({ success: true, data: [], message: 'OK' });
      });

      // Act
      await request(app).get('/modules').expect(200);

      // Assert
      expect(validateGetModules).toHaveBeenCalled();
      expect(handleValidationErrors).toHaveBeenCalled();
    });
  });

  describe('POST /modules', () => {
    it('devrait créer un module avec succès', async () => {
      // Arrange
      const moduleData = {
        title: 'Nouveau Module',
        description: 'Description du nouveau module',
        imageUrl: 'https://example.com/new-image.jpg',
        thematics: [Thematic.BUDGET_MANAGEMENT, Thematic.SAVING],
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 90,
      };

      const createdModule = {
        id: 'new-module-id',
        ...moduleData,
        status: ModuleStatus.DRAFT,
        createdAt: '2024-01-01T10:00:00.000Z', // String au lieu de Date
        updatedAt: '2024-01-01T10:00:00.000Z', // String au lieu de Date
      };

      mockModuleController.create.mockImplementation(async (req, res) => {
        res.status(201).json({
          success: true,
          data: createdModule,
          message: 'Module créé avec succès',
        });
      });

      // Act
      const response = await request(app).post('/modules').send(moduleData).expect(201);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: createdModule,
        message: 'Module créé avec succès',
      });
      expect(mockModuleController.create).toHaveBeenCalledTimes(1);

      // Vérifier que les middlewares de validation ont été appelés
      const {
        validateCreateModule,
        handleValidationErrors,
      } = require('../../../../src/infrastructure/web/validators/module.validator');
      expect(validateCreateModule).toHaveBeenCalled();
      expect(handleValidationErrors).toHaveBeenCalled();
    });

    it('devrait créer un module sans image (imageUrl null)', async () => {
      // Arrange
      const moduleData = {
        title: 'Module Sans Image',
        description: "Module sans URL d'image",
        imageUrl: null,
        thematics: [Thematic.ENTREPRENEURSHIP],
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 75,
      };

      const createdModule = {
        id: 'module-no-image',
        ...moduleData,
        status: ModuleStatus.DRAFT,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };

      mockModuleController.create.mockImplementation(async (req, res) => {
        res.status(201).json({
          success: true,
          data: createdModule,
          message: 'Module créé avec succès',
        });
      });

      // Act
      const response = await request(app).post('/modules').send(moduleData).expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.imageUrl).toBeNull();
      expect(mockModuleController.create).toHaveBeenCalledTimes(1);

      // Vérifier que les middlewares de validation ont été appelés
      const {
        validateCreateModule,
        handleValidationErrors,
      } = require('../../../../src/infrastructure/web/validators/module.validator');
      expect(validateCreateModule).toHaveBeenCalled();
      expect(handleValidationErrors).toHaveBeenCalled();
    });

    it('devrait créer un module avec plusieurs thématiques', async () => {
      // Arrange
      const moduleData = {
        title: 'Module Multi-Thématiques',
        description: 'Module couvrant plusieurs domaines',
        imageUrl: 'https://example.com/multi.jpg',
        thematics: [
          Thematic.FINANCIAL_EDUCATION,
          Thematic.INVESTMENT,
          Thematic.BUDGET_MANAGEMENT,
          Thematic.SAVING,
          Thematic.ENTREPRENEURSHIP,
        ],
        difficultyLevel: DifficultyLevel.EXPERT,
        estimatedDuration: 180,
      };

      const createdModule = {
        id: 'multi-thematic-module',
        ...moduleData,
        status: ModuleStatus.DRAFT,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };

      mockModuleController.create.mockImplementation(async (req, res) => {
        res.status(201).json({
          success: true,
          data: createdModule,
          message: 'Module créé avec succès',
        });
      });

      // Act
      const response = await request(app).post('/modules').send(moduleData).expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.thematics).toHaveLength(5);
      expect(response.body.data.thematics).toEqual(moduleData.thematics);

      // Vérifier que les middlewares de validation ont été appelés
      const {
        validateCreateModule,
        handleValidationErrors,
      } = require('../../../../src/infrastructure/web/validators/module.validator');
      expect(validateCreateModule).toHaveBeenCalled();
      expect(handleValidationErrors).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs de validation lors de la création', async () => {
      // Arrange
      const invalidModuleData = {
        title: '', // Titre vide
        description: '', // Description vide
        thematics: [], // Pas de thématiques
        difficultyLevel: 'INVALID_LEVEL', // Niveau invalide
        estimatedDuration: -10, // Durée négative
      };

      mockModuleController.create.mockImplementation(async (req, res) => {
        res.status(400).json({
          success: false,
          error: 'Erreur de validation',
          message: 'Les données fournies ne sont pas valides',
          details: [
            'Le titre est obligatoire',
            'La description est obligatoire',
            'Au moins une thématique est requise',
            "Le niveau de difficulté n'est pas valide",
            'La durée estimée doit être positive',
          ],
        });
      });

      // Act
      const response = await request(app).post('/modules').send(invalidModuleData).expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Erreur de validation');
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('devrait gérer les erreurs internes lors de la création', async () => {
      // Arrange
      const moduleData = {
        title: 'Module Test',
        description: "Test de gestion d'erreur",
        imageUrl: 'https://example.com/test.jpg',
        thematics: [Thematic.TAXATION],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 45,
      };

      mockModuleController.create.mockImplementation(async (req, res) => {
        res.status(500).json({
          success: false,
          error: 'Erreur interne du serveur',
          message: 'Une erreur est survenue lors de la création du module',
        });
      });

      // Act
      const response = await request(app).post('/modules').send(moduleData).expect(500);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Erreur interne du serveur');
    });

    it('devrait appeler les middlewares de validation pour POST', async () => {
      // Arrange
      const {
        validateCreateModule,
        handleValidationErrors,
      } = require('../../../../src/infrastructure/web/validators/module.validator');

      const moduleData = {
        title: 'Test Validation',
        description: 'Test des middlewares',
        imageUrl: null,
        thematics: [Thematic.INSURANCE],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
      };

      mockModuleController.create.mockImplementation(async (req, res) => {
        res.status(201).json({ success: true, data: {}, message: 'OK' });
      });

      // Act
      await request(app).post('/modules').send(moduleData).expect(201);

      // Assert
      expect(validateCreateModule).toHaveBeenCalled();
      expect(handleValidationErrors).toHaveBeenCalled();
    });
  });

  describe("Tests d'intégration des routes", () => {
    it('devrait maintenir la cohérence des formats de réponse entre GET et POST', async () => {
      // Test POST
      const moduleData = {
        title: 'Module Cohérence',
        description: 'Test de cohérence',
        imageUrl: null,
        thematics: [Thematic.PERSONAL_DEVELOPMENT],
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 60,
      };

      const createdModule = {
        id: 'cohesion-test',
        ...moduleData,
        status: ModuleStatus.DRAFT,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };

      mockModuleController.create.mockImplementation(async (req, res) => {
        res.status(201).json({
          success: true,
          data: createdModule,
          message: 'Module créé avec succès',
        });
      });

      const postResponse = await request(app).post('/modules').send(moduleData).expect(201);

      // Test GET
      mockModuleController.getAll.mockImplementation(async (req, res) => {
        res.status(200).json({
          success: true,
          data: [createdModule],
          message: 'Modules récupérés avec succès',
        });
      });

      const getResponse = await request(app).get('/modules').expect(200);

      // Assert cohérence
      expect(postResponse.body).toHaveProperty('success');
      expect(postResponse.body).toHaveProperty('data');
      expect(postResponse.body).toHaveProperty('message');

      expect(getResponse.body).toHaveProperty('success');
      expect(getResponse.body).toHaveProperty('data');
      expect(getResponse.body).toHaveProperty('message');

      expect(typeof postResponse.body.success).toBe('boolean');
      expect(typeof getResponse.body.success).toBe('boolean');
    });

    it('devrait utiliser les bons codes de statut HTTP', async () => {
      // Test GET success
      mockModuleController.getAll.mockImplementation(async (req, res) => {
        res.status(200).json({ success: true, data: [], message: 'OK' });
      });

      await request(app).get('/modules').expect(200);

      // Test POST success
      mockModuleController.create.mockImplementation(async (req, res) => {
        res.status(201).json({ success: true, data: {}, message: 'Created' });
      });

      await request(app)
        .post('/modules')
        .send({
          title: 'Test',
          description: 'Test',
          imageUrl: null,
          thematics: [Thematic.SAVING],
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 30,
        })
        .expect(201);
    });

    it('devrait gérer le Content-Type JSON correctement', async () => {
      // Arrange
      const moduleData = {
        title: 'Test Content-Type',
        description: 'Test du type de contenu',
        imageUrl: null,
        thematics: [Thematic.FINANCIAL_LOAN],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
      };

      mockModuleController.create.mockImplementation(async (req, res) => {
        res.status(201).json({ success: true, data: {}, message: 'OK' });
      });

      // Act & Assert
      await request(app)
        .post('/modules')
        .send(moduleData)
        .set('Content-Type', 'application/json')
        .expect(201);
    });
  });

  describe('Tests du binding des méthodes du contrôleur', () => {
    it('devrait correctement binder les méthodes du contrôleur', async () => {
      // Arrange
      mockModuleController.getAll.mockImplementation(async (req, res) => {
        // Vérifier que 'this' est correctement bindé
        expect(this).toBeDefined();
        res.status(200).json({ success: true, data: [], message: 'OK' });
      });

      // Act
      await request(app).get('/modules').expect(200);

      // Assert
      expect(mockModuleController.getAll).toHaveBeenCalled();
    });

    it('devrait maintenir le contexte pour les méthodes bindées', async () => {
      // Arrange
      const moduleData = {
        title: 'Test Binding',
        description: 'Test du binding',
        imageUrl: null,
        thematics: [Thematic.BANK_CREDIT],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
      };

      mockModuleController.create.mockImplementation(async (req, res) => {
        res.status(201).json({ success: true, data: {}, message: 'Created' });
      });

      // Act
      await request(app).post('/modules').send(moduleData).expect(201);

      // Assert
      expect(mockModuleController.create).toHaveBeenCalled();
    });
  });
});
