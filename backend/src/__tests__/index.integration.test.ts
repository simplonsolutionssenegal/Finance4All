// @ts-nocheck
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock express first
const mockApp = {
  use: jest.fn(),
  listen: jest.fn((port, callback) => {
    setTimeout(() => callback && callback(), 10);
    return { close: jest.fn() };
  }),
  get: jest.fn(),
};

const mockExpress = jest.fn(() => mockApp);
mockExpress.json = jest.fn(() => jest.fn());
mockExpress.urlencoded = jest.fn(() => jest.fn());

// Mock logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

// Mock all dependencies before requiring the module
jest.mock('express', () => mockExpress);
jest.mock('cors', () => jest.fn(() => jest.fn()));
jest.mock('helmet', () => jest.fn(() => jest.fn()));
jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('@/utils/logger', () => ({ logger: mockLogger }));
jest.mock('@/infrastructure/web/middleware/error.middleware', () => ({
  errorMiddleware: jest.fn(),
}));
jest.mock('@/routes', () => ({ apiRoutes: jest.fn() }));
jest.mock('@/infrastructure/config/swagger', () => ({
  setupSwagger: jest.fn(),
}));
jest.mock('@clerk/express', () => ({
  clerkMiddleware: jest.fn(() => jest.fn()),
}));

describe('Index.ts Integration Tests', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let originalExit: typeof process.exit;
  let originalOn: typeof process.on;
  let processSignalHandlers: Map<string, Function>;

  beforeEach(() => {
    jest.clearAllMocks();
    originalEnv = { ...process.env };
    originalExit = process.exit;
    originalOn = process.on;
    processSignalHandlers = new Map();
    
    // Mock process.exit to prevent actual exit
    process.exit = jest.fn() as any;
    
    // Mock process.on to capture signal handlers
    process.on = jest.fn((signal: string, handler: Function) => {
      processSignalHandlers.set(signal, handler);
      return process as any;
    });
    
    // Reset mock app listen to default behavior
    mockApp.listen = jest.fn((port, callback) => {
      setTimeout(() => callback && callback(), 10);
      return { close: jest.fn() };
    });
    
    // Clean module cache to allow fresh imports
    Object.keys(require.cache).forEach(key => {
      if (key.includes('index.ts') || key.includes('index.js')) {
        delete require.cache[key];
      }
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    process.exit = originalExit;
    process.on = originalOn;
  });

  describe('Development Environment', () => {
    it('should register development logging middleware when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';
      
      // Require the module to execute it
      require('../index');
      
      // Wait for async operations
      return new Promise(resolve => {
        setTimeout(() => {
          // Check if development middleware was registered
          const middlewareCalls = mockApp.use.mock.calls;
          const devMiddleware = middlewareCalls.find(call => 
            typeof call[0] === 'function' && call[0].length === 3
          );
          
          expect(devMiddleware).toBeDefined();
          
          if (devMiddleware) {
            // Test the middleware function
            const middleware = devMiddleware[0];
            const mockReq = {
              method: 'GET',
              url: '/test',
              body: { test: 'data' },
              query: { param: 'value' },
              params: { id: '123' },
            };
            const mockRes = {};
            const mockNext = jest.fn();

            middleware(mockReq, mockRes, mockNext);

            expect(mockLogger.info).toHaveBeenCalledWith(
              'GET /test',
              expect.objectContaining({
                body: { test: 'data' },
                query: { param: 'value' },
                params: { id: '123' },
              })
            );
            expect(mockNext).toHaveBeenCalled();
          }
          
          resolve(undefined);
        }, 50);
      });
    });
  });

  describe('Signal Handlers', () => {
    it('should register and execute SIGINT handler', async () => {
      // Test the concept by checking the handler registration pattern
      const mockProcessOn = jest.fn();
      process.on = mockProcessOn;
      
      // Import the module dynamically to trigger signal handler registration
      jest.isolateModules(() => {
        require('../index');
      });
      
      // Check if SIGINT handler was registered
      expect(mockProcessOn).toHaveBeenCalledWith('SIGINT', expect.any(Function));
      
      // Simulate SIGINT signal by calling the handler directly
      const sigintCalls = mockProcessOn.mock.calls.find(call => call[0] === 'SIGINT');
      if (sigintCalls) {
        const sigintHandler = sigintCalls[1];
        sigintHandler();
        
        expect(mockLogger.info).toHaveBeenCalledWith('Received SIGINT, shutting down gracefully');
        expect(process.exit).toHaveBeenCalledWith(0);
      }
    });

    it('should register and execute SIGTERM handler', async () => {
      // Test the concept by checking the handler registration pattern
      const mockProcessOn = jest.fn();
      process.on = mockProcessOn;
      
      // Import the module dynamically to trigger signal handler registration
      jest.isolateModules(() => {
        require('../index');
      });
      
      // Check if SIGTERM handler was registered
      expect(mockProcessOn).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
      
      // Simulate SIGTERM signal by calling the handler directly
      const sigtermCalls = mockProcessOn.mock.calls.find(call => call[0] === 'SIGTERM');
      if (sigtermCalls) {
        const sigtermHandler = sigtermCalls[1];
        sigtermHandler();
        
        expect(mockLogger.info).toHaveBeenCalledWith('Received SIGTERM, shutting down gracefully');
        expect(process.exit).toHaveBeenCalledWith(0);
      }
    });
  });

  describe('Server Startup', () => {
    it('should execute startServer function and log startup messages', async () => {
      process.env.NODE_ENV = 'test';
      process.env.PORT = '3000';
      
      // Clear mocks before testing
      jest.clearAllMocks();
      
      // Import the module in isolation to trigger server startup
      jest.isolateModules(() => {
        require('../index');
      });
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check that app.listen was called with correct port
      expect(mockApp.listen).toHaveBeenCalledWith('3000', expect.any(Function));
      
      // Simulate successful server start by calling the callback
      const listenCall = (mockApp.listen as jest.Mock).mock.calls[0];
      if (listenCall && listenCall[1]) {
        listenCall[1](); // Execute the callback
      }
      
      // Wait for the callback execution
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(mockLogger.info).toHaveBeenCalledWith('Server is running on port 3000');
      expect(mockLogger.info).toHaveBeenCalledWith('Environment: test');
      expect(mockLogger.info).toHaveBeenCalledWith('Health check: http://localhost:3000/health');
    });

    it('should handle server startup errors', async () => {
      // Mock app.listen to throw an error
      mockApp.listen = jest.fn(() => {
        throw new Error('Failed to bind port');
      });
      
      // Clear mocks
      jest.clearAllMocks();
      
      // Import the module in isolation
      jest.isolateModules(() => {
        require('../index');
      });
      
      // Wait for error handling
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to start server', expect.objectContaining({
        error: expect.any(Error)
      }));
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('Environment Variable Defaults', () => {
    it('should use default values when environment variables are not set', async () => {
      delete process.env.PORT;
      delete process.env.API_VERSION;
      delete process.env.CORS_ORIGIN;
      delete process.env.NODE_ENV;
      
      // Clear mocks
      jest.clearAllMocks();
      
      // Import the module in isolation
      jest.isolateModules(() => {
        require('../index');
      });
      
      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check that app.listen was called with default port 5000
      expect(mockApp.listen).toHaveBeenCalledWith(5000, expect.any(Function));
    });
  });
});
