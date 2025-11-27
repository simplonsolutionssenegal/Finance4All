import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';
import { InstitutionType } from '@/domain/institutions/value-objects/InstitutionType';
import { Country } from '@/domain/institutions/value-objects/Country';
import { InstitutionStatus } from '@/domain/institutions/entities/Institution';

describe('InstitutionDTO', () => {
  it('should create a valid DTO with all required fields', () => {
    const dto: InstitutionDTO = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Institution',
      description: 'A test institution description',
      website: 'https://test.com',
      geographicZones: ['CEMAC', 'UEMOA'],
      logoUrl: 'https://test.com/logo.png',
      type: InstitutionType.ETABLISSEMENT_MONNAIE_ELECTRONIQUE,
      pays: Country.SENEGAL,
      status: InstitutionStatus.ACTIVE,
      services: [],
      createdAt: new Date('2025-11-04T10:00:00Z'),
      updatedAt: new Date('2025-11-04T10:00:00Z'),
    };

    expect(dto).toBeTruthy();
    expect(dto.id).toBeDefined();
    expect(dto.type).toBe(InstitutionType.ETABLISSEMENT_MONNAIE_ELECTRONIQUE);
    expect(dto.pays).toBe(Country.SENEGAL);
    expect(dto.status).toBe(InstitutionStatus.ACTIVE);
  });

  it('should allow null values for optional fields', () => {
    const dto: InstitutionDTO = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Institution',
      description: 'A test institution description',
      website: null,
      geographicZones: ['UEMOA'],
      logoUrl: null,
      type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
      pays: Country.CAMEROUN,
      status: InstitutionStatus.PENDING,
      services: [],
      createdAt: new Date('2025-11-04T10:00:00Z'),
      updatedAt: new Date('2025-11-04T10:00:00Z'),
    };

    expect(dto).toBeTruthy();
    expect(dto.website).toBeNull();
    expect(dto.logoUrl).toBeNull();
    expect(dto.geographicZones).toHaveLength(1);
  });

  it('should accept an empty services array', () => {
    const dto: InstitutionDTO = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Institution',
      description: 'A test institution description',
      website: 'https://test.com',
      geographicZones: [],
      logoUrl: 'https://test.com/logo.png',
      type: InstitutionType.SERVICE_PAIEMENT_ELECTRONIQUE,
      pays: Country.SENEGAL,
      status: InstitutionStatus.INACTIVE,
      services: [],
      createdAt: new Date('2025-11-04T10:00:00Z'),
      updatedAt: new Date('2025-11-04T10:00:00Z'),
    };

    expect(dto.services).toBeDefined();
    expect(Array.isArray(dto.services)).toBeTruthy();
    expect(dto.services).toHaveLength(0);
  });

  it('should ensure createdAt is before or equal to updatedAt', () => {
    const createdAt = new Date('2025-11-04T10:00:00Z');
    const updatedAt = new Date('2025-11-04T11:00:00Z');

    const dto: InstitutionDTO = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Institution',
      description: 'A test institution description',
      website: 'https://test.com',
      geographicZones: ['CEMAC'],
      logoUrl: 'https://test.com/logo.png',
      type: InstitutionType.BANQUE_NUMERIQUE,
      pays: Country.SENEGAL,
      status: InstitutionStatus.ACTIVE,
      services: [],
      createdAt,
      updatedAt,
    };

    expect(dto.createdAt.getTime()).toBeLessThanOrEqual(dto.updatedAt.getTime());
  });

  it('should accept different institution types', () => {
    const types = [
      InstitutionType.ETABLISSEMENT_MONNAIE_ELECTRONIQUE,
      InstitutionType.PORTEFEUILLE_NUMERIQUE,
      InstitutionType.SERVICE_PAIEMENT_ELECTRONIQUE,
      InstitutionType.BANQUE_NUMERIQUE,
      InstitutionType.SERVICE_FINANCIER_DECENTRALISE,
      InstitutionType.SERVICE_FINANCEMENT_PARTICIPATIF,
      InstitutionType.SERVICE_INVESTISSEMENT,
      InstitutionType.SERVICE_GESTION_FINANCIERE,
      InstitutionType.SERVICE_ASSURANCE_NUMERIQUE,
    ];

    types.forEach(type => {
      const dto: InstitutionDTO = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Institution',
        description: 'A test institution description',
        website: 'https://test.com',
        geographicZones: ['CEMAC'],
        logoUrl: 'https://test.com/logo.png',
        type,
        pays: Country.SENEGAL,
        status: InstitutionStatus.ACTIVE,
        services: [],
        createdAt: new Date('2025-11-04T10:00:00Z'),
        updatedAt: new Date('2025-11-04T10:00:00Z'),
      };

      expect(dto.type).toBe(type);
    });
  });

  it('should accept different institution statuses', () => {
    const statuses = [
      InstitutionStatus.ACTIVE,
      InstitutionStatus.INACTIVE,
      InstitutionStatus.PENDING,
    ];

    statuses.forEach(status => {
      const dto: InstitutionDTO = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Institution',
        description: 'A test institution description',
        website: 'https://test.com',
        geographicZones: ['CEMAC'],
        logoUrl: 'https://test.com/logo.png',
        type: InstitutionType.ETABLISSEMENT_MONNAIE_ELECTRONIQUE,
        pays: Country.SENEGAL,
        status,
        services: [],
        createdAt: new Date('2025-11-04T10:00:00Z'),
        updatedAt: new Date('2025-11-04T10:00:00Z'),
      };

      expect(dto.status).toBe(status);
    });
  });

  it('should accept both countries', () => {
    const countries = [Country.SENEGAL, Country.CAMEROUN];

    countries.forEach(country => {
      const dto: InstitutionDTO = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Institution',
        description: 'A test institution description',
        website: 'https://test.com',
        geographicZones: ['CEMAC'],
        logoUrl: 'https://test.com/logo.png',
        type: InstitutionType.ETABLISSEMENT_MONNAIE_ELECTRONIQUE,
        pays: country,
        status: InstitutionStatus.ACTIVE,
        services: [],
        createdAt: new Date('2025-11-04T10:00:00Z'),
        updatedAt: new Date('2025-11-04T10:00:00Z'),
      };

      expect(dto.pays).toBe(country);
    });
  });
});
