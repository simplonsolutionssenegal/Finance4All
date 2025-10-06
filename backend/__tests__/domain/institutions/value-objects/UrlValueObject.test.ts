import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';

describe('UrlValueObject', () => {
  describe('from', () => {
    it('should create UrlValueObject with valid URL', () => {
      const url = UrlValueObject.from('https://example.com');

      expect(url.getValue()).toBe('https://example.com');
    });

    it('should create UrlValueObject with null value', () => {
      const url = UrlValueObject.from(null);

      expect(url.getValue()).toBeNull();
    });

    it('should accept various valid URL formats', () => {
      const urls = [
        'https://example.com',
        'http://example.com',
        'https://example.com/path',
        'https://example.com/path?query=value',
        'https://subdomain.example.com',
        'https://example.com:8080',
      ];

      urls.forEach(urlString => {
        const url = UrlValueObject.from(urlString);
        expect(url.getValue()).toBe(urlString);
      });
    });

    it('should throw error for empty string', () => {
      expect(() => UrlValueObject.from('')).toThrow('Invalid website URL format');
    });

    it('should throw error for malformed URLs', () => {
      const invalidUrls = ['ftp://', 'example.com', '//example.com', 'www.example.com'];

      invalidUrls.forEach(invalidUrl => {
        expect(() => UrlValueObject.from(invalidUrl)).toThrow('Invalid website URL format');
      });
    });
  });

  describe('getValue', () => {
    it('should return the URL value', () => {
      const url = UrlValueObject.from('https://test.com');

      expect(url.getValue()).toBe('https://test.com');
    });

    it('should return null when created with null', () => {
      const url = UrlValueObject.from(null);

      expect(url.getValue()).toBeNull();
    });
  });

  describe('equals', () => {
    it('should return true for equal URL value objects', () => {
      const url1 = UrlValueObject.from('https://example.com');
      const url2 = UrlValueObject.from('https://example.com');

      expect(url1.equals(url2)).toBe(true);
    });

    it('should return false for different URL value objects', () => {
      const url1 = UrlValueObject.from('https://example1.com');
      const url2 = UrlValueObject.from('https://example2.com');

      expect(url1.equals(url2)).toBe(false);
    });

    it('should return true for both null URLs', () => {
      const url1 = UrlValueObject.from(null);
      const url2 = UrlValueObject.from(null);

      expect(url1.equals(url2)).toBe(true);
    });

    it('should return false when comparing null and non-null URLs', () => {
      const url1 = UrlValueObject.from(null);
      const url2 = UrlValueObject.from('https://example.com');

      expect(url1.equals(url2)).toBe(false);
      expect(url2.equals(url1)).toBe(false);
    });
  });

  describe('validation', () => {
    it('should validate on construction', () => {
      expect(() => new UrlValueObject('https://valid.com')).not.toThrow();
      expect(() => new UrlValueObject('invalid')).toThrow('Invalid website URL format');
    });

    it('should allow null without validation error', () => {
      expect(() => new UrlValueObject(null)).not.toThrow();
    });
  });
});
