import { PrismaModuleFormationRepository } from '@/infrastructure/persistence/repositories/PrismaModuleFormationRepository';
import { EntityId } from '@/domain/shared/EntityId';
import {
  Module,
  ModuleStatus,
  DifficultyLevel,
} from '@/domain/formations/entities/ModuleFormation';
import { Thematic } from '@/domain/formations/value-objects/Thematic';
import type { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

type PrismaModuleRow = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  thematics: string[];
  difficultyLevel: string | null;
  estimatedDuration: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

describe('PrismaModuleFormationRepository — tests basiques', () => {
  let repository: PrismaModuleFormationRepository;
  let mockPrisma: Partial<PrismaClient> & { module?: any };
  let uuid1: string;
  let uuid2: string;

  beforeEach(() => {
    uuid1 = randomUUID();
    uuid2 = randomUUID();

    mockPrisma = {
      module: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    } as any;

    repository = new PrismaModuleFormationRepository(mockPrisma as unknown as PrismaClient);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('save(module)', () => {
    it('devrait appeler prisma.create et retourner une entité Module', async () => {
      const domainModule = Module.create({
        id: EntityId.from(uuid1),
        title: 'Titre A',
        description: 'Desc A',
        imageUrl: null,
        thematics: [Thematic.FINANCIAL_EDUCATION],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
      });

      const prismaRow: PrismaModuleRow = {
        id: uuid1,
        title: domainModule.title,
        description: domainModule.description,
        imageUrl: domainModule.imageUrl,
        thematics: domainModule.thematics,
        difficultyLevel: domainModule.difficultyLevel,
        estimatedDuration: domainModule.estimatedDuration,
        status: domainModule.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.module!.create.mockResolvedValue(prismaRow);

      const saved = await repository.save(domainModule);

      expect(mockPrisma.module!.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ id: uuid1, title: 'Titre A' }),
      });
      expect(saved).toBeInstanceOf(Module);
      expect(saved.id.getValue()).toBe(uuid1);
      expect(saved.title).toBe('Titre A');
    });

    it('devrait rejeter si prisma.create échoue', async () => {
      const domainModule = Module.create({
        id: EntityId.from(uuid1),
        title: 'Titre B',
        description: 'Desc B',
        imageUrl: null,
        thematics: [Thematic.SAVING],
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 30,
        status: ModuleStatus.DRAFT,
      });

      const err = new Error('prisma create error');
      mockPrisma.module!.create.mockRejectedValue(err);

      await expect(repository.save(domainModule)).rejects.toThrow('prisma create error');
    });
  });

  describe('findByTitle(title)', () => {
    it('devrait retourner Module quand trouvé', async () => {
      const row: PrismaModuleRow = {
        id: uuid2,
        title: 'Found',
        description: 'd',
        imageUrl: null,
        thematics: [Thematic.INVESTMENT],
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.module!.findFirst.mockResolvedValue(row);

      const found = await repository.findByTitle('Found');

      expect(mockPrisma.module!.findFirst).toHaveBeenCalledWith({
        where: { title: { equals: 'Found' } },
      });
      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(Module);
      expect(found?.title).toBe('Found');
    });

    it('devrait retourner null si introuvable', async () => {
      mockPrisma.module!.findFirst.mockResolvedValue(null);

      const found = await repository.findByTitle('Nope');
      expect(found).toBeNull();
    });
  });

  describe('findAll(params)', () => {
    it('devrait utiliser skip/take et retourner pagination correcte', async () => {
      // Préparer 3 lignes Prisma
      const rows: PrismaModuleRow[] = [
        {
          id: uuid1,
          title: 'M1',
          description: 'd1',
          imageUrl: null,
          thematics: [Thematic.FINANCIAL_EDUCATION],
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 10,
          status: ModuleStatus.DRAFT,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuid2,
          title: 'M2',
          description: 'd2',
          imageUrl: null,
          thematics: [Thematic.INVESTMENT],
          difficultyLevel: DifficultyLevel.ADVANCED,
          estimatedDuration: 20,
          status: ModuleStatus.PUBLISHED,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.module!.findMany.mockResolvedValue(rows);
      mockPrisma.module!.count.mockResolvedValue(12);

      const params = { page: 2, limit: 5 };
      const result = await repository.findAll(params as any);

      expect(mockPrisma.module!.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5, orderBy: { createdAt: 'desc' } })
      );
      expect(mockPrisma.module!.count).toHaveBeenCalled();

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual(
        expect.objectContaining({ page: 2, limit: 5, total: 12, totalPages: Math.ceil(12 / 5) })
      );
      expect(result.data[0]).toBeInstanceOf(Module);
    });

    it('devrait gérer cas vide', async () => {
      mockPrisma.module!.findMany.mockResolvedValue([]);
      mockPrisma.module!.count.mockResolvedValue(0);

      const result = await repository.findAll({ page: 1, limit: 10 } as any);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('devrait propager les erreurs de prisma', async () => {
      mockPrisma.module!.findMany.mockRejectedValue(new Error('fail'));
      mockPrisma.module!.count.mockResolvedValue(0);

      await expect(repository.findAll({ page: 1, limit: 10 } as any)).rejects.toThrow('fail');
    });
  });
});
