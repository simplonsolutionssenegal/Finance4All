import { logger, logRequest, logError, loggerStream } from 'backend/src/utils/logger';
import { Request, Response } from 'express';

describe('Logger', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have info, warn, error and debug methods', () => {
    expect(logger.info).toBeInstanceOf(Function);
    expect(logger.warn).toBeInstanceOf(Function);
    expect(logger.error).toBeInstanceOf(Function);
    expect(logger.debug).toBeInstanceOf(Function);
  });

  it('should log a request', () => {
    const req = {
      method: 'GET',
      originalUrl: '/test',
      url: '/test',
      ip: '127.0.0.1',
      get: () => 'test',
    } as unknown as Request;
    const res = { statusCode: 200 } as Response;
    const spy = jest.spyOn(logger, 'info');
    logRequest(req, res, 100);
    expect(spy).toHaveBeenCalled();
  });

  it('should log an error', () => {
    const error = new Error('Test error');
    const spy = jest.spyOn(logger, 'error');
    logError(error);
    expect(spy).toHaveBeenCalled();
  });

  it('should log a message with the stream', () => {
    const spy = jest.spyOn(logger, 'info');
    loggerStream.write('Test message');
    expect(spy).toHaveBeenCalledWith('Test message');
  });
});
