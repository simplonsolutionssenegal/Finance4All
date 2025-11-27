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

describe('ModuleController (unit)', () => {
  let controller: ModuleController;
  let mockCreateModuleUseCase: jest.Mocked<CreateModuleUseCaseType>;
  let mockGetModulesUseCase: jest.Mocked<GetModulesUseCaseType>;
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

    controller = new ModuleController(mockCreateModuleUseCase, mockGetModulesUseCase);

    req = { body: {}, query: {} };
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
      const payload = { title: 'T', description: 'D' } as any;
      const created = { id: '1', ...payload } as any;

      req.body = payload;
      (mockCreateModuleUseCase.execute as jest.Mock).mockResolvedValue(created);

      // Act
      const result = await controller.create(req as Request, res as Response);

      // Assert
      expect(mockCreateModuleUseCase.execute).toHaveBeenCalledWith(payload);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: created,
        message: 'Module créé avec succès',
      });
      // controller.create returns the response object
      expect(result).toBe(res as Response);
    });

    it('should return 409 when DuplicateTitleException is thrown', async () => {
      const payload = { title: 'dup' } as any;
      req.body = payload;
      (mockCreateModuleUseCase.execute as jest.Mock).mockRejectedValue(
        new DuplicateTitleException('dup')
      );

      const result = await controller.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'DUPLICATE_TITLE' })
      );
      expect(result).toBe(res as Response);
    });

    it('should return 400 when ValidationException is thrown', async () => {
      const payload = { title: '' } as any;
      req.body = payload;
      (mockCreateModuleUseCase.execute as jest.Mock).mockRejectedValue(
        new ValidationException('invalid')
      );

      const result = await controller.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'VALIDATION_ERROR' })
      );
      expect(result).toBe(res as Response);
    });

    it('should return 400 when other DomainException is thrown', async () => {
      req.body = { title: 'x' } as any;
      (mockCreateModuleUseCase.execute as jest.Mock).mockRejectedValue(
        new DomainException('domain')
      );

      const result = await controller.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'DOMAIN_ERROR' })
      );
      expect(result).toBe(res as Response);
    });

    it('should return 500 on unexpected errors', async () => {
      req.body = { title: 'x' } as any;
      const err = new Error('boom');
      (mockCreateModuleUseCase.execute as jest.Mock).mockRejectedValue(err);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await controller.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'INTERNAL_ERROR' })
      );
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
      expect(result).toBe(res as Response);
    });
  });

  describe('getAll', () => {
    it('should return 200 and modules on success', async () => {
      const modules = [{ id: '1' }];
      (mockGetModulesUseCase.execute as jest.Mock).mockResolvedValue(modules as any);

      await controller.getAll(req as Request, res as Response, next);

      expect(mockGetModulesUseCase.execute).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: expect.any(String) })
      );
    });

    it('should call next on use case error', async () => {
      const err = new Error('db');
      (mockGetModulesUseCase.execute as jest.Mock).mockRejectedValue(err);

      await controller.getAll(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(err);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should parse page and limit from query if provided', async () => {
      req.query = { page: '2', limit: '5' } as any;
      (mockGetModulesUseCase.execute as jest.Mock).mockResolvedValue([] as any);

      await controller.getAll(req as Request, res as Response, next);

      expect(mockGetModulesUseCase.execute).toHaveBeenCalledWith({ page: 2, limit: 5 });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
