// backend/__tests__/infrastructure/web/validators/module.validator.test.ts

import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import {
  validateCreateModule,
  validateGetModules,
  handleValidationErrors,
} from '@/infrastructure/web/validators/module.validator';
import { DifficultyLevel, ModuleStatus } from '@/domain/formations/entities/ModuleFormation';
import { Thematic } from '@/domain/formations/value-objects/Thematic';

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
        thematics: [], // Invalid thematics
        difficultyLevel: 'INVALID', // Invalid difficulty
        estimatedDuration: -1, // Invalid duration
      };
      await runValidation(mockRequest as Request, validateCreateModule);

      handleValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.errors.length).toBeGreaterThanOrEqual(5); // Au moins 5 erreurs, peut-être plus
    });
  });

  describe('validateCreateModule', () => {
    const validData = {
      title: 'Introduction aux Finances',
      description: "Module d'introduction aux concepts financiers de base pour débutants",
      thematics: [Thematic.FINANCIAL_EDUCATION, Thematic.BUDGET_MANAGEMENT],
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
    });

    describe('Validation des thématiques', () => {
      it('devrait échouer si les thématiques sont manquantes', async () => {
        mockRequest.body = { ...validData, thematics: [] };
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

      it('devrait échouer si les thématiques ne sont pas un tableau', async () => {
        mockRequest.body = { ...validData, thematics: 'not-an-array' };
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

      it('devrait échouer si une thématique est invalide', async () => {
        mockRequest.body = {
          ...validData,
          thematics: [Thematic.FINANCIAL_EDUCATION, 'INVALID_THEMATIC'],
        };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'thematics[1]', // express-validator utilise le format [index] au lieu de .index
              msg: 'Thématique invalide',
            }),
          ])
        );
      });

      it('devrait valider toutes les thématiques valides', async () => {
        const allThematics = Object.values(Thematic);
        mockRequest.body = { ...validData, thematics: allThematics };
        const errors = await runValidation(mockRequest as Request, validateCreateModule);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider une seule thématique valide', async () => {
        mockRequest.body = { ...validData, thematics: [Thematic.INVESTMENT] };
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
        thematic: Thematic.INVESTMENT,
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
      it('devrait échouer si la thématique est invalide', async () => {
        mockRequest.query = { thematic: 'INVALID_THEMATIC' };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'thematic',
              msg: 'Thématique invalide',
            }),
          ])
        );
      });

      it('devrait valider la thématique éducation financière', async () => {
        mockRequest.query = { thematic: Thematic.FINANCIAL_EDUCATION };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider la thématique gestion budget', async () => {
        mockRequest.query = { thematic: Thematic.BUDGET_MANAGEMENT };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider la thématique investissement', async () => {
        mockRequest.query = { thematic: Thematic.INVESTMENT };
        const errors = await runValidation(mockRequest as Request, validateGetModules);
        expect(errors.isEmpty()).toBe(true);
      });

      it('devrait valider la thématique épargne', async () => {
        mockRequest.query = { thematic: Thematic.SAVING };
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
    });
  });

  describe("Tests d'intégration des validateurs", () => {
    it('devrait valider un module complet avec toutes les propriétés', async () => {
      const completeModuleData = {
        title: 'Module Complet de Formation Financière',
        description:
          'Ce module couvre tous les aspects essentiels de la gestion financière personnelle et professionnelle',
        thematics: [
          Thematic.FINANCIAL_EDUCATION,
          Thematic.BUDGET_MANAGEMENT,
          Thematic.INVESTMENT,
          Thematic.SAVING,
        ],
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
        thematics: ['INVALID'], // Thématique invalide
        difficultyLevel: 'WRONG', // Niveau invalide
        estimatedDuration: -5, // Durée négative
      };

      mockRequest.body = invalidData;
      const errors = await runValidation(mockRequest as Request, validateCreateModule);

      expect(errors.array().length).toBeGreaterThanOrEqual(5);
      // Vérifier que les paths incluent les champs attendus (en utilisant le format express-validator)
      const paths = errors.array().map(e => (e as any).path);
      expect(paths).toEqual(
        expect.arrayContaining([
          'title',
          'description',
          'thematics[0]',
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
        thematic: Thematic.BUDGET_MANAGEMENT,
      };

      const errors = await runValidation(mockRequest as Request, validateGetModules);
      expect(errors.isEmpty()).toBe(true);
    });
  });
});
