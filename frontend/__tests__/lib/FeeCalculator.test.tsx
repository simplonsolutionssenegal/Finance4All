import type { ServiceDTO, Frais } from '@/types/Service';
import { computeFee } from '@/lib/FeeCalculator';

// Mock du module format-utils
jest.mock('@/lib/format-utils', () => ({
  formatCurrency: jest.fn((value: number) => `${value.toFixed(2)} FCFA`),
}));

describe('computeFee', () => {
  const createService = (frais: Frais | undefined | null): ServiceDTO => ({
    id: '1',
    name: 'Test Service',
    longName: 'Test Service Long Name',
    type: 'test',
    montantMin: 0,
    montantMax: 1000000,
    frais: frais as Frais,
    conditionAccess: [],
    plafonds: [],
    infrastructureAccess: [],
    institution: {
      id: '1',
      name: 'Test Institution',
      logoUrl: 'https://example.com/logo.png',
    },
  });

  describe('Cas sans frais définis', () => {
    it('devrait retourner DEFAULT_FEE quand frais est undefined', () => {
      const service = createService(undefined);
      const result = computeFee(service, 1000);

      expect(result).toEqual({ label: 'Non défini', value: 0 });
    });

    it('devrait retourner DEFAULT_FEE quand frais est null', () => {
      const service = createService(null);
      const result = computeFee(service, 1000);

      expect(result).toEqual({ label: 'Non défini', value: 0 });
    });

    it('devrait retourner DEFAULT_FEE quand typeCalculation est undefined', () => {
      const service = createService({});
      const result = computeFee(service, 1000);

      expect(result).toEqual({ label: 'Non défini', value: 0 });
    });

    it('devrait retourner DEFAULT_FEE pour un typeCalculation inconnu (3)', () => {
      const service = createService({ _typeCalculation: 3 });
      const result = computeFee(service, 1000);

      expect(result).toEqual({ label: 'Non défini', value: 0 });
    });

    it('devrait retourner DEFAULT_FEE pour un typeCalculation inconnu (99)', () => {
      const service = createService({ _typeCalculation: 99 });
      const result = computeFee(service, 1000);

      expect(result).toEqual({ label: 'Non défini', value: 0 });
    });

    it('devrait retourner DEFAULT_FEE pour un typeCalculation négatif', () => {
      const service = createService({ _typeCalculation: -1 });
      const result = computeFee(service, 1000);

      expect(result).toEqual({ label: 'Non défini', value: 0 });
    });
  });

  describe('Type 0 - Gratuit', () => {
    it('devrait retourner FREE_FEE avec _typeCalculation à 0', () => {
      const service = createService({ _typeCalculation: 0 });
      const result = computeFee(service, 1000);

      expect(result).toEqual({ label: 'Gratuit !', value: 0 });
    });

    it('devrait retourner FREE_FEE avec type FREE', () => {
      const service = createService({
        _typeCalculation: 0,
        type: 'FREE',
      });
      const result = computeFee(service, 1000);

      expect(result).toEqual({ label: 'Gratuit !', value: 0 });
    });

    it('devrait prioriser _typeCalculation sur les autres champs', () => {
      const service = createService({
        _typeCalculation: 0,
        pourcentage: 0.05,
        montantFixe: 100,
      });
      const result = computeFee(service, 1000);

      expect(result).toEqual({ label: 'Gratuit !', value: 0 });
    });

    it('devrait fonctionner avec montant à 0', () => {
      const service = createService({ _typeCalculation: 0 });
      const result = computeFee(service, 0);

      expect(result).toEqual({ label: 'Gratuit !', value: 0 });
    });
  });

  describe('Type 1 - Pourcentage', () => {
    it('devrait calculer les frais en pourcentage simple', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.05,
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('5% du montant');
      expect(result.value).toBe(50);
    });

    it('devrait utiliser pourcentage par défaut (0) si non défini', () => {
      const service = createService({
        _typeCalculation: 1,
        _rate: 0.03,
      });
      const result = computeFee(service, 1000);

      // Le code actuel ne gère pas _rate, donc pourcentage = 0
      expect(result.label).toBe('0% du montant');
      expect(result.value).toBe(0);
    });

    it('devrait appliquer le minimum quand le calcul est inférieur', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.01,
        minimum: 100,
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('1% du montant (min 100.00 FCFA)');
      expect(result.value).toBe(100);
    });

    it('devrait appliquer le minimum avec un très petit pourcentage', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.001,
        minimum: 200,
      });
      const result = computeFee(service, 10000);

      expect(result.label).toBe('0.1% du montant (min 200.00 FCFA)');
      expect(result.value).toBe(200);
    });

    it('devrait appliquer le maximum quand le calcul est supérieur', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.1,
        maximum: 50,
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('10% du montant (max 50.00 FCFA)');
      expect(result.value).toBe(50);
    });

    it('devrait afficher minimum et maximum ensemble', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.05,
        minimum: 10,
        maximum: 200,
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('5% du montant (min 10.00 FCFA · max 200.00 FCFA)');
      expect(result.value).toBe(50);
    });

    it('devrait respecter le minimum dans la plage min-max', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.002,
        minimum: 100,
        maximum: 500,
      });
      const result = computeFee(service, 10000);

      // 10000 * 0.002 = 20, min = 100, donc fee = 100
      expect(result.value).toBe(100);
    });

    it('devrait respecter le maximum dans la plage min-max', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.2,
        minimum: 50,
        maximum: 150,
      });
      const result = computeFee(service, 1000);

      // 1000 * 0.2 = 200, max = 150, donc fee = 150
      expect(result.value).toBe(150);
    });

    it('devrait retourner 0 quand le montant est 0', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.05,
        minimum: 100,
      });
      const result = computeFee(service, 0);

      expect(result.value).toBe(0);
    });

    it('devrait retourner 0 quand le montant est négatif', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.05,
        minimum: 100,
      });
      const result = computeFee(service, -1000);

      expect(result.value).toBe(0);
    });

    it('devrait gérer pourcentage à 0', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0,
        minimum: 50,
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('0% du montant (min 50.00 FCFA)');
      expect(result.value).toBe(50);
    });

    it('devrait gérer pourcentage undefined (utilise 0 par défaut)', () => {
      const service = createService({
        _typeCalculation: 1,
        minimum: 50,
      });
      const result = computeFee(service, 1000);

      expect(result.value).toBe(50);
    });

    it('devrait calculer correctement avec un pourcentage élevé', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.5,
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('50% du montant');
      expect(result.value).toBe(500);
    });

    it('devrait afficher seulement le minimum si maximum est undefined', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.05,
        minimum: 25,
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('5% du montant (min 25.00 FCFA)');
      expect(result.value).toBe(50);
    });

    it('devrait afficher seulement le maximum si minimum est undefined', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.05,
        maximum: 30,
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('5% du montant (max 30.00 FCFA)');
      expect(result.value).toBe(30);
    });
  });

  describe('Type 2 - Montant fixe', () => {
    it('devrait calculer des frais fixes simples', () => {
      const service = createService({
        _typeCalculation: 2,
        montantFixe: 500,
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('Frais fixe');
      expect(result.value).toBe(500);
    });

    it('devrait retourner FREE_FEE si montantFixe non défini (_amount non géré)', () => {
      const service = createService({
        _typeCalculation: 2,
        _amount: 300,
      });
      const result = computeFee(service, 1000);

      // Le code actuel ne gère pas _amount, donc montantFixe = 0
      expect(result.label).toBe('Gratuit !');
      expect(result.value).toBe(0);
    });

    it('devrait retourner FREE_FEE quand montantFixe et pourcentage sont 0', () => {
      const service = createService({
        _typeCalculation: 2,
        montantFixe: 0,
        pourcentage: 0,
      });
      const result = computeFee(service, 1000);

      expect(result).toEqual({ label: 'Gratuit !', value: 0 });
    });

    it('devrait retourner FREE_FEE quand montantFixe et pourcentage sont undefined', () => {
      const service = createService({
        _typeCalculation: 2,
      });
      const result = computeFee(service, 1000);

      expect(result).toEqual({ label: 'Gratuit !', value: 0 });
    });

    it('devrait calculer frais fixe + pourcentage', () => {
      const service = createService({
        _typeCalculation: 2,
        montantFixe: 100,
        pourcentage: 0.02,
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('100.00 FCFA + 2%');
      expect(result.value).toBe(120);
    });

    it('devrait gérer montantFixe à 0 avec pourcentage', () => {
      const service = createService({
        _typeCalculation: 2,
        montantFixe: 0,
        pourcentage: 0.03,
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('0.00 FCFA + 3%');
      expect(result.value).toBe(30);
    });

    it('devrait calculer avec montant à 0', () => {
      const service = createService({
        _typeCalculation: 2,
        montantFixe: 100,
        pourcentage: 0.02,
      });
      const result = computeFee(service, 0);

      expect(result.label).toBe('100.00 FCFA + 2%');
      expect(result.value).toBe(100);
    });

    it('devrait gérer les frais de change', () => {
      const service = createService({
        _typeCalculation: 2,
        fraisChange: {
          fxSurcharge: 250,
          devise: 'EUR',
        },
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('Frais de change (EUR)');
      expect(result.value).toBe(250);
    });

    it('devrait gérer les frais de change avec différentes devises', () => {
      const devises = ['USD', 'GBP', 'CAD', 'CHF'];

      devises.forEach(devise => {
        const service = createService({
          _typeCalculation: 2,
          fraisChange: {
            fxSurcharge: 100,
            devise,
          },
        });
        const result = computeFee(service, 1000);

        expect(result.label).toBe(`Frais de change (${devise})`);
        expect(result.value).toBe(100);
      });
    });

    it('devrait prioriser fraisChange sur montantFixe', () => {
      const service = createService({
        _typeCalculation: 2,
        montantFixe: 500,
        pourcentage: 0.05,
        fraisChange: {
          fxSurcharge: 300,
          devise: 'USD',
        },
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('Frais de change (USD)');
      expect(result.value).toBe(300);
    });

    it('devrait gérer fraisChange avec fxSurcharge à 0', () => {
      const service = createService({
        _typeCalculation: 2,
        fraisChange: {
          fxSurcharge: 0,
          devise: 'GBP',
        },
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('Frais de change (GBP)');
      expect(result.value).toBe(0);
    });

    it('devrait prioriser fraisChange (pas _fxSurcharge seul)', () => {
      const service = createService({
        _typeCalculation: 2,
        _fxSurcharge: 175,
        fraisChange: {
          fxSurcharge: 175,
          devise: 'JPY',
        },
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('Frais de change (JPY)');
      expect(result.value).toBe(175);
    });

    it('devrait calculer avec montantFixe élevé', () => {
      const service = createService({
        _typeCalculation: 2,
        montantFixe: 10000,
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('Frais fixe');
      expect(result.value).toBe(10000);
    });

    it('devrait calculer avec pourcentage élevé', () => {
      const service = createService({
        _typeCalculation: 2,
        montantFixe: 50,
        pourcentage: 0.1,
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('50.00 FCFA + 10%');
      expect(result.value).toBe(150);
    });
  });

  describe('Cas limites et edge cases', () => {
    it('devrait gérer un montant très grand avec pourcentage', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.05,
        maximum: 1000000,
      });
      const result = computeFee(service, 999999999);

      expect(result.value).toBe(1000000);
    });

    it('devrait gérer un montant très grand avec frais fixe', () => {
      const service = createService({
        _typeCalculation: 2,
        montantFixe: 100,
        pourcentage: 0.001,
      });
      const result = computeFee(service, 10000000);

      expect(result.value).toBe(10100);
    });

    it('devrait gérer minimum à 0', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.05,
        minimum: 0,
      });
      const result = computeFee(service, 100);

      expect(result.label).toBe('5% du montant (min 0.00 FCFA)');
      expect(result.value).toBe(5);
    });

    it('devrait gérer maximum à 0', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.05,
        maximum: 0,
      });
      const result = computeFee(service, 1000);

      expect(result.value).toBe(0);
    });

    it('devrait gérer des nombres décimaux pour le montant', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.05,
      });
      const result = computeFee(service, 1234.56);

      expect(result.value).toBeCloseTo(61.728, 2);
    });

    it('devrait gérer des nombres décimaux avec minimum', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.001,
        minimum: 10.5,
      });
      const result = computeFee(service, 1234.56);

      expect(result.value).toBe(10.5);
    });

    it('devrait gérer montant négatif avec frais fixe', () => {
      const service = createService({
        _typeCalculation: 2,
        montantFixe: 100,
      });
      const result = computeFee(service, -500);

      expect(result.value).toBe(100);
    });

    it('devrait gérer tous les champs Frais (utilise seulement les champs actifs)', () => {
      const service = createService({
        _typeCalculation: 1,
        _amount: 50,
        _rate: 0.02,
        _fxSurcharge: 25,
        type: 'POURCENTAGE',
        amount: 50,
        rate: 0.02,
        fxSurcharge: 25,
        montantFixe: 100,
        pourcentage: 0.03,
        minimum: 10,
        maximum: 200,
      });
      const result = computeFee(service, 1000);

      // Le code utilise pourcentage (0.03) avec min/max car _typeCalculation = 1
      expect(result.value).toBe(30);
      expect(result.label).toBe('3% du montant (min 10.00 FCFA · max 200.00 FCFA)');
    });

    it('devrait gérer le cas où min > max (edge case)', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.05,
        minimum: 200,
        maximum: 100,
      });
      const result = computeFee(service, 1000);

      // 1000 * 0.05 = 50, min = 200, donc 200, puis max = 100, donc 100
      expect(result.value).toBe(100);
    });

    it('devrait gérer un montant de 1', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 0.5,
        minimum: 10,
      });
      const result = computeFee(service, 1);

      expect(result.value).toBe(10);
    });

    it('devrait gérer un pourcentage de 100%', () => {
      const service = createService({
        _typeCalculation: 1,
        pourcentage: 1,
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('100% du montant');
      expect(result.value).toBe(1000);
    });

    it('devrait gérer frais de change avec devise vide', () => {
      const service = createService({
        _typeCalculation: 2,
        fraisChange: {
          fxSurcharge: 100,
          devise: '',
        },
      });
      const result = computeFee(service, 1000);

      expect(result.label).toBe('Frais de change ()');
      expect(result.value).toBe(100);
    });
  });
});
