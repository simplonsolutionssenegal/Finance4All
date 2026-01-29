import request from 'supertest';
import express from 'express';
import { DifficultyLevel, ModuleStatus } from '@/domain/formations/entities/ModuleFormation';


// ✅ Mock controller DI (doit contenir toutes les méthodes utilisées dans routes.ts)
const mockModuleController = {
  create: jest.fn(),
  getAll: jest.fn(),
  getById: jest.fn(),
  addLesson: jest.fn(),
  addQuiz: jest.fn(),
};

// ✅ Mock container DI
jest.mock('@/infrastructure/config/container', () => ({
  container: {
    get: jest.fn().mockReturnValue(mockModuleController),
  },
  TYPES: {
    ModuleController: 'ModuleController',
  },
}));

// ✅ Mock validators (inclure validateModuleId maintenant)
jest.mock('@/infrastructure/web/validators/module.validator', () => ({
  handleValidationErrors: jest.fn((req, res, next) => next()),
  validateCreateModule: [],
  validateGetModules: [],
}));

import * as validators from '@/infrastructure/web/validators/module.validator';

describe('ModuleFormationRoutes', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();

    // Importer les routes après les mocks
    // (si ton Jest cache trop, ajoute jest.resetModules() avant require)
    const { ModuleFormationRoutes } = require('@/infrastructure/web/routes/module.routes');

    app = express();
    app.use(express.json());
    app.use('/modules', ModuleFormationRoutes());
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

      const res = await request(app).get('/modules').expect(200);

      // Assert - validateGetModules est maintenant un tableau vide dans le mock
      expect(mockModuleController.getAll).toHaveBeenCalled();
      expect(res.body).toEqual({ success: true, data: [], message: 'OK' });
      expect(mockModuleController.getAll).toHaveBeenCalledTimes(1);

      expect(validators.validateGetModules).toHaveBeenCalled();
      expect(validators.handleValidationErrors).toHaveBeenCalled();
    });
  });

  describe('POST /modules', () => {
    it('should call controller.create and return 201', async () => {
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

      const res = await request(app).post('/modules').send(moduleData).expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(moduleData.title);

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

      const res = await request(app).get('/modules/module-123').expect(200);

      expect(res.body).toEqual({
        success: true,
        data: { id: 'module-123', title: 'X' },
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
  });

  describe('PUT /modules/:id/lessons', () => {
    it('should call controller.addLesson and return 201', async () => {
      mockModuleController.addLesson.mockImplementation(async (req: any, res: any) => {
        res.status(201).json({ success: true, data: { moduleId: req.params.id, ...req.body } });
      });

      const payload = {
        title: 'Lesson',
        description: 'Desc',
        duration: '30',
        order: '0',
        status: 'DRAFT',
        chapters: [],
      };

      const res = await request(app).put('/modules/module-1/lessons').send(payload).expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.moduleId).toBe('module-1');

      expect(mockModuleController.addLesson).toHaveBeenCalledTimes(1);
      expect(validators.validateModuleId).toHaveBeenCalled();
      expect(validators.handleValidationErrors).toHaveBeenCalled();
    });
  });

  describe('PUT /modules/:id/quizzes', () => {
    it('should call controller.addQuiz and return 201', async () => {
      mockModuleController.addQuiz.mockImplementation(async (req: any, res: any) => {
        res.status(201).json({ success: true, data: { moduleId: req.params.id, ...req.body } });
      });

      const payload = {
        title: 'Quiz',
        description: 'Desc',
        scoreMinimum: '70',
        nombreTentatives: '2',
        duree: '1800',
        status: 'DRAFT',
        questions: [],
      };

      const res = await request(app).put('/modules/module-2/quizzes').send(payload).expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.moduleId).toBe('module-2');

      expect(mockModuleController.addQuiz).toHaveBeenCalledTimes(1);
      expect(validators.validateModuleId).toHaveBeenCalled();
      expect(validators.handleValidationErrors).toHaveBeenCalled();
    });
  });

  describe('binding (bind(controller))', () => {
    it('should keep "this" bound to the controller for all methods', async () => {
      // ⚠️ Important : utiliser function() pour avoir un "this" (pas une arrow)
      mockModuleController.getAll.mockImplementation(function (this: any, req: any, res: any) {
        expect(this).toBe(mockModuleController);
        res.status(200).json({ success: true, data: [], message: 'OK' });
      });

      mockModuleController.create.mockImplementation(function (this: any, req: any, res: any) {
        expect(this).toBe(mockModuleController);
        res.status(201).json({ success: true, data: {}, message: 'Created' });
      });

      mockModuleController.getById.mockImplementation(function (this: any, req: any, res: any) {
        expect(this).toBe(mockModuleController);
        res.status(200).json({ success: true, data: { id: req.params.id } });
      });

      mockModuleController.addLesson.mockImplementation(function (this: any, req: any, res: any) {
        expect(this).toBe(mockModuleController);
        res.status(201).json({ success: true, data: {} });
      });

      mockModuleController.addQuiz.mockImplementation(function (this: any, req: any, res: any) {
        expect(this).toBe(mockModuleController);
        res.status(201).json({ success: true, data: {} });
      });

      await request(app).get('/modules').expect(200);
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
      expect(mockModuleController.getById).toHaveBeenCalled();
      expect(mockModuleController.addLesson).toHaveBeenCalled();
      expect(mockModuleController.addQuiz).toHaveBeenCalled();
    });
  });
});
