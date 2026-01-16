import { UpdateServiceUseCaseImpl } from '@/application/institutions/use-cases/UpdateServiceUseCaseImpl';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import { Institution, InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { TypeService, Service } from '@/domain/institutions/entities/Service';
import { TypeCalculation as FraisTypeCalculation } from '@/domain/institutions/entities/Frais';
import { InstitutionType } from '@/domain/institutions/value-objects/InstitutionType';
import { Country } from '@/domain/institutions/value-objects/Country';
import { FraisFactory } from '@/domain/institutions/factories/FraisFactory';

describe('UpdateServiceUseCaseImpl', () => {
  let useCase: UpdateServiceUseCaseImpl;
  let mockRepository: jest.Mocked<InstitutionRepository>;
  const institutionId = '123e4567-e89b-12d3-a456-426614174000';
  const serviceId = '456e7890-e89b-12d3-a456-426614174111';

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    useCase = new UpdateServiceUseCaseImpl(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundError if institution does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const command = {
      idInstitution: 'non-existent-id',
      idService: serviceId,
      name: 'Updated Service',
      longName: 'Updated Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
      montantMin: 50000,
      montantMax: 200000,
      frais: { montantFixe: 150 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    await expect(useCase.execute(command)).rejects.toThrow(NotFoundError);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError if service does not exist', async () => {
    const existingInstitution = new Institution({
      id: EntityId.from(institutionId),
      name: 'Test Institution',
      description: 'Test Description',
      website: UrlValueObject.from('https://test.com'),
      geographicZones: ['UEMOA'],
      logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
      status: InstitutionStatus.ACTIVE,
      services: [],
      type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
      pays: Country.SENEGAL,
    });

    mockRepository.findById.mockResolvedValue(existingInstitution);

    const command = {
      idInstitution: institutionId,
      idService: 'non-existent-service-id',
      name: 'Updated Service',
      longName: 'Updated Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
      montantMin: 50000,
      montantMax: 200000,
      frais: { montantFixe: 150 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    await expect(useCase.execute(command)).rejects.toThrow(NotFoundError);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should update a service with FraisFixes', async () => {
    const existingService = new Service({
      id: EntityId.from(serviceId),
      name: 'Old Service',
      longName: 'Old Service Long Name',
      type: TypeService.DEPOT_SIMPLE,
      montantMin: 10000,
      montantMax: 50000,
      frais: FraisFactory.createFromDTO({ montantFixe: 50 }),
      conditionAccess: ['OLD_CONDITION'],
      plafonds: ['OLD_PLAFOND'],
      infrastructureAccess: ['OLD_INFRA'],
    });

    const existingInstitution = new Institution({
      id: EntityId.from(institutionId),
      name: 'Test Institution',
      description: 'Test Description',
      website: UrlValueObject.from('https://test.com'),
      geographicZones: ['UEMOA'],
      logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
      status: InstitutionStatus.ACTIVE,
      services: [existingService],
      type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
      pays: Country.SENEGAL,
    });

    mockRepository.findById.mockResolvedValue(existingInstitution);
    mockRepository.update.mockImplementation(async (institution: Institution) => institution);

    const command = {
      idInstitution: institutionId,
      idService: serviceId,
      name: 'Updated Service',
      longName: 'Updated Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
      montantMin: 50000,
      montantMax: 200000,
      frais: { montantFixe: 150 },
      conditionAccess: ['NEW_CONDITION'],
      plafonds: ['NEW_PLAFOND'],
      infrastructureAccess: ['NEW_INFRA'],
    };

    const result = await useCase.execute(command);

    expect(mockRepository.findById).toHaveBeenCalledWith(institutionId);
    expect(mockRepository.update).toHaveBeenCalledWith(existingInstitution);

    const updatedService = result.services[0];
    expect(updatedService.name).toBe('Updated Service');
    expect(updatedService.longName).toBe('Updated Service Long Name');
    expect(updatedService.type).toBe(TypeService.PAIEMENT_MARCHAND);
    expect(updatedService.montantMin).toBe(50000);
    expect(updatedService.montantMax).toBe(200000);
    expect(updatedService.frais.typeCalculation).toBe(FraisTypeCalculation.FIX);
    expect(updatedService.frais.montantFixe).toBe(150);
    expect(updatedService.conditionAccess).toEqual(['NEW_CONDITION']);
    expect(updatedService.plafonds).toEqual(['NEW_PLAFOND']);
    expect(updatedService.infrastructureAccess).toEqual(['NEW_INFRA']);
  });

  it('should update a service with FraisPourcentage', async () => {
    const existingService = new Service({
      id: EntityId.from(serviceId),
      name: 'Old Service',
      longName: 'Old Service Long Name',
      type: TypeService.DEPOT_SIMPLE,
      montantMin: 10000,
      montantMax: 50000,
      frais: FraisFactory.createFromDTO({ montantFixe: 50 }),
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    });

    const existingInstitution = new Institution({
      id: EntityId.from(institutionId),
      name: 'Test Institution',
      description: 'Test Description',
      website: UrlValueObject.from('https://test.com'),
      geographicZones: ['UEMOA'],
      logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
      status: InstitutionStatus.ACTIVE,
      services: [existingService],
      type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
      pays: Country.SENEGAL,
    });

    mockRepository.findById.mockResolvedValue(existingInstitution);
    mockRepository.update.mockImplementation(async (institution: Institution) => institution);

    const command = {
      idInstitution: institutionId,
      idService: serviceId,
      name: 'Updated Service',
      longName: 'Updated Service Long Name',
      type: TypeService.TRANSFERT_ARGENT,
      montantMin: 100000,
      montantMax: 500000,
      frais: { pourcentage: 2.5 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = await useCase.execute(command);

    const updatedService = result.services[0];
    expect(updatedService.frais.typeCalculation).toBe(FraisTypeCalculation.POURCENTAGE);
    expect(updatedService.frais.pourcentage).toBe(0.025);
  });

  it('should update a service to FraisGratuit', async () => {
    const existingService = new Service({
      id: EntityId.from(serviceId),
      name: 'Old Service',
      longName: 'Old Service Long Name',
      type: TypeService.DEPOT_SIMPLE,
      montantMin: 10000,
      montantMax: 50000,
      frais: FraisFactory.createFromDTO({ montantFixe: 50 }),
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    });

    const existingInstitution = new Institution({
      id: EntityId.from(institutionId),
      name: 'Test Institution',
      description: 'Test Description',
      website: UrlValueObject.from('https://test.com'),
      geographicZones: ['UEMOA'],
      logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
      status: InstitutionStatus.ACTIVE,
      services: [existingService],
      type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
      pays: Country.SENEGAL,
    });

    mockRepository.findById.mockResolvedValue(existingInstitution);
    mockRepository.update.mockImplementation(async (institution: Institution) => institution);

    const command = {
      idInstitution: institutionId,
      idService: serviceId,
      name: 'Updated Service',
      longName: 'Updated Service Long Name',
      type: TypeService.DEPOT_SIMPLE,
      montantMin: 0,
      montantMax: 100000,
      frais: {},
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = await useCase.execute(command);

    const updatedService = result.services[0];
    expect(updatedService.frais.typeCalculation).toBe(FraisTypeCalculation.FREE);
  });

  it('should update a service with FraisPourcentage with min and max', async () => {
    const existingService = new Service({
      id: EntityId.from(serviceId),
      name: 'Old Service',
      longName: 'Old Service Long Name',
      type: TypeService.DEPOT_SIMPLE,
      montantMin: 10000,
      montantMax: 50000,
      frais: FraisFactory.createFromDTO({ montantFixe: 50 }),
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    });

    const existingInstitution = new Institution({
      id: EntityId.from(institutionId),
      name: 'Test Institution',
      description: 'Test Description',
      website: UrlValueObject.from('https://test.com'),
      geographicZones: ['UEMOA'],
      logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
      status: InstitutionStatus.ACTIVE,
      services: [existingService],
      type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
      pays: Country.SENEGAL,
    });

    mockRepository.findById.mockResolvedValue(existingInstitution);
    mockRepository.update.mockImplementation(async (institution: Institution) => institution);

    const command = {
      idInstitution: institutionId,
      idService: serviceId,
      name: 'Updated Service',
      longName: 'Updated Service Long Name',
      type: TypeService.TRANSFERT_ARGENT,
      montantMin: 100000,
      montantMax: 1000000,
      frais: { pourcentage: 1.5, minimum: 100, maximum: 5000 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = await useCase.execute(command);

    const updatedService = result.services[0];
    expect(updatedService.frais.typeCalculation).toBe(FraisTypeCalculation.POURCENTAGE);
    expect(updatedService.frais.pourcentage).toBe(0.015);
    expect(updatedService.frais.minimum).toBe(100);
    expect(updatedService.frais.maximum).toBe(5000);
  });

  it('should update a service with FraisFixes and pourcentage', async () => {
    const existingService = new Service({
      id: EntityId.from(serviceId),
      name: 'Old Service',
      longName: 'Old Service Long Name',
      type: TypeService.DEPOT_SIMPLE,
      montantMin: 10000,
      montantMax: 50000,
      frais: FraisFactory.createFromDTO({ montantFixe: 50 }),
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    });

    const existingInstitution = new Institution({
      id: EntityId.from(institutionId),
      name: 'Test Institution',
      description: 'Test Description',
      website: UrlValueObject.from('https://test.com'),
      geographicZones: ['UEMOA'],
      logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
      status: InstitutionStatus.ACTIVE,
      services: [existingService],
      type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
      pays: Country.SENEGAL,
    });

    mockRepository.findById.mockResolvedValue(existingInstitution);
    mockRepository.update.mockImplementation(async (institution: Institution) => institution);

    const command = {
      idInstitution: institutionId,
      idService: serviceId,
      name: 'Updated Service',
      longName: 'Updated Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
      montantMin: 50000,
      montantMax: 300000,
      frais: { montantFixe: 200, pourcentage: 0.5 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = await useCase.execute(command);

    const updatedService = result.services[0];
    expect(updatedService.frais.typeCalculation).toBe(FraisTypeCalculation.FIX);
    expect(updatedService.frais.montantFixe).toBe(200);
    expect(updatedService.frais.pourcentage).toBe(0.005);
  });

  it('should throw error when updating service with empty name', async () => {
    const existingService = new Service({
      id: EntityId.from(serviceId),
      name: 'Old Service',
      longName: 'Old Service Long Name',
      type: TypeService.DEPOT_SIMPLE,
      montantMin: 10000,
      montantMax: 50000,
      frais: FraisFactory.createFromDTO({ montantFixe: 50 }),
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    });

    const existingInstitution = new Institution({
      id: EntityId.from(institutionId),
      name: 'Test Institution',
      description: 'Test Description',
      website: UrlValueObject.from('https://test.com'),
      geographicZones: ['UEMOA'],
      logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
      status: InstitutionStatus.ACTIVE,
      services: [existingService],
      type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
      pays: Country.SENEGAL,
    });

    mockRepository.findById.mockResolvedValue(existingInstitution);

    const command = {
      idInstitution: institutionId,
      idService: serviceId,
      name: '',
      longName: 'Updated Long Name',
      type: TypeService.DEPOT_SIMPLE,
      montantMin: 10000,
      montantMax: 50000,
      frais: { montantFixe: 50 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    await expect(useCase.execute(command)).rejects.toThrow('Service name cannot be empty');
  });

  it('should throw error when updating service with invalid montants', async () => {
    const existingService = new Service({
      id: EntityId.from(serviceId),
      name: 'Old Service',
      longName: 'Old Service Long Name',
      type: TypeService.DEPOT_SIMPLE,
      montantMin: 10000,
      montantMax: 50000,
      frais: FraisFactory.createFromDTO({ montantFixe: 50 }),
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    });

    const existingInstitution = new Institution({
      id: EntityId.from(institutionId),
      name: 'Test Institution',
      description: 'Test Description',
      website: UrlValueObject.from('https://test.com'),
      geographicZones: ['UEMOA'],
      logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
      status: InstitutionStatus.ACTIVE,
      services: [existingService],
      type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
      pays: Country.SENEGAL,
    });

    mockRepository.findById.mockResolvedValue(existingInstitution);

    const command = {
      idInstitution: institutionId,
      idService: serviceId,
      name: 'Updated Service',
      longName: 'Updated Long Name',
      type: TypeService.DEPOT_SIMPLE,
      montantMin: 100000,
      montantMax: 50000,
      frais: { montantFixe: 50 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    await expect(useCase.execute(command)).rejects.toThrow(
      'montantMin cannot be greater than montantMax'
    );
  });
});
