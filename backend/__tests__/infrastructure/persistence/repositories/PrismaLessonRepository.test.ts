import { PrismaLessonRepository } from '@/infrastructure/persistence/repositories/PrismaLessonRepository';
import { EntityId } from '@/domain/shared/EntityId';
import { Lesson, LessonStatus } from '@/domain/formations/entities/Lesson';
import { Chapter } from '@/domain/formations/entities/Chapter';
import type { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

type PrismaLessonRow = {
  id: string;
  title: string;
  description: string;
  duration: number;
  order: number;
  status: string;
  chapters: any;
  createdAt: Date;
  updatedAt: Date;
};

describe('PrismaLessonRepository — tests avec couverture 100%', () => {
  let repository: PrismaLessonRepository;
  let mockPrisma: Partial<PrismaClient> & { lesson?: any };
  let uuid1: string;
  let uuid2: string;

  beforeEach(() => {
    uuid1 = randomUUID();
    uuid2 = randomUUID();

    mockPrisma = {
      lesson: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    } as any;

    repository = new PrismaLessonRepository(mockPrisma as unknown as PrismaClient);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findById(id)', () => {
    it('devrait retourner une Lesson quand elle est trouvée', async () => {
      const chaptersData = [
        {
          title: 'Chapitre 1',
          description: 'Description chapitre 1',
          mediaId: 'media-123',
          order: 0,
        },
        {
          title: 'Chapitre 2',
          description: 'Description chapitre 2',
          mediaId: 'media-456',
          order: 1,
        },
      ];

      const row: PrismaLessonRow = {
        id: uuid1,
        title: 'Leçon de test',
        description: 'Description de test',
        duration: 60,
        order: 1,
        status: LessonStatus.PUBLISHED,
        chapters: chaptersData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.lesson!.findUnique.mockResolvedValue(row);

      const found = await repository.findById(uuid1);

      expect(mockPrisma.lesson!.findUnique).toHaveBeenCalledWith({
        where: { id: uuid1 },
      });
      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(Lesson);
      expect(found?.title).toBe('Leçon de test');
      expect(found?.description).toBe('Description de test');
      expect(found?.duration).toBe(60);
      expect(found?.order).toBe(1);
      expect(found?.status).toBe(LessonStatus.PUBLISHED);
      expect(found?.chapters).toHaveLength(2);
      expect(found?.chapters[0]).toBeInstanceOf(Chapter);
      expect(found?.chapters[0].title).toBe('Chapitre 1');
    });

    it('devrait retourner null si la leçon est introuvable', async () => {
      mockPrisma.lesson!.findUnique.mockResolvedValue(null);

      const found = await repository.findById('non-existent-id');

      expect(mockPrisma.lesson!.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      expect(found).toBeNull();
    });

    it('devrait gérer les leçons sans chapitres', async () => {
      const row: PrismaLessonRow = {
        id: uuid1,
        title: 'Leçon sans chapitres',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.lesson!.findUnique.mockResolvedValue(row);

      const found = await repository.findById(uuid1);

      expect(found).not.toBeNull();
      expect(found?.chapters).toHaveLength(0);
    });

    it('devrait gérer les chapitres avec des valeurs null ou non-array', async () => {
      const row: PrismaLessonRow = {
        id: uuid1,
        title: 'Leçon test',
        description: 'Description',
        duration: 45,
        order: 2,
        status: LessonStatus.SCHEDULED,
        chapters: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.lesson!.findUnique.mockResolvedValue(row);

      const found = await repository.findById(uuid1);

      expect(found).not.toBeNull();
      expect(found?.chapters).toHaveLength(0);
    });

    it('devrait propager les erreurs de prisma', async () => {
      const error = new Error('Database connection failed');
      mockPrisma.lesson!.findUnique.mockRejectedValue(error);

      await expect(repository.findById(uuid1)).rejects.toThrow('Database connection failed');
    });
  });

  describe('findAll(params)', () => {
    it('devrait utiliser skip/take et retourner la pagination correcte', async () => {
      const chaptersData = [
        {
          title: 'Intro',
          description: 'Introduction',
          mediaId: 'media-001',
          order: 0,
        },
      ];

      const rows: PrismaLessonRow[] = [
        {
          id: uuid1,
          title: 'Leçon 1',
          description: 'Description 1',
          duration: 30,
          order: 0,
          status: LessonStatus.DRAFT,
          chapters: chaptersData,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: uuid2,
          title: 'Leçon 2',
          description: 'Description 2',
          duration: 45,
          order: 1,
          status: LessonStatus.PUBLISHED,
          chapters: [],
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      mockPrisma.lesson!.findMany.mockResolvedValue(rows);
      mockPrisma.lesson!.count.mockResolvedValue(15);

      const params = { page: 2, limit: 5 };
      const result = await repository.findAll(params);

      expect(mockPrisma.lesson!.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrisma.lesson!.count).toHaveBeenCalled();

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(Lesson);
      expect(result.data[0].title).toBe('Leçon 1');
      expect(result.data[1].title).toBe('Leçon 2');

      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
      });
    });

    it('devrait gérer la première page', async () => {
      mockPrisma.lesson!.findMany.mockResolvedValue([]);
      mockPrisma.lesson!.count.mockResolvedValue(0);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(mockPrisma.lesson!.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      expect(result.data).toEqual([]);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('devrait gérer un cas avec résultats et différentes tailles de page', async () => {
      const rows: PrismaLessonRow[] = Array.from({ length: 3 }, (_, i) => ({
        id: randomUUID(),
        title: `Leçon ${i + 1}`,
        description: `Description ${i + 1}`,
        duration: 20 + i * 10,
        order: i,
        status: LessonStatus.PUBLISHED,
        chapters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockPrisma.lesson!.findMany.mockResolvedValue(rows);
      mockPrisma.lesson!.count.mockResolvedValue(23);

      const result = await repository.findAll({ page: 3, limit: 10 });

      expect(result.data).toHaveLength(3);
      expect(result.pagination).toEqual({
        page: 3,
        limit: 10,
        total: 23,
        totalPages: 3,
      });
    });

    it('devrait propager les erreurs de findMany', async () => {
      mockPrisma.lesson!.findMany.mockRejectedValue(new Error('Query failed'));
      mockPrisma.lesson!.count.mockResolvedValue(0);

      await expect(repository.findAll({ page: 1, limit: 10 })).rejects.toThrow('Query failed');
    });

    it('devrait propager les erreurs de count', async () => {
      mockPrisma.lesson!.findMany.mockResolvedValue([]);
      mockPrisma.lesson!.count.mockRejectedValue(new Error('Count failed'));

      await expect(repository.findAll({ page: 1, limit: 10 })).rejects.toThrow('Count failed');
    });
  });

  describe('update(lesson)', () => {
    it('devrait mettre à jour une leçon et retourner la version mise à jour', async () => {
      const chapter1 = new Chapter('Chapitre A', 'Desc A', 'media-aaa', 0);
      const chapter2 = new Chapter('Chapitre B', 'Desc B', 'media-bbb', 1);

      const domainLesson = new Lesson({
        id: EntityId.from(uuid1),
        title: 'Leçon modifiée',
        description: 'Description modifiée',
        duration: 90,
        order: 5,
        status: LessonStatus.PUBLISHED,
        chapters: [chapter1, chapter2],
      });

      const updatedRow: PrismaLessonRow = {
        id: uuid1,
        title: 'Leçon modifiée',
        description: 'Description modifiée',
        duration: 90,
        order: 5,
        status: LessonStatus.PUBLISHED,
        chapters: [chapter1.toDTO(), chapter2.toDTO()],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      };

      mockPrisma.lesson!.update.mockResolvedValue(updatedRow);

      const result = await repository.update(domainLesson);

      expect(mockPrisma.lesson!.update).toHaveBeenCalledWith({
        where: { id: uuid1 },
        data: {
          title: 'Leçon modifiée',
          description: 'Description modifiée',
          duration: 90,
          order: 5,
          status: LessonStatus.PUBLISHED,
          chapters: [
            {
              title: 'Chapitre A',
              description: 'Desc A',
              mediaId: 'media-aaa',
              order: 0,
            },
            {
              title: 'Chapitre B',
              description: 'Desc B',
              mediaId: 'media-bbb',
              order: 1,
            },
          ],
        },
      });

      expect(result).toBeInstanceOf(Lesson);
      expect(result.title).toBe('Leçon modifiée');
      expect(result.duration).toBe(90);
      expect(result.chapters).toHaveLength(2);
    });

    it('devrait mettre à jour une leçon sans chapitres', async () => {
      const domainLesson = new Lesson({
        id: EntityId.from(uuid2),
        title: 'Leçon vide',
        description: 'Sans chapitres',
        duration: 15,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
      });

      const updatedRow: PrismaLessonRow = {
        id: uuid2,
        title: 'Leçon vide',
        description: 'Sans chapitres',
        duration: 15,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.lesson!.update.mockResolvedValue(updatedRow);

      const result = await repository.update(domainLesson);

      expect(mockPrisma.lesson!.update).toHaveBeenCalledWith({
        where: { id: uuid2 },
        data: {
          title: 'Leçon vide',
          description: 'Sans chapitres',
          duration: 15,
          order: 0,
          status: LessonStatus.DRAFT,
          chapters: [],
        },
      });

      expect(result.chapters).toHaveLength(0);
    });

    it('devrait gérer tous les statuts de leçon', async () => {
      const statuses = [
        LessonStatus.DRAFT,
        LessonStatus.PUBLISHED,
        LessonStatus.ARCHIVED,
        LessonStatus.SCHEDULED,
      ];

      for (const status of statuses) {
        const domainLesson = new Lesson({
          id: EntityId.from(uuid1),
          title: `Leçon ${status}`,
          description: 'Test',
          duration: 30,
          order: 0,
          status,
          chapters: [],
        });

        const updatedRow: PrismaLessonRow = {
          id: uuid1,
          title: `Leçon ${status}`,
          description: 'Test',
          duration: 30,
          order: 0,
          status,
          chapters: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrisma.lesson!.update.mockResolvedValue(updatedRow);

        const result = await repository.update(domainLesson);

        expect(result.status).toBe(status);
      }
    });

    it('devrait propager les erreurs de update', async () => {
      const domainLesson = new Lesson({
        id: EntityId.from(uuid1),
        title: 'Test',
        description: 'Test',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
      });

      const error = new Error('Update failed');
      mockPrisma.lesson!.update.mockRejectedValue(error);

      await expect(repository.update(domainLesson)).rejects.toThrow('Update failed');
    });
  });

  describe('Mapping privé - toDomain', () => {
    it('devrait mapper correctement avec plusieurs chapitres', async () => {
      const chaptersData = [
        {
          title: 'Chapitre 1',
          description: 'Desc 1',
          mediaId: 'media-1',
          order: 0,
        },
        {
          title: 'Chapitre 2',
          description: 'Desc 2',
          mediaId: 'media-2',
          order: 1,
        },
        {
          title: 'Chapitre 3',
          description: 'Desc 3',
          mediaId: 'media-3',
          order: 2,
        },
      ];

      const row: PrismaLessonRow = {
        id: uuid1,
        title: 'Leçon complète',
        description: 'Description complète',
        duration: 120,
        order: 10,
        status: LessonStatus.ARCHIVED,
        chapters: chaptersData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.lesson!.findUnique.mockResolvedValue(row);

      const found = await repository.findById(uuid1);

      expect(found).not.toBeNull();
      expect(found?.chapters).toHaveLength(3);
      expect(found?.chapters[0].title).toBe('Chapitre 1');
      expect(found?.chapters[0].mediaId).toBe('media-1');
      expect(found?.chapters[0].order).toBe(0);
      expect(found?.chapters[1].title).toBe('Chapitre 2');
      expect(found?.chapters[2].title).toBe('Chapitre 3');
    });
  });

  describe('Mapping privé - toPrismaUpdateData', () => {
    it('devrait transformer correctement les chapitres en DTO pour Prisma', async () => {
      const chapters = [
        new Chapter('Ch 1', 'Description 1', 'media-x', 0),
        new Chapter('Ch 2', 'Description 2', 'media-y', 1),
      ];

      const domainLesson = new Lesson({
        id: EntityId.from(uuid1),
        title: 'Test mapping',
        description: 'Test',
        duration: 50,
        order: 3,
        status: LessonStatus.SCHEDULED,
        chapters,
      });

      const updatedRow: PrismaLessonRow = {
        id: uuid1,
        title: 'Test mapping',
        description: 'Test',
        duration: 50,
        order: 3,
        status: LessonStatus.SCHEDULED,
        chapters: chapters.map(c => c.toDTO()),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.lesson!.update.mockResolvedValue(updatedRow);

      await repository.update(domainLesson);

      const callArgs = mockPrisma.lesson!.update.mock.calls[0][0];
      expect(callArgs.data.chapters).toEqual([
        {
          title: 'Ch 1',
          description: 'Description 1',
          mediaId: 'media-x',
          order: 0,
        },
        {
          title: 'Ch 2',
          description: 'Description 2',
          mediaId: 'media-y',
          order: 1,
        },
      ]);
    });
  });
});
