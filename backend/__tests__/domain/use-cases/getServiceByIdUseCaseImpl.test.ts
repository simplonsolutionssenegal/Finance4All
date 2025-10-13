// backend/__tests__/domain/use-cases/getServiceByIdUseCaseImpl.test.ts

import { GetServiceByIdUseCaseImpl } from '@/domain/use-cases/getServiceByIdUseCaseImpl';
import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import type { Service } from '@/domain/entities/Service';
import { TypeService } from '@/domain/institutions/entities/Service';

describe('GetServiceByIdUseCaseImpl', () => {
  let useCase: GetServiceByIdUseCaseImpl;
  let mockRepository: jest.Mocked<ServiceRepository>;

  const mockService: Service = {
    id: 'service-1',
    name: 'Service de Crédit',
    longName: 'Service de Crédit à la Consommation',
    type: TypeService.CREDIT,
    frais: {
      ouverture: 5000,
      gestion: 1000,
      commission: 2.5,
    },
    conditionAccess: ['Age minimum 18 ans', 'Revenus réguliers'],
    plafonds: ['Minimum 100 000 FCFA', 'Maximum 5 000 000 FCFA'],
    infrastructureAccess: ['Agences', 'Mobile Banking', 'Internet Banking'],
    institutionId: 'institution-1',
    institution: {
      id: 'institution-1',
      name: 'Banque Test',
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByType: jest.fn(),
    } as jest.Mocked<ServiceRepository>;

    useCase = new GetServiceByIdUseCaseImpl(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with repository', () => {
      expect(useCase).toBeInstanceOf(GetServiceByIdUseCaseImpl);
      expect(useCase['serviceRepository']).toBe(mockRepository);
    });
  });

  describe('execute', () => {
    // Test de la branche SUCCÈS : ID valide et service trouvé
    it('should return service when valid id is provided and service exists', async () => {
      const id = 'service-1';
      mockRepository.findById.mockResolvedValue(mockService);

      const result = await useCase.execute(id);

      expect(result).toEqual(mockService);
      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });

    // Test de la branche SUCCÈS : ID valide mais service non trouvé
    it('should return null when service not found', async () => {
      const id = 'non-existent-service';
      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(id);

      expect(result).toBeNull();
      expect(mockRepository.findById).toHaveBeenCalledWith(id);
    });

    // Test de la branche ERREUR : ID null
    it('should throw error when id is null', async () => {
      const id = null as any;

      await expect(useCase.execute(id)).rejects.toThrow('ID du service requis');
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    // Test de la branche ERREUR : ID undefined
    it('should throw error when id is undefined', async () => {
      const id = undefined as any;

      await expect(useCase.execute(id)).rejects.toThrow('ID du service requis');
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    // Test de la branche ERREUR : ID chaîne vide
    it('should throw error when id is empty string', async () => {
      const id = '';

      await expect(useCase.execute(id)).rejects.toThrow('ID du service requis');
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    // Test de la branche ERREUR : ID avec seulement des espaces
    it('should throw error when id is whitespace only', async () => {
      const id = '   ';

      await expect(useCase.execute(id)).rejects.toThrow('ID du service requis');
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    // Test de la branche ERREUR : ID avec tabs et newlines
    it('should throw error when id contains only whitespace characters', async () => {
      const id = '\t\n\r ';

      await expect(useCase.execute(id)).rejects.toThrow('ID du service requis');
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    // Test avec ID valide mais contenant des espaces en début/fin
    it('should work with id containing leading/trailing spaces', async () => {
      const id = '  service-1  ';
      mockRepository.findById.mockResolvedValue(mockService);

      const result = await useCase.execute(id);

      expect(result).toEqual(mockService);
      expect(mockRepository.findById).toHaveBeenCalledWith(id);
    });

    // Test de la gestion des erreurs du repository
    it('should propagate repository errors', async () => {
      const id = 'service-1';
      const error = new Error('Database connection failed');
      mockRepository.findById.mockRejectedValue(error);

      await expect(useCase.execute(id)).rejects.toThrow('Database connection failed');
      expect(mockRepository.findById).toHaveBeenCalledWith(id);
    });

    // Test avec différents types d'ID valides
    it('should handle UUID format ids', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      mockRepository.findById.mockResolvedValue(mockService);

      const result = await useCase.execute(id);

      expect(result).toEqual(mockService);
      expect(mockRepository.findById).toHaveBeenCalledWith(id);
    });

    // Test avec ID numérique
    it('should handle numeric string ids', async () => {
      const id = '12345';
      mockRepository.findById.mockResolvedValue(mockService);

      const result = await useCase.execute(id);

      expect(result).toEqual(mockService);
      expect(mockRepository.findById).toHaveBeenCalledWith(id);
    });

    // Test avec caractères spéciaux
    it('should handle special characters in id', async () => {
      const id = 'service-@#$%^&*()';
      mockRepository.findById.mockResolvedValue(mockService);

      const result = await useCase.execute(id);

      expect(result).toEqual(mockService);
      expect(mockRepository.findById).toHaveBeenCalledWith(id);
    });

    // Test performance - ID très long
    it('should handle very long id strings', async () => {
      const id = 'a'.repeat(1000);
      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(id);

      expect(result).toBeNull();
      expect(mockRepository.findById).toHaveBeenCalledWith(id);
    });
  });
});
