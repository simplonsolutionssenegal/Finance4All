// @ts-nocheck
import { describe, it, expect } from '@jest/globals';
import { InstitutionFinanciere } from '@/domain/entities/InstitutionFinanciere';
import { PrismaInstitutionFinanciereRepository } from '@/infrastructure/database/PrismaInstitutionFinanciereRepository';

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

  // Domain shaped institution (what we expect back from repository)
  const domainInstitution: InstitutionFinanciere = {
    id: '1',
    nom: 'Banque Test',
    type: 'BANQUE',
    description: 'Description test',
    siteWeb: 'https://test.com',
    regionsDesservies: ['Île-de-France'],
    contact: { nom: 'Jean Doe', email: 'contact@test.com', telephone: '+33123456789' },
  };

  // Prisma raw record shape (what Prisma would actually return)
  const prismaRecordBase = {
    id: '1',
    nom: 'Banque Test',
    type: 'BANQUE',
    description: 'Description test',
    siteWeb: 'https://test.com',
    logo: null,
    contactNom: 'Jean Doe',
    contactEmail: 'contact@test.com',
    contactTelephone: '+33123456789',
    regionsDesservies: ['Île-de-France'],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call prisma create with correct data', async () => {
  mockPrisma.institutionFinanciere.create.mockResolvedValue(prismaRecordBase);

  const result = await repository.create(domainInstitution as any);

      expect(mockPrisma.institutionFinanciere.create).toHaveBeenCalledWith({
        data: {
          nom: domainInstitution.nom,
          type: domainInstitution.type,
          description: domainInstitution.description,
          siteWeb: domainInstitution.siteWeb,
          logo: null,
          contactNom: domainInstitution.contact!.nom,
          contactEmail: domainInstitution.contact!.email,
          contactTelephone: domainInstitution.contact!.telephone,
          regionsDesservies: domainInstitution.regionsDesservies,
        },
      });
      expect(result).toEqual(expect.objectContaining({
        id: domainInstitution.id,
        nom: domainInstitution.nom,
        contact: expect.objectContaining({
          nom: 'Jean Doe',
          email: 'contact@test.com',
          telephone: '+33123456789',
        }),
      }));
    });

    it('should handle institution with all optional fields', async () => {
      const prismaRecordWithOptionals = {
        ...prismaRecordBase,
        logo: 'logo.png',
      };
      mockPrisma.institutionFinanciere.create.mockResolvedValue(prismaRecordWithOptionals);
      await repository.create({ ...domainInstitution, logo: 'logo.png' } as any);

      expect(mockPrisma.institutionFinanciere.create).toHaveBeenCalledWith({
        data: {
          nom: prismaRecordWithOptionals.nom,
          type: prismaRecordWithOptionals.type,
          description: prismaRecordWithOptionals.description,
          siteWeb: prismaRecordWithOptionals.siteWeb,
          logo: 'logo.png',
          contactNom: prismaRecordWithOptionals.contactNom,
          contactEmail: prismaRecordWithOptionals.contactEmail,
          contactTelephone: prismaRecordWithOptionals.contactTelephone,
          regionsDesservies: prismaRecordWithOptionals.regionsDesservies,
        },
      });
    });
  });

  describe('findById', () => {
    it('should call prisma findUnique with correct id', async () => {
  mockPrisma.institutionFinanciere.findUnique.mockResolvedValue(prismaRecordBase);

      const result = await repository.findById('1');

      expect(mockPrisma.institutionFinanciere.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(expect.objectContaining({
        id: domainInstitution.id,
        nom: domainInstitution.nom,
        contact: expect.objectContaining({ nom: 'Jean Doe', email: 'contact@test.com', telephone: '+33123456789' }),
      }));
    });

    it('should return null when institution not found', async () => {
      mockPrisma.institutionFinanciere.findUnique.mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should call prisma findMany', async () => {
  const institutions = [prismaRecordBase];
      mockPrisma.institutionFinanciere.findMany.mockResolvedValue(institutions);

      const result = await repository.findAll();

      expect(mockPrisma.institutionFinanciere.findMany).toHaveBeenCalledTimes(1);
  expect(result[0]).toEqual(expect.objectContaining({ contact: expect.any(Object) }));
    });
  });

  describe('update', () => {
    it('should call prisma update with correct data', async () => {
      const updateData = { nom: 'Nouveau nom', type: 'MUTUELLE' };
  const updatedInstitution = { ...prismaRecordBase, ...updateData } as any;
      
      mockPrisma.institutionFinanciere.update.mockResolvedValue(updatedInstitution);

      const result = await repository.update('1', updateData);

      expect(mockPrisma.institutionFinanciere.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
  expect(result).toEqual(expect.objectContaining({ nom: 'Nouveau nom' }));
    });

    it('should handle partial updates correctly', async () => {
      const updateData = { description: 'Nouvelle description' };
  const updatedInstitution = { ...prismaRecordBase, ...updateData } as any;
      
      mockPrisma.institutionFinanciere.update.mockResolvedValue(updatedInstitution);

      const result = await repository.update('1', updateData);

      expect(mockPrisma.institutionFinanciere.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
  expect(result).toEqual(expect.objectContaining({ description: 'Nouvelle description' }));
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
