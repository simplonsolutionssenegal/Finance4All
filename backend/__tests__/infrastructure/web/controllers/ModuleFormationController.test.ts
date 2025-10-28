// backend/__tests__/infrastructure/web/controllers/ModuleFormationController.test.ts

import { ModuleController } from '@/infrastructure/web/controllers/ModuleFormationController';
import type { CreateModuleUseCase } from '@/domain/formations/ports/in/CreateModuleUseCase';
import type { GetModulesUseCase } from '@/domain/formations/ports/in/GetModulesUseCase';
import type { Request, Response, NextFunction } from 'express';
import { Thematic } from '@/domain/formations/value-objects/Thematic';
import { DifficultyLevel, ModuleStatus } from '@/domain/formations/entities/ModuleFormation';

describe('ModuleController', () => {
  let controller: ModuleController;
  let mockCreateModuleUseCase: jest.Mocked<CreateModuleUseCase>;
  let mockGetModulesUseCase: jest.Mocked<GetModulesUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockCreateModuleUseCase = {
      execute: jest.fn(),
    } as any;

    mockGetModulesUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new ModuleController(mockCreateModuleUseCase, mockGetModulesUseCase);

    mockRequest = {
      body: {},
      query: {},
      params: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('devrait créer un module avec succès', async () => {
      // Arrange
      const requestBody = {
        title: 'Introduction aux Finances',
        description: "Module d'introduction aux concepts financiers de base",
        imageUrl: 'https://example.com/image.jpg',
        thematics: [Thematic.FINANCIAL_EDUCATION, Thematic.BUDGET_MANAGEMENT],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
      };

      const expectedResult = {
        id: 'module-123',
        title: 'Introduction aux Finances',
        description: "Module d'introduction aux concepts financiers de base",
        imageUrl: 'https://example.com/image.jpg',
        thematics: [Thematic.FINANCIAL_EDUCATION, Thematic.BUDGET_MANAGEMENT],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      };

      mockRequest.body = requestBody;
      mockCreateModuleUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockCreateModuleUseCase.execute).toHaveBeenCalledWith(requestBody);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expectedResult,
        message: 'Module créé avec succès',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('devrait créer un module sans image (imageUrl null)', async () => {
      // Arrange
      const requestBody = {
        title: 'Module sans image',
        description: 'Description du module',
        imageUrl: null,
        thematics: [Thematic.INVESTMENT],
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 90,
      };

      const expectedResult = {
        id: 'module-456',
        title: 'Module sans image',
        description: 'Description du module',
        imageUrl: null,
        thematics: [Thematic.INVESTMENT],
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 90,
        status: ModuleStatus.DRAFT,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      };

      mockRequest.body = requestBody;
      mockCreateModuleUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockCreateModuleUseCase.execute).toHaveBeenCalledWith(requestBody);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expectedResult,
        message: 'Module créé avec succès',
      });
    });

    it('devrait créer un module avec plusieurs thématiques', async () => {
      // Arrange
      const requestBody = {
        title: 'Module Avancé',
        description: 'Module complet avec plusieurs thématiques',
        imageUrl: 'https://example.com/advanced.jpg',
        thematics: [
          Thematic.FINANCIAL_EDUCATION,
          Thematic.INVESTMENT,
          Thematic.SAVING,
          Thematic.BUDGET_MANAGEMENT,
          Thematic.ENTREPRENEURSHIP,
        ],
        difficultyLevel: DifficultyLevel.EXPERT,
        estimatedDuration: 180,
      };

      const expectedResult = {
        id: 'module-789',
        ...requestBody,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = requestBody;
      mockCreateModuleUseCase.execute.mockResolvedValue(expectedResult);

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockCreateModuleUseCase.execute).toHaveBeenCalledWith(requestBody);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expectedResult,
        message: 'Module créé avec succès',
      });
    });

    it('devrait gérer les erreurs du use case lors de la création', async () => {
      // Arrange
      const requestBody = {
        title: 'Module Test',
        description: 'Description',
        imageUrl: 'https://test.com/image.jpg',
        thematics: [Thematic.SAVING],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
      };

      const error = new Error('Erreur de validation');
      mockRequest.body = requestBody;
      mockCreateModuleUseCase.execute.mockRejectedValue(error);

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockCreateModuleUseCase.execute).toHaveBeenCalledWith(requestBody);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('devrait passer le body de la requête exactement au use case', async () => {
      // Arrange
      const requestBody = {
        title: 'Test Exact',
        description: 'Test de passage exact des données',
        imageUrl: 'https://exact.test/image.jpg',
        thematics: [Thematic.TAXATION, Thematic.INSURANCE],
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 120,
        extraField: 'should be passed through', // Champ supplémentaire
      };

      mockRequest.body = requestBody;
      mockCreateModuleUseCase.execute.mockResolvedValue({} as any);

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockCreateModuleUseCase.execute).toHaveBeenCalledWith(requestBody);
    });
  });

  describe('getAll', () => {
    it('devrait récupérer tous les modules avec succès', async () => {
      // Arrange
      const expectedModules = [
        {
          id: 'module-1',
          title: 'Premier Module',
          description: 'Description du premier module',
          imageUrl: 'https://example.com/image1.jpg',
          thematics: [Thematic.FINANCIAL_EDUCATION],
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 60,
          status: ModuleStatus.PUBLISHED,
          createdAt: new Date('2024-01-02T10:00:00Z'),
          updatedAt: new Date('2024-01-02T10:00:00Z'),
        },
        {
          id: 'module-2',
          title: 'Deuxième Module',
          description: 'Description du deuxième module',
          imageUrl: null,
          thematics: [Thematic.INVESTMENT, Thematic.SAVING],
          difficultyLevel: DifficultyLevel.INTERMEDIATE,
          estimatedDuration: 90,
          status: ModuleStatus.DRAFT,
          createdAt: new Date('2024-01-01T10:00:00Z'),
          updatedAt: new Date('2024-01-01T10:00:00Z'),
        },
      ];

      mockGetModulesUseCase.execute.mockResolvedValue(expectedModules);

      // Act
      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockGetModulesUseCase.execute).toHaveBeenCalledWith();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expectedModules,
        message: 'Modules récupérés avec succès',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("devrait retourner un tableau vide si aucun module n'existe", async () => {
      // Arrange
      const emptyResult: any[] = [];
      mockGetModulesUseCase.execute.mockResolvedValue(emptyResult);

      // Act
      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockGetModulesUseCase.execute).toHaveBeenCalledWith();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: emptyResult,
        message: 'Modules récupérés avec succès',
      });
    });

    it('devrait gérer les erreurs du use case lors de la récupération', async () => {
      // Arrange
      const error = new Error('Erreur de base de données');
      mockGetModulesUseCase.execute.mockRejectedValue(error);

      // Act
      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockGetModulesUseCase.execute).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it("ne devrait pas utiliser les paramètres de requête (pas d'arguments attendus)", async () => {
      // Arrange
      mockRequest.query = {
        page: '1',
        limit: '10',
        status: 'PUBLISHED',
      };
      mockGetModulesUseCase.execute.mockResolvedValue([]);

      // Act
      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockGetModulesUseCase.execute).toHaveBeenCalledWith();
      // Aucun paramètre ne devrait être passé au use case
      expect(mockGetModulesUseCase.execute).toHaveBeenCalledWith();
    });
  });

  describe("Tests d'intégration des méthodes du contrôleur", () => {
    it('devrait maintenir la cohérence des formats de réponse', async () => {
      // Test create
      mockRequest.body = {
        title: 'Test',
        description: 'Test',
        imageUrl: null,
        thematics: [Thematic.SAVING],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
      };

      const createResult = {
        id: 'test-id',
        ...mockRequest.body,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateModuleUseCase.execute.mockResolvedValue(createResult);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Object),
          message: expect.any(String),
        })
      );

      // Reset mocks
      jest.clearAllMocks();
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Test getAll
      mockGetModulesUseCase.execute.mockResolvedValue([createResult]);

      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
          message: expect.any(String),
        })
      );
    });

    it('devrait gérer les erreurs de manière cohérente', async () => {
      const error = new Error('Test error');

      // Test create error
      mockCreateModuleUseCase.execute.mockRejectedValue(error);
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);

      // Reset
      jest.clearAllMocks();

      // Test getAll error
      mockGetModulesUseCase.execute.mockRejectedValue(error);
      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('Validation des types de réponse', () => {
    it('devrait retourner le bon code de statut pour create (201)', async () => {
      // Arrange
      mockRequest.body = {
        title: 'Test',
        description: 'Test',
        imageUrl: null,
        thematics: [Thematic.SAVING],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
      };

      mockCreateModuleUseCase.execute.mockResolvedValue({} as any);

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('devrait retourner le bon code de statut pour getAll (200)', async () => {
      // Arrange
      mockGetModulesUseCase.execute.mockResolvedValue([]);

      // Act
      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('devrait avoir des messages de succès appropriés', async () => {
      // Test create message
      mockRequest.body = {
        title: 'Test',
        description: 'Test',
        imageUrl: null,
        thematics: [Thematic.SAVING],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
      };

      mockCreateModuleUseCase.execute.mockResolvedValue({} as any);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Module créé avec succès',
        })
      );

      // Reset mocks
      jest.clearAllMocks();
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Test getAll message
      mockGetModulesUseCase.execute.mockResolvedValue([]);

      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Modules récupérés avec succès',
        })
      );
    });
  });
});
