import type { ServiceRepository } from '@/domain/institutions/ports/out/ServiceRepository';
import type { CompareServicesQuery } from '@/domain/institutions/ports/in/CompareServicesUseCase';
import type { ComparedServiceDTO } from '@/domain/institutions/value-objects/ComparedServiceDTO';
import { ServiceComparisonError } from '@/domain/institutions/errors/ServiceComparisonError';
import { TypeService } from '@/domain/institutions/entities/Service';
import { TypeCalculation } from '@/domain/institutions/entities/Frais';
import { CompareServicesUseCaseImpl } from '@/application/institutions/use-cases/CompareServicesUseCaseImpl';
import { Country } from '@/domain/institutions/value-objects/Country';

describe('CompareServicesUseCaseImpl', () => {
  let useCase: CompareServicesUseCaseImpl;
  let mockServiceRepository: jest.Mocked<ServiceRepository>;

  beforeEach(() => {
    mockServiceRepository = {
      findAll: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findAllByInstitution: jest.fn(),
      findForComparison: jest.fn(),
    } as jest.Mocked<ServiceRepository>;

    useCase = new CompareServicesUseCaseImpl(mockServiceRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const createMockService = (
      id: string,
      type: TypeService,
      institutionName: string
    ): ComparedServiceDTO => ({
      id,
      name: `Service ${id}`,
      longName: `Service complet ${id}`,
      type,
      montantMin: 100,
      montantMax: 1000000,
      frais: {
        typeCalculation: TypeCalculation.POURCENTAGE,
        pourcentage: 0.02,
      },
      conditionAccess: ['Compte actif'],
      plafonds: ['1 000 000 FCFA'],
      infrastructureAccess: ['Mobile', 'Web'],
      institution: {
        id: `inst-${id}`,
        name: institutionName,
        logoUrl: 'https://example.com/logo.png',
        pays: Country.SENEGAL,
      },
    });

    describe('Validation du nombre de services', () => {
      it('devrait rejeter une comparaison avec 0 service', async () => {
        // Arrange
        const query: CompareServicesQuery = { ids: [] };

        // Act & Assert
        await expect(useCase.execute(query)).rejects.toThrow(ServiceComparisonError);
        await expect(useCase.execute(query)).rejects.toThrow(
          'Vous devez sélectionner au moins 2 services pour effectuer une comparaison'
        );
        expect(mockServiceRepository.findForComparison).not.toHaveBeenCalled();
      });

      it('devrait rejeter une comparaison avec 1 seul service', async () => {
        // Arrange
        const query: CompareServicesQuery = { ids: ['service-1'] };

        // Act & Assert
        await expect(useCase.execute(query)).rejects.toThrow(ServiceComparisonError);
        await expect(useCase.execute(query)).rejects.toThrow(
          'Vous devez sélectionner au moins 2 services pour effectuer une comparaison'
        );
        expect(mockServiceRepository.findForComparison).not.toHaveBeenCalled();
      });

      it('devrait rejeter une comparaison avec undefined ids', async () => {
        // Arrange
        const query: CompareServicesQuery = { ids: undefined as any };

        // Act & Assert
        await expect(useCase.execute(query)).rejects.toThrow(ServiceComparisonError);
        await expect(useCase.execute(query)).rejects.toThrow(
          'Vous devez sélectionner au moins 2 services pour effectuer une comparaison'
        );
      });

      it('devrait rejeter une comparaison avec plus de 3 services', async () => {
        // Arrange
        const query: CompareServicesQuery = {
          ids: ['service-1', 'service-2', 'service-3', 'service-4'],
        };

        // Act & Assert
        await expect(useCase.execute(query)).rejects.toThrow(ServiceComparisonError);
        await expect(useCase.execute(query)).rejects.toThrow(
          'Vous ne pouvez pas comparer plus de 3 services à la fois'
        );
        expect(mockServiceRepository.findForComparison).not.toHaveBeenCalled();
      });

      it('devrait accepter exactement 2 services', async () => {
        // Arrange
        const query: CompareServicesQuery = { ids: ['service-1', 'service-2'] };
        const mockServices = [
          createMockService('service-1', TypeService.PAIEMENT_MARCHAND, 'Orange Money'),
          createMockService('service-2', TypeService.PAIEMENT_MARCHAND, 'Wave'),
        ];
        mockServiceRepository.findForComparison.mockResolvedValue(mockServices);

        // Act
        const result = await useCase.execute(query);

        // Assert
        expect(result).toEqual(mockServices);
        expect(mockServiceRepository.findForComparison).toHaveBeenCalledWith(query.ids);
      });

      it('devrait accepter exactement 3 services', async () => {
        // Arrange
        const query: CompareServicesQuery = {
          ids: ['service-1', 'service-2', 'service-3'],
        };
        const mockServices = [
          createMockService('service-1', TypeService.TRANSFERT_ARGENT, 'Orange Money'),
          createMockService('service-2', TypeService.TRANSFERT_ARGENT, 'Wave'),
          createMockService('service-3', TypeService.TRANSFERT_ARGENT, 'Free Money'),
        ];
        mockServiceRepository.findForComparison.mockResolvedValue(mockServices);

        // Act
        const result = await useCase.execute(query);

        // Assert
        expect(result).toHaveLength(3);
        expect(mockServiceRepository.findForComparison).toHaveBeenCalledWith(query.ids);
      });
    });

    describe("Validation de l'existence des services", () => {
      it("devrait rejeter si aucun service n'est trouvé", async () => {
        // Arrange
        const query: CompareServicesQuery = { ids: ['service-1', 'service-2'] };
        mockServiceRepository.findForComparison.mockResolvedValue([]);

        // Act & Assert
        await expect(useCase.execute(query)).rejects.toThrow(ServiceComparisonError);
        await expect(useCase.execute(query)).rejects.toThrow(
          'Aucun service trouvé avec les IDs fournis'
        );
      });

      it('devrait rejeter si un service est manquant', async () => {
        // Arrange
        const query: CompareServicesQuery = {
          ids: ['service-1', 'service-2', 'service-3'],
        };
        const mockServices = [
          createMockService('service-1', TypeService.DEPOT_SIMPLE, 'Orange Money'),
          createMockService('service-2', TypeService.DEPOT_SIMPLE, 'Wave'),
        ];
        mockServiceRepository.findForComparison.mockResolvedValue(mockServices);

        // Act & Assert
        await expect(useCase.execute(query)).rejects.toThrow(ServiceComparisonError);
        await expect(useCase.execute(query)).rejects.toThrow(
          "Les services suivants n'existent pas : service-3"
        );
      });

      it('devrait rejeter si plusieurs services sont manquants', async () => {
        // Arrange
        const query: CompareServicesQuery = {
          ids: ['service-1', 'service-2', 'service-3'],
        };
        const mockServices = [createMockService('service-1', TypeService.CREDIT, 'Banque X')];
        mockServiceRepository.findForComparison.mockResolvedValue(mockServices);

        // Act & Assert
        await expect(useCase.execute(query)).rejects.toThrow(ServiceComparisonError);
        await expect(useCase.execute(query)).rejects.toThrow(
          "Les services suivants n'existent pas : service-2, service-3"
        );
      });
    });

    describe('Validation du type de service', () => {
      it('devrait rejeter si les services sont de types différents', async () => {
        // Arrange
        const query: CompareServicesQuery = { ids: ['service-1', 'service-2'] };
        const mockServices = [
          createMockService('service-1', TypeService.PAIEMENT_MARCHAND, 'Orange Money'),
          createMockService('service-2', TypeService.TRANSFERT_ARGENT, 'Wave'),
        ];
        mockServiceRepository.findForComparison.mockResolvedValue(mockServices);

        // Act & Assert
        await expect(useCase.execute(query)).rejects.toThrow(ServiceComparisonError);
        await expect(useCase.execute(query)).rejects.toThrow(
          'Impossible de comparer des services de types différents'
        );
        await expect(useCase.execute(query)).rejects.toThrow(TypeService.PAIEMENT_MARCHAND);
        await expect(useCase.execute(query)).rejects.toThrow(TypeService.TRANSFERT_ARGENT);
      });

      it('devrait rejeter si 3 services ont des types différents', async () => {
        // Arrange
        const query: CompareServicesQuery = {
          ids: ['service-1', 'service-2', 'service-3'],
        };
        const mockServices = [
          createMockService('service-1', TypeService.CREDIT, 'Banque A'),
          createMockService('service-2', TypeService.EPARGNE, 'Banque B'),
          createMockService('service-3', TypeService.ASSURANCE, 'Banque C'),
        ];
        mockServiceRepository.findForComparison.mockResolvedValue(mockServices);

        // Act & Assert
        await expect(useCase.execute(query)).rejects.toThrow(ServiceComparisonError);
        const error = await useCase.execute(query).catch(e => e);
        expect(error.message).toContain('Impossible de comparer des services de types différents');
        expect(error.message).toContain(TypeService.CREDIT);
        expect(error.message).toContain(TypeService.EPARGNE);
        expect(error.message).toContain(TypeService.ASSURANCE);
      });

      it('devrait accepter si tous les services sont du même type', async () => {
        // Arrange
        const query: CompareServicesQuery = { ids: ['service-1', 'service-2'] };
        const mockServices = [
          createMockService('service-1', TypeService.PAIEMENT_FACTURES, 'Orange Money'),
          createMockService('service-2', TypeService.PAIEMENT_FACTURES, 'Wave'),
        ];
        mockServiceRepository.findForComparison.mockResolvedValue(mockServices);

        // Act
        const result = await useCase.execute(query);

        // Assert
        expect(result).toEqual(mockServices);
        expect(result.every(s => s.type === TypeService.PAIEMENT_FACTURES)).toBe(true);
      });
    });

    describe('Cas de succès', () => {
      it('devrait retourner les services validés avec toutes leurs données', async () => {
        // Arrange
        const query: CompareServicesQuery = { ids: ['service-1', 'service-2'] };
        const mockServices: ComparedServiceDTO[] = [
          {
            id: 'service-1',
            name: 'Paiement Orange',
            longName: 'Service de paiement Orange Money',
            type: TypeService.PAIEMENT_MARCHAND,
            montantMin: 100,
            montantMax: 1000000,
            frais: {
              typeCalculation: TypeCalculation.POURCENTAGE,
              pourcentage: 0.02,
              maximum: 5000,
            },
            conditionAccess: ['Compte vérifié', 'KYC complet'],
            plafonds: ['1 000 000 FCFA par jour'],
            infrastructureAccess: ['Mobile', 'Web', 'USSD'],
            institution: {
              id: 'inst-1',
              name: 'Orange Money',
              logoUrl: 'https://example.com/orange.png',
              pays: Country.SENEGAL,
            },
          },
          {
            id: 'service-2',
            name: 'Paiement Wave',
            longName: 'Service de paiement Wave',
            type: TypeService.PAIEMENT_MARCHAND,
            montantMin: 50,
            montantMax: 500000,
            frais: {
              typeCalculation: TypeCalculation.FIX,
              montantFixe: 500,
            },
            conditionAccess: ['Inscription'],
            plafonds: ['500 000 FCFA par transaction'],
            infrastructureAccess: ['Mobile'],
            institution: {
              id: 'inst-2',
              name: 'Wave',
              logoUrl: null,
              pays: Country.SENEGAL,
            },
          },
        ];
        mockServiceRepository.findForComparison.mockResolvedValue(mockServices);

        // Act
        const result = await useCase.execute(query);

        // Assert
        expect(result).toEqual(mockServices);
        expect(result).toHaveLength(2);
        expect(result[0].institution.name).toBe('Orange Money');
        expect(result[1].institution.name).toBe('Wave');
        expect(mockServiceRepository.findForComparison).toHaveBeenCalledWith(query.ids);
        expect(mockServiceRepository.findForComparison).toHaveBeenCalledTimes(1);
      });

      it('devrait gérer les services avec des institutions sans logo', async () => {
        // Arrange
        const query: CompareServicesQuery = { ids: ['service-1', 'service-2'] };
        const mockServices = [
          createMockService('service-1', TypeService.RETRAIT_SIMPLE, 'Bank A'),
          {
            ...createMockService('service-2', TypeService.RETRAIT_SIMPLE, 'Bank B'),
            institution: {
              id: 'inst-2',
              name: 'Bank B',
              logoUrl: null,
              pays: Country.SENEGAL,
            },
          },
        ];
        mockServiceRepository.findForComparison.mockResolvedValue(mockServices);

        // Act
        const result = await useCase.execute(query);

        // Assert
        expect(result[1].institution.logoUrl).toBeNull();
        expect(result).toHaveLength(2);
      });
    });

    describe('Gestion des erreurs du repository', () => {
      it('devrait propager les erreurs du repository', async () => {
        // Arrange
        const query: CompareServicesQuery = { ids: ['service-1', 'service-2'] };
        const error = new Error('Erreur de base de données');
        mockServiceRepository.findForComparison.mockRejectedValue(error);

        // Act & Assert
        await expect(useCase.execute(query)).rejects.toThrow('Erreur de base de données');
        expect(mockServiceRepository.findForComparison).toHaveBeenCalledTimes(1);
      });
    });
  });
});
