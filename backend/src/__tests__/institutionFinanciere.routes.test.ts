// Mock de Clerk middleware pour éviter les erreurs d'authentification - DOIT être avant les imports
jest.mock('@clerk/express', () => ({
  clerkMiddleware: () => (req: any, res: any, next: any) => {
    // Mock d'un utilisateur authentifié pour les tests
    req.auth = { userId: 'test-user-id' };
    next();
  },
}));

// Mock du service Prisma
jest.mock('../infrastructure/database/prisma', () => ({
  prisma: {
    institutionFinanciere: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const request = require('supertest');
import app from '../index';
import { prisma } from '../infrastructure/database/prisma';
import { InstitutionFinanciere } from '../domain/entities/InstitutionFinanciere';

// Type augmentation for jest mocks
type MockPrismaClient = {
  institutionFinanciere: {
    findMany: jest.Mock;
    create: jest.Mock;
    findUnique: jest.Mock;
    delete: jest.Mock;
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

  describe('DELETE /api/v1/institutions/:id', () => {
    it('should delete an institution successfully', async () => {
      const mockInstitution = {
        id: '1',
        nom: 'Banque Test',
        type: 'BANQUE',
        description: 'Une description de test',
        siteWeb: 'https://www.banquetest.com',
        regionsDesservies: ['Île-de-France'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Setup mock implementation
      const mockPrisma = prisma as unknown as MockPrismaClient;
      mockPrisma.institutionFinanciere.findUnique.mockResolvedValue(mockInstitution);
      mockPrisma.institutionFinanciere.delete.mockResolvedValue(mockInstitution);

      // Execute test
      const response = await request(app).delete('/api/v1/institutions/1');

      // Assert response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Institution financière supprimée avec succès');
      expect(mockPrisma.institutionFinanciere.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockPrisma.institutionFinanciere.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return 404 when institution not found', async () => {
      // Setup mock implementation
      const mockPrisma = prisma as unknown as MockPrismaClient;
      mockPrisma.institutionFinanciere.findUnique.mockResolvedValue(null);

      // Execute test
      const response = await request(app).delete('/api/v1/institutions/999');

      // Assert response
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Institution financière non trouvée');
      expect(mockPrisma.institutionFinanciere.findUnique).toHaveBeenCalledWith({
        where: { id: '999' },
      });
      expect(mockPrisma.institutionFinanciere.delete).not.toHaveBeenCalled();
    });

    it('should handle database errors and return 500', async () => {
      const mockInstitution = {
        id: '1',
        nom: 'Banque Test',
        type: 'BANQUE',
        description: 'Une description de test',
      };

      // Setup mock implementation to throw error
      const mockPrisma = prisma as unknown as MockPrismaClient;
      mockPrisma.institutionFinanciere.findUnique.mockResolvedValue(mockInstitution);
      mockPrisma.institutionFinanciere.delete.mockRejectedValue(new Error('Database error'));

      // Execute test
      const response = await request(app).delete('/api/v1/institutions/1');

      // Assert response
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Erreur lors de la suppression de l'institution financière");
      expect(mockPrisma.institutionFinanciere.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrisma.institutionFinanciere.delete).toHaveBeenCalledTimes(1);
    });
  });
});
