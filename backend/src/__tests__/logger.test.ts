// @ts-nocheck
import { describe, it, expect, jest } from '@jest/globals';
import { logger, logError, logRequest } from '../utils/logger';

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
});
