import { container, TYPES } from '@/infrastructure/config/container';
import type { BeneficiaryController } from '@/infrastructure/web/controllers/BeneficiaryController';
import { requireSameActiveOrg } from '@/infrastructure/web/middleware/requireOrg.middleware';
import { beneficiaryRoutes } from '@/infrastructure/web/routes/beneficiary.routes';
import { handleValidationErrors } from '@/infrastructure/web/validators/module.validator';
import { Router } from 'express';

// Mock dependencies
jest.mock('@/infrastructure/web/middleware/requireOrg.middleware');
jest.mock('@/infrastructure/web/validators/module.validator');
jest.mock('@/infrastructure/config/container');

describe('beneficiaryRoutes', () => {
  let mockRouter: any;
  let mockController: jest.Mocked<BeneficiaryController>;
  let routeHandlers: Map<string, any>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create a map to store route handlers
    routeHandlers = new Map();

    // Mock Router
    mockRouter = {
      post: jest.fn((path: string, ...handlers: any[]) => {
        routeHandlers.set(`POST ${path}`, handlers);
      }),
      patch: jest.fn((path: string, ...handlers: any[]) => {
        routeHandlers.set(`PATCH ${path}`, handlers);
      }),
      get: jest.fn((path: string, ...handlers: any[]) => {
        routeHandlers.set(`GET ${path}`, handlers);
      }),
      delete: jest.fn((path: string, ...handlers: any[]) => {
        routeHandlers.set(`DELETE ${path}`, handlers);
      }),
    };

    // Mock Express Router
    (Router as unknown as jest.Mock) = jest.fn(() => mockRouter);

    // Mock controller
    mockController = {
      create: jest.fn(),
      update: jest.fn(),
    } as any;

    // Mock container
    (container.get as jest.Mock).mockReturnValue(mockController);
  });

  describe('Router initialization', () => {
    it('should create a new Express Router instance', () => {
      // Act
      const router = beneficiaryRoutes();

      // Assert
      expect(Router).toHaveBeenCalled();
      expect(router).toBe(mockRouter);
    });

    it('should retrieve BeneficiaryController from DI container', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      expect(container.get).toHaveBeenCalledWith(TYPES.BeneficiaryController);
    });
  });

  describe('POST / route', () => {
    it('should register POST / route', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      expect(mockRouter.post).toHaveBeenCalledWith(
        '/',
        requireSameActiveOrg,
        handleValidationErrors,
        expect.any(Function)
      );
    });

    it('should use correct middleware order for POST /', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const handlers = routeHandlers.get('POST /');
      expect(handlers).toHaveLength(3);
      expect(handlers[0]).toBe(requireSameActiveOrg);
      expect(handlers[1]).toBe(handleValidationErrors);
      expect(typeof handlers[2]).toBe('function');
    });

    it('should bind controller.create method correctly', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const handlers = routeHandlers.get('POST /');
      const createHandler = handlers[2];

      // Verify it's a bound function by checking if it calls the controller method
      const mockReq = {} as any;
      const mockRes = {} as any;
      const mockNext = jest.fn();

      createHandler(mockReq, mockRes, mockNext);

      expect(mockController.create).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });

    it('should have correct context binding for create handler', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const handlers = routeHandlers.get('POST /');
      const createHandler = handlers[2];

      // Call handler multiple times to ensure binding is consistent
      const mockReq1 = { body: { name: 'test1' } } as any;
      const mockRes1 = {} as any;
      const mockNext1 = jest.fn();

      createHandler(mockReq1, mockRes1, mockNext1);
      expect(mockController.create).toHaveBeenCalledTimes(1);
      expect(mockController.create).toHaveBeenCalledWith(mockReq1, mockRes1, mockNext1);

      const mockReq2 = { body: { name: 'test2' } } as any;
      const mockRes2 = {} as any;
      const mockNext2 = jest.fn();

      createHandler(mockReq2, mockRes2, mockNext2);
      expect(mockController.create).toHaveBeenCalledTimes(2);
      expect(mockController.create).toHaveBeenCalledWith(mockReq2, mockRes2, mockNext2);
    });
  });

  describe('PATCH /:beneficiaryId route', () => {
    it('should register PATCH /:beneficiaryId route', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      expect(mockRouter.patch).toHaveBeenCalledWith(
        '/:beneficiaryId',
        requireSameActiveOrg,
        handleValidationErrors,
        expect.any(Function)
      );
    });

    it('should use correct middleware order for PATCH /:beneficiaryId', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const handlers = routeHandlers.get('PATCH /:beneficiaryId');
      expect(handlers).toHaveLength(3);
      expect(handlers[0]).toBe(requireSameActiveOrg);
      expect(handlers[1]).toBe(handleValidationErrors);
      expect(typeof handlers[2]).toBe('function');
    });

    it('should bind controller.update method correctly', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const handlers = routeHandlers.get('PATCH /:beneficiaryId');
      const updateHandler = handlers[2];

      // Verify it's a bound function by checking if it calls the controller method
      const mockReq = { params: { beneficiaryId: '123' } } as any;
      const mockRes = {} as any;
      const mockNext = jest.fn();

      updateHandler(mockReq, mockRes, mockNext);

      expect(mockController.update).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });

    it('should have correct context binding for update handler', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const handlers = routeHandlers.get('PATCH /:beneficiaryId');
      const updateHandler = handlers[2];

      // Call handler multiple times to ensure binding is consistent
      const mockReq1 = { params: { beneficiaryId: '123' }, body: { status: 'active' } } as any;
      const mockRes1 = {} as any;
      const mockNext1 = jest.fn();

      updateHandler(mockReq1, mockRes1, mockNext1);
      expect(mockController.update).toHaveBeenCalledTimes(1);
      expect(mockController.update).toHaveBeenCalledWith(mockReq1, mockRes1, mockNext1);

      const mockReq2 = { params: { beneficiaryId: '456' }, body: { status: 'inactive' } } as any;
      const mockRes2 = {} as any;
      const mockNext2 = jest.fn();

      updateHandler(mockReq2, mockRes2, mockNext2);
      expect(mockController.update).toHaveBeenCalledTimes(2);
      expect(mockController.update).toHaveBeenCalledWith(mockReq2, mockRes2, mockNext2);
    });
  });

  describe('Route configuration', () => {
    it('should register exactly 2 routes', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      expect(mockRouter.post).toHaveBeenCalledTimes(1);
      expect(mockRouter.patch).toHaveBeenCalledTimes(1);
      expect(mockRouter.get).not.toHaveBeenCalled();
      expect(mockRouter.delete).not.toHaveBeenCalled();
    });

    it('should use requireSameActiveOrg middleware on all routes', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const postHandlers = routeHandlers.get('POST /');
      const patchHandlers = routeHandlers.get('PATCH /:beneficiaryId');

      expect(postHandlers[0]).toBe(requireSameActiveOrg);
      expect(patchHandlers[0]).toBe(requireSameActiveOrg);
    });

    it('should use handleValidationErrors middleware on all routes', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const postHandlers = routeHandlers.get('POST /');
      const patchHandlers = routeHandlers.get('PATCH /:beneficiaryId');

      expect(postHandlers[1]).toBe(handleValidationErrors);
      expect(patchHandlers[1]).toBe(handleValidationErrors);
    });

    it('should have controller handler as the last middleware on all routes', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const postHandlers = routeHandlers.get('POST /');
      const patchHandlers = routeHandlers.get('PATCH /:beneficiaryId');

      expect(typeof postHandlers[2]).toBe('function');
      expect(typeof patchHandlers[2]).toBe('function');
    });
  });

  describe('Bound controller methods', () => {
    it('should create bound controller with create and update methods', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const postHandlers = routeHandlers.get('POST /');
      const patchHandlers = routeHandlers.get('PATCH /:beneficiaryId');

      expect(typeof postHandlers[2]).toBe('function');
      expect(typeof patchHandlers[2]).toBe('function');
    });

    it('should maintain separate bound instances for each method', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const postHandlers = routeHandlers.get('POST /');
      const patchHandlers = routeHandlers.get('PATCH /:beneficiaryId');

      const createHandler = postHandlers[2];
      const updateHandler = patchHandlers[2];

      expect(createHandler).not.toBe(updateHandler);
    });

    it('should preserve controller method behavior through binding', () => {
      // Arrange
      const createResult = { success: true, data: { id: '123' } };
      mockController.create.mockReturnValue(createResult as any);

      // Act
      beneficiaryRoutes();

      // Assert
      const handlers = routeHandlers.get('POST /');
      const createHandler = handlers[2];

      const result = createHandler({} as any, {} as any, jest.fn());
      expect(result).toBe(createResult);
    });
  });

  describe('Dependency Injection', () => {
    it('should retrieve controller from container only once per routes initialization', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      expect(container.get).toHaveBeenCalledTimes(1);
      expect(container.get).toHaveBeenCalledWith(TYPES.BeneficiaryController);
    });

    it('should use the same controller instance for all routes', () => {
      // Arrange
      const controller1Mock = { create: jest.fn(), update: jest.fn() };
      (container.get as jest.Mock).mockReturnValue(controller1Mock);

      // Act
      beneficiaryRoutes();

      // Assert
      const postHandlers = routeHandlers.get('POST /');
      const patchHandlers = routeHandlers.get('PATCH /:beneficiaryId');

      postHandlers[2]({} as any, {} as any, jest.fn());
      patchHandlers[2]({} as any, {} as any, jest.fn());

      expect(controller1Mock.create).toHaveBeenCalledTimes(1);
      expect(controller1Mock.update).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple router instances independently', () => {
      // Arrange
      const controller1Mock = { create: jest.fn(), update: jest.fn() };
      const controller2Mock = { create: jest.fn(), update: jest.fn() };

      // Act
      (container.get as jest.Mock).mockReturnValueOnce(controller1Mock);
      const router1 = beneficiaryRoutes();

      // Reset route handlers for second router
      routeHandlers.clear();
      mockRouter = {
        post: jest.fn((path: string, ...handlers: any[]) => {
          routeHandlers.set(`POST ${path}`, handlers);
        }),
        patch: jest.fn((path: string, ...handlers: any[]) => {
          routeHandlers.set(`PATCH ${path}`, handlers);
        }),
      };
      (Router as unknown as jest.Mock).mockReturnValue(mockRouter);

      (container.get as jest.Mock).mockReturnValueOnce(controller2Mock);
      const router2 = beneficiaryRoutes();

      // Assert
      expect(router1).not.toBe(router2);
      expect(container.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Route paths', () => {
    it('should use root path for POST create route', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      expect(mockRouter.post).toHaveBeenCalledWith(
        '/',
        expect.anything(),
        expect.anything(),
        expect.anything()
      );
    });

    it('should use parameterized path for PATCH update route', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      expect(mockRouter.patch).toHaveBeenCalledWith(
        '/:beneficiaryId',
        expect.anything(),
        expect.anything(),
        expect.anything()
      );
    });

    it('should use beneficiaryId as path parameter name', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const patchCall = mockRouter.patch.mock.calls[0];
      expect(patchCall[0]).toBe('/:beneficiaryId');
    });
  });

  describe('Error handling', () => {
    it('should propagate controller errors through bound methods', () => {
      // Arrange
      const error = new Error('Controller error');
      mockController.create.mockImplementation(() => {
        throw error;
      });

      // Act
      beneficiaryRoutes();

      // Assert
      const handlers = routeHandlers.get('POST /');
      const createHandler = handlers[2];

      expect(() => createHandler({} as any, {} as any, jest.fn())).toThrow('Controller error');
    });

    it('should handle container.get errors gracefully', () => {
      // Arrange
      const error = new Error('Container error');
      (container.get as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => beneficiaryRoutes()).toThrow('Container error');
    });
  });

  describe('Middleware execution order', () => {
    it('should ensure middleware executes in correct order for POST /', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const callArgs = mockRouter.post.mock.calls[0];
      expect(callArgs[0]).toBe('/');
      expect(callArgs[1]).toBe(requireSameActiveOrg);
      expect(callArgs[2]).toBe(handleValidationErrors);
      expect(typeof callArgs[3]).toBe('function');
    });

    it('should ensure middleware executes in correct order for PATCH /:beneficiaryId', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const callArgs = mockRouter.patch.mock.calls[0];
      expect(callArgs[0]).toBe('/:beneficiaryId');
      expect(callArgs[1]).toBe(requireSameActiveOrg);
      expect(callArgs[2]).toBe(handleValidationErrors);
      expect(typeof callArgs[3]).toBe('function');
    });
  });
});
