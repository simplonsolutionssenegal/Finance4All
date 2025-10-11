import {
  FraisGratuit,
  FraisFixes,
  FraisPourcentage,
  TypeCalculation,
} from '@/domain/institutions/entities/Frais';

describe('Frais', () => {
  describe('FraisGratuit', () => {
    it('should correctly describe itself', () => {
      const frais = new FraisGratuit();
      expect(frais.describe()).toBe('Gratuit');
    });

    it('should have the correct type', () => {
      const frais = new FraisGratuit();
      expect(frais.typeCalculation).toBe(TypeCalculation.FREE);
    });
  });

  describe('FraisFixes', () => {
    it('should describe a fixed fee', () => {
      const frais = new FraisFixes(100);
      expect(frais.describe()).toBe('100');
    });

    it('should describe a fixed fee with a rate', () => {
      const frais = new FraisFixes(100, 0.01);
      expect(frais.describe()).toBe('100 + 1%');
    });

    it('should describe a fixed fee with a rate and fx surcharge', () => {
      const frais = new FraisFixes(100, 0.01, 50);
      expect(frais.describe()).toBe('100 + 1% + Frais de change');
    });

    it('should have the correct type', () => {
      const frais = new FraisFixes(100);
      expect(frais.typeCalculation).toBe(TypeCalculation.FIX);
    });

    it('should return the correct amount, rate, and fxSurcharge', () => {
      const frais = new FraisFixes(100, 0.01, 50);
      expect(frais.amount).toBe(100);
      expect(frais.rate).toBe(0.01);
      expect(frais.fxSurcharge).toBe(50);
    });
  });

  describe('FraisPourcentage', () => {
    it('should describe a percentage fee', () => {
      const frais = new FraisPourcentage(0.02);
      expect(frais.describe()).toBe('2%');
    });

    it('should describe a percentage fee with a cap', () => {
      const frais = new FraisPourcentage(0.02, 1000);
      expect(frais.describe()).toBe('2% (plafonné à 1000)');
    });

    it('should describe a percentage fee with a floor', () => {
      const frais = new FraisPourcentage(0.02, undefined, 50);
      expect(frais.describe()).toBe('2% (frais minimum 50)');
    });

    it('should describe a percentage fee with a cap and floor', () => {
      const frais = new FraisPourcentage(0.02, 1000, 50);
      expect(frais.describe()).toBe('2% (frais min 50 et frais max 1000)');
    });

    it('should have the correct type', () => {
      const frais = new FraisPourcentage(0.02);
      expect(frais.typeCalculation).toBe(TypeCalculation.POURCENTAGE);
    });

    it('should return the correct rate, cap, and floor', () => {
      const frais = new FraisPourcentage(0.02, 1000, 50);
      expect(frais.rate).toBe(0.02);
      expect(frais.cap).toBe(1000);
      expect(frais.floor).toBe(50);
    });
  });
});
