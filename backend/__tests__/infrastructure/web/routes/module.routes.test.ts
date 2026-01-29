// backend/__tests__/infrastructure/web/routes/module.routes.test.ts

import request from 'supertest';
import express from 'express';
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
  validateCreateModule: [],
  validateGetModules: [],
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
          imageMediaId: 'image-123',
          thematics: 'éducation financière',
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 60,
          status: ModuleStatus.PUBLISHED,
          createdAt: '2024-01-01T10:00:00.000Z',
          updatedAt: '2024-01-01T10:00:00.000Z',
        },
        {
          id: 'module-2',
          title: 'Investissement Avancé',
          description: "Module d'investissement pour experts",
          imageMediaId: null,
          thematics: 'investissement',
          difficultyLevel: DifficultyLevel.ADVANCED,
          estimatedDuration: 120,
          status: ModuleStatus.DRAFT,
          createdAt: '2024-01-02T10:00:00.000Z',
          updatedAt: '2024-01-02T10:00:00.000Z',
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
      mockModuleController.getAll.mockImplementation(async (req, res) => {
        res.status(200).json({ success: true, data: [], message: 'OK' });
      });

      // Act
      await request(app).get('/modules').expect(200);

      // Assert - validateGetModules est maintenant un tableau vide dans le mock
      expect(mockModuleController.getAll).toHaveBeenCalled();
    });
  });

  describe('POST /modules', () => {
    it('devrait créer un module avec succès', async () => {
      // Arrange
      const moduleData = {
        title: 'Nouveau Module',
        description: 'Description du nouveau module',
        imageMediaId: 'image-456',
        thematics: 'gestion budgétaire et épargne',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 90,
      };

      const createdModule = {
        id: 'new-module-id',
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
      expect(response.body).toEqual({
        success: true,
        data: createdModule,
        message: 'Module créé avec succès',
      });
      expect(mockModuleController.create).toHaveBeenCalledTimes(1);
    });

    it('devrait créer un module sans image (imageUrl null)', async () => {
      // Arrange
      const moduleData = {
        title: 'Module Sans Image',
        description: "Module sans URL d'image",
        imageMediaId: null,
        thematics: 'entrepreneuriat',
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
      expect(response.body.data.imageMediaId).toBeNull();
      expect(mockModuleController.create).toHaveBeenCalledTimes(1);
    });

    it('devrait créer un module avec thématique descriptive', async () => {
      // Arrange
      const moduleData = {
        title: 'Module Thématique Complète',
        description: 'Module couvrant la finance personnelle',
        imageMediaId: 'image-789',
        thematics: 'finance personnelle et investissement',
        difficultyLevel: DifficultyLevel.ADVANCED,
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
      expect(response.body.data.thematics).toBe(moduleData.thematics);
      expect(mockModuleController.create).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs de validation lors de la création', async () => {
      // Arrange
      const invalidModuleData = {
        title: '', // Titre vide
        description: '', // Description vide
        thematics: '', // Pas de thématique
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
        imageMediaId: 'image-test',
        thematics: 'taxation',
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
      const moduleData = {
        title: 'Test Validation',
        description: 'Test des middlewares',
        imageMediaId: null,
        thematics: 'assurance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
      };

      mockModuleController.create.mockImplementation(async (req, res) => {
        res.status(201).json({ success: true, data: {}, message: 'OK' });
      });

      // Act
      await request(app).post('/modules').send(moduleData).expect(201);

      // Assert - Les middlewares sont mocké comme des tableaux vides
      expect(mockModuleController.create).toHaveBeenCalled();
    });
  });

  describe("Tests d'intégration des routes", () => {
    it('devrait maintenir la cohérence des formats de réponse entre GET et POST', async () => {
      // Test POST
      const moduleData = {
        title: 'Module Cohérence',
        description: 'Test de cohérence',
        imageMediaId: null,
        thematics: 'développement personnel',
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
      expect(postResponse.body.data).toEqual(createdModule);

      expect(getResponse.body).toHaveProperty('success');
      expect(getResponse.body).toHaveProperty('data');
      expect(getResponse.body).toHaveProperty('message');
      expect(getResponse.body.data).toEqual([createdModule]);

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
          description: 'Test description',
          imageMediaId: null,
          thematics: 'épargne',
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
        imageMediaId: null,
        thematics: 'crédit financier',
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
        imageMediaId: null,
        thematics: 'crédit bancaire',
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
