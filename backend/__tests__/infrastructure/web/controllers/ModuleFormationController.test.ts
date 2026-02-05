// backend/__tests__/infrastructure/web/controllers/ModuleFormationController.test.ts

import { ModuleController } from '@/infrastructure/web/controllers/ModuleFormationController';
import type { CreateModuleUseCommand } from '@/domain/formations/ports/in/CreateModuleUseCase';
import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import type { GetModulesUseCaseQuery } from '@/domain/formations/ports/in/GetModulesUseCase';
import type { PaginatedResult } from '@/domain/shared/Pagination';
import type { Request, Response, NextFunction } from 'express';
import {
  DuplicateTitleException,
  ValidationException,
  DomainException,
} from '@/domain/shared/exceptions/FormationDomainException';

// Définir les types de use case explicitement
type CreateModuleUseCaseType = {
  execute: (input: CreateModuleUseCommand) => Promise<ModuleResponseDTO>;
};

type GetModulesUseCaseType = {
  execute: (input: GetModulesUseCaseQuery) => Promise<PaginatedResult<ModuleResponseDTO>>;
};

type GetModuleByIdUseCaseType = {
  execute: (input: { id: string }) => Promise<ModuleResponseDTO>;
};

type AddLessonUseCaseType = {
  execute: (input: any) => Promise<any>;
};

type AddQuizUseCaseType = {
  execute: (input: any) => Promise<any>;
};

type UpdateModuleUseCaseType = {
  execute: (input: any) => Promise<ModuleResponseDTO>;
};

