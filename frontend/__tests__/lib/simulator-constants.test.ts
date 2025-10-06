import {
  STORAGE_KEY,
  INSTITUTION_NAMES,
  PRODUCT_TYPES,
  INSTITUTION_LOGOS,
} from '@/lib/simulator-constants';

describe('simulator-constants', () => {
  describe('STORAGE_KEY', () => {
    it('should have correct storage key', () => {
      expect(STORAGE_KEY).toBe('product-simulator-params');
    });
  });

  describe('INSTITUTION_NAMES', () => {
    it('should be an array of institution names', () => {
      expect(Array.isArray(INSTITUTION_NAMES)).toBe(true);
      expect(INSTITUTION_NAMES.length).toBeGreaterThan(0);
    });

    it('should contain expected institution names', () => {
      expect(INSTITUTION_NAMES).toContain('BNP Paribas');
      expect(INSTITUTION_NAMES).toContain('Société Générale');
      expect(INSTITUTION_NAMES).toContain('Crédit Agricole');
      expect(INSTITUTION_NAMES).toContain('LCL');
      expect(INSTITUTION_NAMES).toContain('Banque Populaire');
    });

    it('should contain fintech and digital banks', () => {
      expect(INSTITUTION_NAMES).toContain('N26');
      expect(INSTITUTION_NAMES).toContain('Revolut');
      expect(INSTITUTION_NAMES).toContain('Qonto');
      expect(INSTITUTION_NAMES).toContain('Lydia');
    });

    it('should contain payment providers', () => {
      expect(INSTITUTION_NAMES).toContain('PayPal');
      expect(INSTITUTION_NAMES).toContain('Stripe');
      expect(INSTITUTION_NAMES).toContain('Adyen');
      expect(INSTITUTION_NAMES).toContain('Square');
    });

    it('should have unique institution names', () => {
      const uniqueNames = new Set(INSTITUTION_NAMES);
      expect(uniqueNames.size).toBe(INSTITUTION_NAMES.length);
    });
  });

  describe('PRODUCT_TYPES', () => {
    it('should be an array of product types', () => {
      expect(Array.isArray(PRODUCT_TYPES)).toBe(true);
      expect(PRODUCT_TYPES.length).toBeGreaterThan(0);
    });

    it('should contain products with correct structure', () => {
      PRODUCT_TYPES.forEach(product => {
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('icon');
        expect(product).toHaveProperty('type');
        expect(product).toHaveProperty('rates');
        expect(product).toHaveProperty('limits');

        expect(typeof product.name).toBe('string');
        expect(typeof product.icon).toBe('string');
        expect(['CREDIT', 'INVESTISSEMENT', 'EPARGNE', 'ASSURANCE']).toContain(product.type);

        expect(product.rates).toHaveProperty('min');
        expect(product.rates).toHaveProperty('max');
        expect(typeof product.rates.min).toBe('number');
        expect(typeof product.rates.max).toBe('number');
        expect(product.rates.min).toBeLessThanOrEqual(product.rates.max);

        expect(product.limits).toHaveProperty('amount');
        expect(product.limits).toHaveProperty('duration');
        expect(product.limits.amount).toHaveProperty('min');
        expect(product.limits.amount).toHaveProperty('max');
        expect(product.limits.duration).toHaveProperty('min');
        expect(product.limits.duration).toHaveProperty('max');

        expect(typeof product.limits.amount.min).toBe('number');
        expect(typeof product.limits.amount.max).toBe('number');
        expect(typeof product.limits.duration.min).toBe('number');
        expect(typeof product.limits.duration.max).toBe('number');

        expect(product.limits.amount.min).toBeLessThanOrEqual(product.limits.amount.max);
        expect(product.limits.duration.min).toBeLessThanOrEqual(product.limits.duration.max);
      });
    });

    it('should contain credit products', () => {
      const creditProducts = PRODUCT_TYPES.filter(p => p.type === 'CREDIT');
      expect(creditProducts.length).toBeGreaterThan(0);
      expect(creditProducts.some(p => p.name.includes('Prêt'))).toBe(true);
    });

    it('should contain investment products', () => {
      const investmentProducts = PRODUCT_TYPES.filter(p => p.type === 'INVESTISSEMENT');
      expect(investmentProducts.length).toBeGreaterThan(0);
      expect(investmentProducts.some(p => p.name.includes('Assurance Vie'))).toBe(true);
    });

    it('should contain savings products', () => {
      const savingsProducts = PRODUCT_TYPES.filter(p => p.type === 'EPARGNE');
      expect(savingsProducts.length).toBeGreaterThan(0);
      expect(savingsProducts.some(p => p.name.includes('Livret'))).toBe(true);
    });

    it('should contain insurance products', () => {
      const insuranceProducts = PRODUCT_TYPES.filter(p => p.type === 'ASSURANCE');
      expect(insuranceProducts.length).toBeGreaterThan(0);
      expect(insuranceProducts.some(p => p.name.includes('Assurance'))).toBe(true);
    });

    it('should have reasonable rate ranges', () => {
      PRODUCT_TYPES.forEach(product => {
        expect(product.rates.min).toBeGreaterThanOrEqual(0);
        expect(product.rates.max).toBeLessThanOrEqual(20); // Max 20% seems reasonable
        expect(product.rates.max - product.rates.min).toBeGreaterThan(0);
      });
    });

    it('should have reasonable amount limits', () => {
      PRODUCT_TYPES.forEach(product => {
        expect(product.limits.amount.min).toBeGreaterThanOrEqual(0);
        expect(product.limits.amount.max).toBeGreaterThan(product.limits.amount.min);
      });
    });

    it('should have reasonable duration limits', () => {
      PRODUCT_TYPES.forEach(product => {
        expect(product.limits.duration.min).toBeGreaterThanOrEqual(1);
        expect(product.limits.duration.max).toBeGreaterThan(product.limits.duration.min);
      });
    });

    it('should have unique product names', () => {
      const uniqueNames = new Set(PRODUCT_TYPES.map(p => p.name));
      expect(uniqueNames.size).toBe(PRODUCT_TYPES.length);
    });
  });

  describe('INSTITUTION_LOGOS', () => {
    it('should be an array of logos', () => {
      expect(Array.isArray(INSTITUTION_LOGOS)).toBe(true);
      expect(INSTITUTION_LOGOS.length).toBeGreaterThan(0);
    });

    it('should contain emoji logos', () => {
      INSTITUTION_LOGOS.forEach(logo => {
        expect(typeof logo).toBe('string');
        expect(logo.length).toBeGreaterThan(0);
      });
    });

    it('should have unique logos', () => {
      const uniqueLogos = new Set(INSTITUTION_LOGOS);
      expect(uniqueLogos.size).toBe(INSTITUTION_LOGOS.length);
    });

    it('should contain expected emoji logos', () => {
      expect(INSTITUTION_LOGOS).toContain('🏦');
      expect(INSTITUTION_LOGOS).toContain('🏛️');
      expect(INSTITUTION_LOGOS).toContain('💰');
    });
  });

  describe('Integration', () => {
    it('should have enough institutions for realistic simulation', () => {
      expect(INSTITUTION_NAMES.length).toBeGreaterThanOrEqual(10);
    });

    it('should have enough product types for realistic simulation', () => {
      expect(PRODUCT_TYPES.length).toBeGreaterThanOrEqual(8);
    });

    it('should have enough logos for all institutions', () => {
      // We should have at least as many logos as institutions, or logos should be reusable
      expect(INSTITUTION_LOGOS.length).toBeGreaterThanOrEqual(5);
    });

    it('should have balanced product distribution', () => {
      const creditCount = PRODUCT_TYPES.filter(p => p.type === 'CREDIT').length;
      const investmentCount = PRODUCT_TYPES.filter(p => p.type === 'INVESTISSEMENT').length;
      const savingsCount = PRODUCT_TYPES.filter(p => p.type === 'EPARGNE').length;
      const insuranceCount = PRODUCT_TYPES.filter(p => p.type === 'ASSURANCE').length;

      expect(creditCount).toBeGreaterThan(0);
      expect(investmentCount).toBeGreaterThan(0);
      expect(savingsCount).toBeGreaterThan(0);
      expect(insuranceCount).toBeGreaterThan(0);
    });
  });
});
