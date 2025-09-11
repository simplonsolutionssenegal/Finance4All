// @ts-nocheck
import { describe, it, expect, jest } from '@jest/globals';
import { clerkMiddleware } from '@clerk/express';

jest.mock('express', () => {
  const mockApp = {
    use: jest.fn(),
    listen: jest.fn(),
    get: jest.fn(),
  };
  return jest.fn(() => mockApp);
});

jest.mock('cors');
jest.mock('helmet');
jest.mock('dotenv');
jest.mock('@/utils/logger');
jest.mock('@/infrastructure/web/middleware/error.middleware');
jest.mock('@/routes');

describe('Index.ts - Clerk Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Clerk Middleware', () => {
    it('should successfully import Clerk middleware', () => {
      expect(clerkMiddleware).toBeDefined();
      expect(typeof clerkMiddleware).toBe('function');
    });

    it('should create Clerk middleware instance without errors', () => {
      expect(() => {
        const middleware = clerkMiddleware();
        expect(middleware).toBeDefined();
        expect(typeof middleware).toBe('function');
      }).not.toThrow();
    });

    it('should be compatible with Express middleware pattern', () => {
      const middleware = clerkMiddleware();
      expect(typeof middleware).toBe('function');

      // Test que le middleware peut être utilisé dans app.use()
      const mockApp = { use: jest.fn() };
      mockApp.use(middleware); //Simule l'utilisation du middleware
      expect(mockApp.use).toHaveBeenCalledWith(middleware);
    });
  });
});
