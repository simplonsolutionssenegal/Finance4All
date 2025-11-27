import { AddServiceUseCaseImpl } from '@/application/institutions/use-cases/AddServiceUseCaseImpl';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import { Institution, InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { TypeService } from '@/domain/institutions/entities/Service';
import { TypeCalculation as FraisTypeCalculation } from '@/domain/institutions/entities/Frais';
import { InstitutionType } from '@/domain/institutions/value-objects/InstitutionType';
import { Country } from '@/domain/institutions/value-objects/Country';

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
      montantMin: 100000,
      montantMax: 100000,
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
      type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
      pays: Country.SENEGAL,
    });
    mockRepository.findById.mockResolvedValue(existingInstitution);
    mockRepository.update.mockImplementation(async (institution: Institution) => institution);

    const command = {
      idInstitution: institutionId,
      name: 'New Service',
      longName: 'New Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
      montantMin: 100000,
      montantMax: 100000,
      frais: { montantFixe: 100 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = await useCase.execute(command);

    expect(result.services).toHaveLength(1);
    const newService = result.services[0];
    expect(newService.name).toBe('New Service');
    expect(newService.frais.typeCalculation).toBe(FraisTypeCalculation.FIX);
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
      type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
      pays: Country.SENEGAL,
    });
    mockRepository.findById.mockResolvedValue(existingInstitution);
    mockRepository.update.mockImplementation(async (institution: Institution) => institution);

    const command = {
      idInstitution: institutionId,
      name: 'New Service',
      longName: 'New Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
      montantMin: 100000,
      montantMax: 100000,
      frais: { pourcentage: 1.5 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = await useCase.execute(command);

    expect(result.services).toHaveLength(1);
    const newService = result.services[0];
    expect(newService.frais.typeCalculation).toBe(FraisTypeCalculation.POURCENTAGE);
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
      type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
      pays: Country.SENEGAL,
    });
    mockRepository.findById.mockResolvedValue(existingInstitution);
    mockRepository.update.mockImplementation(async (institution: Institution) => institution);

    const command = {
      idInstitution: institutionId,
      name: 'New Service',
      longName: 'New Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
      montantMin: 100000,
      montantMax: 100000,
      frais: {},
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = await useCase.execute(command);

    expect(result.services).toHaveLength(1);
    const newService = result.services[0];
    expect(newService.frais.typeCalculation).toBe(FraisTypeCalculation.FREE);
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
      type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
      pays: Country.SENEGAL,
    });
    mockRepository.findById.mockResolvedValue(existingInstitution);
    mockRepository.update.mockImplementation(async (institution: Institution) => institution);

    const command = {
      idInstitution: institutionId,
      name: 'New Service',
      longName: 'New Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
      montantMin: 100000,
      montantMax: 100000,
      frais: { montantFixe: 100, pourcentage: 0.5 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = await useCase.execute(command);

    expect(result.services).toHaveLength(1);
    const newService = result.services[0];
    expect(newService.frais.typeCalculation).toBe(FraisTypeCalculation.FIX);
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
      type: InstitutionType.PORTEFEUILLE_NUMERIQUE,
      pays: Country.SENEGAL,
    });
    mockRepository.findById.mockResolvedValue(existingInstitution);
    mockRepository.update.mockImplementation(async (institution: Institution) => institution);

    const command = {
      idInstitution: institutionId,
      name: 'New Service',
      longName: 'New Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
      montantMin: 100000,
      montantMax: 100000,
      frais: { pourcentage: 1, minimum: 50, maximum: 1000 },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = await useCase.execute(command);

    expect(result.services).toHaveLength(1);
    const newService = result.services[0];
    expect(newService.frais.typeCalculation).toBe(FraisTypeCalculation.POURCENTAGE);
    expect(newService.frais.pourcentage).toBe(0.01);
    expect(newService.frais.minimum).toBe(50);
    expect(newService.frais.maximum).toBe(1000);
  });

  // Remplacer les deux tests qui échouent par ceux-ci :

  it('should create FraisGratuit when frais object is empty', async () => {
    const existingInstitution = new Institution({
      id: EntityId.from(institutionId),
      name: 'Test Institution',
      description: 'Test Description',
      website: UrlValueObject.from('https://test.com'),
      geographicZones: ['UEMOA'],
      logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
      status: InstitutionStatus.ACTIVE,
      type: InstitutionType.PORTEFEUILLE_NUMERIQUE, // Ajouter cette ligne
      pays: Country.SENEGAL, // Ajouter cette ligne
      services: [],
    });
    mockRepository.findById.mockResolvedValue(existingInstitution);
    mockRepository.update.mockImplementation(async (institution: Institution) => institution);

    const command = {
      idInstitution: institutionId,
      name: 'New Service',
      longName: 'New Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
      montantMin: 100000,
      montantMax: 100000,
      frais: {}, // Objet vide
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = await useCase.execute(command);

    expect(result.services).toHaveLength(1);
    const newService = result.services[0];
    expect(newService.frais.typeCalculation).toBe(FraisTypeCalculation.FREE);
  });

  it('should create FraisGratuit when montantFixe is zero', async () => {
    const existingInstitution = new Institution({
      id: EntityId.from(institutionId),
      name: 'Test Institution',
      description: 'Test Description',
      website: UrlValueObject.from('https://test.com'),
      geographicZones: ['UEMOA'],
      logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
      status: InstitutionStatus.ACTIVE,
      type: InstitutionType.PORTEFEUILLE_NUMERIQUE, // Ajouter cette ligne
      pays: Country.SENEGAL, // Ajouter cette ligne
      services: [],
    });
    mockRepository.findById.mockResolvedValue(existingInstitution);
    mockRepository.update.mockImplementation(async (institution: Institution) => institution);

    const command = {
      idInstitution: institutionId,
      name: 'New Service',
      longName: 'New Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
      montantMin: 100000,
      montantMax: 100000,
      frais: { montantFixe: 0 }, // Montant à zéro
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = await useCase.execute(command);

    expect(result.services).toHaveLength(1);
    const newService = result.services[0];
    expect(newService.frais.typeCalculation).toBe(FraisTypeCalculation.FREE);
  });

  it('should create FraisGratuit when pourcentage is zero', async () => {
    const existingInstitution = new Institution({
      id: EntityId.from(institutionId),
      name: 'Test Institution',
      description: 'Test Description',
      website: UrlValueObject.from('https://test.com'),
      geographicZones: ['UEMOA'],
      logoUrl: UrlValueObject.from('https://logo.com/logo.png'),
      status: InstitutionStatus.ACTIVE,
      type: InstitutionType.PORTEFEUILLE_NUMERIQUE, // Ajouter cette ligne
      pays: Country.SENEGAL, // Ajouter cette ligne
      services: [],
    });
    mockRepository.findById.mockResolvedValue(existingInstitution);
    mockRepository.update.mockImplementation(async (institution: Institution) => institution);

    const command = {
      idInstitution: institutionId,
      name: 'New Service',
      longName: 'New Service Long Name',
      type: TypeService.PAIEMENT_MARCHAND,
      montantMin: 100000,
      montantMax: 100000,
      frais: { pourcentage: 0 }, // Pourcentage à zéro
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = await useCase.execute(command);

    expect(result.services).toHaveLength(1);
    const newService = result.services[0];
    expect(newService.frais.typeCalculation).toBe(FraisTypeCalculation.FREE);
  });
});
