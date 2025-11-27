import { Service, TypeService } from '@/domain/institutions/entities/Service';
import { EntityId } from '@/domain/shared/EntityId';
import {
  FraisGratuit,
  FraisFixes,
  FraisPourcentage,
  TypeCalculation as FraisTypeCalculation,
} from '@/domain/institutions/entities/Frais';

describe('Service', () => {
  describe('Creation and properties', () => {
    it('should create a service with all properties', () => {
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.PAIEMENT_MARCHAND,
        montantMin: 100000,
        montantMax: 100000,
        frais: new FraisGratuit(),
        conditionAccess: ['Condition 1'],
        plafonds: ['Plafond 1'],
        infrastructureAccess: ['Infra 1'],
      };

      const service = new Service(serviceProps);

      expect(service.id).toBe(serviceProps.id);
      expect(service.name).toBe(serviceProps.name);
      expect(service.longName).toBe(serviceProps.longName);
      expect(service.type).toBe(serviceProps.type);
      expect(service.frais).toBe(serviceProps.frais);
      expect(service.conditionAccess).toEqual(serviceProps.conditionAccess);
      expect(service.plafonds).toEqual(serviceProps.plafonds);
      expect(service.infrastructureAccess).toEqual(serviceProps.infrastructureAccess);
    });

    it('should create a service with FraisFixes', () => {
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Fixed Fee Service',
        longName: 'Fixed Fee Service Long Name',
        type: TypeService.TRANSFERT_ARGENT,
        montantMin: 100000,
        montantMax: 100000,
        frais: new FraisFixes(100, 0.02, { fxSurcharge: 50, devise: 'USD' }),
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const service = new Service(serviceProps);

      expect(service.frais).toBeInstanceOf(FraisFixes);
    });

    it('should create a service with FraisPourcentage', () => {
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Percentage Fee Service',
        longName: 'Percentage Fee Service Long Name',
        type: TypeService.EPARGNE,
        montantMin: 100000,
        montantMax: 100000,
        frais: new FraisPourcentage(0.03, 1000, 100),
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const service = new Service(serviceProps);

      expect(service.frais).toBeInstanceOf(FraisPourcentage);
    });

    it('should create a service with empty arrays', () => {
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Minimal Service',
        longName: 'Minimal Service Long Name',
        type: TypeService.AUTRES,
        montantMin: 100000,
        montantMax: 100000,
        frais: new FraisGratuit(),
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const service = new Service(serviceProps);

      expect(service.conditionAccess).toEqual([]);
      expect(service.plafonds).toEqual([]);
      expect(service.infrastructureAccess).toEqual([]);
    });
  });

  describe('TypeService enum', () => {
    it('should support all TypeService values', () => {
      const serviceTypes = [
        TypeService.PAIEMENT_MARCHAND,
        TypeService.ACHAT_CREDIT,
        TypeService.PAIEMENT_FACTURES,
        TypeService.DEPOT_SIMPLE,
        TypeService.DEPOT_RETRAIT_SIMPLE,
        TypeService.RETRAIT_SIMPLE,
        TypeService.TRANSFERT_ARGENT,
        TypeService.BANQUE_WALLET,
        TypeService.WALLET_BANQUE,
        TypeService.EPARGNE,
        TypeService.CREDIT,
        TypeService.ASSURANCE,
        TypeService.AUTRES,
      ];

      serviceTypes.forEach(serviceType => {
        const service = new Service({
          id: EntityId.generate(),
          name: 'Test',
          longName: 'Test Long',
          type: serviceType,
          montantMin: 100000,
          montantMax: 100000,
          frais: new FraisGratuit(),
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
        });

        expect(service.type).toBe(serviceType);
      });
    });
  });

  describe('toDTO method', () => {
    it('should convert to DTO correctly with FraisGratuit', () => {
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.PAIEMENT_MARCHAND,
        montantMin: 100000,
        montantMax: 100000,
        frais: new FraisGratuit(),
        conditionAccess: ['Condition 1'],
        plafonds: ['Plafond 1'],
        infrastructureAccess: ['Infra 1'],
      };

      const service = new Service(serviceProps);
      const dto = service.toDTO();

      expect(dto.id).toBe(serviceProps.id.getValue());
      expect(dto.name).toBe(serviceProps.name);
      expect(dto.longName).toBe(serviceProps.longName);
      expect(dto.type).toBe(serviceProps.type);
      expect(dto.frais).toEqual({
        typeCalculation: FraisTypeCalculation.FREE,
      });
      expect(dto.conditionAccess).toEqual(serviceProps.conditionAccess);
      expect(dto.plafonds).toEqual(serviceProps.plafonds);
      expect(dto.infrastructureAccess).toEqual(serviceProps.infrastructureAccess);
    });

    it('should convert to DTO correctly with FraisFixes', () => {
      const frais = new FraisFixes(100, 0.02, { fxSurcharge: 50, devise: 'EUR' });
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Fixed Fee Service',
        longName: 'Fixed Fee Service Long Name',
        type: TypeService.TRANSFERT_ARGENT,
        montantMin: 100000,
        montantMax: 100000,
        frais,
        conditionAccess: ['ID required'],
        plafonds: ['5000 FCFA/day'],
        infrastructureAccess: ['Mobile app', 'USSD'],
      };

      const service = new Service(serviceProps);
      const dto = service.toDTO();

      expect(dto.id).toBe(serviceProps.id.getValue());
      expect(dto.name).toBe(serviceProps.name);
      expect(dto.frais).toEqual({
        typeCalculation: FraisTypeCalculation.FIX,
        montantFixe: 100,
        pourcentage: 0.02,
        fraisChange: { fxSurcharge: 50, devise: 'EUR' },
      });
    });

    it('should convert to DTO correctly with FraisPourcentage', () => {
      const frais = new FraisPourcentage(0.03, 1000, 100);
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Percentage Service',
        longName: 'Percentage Service Long Name',
        type: TypeService.EPARGNE,
        montantMin: 100000,
        montantMax: 100000,
        frais,
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const service = new Service(serviceProps);
      const dto = service.toDTO();

      expect(dto.frais).toEqual({
        typeCalculation: FraisTypeCalculation.POURCENTAGE,
        pourcentage: 0.03,
        maximum: 1000,
        minimum: 100,
      });
    });

    it('should preserve all array data in DTO', () => {
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Full Service',
        longName: 'Full Service Long Name',
        type: TypeService.CREDIT,
        montantMin: 100000,
        montantMax: 100000,
        frais: new FraisGratuit(),
        conditionAccess: ['Condition 1', 'Condition 2', 'Condition 3'],
        plafonds: ['Plafond 1', 'Plafond 2'],
        infrastructureAccess: ['Mobile', 'Web', 'USSD', 'Agency'],
      };

      const service = new Service(serviceProps);
      const dto = service.toDTO();

      expect(dto.conditionAccess).toHaveLength(3);
      expect(dto.plafonds).toHaveLength(2);
      expect(dto.infrastructureAccess).toHaveLength(4);
      expect(dto.conditionAccess).toEqual(serviceProps.conditionAccess);
      expect(dto.plafonds).toEqual(serviceProps.plafonds);
      expect(dto.infrastructureAccess).toEqual(serviceProps.infrastructureAccess);
    });
  });

  describe('Getters', () => {
    it('should return correct values from all getters', () => {
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Getter Test Service',
        longName: 'Getter Test Service Long Name',
        type: TypeService.WALLET_BANQUE,
        montantMin: 100000,
        montantMax: 100000,
        frais: new FraisFixes(200),
        conditionAccess: ['Access 1'],
        plafonds: ['Limit 1'],
        infrastructureAccess: ['Infrastructure 1'],
      };

      const service = new Service(serviceProps);

      expect(service.name).toBe('Getter Test Service');
      expect(service.longName).toBe('Getter Test Service Long Name');
      expect(service.type).toBe(TypeService.WALLET_BANQUE);
      expect(service.frais).toBeInstanceOf(FraisFixes);
      expect(service.conditionAccess).toEqual(['Access 1']);
      expect(service.plafonds).toEqual(['Limit 1']);
      expect(service.infrastructureAccess).toEqual(['Infrastructure 1']);
    });

    it('should return array references from getters', () => {
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Reference Test',
        longName: 'Reference Test Long',
        type: TypeService.AUTRES,
        montantMin: 100000,
        montantMax: 100000,
        frais: new FraisGratuit(),
        conditionAccess: ['Original'],
        plafonds: ['Original'],
        infrastructureAccess: ['Original'],
      };

      const service = new Service(serviceProps);

      const conditions = service.conditionAccess;
      conditions.push('Modified');

      // Arrays are returned by reference, so modification affects the original
      expect(service.conditionAccess).toEqual(['Original', 'Modified']);
      expect(service.conditionAccess).toBe(conditions);
    });
  });

  describe('Edge cases', () => {
    it('should handle service with very long name', () => {
      const longName = 'A'.repeat(500);
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Long Name Service',
        longName,
        type: TypeService.AUTRES,
        montantMin: 100000,
        montantMax: 100000,
        frais: new FraisGratuit(),
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const service = new Service(serviceProps);

      expect(service.longName).toBe(longName);
      expect(service.longName.length).toBe(500);
    });

    it('should handle service with many conditions', () => {
      const manyConditions = Array.from({ length: 50 }, (_, i) => `Condition ${i + 1}`);
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Many Conditions Service',
        longName: 'Many Conditions Service Long Name',
        type: TypeService.AUTRES,
        montantMin: 100000,
        montantMax: 100000,
        frais: new FraisGratuit(),
        conditionAccess: manyConditions,
        plafonds: [],
        infrastructureAccess: [],
      };

      const service = new Service(serviceProps);

      expect(service.conditionAccess).toHaveLength(50);
      expect(service.conditionAccess).toEqual(manyConditions);
    });

    it('should maintain reference equality for Frais object', () => {
      const frais = new FraisFixes(150, 0.01);
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Reference Test',
        longName: 'Reference Test Long',
        type: TypeService.AUTRES,
        montantMin: 100000,
        montantMax: 100000,
        frais,
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const service = new Service(serviceProps);

      expect(service.frais).toBe(frais);
    });
  });

  describe('Combination of TypeService and TypeCalculation', () => {
    it('should allow FREE calculation with any service type', () => {
      const serviceTypes = Object.values(TypeService);

      serviceTypes.forEach(serviceType => {
        const service = new Service({
          id: EntityId.generate(),
          name: 'Test',
          longName: 'Test Long',
          type: serviceType,
          montantMin: 100000,
          montantMax: 100000,
          frais: new FraisGratuit(),
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
        });

        expect(service.type).toBe(serviceType);
      });
    });

    it('should allow FIX calculation with transfer service', () => {
      const service = new Service({
        id: EntityId.generate(),
        name: 'Transfer Service',
        longName: 'Transfer Service Long',
        type: TypeService.TRANSFERT_ARGENT,
        montantMin: 100000,
        montantMax: 100000,
        frais: new FraisFixes(100),
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      });

      expect(service.type).toBe(TypeService.TRANSFERT_ARGENT);
    });

    it('should allow POURCENTAGE calculation with savings service', () => {
      const service = new Service({
        id: EntityId.generate(),
        name: 'Savings Service',
        longName: 'Savings Service Long',
        type: TypeService.EPARGNE,
        montantMin: 100000,
        montantMax: 100000,
        frais: new FraisPourcentage(0.02),
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      });

      expect(service.type).toBe(TypeService.EPARGNE);
    });
  });
});
