// Consolidated tests for Institution routes, entity, and delete use case
import request from 'supertest';
import express from 'express';
import { prisma } from '@/infrastructure/database/prisma';
import { InstitutionFinanciere } from '@/domain/entities/InstitutionFinanciere';
import { DeleteInstitutionFinanciereUseCase } from '@/application/use-cases/DeleteInstitutionFinanciereUseCase';

jest.mock('@/infrastructure/database/prisma', () => ({
  prisma: {
    institutionFinanciere: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Import router after prisma mock
import institutionFinanciereRoutes from '@/infrastructure/web/routes/institutionFinanciere.routes';

// Build isolated app instance for these route tests only
const app = express();
app.use(express.json());
app.use('/api/v1/institutions', institutionFinanciereRoutes);

type MockPrismaClient = {
  institutionFinanciere: {
    findMany: jest.Mock;
    create: jest.Mock;
  };
};

describe('Institution Financière Routes', () => {
  afterEach(() => jest.clearAllMocks());

  describe('GET /api/v1/institutions', () => {
    it('returns all institutions', async () => {
      const mockInstitutions: InstitutionFinanciere[] = [
        {
          id: '1',
          nom: 'Banque Test',
          type: 'BANQUE',
          description: 'Une description de test',
          siteWeb: 'https://www.banquetest.com',
          logo: 'logo-url.jpg',
          contact: {
            nom: 'Jean Test',
            email: 'contact@banquetest.com',
            telephone: '+33123456789',
          },
          regionsDesservies: ['Île-de-France', 'Bretagne'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const mockPrisma = prisma as unknown as MockPrismaClient;
      mockPrisma.institutionFinanciere.findMany.mockResolvedValue(mockInstitutions);
      const res = await request(app).get('/api/v1/institutions');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(mockPrisma.institutionFinanciere.findMany).toHaveBeenCalledTimes(1);
    });

    it('handles errors (500)', async () => {
      const mockPrisma = prisma as unknown as MockPrismaClient;
      mockPrisma.institutionFinanciere.findMany.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/api/v1/institutions');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});

// Domain and delete use case tests
// @ts-nocheck
import { describe as d2, it as it2, expect as expect2 } from '@jest/globals';

d2('Institution Financière Entity and Use Cases', () => {
  d2('InstitutionFinanciere Entity', () => {
    it2('constructs an institution with expected properties', () => {
      const institution: InstitutionFinanciere = {
        id: '123',
        nom: 'Banque Test',
        type: 'BANQUE',
        description: 'Une banque de test',
        siteWeb: 'https://test.com',
        regionsDesservies: ['Île-de-France'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect2(institution.id).toBe('123');
      expect2(institution.nom).toBe('Banque Test');
      expect2(institution.type).toBe('BANQUE');
      expect2(institution.description).toBe('Une banque de test');
      expect2(institution.regionsDesservies).toEqual(['Île-de-France']);
    });
  });

  d2('DeleteInstitutionFinanciereUseCase', () => {
    const mockInstitutionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      getAll: jest.fn(),
      delete: jest.fn(),
    };


    it2('throws when institution not found', async () => {
      const uc = new DeleteInstitutionFinanciereUseCase(mockInstitutionRepository as any);
      mockInstitutionRepository.findById.mockResolvedValue(null);
      await expect2(uc.execute('999')).rejects.toThrow('Institution financière non trouvée');
    });

    it2('deletes institution when present', async () => {
      const uc = new DeleteInstitutionFinanciereUseCase(mockInstitutionRepository as any);
      const inst: InstitutionFinanciere = {
        id: '1',
        nom: 'Banque Test',
        type: 'BANQUE',
        description: 'Description test',
        siteWeb: 'https://test.com',
        regionsDesservies: ['Île-de-France'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockInstitutionRepository.findById.mockResolvedValue(inst);
      mockInstitutionRepository.delete.mockResolvedValue(true);
      const result = await uc.execute('1');
      expect2(result).toBe(true);
    });

    it2('propagates repository errors', async () => {
      const uc = new DeleteInstitutionFinanciereUseCase(mockInstitutionRepository as any);
      const inst: InstitutionFinanciere = {
        id: '1',
        nom: 'Banque Test',
        type: 'BANQUE',
        description: 'Description test',
        siteWeb: 'https://test.com',
        regionsDesservies: ['Île-de-France'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockInstitutionRepository.findById.mockResolvedValue(inst);
      mockInstitutionRepository.delete.mockRejectedValue(new Error('Database error'));
      await expect2(uc.execute('1')).rejects.toThrow('Database error');
    });
  });
});
