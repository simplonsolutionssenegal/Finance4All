import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import {
  validateMediaId,
  validateGetMedias,
  validatePresignedUrl,
  validateUploadMetadata,
  validateTemporaryUpload,
  handleValidationErrors,
  handleMulterError,
  uploadMiddleware,
} from '@/infrastructure/web/validators/media.validator';
import { MediaType } from '@/domain/media/value-objects/MediaType';

// Helper to run validation middleware
const runValidation = async (req: Request, validations: any[]) => {
  await Promise.all(validations.map(validation => validation.run(req)));
  return validationResult(req);
};

describe('Media Validator', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('handleValidationErrors', () => {
    it('should call next() if there are no validation errors', () => {
      mockRequest.body = { metadata: '{}' };
      handleValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 400 with errors if validation fails', async () => {
      mockRequest.params = { id: 'invalid-uuid' };
      await runValidation(mockRequest as Request, validateMediaId);

      handleValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        errors: expect.any(Array),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateMediaId', () => {
    it('should pass with valid UUID', async () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      const errors = await runValidation(mockRequest as Request, validateMediaId);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail if id is missing', async () => {
      mockRequest.params = {};
      const errors = await runValidation(mockRequest as Request, validateMediaId);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'id',
            msg: 'Invalid media ID format',
          }),
        ])
      );
    });

    it('should fail with invalid UUID format', async () => {
      mockRequest.params = { id: 'not-a-uuid' };
      const errors = await runValidation(mockRequest as Request, validateMediaId);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'id',
            msg: 'Invalid media ID format',
          }),
        ])
      );
    });

    it('should fail with numeric id', async () => {
      mockRequest.params = { id: '123' };
      const errors = await runValidation(mockRequest as Request, validateMediaId);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'id',
            msg: 'Invalid media ID format',
          }),
        ])
      );
    });

    it('should fail with empty string', async () => {
      mockRequest.params = { id: '' };
      const errors = await runValidation(mockRequest as Request, validateMediaId);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'id',
            msg: 'Invalid media ID format',
          }),
        ])
      );
    });

    it('should fail with UUID with wrong format (dashes in wrong places)', async () => {
      mockRequest.params = { id: '123e4567e89b-12d3-a456-426614174000' };
      const errors = await runValidation(mockRequest as Request, validateMediaId);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'id',
            msg: 'Invalid media ID format',
          }),
        ])
      );
    });
  });

  describe('validateGetMedias', () => {
    it('should pass with all valid optional parameters', async () => {
      mockRequest.query = {
        page: '1',
        limit: '10',
        type: MediaType.VIDEO,
      };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with no parameters (all optional)', async () => {
      mockRequest.query = {};
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with only page parameter', async () => {
      mockRequest.query = { page: '5' };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with only limit parameter', async () => {
      mockRequest.query = { limit: '50' };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with only type parameter', async () => {
      mockRequest.query = { type: MediaType.PDF };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with VIDEO type', async () => {
      mockRequest.query = { type: MediaType.VIDEO };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with PDF type', async () => {
      mockRequest.query = { type: MediaType.PDF };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with AUDIO type', async () => {
      mockRequest.query = { type: MediaType.AUDIO };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with limit of 1', async () => {
      mockRequest.query = { limit: '1' };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with limit of 100', async () => {
      mockRequest.query = { limit: '100' };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail with page = 0', async () => {
      mockRequest.query = { page: '0' };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'page',
            msg: 'Page must be a positive integer',
          }),
        ])
      );
    });

    it('should fail with negative page', async () => {
      mockRequest.query = { page: '-1' };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'page',
            msg: 'Page must be a positive integer',
          }),
        ])
      );
    });

    it('should fail with non-integer page', async () => {
      mockRequest.query = { page: '1.5' };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'page',
            msg: 'Page must be a positive integer',
          }),
        ])
      );
    });

    it('should fail with limit = 0', async () => {
      mockRequest.query = { limit: '0' };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'limit',
            msg: 'Limit must be between 1 and 100',
          }),
        ])
      );
    });

    it('should fail with limit > 100', async () => {
      mockRequest.query = { limit: '101' };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'limit',
            msg: 'Limit must be between 1 and 100',
          }),
        ])
      );
    });

    it('should fail with negative limit', async () => {
      mockRequest.query = { limit: '-5' };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'limit',
            msg: 'Limit must be between 1 and 100',
          }),
        ])
      );
    });

    it('should fail with non-integer limit', async () => {
      mockRequest.query = { limit: '10.5' };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'limit',
            msg: 'Limit must be between 1 and 100',
          }),
        ])
      );
    });

    it('should fail with invalid type', async () => {
      mockRequest.query = { type: 'INVALID_TYPE' };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'type',
            msg: `Type must be one of: ${Object.values(MediaType).join(', ')}`,
          }),
        ])
      );
    });

    it('should fail with lowercase type', async () => {
      mockRequest.query = { type: 'video' };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'type',
          }),
        ])
      );
    });

    it('should fail with string page', async () => {
      mockRequest.query = { page: 'abc' };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'page',
          }),
        ])
      );
    });

    it('should fail with string limit', async () => {
      mockRequest.query = { limit: 'xyz' };
      const errors = await runValidation(mockRequest as Request, validateGetMedias);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'limit',
          }),
        ])
      );
    });
  });

  describe('validatePresignedUrl', () => {
    it('should pass with valid UUID and no expiresIn', async () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRequest.query = {};
      const errors = await runValidation(mockRequest as Request, validatePresignedUrl);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with valid UUID and valid expiresIn', async () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRequest.query = { expiresIn: '3600' };
      const errors = await runValidation(mockRequest as Request, validatePresignedUrl);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with minimum expiresIn (60 seconds)', async () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRequest.query = { expiresIn: '60' };
      const errors = await runValidation(mockRequest as Request, validatePresignedUrl);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with maximum expiresIn (604800 seconds - 7 days)', async () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRequest.query = { expiresIn: '604800' };
      const errors = await runValidation(mockRequest as Request, validatePresignedUrl);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail with invalid UUID', async () => {
      mockRequest.params = { id: 'invalid-uuid' };
      mockRequest.query = { expiresIn: '3600' };
      const errors = await runValidation(mockRequest as Request, validatePresignedUrl);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'id',
            msg: 'Invalid media ID format',
          }),
        ])
      );
    });

    it('should fail with expiresIn < 60', async () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRequest.query = { expiresIn: '59' };
      const errors = await runValidation(mockRequest as Request, validatePresignedUrl);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'expiresIn',
            msg: 'ExpiresIn must be between 60 and 604800 seconds (1 minute to 7 days)',
          }),
        ])
      );
    });

    it('should fail with expiresIn > 604800', async () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRequest.query = { expiresIn: '604801' };
      const errors = await runValidation(mockRequest as Request, validatePresignedUrl);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'expiresIn',
            msg: 'ExpiresIn must be between 60 and 604800 seconds (1 minute to 7 days)',
          }),
        ])
      );
    });

    it('should fail with negative expiresIn', async () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRequest.query = { expiresIn: '-100' };
      const errors = await runValidation(mockRequest as Request, validatePresignedUrl);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'expiresIn',
          }),
        ])
      );
    });

    it('should fail with non-integer expiresIn', async () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRequest.query = { expiresIn: '3600.5' };
      const errors = await runValidation(mockRequest as Request, validatePresignedUrl);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'expiresIn',
          }),
        ])
      );
    });

    it('should fail with string expiresIn', async () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRequest.query = { expiresIn: 'abc' };
      const errors = await runValidation(mockRequest as Request, validatePresignedUrl);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'expiresIn',
          }),
        ])
      );
    });

    it('should fail with zero expiresIn', async () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRequest.query = { expiresIn: '0' };
      const errors = await runValidation(mockRequest as Request, validatePresignedUrl);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'expiresIn',
          }),
        ])
      );
    });
  });

  describe('validateUploadMetadata', () => {
    it('should pass with valid JSON metadata', async () => {
      mockRequest.body = { metadata: '{"key": "value"}' };
      const errors = await runValidation(mockRequest as Request, validateUploadMetadata);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with empty object metadata', async () => {
      mockRequest.body = { metadata: '{}' };
      const errors = await runValidation(mockRequest as Request, validateUploadMetadata);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with complex nested metadata', async () => {
      mockRequest.body = {
        metadata: JSON.stringify({
          title: 'Video Title',
          description: 'Description',
          tags: ['tag1', 'tag2'],
          nested: { key: 'value' },
        }),
      };
      const errors = await runValidation(mockRequest as Request, validateUploadMetadata);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass without metadata (optional)', async () => {
      mockRequest.body = {};
      const errors = await runValidation(mockRequest as Request, validateUploadMetadata);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with undefined metadata', async () => {
      mockRequest.body = { metadata: undefined };
      const errors = await runValidation(mockRequest as Request, validateUploadMetadata);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with null metadata', async () => {
      mockRequest.body = { metadata: null };
      const errors = await runValidation(mockRequest as Request, validateUploadMetadata);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with empty string metadata', async () => {
      mockRequest.body = { metadata: '' };
      const errors = await runValidation(mockRequest as Request, validateUploadMetadata);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail with invalid JSON', async () => {
      mockRequest.body = { metadata: '{invalid json}' };
      const errors = await runValidation(mockRequest as Request, validateUploadMetadata);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'metadata',
            msg: 'Invalid JSON format for metadata',
          }),
        ])
      );
    });

    it('should fail with array instead of object', async () => {
      mockRequest.body = { metadata: '["array", "items"]' };
      const errors = await runValidation(mockRequest as Request, validateUploadMetadata);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'metadata',
            msg: 'Invalid JSON format for metadata',
          }),
        ])
      );
    });

    it('should fail with string value instead of JSON', async () => {
      mockRequest.body = { metadata: '"just a string"' };
      const errors = await runValidation(mockRequest as Request, validateUploadMetadata);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'metadata',
            msg: 'Invalid JSON format for metadata',
          }),
        ])
      );
    });

    it('should fail with number value instead of JSON', async () => {
      mockRequest.body = { metadata: '123' };
      const errors = await runValidation(mockRequest as Request, validateUploadMetadata);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'metadata',
            msg: 'Invalid JSON format for metadata',
          }),
        ])
      );
    });

    it('should fail with boolean value instead of JSON', async () => {
      mockRequest.body = { metadata: 'true' };
      const errors = await runValidation(mockRequest as Request, validateUploadMetadata);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'metadata',
            msg: 'Invalid JSON format for metadata',
          }),
        ])
      );
    });

    it('should fail with malformed JSON (missing closing brace)', async () => {
      mockRequest.body = { metadata: '{"key": "value"' };
      const errors = await runValidation(mockRequest as Request, validateUploadMetadata);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'metadata',
            msg: 'Invalid JSON format for metadata',
          }),
        ])
      );
    });

    it('should fail with malformed JSON (unquoted keys)', async () => {
      mockRequest.body = { metadata: '{key: "value"}' };
      const errors = await runValidation(mockRequest as Request, validateUploadMetadata);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'metadata',
            msg: 'Invalid JSON format for metadata',
          }),
        ])
      );
    });
  });

  describe('validateTemporaryUpload', () => {
    it('should pass with all valid fields', async () => {
      mockRequest.body = {
        metadata: '{"title": "Temp video"}',
        expiresInHours: 24,
      };
      const errors = await runValidation(mockRequest as Request, validateTemporaryUpload);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass without metadata (optional)', async () => {
      mockRequest.body = { expiresInHours: 12 };
      const errors = await runValidation(mockRequest as Request, validateTemporaryUpload);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass without expiresInHours (optional)', async () => {
      mockRequest.body = { metadata: '{"key": "value"}' };
      const errors = await runValidation(mockRequest as Request, validateTemporaryUpload);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with both fields missing (both optional)', async () => {
      mockRequest.body = {};
      const errors = await runValidation(mockRequest as Request, validateTemporaryUpload);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with minimum expiresInHours (1)', async () => {
      mockRequest.body = { expiresInHours: 1 };
      const errors = await runValidation(mockRequest as Request, validateTemporaryUpload);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with maximum expiresInHours (168 - 1 week)', async () => {
      mockRequest.body = { expiresInHours: 168 };
      const errors = await runValidation(mockRequest as Request, validateTemporaryUpload);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with valid metadata as empty object', async () => {
      mockRequest.body = { metadata: '{}', expiresInHours: 48 };
      const errors = await runValidation(mockRequest as Request, validateTemporaryUpload);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with empty string metadata', async () => {
      mockRequest.body = { metadata: '', expiresInHours: 72 };
      const errors = await runValidation(mockRequest as Request, validateTemporaryUpload);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail with expiresInHours < 1', async () => {
      mockRequest.body = { expiresInHours: 0 };
      const errors = await runValidation(mockRequest as Request, validateTemporaryUpload);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'expiresInHours',
            msg: 'expiresInHours must be between 1 and 168 hours (1 week max)',
          }),
        ])
      );
    });

    it('should fail with expiresInHours > 168', async () => {
      mockRequest.body = { expiresInHours: 169 };
      const errors = await runValidation(mockRequest as Request, validateTemporaryUpload);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'expiresInHours',
            msg: 'expiresInHours must be between 1 and 168 hours (1 week max)',
          }),
        ])
      );
    });

    it('should fail with negative expiresInHours', async () => {
      mockRequest.body = { expiresInHours: -5 };
      const errors = await runValidation(mockRequest as Request, validateTemporaryUpload);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'expiresInHours',
          }),
        ])
      );
    });

    it('should fail with non-integer expiresInHours', async () => {
      mockRequest.body = { expiresInHours: 24.5 };
      const errors = await runValidation(mockRequest as Request, validateTemporaryUpload);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'expiresInHours',
          }),
        ])
      );
    });

    it('should fail with string expiresInHours', async () => {
      mockRequest.body = { expiresInHours: 'twenty-four' };
      const errors = await runValidation(mockRequest as Request, validateTemporaryUpload);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'expiresInHours',
          }),
        ])
      );
    });

    it('should fail with invalid JSON metadata', async () => {
      mockRequest.body = { metadata: '{invalid}', expiresInHours: 24 };
      const errors = await runValidation(mockRequest as Request, validateTemporaryUpload);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'metadata',
            msg: 'Invalid JSON format for metadata',
          }),
        ])
      );
    });

    it('should fail with array metadata', async () => {
      mockRequest.body = { metadata: '[]', expiresInHours: 24 };
      const errors = await runValidation(mockRequest as Request, validateTemporaryUpload);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'metadata',
            msg: 'Invalid JSON format for metadata',
          }),
        ])
      );
    });

    it('should fail with both invalid metadata and invalid expiresInHours', async () => {
      mockRequest.body = { metadata: '[invalid]', expiresInHours: 200 };
      const errors = await runValidation(mockRequest as Request, validateTemporaryUpload);
      expect(errors.array().length).toBeGreaterThanOrEqual(2);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'metadata' }),
          expect.objectContaining({ path: 'expiresInHours' }),
        ])
      );
    });
  });

  describe('handleMulterError', () => {
    it('should return 400 for LIMIT_FILE_SIZE error', () => {
      const multerError = new Error('File too large') as any;
      multerError.code = 'LIMIT_FILE_SIZE';

      handleMulterError(multerError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'File size exceeds maximum allowed size',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for other multer errors with code', () => {
      const multerError = new Error('Some multer error') as any;
      multerError.code = 'LIMIT_UNEXPECTED_FILE';

      handleMulterError(multerError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Some multer error',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid file type error', () => {
      const error = new Error('Invalid file type: image/png. Allowed types: video, pdf, audio');

      handleMulterError(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid file type: image/png. Allowed types: video, pdf, audio',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next for non-multer errors', () => {
      const regularError = new Error('Some other error');

      handleMulterError(regularError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(regularError);
    });

    it('should handle errors with field property', () => {
      const multerError = new Error('Field error') as any;
      multerError.code = 'LIMIT_FIELD_KEY';
      multerError.field = 'file';

      handleMulterError(multerError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Field error',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should not call next when handling file type error', () => {
      const error = new Error('Invalid file type: text/plain. Allowed types: video, pdf, audio');

      handleMulterError(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle LIMIT_FILE_SIZE with specific message', () => {
      const multerError = new Error('Different message') as any;
      multerError.code = 'LIMIT_FILE_SIZE';

      handleMulterError(multerError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'File size exceeds maximum allowed size',
      });
    });
  });

  describe('uploadMiddleware', () => {
    it('should be defined and configured with multer', () => {
      expect(uploadMiddleware).toBeDefined();
      expect(typeof uploadMiddleware).toBe('function');
    });
  });
});
