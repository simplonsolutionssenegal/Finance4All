import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import {
  validateMediaId,
  validateStartTranscoding,
  validateUpdateProgress,
  validateQuality,
  validateSegment,
  validateGenerateToken,
  handleStreamingValidationErrors,
} from '@/infrastructure/web/validators/streaming.validator';
import { StreamQuality } from '@/domain/streaming/value-objects/StreamQuality';

// Helper to run validation middleware
const runValidation = async (req: Request, validations: any[]) => {
  await Promise.all(validations.map(validation => validation.run(req)));
  return validationResult(req);
};

describe('Streaming Validator', () => {
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

  describe('handleStreamingValidationErrors', () => {
    it('should call next() if there are no validation errors', () => {
      handleStreamingValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 400 with errors if validation fails', async () => {
      mockRequest.params = { id: 'invalid-uuid' };
      await runValidation(mockRequest as Request, validateMediaId);

      handleStreamingValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);

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
  });

  describe('validateStartTranscoding', () => {
    it('should pass with valid qualities array', async () => {
      mockRequest.body = { qualities: [StreamQuality.Q720P, StreamQuality.Q480P] };
      const errors = await runValidation(mockRequest as Request, validateStartTranscoding);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass when qualities is optional and not provided', async () => {
      mockRequest.body = {};
      const errors = await runValidation(mockRequest as Request, validateStartTranscoding);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail when qualities is not an array', async () => {
      mockRequest.body = { qualities: 'not-an-array' };
      const errors = await runValidation(mockRequest as Request, validateStartTranscoding);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'qualities',
            msg: 'Qualities must be an array',
          }),
        ])
      );
    });

    it('should fail with invalid quality value', async () => {
      mockRequest.body = { qualities: ['INVALID_QUALITY'] };
      const errors = await runValidation(mockRequest as Request, validateStartTranscoding);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'qualities[0]',
          }),
        ])
      );
    });

    it('should pass with all valid quality values', async () => {
      mockRequest.body = {
        qualities: [
          StreamQuality.Q1080P,
          StreamQuality.Q720P,
          StreamQuality.Q480P,
          StreamQuality.Q360P,
        ],
      };
      const errors = await runValidation(mockRequest as Request, validateStartTranscoding);
      expect(errors.isEmpty()).toBe(true);
    });
  });

  describe('validateUpdateProgress', () => {
    it('should pass with valid currentPosition and duration', async () => {
      mockRequest.body = { currentPosition: 120.5, duration: 300 };
      const errors = await runValidation(mockRequest as Request, validateUpdateProgress);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with zero values', async () => {
      mockRequest.body = { currentPosition: 0, duration: 0 };
      const errors = await runValidation(mockRequest as Request, validateUpdateProgress);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail with negative currentPosition', async () => {
      mockRequest.body = { currentPosition: -10, duration: 300 };
      const errors = await runValidation(mockRequest as Request, validateUpdateProgress);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'currentPosition',
            msg: 'Current position must be a non-negative number',
          }),
        ])
      );
    });

    it('should fail with negative duration', async () => {
      mockRequest.body = { currentPosition: 120, duration: -300 };
      const errors = await runValidation(mockRequest as Request, validateUpdateProgress);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'duration',
            msg: 'Duration must be a non-negative number',
          }),
        ])
      );
    });

    it('should fail with missing currentPosition', async () => {
      mockRequest.body = { duration: 300 };
      const errors = await runValidation(mockRequest as Request, validateUpdateProgress);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'currentPosition',
          }),
        ])
      );
    });

    it('should fail with missing duration', async () => {
      mockRequest.body = { currentPosition: 120 };
      const errors = await runValidation(mockRequest as Request, validateUpdateProgress);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'duration',
          }),
        ])
      );
    });

    it('should fail with non-numeric values', async () => {
      mockRequest.body = { currentPosition: 'abc', duration: 'xyz' };
      const errors = await runValidation(mockRequest as Request, validateUpdateProgress);
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe('validateQuality', () => {
    it('should pass with valid quality in lowercase', async () => {
      mockRequest.params = { quality: 'q720p' };
      const errors = await runValidation(mockRequest as Request, validateQuality);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with valid quality in uppercase', async () => {
      mockRequest.params = { quality: 'Q720P' };
      const errors = await runValidation(mockRequest as Request, validateQuality);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with all valid qualities', async () => {
      const qualities = ['q1080p', 'q720p', 'q480p', 'q360p'];

      await Promise.all(
        qualities.map(async quality => {
          mockRequest.params = { quality };
          const errors = await runValidation(mockRequest as Request, validateQuality);
          expect(errors.isEmpty()).toBe(true);
        })
      );
    });

    it('should fail with invalid quality', async () => {
      mockRequest.params = { quality: 'invalid' };
      const errors = await runValidation(mockRequest as Request, validateQuality);
      expect(errors.isEmpty()).toBe(false);
    });

    it('should fail with missing quality', async () => {
      mockRequest.params = {};
      const errors = await runValidation(mockRequest as Request, validateQuality);
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe('validateSegment', () => {
    it('should pass with valid segment format', async () => {
      mockRequest.params = { segment: 'segment000.ts' };
      const errors = await runValidation(mockRequest as Request, validateSegment);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with different segment numbers', async () => {
      const segments = ['segment000.ts', 'segment001.ts', 'segment999.ts'];

      await Promise.all(
        segments.map(async segment => {
          mockRequest.params = { segment };
          const errors = await runValidation(mockRequest as Request, validateSegment);
          expect(errors.isEmpty()).toBe(true);
        })
      );
    });

    it('should fail with invalid format - wrong extension', async () => {
      mockRequest.params = { segment: 'segment000.mp4' };
      const errors = await runValidation(mockRequest as Request, validateSegment);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'segment',
            msg: 'Invalid segment format. Expected format: segmentXXX.ts',
          }),
        ])
      );
    });

    it('should fail with invalid format - wrong number format', async () => {
      mockRequest.params = { segment: 'segment0.ts' };
      const errors = await runValidation(mockRequest as Request, validateSegment);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'segment',
            msg: 'Invalid segment format. Expected format: segmentXXX.ts',
          }),
        ])
      );
    });

    it('should fail with invalid format - too many digits', async () => {
      mockRequest.params = { segment: 'segment0000.ts' };
      const errors = await runValidation(mockRequest as Request, validateSegment);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'segment',
            msg: 'Invalid segment format. Expected format: segmentXXX.ts',
          }),
        ])
      );
    });

    it('should fail with invalid format - missing segment prefix', async () => {
      mockRequest.params = { segment: '000.ts' };
      const errors = await runValidation(mockRequest as Request, validateSegment);
      expect(errors.isEmpty()).toBe(false);
    });

    it('should fail with completely invalid format', async () => {
      mockRequest.params = { segment: 'invalid' };
      const errors = await runValidation(mockRequest as Request, validateSegment);
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe('validateGenerateToken', () => {
    it('should pass with valid expiresInSeconds', async () => {
      mockRequest.body = { expiresInSeconds: 3600 };
      const errors = await runValidation(mockRequest as Request, validateGenerateToken);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass when expiresInSeconds is optional and not provided', async () => {
      mockRequest.body = {};
      const errors = await runValidation(mockRequest as Request, validateGenerateToken);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with minimum value (60)', async () => {
      mockRequest.body = { expiresInSeconds: 60 };
      const errors = await runValidation(mockRequest as Request, validateGenerateToken);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with maximum value (86400)', async () => {
      mockRequest.body = { expiresInSeconds: 86400 };
      const errors = await runValidation(mockRequest as Request, validateGenerateToken);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail with value below minimum', async () => {
      mockRequest.body = { expiresInSeconds: 59 };
      const errors = await runValidation(mockRequest as Request, validateGenerateToken);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'expiresInSeconds',
            msg: 'expiresInSeconds must be between 60 and 86400',
          }),
        ])
      );
    });

    it('should fail with value above maximum', async () => {
      mockRequest.body = { expiresInSeconds: 86401 };
      const errors = await runValidation(mockRequest as Request, validateGenerateToken);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'expiresInSeconds',
            msg: 'expiresInSeconds must be between 60 and 86400',
          }),
        ])
      );
    });

    it('should fail with non-integer value', async () => {
      mockRequest.body = { expiresInSeconds: 100.5 };
      const errors = await runValidation(mockRequest as Request, validateGenerateToken);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'expiresInSeconds',
          }),
        ])
      );
    });

    it('should fail with non-numeric value', async () => {
      mockRequest.body = { expiresInSeconds: 'not-a-number' };
      const errors = await runValidation(mockRequest as Request, validateGenerateToken);
      expect(errors.isEmpty()).toBe(false);
    });
  });
});
