import { container, TYPES } from '@/infrastructure/config/container';
import type { InstitutionController } from '@/infrastructure/web/controllers/InstitutionController';
import { InstitutionRoutes } from '@/infrastructure/web/routes/institution.routes';
import {
  handleValidationErrors,
  validateAddService,
  validateCreateInstitution,
  validateInstitutionId,
  validatePagination,
  validatePatchService,
  validateUpdateInstitution,
} from '@/infrastructure/web/validators/institution.validator';
import { Router } from 'express';

jest.mock('@/infrastructure/config/container');

describe('InstitutionRoutes', () => {
  let mockRouter: any;
  let mockController: jest.Mocked<InstitutionController>;
  let routeHandlers: Map<string, any>;

  beforeEach(() => {
    jest.clearAllMocks();
    routeHandlers = new Map();

    mockRouter = {
      get: jest.fn((path: string, ...handlers: any[]) => {
        routeHandlers.set(`GET ${path}`, handlers);
      }),
      post: jest.fn((path: string, ...handlers: any[]) => {
        routeHandlers.set(`POST ${path}`, handlers);
      }),
      put: jest.fn((path: string, ...handlers: any[]) => {
        routeHandlers.set(`PUT ${path}`, handlers);
      }),
      patch: jest.fn((path: string, ...handlers: any[]) => {
        routeHandlers.set(`PATCH ${path}`, handlers);
      }),
    };

    (Router as unknown as jest.Mock) = jest.fn(() => mockRouter);

    mockController = {
      create: jest.fn(),
      update: jest.fn(),
      addService: jest.fn(),
      activate: jest.fn(),
      desactivate: jest.fn(),
      getAll: jest.fn(),
      getById: jest.fn(),
      getStats: jest.fn(),
      updateService: jest.fn(),
    } as any;

    (container.get as jest.Mock).mockReturnValue(mockController);
  });

  it('should retrieve InstitutionController from DI container', () => {
    InstitutionRoutes();

    expect(container.get).toHaveBeenCalledWith(TYPES.InstitutionController);
  });

  it('should register GET /stats before parameterized GET routes', () => {
    InstitutionRoutes();

    expect(mockRouter.get.mock.calls[0][0]).toBe('/stats');
    expect(mockRouter.get.mock.calls[1][0]).toBe('/');
    expect(mockRouter.get.mock.calls[2][0]).toBe('/:id');
  });

  it('should bind GET /stats to controller.getStats', () => {
    InstitutionRoutes();

    const handlers = routeHandlers.get('GET /stats');
    expect(handlers).toHaveLength(1);

    const mockReq = {} as any;
    const mockRes = {} as any;
    const mockNext = jest.fn();
    handlers[0](mockReq, mockRes, mockNext);

    expect(mockController.getStats).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
  });

  it('should register GET / with pagination middleware', () => {
    InstitutionRoutes();

    expect(mockRouter.get).toHaveBeenCalledWith(
      '/',
      validatePagination,
      handleValidationErrors,
      expect.any(Function)
    );
  });

  it('should register GET /:id with institution id middleware', () => {
    InstitutionRoutes();

    expect(mockRouter.get).toHaveBeenCalledWith(
      '/:id',
      validateInstitutionId,
      handleValidationErrors,
      expect.any(Function)
    );
  });

  it('should register POST / with create validators', () => {
    InstitutionRoutes();

    expect(mockRouter.post).toHaveBeenCalledWith(
      '/',
      validateCreateInstitution,
      handleValidationErrors,
      expect.any(Function)
    );
  });

  it('should register PUT /:id with update validators', () => {
    InstitutionRoutes();

    expect(mockRouter.put).toHaveBeenCalledWith(
      '/:id',
      validateUpdateInstitution,
      handleValidationErrors,
      expect.any(Function)
    );
  });

  it('should register PUT /:id/services with add service validators', () => {
    InstitutionRoutes();

    expect(mockRouter.put).toHaveBeenCalledWith(
      '/:id/services',
      validateAddService,
      handleValidationErrors,
      expect.any(Function)
    );
  });

  it('should register PUT /:institutionId/services/:serviceId with patch validators', () => {
    InstitutionRoutes();

    expect(mockRouter.put).toHaveBeenCalledWith(
      '/:institutionId/services/:serviceId',
      validatePatchService,
      handleValidationErrors,
      expect.any(Function)
    );
  });

  it('should register activation and deactivation routes', () => {
    InstitutionRoutes();

    expect(mockRouter.patch).toHaveBeenCalledWith(
      '/:id/activate',
      validateInstitutionId,
      handleValidationErrors,
      expect.any(Function)
    );
    expect(mockRouter.patch).toHaveBeenCalledWith(
      '/:id/desactivate',
      validateInstitutionId,
      handleValidationErrors,
      expect.any(Function)
    );
  });
});
