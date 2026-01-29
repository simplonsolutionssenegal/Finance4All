// __tests__/infrastructure/persistence/repositories/PrismaModuleFormationRepository.test.ts

import { PrismaModuleFormationRepository } from '@/infrastructure/persistence/repositories/PrismaModuleFormationRepository';
import { EntityId } from '@/domain/shared/EntityId';
import {
  Module,
  ModuleStatus,
  DifficultyLevel,
} from '@/domain/formations/entities/ModuleFormation';
import type { PrismaClient } from '@prisma/client';

// S'assurer qu'EntityId n'est pas mocké
jest.unmock('@/domain/shared/EntityId');
import { Lesson, LessonStatus } from '@/domain/formations/entities/Lesson';
import { Quiz, QuizStatus } from '@/domain/formations/entities/Quiz';
import { Chapter } from '@/domain/formations/entities/Chapter';
import {
  QuestionChoixUnique,
  QuestionChoixMultiple,
  TypeQuestion,
} from '@/domain/formations/entities/Question';

import { randomUUID } from 'crypto';
import type { QuestionDTO } from '@/domain/formations/value-objects/QuestionDTO';
import type { ChapterDTO } from '@/domain/formations/value-objects/ChapterDTO';

type PrismaModuleRow = {
  id: string;
  title: string;
  description: string;
  imageMediaId: string | null;
  thematics: string;
  difficultyLevel: string | null;
  estimatedDuration: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  lessons?: any[];
  quizzes?: any[];
};

