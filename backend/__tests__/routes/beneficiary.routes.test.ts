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
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getDashboard: jest.fn(),
      getStats: jest.fn(),
      selfRegister: jest.fn(),
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

  describe('GET / route', () => {
    it('should register GET / route', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      expect(mockRouter.get).toHaveBeenCalledWith('/', requireSameActiveOrg, expect.any(Function));
    });

    it('should use correct middleware order for GET /', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const handlers = routeHandlers.get('GET /');
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(requireSameActiveOrg);
      expect(typeof handlers[1]).toBe('function');
    });

    it('should bind controller.list method correctly', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const handlers = routeHandlers.get('GET /');
      const listHandler = handlers[1];

      // Verify it's a bound function by checking if it calls the controller method
      const mockReq = {} as any;
      const mockRes = {} as any;
      const mockNext = jest.fn();

      listHandler(mockReq, mockRes, mockNext);

      expect(mockController.list).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });

    it('should have correct context binding for list handler', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const handlers = routeHandlers.get('GET /');
      const listHandler = handlers[1];

      // Call handler multiple times to ensure binding is consistent
      const mockReq1 = { query: { organizationId: 'org-1' } } as any;
      const mockRes1 = {} as any;
      const mockNext1 = jest.fn();

      listHandler(mockReq1, mockRes1, mockNext1);
      expect(mockController.list).toHaveBeenCalledTimes(1);
      expect(mockController.list).toHaveBeenCalledWith(mockReq1, mockRes1, mockNext1);

      const mockReq2 = { query: { organizationId: 'org-2' } } as any;
      const mockRes2 = {} as any;
      const mockNext2 = jest.fn();

      listHandler(mockReq2, mockRes2, mockNext2);
      expect(mockController.list).toHaveBeenCalledTimes(2);
      expect(mockController.list).toHaveBeenCalledWith(mockReq2, mockRes2, mockNext2);
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

  describe('DELETE /:beneficiaryId route', () => {
    it('should register DELETE /:beneficiaryId route', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      expect(mockRouter.delete).toHaveBeenCalledWith(
        '/:beneficiaryId',
        requireSameActiveOrg,
        expect.any(Function)
      );
    });

    it('should use correct middleware order for DELETE /:beneficiaryId', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const handlers = routeHandlers.get('DELETE /:beneficiaryId');
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(requireSameActiveOrg);
      expect(typeof handlers[1]).toBe('function');
    });

    it('should NOT use handleValidationErrors middleware for DELETE', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const handlers = routeHandlers.get('DELETE /:beneficiaryId');
      expect(handlers).toHaveLength(2);
      expect(handlers[1]).not.toBe(handleValidationErrors);
    });

    it('should bind controller.delete method correctly', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const handlers = routeHandlers.get('DELETE /:beneficiaryId');
      const deleteHandler = handlers[1];

      // Verify it's a bound function by checking if it calls the controller method
      const mockReq = { params: { beneficiaryId: '123' } } as any;
      const mockRes = {} as any;
      const mockNext = jest.fn();

      deleteHandler(mockReq, mockRes, mockNext);

      expect(mockController.delete).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });

    it('should have correct context binding for delete handler', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const handlers = routeHandlers.get('DELETE /:beneficiaryId');
      const deleteHandler = handlers[1];

      // Call handler multiple times to ensure binding is consistent
      const mockReq1 = {
        params: { beneficiaryId: '123' },
        body: { organizationId: 'org-1' },
      } as any;
      const mockRes1 = {} as any;
      const mockNext1 = jest.fn();

      deleteHandler(mockReq1, mockRes1, mockNext1);
      expect(mockController.delete).toHaveBeenCalledTimes(1);
      expect(mockController.delete).toHaveBeenCalledWith(mockReq1, mockRes1, mockNext1);

      const mockReq2 = {
        params: { beneficiaryId: '456' },
        body: { organizationId: 'org-2' },
      } as any;
      const mockRes2 = {} as any;
      const mockNext2 = jest.fn();

      deleteHandler(mockReq2, mockRes2, mockNext2);
      expect(mockController.delete).toHaveBeenCalledTimes(2);
      expect(mockController.delete).toHaveBeenCalledWith(mockReq2, mockRes2, mockNext2);
    });
  });

  describe('Route configuration', () => {
    it('should register exactly 7 routes', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      expect(mockRouter.get).toHaveBeenCalledTimes(3);
      expect(mockRouter.post).toHaveBeenCalledTimes(2);
      expect(mockRouter.patch).toHaveBeenCalledTimes(1);
      expect(mockRouter.delete).toHaveBeenCalledTimes(1);
    });

    it('should use requireSameActiveOrg middleware on all routes', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const getHandlers = routeHandlers.get('GET /');
      const postHandlers = routeHandlers.get('POST /');
      const patchHandlers = routeHandlers.get('PATCH /:beneficiaryId');
      const deleteHandlers = routeHandlers.get('DELETE /:beneficiaryId');

      expect(getHandlers[0]).toBe(requireSameActiveOrg);
      expect(postHandlers[0]).toBe(requireSameActiveOrg);
      expect(patchHandlers[0]).toBe(requireSameActiveOrg);
      expect(deleteHandlers[0]).toBe(requireSameActiveOrg);
    });

    it('should use handleValidationErrors middleware on POST and PATCH routes only', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const getHandlers = routeHandlers.get('GET /');
      const postHandlers = routeHandlers.get('POST /');
      const patchHandlers = routeHandlers.get('PATCH /:beneficiaryId');
      const deleteHandlers = routeHandlers.get('DELETE /:beneficiaryId');

      // GET and DELETE routes should not have handleValidationErrors
      expect(getHandlers[1]).not.toBe(handleValidationErrors);
      expect(deleteHandlers[1]).not.toBe(handleValidationErrors);
      // POST and PATCH routes should have handleValidationErrors
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
    it('should create bound controller with list, create, update and delete methods', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const getHandlers = routeHandlers.get('GET /');
      const postHandlers = routeHandlers.get('POST /');
      const patchHandlers = routeHandlers.get('PATCH /:beneficiaryId');
      const deleteHandlers = routeHandlers.get('DELETE /:beneficiaryId');

      expect(typeof getHandlers[1]).toBe('function');
      expect(typeof postHandlers[2]).toBe('function');
      expect(typeof patchHandlers[2]).toBe('function');
      expect(typeof deleteHandlers[1]).toBe('function');
    });

    it('should maintain separate bound instances for each method', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const getHandlers = routeHandlers.get('GET /');
      const postHandlers = routeHandlers.get('POST /');
      const patchHandlers = routeHandlers.get('PATCH /:beneficiaryId');
      const deleteHandlers = routeHandlers.get('DELETE /:beneficiaryId');

      const listHandler = getHandlers[1];
      const createHandler = postHandlers[2];
      const updateHandler = patchHandlers[2];
      const deleteHandler = deleteHandlers[1];

      expect(listHandler).not.toBe(createHandler);
      expect(createHandler).not.toBe(updateHandler);
      expect(listHandler).not.toBe(updateHandler);
      expect(deleteHandler).not.toBe(listHandler);
      expect(deleteHandler).not.toBe(createHandler);
      expect(deleteHandler).not.toBe(updateHandler);
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
      const controller1Mock = {
        list: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        getDashboard: jest.fn(),
        getStats: jest.fn(),
        selfRegister: jest.fn(),
      };
      (container.get as jest.Mock).mockReturnValue(controller1Mock);

      // Act
      beneficiaryRoutes();

      // Assert
      const getHandlers = routeHandlers.get('GET /');
      const postHandlers = routeHandlers.get('POST /');
      const patchHandlers = routeHandlers.get('PATCH /:beneficiaryId');
      const deleteHandlers = routeHandlers.get('DELETE /:beneficiaryId');

      getHandlers[1]({} as any, {} as any, jest.fn());
      postHandlers[2]({} as any, {} as any, jest.fn());
      patchHandlers[2]({} as any, {} as any, jest.fn());
      deleteHandlers[1]({} as any, {} as any, jest.fn());

      expect(controller1Mock.list).toHaveBeenCalledTimes(1);
      expect(controller1Mock.create).toHaveBeenCalledTimes(1);
      expect(controller1Mock.update).toHaveBeenCalledTimes(1);
      expect(controller1Mock.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple router instances independently', () => {
      // Arrange
      const controller1Mock = {
        list: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        getDashboard: jest.fn(),
        getStats: jest.fn(),
        selfRegister: jest.fn(),
      };
      const controller2Mock = {
        list: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        getDashboard: jest.fn(),
        getStats: jest.fn(),
        selfRegister: jest.fn(),
      };

      // Create first router
      (container.get as jest.Mock).mockReturnValueOnce(controller1Mock);
      const router1 = beneficiaryRoutes();

      // Create second router with fresh mocks
      const mockRouter2 = {
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

      (Router as unknown as jest.Mock).mockReturnValueOnce(mockRouter2);
      (container.get as jest.Mock).mockReturnValueOnce(controller2Mock);
      const router2 = beneficiaryRoutes();

      // Assert
      expect(router1).toBe(mockRouter);
      expect(router2).toBe(mockRouter2);
      expect(router1).not.toBe(router2);
      expect(container.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Route paths', () => {
    it('should use root path for GET list route', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      expect(mockRouter.get).toHaveBeenCalledWith('/', expect.anything(), expect.anything());
    });

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

    it('should use parameterized path for DELETE delete route', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      expect(mockRouter.delete).toHaveBeenCalledWith(
        '/:beneficiaryId',
        expect.anything(),
        expect.anything()
      );
    });

    it('should use same path parameter for PATCH and DELETE', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const patchCall = mockRouter.patch.mock.calls[0];
      const deleteCall = mockRouter.delete.mock.calls[0];
      expect(patchCall[0]).toBe('/:beneficiaryId');
      expect(deleteCall[0]).toBe('/:beneficiaryId');
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
    it('should ensure middleware executes in correct order for GET /', () => {
      // Act
      beneficiaryRoutes();

      // Assert - GET / is the 3rd GET route registered (after /stats and /dashboard)
      const callArgs = mockRouter.get.mock.calls[2];
      expect(callArgs[0]).toBe('/');
      expect(callArgs[1]).toBe(requireSameActiveOrg);
      expect(typeof callArgs[2]).toBe('function');
    });

    it('should ensure middleware executes in correct order for POST /', () => {
      // Act
      beneficiaryRoutes();

      // Assert - POST / is the 2nd POST route registered (after /self-register)
      const callArgs = mockRouter.post.mock.calls[1];
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

    it('should ensure middleware executes in correct order for DELETE /:beneficiaryId', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const callArgs = mockRouter.delete.mock.calls[0];
      expect(callArgs[0]).toBe('/:beneficiaryId');
      expect(callArgs[1]).toBe(requireSameActiveOrg);
      expect(typeof callArgs[2]).toBe('function');
    });

    it('should have fewer middlewares on DELETE than on PATCH', () => {
      // Act
      beneficiaryRoutes();

      // Assert
      const patchArgs = mockRouter.patch.mock.calls[0];
      const deleteArgs = mockRouter.delete.mock.calls[0];

      // PATCH has: path, requireSameActiveOrg, handleValidationErrors, handler (4 args)
      // DELETE has: path, requireSameActiveOrg, handler (3 args)
      expect(patchArgs.length).toBe(4);
      expect(deleteArgs.length).toBe(3);
    });
  });
});
