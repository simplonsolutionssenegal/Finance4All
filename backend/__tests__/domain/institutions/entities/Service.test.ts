import { Service, TypeService } from '@/domain/institutions/entities/Service';
import { EntityId } from '@/domain/shared/EntityId';
import { FraisGratuit } from '@/domain/institutions/entities/Frais';

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

  it('should convert to DTO correctly', () => {
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
    const dto = service.toDTO();

    expect(dto.id).toBe(serviceProps.id.getValue());
    expect(dto.name).toBe(serviceProps.name);
    expect(dto.longName).toBe(serviceProps.longName);
    expect(dto.type).toBe(serviceProps.type);
    expect(dto.frais).toBe(serviceProps.frais);
    expect(dto.conditionAccess).toEqual(serviceProps.conditionAccess);
    expect(dto.plafonds).toEqual(serviceProps.plafonds);
    expect(dto.infrastructureAccess).toEqual(serviceProps.infrastructureAccess);
  });
});
