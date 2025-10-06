import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import { Institution, InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';

describe('Institution Entity', () => {
  let institution: Institution;

  beforeEach(() => {
    institution = new Institution({
      id: EntityId.generate(),
      name: 'Test Bank',
      description: 'A test bank for unit testing',
      website: UrlValueObject.from('https://testbank.com'),
      geographicZones: ['Europe', 'Asia'],
      logoUrl: UrlValueObject.from('https://testbank.com/logo.png'),
      status: InstitutionStatus.PENDING,
    });
  });

  describe('Creation', () => {
    it('should create an institution with valid data', () => {
      expect(institution).toBeDefined();
      expect(institution.name).toBe('Test Bank');
      expect(institution.description).toBe('A test bank for unit testing');
      expect(institution.website.getValue()).toBe('https://testbank.com');
      expect(institution.geographicZones).toEqual(['Europe', 'Asia']);
      expect(institution.logoUrl).toBe('https://testbank.com/logo.png');
    });
  });

  describe('Geographic Zones', () => {
    it('should add a geographic zone', () => {
      institution.addGeographicZone('Africa');
      expect(institution.geographicZones).toContain('Africa');
    });

    it('should remove a geographic zone', () => {
      institution.removeGeographicZone('Europe');
      expect(institution.geographicZones).not.toContain('Europe');
    });

    it('should check if operates in a zone', () => {
      expect(institution.operatesInZone('Europe')).toBe(true);
      expect(institution.operatesInZone('America')).toBe(false);
    });
  });

  describe('Updates', () => {
    it('should update name', () => {
      const newName = 'Updated Bank';
      institution.updateName(newName);
      expect(institution.name).toBe('Updated Bank');
    });

    it('should update description', () => {
      institution.updateDescription('New description');
      expect(institution.description).toBe('New description');
    });

    it('should throw error for empty description', () => {
      expect(() => institution.updateDescription('')).toThrow('Description cannot be empty');
    });

    it('should update website', () => {
      const newWebsite = UrlValueObject.from('https://newbank.com');
      institution.updateWebsite(newWebsite);
      expect(institution.website.getValue()).toBe('https://newbank.com');
    });

    it('should update logo', () => {
      institution.updateLogo(UrlValueObject.from('https://newlogo.com/logo.png'));
      expect(institution.logoUrl).toBe('https://newlogo.com/logo.png');
    });
  });
});
