import {
  formatCurrency,
  formatDuration,
  convertToMonths,
  convertToYears,
  validateValue,
  calculateStep,
} from '@/lib/format-utils';

describe('format-utils', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toMatch(/1\s*000\s*F\s*CFA/);
      expect(formatCurrency(100000)).toMatch(/100\s*000\s*F\s*CFA/);
      expect(formatCurrency(1234.56)).toMatch(/1\s*235\s*F\s*CFA/);
    });

    it('should handle zero amount', () => {
      expect(formatCurrency(0)).toMatch(/0\s*F\s*CFA/);
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-1000)).toMatch(/-1\s*000\s*F\s*CFA/);
    });

    it('should handle decimal amounts', () => {
      expect(formatCurrency(123.45)).toMatch(/123\s*F\s*CFA/);
      expect(formatCurrency(0.99)).toMatch(/1\s*F\s*CFA/);
    });

    it('should handle large amounts', () => {
      expect(formatCurrency(1000000)).toMatch(/1\s*000\s*000\s*F\s*CFA/);
    });

    it('should use XOF currency format', () => {
      const result = formatCurrency(1000);
      expect(result).toMatch(/F\s*CFA/);
      expect(result).toContain('1');
    });
  });

  describe('formatDuration', () => {
    it('should format years correctly', () => {
      expect(formatDuration(1, 'YEARS')).toBe('1 an');
      expect(formatDuration(2, 'YEARS')).toBe('2 ans');
      expect(formatDuration(10, 'YEARS')).toBe('10 ans');
    });

    it('should format months correctly', () => {
      expect(formatDuration(1, 'MONTHS')).toBe('1 mois');
      expect(formatDuration(3, 'MONTHS')).toBe('3 mois');
      expect(formatDuration(12, 'MONTHS')).toBe('12 mois');
    });

    it('should default to years when no unit specified', () => {
      expect(formatDuration(5)).toBe('5 ans');
    });

    it('should handle zero duration', () => {
      expect(formatDuration(0, 'YEARS')).toBe('0 an');
      expect(formatDuration(0, 'MONTHS')).toBe('0 mois');
    });
  });

  describe('convertToMonths', () => {
    it('should convert years to months', () => {
      expect(convertToMonths(1, 'YEARS')).toBe(12);
      expect(convertToMonths(2, 'YEARS')).toBe(24);
      expect(convertToMonths(5, 'YEARS')).toBe(60);
    });

    it('should return months as is when unit is MONTHS', () => {
      expect(convertToMonths(3, 'MONTHS')).toBe(3);
      expect(convertToMonths(12, 'MONTHS')).toBe(12);
      expect(convertToMonths(24, 'MONTHS')).toBe(24);
    });

    it('should handle decimal years', () => {
      expect(convertToMonths(1.5, 'YEARS')).toBe(18);
      expect(convertToMonths(0.5, 'YEARS')).toBe(6);
    });

    it('should handle zero', () => {
      expect(convertToMonths(0, 'YEARS')).toBe(0);
      expect(convertToMonths(0, 'MONTHS')).toBe(0);
    });
  });

  describe('convertToYears', () => {
    it('should convert months to years', () => {
      expect(convertToYears(12, 'MONTHS')).toBe(1);
      expect(convertToYears(24, 'MONTHS')).toBe(2);
      expect(convertToYears(60, 'MONTHS')).toBe(5);
    });

    it('should return years as is when unit is YEARS', () => {
      expect(convertToYears(1, 'YEARS')).toBe(1);
      expect(convertToYears(5, 'YEARS')).toBe(5);
      expect(convertToYears(10, 'YEARS')).toBe(10);
    });

    it('should handle partial years', () => {
      expect(convertToYears(6, 'MONTHS')).toBe(0.5);
      expect(convertToYears(18, 'MONTHS')).toBe(1.5);
    });

    it('should handle zero', () => {
      expect(convertToYears(0, 'YEARS')).toBe(0);
      expect(convertToYears(0, 'MONTHS')).toBe(0);
    });
  });

  describe('validateValue', () => {
    it('should return value if within range', () => {
      expect(validateValue(50, 0, 100)).toBe(50);
      expect(validateValue(1000, 500, 5000)).toBe(1000);
    });

    it('should clamp to minimum', () => {
      expect(validateValue(-10, 0, 100)).toBe(0);
      expect(validateValue(100, 500, 1000)).toBe(500);
    });

    it('should clamp to maximum', () => {
      expect(validateValue(150, 0, 100)).toBe(100);
      expect(validateValue(10000, 1000, 5000)).toBe(5000);
    });

    it('should handle equal min and max', () => {
      expect(validateValue(50, 100, 100)).toBe(100);
      expect(validateValue(150, 100, 100)).toBe(100);
    });

    it('should handle negative ranges', () => {
      expect(validateValue(-50, -100, 0)).toBe(-50);
      expect(validateValue(-150, -100, 0)).toBe(-100);
    });

    it('should handle decimal values', () => {
      expect(validateValue(2.5, 0, 10)).toBe(2.5);
      expect(validateValue(12.7, 0, 10)).toBe(10);
    });
  });

  describe('calculateStep', () => {
    it('should return 100 for small minimums', () => {
      expect(calculateStep(100)).toBe(100);
      expect(calculateStep(1000)).toBe(100);
      expect(calculateStep(5000)).toBe(100);
    });

    it('should return 1000 for large minimums', () => {
      expect(calculateStep(10000)).toBe(1000);
      expect(calculateStep(50000)).toBe(1000);
      expect(calculateStep(100000)).toBe(1000);
    });

    it('should handle boundary at 10000', () => {
      expect(calculateStep(9999)).toBe(100);
      expect(calculateStep(10000)).toBe(1000);
      expect(calculateStep(10001)).toBe(1000);
    });

    it('should handle zero', () => {
      expect(calculateStep(0)).toBe(100);
    });

    it('should handle negative values', () => {
      expect(calculateStep(-1000)).toBe(100);
    });
  });

  describe('Edge cases', () => {
    it('should handle very large numbers', () => {
      expect(() => formatCurrency(Number.MAX_SAFE_INTEGER)).not.toThrow();
      expect(() => formatDuration(Number.MAX_SAFE_INTEGER)).not.toThrow();
    });

    it('should handle very small numbers', () => {
      expect(() => formatCurrency(Number.MIN_SAFE_INTEGER)).not.toThrow();
      expect(() => convertToMonths(0.001, 'YEARS')).not.toThrow();
    });

    it('should handle infinity', () => {
      expect(() => formatCurrency(Infinity)).not.toThrow();
      expect(() => validateValue(Infinity, 0, 100)).not.toThrow();
    });

    it('should handle NaN gracefully', () => {
      expect(() => formatCurrency(NaN)).not.toThrow();
    });
  });
});