describe('ModuleController (unit) — Couverture 100%', () => {
  let controller: ModuleController;
  let mockCreateModuleUseCase: jest.Mocked<CreateModuleUseCaseType>;
  let mockGetModulesUseCase: jest.Mocked<GetModulesUseCaseType>;
  let mockGetModuleByIdUseCase: jest.Mocked<GetModuleByIdUseCaseType>;
  let mockAddLessonUseCase: jest.Mocked<AddLessonUseCaseType>;
  let mockAddQuizUseCase: jest.Mocked<AddQuizUseCaseType>;
  let mockUpdateModuleUseCase: jest.Mocked<UpdateModuleUseCaseType>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockCreateModuleUseCase = {
      execute: jest.fn(),
    } as jest.Mocked<CreateModuleUseCaseType>;

    mockGetModulesUseCase = {
      execute: jest.fn(),
    } as jest.Mocked<GetModulesUseCaseType>;

    mockGetModuleByIdUseCase = {
      execute: jest.fn(),
    } as jest.Mocked<GetModuleByIdUseCaseType>;

    mockAddLessonUseCase = {
      execute: jest.fn(),
    } as jest.Mocked<AddLessonUseCaseType>;

    mockAddQuizUseCase = {
      execute: jest.fn(),
    } as jest.Mocked<AddQuizUseCaseType>;

    mockUpdateModuleUseCase = {
      execute: jest.fn(),
    } as jest.Mocked<UpdateModuleUseCaseType>;

    controller = new ModuleController(
      mockCreateModuleUseCase,
      mockGetModulesUseCase,
      mockGetModuleByIdUseCase,
      mockAddLessonUseCase,
      mockAddQuizUseCase,
      mockUpdateModuleUseCase
    );

    req = { body: {}, query: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('should return 201 and the created module on success', async () => {
      const payload = { title: 'Module Test', description: 'Description' } as any;
      const created = { id: '123', ...payload } as any;

      req.body = payload;
      mockCreateModuleUseCase.execute.mockResolvedValue(created);

      const result = await controller.create(req as Request, res as Response);

      expect(mockCreateModuleUseCase.execute).toHaveBeenCalledWith(payload);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: created,
        message: 'Module créé avec succès',
      });
      expect(result).toBe(res as Response);
    });

    it('should return 409 when DuplicateTitleException is thrown', async () => {
      const payload = { title: 'Duplicate' } as any;
      req.body = payload;

      // ✅ passe le titre dans l’exception (pas un message arbitraire)
      mockCreateModuleUseCase.execute.mockRejectedValue(new DuplicateTitleException(payload.title));

      const result = await controller.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'DUPLICATE_TITLE',
        message: `Un module avec le titre "${payload.title}" existe déjà`,
      });
      expect(result).toBe(res as Response);
    });

    it('should return 400 when ValidationException is thrown', async () => {
      const payload = { title: '' } as any;
      req.body = payload;
      mockCreateModuleUseCase.execute.mockRejectedValue(
        new ValidationException('Validation failed')
      );

      const result = await controller.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
      });
      expect(result).toBe(res as Response);
    });

    it('should return 400 when other DomainException is thrown', async () => {
      req.body = { title: 'Test' } as any;
      mockCreateModuleUseCase.execute.mockRejectedValue(new DomainException('Domain error'));

      const result = await controller.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'DOMAIN_ERROR',
        message: 'Domain error',
      });
      expect(result).toBe(res as Response);
    });

    it('should return 500 on unexpected errors', async () => {
      req.body = { title: 'Test' } as any;
      const unexpectedError = new Error('Unexpected error');
      mockCreateModuleUseCase.execute.mockRejectedValue(unexpectedError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await controller.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Une erreur est survenue lors de la création du module',
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Unexpected error in create module:',
        unexpectedError
      );
      consoleSpy.mockRestore();
      expect(result).toBe(res as Response);
    });
  });

  describe('getAll', () => {
    it('should return 200 and modules with default pagination', async () => {
      const paginatedResult = {
        data: [{ id: '1', title: 'Module 1' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      } as any;

      mockGetModulesUseCase.execute.mockResolvedValue(paginatedResult);

      await controller.getAll(req as Request, res as Response, next);

      expect(mockGetModulesUseCase.execute).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...paginatedResult,
        message: 'Modules récupérés avec succès',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should parse page and limit from query if provided', async () => {
      req.query = { page: '3', limit: '20' } as any;
      const paginatedResult = {
        data: [],
        pagination: { page: 3, limit: 20, total: 0, totalPages: 0 },
      } as any;

      mockGetModulesUseCase.execute.mockResolvedValue(paginatedResult);

      await controller.getAll(req as Request, res as Response, next);

      expect(mockGetModulesUseCase.execute).toHaveBeenCalledWith({ page: 3, limit: 20 });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle invalid page query parameter', async () => {
      req.query = { page: 'invalid', limit: '10' } as any;
      const paginatedResult = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      } as any;

      mockGetModulesUseCase.execute.mockResolvedValue(paginatedResult);

      await controller.getAll(req as Request, res as Response, next);

      expect(mockGetModulesUseCase.execute).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('should handle invalid limit query parameter', async () => {
      req.query = { page: '2', limit: 'abc' } as any;
      const paginatedResult = {
        data: [],
        pagination: { page: 2, limit: 10, total: 0, totalPages: 0 },
      } as any;

      mockGetModulesUseCase.execute.mockResolvedValue(paginatedResult);

      await controller.getAll(req as Request, res as Response, next);

      expect(mockGetModulesUseCase.execute).toHaveBeenCalledWith({ page: 2, limit: 10 });
    });

    it('should call next on use case error', async () => {
      const error = new Error('Database error');
      mockGetModulesUseCase.execute.mockRejectedValue(error);

      await controller.getAll(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return 200 and the module when found', async () => {
      req.params = { id: 'module-123' };
      const moduleData = { id: 'module-123', title: 'Test Module' } as any;

      mockGetModuleByIdUseCase.execute.mockResolvedValue(moduleData);

      await controller.getById(req as Request, res as Response, next);

      expect(mockGetModuleByIdUseCase.execute).toHaveBeenCalledWith({ id: 'module-123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: moduleData,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next on use case error', async () => {
      req.params = { id: 'non-existent' };
      const error = new Error('Module not found');
      mockGetModuleByIdUseCase.execute.mockRejectedValue(error);

      await controller.getById(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('addLesson', () => {
    it('should return 201 and add lesson successfully', async () => {
      req.params = { id: 'module-456' };
      req.body = {
        title: 'New Lesson',
        description: 'Lesson description',
        duration: '60',
        order: '1',
        status: 'DRAFT',
        chapters: [],
      };

      const result = {
        id: 'lesson-789',
        title: 'New Lesson',
        duration: 60,
        order: 1,
      } as any;

      mockAddLessonUseCase.execute.mockResolvedValue(result);

      await controller.addLesson(req as Request, res as Response, next);

      expect(mockAddLessonUseCase.execute).toHaveBeenCalledWith({
        moduleId: 'module-456',
        title: 'New Lesson',
        description: 'Lesson description',
        duration: 60,
        order: 1,
        status: 'DRAFT',
        chapters: [],
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle missing order parameter and default to 0', async () => {
      req.params = { id: 'module-123' };
      req.body = {
        title: 'Lesson without order',
        description: 'Description',
        duration: '45',
        status: 'PUBLISHED',
        chapters: [],
      };

      mockAddLessonUseCase.execute.mockResolvedValue({} as any);

      await controller.addLesson(req as Request, res as Response, next);

      expect(mockAddLessonUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          moduleId: 'module-123',
          duration: 45,
          order: 0,
        })
      );
    });

    it('should convert duration string to number', async () => {
      req.params = { id: 'module-999' };
      req.body = {
        title: 'Test',
        description: 'Test',
        duration: '120',
        order: '5',
        chapters: [],
      };

      mockAddLessonUseCase.execute.mockResolvedValue({} as any);

      await controller.addLesson(req as Request, res as Response, next);

      expect(mockAddLessonUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 120,
          order: 5,
        })
      );
    });

    it('should call next on use case error', async () => {
      req.params = { id: 'module-123' };
      req.body = {
        title: 'Test',
        description: 'Test',
        duration: '30',
        chapters: [],
      };

      const error = new Error('Failed to add lesson');
      mockAddLessonUseCase.execute.mockRejectedValue(error);

      await controller.addLesson(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('addQuiz', () => {
    it('should return 201 and add quiz successfully', async () => {
      req.params = { id: 'module-789' };
      req.body = {
        title: 'New Quiz',
        description: 'Quiz description',
        scoreMinimum: '70',
        nombreTentatives: '2',
        duree: '1800',
        status: 'DRAFT',
        questions: [],
      };

      const result = {
        id: 'quiz-123',
        title: 'New Quiz',
        scoreMinimum: 70,
        nombreTentatives: 2,
        duree: 1800,
      } as any;

      mockAddQuizUseCase.execute.mockResolvedValue(result);

      await controller.addQuiz(req as Request, res as Response, next);

      expect(mockAddQuizUseCase.execute).toHaveBeenCalledWith({
        moduleId: 'module-789',
        title: 'New Quiz',
        description: 'Quiz description',
        scoreMinimum: 70,
        nombreTentatives: 2,
        duree: 1800,
        status: 'DRAFT',
        questions: [],
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle duree as undefined when not provided', async () => {
      req.params = { id: 'module-456' };
      req.body = {
        title: 'Unlimited Quiz',
        description: 'No time limit',
        scoreMinimum: '50',
        nombreTentatives: '3',
        status: 'PUBLISHED',
        questions: [],
      };

      mockAddQuizUseCase.execute.mockResolvedValue({} as any);

      await controller.addQuiz(req as Request, res as Response, next);

      expect(mockAddQuizUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          duree: undefined,
        })
      );
    });

    it('should handle duree as undefined when explicitly null', async () => {
      req.params = { id: 'module-456' };
      req.body = {
        title: 'Quiz',
        description: 'Test',
        scoreMinimum: '60',
        nombreTentatives: '1',
        duree: null,
        questions: [],
      };

      mockAddQuizUseCase.execute.mockResolvedValue({} as any);

      await controller.addQuiz(req as Request, res as Response, next);

      expect(mockAddQuizUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          duree: undefined,
        })
      );
    });

    it('should default nombreTentatives to 3 when not provided', async () => {
      req.params = { id: 'module-789' };
      req.body = {
        title: 'Quiz Test',
        description: 'Description',
        scoreMinimum: '80',
        duree: '3600',
        questions: [],
      };

      mockAddQuizUseCase.execute.mockResolvedValue({} as any);

      await controller.addQuiz(req as Request, res as Response, next);

      expect(mockAddQuizUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          nombreTentatives: 3,
        })
      );
    });

    it('should convert all numeric strings to numbers', async () => {
      req.params = { id: 'module-999' };
      req.body = {
        title: 'Test',
        description: 'Test',
        scoreMinimum: '90',
        nombreTentatives: '2',
        duree: '7200',
        questions: [],
      };

      mockAddQuizUseCase.execute.mockResolvedValue({} as any);

      await controller.addQuiz(req as Request, res as Response, next);

      expect(mockAddQuizUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          scoreMinimum: 90,
          nombreTentatives: 2,
          duree: 7200,
        })
      );
    });

    it('should handle duree set to 0 (edge case)', async () => {
      req.params = { id: 'module-123' };
      req.body = {
        title: 'Quiz',
        description: 'Test',
        scoreMinimum: '50',
        nombreTentatives: '1',
        duree: '0',
        questions: [],
      };

      mockAddQuizUseCase.execute.mockResolvedValue({} as any);

      await controller.addQuiz(req as Request, res as Response, next);

      expect(mockAddQuizUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          duree: 0,
        })
      );
    });

    it('should call next on use case error', async () => {
      req.params = { id: 'module-123' };
      req.body = {
        title: 'Test',
        description: 'Test',
        scoreMinimum: '50',
        nombreTentatives: '3',
        questions: [],
      };

      const error = new Error('Failed to add quiz');
      mockAddQuizUseCase.execute.mockRejectedValue(error);

      await controller.addQuiz(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // update()
  // ---------------------------------------------------------------------------

  describe('update', () => {
    it('should return 200 and the updated module on success', async () => {
      const moduleId = 'module-123';
      const updateData = {
        title: 'Module Updated',
        description: 'New description',
        estimatedDuration: 90,
      };
      const updatedModule = { id: moduleId, ...updateData } as any;

      req.params = { id: moduleId };
      req.body = updateData;
      mockUpdateModuleUseCase.execute.mockResolvedValue(updatedModule);

      await controller.update(req as Request, res as Response, next);

      expect(mockUpdateModuleUseCase.execute).toHaveBeenCalledWith({
        id: moduleId,
        ...updateData,
        estimatedDuration: 90,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedModule,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should convert estimatedDuration string to number', async () => {
      req.params = { id: 'module-456' };
      req.body = {
        title: 'Module Test',
        estimatedDuration: '120',
      };

      mockUpdateModuleUseCase.execute.mockResolvedValue({} as any);

      await controller.update(req as Request, res as Response, next);

      expect(mockUpdateModuleUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          estimatedDuration: 120,
        })
      );
    });

    it('should set estimatedDuration to undefined if null', async () => {
      req.params = { id: 'module-789' };
      req.body = {
        title: 'Module Test',
        estimatedDuration: null,
      };

      mockUpdateModuleUseCase.execute.mockResolvedValue({} as any);

      await controller.update(req as Request, res as Response, next);

      expect(mockUpdateModuleUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          estimatedDuration: undefined,
        })
      );
    });

    it('should set estimatedDuration to undefined if undefined', async () => {
      req.params = { id: 'module-abc' };
      req.body = {
        title: 'Module Test',
        estimatedDuration: undefined,
      };

      mockUpdateModuleUseCase.execute.mockResolvedValue({} as any);

      await controller.update(req as Request, res as Response, next);

      expect(mockUpdateModuleUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          estimatedDuration: undefined,
        })
      );
    });

    it('should handle estimatedDuration set to 0', async () => {
      req.params = { id: 'module-zero' };
      req.body = {
        title: 'Module Test',
        estimatedDuration: 0,
      };

      mockUpdateModuleUseCase.execute.mockResolvedValue({} as any);

      await controller.update(req as Request, res as Response, next);

      expect(mockUpdateModuleUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          estimatedDuration: 0,
        })
      );
    });

    it('should update only provided fields', async () => {
      req.params = { id: 'module-partial' };
      req.body = {
        title: 'Only Title Changed',
      };

      mockUpdateModuleUseCase.execute.mockResolvedValue({} as any);

      await controller.update(req as Request, res as Response, next);

      expect(mockUpdateModuleUseCase.execute).toHaveBeenCalledWith({
        id: 'module-partial',
        title: 'Only Title Changed',
        estimatedDuration: undefined,
      });
    });

    it('should handle all updatable fields', async () => {
      req.params = { id: 'module-full' };
      req.body = {
        title: 'Full Update',
        description: 'Updated description',
        thematics: 'New thematics',
        difficultyLevel: 'ADVANCED',
        estimatedDuration: 180,
        status: 'PUBLISHED',
        imageMediaId: 'image-123',
      };

      mockUpdateModuleUseCase.execute.mockResolvedValue({} as any);

      await controller.update(req as Request, res as Response, next);

      expect(mockUpdateModuleUseCase.execute).toHaveBeenCalledWith({
        id: 'module-full',
        ...req.body,
        estimatedDuration: 180,
      });
    });

    it('should call next on use case error', async () => {
      req.params = { id: 'module-error' };
      req.body = { title: 'Test' };

      const error = new Error('Update failed');
      mockUpdateModuleUseCase.execute.mockRejectedValue(error);

      await controller.update(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle DuplicateTitleException from use case', async () => {
      req.params = { id: 'module-dup' };
      req.body = { title: 'Duplicate Title' };

      const error = new DuplicateTitleException('Duplicate Title');
      mockUpdateModuleUseCase.execute.mockRejectedValue(error);

      await controller.update(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle ValidationException from use case', async () => {
      req.params = { id: 'module-val' };
      req.body = { title: '' };

      const error = new ValidationException('Title cannot be empty');
      mockUpdateModuleUseCase.execute.mockRejectedValue(error);

      await controller.update(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should pass imageMediaId null to remove image', async () => {
      req.params = { id: 'module-img' };
      req.body = {
        title: 'Module',
        imageMediaId: null,
      };

      mockUpdateModuleUseCase.execute.mockResolvedValue({} as any);

      await controller.update(req as Request, res as Response, next);

      expect(mockUpdateModuleUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          imageMediaId: null,
        })
      );
    });
  });
});
