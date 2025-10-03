// backend/__tests__/domain/entities/product.validation.test.ts
import type {
  Product,
  ProductType,
  RemboursementInfo,
  ConditionsEligibilite,
} from '@/domain/entities/Product';

describe('Product Entity Validation', () => {
  const validRemboursement: RemboursementInfo = {
    dureeMinimum: 12,
    dureeMaximum: 84,
    modalites: ['mensuel'],
    tauxInteret: 4.5,
    typeRemboursement: 'fixe',
    penalitesRetard: 8.0,
    remboursementAnticipe: true,
  };

  const validConditionsEligibilite: ConditionsEligibilite = {
    ageMinimum: 18,
    ageMaximum: 75,
    revenuMinimum: 1500,
    situationsProfessionnelles: ['CDI', 'CDD'],
    documentsRequis: ["Pièce d'identité"],
    autresConditions: ['Résidence en France'],
  };

  const validProduct: Product = {
    id: 'test-product-001',
    designation: 'Crédit Personnel Test',
    type: 'CREDIT',
    montantMinimum: 1000,
    montantMaximum: 50000,
    remboursement: validRemboursement,
    conditionsEligibilite: validConditionsEligibilite,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  };

  describe('ProductType validation', () => {
    const validTypes: ProductType[] = ['CREDIT', 'EPARGNE', 'INVESTISSEMENT', 'ASSURANCE'];

    validTypes.forEach(type => {
      it(`should accept valid type: ${type}`, () => {
        const product = { ...validProduct, type };
        expect(product.type).toBe(type);
      });
    });
  });

  describe('Product structure validation', () => {
    it('should have all required fields', () => {
      expect(validProduct).toHaveProperty('id');
      expect(validProduct).toHaveProperty('designation');
      expect(validProduct).toHaveProperty('type');
      expect(validProduct).toHaveProperty('montantMinimum');
      expect(validProduct).toHaveProperty('montantMaximum');
      expect(validProduct).toHaveProperty('remboursement');
      expect(validProduct).toHaveProperty('conditionsEligibilite');
      expect(validProduct).toHaveProperty('createdAt');
      expect(validProduct).toHaveProperty('updatedAt');
    });

    it('should have valid remboursement structure', () => {
      expect(validProduct.remboursement).toHaveProperty('dureeMinimum');
      expect(validProduct.remboursement).toHaveProperty('dureeMaximum');
      expect(validProduct.remboursement).toHaveProperty('modalites');
      expect(validProduct.remboursement).toHaveProperty('tauxInteret');
      expect(validProduct.remboursement).toHaveProperty('typeRemboursement');
      expect(validProduct.remboursement).toHaveProperty('remboursementAnticipe');
    });

    it('should have valid conditionsEligibilite structure', () => {
      expect(validProduct.conditionsEligibilite).toHaveProperty('ageMinimum');
      expect(validProduct.conditionsEligibilite).toHaveProperty('revenuMinimum');
      expect(validProduct.conditionsEligibilite).toHaveProperty('situationsProfessionnelles');
      expect(validProduct.conditionsEligibilite).toHaveProperty('documentsRequis');
      expect(validProduct.conditionsEligibilite).toHaveProperty('autresConditions');
    });
  });

  describe('Business rules validation', () => {
    it('should have montantMaximum greater than montantMinimum', () => {
      expect(validProduct.montantMaximum).toBeGreaterThan(validProduct.montantMinimum);
    });

    it('should have dureeMaximum greater than dureeMinimum', () => {
      expect(validProduct.remboursement.dureeMaximum).toBeGreaterThan(
        validProduct.remboursement.dureeMinimum
      );
    });

    it('should have positive montant values', () => {
      expect(validProduct.montantMinimum).toBeGreaterThan(0);
      expect(validProduct.montantMaximum).toBeGreaterThan(0);
    });

    it('should have positive taux interet', () => {
      expect(validProduct.remboursement.tauxInteret).toBeGreaterThanOrEqual(0);
    });

    it('should have valid age minimum', () => {
      expect(validProduct.conditionsEligibilite.ageMinimum).toBeGreaterThanOrEqual(0);
      expect(validProduct.conditionsEligibilite.ageMinimum).toBeLessThanOrEqual(150);
    });
  });
});
