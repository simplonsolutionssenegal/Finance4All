import * as React from 'react';
import { formatCurrency, formatPercentage } from '../../lib/formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats undefined and non-numeric as 0 FCFA', () => {
      expect(formatCurrency(undefined)).toBe('0 FCFA');
      expect(formatCurrency(null as any)).toBe('0 FCFA');
      expect(formatCurrency('not-a-number')).toBe('0 FCFA');
    });

    it('formats numbers with fr-FR grouping and appends FCFA', () => {
      expect(formatCurrency(0)).toBe('0 FCFA');
      expect(formatCurrency(1234)).toBe('1\u202F234 FCFA');
      expect(formatCurrency('567890')).toBe('567\u202F890 FCFA');
      expect(formatCurrency(-500)).toBe('-500 FCFA');
    });

    it('handles edge cases for currency formatting', () => {
      expect(formatCurrency(0.5)).toBe('0,5 FCFA');
      expect(formatCurrency(1000000)).toBe('1\u202F000\u202F000 FCFA');
      expect(formatCurrency(-0.1)).toBe('-0,1 FCFA');
      expect(formatCurrency('')).toBe('0 FCFA');
      expect(formatCurrency(NaN)).toBe('0 FCFA');
      expect(formatCurrency(Infinity)).toBe('0 FCFA');
      expect(formatCurrency(-Infinity)).toBe('0 FCFA');
    });

    it('handles very large numbers', () => {
      expect(formatCurrency(999999999)).toBe('999\u202F999\u202F999 FCFA');
      expect(formatCurrency(1000000000)).toBe('1\u202F000\u202F000\u202F000 FCFA');
    });

    it('handles decimal numbers correctly', () => {
      expect(formatCurrency(1234.56)).toBe('1\u202F234,56 FCFA');
      expect(formatCurrency(0.01)).toBe('0,01 FCFA');
      expect(formatCurrency(0.001)).toBe('0,001 FCFA');
    });
  });

  describe('formatPercentage', () => {
    it('formats undefined and non-numeric as 0%', () => {
      expect(formatPercentage(undefined)).toBe('0%');
      expect(formatPercentage(null as any)).toBe('0%');
      expect(formatPercentage('abc')).toBe('0%');
    });

    it('formats integer percentages without decimals', () => {
      expect(formatPercentage(0)).toBe('0%');
      expect(formatPercentage(5)).toBe('5%');
      expect(formatPercentage('10')).toBe('10%');
    });

    it('formats non-integer percentages with two decimals', () => {
      expect(formatPercentage(3.5)).toBe('3.50%');
      expect(formatPercentage('2.345')).toBe('2.35%');
      expect(formatPercentage(-1.25)).toBe('-1.25%');
    });

    it('handles edge cases for percentage formatting', () => {
      expect(formatPercentage(0.1)).toBe('0.10%');
      expect(formatPercentage(0.01)).toBe('0.01%');
      expect(formatPercentage(0.001)).toBe('0.00%');
      expect(formatPercentage(99.99)).toBe('99.99%');
      expect(formatPercentage(100)).toBe('100%');
      expect(formatPercentage(100.1)).toBe('100.10%');
    });

    it('handles negative percentages', () => {
      expect(formatPercentage(-5)).toBe('-5%');
      expect(formatPercentage(-5.5)).toBe('-5.50%');
      expect(formatPercentage(-0.1)).toBe('-0.10%');
    });

    it('handles very large percentages', () => {
      expect(formatPercentage(1000)).toBe('1000%');
      expect(formatPercentage(1000.5)).toBe('1000.50%');
    });

    it('handles special number values', () => {
      expect(formatPercentage(NaN)).toBe('0%');
      expect(formatPercentage(Infinity)).toBe('0%');
      expect(formatPercentage(-Infinity)).toBe('0%');
      expect(formatPercentage('')).toBe('0%');
    });

    it('rounds to two decimal places correctly', () => {
      expect(formatPercentage(2.345)).toBe('2.35%');
      expect(formatPercentage(2.344)).toBe('2.34%');
      expect(formatPercentage(2.346)).toBe('2.35%');
    });
  });
});
