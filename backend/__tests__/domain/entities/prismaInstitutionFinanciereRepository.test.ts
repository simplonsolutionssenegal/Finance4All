// @ts-nocheck
import { describe, it, expect } from '@jest/globals';
import { InstitutionFinanciere } from '../domain/entities/InstitutionFinanciere';
import { PrismaInstitutionFinanciereRepository } from '../infrastructure/database/PrismaInstitutionFinanciereRepository';

describe('PrismaInstitutionFinanciereRepository', () => {
  // Mock Prisma client
  const mockPrisma = {
    institutionFinanciere: {
      create: jest.fn(),
      findUnique: jest.fn(),
  findMany: jest.fn(),
  update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const repository = new PrismaInstitutionFinanciereRepository(mockPrisma as any);

  const mockInstitution: InstitutionFinanciere = {
    id: '1',
    nom: 'Banque Test',
    type: 'BANQUE',
    description: 'Description test',
    siteWeb: 'https://test.com',
    regionsDesservies: ['Île-de-France'],
    contactEmail: 'contact@test.com',
    contactTelephone: '+33123456789',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call prisma create with correct data', async () => {
      mockPrisma.institutionFinanciere.create.mockResolvedValue(mockInstitution);

      const result = await repository.create(mockInstitution);

      expect(mockPrisma.institutionFinanciere.create).toHaveBeenCalledWith({
        data: {
          nom: mockInstitution.nom,
          type: mockInstitution.type,
          description: mockInstitution.description,
          siteWeb: mockInstitution.siteWeb,
          logo: null,
          contactNom: null,
          contactEmail: mockInstitution.contactEmail,
          contactTelephone: mockInstitution.contactTelephone,
          regionsDesservies: mockInstitution.regionsDesservies,
        },
      });
      expect(result).toEqual(mockInstitution);
    });

    it('should handle institution with all optional fields', async () => {
      const institutionWithOptionals = {
        ...mockInstitution,
        logo: 'logo.png',
        contactNom: 'Jean Doe',
      };
      mockPrisma.institutionFinanciere.create.mockResolvedValue(institutionWithOptionals);

      await repository.create(institutionWithOptionals);

      expect(mockPrisma.institutionFinanciere.create).toHaveBeenCalledWith({
        data: {
          nom: institutionWithOptionals.nom,
          type: institutionWithOptionals.type,
          description: institutionWithOptionals.description,
          siteWeb: institutionWithOptionals.siteWeb,
          logo: 'logo.png',
          contactNom: 'Jean Doe',
          contactEmail: institutionWithOptionals.contactEmail,
          contactTelephone: institutionWithOptionals.contactTelephone,
          regionsDesservies: institutionWithOptionals.regionsDesservies,
        },
      });
    });
  });

  describe('findById', () => {
    it('should call prisma findUnique with correct id', async () => {
      mockPrisma.institutionFinanciere.findUnique.mockResolvedValue(mockInstitution);

      const result = await repository.findById('1');

      expect(mockPrisma.institutionFinanciere.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockInstitution);
    });

    it('should return null when institution not found', async () => {
      mockPrisma.institutionFinanciere.findUnique.mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should call prisma findMany', async () => {
      const institutions = [mockInstitution];
      mockPrisma.institutionFinanciere.findMany.mockResolvedValue(institutions);

      const result = await repository.findAll();

      expect(mockPrisma.institutionFinanciere.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(institutions);
    });
  });

  describe('update', () => {
    it('should call prisma update with correct data', async () => {
      const updateData = { nom: 'Nouveau nom', type: 'MUTUELLE' };
      const updatedInstitution = { ...mockInstitution, ...updateData };
      
      mockPrisma.institutionFinanciere.update.mockResolvedValue(updatedInstitution);

      const result = await repository.update('1', updateData);

      expect(mockPrisma.institutionFinanciere.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
      expect(result).toEqual(updatedInstitution);
    });

    it('should handle partial updates correctly', async () => {
      const updateData = { description: 'Nouvelle description' };
      const updatedInstitution = { ...mockInstitution, ...updateData };
      
      mockPrisma.institutionFinanciere.update.mockResolvedValue(updatedInstitution);

      const result = await repository.update('1', updateData);

      expect(mockPrisma.institutionFinanciere.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
      expect(result).toEqual(updatedInstitution);
    });

    it('should return null when update fails', async () => {
      mockPrisma.institutionFinanciere.update.mockResolvedValue(null);

      const result = await repository.update('999', { nom: 'Test' });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should call prisma delete with correct id', async () => {
      mockPrisma.institutionFinanciere.delete.mockResolvedValue(true);

      const result = await repository.delete('1');

      expect(mockPrisma.institutionFinanciere.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBe(true);
    });
    it('should return false when delete fails with error', async () => {
      mockPrisma.institutionFinanciere.delete.mockRejectedValue(new Error('Delete failed'));

      const result = await repository.delete('999');

      expect(mockPrisma.institutionFinanciere.delete).toHaveBeenCalledWith({
        where: { id: '999' },
      });
      expect(result).toBe(false);
    });

    it('should return false when record not found during delete', async () => {
      mockPrisma.institutionFinanciere.delete.mockRejectedValue(new Error('Record not found'));

      const result = await repository.delete('nonexistent');

      expect(result).toBe(false);
    });
  });
});
