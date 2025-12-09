import type { ServiceRepository } from '@/domain/institutions/ports/out/ServiceRepository';
import type { GetServicesQuery } from '@/domain/institutions/ports/in/GetServicesUseCase';
import type { PaginatedResult } from '@/domain/shared/Pagination';
import type { ComparedServiceDTO } from '@/domain/institutions/value-objects/ComparedServiceDTO';
import { TypeService } from '@/domain/institutions/entities/Service';
import { TypeCalculation } from '@/domain/institutions/entities/Frais';
import { GetServicesUseCaseImpl } from '@/application/institutions/use-cases/GetServicesUseCaseImpl';
import { Country } from '@/domain/institutions/value-objects/Country';

describe('GetServicesUseCaseImpl', () => {
  let useCase: GetServicesUseCaseImpl;
  let mockServiceRepository: jest.Mocked<ServiceRepository>;

  beforeEach(() => {
    // Créer un mock complet du repository avec toutes les méthodes
    mockServiceRepository = {
      findAll: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findAllByInstitution: jest.fn(),
      findForComparison: jest.fn(),
    } as jest.Mocked<ServiceRepository>;

    // Instancier le use case avec le mock
    useCase = new GetServicesUseCaseImpl(mockServiceRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait retourner les services paginés avec leurs institutions', async () => {
      // Arrange
      const query: GetServicesQuery = {
        page: 1,
        limit: 10,
        type: TypeService.PAIEMENT_MARCHAND,
      };

      const mockComparedServices: ComparedServiceDTO[] = [
        {
          id: 'service-1',
          name: 'Paiement marchand',
          longName: 'Service de paiement marchand',
          type: TypeService.PAIEMENT_MARCHAND,
          montantMin: 100,
          montantMax: 1000000,
          frais: {
            typeCalculation: TypeCalculation.POURCENTAGE,
            pourcentage: 0.02,
          },
          conditionAccess: ['Avoir un compte actif'],
          plafonds: ['1 000 000 FCFA par jour'],
          infrastructureAccess: ['Mobile', 'Web'],
          institution: {
            id: 'inst-1',
            name: 'Orange Money',
            logoUrl: 'https://example.com/logo.png',
            pays: Country.SENEGAL,
          },
        },
        {
          id: 'service-2',
          name: 'Paiement marchand',
          longName: 'Service de paiement en ligne',
          type: TypeService.PAIEMENT_MARCHAND,
          montantMin: 50,
          montantMax: 500000,
          frais: {
            typeCalculation: TypeCalculation.FIX,
            montantFixe: 500,
          },
          conditionAccess: ['Inscription requise'],
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

      const mockPaginatedResult: PaginatedResult<ComparedServiceDTO> = {
        data: mockComparedServices,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      mockServiceRepository.findAll.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(mockServiceRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockServiceRepository.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockPaginatedResult);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].institution.name).toBe('Orange Money');
      expect(result.data[1].institution.name).toBe('Wave');
      expect(result.pagination.total).toBe(2);
    });

    it('devrait retourner un tableau vide quand aucun service ne correspond', async () => {
      // Arrange
      const query: GetServicesQuery = {
        page: 1,
        limit: 10,
        type: TypeService.EPARGNE,
      };

      const mockEmptyResult: PaginatedResult<ComparedServiceDTO> = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      mockServiceRepository.findAll.mockResolvedValue(mockEmptyResult);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(mockServiceRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockServiceRepository.findAll).toHaveBeenCalledWith(query);
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('devrait gérer une requête sans filtres', async () => {
      // Arrange
      const query: GetServicesQuery = {
        page: 1,
        limit: 20,
      };

      const mockResult: PaginatedResult<ComparedServiceDTO> = {
        data: [
          {
            id: 'service-3',
            name: 'Transfert',
            longName: "Transfert d'argent",
            type: TypeService.TRANSFERT_ARGENT,
            montantMin: 100,
            montantMax: 2000000,
            frais: {
              typeCalculation: TypeCalculation.FREE,
            },
            conditionAccess: [],
            plafonds: [],
            infrastructureAccess: ['Mobile', 'Agence'],
            institution: {
              id: 'inst-3',
              name: 'Free Money',
              logoUrl: 'https://example.com/free.png',
              pays: Country.SENEGAL,
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      mockServiceRepository.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(mockServiceRepository.findAll).toHaveBeenCalledWith(query);
      expect(result.data).toHaveLength(1);
    });

    it('devrait gérer la pagination correctement', async () => {
      // Arrange
      const query: GetServicesQuery = {
        page: 2,
        limit: 5,
      };

      const mockResult: PaginatedResult<ComparedServiceDTO> = {
        data: [
          {
            id: 'service-6',
            name: 'Service 6',
            longName: 'Service numéro 6',
            type: TypeService.DEPOT_SIMPLE,
            montantMin: 1000,
            montantMax: 5000000,
            frais: {
              typeCalculation: TypeCalculation.FIX,
              montantFixe: 200,
            },
            conditionAccess: ['Vérification identité'],
            plafonds: ['5 000 000 FCFA'],
            infrastructureAccess: ['Agence'],
            institution: {
              id: 'inst-4',
              name: 'Banque X',
              logoUrl: null,
              pays: Country.SENEGAL,
            },
          },
        ],
        pagination: {
          page: 2,
          limit: 5,
          total: 12,
          totalPages: 3,
        },
      };

      mockServiceRepository.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(mockServiceRepository.findAll).toHaveBeenCalledWith(query);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.totalPages).toBe(3);
    });

    it('devrait propager les erreurs du repository', async () => {
      // Arrange
      const query: GetServicesQuery = {
        page: 1,
        limit: 10,
      };

      const error = new Error('Erreur de base de données');
      mockServiceRepository.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(query)).rejects.toThrow('Erreur de base de données');
      expect(mockServiceRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('devrait passer tous les paramètres de query au repository', async () => {
      // Arrange
      const complexQuery: GetServicesQuery = {
        page: 3,
        limit: 15,
        type: TypeService.CREDIT,
      };

      const mockResult: PaginatedResult<ComparedServiceDTO> = {
        data: [],
        pagination: {
          page: 3,
          limit: 15,
          total: 0,
          totalPages: 0,
        },
      };

      mockServiceRepository.findAll.mockResolvedValue(mockResult);

      // Act
      await useCase.execute(complexQuery);

      // Assert
      expect(mockServiceRepository.findAll).toHaveBeenCalledWith(complexQuery);
    });
  });
});
