import request from 'supertest';
import app from '../index';
import { prisma } from '../infrastructure/database/prisma';
import { InstitutionFinanciere } from '../domain/entities/InstitutionFinanciere';

// Mock du service Prisma
jest.mock('../infrastructure/database/prisma', () => ({
  prisma: {
    institutionFinanciere: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Type augmentation for jest mocks
type MockPrismaClient = {
  institutionFinanciere: {
    findMany: jest.Mock;
    create: jest.Mock;
  };
};

describe('Institution Financière Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/institutions', () => {
    it('should return all institutions', async () => {
      // Mock data
      const mockInstitutions: InstitutionFinanciere[] = [
        {
          id: '1',
          nom: 'Banque Test',
          type: 'BANQUE',
          description: 'Une description de test',
          siteWeb: 'https://www.banquetest.com',
          logo: 'logo-url.jpg',
          contactNom: 'Jean Test',
          contactEmail: 'contact@banquetest.com',
          contactTelephone: '+33123456789',
          regionsDesservies: ['Île-de-France', 'Bretagne'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          nom: 'Assurance Test',
          type: 'ASSURANCE',
          description: 'Une assurance de test',
          siteWeb: 'https://www.assurancetest.com',
          regionsDesservies: ["Provence-Alpes-Côte d'Azur"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Setup mock implementation
      const mockPrisma = prisma as unknown as MockPrismaClient;
      mockPrisma.institutionFinanciere.findMany.mockResolvedValue(mockInstitutions);

      // Execute test
      const response = await request(app).get('/api/v1/institutions');

      // Assert response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
      expect(mockPrisma.institutionFinanciere.findMany).toHaveBeenCalledTimes(1);
    });

    it('should handle errors and return 500', async () => {
      // Setup mock implementation to throw error
      const mockPrisma = prisma as unknown as MockPrismaClient;
      mockPrisma.institutionFinanciere.findMany.mockRejectedValue(new Error('Database error'));

      // Execute test
      const response = await request(app).get('/api/v1/institutions');

      // Assert response
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Erreur lors de la récupération');
      expect(mockPrisma.institutionFinanciere.findMany).toHaveBeenCalledTimes(1);
    });
  });
});

// @ts-nocheck
import { describe, it, expect } from '@jest/globals';
import { InstitutionFinanciere } from '../domain/entities/InstitutionFinanciere';
import { DeleteInstitutionFinanciereUseCase } from '../application/use-cases/DeleteInstitutionFinanciereUseCase';

describe('Institution Financière Entity and Use Cases', () => {
  describe('InstitutionFinanciere Entity', () => {
    it('should create an institution with correct properties', () => {
      const institution: InstitutionFinanciere = {
        id: '123',
        nom: 'Banque Test',
        type: 'BANQUE',
        description: 'Une banque de test',
        siteWeb: 'https://test.com',
        regionsDesservies: ['Île-de-France'],
      };

      expect(institution.id).toBe('123');
      expect(institution.nom).toBe('Banque Test');
      expect(institution.type).toBe('BANQUE');
      expect(institution.description).toBe('Une banque de test');
      expect(institution.regionsDesservies).toEqual(['Île-de-France']);
    });
  });

  describe('DeleteInstitutionFinanciereUseCase', () => {
    // Mock repository implementation
    const mockInstitutionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      getAll: jest.fn(),
      delete: jest.fn(),
    };

    it('should throw error when ID is missing', async () => {
      const deleteUseCase = new DeleteInstitutionFinanciereUseCase(mockInstitutionRepository);

      await expect(deleteUseCase.execute('')).rejects.toThrow(
        "ID de l'institution financière requis"
      );
    });

    it('should throw error when institution not found', async () => {
      const deleteUseCase = new DeleteInstitutionFinanciereUseCase(mockInstitutionRepository);
      mockInstitutionRepository.findById.mockResolvedValue(null);

      await expect(deleteUseCase.execute('999')).rejects.toThrow(
        'Institution financière non trouvée'
      );
    });

    it('should delete institution when it exists', async () => {
      const deleteUseCase = new DeleteInstitutionFinanciereUseCase(mockInstitutionRepository);
      const mockInstitution: InstitutionFinanciere = {
        id: '1',
        nom: 'Banque Test',
        type: 'BANQUE',
        description: 'Description test',
        siteWeb: 'https://test.com',
        regionsDesservies: ['Île-de-France'],
      };

      mockInstitutionRepository.findById.mockResolvedValue(mockInstitution);
      mockInstitutionRepository.delete.mockResolvedValue(true);

      const result = await deleteUseCase.execute('1');

      expect(result).toBe(true);
      expect(mockInstitutionRepository.findById).toHaveBeenCalledWith('1');
      expect(mockInstitutionRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should handle repository errors', async () => {
      const deleteUseCase = new DeleteInstitutionFinanciereUseCase(mockInstitutionRepository);
      const mockInstitution: InstitutionFinanciere = {
        id: '1',
        nom: 'Banque Test',
        type: 'BANQUE',
        description: 'Description test',
        siteWeb: 'https://test.com',
        regionsDesservies: ['Île-de-France'],
      };

      mockInstitutionRepository.findById.mockResolvedValue(mockInstitution);
      mockInstitutionRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(deleteUseCase.execute('1')).rejects.toThrow('Database error');
    });

    it('should throw error when delete operation fails and returns false', async () => {
      const deleteUseCase = new DeleteInstitutionFinanciereUseCase(mockInstitutionRepository);
      const mockInstitution: InstitutionFinanciere = {
        id: '1',
        nom: 'Banque Test',
        type: 'BANQUE',
        description: 'Description test',
        siteWeb: 'https://test.com',
        regionsDesservies: ['Île-de-France'],
      };

      mockInstitutionRepository.findById.mockResolvedValue(mockInstitution);
      // Simuler le cas où delete retourne false (échec de suppression sans exception)
      mockInstitutionRepository.delete.mockResolvedValue(false);

      await expect(deleteUseCase.execute('1')).rejects.toThrow(
        'Erreur lors de la suppression de l\'institution financière'
      );

      expect(mockInstitutionRepository.findById).toHaveBeenCalledWith('1');
      expect(mockInstitutionRepository.delete).toHaveBeenCalledWith('1');
    });
  });
});