describe('PrismaModuleFormationRepository', () => {
  let repository: PrismaModuleFormationRepository;
  let mockPrisma: Partial<PrismaClient> & { module?: any };
  let uuid1: string;
  let uuid2: string;
  let uuid3: string;

  const makePrismaRow = (overrides: Partial<PrismaModuleRow> = {}): PrismaModuleRow => ({
    id: uuid1,
    title: 'Module Test',
    description: 'Description Test',
    imageMediaId: null,
    thematics: 'finance',
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: 60,
    status: ModuleStatus.DRAFT,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(() => {
    // Utiliser des UUIDs fixes valides pour les tests
    uuid1 = '550e8400-e29b-41d4-a716-446655440001';
    uuid2 = '550e8400-e29b-41d4-a716-446655440002';

    mockPrisma = {
      module: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    } as any;

    repository = new PrismaModuleFormationRepository(mockPrisma as unknown as PrismaClient);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });


  describe('save(module)', () => {
    it('devrait sauvegarder un module simple sans lessons ni quizzes', async () => {
      const domainModule = Module.create({
        id: EntityId.from(uuid1),
        title: 'Introduction à la finance',
        description: 'Un module complet pour apprendre les bases de la finance',
        imageMediaId: null,
        thematics: 'finance et comptabilité',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        lessons: [],
        quizzes: [],
        status: ModuleStatus.DRAFT,
      });

      const prismaRow: PrismaModuleRow = {
        id: uuid1,
        title: domainModule.title,
        description: domainModule.description,
        imageMediaId: domainModule.imageMediaId,
        thematics: domainModule.thematics,
        difficultyLevel: domainModule.difficultyLevel,
        estimatedDuration: domainModule.estimatedDuration,
        status: domainModule.status,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [],
        quizzes: [],
      };

      mockPrisma.module!.create.mockResolvedValue(prismaRow);

      const saved = await repository.save(domainModule);

      expect(mockPrisma.module!.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: uuid1,
          title: 'Introduction à la finance',
          description: 'Un module complet pour apprendre les bases de la finance',
          thematics: 'finance et comptabilité',
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 60,
          status: ModuleStatus.DRAFT,
       ,
          title: 'Titre A',
          description: 'Desc A',
         
          status: ModuleStatus.DRAFT,
          lessons: { create: [] },
        }),
        include: { lessons: true, quizzes: true },
      });

      expect(saved).toBeInstanceOf(Module);
      expect(saved.id.getValue()).toBe(uuid1);
      expect(saved.title).toBe('Introduction à la finance');
      expect(saved.thematics).toBe('finance et comptabilité');
    });

    it('devrait sauvegarder un module avec imageMediaId', async () => {
      const domainModule = new Module({
        id: EntityId.from(uuid1),
        title: 'Module avec image',
        description: 'Description du module',
        imageMediaId: 'media-123',
        thematics: 'investissement',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
      });

      const prismaRow: PrismaModuleRow = {
        id: uuid1,
        title: domainModule.title,
        description: domainModule.description,
        imageMediaId: 'media-123',
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
        data: expect.objectContaining({
          imageMedia: {
            connect: { id: 'media-123' },
          },
        }),
      });
      expect(saved.imageMediaId).toBe('media-123');
    });

    it('devrait sauvegarder un module avec lessons et chapters', async () => {
      const chapter1 = new Chapter('Chapitre 1', 'Description chapitre 1', 'media-1', 1);
      const chapter2 = new Chapter('Chapitre 2', 'Description chapitre 2', 'media-2', 2);

      const lesson1 = new Lesson({
        id: EntityId.from(uuid2),
        title: 'Leçon 1',
        description: 'Description leçon 1',
        duration: 30,
        order: 1,
        chapters: [chapter1, chapter2],
        status: LessonStatus.PUBLISHED,
      });

      const domainModule = Module.create({
        id: EntityId.from(uuid1),
        title: 'Module avec lessons',
        description: 'Description',
        imageUrl: 'http://example.com/image.jpg',
        thematics: [Thematic.SAVING, Thematic.INVESTMENT],
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 120,
        lessons: [lesson1],
        quizzes: [],
        status: ModuleStatus.PUBLISHED,
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
        lessons: [
          {
            id: uuid2,
            title: 'Leçon 1',
            description: 'Description leçon 1',
            duration: 30,
            order: 1,
            status: LessonStatus.PUBLISHED,
            chapters: [chapter1.toDTO(), chapter2.toDTO()],
          },
        ],
        quizzes: [],
      };

      mockPrisma.module!.create.mockResolvedValue(prismaRow);

      const saved = await repository.save(domainModule);

      expect(mockPrisma.module!.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Module avec lessons',
          lessons: {
            create: expect.arrayContaining([
              expect.objectContaining({
                id: uuid2,
                title: 'Leçon 1',
                chapters: expect.any(Array),
              }),
            ]),
          },
        }),
        include: { lessons: true, quizzes: true },
      });

      expect(saved.lessons).toHaveLength(1);
      expect(saved.lessons[0].chapters).toHaveLength(2);
    });

    it('devrait rejeter si prisma.create échoue', async () => {
      const domainModule = new Module({
        id: EntityId.from(uuid1),
        title: 'Module test',
        description: 'Description test',
        imageMediaId: null,
        thematics: 'gestion budgétaire',
        title: 'Titre B',
        description: 'Desc B',
        lessons: [],
        quizzes: [],
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 30,
        status: ModuleStatus.DRAFT,
      });

      const error = new Error('Erreur de création Prisma');
      mockPrisma.module!.create.mockRejectedValue(error);

      await expect(repository.save(domainModule)).rejects.toThrow('Erreur de création Prisma');
      expect(mockPrisma.module!.create).toHaveBeenCalled();
    });
  });

  describe('findByTitle', () => {
    it('devrait retourner un Module quand le titre est trouvé', async () => {
      const row: PrismaModuleRow = {
        id: uuid2,
        title: 'Gestion de patrimoine',
        description: 'Module avancé de gestion de patrimoine',
        imageMediaId: null,
        thematics: 'investissement et patrimoine',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 120,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [],
        quizzes: [],
      };

      mockPrisma.module!.findFirst.mockResolvedValue(row);

      const found = await repository.findByTitle('Gestion de patrimoine');

      expect(mockPrisma.module!.findFirst).toHaveBeenCalledWith({
        where: {
          title: {
            equals: 'Gestion de patrimoine',
          },
        },
      });
      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(Module);
      expect(found?.title).toBe('Gestion de patrimoine');
      expect(found?.thematics).toBe('investissement et patrimoine');
    });

    it("devrait retourner null si le titre n'est pas trouvé", async () => {
      mockPrisma.module!.findFirst.mockResolvedValue(null);

      const found = await repository.findByTitle('Titre inexistant');

      expect(mockPrisma.module!.findFirst).toHaveBeenCalledWith({
        where: {
          title: {
            equals: 'Titre inexistant',
          },
        },
      });
      expect(found).toBeNull();
    });

    it('devrait propager les erreurs de Prisma', async () => {
      const error = new Error('Erreur de base de données');
      mockPrisma.module!.findFirst.mockRejectedValue(error);

      await expect(repository.findByTitle('Test')).rejects.toThrow('Erreur de base de données');
    });
  });

  describe('findByThematic', () => {
    it('devrait trouver un module par thématique (insensible à la casse)', async () => {
      const row: PrismaModuleRow = {
        id: uuid1,
        title: 'Module Finance',
        description: 'Description',
        imageMediaId: null,
        thematics: 'finance et comptabilité',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.module!.findFirst.mockResolvedValue(row);

      const found = await repository.findByThematic('FINANCE ET COMPTABILITÉ');

      expect(mockPrisma.module!.findFirst).toHaveBeenCalledWith({
        where: {
          thematics: {
            equals: 'finance et comptabilité',
            mode: 'insensitive',
          },
        },
      });
      expect(found).not.toBeNull();
      expect(found?.thematics).toBe('finance et comptabilité');
    });

    it('devrait normaliser la thématique avec trim', async () => {
      const row: PrismaModuleRow = {
        id: uuid1,
        title: 'Module',
        description: 'Desc',
        imageMediaId: null,
        thematics: 'investissement',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 45,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.module!.findFirst.mockResolvedValue(row);

      await repository.findByThematic('  INVESTISSEMENT  ');

      expect(mockPrisma.module!.findFirst).toHaveBeenCalledWith({
        where: {
          thematics: {
            equals: 'investissement',
            mode: 'insensitive',
          },
        },
      });
    });

    it("devrait retourner null si la thématique n'existe pas", async () => {
      mockPrisma.module!.findFirst.mockResolvedValue(null);

      const found = await repository.findByThematic('thématique inexistante');

      expect(found).toBeNull();
    });

    it('devrait propager les erreurs de Prisma', async () => {
      const error = new Error('Erreur DB');
      mockPrisma.module!.findFirst.mockRejectedValue(error);

      await expect(repository.findByThematic('finance')).rejects.toThrow('Erreur DB');
    });
  });

  describe('findAll', () => {
    it('devrait retourner les modules paginés avec la pagination correcte', async () => {
      const rows: PrismaModuleRow[] = [
        {
          id: uuid1,
          title: 'Module 1',
          description: 'Description 1',
          imageMediaId: null,
          thematics: 'finance',
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 30,
          status: ModuleStatus.DRAFT,
          createdAt: new Date(),
          updatedAt: new Date(),
          lessons: [],
          quizzes: [],
        },
        {
          id: uuid2,
          title: 'Module 2',
          description: 'Description 2',
          imageMediaId: 'media-456',
          thematics: 'comptabilité',
          difficultyLevel: DifficultyLevel.ADVANCED,
          estimatedDuration: 60,
          status: ModuleStatus.PUBLISHED,
          createdAt: new Date(),
          updatedAt: new Date(),
          lessons: [],
          quizzes: [],
        },
      ];

      mockPrisma.module!.findMany.mockResolvedValue(rows);
      mockPrisma.module!.count.mockResolvedValue(12);

      const params = { page: 2, limit: 5 };
      const result = await repository.findAll(params);

      expect(mockPrisma.module!.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrisma.module!.count).toHaveBeenCalled();

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(Module);
      expect(result.data[0].title).toBe('Module 1');
      expect(result.data[1].title).toBe('Module 2');

      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 12,
        totalPages: 3,
      });
    });

    it('devrait calculer correctement le skip pour la page 1', async () => {
      mockPrisma.module!.findMany.mockResolvedValue([]);
      mockPrisma.module!.count.mockResolvedValue(0);

      await repository.findAll({ page: 1, limit: 10 });

      expect(mockPrisma.module!.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('devrait calculer correctement le skip pour la page 3', async () => {
      mockPrisma.module!.findMany.mockResolvedValue([]);
      mockPrisma.module!.count.mockResolvedValue(0);

      await repository.findAll({ page: 3, limit: 20 });

      expect(mockPrisma.module!.findMany).toHaveBeenCalledWith({
        skip: 40,
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
    });

    it("devrait gérer le cas d'une liste vide", async () => {
      mockPrisma.module!.findMany.mockResolvedValue([]);
      mockPrisma.module!.count.mockResolvedValue(0);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });

    it('devrait trier les modules par createdAt décroissant', async () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-15');

      const rows: PrismaModuleRow[] = [
        {
          id: uuid2,
          title: 'Module récent',
          description: 'Desc',
          imageMediaId: null,
          thematics: 'test',
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 30,
          status: ModuleStatus.DRAFT,
          createdAt: date2,
          updatedAt: date2,
        },
        {
          id: uuid1,
          title: 'Module ancien',
          description: 'Desc',
          imageMediaId: null,
          thematics: 'test',
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 30,
          status: ModuleStatus.DRAFT,
          createdAt: date1,
          updatedAt: date1,
        },
      ];

      mockPrisma.module!.findMany.mockResolvedValue(rows);
      mockPrisma.module!.count.mockResolvedValue(2);

      await repository.findAll({ page: 1, limit: 10 });

      expect(mockPrisma.module!.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('devrait propager les erreurs de findMany', async () => {
      const error = new Error('Erreur findMany');
      mockPrisma.module!.findMany.mockRejectedValue(error);
      mockPrisma.module!.count.mockResolvedValue(0);

      await expect(repository.findAll({ page: 1, limit: 10 })).rejects.toThrow('Erreur findMany');
    });

    it('devrait propager les erreurs de count', async () => {
      const error = new Error('Erreur count');
      mockPrisma.module!.findMany.mockResolvedValue([]);
      mockPrisma.module!.count.mockRejectedValue(error);

      await expect(repository.findAll({ page: 1, limit: 10 })).rejects.toThrow('Erreur count');
    });
  });

  describe('toDomain (conversion Prisma vers Domain)', () => {
    it('devrait convertir correctement une ligne Prisma en entité Module', async () => {
      const createdAt = new Date('2024-01-01T10:00:00Z');
      const updatedAt = new Date('2024-01-15T14:30:00Z');

      const row: PrismaModuleRow = {
        id: uuid1,
        title: 'Test Module',
        description: 'Test Description',
        imageMediaId: 'media-789',
        thematics: 'finance et gestion',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
        createdAt,
        updatedAt,
      };

      mockPrisma.module!.findFirst.mockResolvedValue(row);

      const module = await repository.findByTitle('Test Module');

      expect(module).not.toBeNull();
      expect(module!.id.getValue()).toBe(uuid1);
      expect(module!.title).toBe('Test Module');
      expect(module!.description).toBe('Test Description');
      expect(module!.imageMediaId).toBe('media-789');
      expect(module!.thematics).toBe('finance et gestion');
      expect(module!.difficultyLevel).toBe(DifficultyLevel.INTERMEDIATE);
      expect(module!.estimatedDuration).toBe(90);
      expect(module!.status).toBe(ModuleStatus.PUBLISHED);
      expect(module!.createdAt).toEqual(createdAt);
      expect(module!.updatedAt).toEqual(updatedAt);
    });

    it('devrait gérer imageMediaId null', async () => {
      const row: PrismaModuleRow = {
        id: uuid1,
        title: 'Module sans image',
        description: 'Description',
        imageMediaId: null,
        thematics: 'test',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.module!.findFirst.mockResolvedValue(row);

      const module = await repository.findByTitle('Module sans image');

      expect(module!.imageMediaId).toBeNull();
    });
  });

  describe('toPrismaData (conversion Domain vers Prisma)', () => {
    it('devrait convertir correctement une entité Module sans imageMediaId', async () => {
      const domainModule = new Module({
        id: EntityId.from(uuid1),
        title: 'Module Test',
        description: 'Description Test',
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
      });

      // ⚠️ IMPORTANT: retourner une ligne Prisma valide (sinon toDomain casse)
      mockPrisma.module!.create.mockResolvedValue(makePrismaRow());

      await repository.save(domainModule);

      expect(mockPrisma.module!.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: uuid1,
          title: 'Module Test',
          description: 'Description Test',
          thematics: 'finance',
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 60,
          status: ModuleStatus.DRAFT,
        }),
      });

      const callArgs = mockPrisma.module!.create.mock.calls[0][0];
      expect(callArgs.data.imageMedia).toBeUndefined();
    });

    it('devrait convertir correctement une entité Module avec imageMediaId', async () => {
      const domainModule = new Module({
        id: EntityId.from(uuid1),
        title: 'Module avec Image',
        description: 'Description',
        imageMediaId: 'media-123',
        thematics: 'investissement',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 120,
        status: ModuleStatus.PUBLISHED,
      });

      // ⚠️ IMPORTANT: retourner une ligne Prisma valide (sinon toDomain casse)
      mockPrisma.module!.create.mockResolvedValue(
        makePrismaRow({
          title: 'Module avec Image',
          description: 'Description',
          thematics: 'investissement',
          imageMediaId: 'media-123',
          difficultyLevel: DifficultyLevel.ADVANCED,
          estimatedDuration: 120,
          status: ModuleStatus.PUBLISHED,
        })
      );

      await repository.save(domainModule);

      expect(mockPrisma.module!.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: uuid1,
          imageMedia: {
            connect: { id: 'media-123' },
          },
        }),
      });
    });
  });

  // ---------------------------------------------------------------------------
  // update(module)
  // ---------------------------------------------------------------------------

  describe('update(module)', () => {
    it('devrait mettre à jour un module sans ajouter de nouvelles lessons', async () => {
      const existingModule: PrismaModuleRow = {
        id: uuid1,
        title: 'Old Title',
        description: 'Old Desc',
        imageUrl: null,
        thematics: [Thematic.FINANCIAL_EDUCATION],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [],
        quizzes: [],
      };

      const updatedModule = Module.create({
        id: EntityId.from(uuid1),
        title: 'New Title',
        description: 'New Desc',
        imageUrl: 'http://example.com/new.jpg',
        thematics: [Thematic.SAVING],
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 60,
        lessons: [],
        quizzes: [],
        status: ModuleStatus.PUBLISHED,
      });

      const updatedRow: PrismaModuleRow = {
        ...existingModule,
        title: 'New Title',
        description: 'New Desc',
        imageUrl: 'http://example.com/new.jpg',
        thematics: [Thematic.SAVING],
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 60,
        status: ModuleStatus.PUBLISHED,
      };

      mockPrisma.module!.findUnique.mockResolvedValue(existingModule);
      mockPrisma.module!.update.mockResolvedValue(updatedRow);

      const result = await repository.update(updatedModule);

      expect(mockPrisma.module!.findUnique).toHaveBeenCalledWith({
        where: { id: uuid1 },
        include: { lessons: true, quizzes: true },
      });

      expect(mockPrisma.module!.update).toHaveBeenCalledWith({
        where: { id: uuid1 },
        data: {
          title: 'New Title',
          description: 'New Desc',
          imageUrl: 'http://example.com/new.jpg',
          thematics: [Thematic.SAVING],
          difficultyLevel: DifficultyLevel.INTERMEDIATE,
          estimatedDuration: 60,
          status: ModuleStatus.PUBLISHED,
        },
        include: { lessons: true, quizzes: true },
      });

      expect(result).toBeInstanceOf(Module);
      expect(result.title).toBe('New Title');
    });

    it('devrait ajouter de nouvelles lessons lors de la mise à jour', async () => {
      const existingLesson = {
        id: uuid2,
        title: 'Existing Lesson',
        description: 'Desc',
        duration: 20,
        order: 1,
        status: LessonStatus.PUBLISHED,
        chapters: [],
      };

      const existingModule: PrismaModuleRow = {
        id: uuid1,
        title: 'Module',
        description: 'Desc',
        imageUrl: null,
        thematics: [Thematic.FINANCIAL_EDUCATION],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [existingLesson],
        quizzes: [],
      };

      const newLesson = new Lesson({
        id: EntityId.from(uuid3),
        title: 'New Lesson',
        description: 'New Desc',
        duration: 25,
        order: 2,
        chapters: [],
        status: LessonStatus.DRAFT,
      });

      const updatedModule = Module.create({
        id: EntityId.from(uuid1),
        title: 'Module',
        description: 'Desc',
        imageUrl: null,
        thematics: [Thematic.FINANCIAL_EDUCATION],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 55,
        lessons: [
          new Lesson({
            id: EntityId.from(uuid2),
            title: 'Existing Lesson',
            description: 'Desc',
            duration: 20,
            order: 1,
            chapters: [],
            status: LessonStatus.PUBLISHED,
          }),
          newLesson,
        ],
        quizzes: [],
        status: ModuleStatus.DRAFT,
      });

      const updatedRow: PrismaModuleRow = {
        ...existingModule,
        estimatedDuration: 55,
        lessons: [
          existingLesson,
          {
            id: uuid3,
            title: 'New Lesson',
            description: 'New Desc',
            duration: 25,
            order: 2,
            status: LessonStatus.DRAFT,
            chapters: [],
          },
        ],
      };

      mockPrisma.module!.findUnique.mockResolvedValue(existingModule);
      mockPrisma.module!.update.mockResolvedValue(updatedRow);

      const result = await repository.update(updatedModule);

      expect(mockPrisma.module!.update).toHaveBeenCalledWith({
        where: { id: uuid1 },
        data: expect.objectContaining({
          estimatedDuration: 55,
          lessons: {
            create: [
              expect.objectContaining({
                id: uuid3,
                title: 'New Lesson',
              }),
            ],
          },
        }),
        include: { lessons: true, quizzes: true },
      });

      expect(result.lessons).toHaveLength(2);
    });

    it('devrait ajouter de nouveaux quizzes lors de la mise à jour', async () => {
      const existingQuiz = {
        id: uuid2,
        title: 'Existing Quiz',
        description: 'Desc',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 70,
        duree: 30,
        nombreTentatives: 3,
        questions: [],
      };

      const existingModule: PrismaModuleRow = {
        id: uuid1,
        title: 'Module',
        description: 'Desc',
        imageUrl: null,
        thematics: [Thematic.INVESTMENT],
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [],
        quizzes: [existingQuiz],
      };

      const newQuiz = new Quiz({
        id: EntityId.from(uuid3),
        title: 'New Quiz',
        description: 'New Quiz Desc',
        status: QuizStatus.DRAFT,
        scoreMinimum: 60,
        duree: 20,
        nombreTentatives: 2, // ✅ Valeur valide entre 1 et 3
        questions: [],
      });

      const updatedModule = Module.create({
        id: EntityId.from(uuid1),
        title: 'Module',
        description: 'Desc',
        imageUrl: null,
        thematics: [Thematic.INVESTMENT],
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 90,
        lessons: [],
        quizzes: [
          new Quiz({
            id: EntityId.from(uuid2),
            title: 'Existing Quiz',
            description: 'Desc',
            status: QuizStatus.PUBLISHED,
            scoreMinimum: 70,
            duree: 30,
            nombreTentatives: 3,
            questions: [],
          }),
          newQuiz,
        ],
        status: ModuleStatus.PUBLISHED,
      });

      const updatedRow: PrismaModuleRow = {
        ...existingModule,
        quizzes: [
          existingQuiz,
          {
            id: uuid3,
            title: 'New Quiz',
            description: 'New Quiz Desc',
            status: QuizStatus.DRAFT,
            scoreMinimum: 60,
            duree: 20,
            nombreTentatives: 2, // ✅ Valeur valide entre 1 et 3
            questions: [],
          },
        ],
      };

      mockPrisma.module!.findUnique.mockResolvedValue(existingModule);
      mockPrisma.module!.update.mockResolvedValue(updatedRow);

      const result = await repository.update(updatedModule);

      expect(mockPrisma.module!.update).toHaveBeenCalledWith({
        where: { id: uuid1 },
        data: expect.objectContaining({
          quizzes: {
            create: [
              expect.objectContaining({
                id: uuid3,
                title: 'New Quiz',
              }),
            ],
          },
        }),
        include: { lessons: true, quizzes: true },
      });

      expect(result.quizzes).toHaveLength(2);
    });

    it('devrait ajouter à la fois de nouvelles lessons et quizzes', async () => {
      const existingModule: PrismaModuleRow = {
        id: uuid1,
        title: 'Module',
        description: 'Desc',
        imageUrl: null,
        thematics: [Thematic.SAVING],
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [],
        quizzes: [],
      };

      const newLesson = new Lesson({
        id: EntityId.from(uuid2),
        title: 'New Lesson',
        description: 'Lesson Desc',
        duration: 30,
        order: 1,
        chapters: [],
        status: LessonStatus.DRAFT,
      });

      const newQuiz = new Quiz({
        id: EntityId.from(uuid3),
        title: 'New Quiz',
        description: 'Quiz Desc',
        status: QuizStatus.DRAFT,
        scoreMinimum: 50,
        duree: 15,
        nombreTentatives: 3,
        questions: [],
      });

      const updatedModule = Module.create({
        id: EntityId.from(uuid1),
        title: 'Module',
        description: 'Desc',
        imageUrl: null,
        thematics: [Thematic.SAVING],
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 60,
        lessons: [newLesson],
        quizzes: [newQuiz],
        status: ModuleStatus.DRAFT,
      });

      const updatedRow: PrismaModuleRow = {
        ...existingModule,
        lessons: [
          {
            id: uuid2,
            title: 'New Lesson',
            description: 'Lesson Desc',
            duration: 30,
            order: 1,
            status: LessonStatus.DRAFT,
            chapters: [],
          },
        ],
        quizzes: [
          {
            id: uuid3,
            title: 'New Quiz',
            description: 'Quiz Desc',
            status: QuizStatus.DRAFT,
            scoreMinimum: 50,
            duree: 15,
            nombreTentatives: 3,
            questions: [],
          },
        ],
      };

      mockPrisma.module!.findUnique.mockResolvedValue(existingModule);
      mockPrisma.module!.update.mockResolvedValue(updatedRow);

      const result = await repository.update(updatedModule);

      expect(mockPrisma.module!.update).toHaveBeenCalledWith({
        where: { id: uuid1 },
        data: expect.objectContaining({
          lessons: { create: expect.any(Array) },
          quizzes: { create: expect.any(Array) },
        }),
        include: { lessons: true, quizzes: true },
      });

      expect(result.lessons).toHaveLength(1);
      expect(result.quizzes).toHaveLength(1);
    });

    it('devrait gérer le cas où le module existant est null', async () => {
      const updatedModule = Module.create({
        id: EntityId.from(uuid1),
        title: 'Module',
        description: 'Desc',
        imageUrl: null,
        thematics: [Thematic.FINANCIAL_EDUCATION],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
        lessons: [],
        quizzes: [],
        status: ModuleStatus.DRAFT,
      });

      const updatedRow: PrismaModuleRow = {
        id: uuid1,
        title: 'Module',
        description: 'Desc',
        imageUrl: null,
        thematics: [Thematic.FINANCIAL_EDUCATION],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [],
        quizzes: [],
      };

      mockPrisma.module!.findUnique.mockResolvedValue(null);
      mockPrisma.module!.update.mockResolvedValue(updatedRow);

      const result = await repository.update(updatedModule);

      expect(result).toBeInstanceOf(Module);
    });
  });
});
