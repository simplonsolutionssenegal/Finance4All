import {
  type InstitutionProps,
  Institution,
  InstitutionStatus,
} from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import { InstitutionType } from '@/domain/institutions/value-objects/InstitutionType';
import { Country } from '@/domain/institutions/value-objects/Country';
import { randomUUID } from 'node:crypto';

describe('Institution', () => {
  let testUuid: string;

  const createTestInstitution = (override: Partial<InstitutionProps> = {}) => {
    const defaultProps: InstitutionProps = {
      id: EntityId.from(testUuid),
      name: 'Test Institution',
      description: 'Test Description',
      type: InstitutionType.BANQUE_NUMERIQUE,
      website: UrlValueObject.from(null),
      geographicZones: ['EURO'],
      pays: Country.SENEGAL,
      logoUrl: UrlValueObject.from(null),
      status: InstitutionStatus.PENDING,
      services: [],
    };
    return new Institution({
      ...defaultProps,
      ...override,
    });
  };

  beforeEach(() => {
    testUuid = randomUUID();
  });

  describe('constructor', () => {
    it('should create an institution with all properties', () => {
      const institution = createTestInstitution({
        type: InstitutionType.BANQUE_NUMERIQUE,
        pays: Country.SENEGAL,
        website: UrlValueObject.from('https://test.com'),
        geographicZones: ['EURO', 'USD'],
        logoUrl: UrlValueObject.from('https://test.com/logo.png'),
      });

      expect(institution.id.getValue()).toBe(testUuid);
      expect(institution.name).toBe('Test Institution');
      expect(institution.description).toBe('Test Description');
      expect(institution.website.getValue()).toBe('https://test.com');
      expect(institution.geographicZones).toEqual(['EURO', 'USD']);
      expect(institution.logoUrl.getValue()).toBe('https://test.com/logo.png');
      expect(institution.status).toBe(InstitutionStatus.PENDING);
    });

    it('should create an institution with null website and logoUrl', () => {
      const institution = createTestInstitution({
        status: InstitutionStatus.ACTIVE,
        geographicZones: ['USD'],
      });

      expect(institution.website.getValue()).toBeNull();
      expect(institution.logoUrl.getValue()).toBeNull();
    });
  });

  describe('status management', () => {
    it('should activate institution', () => {
      const institution = createTestInstitution({
        geographicZones: ['USD'],
      });

      const beforeActivate = institution.updatedAt;

      institution.activate();

      expect(institution.status).toBe(InstitutionStatus.ACTIVE);
      expect(institution.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeActivate.getTime());
    });

    it('should deactivate institution', () => {
      const institution = createTestInstitution({
        status: InstitutionStatus.ACTIVE,
        geographicZones: ['USD'],
      });

      const beforeDeactivate = institution.updatedAt;

      institution.deactivate();

      expect(institution.status).toBe(InstitutionStatus.INACTIVE);
      expect(institution.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeDeactivate.getTime());
    });

    it('should set institution to pending', () => {
      const institution = createTestInstitution({
        status: InstitutionStatus.ACTIVE,
        geographicZones: ['USD'],
      });

      const beforePending = institution.updatedAt;

      institution.pending();

      expect(institution.status).toBe(InstitutionStatus.PENDING);
      expect(institution.updatedAt.getTime()).toBeGreaterThanOrEqual(beforePending.getTime());
    });
  });

  describe('geographic zones management', () => {
    it('should add geographic zone', () => {
      const institution = createTestInstitution({
        status: InstitutionStatus.ACTIVE,
        geographicZones: ['EURO'],
      });

      institution.addGeographicZone('USD');

      expect(institution.geographicZones).toContain('USD');
      expect(institution.geographicZones).toContain('EURO');
      expect(institution.geographicZones.length).toBe(2);
    });

    it('should remove geographic zone', () => {
      const institution = createTestInstitution({
        status: InstitutionStatus.ACTIVE,
        geographicZones: ['EURO', 'USD'],
      });

      institution.removeGeographicZone('USD');

      expect(institution.geographicZones).toContain('EURO');
      expect(institution.geographicZones).not.toContain('USD');
      expect(institution.geographicZones.length).toBe(1);
    });

    it('should check if operates in zone', () => {
      const institution = createTestInstitution({
        status: InstitutionStatus.ACTIVE,
        geographicZones: ['EURO', 'USD'],
      });

      expect(institution.operatesInZone('EURO')).toBe(true);
      expect(institution.operatesInZone('USD')).toBe(true);
      expect(institution.operatesInZone('GBP')).toBe(false);
    });
  });

  describe('update methods', () => {
    it('should update name', () => {
      const institution = createTestInstitution({
        name: 'Old Name',
        status: InstitutionStatus.ACTIVE,
      });

      institution.updateName('New Name');

      expect(institution.name).toBe('New Name');
    });

    it('should update description', () => {
      const institution = createTestInstitution({
        description: 'Old Description',
        status: InstitutionStatus.ACTIVE,
      });

      institution.updateDescription('New Description');

      expect(institution.description).toBe('New Description');
    });

    it('should throw error when updating description with empty string', () => {
      const institution = createTestInstitution({
        description: 'Old Description',
        status: InstitutionStatus.ACTIVE,
      });

      expect(() => institution.updateDescription('')).toThrow('Description cannot be empty');
      expect(() => institution.updateDescription('   ')).toThrow('Description cannot be empty');
    });

    it('should update website', () => {
      const institution = createTestInstitution({
        website: UrlValueObject.from('https://old.com'),
        status: InstitutionStatus.ACTIVE,
      });

      institution.updateWebsite(UrlValueObject.from('https://new.com'));

      expect(institution.website.getValue()).toBe('https://new.com');
    });

    it('should update logo', () => {
      const institution = createTestInstitution({
        logoUrl: UrlValueObject.from('https://old-logo.com'),
        status: InstitutionStatus.ACTIVE,
      });

      institution.updateLogo(UrlValueObject.from('https://new-logo.com'));

      expect(institution.logoUrl.getValue()).toBe('https://new-logo.com');
    });
  });

  describe('getters', () => {
    it('should return all property values correctly', () => {
      const institution = createTestInstitution({
        website: UrlValueObject.from('https://test.com'),
        geographicZones: ['EURO', 'USD', 'GBP'],
        logoUrl: UrlValueObject.from('https://test.com/logo.png'),
        status: InstitutionStatus.ACTIVE,
      });

      expect(institution.name).toBe('Test Institution');
      expect(institution.description).toBe('Test Description');
      expect(institution.website.getValue()).toBe('https://test.com');
      expect(institution.geographicZones).toEqual(['EURO', 'USD', 'GBP']);
      expect(institution.logoUrl.getValue()).toBe('https://test.com/logo.png');
      expect(institution.status).toBe(InstitutionStatus.ACTIVE);
    });
  });

  describe('services management', () => {
    it('should add service to institution', async () => {
      const { Service, TypeService } = await import('@/domain/institutions/entities/Service');
      const { FraisFixes } = await import('@/domain/institutions/entities/Frais');

      const institution = createTestInstitution({
        status: InstitutionStatus.ACTIVE,
      });

      const service = new Service({
        id: EntityId.from(randomUUID()),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.PAIEMENT_MARCHAND,
        frais: new FraisFixes(100),
        conditionAccess: ['Condition 1'],
        plafonds: ['Plafond 1'],
        infrastructureAccess: ['Infra 1'],
      });

      expect(institution.services).toHaveLength(0);

      institution.addService(service);

      expect(institution.services).toHaveLength(1);
      expect(institution.services[0]).toBe(service);
    });

    it('should remove service from institution', async () => {
      const { Service, TypeService } = await import('@/domain/institutions/entities/Service');
      const { FraisPourcentage } = await import('@/domain/institutions/entities/Frais');

      const service1 = new Service({
        id: EntityId.from(randomUUID()),
        name: 'Service 1',
        longName: 'Service 1 Long Name',
        type: TypeService.TRANSFERT_ARGENT,
        frais: new FraisPourcentage(0.02, 500, 50),
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      });

      const service2 = new Service({
        id: EntityId.from(randomUUID()),
        name: 'Service 2',
        longName: 'Service 2 Long Name',
        type: TypeService.EPARGNE,
        frais: new FraisPourcentage(0.01),
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      });

      const institution = createTestInstitution({
        status: InstitutionStatus.ACTIVE,
        services: [service1, service2],
      });

      expect(institution.services).toHaveLength(2);

      institution.removeService(service1);

      expect(institution.services).toHaveLength(1);
      expect(institution.services[0]).toBe(service2);
      expect(institution.services).not.toContain(service1);
    });

    it('should return services array from Set', async () => {
      const { Service, TypeService } = await import('@/domain/institutions/entities/Service');
      const { FraisGratuit } = await import('@/domain/institutions/entities/Frais');

      const service = new Service({
        id: EntityId.from(randomUUID()),
        name: 'Test Service',
        longName: 'Test Service Long Name',
        type: TypeService.ASSURANCE,
        frais: new FraisGratuit(),
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      });

      const institution = createTestInstitution({
        status: InstitutionStatus.ACTIVE,
        services: [service],
      });

      const services = institution.services;

      expect(Array.isArray(services)).toBe(true);
      expect(services).toHaveLength(1);
      expect(services[0]).toBe(service);
    });
  });
});
