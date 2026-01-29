import { PrismaModuleFormationRepository } from '@/infrastructure/persistence/repositories/PrismaModuleFormationRepository';
import { EntityId } from '@/domain/shared/EntityId';
import {
  Module,
  ModuleStatus,
  DifficultyLevel,
} from '@/domain/formations/entities/ModuleFormation';
import { Lesson, LessonStatus } from '@/domain/formations/entities/Lesson';
import { Quiz, QuizStatus } from '@/domain/formations/entities/Quiz';
import { Chapter } from '@/domain/formations/entities/Chapter';
import {
  QuestionChoixUnique,
  QuestionChoixMultiple,
  TypeQuestion,
} from '@/domain/formations/entities/Question';
import type { PrismaClient } from '@prisma/client';

// S'assurer qu'EntityId n'est pas mocké
jest.unmock('@/domain/shared/EntityId');

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
    uuid1 = randomUUID();
    uuid2 = randomUUID();
    uuid3 = randomUUID();

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

  describe('save', () => {
    it('devrait sauvegarder un module et retourner une entité Module', async () => {
      const domainModule = new Module({
        id: EntityId.from(uuid1),
        title: 'Titre A',
        description: 'Desc A',
        thematics: 'financial_education',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
      });

      const prismaRow: PrismaModuleRow = {
        id: uuid1,
        title: domainModule.title,
        description: domainModule.description,
        imageMediaId: domainModule.imageMediaId,
        thematics: 'financial_education',
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
          title: 'Titre A',
          description: 'Desc A',
          thematics: 'financial_education',
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 60,
          status: ModuleStatus.DRAFT,
        }),
      });
      expect(saved).toBeInstanceOf(Module);
      expect(saved.id.getValue()).toBe(uuid1);
      expect(saved.title).toBe('Titre A');
    });

    it('devrait sauvegarder un module avec lessons et chapters', async () => {
      const chapter1 = new Chapter(
        EntityId.generate(),
        'Chapitre 1',
        'Description chapitre 1',
        'media-1',
        1
      );
      const chapter2 = new Chapter(
        EntityId.generate(),
        'Chapitre 2',
        'Description chapitre 2',
        'media-2',
        2
      );

      const lesson1 = new Lesson({
        id: EntityId.from(uuid2),
        moduleId: uuid1,
        title: 'Leçon 1',
        description: 'Description leçon 1',
        duration: 30,
        order: 1,
        chapters: [chapter1, chapter2],
        quizzes: [],
        status: LessonStatus.PUBLISHED,
      });

      const domainModule = Module.create({
        id: EntityId.from(uuid1),
        title: 'Module avec lessons',
        description: 'Description',
        imageMediaId: 'http://example.com/image.jpg',
        thematics: 'financial_education',
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
        imageMediaId: domainModule.imageMediaId,
        thematics: domainModule.thematics,
        difficultyLevel: domainModule.difficultyLevel,
        estimatedDuration: domainModule.estimatedDuration,
        status: domainModule.status,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [
          {
            id: uuid2,
            moduleId: uuid1,
            title: 'Leçon 1',
            description: 'Description leçon 1',
            duration: 30,
            order: 1,
            status: LessonStatus.PUBLISHED,
            chapters: [
              {
                ...chapter1.toDTO(),
                quizzes: [],
              },
              {
                ...chapter2.toDTO(),
                quizzes: [],
              },
            ],
            quizzes: [],
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
                chapters: expect.any(Object),
              }),
            ]),
          },
        }),
        include: {
          lessons: {
            include: {
              chapters: { include: { quizzes: true } },
              quizzes: true,
            },
          },
          quizzes: true,
        },
      });

      expect(saved.lessons).toHaveLength(1);
      expect(saved.lessons[0].chapters).toHaveLength(2);
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
      const domainModule = Module.create({
        id: EntityId.from(uuid1),
        title: 'Titre B',
        description: 'Desc B',
        imageMediaId: null,
        thematics: 'gestion budgétaire',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 30,
        status: ModuleStatus.DRAFT,
      });

      const err = new Error('prisma create error');
      mockPrisma.module!.create.mockRejectedValue(err);

      await expect(repository.save(domainModule)).rejects.toThrow('prisma create error');
    });
  });

  // ---------------------------------------------------------------------------
  // findByTitle(title)
  // ---------------------------------------------------------------------------

  describe('findByTitle(title)', () => {
    it('devrait retourner Module quand trouvé', async () => {
      const row: PrismaModuleRow = {
        id: uuid2,
        title: 'Found',
        description: 'd',
        imageMediaId: null,
        thematics: 'investment',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [],
        quizzes: [],
      };

      mockPrisma.module!.findFirst.mockResolvedValue(row);

      const found = await repository.findByTitle('Found');

      expect(mockPrisma.module!.findFirst).toHaveBeenCalledWith({
        where: { title: { equals: 'Found' } },
        include: {
          lessons: {
            include: {
              chapters: { include: { quizzes: true } },
              quizzes: true,
            },
          },
          quizzes: true,
        },
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

  // ---------------------------------------------------------------------------
  // findById(id)
  // ---------------------------------------------------------------------------

  describe('findById(id)', () => {
    it('devrait retourner Module quand trouvé par id', async () => {
      const row: PrismaModuleRow = {
        id: uuid1,
        title: 'Module by ID',
        description: 'Description',
        imageMediaId: null,
        thematics: 'financial_education',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 45,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [],
        quizzes: [],
      };

      mockPrisma.module!.findUnique.mockResolvedValue(row);

      const found = await repository.findById(uuid1);

      expect(mockPrisma.module!.findUnique).toHaveBeenCalledWith({
        where: { id: uuid1 },
        include: {
          lessons: {
            include: {
              chapters: { include: { quizzes: true } },
              quizzes: true,
            },
          },
          quizzes: true,
        },
      });
      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(Module);
      expect(found?.id.getValue()).toBe(uuid1);
    });

    it('devrait retourner null si id introuvable', async () => {
      mockPrisma.module!.findUnique.mockResolvedValue(null);

      const found = await repository.findById('non-existent-id');
      expect(found).toBeNull();
    });

    it('devrait mapper correctement les lessons avec chapters', async () => {
      const chaptersDto: ChapterDTO[] = [
        {
          id: randomUUID(),
          title: 'Ch1',
          description: 'Desc1',
          mediaId: 'media1',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          quizzes: [],
        },
        {
          id: randomUUID(),
          title: 'Ch2',
          description: 'Desc2',
          mediaId: 'media2',
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          quizzes: [],
        },
      ];

      const row: PrismaModuleRow = {
        id: uuid1,
        title: 'Module with chapters',
        description: 'Description',
        imageMediaId: null,
        thematics: 'financial_education',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 60,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [
          {
            id: uuid2,
            moduleId: uuid1,
            title: 'Lesson with chapters',
            description: 'Lesson desc',
            duration: 30,
            order: 1,
            status: LessonStatus.PUBLISHED,
            chapters: chaptersDto,
            quizzes: [],
          },
        ],
        quizzes: [],
      };

      mockPrisma.module!.findUnique.mockResolvedValue(row);

      const found = await repository.findById(uuid1);

      expect(found?.lessons).toHaveLength(1);
      expect(found?.lessons[0].chapters).toHaveLength(2);
      expect(found?.lessons[0].chapters[0]).toBeInstanceOf(Chapter);
      expect(found?.lessons[0].chapters[0].title).toBe('Ch1');
    });

    it('devrait mapper correctement les quizzes avec questions', async () => {
      const questionsDto: QuestionDTO[] = [
        {
          type: TypeQuestion.CHOIX_UNIQUE,
          question: 'Question 1?',
          points: 10,
          options: [
            { text: 'Option A', isCorrect: true },
            { text: 'Option B', isCorrect: false },
          ],
          explication: 'Explication 1',
        },
        {
          type: TypeQuestion.CHOIX_MULTIPLE,
          question: 'Question 2?',
          points: 15,
          options: [
            { text: 'Option C', isCorrect: true },
            { text: 'Option D', isCorrect: true },
            { text: 'Option E', isCorrect: false },
          ],
          explication: 'Explication 2',
        },
      ];

      const row: PrismaModuleRow = {
        id: uuid1,
        title: 'Module with quiz',
        description: 'Description',
        imageMediaId: null,
        thematics: 'investment',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [],
        quizzes: [
          {
            id: uuid3,
            moduleId: uuid1,
            title: 'Quiz 1',
            description: 'Quiz description',
            status: QuizStatus.PUBLISHED,
            scoreMinimum: 70,
            duree: 30,
            nombreTentatives: 3,
            questions: questionsDto,
          },
        ],
      };

      mockPrisma.module!.findUnique.mockResolvedValue(row);

      const found = await repository.findById(uuid1);

      expect(found?.quizzes).toHaveLength(1);
      expect(found?.quizzes[0].questions).toHaveLength(2);
      expect(found?.quizzes[0].questions[0]).toBeInstanceOf(QuestionChoixUnique);
      expect(found?.quizzes[0].questions[1]).toBeInstanceOf(QuestionChoixMultiple);
      // ✅ Vérifier que moduleId est correctement mappé
      expect(found?.quizzes[0].moduleId).toBe(uuid1);
    });

    it('devrait gérer les chapters vides ou non-array', async () => {
      const row: PrismaModuleRow = {
        id: uuid1,
        title: 'Module',
        description: 'Description',
        imageMediaId: null,
        thematics: 'financial_education',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [
          {
            id: uuid2,
            moduleId: uuid1,
            title: 'Lesson',
            description: 'Desc',
            duration: 20,
            order: 1,
            status: LessonStatus.DRAFT,
            chapters: null,
            quizzes: [],
          },
        ],
        quizzes: [],
      };

      mockPrisma.module!.findUnique.mockResolvedValue(row);

      const found = await repository.findById(uuid1);

      expect(found?.lessons[0].chapters).toEqual([]);
    });

    it('devrait gérer les questions vides ou non-array', async () => {
      const row: PrismaModuleRow = {
        id: uuid1,
        title: 'Module',
        description: 'Description',
        imageMediaId: null,
        thematics: 'financial_education',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 45,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [],
        quizzes: [
          {
            id: uuid3,
            moduleId: uuid1,
            title: 'Quiz',
            description: 'Quiz desc',
            status: QuizStatus.DRAFT,
            scoreMinimum: 50,
            duree: null,
            nombreTentatives: 3,
            questions: null,
          },
        ],
      };

      mockPrisma.module!.findUnique.mockResolvedValue(row);

      const found = await repository.findById(uuid1);

      expect(found?.quizzes[0].questions).toEqual([]);
    });

    it('devrait lancer une erreur pour un TypeQuestion inconnu', async () => {
      const invalidQuestionDto = {
        type: 'INVALID_TYPE',
        question: 'Question?',
        points: 10,
        options: [],
        explication: 'Exp',
      };

      const row: PrismaModuleRow = {
        id: uuid1,
        title: 'Module',
        description: 'Description',
        imageMediaId: null,
        thematics: 'investment',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 60,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [],
        quizzes: [
          {
            id: uuid3,
            moduleId: uuid1,
            title: 'Quiz',
            description: 'Desc',
            status: QuizStatus.PUBLISHED,
            scoreMinimum: 80,
            duree: 40,
            nombreTentatives: 2,
            questions: [invalidQuestionDto],
          },
        ],
      };

      mockPrisma.module!.findUnique.mockResolvedValue(row);

      await expect(repository.findById(uuid1)).rejects.toThrow('TypeQuestion inconnu');
    });

    it('devrait mapper correctement les quizzes de leçon avec lessonId', async () => {
      const questionsDto: QuestionDTO[] = [
        {
          type: TypeQuestion.CHOIX_UNIQUE,
          question: 'Question leçon?',
          points: 10,
          options: [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: false },
          ],
          explication: 'Exp',
        },
      ];

      const row: PrismaModuleRow = {
        id: uuid1,
        title: 'Module',
        description: 'Description',
        imageMediaId: null,
        thematics: 'financial_education',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [
          {
            id: uuid2,
            moduleId: uuid1,
            title: 'Lesson',
            description: 'Desc',
            duration: 30,
            order: 1,
            status: LessonStatus.PUBLISHED,
            chapters: [],
            quizzes: [
              {
                id: uuid3,
                lessonId: uuid2,
                title: 'Quiz Leçon',
                description: 'Quiz desc',
                status: QuizStatus.PUBLISHED,
                scoreMinimum: 60,
                duree: 20,
                nombreTentatives: 2,
                questions: questionsDto,
              },
            ],
          },
        ],
        quizzes: [],
      };

      mockPrisma.module!.findUnique.mockResolvedValue(row);

      const found = await repository.findById(uuid1);

      expect(found?.lessons[0].quizzes).toHaveLength(1);
      // ✅ Vérifier que lessonId est correctement mappé
      expect(found?.lessons[0].quizzes[0].lessonId).toBe(uuid2);
      expect(found?.lessons[0].quizzes[0].moduleId).toBe(uuid1);
    });

    it('devrait mapper correctement les quizzes de chapitre avec chapterId', async () => {
      const quizId = randomUUID();
      const chapterId = randomUUID();

      const questionsDto: QuestionDTO[] = [
        {
          type: TypeQuestion.CHOIX_UNIQUE,
          question: 'Question chapitre?',
          points: 5,
          options: [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: false },
          ],
          explication: 'Exp',
        },
      ];

      const chaptersDto: ChapterDTO[] = [
        {
          id: chapterId,
          title: 'Chapitre 1',
          description: 'Desc',
          mediaId: 'media1',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          quizzes: [
            {
              id: quizId,
              chapterId,
              title: 'Quiz Chapitre',
              description: 'Quiz desc',
              status: QuizStatus.PUBLISHED,
              scoreMinimum: 50,
              duree: 15,
              nombreTentatives: 1,
              questions: questionsDto,
              totalPoints: 5, // ✅ Ajouté
              createdAt: new Date(), // ✅ Ajouté
              updatedAt: new Date(), // ✅ Ajouté
            },
          ],
        },
      ];

      const row: PrismaModuleRow = {
        id: uuid1,
        title: 'Module',
        description: 'Description',
        imageMediaId: null,
        thematics: 'financial_education',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 60,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [
          {
            id: uuid2,
            moduleId: uuid1,
            title: 'Lesson',
            description: 'Desc',
            duration: 30,
            order: 1,
            status: LessonStatus.PUBLISHED,
            chapters: chaptersDto,
            quizzes: [],
          },
        ],
        quizzes: [],
      };

      mockPrisma.module!.findUnique.mockResolvedValue(row);

      const found = await repository.findById(uuid1);

      expect(found?.lessons[0].chapters[0].quizzes).toHaveLength(1);
      // ✅ Vérifier que chapterId et lessonId sont correctement mappés
      expect(found?.lessons[0].chapters[0].quizzes[0].chapterId).toBe(chapterId);
      expect(found?.lessons[0].chapters[0].quizzes[0].lessonId).toBe(uuid2);
    });
  });

  // ---------------------------------------------------------------------------
  // findByThematic(thematic)
  // ---------------------------------------------------------------------------

  describe('findByThematic(thematic)', () => {
    it('devrait retourner Module quand trouvé par thématique (insensible à la casse)', async () => {
      const row: PrismaModuleRow = {
        id: uuid1,
        title: 'Module Finance',
        description: 'Description',
        imageMediaId: null,
        thematics: 'finance et comptabilité',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [],
        quizzes: [],
      };

      mockPrisma.module!.findFirst.mockResolvedValue(row);

      const found = await repository.findByThematic('Finance et Comptabilité');

      expect(mockPrisma.module!.findFirst).toHaveBeenCalledWith({
        where: {
          thematics: {
            equals: 'finance et comptabilité',
            mode: 'insensitive',
          },
        },
        include: {
          lessons: {
            include: {
              chapters: { include: { quizzes: true } },
              quizzes: true,
            },
          },
          quizzes: true,
        },
      });
      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(Module);
      expect(found?.thematics).toBe('finance et comptabilité');
    });

    it('devrait retourner null si thématique introuvable', async () => {
      mockPrisma.module!.findFirst.mockResolvedValue(null);

      const found = await repository.findByThematic('Thématique inexistante');
      expect(found).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // findAll(params)
  // ---------------------------------------------------------------------------

  describe('findAll(params)', () => {
    it('devrait utiliser skip/take et retourner pagination correcte', async () => {
      const rows: PrismaModuleRow[] = [
        {
          id: uuid1,
          title: 'M1',
          description: 'd1',
          imageMediaId: null,
          thematics: 'financial_education',
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 10,
          status: ModuleStatus.DRAFT,
          createdAt: new Date(),
          updatedAt: new Date(),
          lessons: [],
          quizzes: [],
        },
        {
          id: uuid2,
          title: 'M2',
          description: 'd2',
          imageMediaId: null,
          thematics: 'investment',
          difficultyLevel: DifficultyLevel.ADVANCED,
          estimatedDuration: 20,
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
      const result = await repository.findAll(params as any);

      expect(mockPrisma.module!.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          lessons: {
            include: {
              chapters: { include: { quizzes: true } },
              quizzes: true,
            },
          },
          quizzes: true,
        },
      });
      expect(mockPrisma.module!.count).toHaveBeenCalled();

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 12,
        totalPages: Math.ceil(12 / 5),
      });
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

  // ---------------------------------------------------------------------------
  // update(module)
  // ---------------------------------------------------------------------------

  describe('update(module)', () => {
    it('devrait mettre à jour un module sans ajouter de nouvelles lessons', async () => {
      const existingModule: PrismaModuleRow = {
        id: uuid1,
        title: 'Old Title',
        description: 'Old Desc',
        imageMediaId: 'http://example.com/old.jpg',
        thematics: 'financial_education',
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
        imageMediaId: 'http://example.com/new.jpg',
        thematics: 'saving',
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
        imageMediaId: 'http://example.com/new.jpg',
        thematics: 'saving',
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
          imageMedia: { connect: { id: 'http://example.com/new.jpg' } },
          thematics: 'saving',
          difficultyLevel: DifficultyLevel.INTERMEDIATE,
          estimatedDuration: 60,
          status: ModuleStatus.PUBLISHED,
        },
        include: {
          lessons: {
            include: {
              chapters: { include: { quizzes: true } },
              quizzes: true,
            },
          },
          quizzes: true,
        },
      });

      expect(result).toBeInstanceOf(Module);
      expect(result.title).toBe('New Title');
    });

    it('devrait ajouter de nouvelles lessons lors de la mise à jour', async () => {
      const existingLesson = {
        id: uuid2,
        moduleId: uuid1,
        title: 'Existing Lesson',
        description: 'Desc',
        duration: 20,
        order: 1,
        status: LessonStatus.PUBLISHED,
        chapters: [],
        quizzes: [],
      };

      const existingModule: PrismaModuleRow = {
        id: uuid1,
        title: 'Module',
        description: 'Desc',
        imageMediaId: null,
        thematics: 'financial_education',
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
        moduleId: uuid1,
        title: 'New Lesson',
        description: 'New Desc',
        duration: 25,
        order: 2,
        chapters: [],
        quizzes: [],
        status: LessonStatus.DRAFT,
      });

      const updatedModule = Module.create({
        id: EntityId.from(uuid1),
        title: 'Module',
        description: 'Desc',
        imageMediaId: null,
        thematics: 'financial_education',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 55,
        lessons: [
          new Lesson({
            id: EntityId.from(uuid2),
            moduleId: uuid1,
            title: 'Existing Lesson',
            description: 'Desc',
            duration: 20,
            order: 1,
            chapters: [],
            quizzes: [],
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
            moduleId: uuid1,
            title: 'New Lesson',
            description: 'New Desc',
            duration: 25,
            order: 2,
            status: LessonStatus.DRAFT,
            chapters: [],
            quizzes: [],
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
        include: {
          lessons: {
            include: {
              chapters: { include: { quizzes: true } },
              quizzes: true,
            },
          },
          quizzes: true,
        },
      });

      expect(result.lessons).toHaveLength(2);
    });

    it('devrait propager les erreurs de findMany', async () => {
      const error = new Error('Erreur findMany');
      mockPrisma.module!.findMany.mockRejectedValue(error);
      mockPrisma.module!.count.mockResolvedValue(0);

      await expect(repository.findAll({ page: 1, limit: 10 })).rejects.toThrow('Erreur findMany');
    });

    it('devrait ajouter de nouveaux quizzes lors de la mise à jour', async () => {
      const existingQuiz = {
        id: uuid2,
        moduleId: uuid1,
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
        imageMediaId: null,
        thematics: 'investment',
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
        nombreTentatives: 2,
        questions: [],
      });

      const row: PrismaModuleRow = {
        id: uuid1,
        title: 'Module',
        description: 'Desc',
        imageMediaId: null,
        thematics: 'saving',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
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
            moduleId: uuid1,
            title: 'New Quiz',
            description: 'New Quiz Desc',
            status: QuizStatus.DRAFT,
            scoreMinimum: 60,
            duree: 20,
            nombreTentatives: 2,
            questions: [],
          },
        ],
      };

      const newLesson = new Lesson({
        id: EntityId.from(uuid2),
        moduleId: uuid1,
        title: 'New Lesson',
        description: 'Lesson Desc',
        duration: 30,
        order: 1,
        chapters: [],
        quizzes: [],
        status: LessonStatus.DRAFT,
      });

      const module = await repository.findByTitle('Test Module');

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
        include: {
          lessons: {
            include: {
              chapters: { include: { quizzes: true } },
              quizzes: true,
            },
          },
          quizzes: true,
        },
      });

      expect(result.quizzes).toHaveLength(2);
    });

    it('devrait gérer le cas où le module existant est null', async () => {
      const updatedModule = Module.create({
        id: EntityId.from(uuid1),
        title: 'Module',
        description: 'Desc',
        imageMediaId: null,
        thematics: 'financial_education',
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
        imageMediaId: null,
        thematics: 'financial_education',
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

  // ---------------------------------------------------------------------------
  // findByTitleExceptId(title, excludeId)
  // ---------------------------------------------------------------------------

  describe('findByTitleExceptId(title, excludeId)', () => {
    it('devrait retourner null si aucun module avec ce titre (hors excludeId)', async () => {
      mockPrisma.module!.findFirst.mockResolvedValue(null);

      const result = await repository.findByTitleExceptId('Titre Unique', uuid1);

      expect(result).toBeNull();
      expect(mockPrisma.module!.findFirst).toHaveBeenCalledWith({
        where: { title: { equals: 'Titre Unique' }, NOT: { id: uuid1 } },
        include: {
          lessons: { include: { chapters: { include: { quizzes: true } }, quizzes: true } },
          quizzes: true,
        },
      });
    });

    it('devrait retourner un module si le titre existe pour un autre module', async () => {
      const prismaRow: PrismaModuleRow = {
        id: uuid2,
        title: 'Titre Dupliqué',
        description: 'Description',
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [],
        quizzes: [],
      };

      mockPrisma.module!.findFirst.mockResolvedValue(prismaRow);

      const result = await repository.findByTitleExceptId('Titre Dupliqué', uuid1);

      expect(result).toBeInstanceOf(Module);
      expect(result?.title).toBe('Titre Dupliqué');
      expect(result?.id.getValue()).toBe(uuid2);
    });

    it('devrait retourner null si le titre existe mais seulement pour le module exclu', async () => {
      mockPrisma.module!.findFirst.mockResolvedValue(null);

      const result = await repository.findByTitleExceptId('Mon Titre', uuid1);

      expect(result).toBeNull();
    });

    it('devrait gérer les modules avec lessons et quizzes', async () => {
      const lessonId = randomUUID();
      const quizId = randomUUID();

      const prismaRow: PrismaModuleRow = {
        id: uuid2,
        title: 'Module Complet',
        description: 'Description',
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 120,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [
          {
            id: lessonId,
            moduleId: uuid2,
            title: 'Leçon 1',
            description: 'Desc',
            duration: 30,
            order: 0,
            status: LessonStatus.PUBLISHED,
            chapters: [],
            quizzes: [],
          },
        ],
        quizzes: [
          {
            id: quizId,
            title: 'Quiz 1',
            description: 'Desc',
            status: QuizStatus.PUBLISHED,
            scoreMinimum: 70,
            duree: 15,
            nombreTentatives: 3,
            questions: [],
            moduleId: uuid2,
            lessonId: null,
            chapterId: null,
          },
        ],
      };

      mockPrisma.module!.findFirst.mockResolvedValue(prismaRow);

      const result = await repository.findByTitleExceptId('Module Complet', uuid1);

      expect(result).toBeInstanceOf(Module);
      expect(result?.lessons).toHaveLength(1);
      expect(result?.quizzes).toHaveLength(1);
    });
  });

  // ---------------------------------------------------------------------------
  // findByThematicExceptId(thematic, excludeId)
  // ---------------------------------------------------------------------------

  describe('findByThematicExceptId(thematic, excludeId)', () => {
    it('devrait retourner null si aucun module avec cette thématique (hors excludeId)', async () => {
      mockPrisma.module!.findFirst.mockResolvedValue(null);

      const result = await repository.findByThematicExceptId('comptabilité', uuid1);

      expect(result).toBeNull();
      expect(mockPrisma.module!.findFirst).toHaveBeenCalledWith({
        where: {
          thematics: { equals: 'comptabilité', mode: 'insensitive' },
          NOT: { id: uuid1 },
        },
        include: {
          lessons: { include: { chapters: { include: { quizzes: true } }, quizzes: true } },
          quizzes: true,
        },
      });
    });

    it('devrait retourner un module si la thématique existe pour un autre module', async () => {
      const prismaRow: PrismaModuleRow = {
        id: uuid2,
        title: 'Module Finance',
        description: 'Description',
        imageMediaId: null,
        thematics: 'finance avancée',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [],
        quizzes: [],
      };

      mockPrisma.module!.findFirst.mockResolvedValue(prismaRow);

      const result = await repository.findByThematicExceptId('Finance Avancée', uuid1);

      expect(result).toBeInstanceOf(Module);
      expect(result?.thematics).toBe('finance avancée');
      expect(result?.id.getValue()).toBe(uuid2);
    });

    it('devrait normaliser la thématique en minuscules avec trim', async () => {
      mockPrisma.module!.findFirst.mockResolvedValue(null);

      await repository.findByThematicExceptId('  GESTION DE PROJET  ', uuid1);

      expect(mockPrisma.module!.findFirst).toHaveBeenCalledWith({
        where: {
          thematics: { equals: 'gestion de projet', mode: 'insensitive' },
          NOT: { id: uuid1 },
        },
        include: {
          lessons: { include: { chapters: { include: { quizzes: true } }, quizzes: true } },
          quizzes: true,
        },
      });
    });

    it('devrait retourner null si la thématique existe mais seulement pour le module exclu', async () => {
      mockPrisma.module!.findFirst.mockResolvedValue(null);

      const result = await repository.findByThematicExceptId('finance', uuid1);

      expect(result).toBeNull();
    });

    it('devrait être insensible à la casse', async () => {
      const prismaRow: PrismaModuleRow = {
        id: uuid3,
        title: 'Module Test',
        description: 'Description',
        imageMediaId: null,
        thematics: 'comptabilité générale',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 45,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [],
        quizzes: [],
      };

      mockPrisma.module!.findFirst.mockResolvedValue(prismaRow);

      const result = await repository.findByThematicExceptId('COMPTABILITÉ GÉNÉRALE', uuid1);

      expect(result).toBeInstanceOf(Module);
      expect(result?.thematics).toBe('comptabilité générale');
    });

    it('devrait gérer les modules avec lessons et quizzes', async () => {
      const lessonId = randomUUID();
      const chapterId = randomUUID();
      const quizId = randomUUID();

      const prismaRow: PrismaModuleRow = {
        id: uuid2,
        title: 'Module Avancé',
        description: 'Description',
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.EXPERT,
        estimatedDuration: 180,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [
          {
            id: lessonId,
            moduleId: uuid2,
            title: 'Leçon Avancée',
            description: 'Desc',
            duration: 60,
            order: 0,
            status: LessonStatus.PUBLISHED,
            chapters: [
              {
                id: chapterId,
                lessonId,
                title: 'Chapitre 1',
                description: 'Desc',
                mediaId: null,
                order: 0,
                quizzes: [],
              },
            ],
            quizzes: [],
          },
        ],
        quizzes: [
          {
            id: quizId,
            title: 'Quiz Final',
            description: 'Desc',
            status: QuizStatus.PUBLISHED,
            scoreMinimum: 80,
            duree: 20,
            nombreTentatives: 2,
            questions: [],
            moduleId: uuid2,
            lessonId: null,
            chapterId: null,
          },
        ],
      };

      mockPrisma.module!.findFirst.mockResolvedValue(prismaRow);

      const result = await repository.findByThematicExceptId('finance', uuid1);

      expect(result).toBeInstanceOf(Module);
      expect(result?.lessons).toHaveLength(1);
      expect(result?.lessons[0].chapters).toHaveLength(1);
      expect(result?.quizzes).toHaveLength(1);
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
