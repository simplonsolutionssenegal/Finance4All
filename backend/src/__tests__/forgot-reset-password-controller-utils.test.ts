import { describe, it, expect, jest } from '@jest/globals';
import { Response } from 'express';
import { ForgotAndResetPasswordControllerUtils } from '../infrastructure/web/controllers/ControllerUtils';

describe('ForgotAndResetPasswordControllerUtils', () => {
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus as any,
    };
  });

  describe('sendSuccessResponse', () => {
    it('should send success response with correct format', () => {
      const message = 'Success message';
      const data = { success: true, userId: '123' };

      ForgotAndResetPasswordControllerUtils.sendSuccessResponse(mockResponse as Response, message, data);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message,
        data,
      });
    });

    it('should send success response with empty data', () => {
      const message = 'Success message';
      const data = {};

      ForgotAndResetPasswordControllerUtils.sendSuccessResponse(mockResponse as Response, message, data);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message,
        data,
      });
    });
  });

  describe('sendErrorResponse', () => {
    it('should send error response with Error message', () => {
      const error = new Error('Test error message');

      ForgotAndResetPasswordControllerUtils.sendErrorResponse(mockResponse as Response, error);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Test error message',
        data: { success: false },
      });
    });

    it('should send error response with unknown error', () => {
      const error = 'String error';

      ForgotAndResetPasswordControllerUtils.sendErrorResponse(mockResponse as Response, error);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Erreur inconnue',
        data: { success: false },
      });
    });

    it('should send error response with null error', () => {
      ForgotAndResetPasswordControllerUtils.sendErrorResponse(mockResponse as Response, null);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Erreur inconnue',
        data: { success: false },
      });
    });

    it('should send error response with undefined error', () => {
      ForgotAndResetPasswordControllerUtils.sendErrorResponse(mockResponse as Response, undefined);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Erreur inconnue',
        data: { success: false },
      });
    });
  });
});
