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

// ✅ Mock validators
jest.mock('@/infrastructure/web/validators/module.validator', () => ({
  handleValidationErrors: jest.fn((req, res, next) => next()),
  validateCreateModule: [],
  validateGetModules: [],
  validatePagination: [],
  validateModuleId: [],
}));

describe('ModuleFormationRoutes', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();

    const { ModuleFormationRoutes } = require('@/infrastructure/web/routes/module.routes');

    app = express();
    app.use(express.json());
    app.use('/modules', ModuleFormationRoutes());
  });

  describe('GET /modules', () => {
    it('devrait récupérer tous les modules avec succès', async () => {
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
      ];

      mockModuleController.getAll.mockImplementation(async (req, res) => {
        res.status(200).json({
          success: true,
          data: mockModules,
          message: 'Modules récupérés avec succès',
        });
      });

      const response = await request(app).get('/modules').expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockModules,
        message: 'Modules récupérés avec succès',
      });
      expect(mockModuleController.getAll).toHaveBeenCalledTimes(1);
    });

    it("devrait retourner un tableau vide si aucun module n'existe", async () => {
      mockModuleController.getAll.mockImplementation(async (req, res) => {
        res.status(200).json({
          success: true,
          data: [],
          message: 'Modules récupérés avec succès',
        });
      });

      const response = await request(app).get('/modules').expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
        message: 'Modules récupérés avec succès',
      });
      expect(mockModuleController.getAll).toHaveBeenCalledTimes(1);
    });

    it('devrait gérer les erreurs lors de la récupération des modules', async () => {
      mockModuleController.getAll.mockImplementation(async (req, res) => {
        res.status(500).json({
          success: false,
          error: 'Erreur interne du serveur',
          message: 'Une erreur est survenue lors de la récupération des modules',
        });
      });

      const response = await request(app).get('/modules').expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Erreur interne du serveur',
        message: 'Une erreur est survenue lors de la récupération des modules',
      });
      expect(mockModuleController.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /modules', () => {
    it('devrait créer un module avec succès', async () => {
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

    it('devrait gérer les erreurs de validation', async () => {
      mockModuleController.create.mockImplementation(async (req, res) => {
        res.status(400).json({
          success: false,
          error: 'Erreur de validation',
          message: 'Les données fournies ne sont pas valides',
        });
      });

      const response = await request(app).post('/modules').send({}).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Erreur de validation');
    });
  });

  describe('GET /modules/:id', () => {
    it('devrait récupérer un module par son ID', async () => {
      const mockModule = {
        id: 'module-123',
        title: 'Module Test',
        description: 'Description test',
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.PUBLISHED,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };

      mockModuleController.getById.mockImplementation(async (req, res) => {
        res.status(200).json({
          success: true,
          data: mockModule,
        });
      });

      const res = await request(app).get('/modules/module-123').expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('module-123');
      expect(mockModuleController.getById).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /modules/:id/lessons', () => {
    it('devrait ajouter une leçon au module', async () => {
      mockModuleController.addLesson.mockImplementation(async (req, res) => {
        res.status(201).json({
          success: true,
          data: { moduleId: req.params.id, ...req.body },
        });
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
    });
  });

  describe('PUT /modules/:id/quizzes', () => {
    it('devrait ajouter un quiz au module', async () => {
      mockModuleController.addQuiz.mockImplementation(async (req, res) => {
        res.status(201).json({
          success: true,
          data: { moduleId: req.params.id, ...req.body },
        });
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
    });
  });

  describe('Binding context', () => {
    it('devrait maintenir le contexte du controller pour toutes les méthodes', async () => {
      mockModuleController.getAll.mockImplementation(function (this: any, req: any, res: any) {
        expect(this).toBe(mockModuleController);
        res.status(200).json({ success: true, data: [], message: 'OK' });
      });

      await request(app).get('/modules').expect(200);

      expect(mockModuleController.getAll).toHaveBeenCalled();
    });
  });
});
