/**
 * @jest-environment node
 */

import {
  Module,
  ModuleStatus,
  DifficultyLevel,
  type ModuleProps,
} from '@/domain/formations/entities/ModuleFormation';
import { EntityId } from '@/domain/shared/EntityId';
import { Thematic } from '@/domain/formations/value-objects/Thematic';

// -------------------------
// Mocks minimaux Lesson / Chapter / Quiz
// -------------------------
const makeQuiz = (id: string) =>
  ({
    id: EntityId.from(id),
    toDTO: jest.fn(() => ({ id, title: `Quiz-${id}` })),
  }) as any;

const makeChapter = (quizIds: string[] = []) =>
  ({
    quizzes: quizIds.map(makeQuiz),
  }) as any;

const makeLesson = (lessonQuizIds: string[] = [], chapterQuizIds: string[] = []) =>
  ({
    quizzes: lessonQuizIds.map(makeQuiz),
    chapters: [makeChapter(chapterQuizIds)],
    toDTO: jest.fn(() => ({ id: 'lesson-dto' })),
  }) as any;

// UUIDs valides (EntityId.from() les valide)
const IDS = {
  module: '9c201c45-895c-49cc-9929-6bbc6e779ac1',
  qModule: 'b4affe45-7885-4c13-b17e-e2c7e316accb',
  qLesson: '03e3f7dc-c00f-43af-ae8b-a2ead6fa15f9',
  qChapter: '33333333-3333-4333-8333-333333333333',
};

const baseProps: ModuleProps = {
  id: EntityId.from(IDS.module),
  title: 'Introduction à la finance',
  description: 'Un module pour comprendre les bases de la finance',
  imageMediaId: 'image-123',
  thematics: 'finance et comptabilité',
  difficultyLevel: DifficultyLevel.BEGINNER,
  estimatedDuration: 60,
  lessons: [],
  quizzes: [],
  status: ModuleStatus.DRAFT,
};

