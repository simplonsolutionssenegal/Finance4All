import { AddServiceUseCaseImpl } from '@/application/institutions/use-cases/AddServiceUseCaseImpl';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import { Institution, InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { TypeService } from '@/domain/institutions/entities/Service';
import { TypeCalculation } from '@/domain/institutions/entities/Frais';

describe('AddServiceUseCaseImpl', () => {
  let useCase: AddServiceUseCaseImpl;
  let mockRepository: jest.Mocked<InstitutionRepository>;
  const institutionId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    useCase = new AddServiceUseCaseImpl(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundError if institution does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const command = {
      idInstitution: 'non-existent-id',
      name: 'New Service',
      longName: 'New Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
      frais: { montantFixe: 100 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    await expect(useCase.execute(command)).rejects.toThrow(NotFoundError);
  });

  it('should add a service with FraisFixes', async () => {
    const existingInstitution = new Institution({
      id: EntityId.from(institutionId),
      name: 'Test Institution',
      description: 'Test Description',
      website: UrlValueObject.from('https://test.com'),
      geographicZones: ['UEMOA'],
      logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
      status: InstitutionStatus.ACTIVE,
      services: [],
    });
    mockRepository.findById.mockResolvedValue(existingInstitution);
    mockRepository.update.mockImplementation(async (institution: Institution) => institution);

    const command = {
      idInstitution: institutionId,
      name: 'New Service',
      longName: 'New Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
      frais: { montantFixe: 100 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = await useCase.execute(command);

    expect(result.services).toHaveLength(1);
    const newService = result.services[0];
    expect(newService.name).toBe('New Service');
    expect(newService.frais.typeCalculation).toBe(TypeCalculation.FIX);
    expect(newService.frais.montantFixe).toBe(100);
  });

  it('should add a service with FraisPourcentage', async () => {
    const existingInstitution = new Institution({
      id: EntityId.from(institutionId),
      name: 'Test Institution',
      description: 'Test Description',
      website: UrlValueObject.from('https://test.com'),
      geographicZones: ['UEMOA'],
      logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
      status: InstitutionStatus.ACTIVE,
      services: [],
    });
    mockRepository.findById.mockResolvedValue(existingInstitution);
    mockRepository.update.mockImplementation(async (institution: Institution) => institution);

    const command = {
      idInstitution: institutionId,
      name: 'New Service',
      longName: 'New Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
      frais: { pourcentage: 1.5 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = await useCase.execute(command);

    expect(result.services).toHaveLength(1);
    const newService = result.services[0];
    expect(newService.frais.typeCalculation).toBe(TypeCalculation.POURCENTAGE);
    expect(newService.frais.pourcentage).toBe(0.015);
  });

  it('should add a service with FraisGratuit', async () => {
    const existingInstitution = new Institution({
      id: EntityId.from(institutionId),
      name: 'Test Institution',
      description: 'Test Description',
      website: UrlValueObject.from('https://test.com'),
      geographicZones: ['UEMOA'],
      logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
      status: InstitutionStatus.ACTIVE,
      services: [],
    });
    mockRepository.findById.mockResolvedValue(existingInstitution);
    mockRepository.update.mockImplementation(async (institution: Institution) => institution);

    const command = {
      idInstitution: institutionId,
      name: 'New Service',
      longName: 'New Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
      frais: {},
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = await useCase.execute(command);

    expect(result.services).toHaveLength(1);
    const newService = result.services[0];
    expect(newService.frais.typeCalculation).toBe(TypeCalculation.FREE);
  });

  it('should add a service with FraisFixes and a rate', async () => {
    const existingInstitution = new Institution({
      id: EntityId.from(institutionId),
      name: 'Test Institution',
      description: 'Test Description',
      website: UrlValueObject.from('https://test.com'),
      geographicZones: ['UEMOA'],
      logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
      status: InstitutionStatus.ACTIVE,
      services: [],
    });
    mockRepository.findById.mockResolvedValue(existingInstitution);
    mockRepository.update.mockImplementation(async (institution: Institution) => institution);

    const command = {
      idInstitution: institutionId,
      name: 'New Service',
      longName: 'New Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
      frais: { montantFixe: 100, pourcentage: 0.5 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = await useCase.execute(command);

    expect(result.services).toHaveLength(1);
    const newService = result.services[0];
    expect(newService.frais.typeCalculation).toBe(TypeCalculation.FIX);
    expect(newService.frais.montantFixe).toBe(100);
    expect(newService.frais.pourcentage).toBe(0.005);
  });

  it('should add a service with FraisPourcentage with min and max', async () => {
    const existingInstitution = new Institution({
      id: EntityId.from(institutionId),
      name: 'Test Institution',
      description: 'Test Description',
      website: UrlValueObject.from('https://test.com'),
      geographicZones: ['UEMOA'],
      logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
      status: InstitutionStatus.ACTIVE,
      services: [],
    });
    mockRepository.findById.mockResolvedValue(existingInstitution);
    mockRepository.update.mockImplementation(async (institution: Institution) => institution);

    const command = {
      idInstitution: institutionId,
      name: 'New Service',
      longName: 'New Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
      frais: { pourcentage: 1, minimum: 50, maximum: 1000 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = await useCase.execute(command);

    expect(result.services).toHaveLength(1);
    const newService = result.services[0];
    expect(newService.frais.typeCalculation).toBe(TypeCalculation.POURCENTAGE);
    expect(newService.frais.pourcentage).toBe(0.01);
    expect(newService.frais.minimum).toBe(50);
    expect(newService.frais.maximum).toBe(1000);
  });
});
