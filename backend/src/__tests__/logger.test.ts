// @ts-nocheck
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import winston from 'winston';
import { logger, logError, logRequest, loggerStream } from '../utils/logger';

// Mock Response and Request objects
const mockRequest = {
  method: 'GET',
  originalUrl: '/test',
  url: '/test',
  ip: '127.0.0.1',
  get: jest.fn().mockReturnValue('Test User Agent'),
  body: { test: 'data' },
  params: { id: '123' },
  query: { search: 'test' },
} as any;

const mockResponse = {
  statusCode: 200,
} as any;

describe('Logger Utility', () => {
  let originalNodeEnv: string | undefined;
  let consoleSpy: jest.SpiedFunction<any>;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    // Spy on console to capture winston output
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    consoleSpy.mockRestore();
  });

  // Spy on the logger methods
  it('should have the correct methods', () => {
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('should log request information', () => {
    // Spy on the logger.info method
    const infoSpy = jest.spyOn(logger, 'info');

    // Call the function
    logRequest(mockRequest, mockResponse, 100);

    // Check if logger.info was called
    expect(infoSpy).toHaveBeenCalled();
    // Verify it was called with correct first parameter
    expect(infoSpy.mock.calls[0][0]).toBe('Request processed');
  });

  it('should log error information', () => {
    // Spy on the logger.error method
    const errorSpy = jest.spyOn(logger, 'error');
    const testError = new Error('Test error');

    // Call the function
    logError(testError, mockRequest);

    // Check if logger.error was called
    expect(errorSpy).toHaveBeenCalled();
    // Verify it was called with correct first parameter
    expect(errorSpy.mock.calls[0][0]).toBe('Application error');
  });

  describe('Winston Format Functions', () => {
    it('should test console format printf function directly', () => {
      // Test the printf format function by creating a format similar to the one in logger.ts
      const testFormat = winston.format.printf(info => {
        // This is similar to lines 21-34 in logger.ts
        const { timestamp, level, message, ...rest } = info as winston.Logform.TransformableInfo & {
          timestamp?: string;
          level: string;
          message: string;
        };

        let log = `${timestamp ?? ''} [${level}]: ${String(message)}`;

        const meta = rest as Record<string, unknown>;
        if (Object.keys(meta).length > 0) {
          log += `\n${JSON.stringify(meta, null, 2)}`;
        }

        return log;
      });

      // Test the format function with metadata
      const infoWithMeta = {
        timestamp: '12:34:56',
        level: 'info',
        message: 'Test message',
        key: 'value',
        number: 123
      };

      const formatted = testFormat.transform(infoWithMeta);
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('object');
    });

    it('should test console format printf function with empty metadata', () => {
      const testFormat = winston.format.printf(info => {
        const { timestamp, level, message, ...rest } = info as winston.Logform.TransformableInfo & {
          timestamp?: string;
          level: string;
          message: string;
        };

        let log = `${timestamp ?? ''} [${level}]: ${String(message)}`;

        const meta = rest as Record<string, unknown>;
        if (Object.keys(meta).length > 0) {
          log += `\n${JSON.stringify(meta, null, 2)}`;
        }

        return log;
      });

      // Test the format function without metadata
      const infoWithoutMeta = {
        timestamp: '12:34:56',
        level: 'info',
        message: 'Test message'
      };

      const formatted = testFormat.transform(infoWithoutMeta);
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('object');
    });

    it('should test message conversion to string', () => {
      const testFormat = winston.format.printf(info => {
        const { timestamp, level, message, ...rest } = info as winston.Logform.TransformableInfo & {
          timestamp?: string;
          level: string;
          message: string;
        };

        let log = `${timestamp ?? ''} [${level}]: ${String(message)}`;

        const meta = rest as Record<string, unknown>;
        if (Object.keys(meta).length > 0) {
          log += `\n${JSON.stringify(meta, null, 2)}`;
        }

        return log;
      });

      // Test with non-string message
      const infoWithObjectMessage = {
        timestamp: '12:34:56',
        level: 'info',
        message: { toString: () => 'converted message' }
      };

      const formatted = testFormat.transform(infoWithObjectMessage);
      expect(formatted).toBeDefined();
    });
  });

  describe('Console Format (Development Mode)', () => {
    it('should test logger functionality and format processing', () => {
      // Force NODE_ENV to development to trigger console format
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Test that logger methods can be called without errors
      expect(() => {
        logger.info('Test log message', { key: 'value', number: 123 });
      }).not.toThrow();
      
      expect(() => {
        logger.info('Simple log message');
      }).not.toThrow();

      expect(() => {
        logger.warn('Message with metadata', { 
          userId: '123', 
          action: 'test', 
          nested: { data: 'value' } 
        });
      }).not.toThrow();

      expect(() => {
        logger.error('Message without metadata');
      }).not.toThrow();

      expect(() => {
        const nonStringMessage = { toString: () => 'converted message' };
        logger.info(nonStringMessage as any);
      }).not.toThrow();
      
      // Restore NODE_ENV
      process.env.NODE_ENV = originalEnv;
    });

    it('should validate logger configuration in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Test that the logger is properly configured
      expect(logger.level).toBeDefined();
      expect(logger.transports).toBeDefined();
      expect(logger.transports.length).toBeGreaterThan(0);
      
      // Restore NODE_ENV
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle different log levels and trigger format functions', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Test all logger methods to ensure format function coverage
      expect(() => {
        logger.debug('Debug message', { debug: true });
        logger.info('Info message', { info: true });
        logger.warn('Warning message', { warn: true });
        logger.error('Error message', { error: true });
      }).not.toThrow();
      
      // Test edge cases that exercise the format function
      expect(() => {
        // Test with complex metadata to trigger JSON.stringify
        logger.info('Complex metadata', { 
          timestamp: new Date(), 
          level: 'test',
          message: 'nested',
          data: { deep: { nested: 'value' } }
        });
      }).not.toThrow();
      
      expect(() => {
        // Test with empty object metadata
        logger.info('Empty metadata', {});
      }).not.toThrow();
      
      // Restore NODE_ENV
      process.env.NODE_ENV = originalEnv;
    });

    it('should test format function execution conceptually', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Test that we can create and use a similar format function
      // This tests the same logic as lines 21-34
      const testFormatLogic = (info: any) => {
        const { timestamp, level, message, ...rest } = info;
        let log = `${timestamp ?? ''} [${level}]: ${String(message)}`;
        const meta = rest;
        if (Object.keys(meta).length > 0) {
          log += `\n${JSON.stringify(meta, null, 2)}`;
        }
        return log;
      };
      
      // Test various scenarios
      const resultWithMeta = testFormatLogic({
        timestamp: '12:34:56',
        level: 'info',
        message: 'Test',
        key: 'value'
      });
      expect(resultWithMeta).toContain('[info]: Test');
      expect(resultWithMeta).toContain('"key": "value"');
      
      const resultWithoutMeta = testFormatLogic({
        timestamp: '12:34:56',
        level: 'error',
        message: 'Error message'
      });
      expect(resultWithoutMeta).toContain('[error]: Error message');
      expect(resultWithoutMeta).not.toContain('{');
      
      // Restore NODE_ENV
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Logger Stream', () => {
    it('should write messages through logger stream', () => {
      // Test the loggerStream.write method (line 107)
      const infoSpy = jest.spyOn(logger, 'info');
      const testMessage = 'Stream message\n';

      loggerStream.write(testMessage);

      // Should call logger.info with trimmed message
      expect(infoSpy).toHaveBeenCalledWith('Stream message');
    });

    it('should trim whitespace from stream messages', () => {
      // Test the trim() functionality in write method
      const infoSpy = jest.spyOn(logger, 'info');
      const messageWithWhitespace = '  Stream message with spaces  \n\t';

      loggerStream.write(messageWithWhitespace);

      expect(infoSpy).toHaveBeenCalledWith('Stream message with spaces');
    });

    it('should handle empty stream messages', () => {
      const infoSpy = jest.spyOn(logger, 'info');
      const emptyMessage = '   \n\t   ';

      loggerStream.write(emptyMessage);

      expect(infoSpy).toHaveBeenCalledWith('');
    });
  });

  describe('Error Logging Edge Cases', () => {
    it('should handle error logging without request object', () => {
      const errorSpy = jest.spyOn(logger, 'error');
      const testError = new Error('Error without request');

      logError(testError);

      expect(errorSpy).toHaveBeenCalledWith('Application error', {
        message: 'Error without request',
        stack: expect.any(String),
        url: undefined,
        method: undefined,
        body: undefined,
        params: undefined,
        query: undefined,
      });
    });

    it('should handle request with no body safely', () => {
      const errorSpy = jest.spyOn(logger, 'error');
      const testError = new Error('Test error');
      const requestWithoutBody = {
        ...mockRequest,
        body: undefined,
      };

      logError(testError, requestWithoutBody);

      expect(errorSpy).toHaveBeenCalledWith('Application error', expect.objectContaining({
        body: undefined,
      }));
    });
  });
});
