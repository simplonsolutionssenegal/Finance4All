import { logger, logRequest, logError, loggerStream } from '@/infrastructure/utils/logger';
import type { Request, Response } from 'express';

describe('Logger', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have info, warn, error and debug methods', () => {
    expect(logger.info).toBeInstanceOf(Function);
    expect(logger.warn).toBeInstanceOf(Function);
    expect(logger.error).toBeInstanceOf(Function);
    expect(logger.debug).toBeInstanceOf(Function);
  });

  describe('logRequest', () => {
    it('should log a request with originalUrl', () => {
      const req = {
        method: 'GET',
        originalUrl: '/test',
        url: '/test',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test'),
      } as unknown as Request;
      const res = { statusCode: 200 } as Response;
      const spy = jest.spyOn(logger, 'info');

      logRequest(req, res, 100);

      expect(spy).toHaveBeenCalledWith('Request processed', {
        method: 'GET',
        url: '/test',
        statusCode: 200,
        responseTime: '100ms',
        userAgent: 'test',
        ip: '127.0.0.1',
      });
    });

    it('should log a request without originalUrl', () => {
      const req = {
        method: 'POST',
        url: '/api/test',
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Mozilla/5.0'),
      } as unknown as Request;
      const res = { statusCode: 201 } as Response;
      const spy = jest.spyOn(logger, 'info');

      logRequest(req, res, 250);

      expect(spy).toHaveBeenCalledWith('Request processed', {
        method: 'POST',
        url: '/api/test',
        statusCode: 201,
        responseTime: '250ms',
        userAgent: 'Mozilla/5.0',
        ip: '192.168.1.1',
      });
    });

    it('should handle missing User-Agent header', () => {
      const req = {
        method: 'GET',
        originalUrl: '/test',
        url: '/test',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as Request;
      const res = { statusCode: 200 } as Response;
      const spy = jest.spyOn(logger, 'info');

      logRequest(req, res, 100);

      expect(spy).toHaveBeenCalledWith('Request processed', {
        method: 'GET',
        url: '/test',
        statusCode: 200,
        responseTime: '100ms',
        userAgent: undefined,
        ip: '127.0.0.1',
      });
    });
  });

  describe('logError', () => {
    it('should log an error without request', () => {
      const error = new Error('Test error');
      const spy = jest.spyOn(logger, 'error');

      logError(error);

      expect(spy).toHaveBeenCalledWith('Application error', {
        message: 'Test error',
        stack: expect.stringContaining('Error: Test error'),
        url: undefined,
        method: undefined,
        body: undefined,
        params: undefined,
        query: undefined,
      });
    });

    it('should log an error with request containing originalUrl', () => {
      const error = new Error('Test error');
      const req = {
        method: 'POST',
        originalUrl: '/api/test',
        url: '/api/test',
        body: { test: 'data' },
        params: { id: '123' },
        query: { filter: 'active' },
      } as unknown as Request;
      const spy = jest.spyOn(logger, 'error');

      logError(error, req);

      expect(spy).toHaveBeenCalledWith('Application error', {
        message: 'Test error',
        stack: expect.stringContaining('Error: Test error'),
        url: '/api/test',
        method: 'POST',
        body: '{"test":"data"}',
        params: { id: '123' },
        query: { filter: 'active' },
      });
    });

    it('should log an error with request containing only url', () => {
      const error = new Error('Test error');
      const req = {
        method: 'GET',
        url: '/test',
        body: null,
        params: undefined,
        query: {},
      } as unknown as Request;
      const spy = jest.spyOn(logger, 'error');

      logError(error, req);

      expect(spy).toHaveBeenCalledWith('Application error', {
        message: 'Test error',
        stack: expect.stringContaining('Error: Test error'),
        url: '/test',
        method: 'GET',
        body: undefined,
        params: undefined,
        query: {},
      });
    });

    it('should handle request with complex body object', () => {
      const error = new Error('Test error');
      const complexBody = {
        user: { id: 1, name: 'John' },
        settings: { theme: 'dark', notifications: true },
        data: [1, 2, 3],
      };
      const req = {
        method: 'PUT',
        originalUrl: '/api/update',
        body: complexBody,
      } as unknown as Request;
      const spy = jest.spyOn(logger, 'error');

      logError(error, req);

      expect(spy).toHaveBeenCalledWith('Application error', {
        message: 'Test error',
        stack: expect.stringContaining('Error: Test error'),
        url: '/api/update',
        method: 'PUT',
        body: JSON.stringify(complexBody),
        params: undefined,
        query: undefined,
      });
    });

    it('should handle request without body', () => {
      const error = new Error('Test error');
      const req = {
        method: 'DELETE',
        originalUrl: '/api/delete/123',
        params: { id: '123' },
      } as unknown as Request;
      const spy = jest.spyOn(logger, 'error');

      logError(error, req);

      expect(spy).toHaveBeenCalledWith('Application error', {
        message: 'Test error',
        stack: expect.stringContaining('Error: Test error'),
        url: '/api/delete/123',
        method: 'DELETE',
        body: undefined,
        params: { id: '123' },
        query: undefined,
      });
    });
  });

  describe('loggerStream', () => {
    it('should log a message with the stream', () => {
      const spy = jest.spyOn(logger, 'info');
      loggerStream.write('Test message');
      expect(spy).toHaveBeenCalledWith('Test message');
    });

    it('should trim whitespace from stream messages', () => {
      const spy = jest.spyOn(logger, 'info');
      loggerStream.write('  Test message with spaces  \n');
      expect(spy).toHaveBeenCalledWith('Test message with spaces');
    });

    it('should handle empty stream messages', () => {
      const spy = jest.spyOn(logger, 'info');
      loggerStream.write('');
      expect(spy).toHaveBeenCalledWith('');
    });

    it('should handle stream messages with only whitespace', () => {
      const spy = jest.spyOn(logger, 'info');
      loggerStream.write('   \n\t  ');
      expect(spy).toHaveBeenCalledWith('');
    });
  });

  describe('logger configuration', () => {
    it('should have correct log level and format', () => {
      expect(logger.level).toBeDefined();
      expect(logger.transports).toBeDefined();
      expect(logger.transports.length).toBeGreaterThan(0);
    });

    it('should not exit on error', () => {
      expect(logger.exitOnError).toBe(false);
    });
  });
});
