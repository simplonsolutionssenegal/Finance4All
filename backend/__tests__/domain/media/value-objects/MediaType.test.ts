import {
  MediaType,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZES,
  getMediaTypeFromMimeType,
  isValidMimeType,
} from '@/domain/media/value-objects/MediaType';

describe('MediaType', () => {
  describe('MediaType enum', () => {
    it('should have VIDEO type', () => {
      expect(MediaType.VIDEO).toBe('VIDEO');
    });

    it('should have PDF type', () => {
      expect(MediaType.PDF).toBe('PDF');
    });

    it('should have AUDIO type', () => {
      expect(MediaType.AUDIO).toBe('AUDIO');
    });

    it('should have exactly 3 types', () => {
      const types = Object.values(MediaType);
      expect(types.length).toBe(3);
    });
  });

  describe('ALLOWED_MIME_TYPES', () => {
    it('should define allowed mime types for VIDEO', () => {
      expect(ALLOWED_MIME_TYPES[MediaType.VIDEO]).toEqual([
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/quicktime',
        'video/x-msvideo',
      ]);
    });

    it('should define allowed mime types for PDF', () => {
      expect(ALLOWED_MIME_TYPES[MediaType.PDF]).toEqual(['application/pdf']);
    });

    it('should define allowed mime types for AUDIO', () => {
      expect(ALLOWED_MIME_TYPES[MediaType.AUDIO]).toEqual([
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/webm',
        'audio/aac',
      ]);
    });

    it('should have entries for all media types', () => {
      const mediaTypes = Object.values(MediaType);
      const allowedTypesKeys = Object.keys(ALLOWED_MIME_TYPES);

      mediaTypes.forEach(type => {
        expect(allowedTypesKeys).toContain(type);
      });
    });
  });

  describe('MAX_FILE_SIZES', () => {
    it('should define max file size for VIDEO as 500MB', () => {
      expect(MAX_FILE_SIZES[MediaType.VIDEO]).toBe(500 * 1024 * 1024);
    });

    it('should define max file size for PDF as 50MB', () => {
      expect(MAX_FILE_SIZES[MediaType.PDF]).toBe(50 * 1024 * 1024);
    });

    it('should define max file size for AUDIO as 100MB', () => {
      expect(MAX_FILE_SIZES[MediaType.AUDIO]).toBe(100 * 1024 * 1024);
    });

    it('should have entries for all media types', () => {
      const mediaTypes = Object.values(MediaType);
      const maxSizeKeys = Object.keys(MAX_FILE_SIZES);

      mediaTypes.forEach(type => {
        expect(maxSizeKeys).toContain(type);
      });
    });
  });

  describe('getMediaTypeFromMimeType', () => {
    describe('VIDEO mime types', () => {
      it('should return VIDEO for video/mp4', () => {
        expect(getMediaTypeFromMimeType('video/mp4')).toBe(MediaType.VIDEO);
      });

      it('should return VIDEO for video/webm', () => {
        expect(getMediaTypeFromMimeType('video/webm')).toBe(MediaType.VIDEO);
      });

      it('should return VIDEO for video/ogg', () => {
        expect(getMediaTypeFromMimeType('video/ogg')).toBe(MediaType.VIDEO);
      });

      it('should return VIDEO for video/quicktime', () => {
        expect(getMediaTypeFromMimeType('video/quicktime')).toBe(MediaType.VIDEO);
      });

      it('should return VIDEO for video/x-msvideo', () => {
        expect(getMediaTypeFromMimeType('video/x-msvideo')).toBe(MediaType.VIDEO);
      });
    });

    describe('PDF mime types', () => {
      it('should return PDF for application/pdf', () => {
        expect(getMediaTypeFromMimeType('application/pdf')).toBe(MediaType.PDF);
      });
    });

    describe('AUDIO mime types', () => {
      it('should return AUDIO for audio/mpeg', () => {
        expect(getMediaTypeFromMimeType('audio/mpeg')).toBe(MediaType.AUDIO);
      });

      it('should return AUDIO for audio/mp3', () => {
        expect(getMediaTypeFromMimeType('audio/mp3')).toBe(MediaType.AUDIO);
      });

      it('should return AUDIO for audio/wav', () => {
        expect(getMediaTypeFromMimeType('audio/wav')).toBe(MediaType.AUDIO);
      });

      it('should return AUDIO for audio/ogg', () => {
        expect(getMediaTypeFromMimeType('audio/ogg')).toBe(MediaType.AUDIO);
      });

      it('should return AUDIO for audio/webm', () => {
        expect(getMediaTypeFromMimeType('audio/webm')).toBe(MediaType.AUDIO);
      });

      it('should return AUDIO for audio/aac', () => {
        expect(getMediaTypeFromMimeType('audio/aac')).toBe(MediaType.AUDIO);
      });
    });

    describe('invalid mime types', () => {
      it('should return null for unknown mime type', () => {
        expect(getMediaTypeFromMimeType('unknown/type')).toBeNull();
      });

      it('should return null for image/jpeg', () => {
        expect(getMediaTypeFromMimeType('image/jpeg')).toBeNull();
      });

      it('should return null for text/html', () => {
        expect(getMediaTypeFromMimeType('text/html')).toBeNull();
      });

      it('should return null for empty string', () => {
        expect(getMediaTypeFromMimeType('')).toBeNull();
      });

      it('should return null for invalid video mime type', () => {
        expect(getMediaTypeFromMimeType('video/invalid')).toBeNull();
      });

      it('should return null for invalid audio mime type', () => {
        expect(getMediaTypeFromMimeType('audio/invalid')).toBeNull();
      });
    });
  });

  describe('isValidMimeType', () => {
    describe('valid mime types', () => {
      it('should return true for valid video mime types', () => {
        expect(isValidMimeType('video/mp4')).toBe(true);
        expect(isValidMimeType('video/webm')).toBe(true);
        expect(isValidMimeType('video/ogg')).toBe(true);
        expect(isValidMimeType('video/quicktime')).toBe(true);
        expect(isValidMimeType('video/x-msvideo')).toBe(true);
      });

      it('should return true for valid PDF mime type', () => {
        expect(isValidMimeType('application/pdf')).toBe(true);
      });

      it('should return true for valid audio mime types', () => {
        expect(isValidMimeType('audio/mpeg')).toBe(true);
        expect(isValidMimeType('audio/mp3')).toBe(true);
        expect(isValidMimeType('audio/wav')).toBe(true);
        expect(isValidMimeType('audio/ogg')).toBe(true);
        expect(isValidMimeType('audio/webm')).toBe(true);
        expect(isValidMimeType('audio/aac')).toBe(true);
      });
    });

    describe('invalid mime types', () => {
      it('should return false for unknown mime type', () => {
        expect(isValidMimeType('unknown/type')).toBe(false);
      });

      it('should return false for image/jpeg', () => {
        expect(isValidMimeType('image/jpeg')).toBe(false);
      });

      it('should return false for text/html', () => {
        expect(isValidMimeType('text/html')).toBe(false);
      });

      it('should return false for empty string', () => {
        expect(isValidMimeType('')).toBe(false);
      });

      it('should return false for malformed mime types', () => {
        expect(isValidMimeType('notamimetype')).toBe(false);
        expect(isValidMimeType('video/')).toBe(false);
        expect(isValidMimeType('/mp4')).toBe(false);
      });
    });

    it('should be consistent with getMediaTypeFromMimeType', () => {
      const testCases = [
        'video/mp4',
        'application/pdf',
        'audio/mpeg',
        'image/jpeg',
        'text/html',
        'unknown/type',
      ];

      testCases.forEach(mimeType => {
        const hasMediaType = getMediaTypeFromMimeType(mimeType) !== null;
        const isValid = isValidMimeType(mimeType);
        expect(isValid).toBe(hasMediaType);
      });
    });
  });

  describe('integration tests', () => {
    it('should have consistent data across all constants', () => {
      const mediaTypes = Object.values(MediaType);

      mediaTypes.forEach(type => {
        expect(ALLOWED_MIME_TYPES[type]).toBeDefined();
        expect(MAX_FILE_SIZES[type]).toBeDefined();
        expect(ALLOWED_MIME_TYPES[type].length).toBeGreaterThan(0);
        expect(MAX_FILE_SIZES[type]).toBeGreaterThan(0);
      });
    });

    it('should map all allowed mime types back to correct media type', () => {
      Object.entries(ALLOWED_MIME_TYPES).forEach(([type, mimeTypes]) => {
        mimeTypes.forEach(mimeType => {
          expect(getMediaTypeFromMimeType(mimeType)).toBe(type);
        });
      });
    });
  });
});
