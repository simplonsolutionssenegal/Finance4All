// backend/__tests__/infrastructure/web/validators/module.validator.test.ts

import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import {
  validateCreateModule,
  validateGetModules,
  validatePagination,
  handleValidationErrors,
} from '@/infrastructure/web/validators/module.validator';
import { DifficultyLevel, ModuleStatus } from '@/domain/formations/entities/ModuleFormation';

// Helper to run validation middleware
const runValidation = async (req: Request, validations: any[]) => {
  await Promise.all(validations.map(validation => validation.run(req)));
  return validationResult(req);
};

describe('Module Validator', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
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

  describe('handleValidationErrors', () => {
    it("devrait appeler next() s'il n'y a pas d'erreurs de validation", async () => {
      mockRequest.body = { title: 'test' }; // no validation rules applied yet
      handleValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('devrait retourner 400 avec les erreurs si la validation échoue', async () => {
      mockRequest.body = { title: '' }; // Invalid title
      await runValidation(mockRequest as Request, validateCreateModule);

      handleValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        errors: expect.any(Array),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('devrait retourner toutes les erreurs de validation', async () => {
      mockRequest.body = {
        title: '', // Invalid title
        description: '', // Invalid description
        thematics: '', // Invalid thematics
        difficultyLevel: 'INVALID', // Invalid difficulty
        estimatedDuration: -1, // Invalid duration
      };
      await runValidation(mockRequest as Request, validateCreateModule);

      handleValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.errors.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('validateCreateModule', () => {
    const validData = {
      title: 'Introduction aux Finances',
      description: "Module d'introduction aux concepts financiers de base pour débutants",
      thematics: 'finance et comptabilité',
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
    };

    it('devrait valider avec des données valides', async () => {
      mockRequest.body = validData;
      const errors = await runValidation(mockRequest as Request, validateCreateModule);
      expect(errors.isEmpty()).toBe(true);
    });

    describe('Validation du titre', () => {
      it('devrait échouer si le titre est manquant', async () => {
        mockRequest.body = { ...validData, title: '' };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'title',
              msg: 'Le titre est obligatoire',
            }),
          ])
        );
      });

      it('devrait échouer si le titre contient uniquement des espaces', async () => {
        mockRequest.body = { ...validData, title: '   ' };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'title',
              msg: 'Le titre est obligatoire',
            }),
          ])
        );
      });

      it('devrait échouer si le titre dépasse 200 caractères', async () => {
        const longTitle = 'A'.repeat(201);
        mockRequest.body = { ...validData, title: longTitle };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'title',
              msg: 'Le titre ne peut pas dépasser 200 caractères',
            }),
          ])
        );
      });

      it('devrait valider un titre de 200 caractères exactement', async () => {
        const exactLengthTitle = 'A'.repeat(200);
        mockRequest.body = { ...validData, title: exactLengthTitle };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait trim les espaces du titre', async () => {
        mockRequest.body = { ...validData, title: '  Mon Titre  ' };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.isEmpty()).toBe(true);
      });
    });

    describe('Validation de la description', () => {
      it('devrait échouer si la description est manquante', async () => {
        mockRequest.body = { ...validData, description: '' };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'description',
              msg: 'La description est obligatoire',
            }),
          ])
        );
      });

      it('devrait échouer si la description contient uniquement des espaces', async () => {
        mockRequest.body = { ...validData, description: '   ' };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'description',
              msg: 'La description est obligatoire',
            }),
          ])
        );
      });

      it('devrait échouer si la description fait moins de 10 caractères', async () => {
        mockRequest.body = { ...validData, description: 'Trop crt' }; // 8 caractères
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'description',
              msg: 'La description doit contenir au moins 10 caractères',
            }),
          ])
        );
      });

      it('devrait valider une description de 10 caractères exactement', async () => {
        mockRequest.body = { ...validData, description: '1234567890' };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait trim les espaces de la description', async () => {
        mockRequest.body = { ...validData, description: '  Description valide du module  ' };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.isEmpty()).toBe(true);
      });
    });

    describe('Validation de la thématique', () => {
      it('devrait échouer si la thématique est manquante', async () => {
        mockRequest.body = { ...validData, thematics: '' };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'thematics',
              msg: 'Au moins une thématique est requise',
            }),
          ])
        );
      });

      it('devrait échouer si la thématique contient uniquement des espaces', async () => {
        mockRequest.body = { ...validData, thematics: '   ' };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'thematics',
              msg: 'Au moins une thématique est requise',
            }),
          ])
        );
      });

      it('devrait échouer si la thématique fait moins de 3 caractères', async () => {
        mockRequest.body = { ...validData, thematics: 'ab' }; // 2 caractères
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'thematics',
              msg: 'La thématique doit contenir au moins 3 caractères',
            }),
          ])
        );
      });

      it('devrait valider une thématique de 3 caractères exactement', async () => {
        mockRequest.body = { ...validData, thematics: 'fin' };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider une thématique valide', async () => {
        mockRequest.body = { ...validData, thematics: 'finance et comptabilité' };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider une thématique longue', async () => {
        mockRequest.body = {
          ...validData,
          thematics: 'gestion budgétaire et planification financière',
        };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait trim les espaces de la thématique', async () => {
        mockRequest.body = { ...validData, thematics: '  investissement  ' };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.isEmpty()).toBe(true);
      });
    });

    describe('Validation du niveau de difficulté', () => {
      it('devrait échouer si le niveau de difficulté est invalide', async () => {
        mockRequest.body = { ...validData, difficultyLevel: 'INVALID_LEVEL' };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'difficultyLevel',
              msg: 'Niveau de difficulté invalide',
            }),
          ])
        );
      });

      it('devrait valider le niveau débutant', async () => {
        mockRequest.body = { ...validData, difficultyLevel: DifficultyLevel.BEGINNER };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider le niveau intermédiaire', async () => {
        mockRequest.body = { ...validData, difficultyLevel: DifficultyLevel.INTERMEDIATE };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider le niveau avancé', async () => {
        mockRequest.body = { ...validData, difficultyLevel: DifficultyLevel.ADVANCED };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait échouer si le niveau de difficulté est manquant', async () => {
        const dataWithoutDifficulty = { ...validData };
        delete (dataWithoutDifficulty as any).difficultyLevel;
        mockRequest.body = dataWithoutDifficulty;
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'difficultyLevel',
            }),
          ])
        );
      });
    });

    describe('Validation de la durée estimée', () => {
      it('devrait échouer si la durée estimée est négative', async () => {
        mockRequest.body = { ...validData, estimatedDuration: -1 };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'estimatedDuration',
              msg: 'La durée estimée doit être supérieure à 0',
            }),
          ])
        );
      });

      it('devrait échouer si la durée estimée est zéro', async () => {
        mockRequest.body = { ...validData, estimatedDuration: 0 };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'estimatedDuration',
              msg: 'La durée estimée doit être supérieure à 0',
            }),
          ])
        );
      });

      it('devrait valider une durée minimale de 0.1', async () => {
        mockRequest.body = { ...validData, estimatedDuration: 0.1 };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider une durée de 1 minute', async () => {
        mockRequest.body = { ...validData, estimatedDuration: 1 };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider une durée de 30 minutes', async () => {
        mockRequest.body = { ...validData, estimatedDuration: 30 };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider une durée de 60 minutes', async () => {
        mockRequest.body = { ...validData, estimatedDuration: 60 };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider une durée de 180 minutes', async () => {
        mockRequest.body = { ...validData, estimatedDuration: 180 };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.isEmpty()).toBe(true);
      });

      it("devrait échouer si la durée estimée n'est pas un nombre", async () => {
        mockRequest.body = { ...validData, estimatedDuration: 'not-a-number' };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'estimatedDuration',
              msg: 'La durée estimée doit être supérieure à 0',
            }),
          ])
        );
      });

      it('devrait valider une durée très longue', async () => {
        mockRequest.body = { ...validData, estimatedDuration: 10080 }; // 7 jours
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.isEmpty()).toBe(true);
      });
    });
  });

  describe('validateGetModules', () => {
    it('devrait valider avec des paramètres de requête valides', async () => {
      mockRequest.query = {
        title: 'Finance',
        description: 'Module de finance',
        objective: 'Apprendre les bases',
        status: ModuleStatus.PUBLISHED,
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        thematics: 'investissement',
        imageUrl: 'https://example.com/image.jpg',
      };
      const errors = await runValidation(mockRequest as Request, validateGetModules);
      expect(errors.isEmpty()).toBe(true);
    });

    it('devrait valider sans paramètres de requête (tous optionnels)', async () => {
      mockRequest.query = {};
      const errors = await runValidation(mockRequest as Request, validateGetModules);
      expect(errors.isEmpty()).toBe(true);
    });

    describe('Validation du titre en query', () => {
      it('devrait échouer si le titre dépasse 200 caractères', async () => {
        const longTitle = 'A'.repeat(201);
        mockRequest.query = { title: longTitle };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'title',
              msg: 'Le titre ne peut pas dépasser 200 caractères',
            }),
          ])
        );
      });

      it('devrait valider un titre vide ou avec espaces (sera trimé)', async () => {
        mockRequest.query = { title: '   ' };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider un titre de 200 caractères exactement', async () => {
        const exactLengthTitle = 'A'.repeat(200);
        mockRequest.query = { title: exactLengthTitle };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });
    });

    describe('Validation de la description en query', () => {
      it('devrait échouer si la description dépasse 500 caractères', async () => {
        const longDescription = 'A'.repeat(501);
        mockRequest.query = { description: longDescription };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'description',
              msg: 'La description ne peut pas dépasser 500 caractères',
            }),
          ])
        );
      });

      it('devrait valider une description de 500 caractères exactement', async () => {
        const exactLengthDescription = 'A'.repeat(500);
        mockRequest.query = { description: exactLengthDescription };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });
    });

    describe("Validation de l'objectif en query", () => {
      it("devrait échouer si l'objectif dépasse 200 caractères", async () => {
        const longObjective = 'A'.repeat(201);
        mockRequest.query = { objective: longObjective };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'objective',
              msg: "L'objectif pédagogique ne peut pas dépasser 200 caractères",
            }),
          ])
        );
      });

      it('devrait valider un objectif de 200 caractères exactement', async () => {
        const exactLengthObjective = 'A'.repeat(200);
        mockRequest.query = { objective: exactLengthObjective };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });
    });

    describe('Validation du statut en query', () => {
      it('devrait échouer si le statut est invalide', async () => {
        mockRequest.query = { status: 'INVALID_STATUS' };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'status',
              msg: 'Statut invalide',
            }),
          ])
        );
      });

      it('devrait valider le statut DRAFT', async () => {
        mockRequest.query = { status: ModuleStatus.DRAFT };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider le statut PUBLISHED', async () => {
        mockRequest.query = { status: ModuleStatus.PUBLISHED };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider le statut ARCHIVED', async () => {
        mockRequest.query = { status: ModuleStatus.ARCHIVED };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });
    });

    describe('Validation du niveau de difficulté en query', () => {
      it('devrait échouer si le niveau de difficulté est invalide', async () => {
        mockRequest.query = { difficultyLevel: 'INVALID_LEVEL' };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'difficultyLevel',
              msg: 'Niveau de difficulté invalide',
            }),
          ])
        );
      });

      it('devrait valider le niveau débutant en query', async () => {
        mockRequest.query = { difficultyLevel: DifficultyLevel.BEGINNER };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider le niveau intermédiaire en query', async () => {
        mockRequest.query = { difficultyLevel: DifficultyLevel.INTERMEDIATE };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider le niveau avancé en query', async () => {
        mockRequest.query = { difficultyLevel: DifficultyLevel.ADVANCED };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });
    });

    describe('Validation de la thématique en query', () => {
      it('devrait échouer si la thématique dépasse 200 caractères', async () => {
        const longThematic = 'A'.repeat(201);
        mockRequest.query = { thematics: longThematic };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'thematics',
              msg: 'Ne peut pas dépasser 20 caractères',
            }),
          ])
        );
      });

      it('devrait valider une thématique valide', async () => {
        mockRequest.query = { thematics: 'finance' };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider une thématique avec espaces', async () => {
        mockRequest.query = { thematics: 'gestion budgétaire' };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait trim les espaces de la thématique', async () => {
        mockRequest.query = { thematics: '  investissement  ' };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });
    });

    describe("Validation de l'URL d'image en query", () => {
      it("devrait échouer si l'URL d'image est invalide", async () => {
        mockRequest.query = { imageUrl: 'invalid-url' };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'imageUrl',
              msg: "URL de l'image invalide",
            }),
          ])
        );
      });

      it('devrait valider une URL https', async () => {
        mockRequest.query = { imageUrl: 'https://example.com/image.jpg' };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider une URL http', async () => {
        mockRequest.query = { imageUrl: 'http://test.com/photo.png' };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider une URL avec CDN', async () => {
        mockRequest.query = { imageUrl: 'https://cdn.example.com/assets/module-image.gif' };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider une URL avec query params', async () => {
        mockRequest.query = { imageUrl: 'https://example.com/image.jpg?size=large&format=webp' };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });
    });
  });

  describe("Tests d'intégration des validateurs", () => {
    it('devrait valider un module complet avec toutes les propriétés', async () => {
      const completeModuleData = {
        title: 'Module Complet de Formation Financière',
        description:
          'Ce module couvre tous les aspects essentiels de la gestion financière personnelle et professionnelle',
        thematics: 'finance et comptabilité avancée',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 150,
      };

      mockRequest.body = completeModuleData;
      const errors = await runValidation(mockRequest as Request, validateCreateModule);
      expect(errors.isEmpty()).toBe(true);
    });

    it('devrait collecter toutes les erreurs de validation en une seule fois', async () => {
      const invalidData = {
        title: '', // Titre vide
        description: 'court', // Description trop courte
        thematics: 'ab', // Thématique trop courte
        difficultyLevel: 'WRONG', // Niveau invalide
        estimatedDuration: -5, // Durée négative
      };

      mockRequest.body = invalidData;
      const errors = await runValidation(mockRequest as Request, validateCreateModule);

      expect(errors.array().length).toBeGreaterThanOrEqual(5);
      const paths = errors.array().map(e => (e as any).path);
      expect(paths).toEqual(
        expect.arrayContaining([
          'title',
          'description',
          'thematics',
          'difficultyLevel',
          'estimatedDuration',
        ])
      );
    });

    it('devrait valider une requête GET avec plusieurs paramètres', async () => {
      mockRequest.query = {
        title: 'Finance',
        status: ModuleStatus.PUBLISHED,
        difficultyLevel: DifficultyLevel.BEGINNER,
        thematics: 'gestion budgétaire',
      };

      const errors = await runValidation(mockRequest as Request, validateGetModules);
      expect(errors.isEmpty()).toBe(true);
    });

    it('devrait valider un module avec durée minimale', async () => {
      const minimalModule = {
        title: 'Titre',
        description: '1234567890',
        thematics: 'fin',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 0.1,
      };

      mockRequest.body = minimalModule;
      const errors = await runValidation(mockRequest as Request, validateCreateModule);
      expect(errors.isEmpty()).toBe(true);
    });

    it('devrait valider un module avec titre et description aux limites maximales', async () => {
      const maximalModule = {
        title: 'A'.repeat(200),
        description: 'B'.repeat(100), // Pas de limite max pour description dans validateCreateModule
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 120,
      };

      mockRequest.body = maximalModule;
      const errors = await runValidation(mockRequest as Request, validateCreateModule);
      expect(errors.isEmpty()).toBe(true);
    });
  });

  describe('validatePagination', () => {
    it('devrait valider sans paramètres de pagination (utilise les valeurs par défaut)', async () => {
      mockRequest.query = {};
      const errors = await runValidation(mockRequest as Request, validatePagination);
      expect(errors.isEmpty()).toBe(true);
    });

    it('devrait valider avec page et limit valides', async () => {
      mockRequest.query = { page: '1', limit: '10' };
      const errors = await runValidation(mockRequest as Request, validatePagination);
      expect(errors.isEmpty()).toBe(true);
    });

    describe('Validation de page', () => {
      it('devrait échouer si page est inférieure à 1', async () => {
        mockRequest.query = { page: '0' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'page',
              msg: 'Page must be a positive integer',
            }),
          ])
        );
      });

      it('devrait échouer si page est négative', async () => {
        mockRequest.query = { page: '-1' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'page',
              msg: 'Page must be a positive integer',
            }),
          ])
        );
      });

      it('devrait valider page = 1', async () => {
        mockRequest.query = { page: '1' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider page = 10', async () => {
        mockRequest.query = { page: '10' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider page = 100', async () => {
        mockRequest.query = { page: '100' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.isEmpty()).toBe(true);
      });

      it("devrait échouer si page n'est pas un entier", async () => {
        mockRequest.query = { page: '1.5' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'page',
            }),
          ])
        );
      });

      it("devrait échouer si page n'est pas un nombre", async () => {
        mockRequest.query = { page: 'abc' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'page',
              msg: 'Page must be a positive integer',
            }),
          ])
        );
      });
    });

    describe('Validation de limit', () => {
      it('devrait échouer si limit est inférieur à 1', async () => {
        mockRequest.query = { limit: '0' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'limit',
              msg: 'Limit must be between 1 and 100',
            }),
          ])
        );
      });

      it('devrait échouer si limit est supérieur à 100', async () => {
        mockRequest.query = { limit: '101' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'limit',
              msg: 'Limit must be between 1 and 100',
            }),
          ])
        );
      });

      it('devrait valider limit = 1', async () => {
        mockRequest.query = { limit: '1' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider limit = 10', async () => {
        mockRequest.query = { limit: '10' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider limit = 50', async () => {
        mockRequest.query = { limit: '50' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider limit = 100', async () => {
        mockRequest.query = { limit: '100' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.isEmpty()).toBe(true);
      });

      it("devrait échouer si limit n'est pas un entier", async () => {
        mockRequest.query = { limit: '10.5' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'limit',
            }),
          ])
        );
      });

      it("devrait échouer si limit n'est pas un nombre", async () => {
        mockRequest.query = { limit: 'xyz' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'limit',
              msg: 'Limit must be between 1 and 100',
            }),
          ])
        );
      });

      it('devrait échouer si limit est négatif', async () => {
        mockRequest.query = { limit: '-5' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'limit',
              msg: 'Limit must be between 1 and 100',
            }),
          ])
        );
      });
    });

    describe('Validation combinée page et limit', () => {
      it('devrait valider page=1, limit=6 (valeurs par défaut)', async () => {
        mockRequest.query = { page: '1', limit: '6' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider page=5, limit=20', async () => {
        mockRequest.query = { page: '5', limit: '20' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider page=100, limit=100', async () => {
        mockRequest.query = { page: '100', limit: '100' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait échouer si page et limit sont tous deux invalides', async () => {
        mockRequest.query = { page: '0', limit: '101' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.array().length).toBeGreaterThanOrEqual(2);
        const paths = errors.array().map(e => (e as any).path);
        expect(paths).toEqual(expect.arrayContaining(['page', 'limit']));
      });

      it('devrait valider avec seulement page (limit par défaut)', async () => {
        mockRequest.query = { page: '3' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider avec seulement limit (page optionnelle)', async () => {
        mockRequest.query = { limit: '25' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.isEmpty()).toBe(true);
      });
    });

    describe('Conversion de types', () => {
      it('devrait convertir page en entier', async () => {
        mockRequest.query = { page: '42' };
        await runValidation(mockRequest as Request, validatePagination);
        // Note: express-validator toInt() convertit la valeur
        expect(mockRequest.query.page).toBe(42);
      });

      it('devrait convertir limit en entier', async () => {
        mockRequest.query = { limit: '25' };
        await runValidation(mockRequest as Request, validatePagination);
        expect(mockRequest.query.limit).toBe(25);
      });

      it("devrait gérer l'absence de limit (pas de valeur par défaut appliquée)", async () => {
        mockRequest.query = { page: '1' };
        await runValidation(mockRequest as Request, validatePagination);
        // La méthode .default() n'applique pas réellement la valeur dans express-validator
        expect(mockRequest.query.limit).toBeUndefined();
      });

      it('devrait convertir les deux paramètres', async () => {
        mockRequest.query = { page: '10', limit: '50' };
        await runValidation(mockRequest as Request, validatePagination);
        expect(mockRequest.query.page).toBe(10);
        expect(mockRequest.query.limit).toBe(50);
      });
    });

    describe('Cas limites', () => {
      it('devrait gérer une chaîne vide pour page', async () => {
        mockRequest.query = { page: '' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        // Une chaîne vide devrait être considérée comme invalide
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'page',
            }),
          ])
        );
      });

      it('devrait gérer une chaîne vide pour limit', async () => {
        mockRequest.query = { limit: '' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'limit',
            }),
          ])
        );
      });

      it('devrait échouer avec des espaces dans les valeurs', async () => {
        mockRequest.query = { page: ' 5 ', limit: ' 10 ' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        // Les espaces ne sont pas trimés, donc la conversion échoue
        expect(errors.isEmpty()).toBe(false);
        expect(errors.array().length).toBeGreaterThanOrEqual(2);
      });

      it('devrait échouer avec des valeurs très grandes', async () => {
        mockRequest.query = { page: '999999999999', limit: '1000' };
        const errors = await runValidation(mockRequest as Request, validatePagination);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'limit',
              msg: 'Limit must be between 1 and 100',
            }),
          ])
        );
      });
    });
  });
});
