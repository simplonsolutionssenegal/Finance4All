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