describe('Module', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-02T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // -------------------------
  // create
  // -------------------------
  describe('create', () => {
    it('crée un module valide', () => {
      const module = Module.create(baseProps);
      expect(module).toBeDefined();
      expect(module.title).toBe(baseProps.title);
      expect(module.description).toBe(baseProps.description);
      expect(module.imageMediaId).toBe(baseProps.imageMediaId);
      expect(module.thematics).toEqual(baseProps.thematics);
      expect(module.difficultyLevel).toBe(baseProps.difficultyLevel);
      expect(module.estimatedDuration).toBe(baseProps.estimatedDuration);
      expect(module.status).toBe(baseProps.status);
    });

    it('throw si titre vide', () => {
      expect(() => Module.create({ ...baseProps, title: '' })).toThrow(
        'Le titre du module est obligatoire'
      );
    });

    it('devrait lever une erreur si le titre contient uniquement des espaces', () => {
      expect(() => Module.create({ ...baseProps, title: '   ' })).toThrow(
        'Le titre du module est obligatoire'
      );
    });

    it('throw si titre > 200', () => {
      expect(() => Module.create({ ...baseProps, title: 'a'.repeat(201) })).toThrow(
        'Le titre ne peut pas dépasser 200 caractères'
      );
    });

    it('devrait accepter un titre de 200 caractères exactement', () => {
      const module = Module.create({ ...baseProps, title: 'a'.repeat(200) });
      expect(module.title).toHaveLength(200);
    });

    it('throw si imageUrl est une chaîne vide', () => {
      expect(() => Module.create({ ...baseProps, imageUrl: '' })).toThrow(
        "L'URL de l'image ne peut pas être une chaîne vide"
      );
    });

    it('throw si description vide', () => {
      expect(() => Module.create({ ...baseProps, description: '' })).toThrow(
        'La description du module est obligatoire'
      );
    });

    it('throw si pas de thématique', () => {
      expect(() => Module.create({ ...baseProps, thematics: [] })).toThrow(
        'Au moins une thématique est requise'
      );
    });

    it('throw si estimatedDuration <= 0', () => {
      expect(() => Module.create({ ...baseProps, estimatedDuration: 0 })).toThrow(
        'La durée estimée doit être supérieure à 0'
      );
    });
  });

  // -------------------------
  // états
  // -------------------------
  describe("méthodes d'état", () => {
    it('draft/published/archived', () => {
      const module = Module.create(baseProps);
      expect(module.isDraft()).toBe(true);
      expect(module.isPublished()).toBe(false);
      expect(module.isArchived()).toBe(false);
    });

    it('devrait publier un module en brouillon', () => {
      module.publish();

      expect(module.isPublished()).toBe(true);
      expect(module.isDraft()).toBe(false);
    });

    it('publish throw si déjà publié', () => {
      const module = Module.create(baseProps);
      module.publish();
      expect(() => module.publish()).toThrow('Le module est déjà publié');
    });

    it('devrait vérifier correctement un module publié', () => {
      const publishedModule = Module.create({ ...baseProps, status: ModuleStatus.PUBLISHED });
      expect(publishedModule.isPublished()).toBe(true);
      expect(publishedModule.isDraft()).toBe(false);
      expect(publishedModule.isArchived()).toBe(false);
    });

    it('devrait vérifier correctement un module archivé', () => {
      const archivedModule = Module.create({ ...baseProps, status: ModuleStatus.ARCHIVED });
      expect(archivedModule.isArchived()).toBe(true);
      expect(archivedModule.isDraft()).toBe(false);
      expect(archivedModule.isPublished()).toBe(false);
    });
  });

  // -------------------------
  // updates
  // -------------------------
  describe('méthodes de mise à jour', () => {
    let module: Module;

    beforeEach(() => {
      module = Module.create(baseProps);
    });

    it('devrait mettre à jour le titre', () => {
      const newTitle = 'Nouveau titre';
      module.updateTitle(newTitle);
      expect(module.title).toBe(newTitle);
    });

    it('updateTitle throw si vide', () => {
      const module = Module.create(baseProps);
      expect(() => module.updateTitle('')).toThrow('Le titre du module est obligatoire');
    });

    it("devrait mettre à jour l'URL de l'image", () => {
      const newImageUrl = 'https://example.com/new-image.jpg';
      module.updateImageUrl(newImageUrl);
      expect(module.imageUrl).toBe(newImageUrl);
    });

    it("devrait lever une erreur lors de la mise à jour avec une URL d'image vide", () => {
      expect(() => module.updateImageUrl('')).toThrow("L'URL de l'image est obligatoire");
    });

    it('devrait mettre à jour la description', () => {
      const newDescription = 'Nouvelle description';
      module.updateDescription(newDescription);
      expect(module.description).toBe(newDescription);
    });

    it('devrait lever une erreur lors de la mise à jour avec une description vide', () => {
      expect(() => module.updateDescription('')).toThrow(
        'La description du module est obligatoire'
      );
    });

    it('devrait lever une erreur lors de la mise à jour avec une description contenant uniquement des espaces', () => {
      expect(() => module.updateDescription('   ')).toThrow(
        'La description du module est obligatoire'
      );
    });
  });

  // Tests de gestion des thématiques
  describe('gestion des thématiques', () => {
    let module: Module;

    beforeEach(() => {
      module = Module.create(baseProps);
    });

    it('devrait ajouter une nouvelle thématique', () => {
      const newThematic = Thematic.INVESTMENT;
      module.addThematic(newThematic);
      expect(module.hasThematic(newThematic)).toBe(true);
      expect(module.thematics).toContain(newThematic);
    });

    it('devrait supprimer une thématique existante', () => {
      const newThematic = Thematic.INVESTMENT;
      module.addThematic(newThematic);
      module.removeThematic(newThematic);
      expect(module.hasThematic(newThematic)).toBe(false);
    });

    it('devrait lever une erreur lors de la suppression de la dernière thématique', () => {
      expect(() => module.removeThematic(baseProps.thematics[0])).toThrow(
        'Le module doit avoir au moins une thématique'
      );
    });
  });

  // -------------------------
  // lessons/quizzes + getAllQuizzes
  // -------------------------
  describe('lessons/quizzes', () => {
    it('addLesson/addQuiz ajoutent et updatedAt change', () => {
      const module = Module.create(baseProps);

      const before = module.updatedAt;
      jest.setSystemTime(new Date('2026-02-02T00:00:01.000Z'));
      module.addLesson(makeLesson());

      expect(module.lessons).toHaveLength(1);
      expect(module.updatedAt.getTime()).toBeGreaterThan(before.getTime());

      const before2 = module.updatedAt;
      jest.setSystemTime(new Date('2026-02-02T00:00:02.000Z'));
      module.addQuiz(makeQuiz(IDS.qModule));

      expect(module.quizzes).toHaveLength(1);
      expect(module.updatedAt.getTime()).toBeGreaterThan(before2.getTime());
    });

    it('getAllQuizzes retourne module + lesson + chapter', () => {
      const module = Module.create({
        ...baseProps,
        quizzes: [makeQuiz(IDS.qModule)],
        lessons: [makeLesson([IDS.qLesson], [IDS.qChapter])],
      });

      const all = module.getAllQuizzes();
      expect(all).toHaveLength(3);
      expect(all.map((q: any) => q.id.getValue())).toEqual(
        expect.arrayContaining([IDS.qModule, IDS.qLesson, IDS.qChapter])
      );
    });
  });

  // -------------------------
  // toDTO
  // -------------------------
  describe('toDTO', () => {
    it('convertit en DTO avec quizzes, lessons, quizzesGlobal', () => {
      const qModule = makeQuiz(IDS.qModule);
      const lesson = makeLesson([IDS.qLesson], [IDS.qChapter]);

      const module = Module.create({
        ...baseProps,
        quizzes: [qModule],
        lessons: [lesson],
      });

      const dto: any = module.toDTO();

      expect(dto).toMatchObject({
        title: module.title,
        description: module.description,
        imageMediaId: module.imageMediaId,
        thematics: module.thematics,
        difficultyLevel: module.difficultyLevel,
        estimatedDuration: module.estimatedDuration,
        status: module.status,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
      });
    });
  });
});
