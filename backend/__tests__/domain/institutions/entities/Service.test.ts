import { Service, TypeService } from '@/domain/institutions/entities/Service';
import { EntityId } from '@/domain/shared/EntityId';
import {
  FraisFixes,
  FraisPourcentage,
  FraisGratuit,
  TypeCalculation,
} from '@/domain/institutions/entities/Frais';

describe('Service', () => {
  const serviceId = EntityId.generate();
  const baseSerciceProps = {
    id: serviceId,
    name: 'Test Service',
    longName: 'Test Service Long Name',
    type: TypeService.PAIEMENT_MARCHAND,
    conditionAccess: ['Condition 1', 'Condition 2'],
    plafonds: ['Plafond 1'],
    infrastructureAccess: ['Infra 1', 'Infra 2'],
  };

  describe('constructor and getters', () => {
    it('should create a service with FraisFixes', () => {
      const frais = new FraisFixes(100);
      const service = new Service({
        ...baseSerciceProps,
        frais,
      });

      expect(service.id).toBe(serviceId);
      expect(service.name).toBe('Test Service');
      expect(service.longName).toBe('Test Service Long Name');
      expect(service.type).toBe(TypeService.PAIEMENT_MARCHAND);
      expect(service.frais).toBe(frais);
      expect(service.conditionAccess).toEqual(['Condition 1', 'Condition 2']);
      expect(service.plafonds).toEqual(['Plafond 1']);
      expect(service.infrastructureAccess).toEqual(['Infra 1', 'Infra 2']);
    });

    it('should create a service with FraisPourcentage', () => {
      const frais = new FraisPourcentage(0.02, 500, 50);
      const service = new Service({
        ...baseSerciceProps,
        frais,
      });

      expect(service.frais).toBe(frais);
      expect((service.frais as FraisPourcentage).rate).toBe(0.02);
    });

    it('should create a service with FraisGratuit', () => {
      const frais = new FraisGratuit();
      const service = new Service({
        ...baseSerciceProps,
        frais,
      });

      expect(service.frais).toBe(frais);
      expect(service.frais).toBeInstanceOf(FraisGratuit);
    });

    it('should create a service with different TypeService', () => {
      const frais = new FraisGratuit();
      const service = new Service({
        ...baseSerciceProps,
        type: TypeService.EPARGNE,
        frais,
      });

      expect(service.type).toBe(TypeService.EPARGNE);
    });

    it('should create a service with empty arrays', () => {
      const frais = new FraisGratuit();
      const service = new Service({
        ...baseSerciceProps,
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
        frais,
      });

      expect(service.conditionAccess).toEqual([]);
      expect(service.plafonds).toEqual([]);
      expect(service.infrastructureAccess).toEqual([]);
    });
  });

  describe('toDTO', () => {
    it('should convert service with FraisFixes to DTO', () => {
      const frais = new FraisFixes(100);
      const service = new Service({
        ...baseSerciceProps,
        frais,
      });

      const dto = service.toDTO();

      expect(dto).toEqual({
        id: serviceId.getValue(),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.PAIEMENT_MARCHAND,
        frais: {
          typeCalculation: TypeCalculation.FIX,
          montantFixe: 100,
          pourcentage: undefined,
          fraisChange: undefined,
        },
        conditionAccess: ['Condition 1', 'Condition 2'],
        plafonds: ['Plafond 1'],
        infrastructureAccess: ['Infra 1', 'Infra 2'],
      });
    });

    it('should convert service with FraisFixes and rate to DTO', () => {
      const frais = new FraisFixes(100, 0.015, 50);
      const service = new Service({
        ...baseSerciceProps,
        frais,
      });

      const dto = service.toDTO();

      expect(dto.frais).toEqual({
        typeCalculation: TypeCalculation.FIX,
        montantFixe: 100,
        pourcentage: 0.015,
        fraisChange: 50,
      });
    });

    it('should convert service with FraisPourcentage to DTO', () => {
      const frais = new FraisPourcentage(0.02);
      const service = new Service({
        ...baseSerciceProps,
        frais,
      });

      const dto = service.toDTO();

      expect(dto.frais).toEqual({
        typeCalculation: TypeCalculation.POURCENTAGE,
        pourcentage: 0.02,
        maximum: undefined,
        minimum: undefined,
      });
    });

    it('should convert service with FraisPourcentage with cap and floor to DTO', () => {
      const frais = new FraisPourcentage(0.025, 1000, 100);
      const service = new Service({
        ...baseSerciceProps,
        frais,
      });

      const dto = service.toDTO();

      expect(dto.frais).toEqual({
        typeCalculation: TypeCalculation.POURCENTAGE,
        pourcentage: 0.025,
        maximum: 1000,
        minimum: 100,
      });
    });

    it('should convert service with FraisGratuit to DTO', () => {
      const frais = new FraisGratuit();
      const service = new Service({
        ...baseSerciceProps,
        frais,
      });

      const dto = service.toDTO();

      expect(dto.frais).toEqual({
        typeCalculation: TypeCalculation.FREE,
      });
    });

    it('should convert service with EPARGNE type to DTO', () => {
      const frais = new FraisPourcentage(0.02, 500, 50);
      const service = new Service({
        ...baseSerciceProps,
        type: TypeService.EPARGNE,
        frais,
      });

      const dto = service.toDTO();

      expect(dto.type).toBe(TypeService.EPARGNE);
      expect(dto.frais.typeCalculation).toBe(TypeCalculation.POURCENTAGE);
    });

    it('should preserve empty arrays in DTO', () => {
      const frais = new FraisGratuit();
      const service = new Service({
        ...baseSerciceProps,
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
        frais,
      });

      const dto = service.toDTO();

      expect(dto.conditionAccess).toEqual([]);
      expect(dto.plafonds).toEqual([]);
      expect(dto.infrastructureAccess).toEqual([]);
    });
  });

  describe('TypeService enum', () => {
    it('should have all expected service types', () => {
      expect(TypeService.PAIEMENT_MARCHAND).toBe('paiement marchand');
      expect(TypeService.ACHAT_CREDIT).toBe('achat de crédit');
      expect(TypeService.PAIEMENT_FACTURES).toBe('paiement de factures');
      expect(TypeService.DEPOT_SIMPLE).toBe('dépôts simples');
      expect(TypeService.DEPOT_RETRAIT_SIMPLE).toBe('dépôts et retraits simples');
      expect(TypeService.RETRAIT_SIMPLE).toBe('retraits simples');
      expect(TypeService.TRANSFERT_ARGENT).toBe("transferts d'argent");
      expect(TypeService.BANQUE_WALLET).toBe('banque vers wallet');
      expect(TypeService.WALLET_BANQUE).toBe('wallet vers banque');
      expect(TypeService.EPARGNE).toBe('épargne');
      expect(TypeService.CREDIT).toBe('crédit');
      expect(TypeService.ASSURANCE).toBe('assurance');
      expect(TypeService.AUTRES).toBe('autres services');
    });
  });

  describe('array reference behavior', () => {
    it('should return direct reference to arrays (mutable)', () => {
      const frais = new FraisGratuit();
      const originalConditions = ['Condition 1', 'Condition 2'];
      const service = new Service({
        ...baseSerciceProps,
        conditionAccess: originalConditions,
        frais,
      });

      const conditions = service.conditionAccess;
      conditions.push('New Condition');
      expect(service.conditionAccess).toHaveLength(3);
      expect(service.conditionAccess).toContain('New Condition');
    });
  });
});
