import { config } from '@/infrastructure/config';

describe.skip('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules and environment
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('port configuration', () => {
    it('should use default port 3000 when PORT is not set', () => {
      delete process.env.PORT;

      // Re-import config to get fresh instance
      const { config: freshConfig } = require('@/infrastructure/config');

      expect(freshConfig.port).toBe(3000);
    });

    it('should use PORT environment variable when set', () => {
      process.env.PORT = '8080';

      // Re-import config to get fresh instance
      const { config: freshConfig } = require('@/infrastructure/config');

      expect(freshConfig.port).toBe(8080);
    });

    it('should handle string PORT environment variable', () => {
      process.env.PORT = '5000';

      const { config: freshConfig } = require('@/infrastructure/config');

      expect(typeof freshConfig.port).toBe('number');
      expect(freshConfig.port).toBe(5000);
    });

    it('should handle invalid PORT environment variable', () => {
      process.env.PORT = 'invalid';

      const { config: freshConfig } = require('@/infrastructure/config');

      // Number('invalid') returns NaN
      expect(freshConfig.port).toBe(NaN);
    });

    it('should handle empty PORT environment variable', () => {
      process.env.PORT = '';

      const { config: freshConfig } = require('@/infrastructure/config');

      // Number('') returns 0, not NaN, so it will be 0
      expect(freshConfig.port).toBe(0);
    });

    it('should handle zero PORT environment variable', () => {
      process.env.PORT = '0';

      const { config: freshConfig } = require('@/infrastructure/config');

      expect(freshConfig.port).toBe(0);
    });
  });

  describe('config object structure', () => {
    it('should have port property', () => {
      expect(config).toHaveProperty('port');
      expect(typeof config.port).toBe('number');
    });

    it('should be an object with expected properties', () => {
      expect(typeof config).toBe('object');
      expect(config).not.toBeNull();
      expect(Object.keys(config)).toContain('port');
    });

    it('should have only expected properties', () => {
      const expectedKeys = ['port'];
      const actualKeys = Object.keys(config);

      expect(actualKeys).toEqual(expectedKeys);
    });
  });

  describe('environment variable handling', () => {
    it('should use nullish coalescing operator correctly', () => {
      // Test that undefined PORT uses default
      process.env.PORT = undefined;
      const { config: freshConfig } = require('@/infrastructure/config');
      expect(freshConfig.port).toBe(3000);
    });

    it('should handle various numeric strings', () => {
      const testCases = [
        { input: '1000', expected: 1000 },
        { input: '65535', expected: 65535 },
        { input: '80', expected: 80 },
        { input: '443', expected: 443 },
      ];

      testCases.forEach(({ input, expected }) => {
        jest.resetModules();
        process.env.PORT = input;
        const { config: freshConfig } = require('@/infrastructure/config');
        expect(freshConfig.port).toBe(expected);
      });
    });
  });
});
