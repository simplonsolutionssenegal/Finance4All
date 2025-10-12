import { Institution, InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import { randomUUID } from 'crypto';

describe('Institution', () => {
  let testUuid: string;

  beforeEach(() => {
    testUuid = randomUUID();
  });

  describe('constructor', () => {
    it('should create an institution with all properties', () => {
      const institution = new Institution({
        id: EntityId.from(testUuid),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from('https://test.com'),
        geographicZones: ['EURO', 'USD'],
        logoUrl: UrlValueObject.from('https://test.com/logo.png'),
        status: InstitutionStatus.PENDING,
        services: [],
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
      const institution = new Institution({
        id: EntityId.from(testUuid),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from(null),
        geographicZones: ['USD'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      expect(institution.website.getValue()).toBeNull();
      expect(institution.logoUrl.getValue()).toBeNull();
    });
  });

  describe('status management', () => {
    it('should activate institution', () => {
      const institution = new Institution({
        id: EntityId.from(testUuid),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from(null),
        geographicZones: ['USD'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.PENDING,
        services: [],
      });

      const beforeActivate = institution.updatedAt;

      // Small delay to ensure updatedAt changes
      setTimeout(() => {
        institution.activate();

        expect(institution.status).toBe(InstitutionStatus.ACTIVE);
        expect(institution.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeActivate.getTime());
      }, 10);
    });

    it('should deactivate institution', () => {
      const institution = new Institution({
        id: EntityId.from(testUuid),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from(null),
        geographicZones: ['USD'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      const beforeDeactivate = institution.updatedAt;

      setTimeout(() => {
        institution.deactivate();

        expect(institution.status).toBe(InstitutionStatus.INACTIVE);
        expect(institution.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeDeactivate.getTime());
      }, 10);
    });

    it('should set institution to pending', () => {
      const institution = new Institution({
        id: EntityId.from(testUuid),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from(null),
        geographicZones: ['USD'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      const beforePending = institution.updatedAt;

      institution.pending();

      expect(institution.status).toBe(InstitutionStatus.PENDING);
      expect(institution.updatedAt.getTime()).toBeGreaterThanOrEqual(beforePending.getTime());
    });
  });

  describe('geographic zones management', () => {
    it('should add geographic zone', () => {
      const institution = new Institution({
        id: EntityId.from(testUuid),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from(null),
        geographicZones: ['EURO'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      institution.addGeographicZone('USD');

      expect(institution.geographicZones).toContain('USD');
      expect(institution.geographicZones).toContain('EURO');
      expect(institution.geographicZones.length).toBe(2);
    });

    it('should remove geographic zone', () => {
      const institution = new Institution({
        id: EntityId.from(testUuid),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from(null),
        geographicZones: ['EURO', 'USD'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      institution.removeGeographicZone('USD');

      expect(institution.geographicZones).toContain('EURO');
      expect(institution.geographicZones).not.toContain('USD');
      expect(institution.geographicZones.length).toBe(1);
    });

    it('should check if operates in zone', () => {
      const institution = new Institution({
        id: EntityId.from(testUuid),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from(null),
        geographicZones: ['EURO', 'USD'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      expect(institution.operatesInZone('EURO')).toBe(true);
      expect(institution.operatesInZone('USD')).toBe(true);
      expect(institution.operatesInZone('GBP')).toBe(false);
    });
  });

  describe('update methods', () => {
    it('should update name', () => {
      const institution = new Institution({
        id: EntityId.from(testUuid),
        name: 'Old Name',
        description: 'Test Description',
        website: UrlValueObject.from(null),
        geographicZones: ['EURO'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      institution.updateName('New Name');

      expect(institution.name).toBe('New Name');
    });

    it('should update description', () => {
      const institution = new Institution({
        id: EntityId.from(testUuid),
        name: 'Test Institution',
        description: 'Old Description',
        website: UrlValueObject.from(null),
        geographicZones: ['EURO'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      institution.updateDescription('New Description');

      expect(institution.description).toBe('New Description');
    });

    it('should throw error when updating description with empty string', () => {
      const institution = new Institution({
        id: EntityId.from(testUuid),
        name: 'Test Institution',
        description: 'Old Description',
        website: UrlValueObject.from(null),
        geographicZones: ['EURO'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      expect(() => institution.updateDescription('')).toThrow('Description cannot be empty');
      expect(() => institution.updateDescription('   ')).toThrow('Description cannot be empty');
    });

    it('should update website', () => {
      const institution = new Institution({
        id: EntityId.from(testUuid),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from('https://old.com'),
        geographicZones: ['EURO'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      institution.updateWebsite(UrlValueObject.from('https://new.com'));

      expect(institution.website.getValue()).toBe('https://new.com');
    });

    it('should update logo', () => {
      const institution = new Institution({
        id: EntityId.from(testUuid),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from(null),
        geographicZones: ['EURO'],
        logoUrl: UrlValueObject.from('https://old-logo.com'),
        status: InstitutionStatus.ACTIVE,
        services: [],
      });

      institution.updateLogo(UrlValueObject.from('https://new-logo.com'));

      expect(institution.logoUrl.getValue()).toBe('https://new-logo.com');
    });
  });

  describe('getters', () => {
    it('should return all property values correctly', () => {
      const institution = new Institution({
        id: EntityId.from(testUuid),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from('https://test.com'),
        geographicZones: ['EURO', 'USD', 'GBP'],
        logoUrl: UrlValueObject.from('https://test.com/logo.png'),
        status: InstitutionStatus.ACTIVE,
        services: [],
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

      const institution = new Institution({
        id: EntityId.from(testUuid),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from(null),
        geographicZones: ['EURO'],
        logoUrl: UrlValueObject.from(null),
        status: InstitutionStatus.ACTIVE,
        services: [],
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

      const institution = new Institution({
        id: EntityId.from(testUuid),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from(null),
        geographicZones: ['EURO'],
        logoUrl: UrlValueObject.from(null),
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

      const institution = new Institution({
        id: EntityId.from(testUuid),
        name: 'Test Institution',
        description: 'Test Description',
        website: UrlValueObject.from(null),
        geographicZones: ['EURO'],
        logoUrl: UrlValueObject.from(null),
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
