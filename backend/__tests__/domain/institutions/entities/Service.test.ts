import { Service, TypeService } from '@/domain/institutions/entities/Service';
import { EntityId } from '@/domain/shared/EntityId';
import { FraisGratuit, FraisFixes, FraisPourcentage } from '@/domain/institutions/entities/Frais';

describe('Service', () => {
  it('should create a service with all properties', () => {
    const serviceProps = {
      id: EntityId.generate(),
      name: 'Test Service',
      longName: 'Test Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
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

  describe('toDTO', () => {
    it('should convert to DTO correctly with FraisGratuit', () => {
      const frais = new FraisGratuit();
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.PAIEMENT_MARCHAND,
        frais,
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
      expect(dto.frais).toEqual(frais.toDTO());
      expect(dto.frais).toEqual({});
      expect(dto.isGratuit).toBe(true);
      expect(dto.conditionAccess).toEqual(serviceProps.conditionAccess);
      expect(dto.plafonds).toEqual(serviceProps.plafonds);
      expect(dto.infrastructureAccess).toEqual(serviceProps.infrastructureAccess);
    });

    it('should convert to DTO correctly with FraisFixes', () => {
      const frais = new FraisFixes(100, 0.02, 50);
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.TRANSFERT_ARGENT,
        frais,
        conditionAccess: ['Condition 1'],
        plafonds: ['Plafond 1'],
        infrastructureAccess: ['Infra 1'],
      };

      const service = new Service(serviceProps);
      const dto = service.toDTO();

      expect(dto.id).toBe(serviceProps.id.getValue());
      expect(dto.name).toBe(serviceProps.name);
      expect(dto.frais).toEqual(frais.toDTO());
      expect(dto.frais).toEqual({
        montantFixe: 150, // 100 + 50 (fxSurcharge)
        pourcentage: 2, // 0.02 * 100
      });
      expect(dto.isGratuit).toBe(false);
    });

    it('should convert to DTO correctly with FraisFixes (only amount)', () => {
      const frais = new FraisFixes(100);
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.DEPOT_SIMPLE,
        frais,
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const service = new Service(serviceProps);
      const dto = service.toDTO();

      expect(dto.frais).toEqual({
        montantFixe: 100,
      });
      expect(dto.isGratuit).toBe(false);
    });

    it('should convert to DTO correctly with FraisPourcentage', () => {
      const frais = new FraisPourcentage(0.015, 500, 50);
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.EPARGNE,
        frais,
        conditionAccess: ['Condition 1'],
        plafonds: ['Plafond 1'],
        infrastructureAccess: ['Infra 1'],
      };

      const service = new Service(serviceProps);
      const dto = service.toDTO();

      expect(dto.id).toBe(serviceProps.id.getValue());
      expect(dto.name).toBe(serviceProps.name);
      expect(dto.frais).toEqual(frais.toDTO());
      expect(dto.frais).toEqual({
        pourcentage: 1.5, // 0.015 * 100
        minimum: 50,
        maximum: 500,
      });
      expect(dto.isGratuit).toBe(false);
    });

    it('should convert to DTO correctly with FraisPourcentage (only rate)', () => {
      const frais = new FraisPourcentage(0.03);
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.CREDIT,
        frais,
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const service = new Service(serviceProps);
      const dto = service.toDTO();

      expect(dto.frais).toEqual({
        pourcentage: 3, // 0.03 * 100
      });
      expect(dto.isGratuit).toBe(false);
    });

    it('should convert to DTO correctly with FraisPourcentage (with cap only)', () => {
      const frais = new FraisPourcentage(0.025, 1000);
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.ASSURANCE,
        frais,
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const service = new Service(serviceProps);
      const dto = service.toDTO();

      expect(dto.frais).toEqual({
        pourcentage: 2.5, // 0.025 * 100
        maximum: 1000,
      });
      expect(dto.isGratuit).toBe(false);
    });

    it('should convert to DTO correctly with FraisPourcentage (with floor only)', () => {
      const frais = new FraisPourcentage(0.02, undefined, 100);
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.WALLET_BANQUE,
        frais,
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const service = new Service(serviceProps);
      const dto = service.toDTO();

      expect(dto.frais).toEqual({
        pourcentage: 2, // 0.02 * 100
        minimum: 100,
      });
      expect(dto.isGratuit).toBe(false);
    });

    it('should mark FraisFixes with zero values as gratuit', () => {
      const frais = new FraisFixes(0, 0, 0);
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.AUTRES,
        frais,
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const service = new Service(serviceProps);
      const dto = service.toDTO();

      expect(dto.isGratuit).toBe(true);
      expect(dto.frais).toEqual({});
    });

    it('should mark FraisPourcentage with zero rate as gratuit', () => {
      const frais = new FraisPourcentage(0);
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.AUTRES,
        frais,
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const service = new Service(serviceProps);
      const dto = service.toDTO();

      expect(dto.isGratuit).toBe(true);
      expect(dto.frais).toEqual({});
    });
  });

  describe('TypeService enum', () => {
    it('should have all service types available', () => {
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

  describe('Service properties', () => {
    it('should handle empty arrays for conditions, plafonds, and infrastructure', () => {
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.PAIEMENT_MARCHAND,
        frais: new FraisGratuit(),
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const service = new Service(serviceProps);
      const dto = service.toDTO();

      expect(dto.conditionAccess).toEqual([]);
      expect(dto.plafonds).toEqual([]);
      expect(dto.infrastructureAccess).toEqual([]);
    });

    it('should handle multiple items in arrays', () => {
      const serviceProps = {
        id: EntityId.generate(),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.PAIEMENT_MARCHAND,
        frais: new FraisGratuit(),
        conditionAccess: ['Condition 1', 'Condition 2', 'Condition 3'],
        plafonds: ['Plafond 1', 'Plafond 2'],
        infrastructureAccess: ['Infra 1', 'Infra 2', 'Infra 3', 'Infra 4'],
      };

      const service = new Service(serviceProps);
      const dto = service.toDTO();

      expect(dto.conditionAccess).toHaveLength(3);
      expect(dto.plafonds).toHaveLength(2);
      expect(dto.infrastructureAccess).toHaveLength(4);
    });
  });
});
