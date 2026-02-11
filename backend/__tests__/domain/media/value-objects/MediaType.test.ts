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

    it('should have IMAGE type', () => {
      expect(MediaType.IMAGE).toBe('IMAGE');
    });

    it('should have exactly 4 types', () => {
      const types = Object.values(MediaType);
      expect(types.length).toBe(4);
    });

    it('should have all expected media types', () => {
      const types = Object.values(MediaType);
      expect(types).toEqual(['VIDEO', 'PDF', 'AUDIO', 'IMAGE']);
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

    it('should define allowed mime types for IMAGE', () => {
      expect(ALLOWED_MIME_TYPES[MediaType.IMAGE]).toEqual([
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/svg+xml',
        'image/jpg',
      ]);
    });

    it('should have entries for all media types', () => {
      const mediaTypes = Object.values(MediaType);
      const allowedTypesKeys = Object.keys(ALLOWED_MIME_TYPES);

      mediaTypes.forEach(type => {
        expect(allowedTypesKeys).toContain(type);
      });
    });

    it('should have at least one mime type for each media type', () => {
      Object.values(MediaType).forEach(type => {
        expect(ALLOWED_MIME_TYPES[type].length).toBeGreaterThan(0);
      });
    });

    it('should not have duplicate mime types across different media types', () => {
      const allMimeTypes: string[] = [];
      Object.values(ALLOWED_MIME_TYPES).forEach(mimeTypes => {
        allMimeTypes.push(...mimeTypes);
      });

      const uniqueMimeTypes = new Set(allMimeTypes);
      expect(uniqueMimeTypes.size).toBe(allMimeTypes.length);
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

    it('should define max file size for IMAGE as 5MB', () => {
      expect(MAX_FILE_SIZES[MediaType.IMAGE]).toBe(5 * 1024 * 1024);
    });

    it('should have entries for all media types', () => {
      const mediaTypes = Object.values(MediaType);
      const maxSizeKeys = Object.keys(MAX_FILE_SIZES);

      mediaTypes.forEach(type => {
        expect(maxSizeKeys).toContain(type);
      });
    });

    it('should have positive file sizes for all media types', () => {
      Object.values(MAX_FILE_SIZES).forEach(size => {
        expect(size).toBeGreaterThan(0);
      });
    });

    it('should have VIDEO as the largest file size', () => {
      const videoSize = MAX_FILE_SIZES[MediaType.VIDEO];
      Object.entries(MAX_FILE_SIZES).forEach(([type, size]) => {
        if (type !== MediaType.VIDEO) {
          expect(videoSize).toBeGreaterThan(size);
        }
      });
    });

    it('should have IMAGE as the smallest file size', () => {
      const imageSize = MAX_FILE_SIZES[MediaType.IMAGE];
      Object.entries(MAX_FILE_SIZES).forEach(([type, size]) => {
        if (type !== MediaType.IMAGE) {
          expect(imageSize).toBeLessThan(size);
        }
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

    describe('IMAGE mime types', () => {
      it('should return IMAGE for image/jpeg', () => {
        expect(getMediaTypeFromMimeType('image/jpeg')).toBe(MediaType.IMAGE);
      });

      it('should return IMAGE for image/jpg', () => {
        expect(getMediaTypeFromMimeType('image/jpg')).toBe(MediaType.IMAGE);
      });

      it('should return IMAGE for image/png', () => {
        expect(getMediaTypeFromMimeType('image/png')).toBe(MediaType.IMAGE);
      });

      it('should return IMAGE for image/gif', () => {
        expect(getMediaTypeFromMimeType('image/gif')).toBe(MediaType.IMAGE);
      });

      it('should return IMAGE for image/webp', () => {
        expect(getMediaTypeFromMimeType('image/webp')).toBe(MediaType.IMAGE);
      });

      it('should return IMAGE for image/bmp', () => {
        expect(getMediaTypeFromMimeType('image/bmp')).toBe(MediaType.IMAGE);
      });

      it('should return IMAGE for image/svg+xml', () => {
        expect(getMediaTypeFromMimeType('image/svg+xml')).toBe(MediaType.IMAGE);
      });
    });

    describe('invalid mime types', () => {
      it('should return null for unknown mime type', () => {
        expect(getMediaTypeFromMimeType('unknown/type')).toBeNull();
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

      it('should return null for invalid image mime type', () => {
        expect(getMediaTypeFromMimeType('image/tiff')).toBeNull();
      });

      it('should return null for application/json', () => {
        expect(getMediaTypeFromMimeType('application/json')).toBeNull();
      });

      it('should return null for application/xml', () => {
        expect(getMediaTypeFromMimeType('application/xml')).toBeNull();
      });
    });

    describe('case sensitivity', () => {
      it('should be case-sensitive for mime types', () => {
        expect(getMediaTypeFromMimeType('VIDEO/MP4')).toBeNull();
        expect(getMediaTypeFromMimeType('Video/Mp4')).toBeNull();
      });
    });
  });

  describe('isValidMimeType', () => {
    describe('valid mime types', () => {
      it('should return true for all valid video mime types', () => {
        expect(isValidMimeType('video/mp4')).toBe(true);
        expect(isValidMimeType('video/webm')).toBe(true);
        expect(isValidMimeType('video/ogg')).toBe(true);
        expect(isValidMimeType('video/quicktime')).toBe(true);
        expect(isValidMimeType('video/x-msvideo')).toBe(true);
      });

      it('should return true for valid PDF mime type', () => {
        expect(isValidMimeType('application/pdf')).toBe(true);
      });

      it('should return true for all valid audio mime types', () => {
        expect(isValidMimeType('audio/mpeg')).toBe(true);
        expect(isValidMimeType('audio/mp3')).toBe(true);
        expect(isValidMimeType('audio/wav')).toBe(true);
        expect(isValidMimeType('audio/ogg')).toBe(true);
        expect(isValidMimeType('audio/webm')).toBe(true);
        expect(isValidMimeType('audio/aac')).toBe(true);
      });

      it('should return true for all valid image mime types', () => {
        expect(isValidMimeType('image/jpeg')).toBe(true);
        expect(isValidMimeType('image/jpg')).toBe(true);
        expect(isValidMimeType('image/png')).toBe(true);
        expect(isValidMimeType('image/gif')).toBe(true);
        expect(isValidMimeType('image/webp')).toBe(true);
        expect(isValidMimeType('image/bmp')).toBe(true);
        expect(isValidMimeType('image/svg+xml')).toBe(true);
      });
    });

    describe('invalid mime types', () => {
      it('should return false for unknown mime type', () => {
        expect(isValidMimeType('unknown/type')).toBe(false);
      });

      it('should return false for text/html', () => {
        expect(isValidMimeType('text/html')).toBe(false);
      });

      it('should return false for text/plain', () => {
        expect(isValidMimeType('text/plain')).toBe(false);
      });

      it('should return false for empty string', () => {
        expect(isValidMimeType('')).toBe(false);
      });

      it('should return false for malformed mime types', () => {
        expect(isValidMimeType('notamimetype')).toBe(false);
        expect(isValidMimeType('video/')).toBe(false);
        expect(isValidMimeType('/mp4')).toBe(false);
      });

      it('should return false for application/json', () => {
        expect(isValidMimeType('application/json')).toBe(false);
      });

      it('should return false for application/xml', () => {
        expect(isValidMimeType('application/xml')).toBe(false);
      });

      it('should return false for unsupported image formats', () => {
        expect(isValidMimeType('image/tiff')).toBe(false);
        expect(isValidMimeType('image/x-icon')).toBe(false);
      });
    });

    it('should be consistent with getMediaTypeFromMimeType', () => {
      const testCases = [
        'video/mp4',
        'application/pdf',
        'audio/mpeg',
        'image/jpeg',
        'image/png',
        'text/html',
        'unknown/type',
        'application/json',
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
          expect(isValidMimeType(mimeType)).toBe(true);
        });
      });
    });

    it('should have correct number of allowed mime types', () => {
      expect(ALLOWED_MIME_TYPES[MediaType.VIDEO].length).toBe(5);
      expect(ALLOWED_MIME_TYPES[MediaType.PDF].length).toBe(1);
      expect(ALLOWED_MIME_TYPES[MediaType.AUDIO].length).toBe(6);
      expect(ALLOWED_MIME_TYPES[MediaType.IMAGE].length).toBe(7);
    });

    it('should handle all mime types defined in ALLOWED_MIME_TYPES', () => {
      const allMimeTypes = Object.values(ALLOWED_MIME_TYPES).flat();

      allMimeTypes.forEach(mimeType => {
        expect(isValidMimeType(mimeType)).toBe(true);
        expect(getMediaTypeFromMimeType(mimeType)).not.toBeNull();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle null input gracefully', () => {
      expect(getMediaTypeFromMimeType(null as any)).toBeNull();
      expect(isValidMimeType(null as any)).toBe(false);
    });

    it('should handle undefined input gracefully', () => {
      expect(getMediaTypeFromMimeType(undefined as any)).toBeNull();
      expect(isValidMimeType(undefined as any)).toBe(false);
    });

    it('should handle whitespace in mime type', () => {
      expect(getMediaTypeFromMimeType(' video/mp4 ')).toBeNull();
      expect(isValidMimeType(' video/mp4 ')).toBe(false);
    });

    it('should handle special characters', () => {
      expect(getMediaTypeFromMimeType('video/mp4;codecs=avc1')).toBeNull();
      expect(isValidMimeType('video/mp4;codecs=avc1')).toBe(false);
    });
  });
});
