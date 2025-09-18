// 1) MOCK de @prisma/client AVANT d'importer le repository
const mockPrisma = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  UserStatus: {
    ACTIF: 'ACTIF',
    EN_ATTENTE: 'EN_ATTENTE',
    INACTIF: 'INACTIF',
    SUSPENDU: 'SUSPENDU',
  },
}));

// 2) importer le repo APRES le mock
import { PrismaUserRepository } from '@/infrastructure/database/PrismaUserRepository';
import type { UserStatus } from '@prisma/client';

function fakeRow(overrides: Partial<any> = {}) {
  const now = new Date();
  return {
    id: 1,
    email: 'john@example.com',
    username: 'jdoe',
    firstName: 'John',
    lastName: 'Doe',
    avatar: null,
    password: 'hashed',
    isActive: true,
    status: 'ACTIF' as UserStatus,
    lastLoginAt: now,
    organisationId: 37,
    organisation: {
      id: 37, name: 'Acme', address: 'addr', phone: '000',
      avatar: null, createdAt: now, updatedAt: now,
    },
    role: { id: 1, name: 'ADMIN', createdAt: now, updatedAt: now },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('PrismaUserRepository', () => {
  let repo: PrismaUserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new PrismaUserRepository();
  });

  describe('findAll', () => {
    it('retourne la liste mappée et passe les bons include/orderBy', async () => {
      mockPrisma.user.findMany.mockResolvedValue([fakeRow(), fakeRow({ id: 2 })]);

      const res = await repo.findAll();

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        include: { role: true, organisation: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(res).toHaveLength(2);
      expect(res[0].id).toBe(1);
      expect(res[0].role!.name).toBe('ADMIN');
    });

    it('retourne [] si aucun utilisateur', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      const res = await repo.findAll();
      expect(res).toEqual([]);
    });

    it('propage les erreurs Prisma', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('DB down'));
      await expect(repo.findAll()).rejects.toThrow('DB down');
    });
  });

  describe('findById', () => {
    it('retourne un DomainUser si trouvé', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(fakeRow({ id: 42 }));

      const res = await repo.findById(42);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 42 },
        include: { role: true, organisation: true },
      });
      expect(res?.id).toBe(42);
      expect(res?.username).toBe('jdoe');
    });

    it('retourne null si non trouvé', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const res = await repo.findById(999);
      expect(res).toBeNull();
    });

    it('propage les erreurs Prisma', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('DB error'));
      await expect(repo.findById(1)).rejects.toThrow('DB error');
    });
  });

  describe('findByOrganisationId', () => {
    it('filtre par organisationId et mappe', async () => {
      mockPrisma.user.findMany.mockResolvedValue([fakeRow(), fakeRow({ id: 2 })]);

      const res = await repo.findByOrganisationId(37);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { organisationId: 37 },
        include: { role: true, organisation: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(res).toHaveLength(2);
      expect(res[1].id).toBe(2);
    });

    it('propage les erreurs Prisma', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('Oops'));
      await expect(repo.findByOrganisationId(37)).rejects.toThrow('Oops');
    });
  });

  describe('findUsersByOrganisationAndStatus', () => {
    it('applique status + roles et lastLogin=recent', async () => {
      const base = new Date('2025-09-10T00:00:00.000Z');
      jest.useFakeTimers().setSystemTime(base);

      mockPrisma.user.findMany.mockResolvedValue([fakeRow()]);

      const res = await repo.findUsersByOrganisationAndStatus(
        37,
        ['ACTIF'],
        ['ADMIN', 'MANAGER'],
        { type: 'recent' } as any
      );

      const callArg = mockPrisma.user.findMany.mock.calls[0][0];
      expect(callArg.where.organisationId).toBe(37);
      expect(callArg.where.status).toEqual({ in: ['ACTIF'] });
      expect(callArg.where.role).toEqual({ name: { in: ['ADMIN', 'MANAGER'] } });
      expect(callArg.where.lastLoginAt.gte instanceof Date).toBe(true);

      expect(res[0].id).toBe(1);
      jest.useRealTimers();
    });

    it('applique last_month (mois calendaire précédent)', async () => {
      // fige l'heure pour rendre le calcul déterministe
      const base = new Date('2025-09-15T12:00:00.000Z');
      jest.useFakeTimers().setSystemTime(base);

      mockPrisma.user.findMany.mockResolvedValue([]);

      await repo.findUsersByOrganisationAndStatus(10, ['ACTIF'], undefined, { type: 'last_month' } as any);

      const callArg = mockPrisma.user.findMany.mock.calls[0][0];
      expect(callArg.where.lastLoginAt.gte instanceof Date).toBe(true);
      expect(callArg.where.lastLoginAt.lt   instanceof Date).toBe(true);

      jest.useRealTimers();
    });

    it('applique custom_date (00:00 à 00:00+1)', async () => {
      const d = new Date('2025-08-20T00:00:00.000Z');
      mockPrisma.user.findMany.mockResolvedValue([fakeRow()]);

      await repo.findUsersByOrganisationAndStatus(5, ['ACTIF', 'INACTIF'], [], { type: 'custom_date', date: d } as any);

      const callArg = mockPrisma.user.findMany.mock.calls[0][0];
      expect(callArg.where.status).toEqual({ in: ['ACTIF', 'INACTIF'] });
      expect(callArg.where.lastLoginAt.gte.toISOString()).toBe(d.toISOString());
      const next = new Date(d.getTime() + 24 * 60 * 60 * 1000).toISOString();
      expect(callArg.where.lastLoginAt.lt.toISOString()).toBe(next);
    });

    it('sans roles / sans lastLoginFilter', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);

      await repo.findUsersByOrganisationAndStatus(7, ['SUSPENDU']);

      const callArg = mockPrisma.user.findMany.mock.calls[0][0];
      expect(callArg.where).toEqual({
        organisationId: 7,
        status: { in: ['SUSPENDU'] },
      });
    });

    it('propage les erreurs Prisma', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('fail'));
      await expect(
        repo.findUsersByOrganisationAndStatus(1, ['ACTIF'])
      ).rejects.toThrow('fail');
    });
  });
});
