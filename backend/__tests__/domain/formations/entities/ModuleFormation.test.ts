// __tests__/domain/formations/entities/Module.test.ts

import {
  Module,
  ModuleStatus,
  DifficultyLevel,
} from '@/domain/formations/entities/ModuleFormation';
import { EntityId } from '@/domain/shared/EntityId';
import { Lesson, LessonStatus } from '@/domain/formations/entities/Lesson';
import { Quiz, QuizStatus } from '@/domain/formations/entities/Quiz';
import { Chapter } from '@/domain/formations/entities/Chapter';

describe('Module Entity', () => {
  const validModuleProps = {
    id: EntityId.from('550e8400-e29b-41d4-a716-446655440000'),
    title: 'Introduction aux Finances',
    description: 'Module de base sur les finances personnelles',
    imageMediaId: 'image-123',
    thematics: 'finance et comptabilité',
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: 60,
    status: ModuleStatus.DRAFT,
    lessons: [],
    quizzes: [],
  };

  describe('Constructor', () => {
    it('devrait créer un module avec toutes les propriétés', () => {
      const module = new Module(validModuleProps);

      expect(module.id.getValue()).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(module.title).toBe('Introduction aux Finances');
      expect(module.description).toBe('Module de base sur les finances personnelles');
      expect(module.imageMediaId).toBe('image-123');
      expect(module.thematics).toBe('finance et comptabilité');
      expect(module.difficultyLevel).toBe(DifficultyLevel.BEGINNER);
      expect(module.estimatedDuration).toBe(60);
      expect(module.status).toBe(ModuleStatus.DRAFT);
      expect(module.lessons).toEqual([]);
      expect(module.quizzes).toEqual([]);
    });

    it('devrait créer un module avec imageMediaId null', () => {
      const props = { ...validModuleProps, imageMediaId: null };
      const module = new Module(props);

      expect(module.imageMediaId).toBeNull();
    });

    it('devrait préserver les dates si fournies', () => {
      const createdAt = new Date('2024-01-01T10:00:00Z');
      const updatedAt = new Date('2024-01-15T14:30:00Z');

      const props = { ...validModuleProps, createdAt, updatedAt };
      const module = new Module(props);

      expect(module.createdAt).toEqual(createdAt);
      expect(module.updatedAt).toEqual(updatedAt);
    });

    it('devrait générer des dates par défaut si non fournies', () => {
      const module = new Module(validModuleProps);

      expect(module.createdAt).toBeInstanceOf(Date);
      expect(module.updatedAt).toBeInstanceOf(Date);
    });

    it('devrait convertir lessons array en Set', () => {
      const lesson = new Lesson({
        id: EntityId.from('550e8400-e29b-41d4-a716-446655440001'),
        moduleId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Leçon 1',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.PUBLISHED,
        chapters: [],
        quizzes: [],
      });

      const props = { ...validModuleProps, lessons: [lesson] };
      const module = new Module(props);

      expect(module.lessons).toHaveLength(1);
      expect(module.lessons[0]).toBe(lesson);
    });

    it('devrait convertir quizzes array en Set', () => {
      const quiz = new Quiz({
        id: EntityId.from('550e8400-e29b-41d4-a716-446655440002'),
        title: 'Quiz 1',
        description: 'Description',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 70,
        duree: 15,
        nombreTentatives: 3,
        questions: [],
      });

      const props = { ...validModuleProps, quizzes: [quiz] };
      const module = new Module(props);

      expect(module.quizzes).toHaveLength(1);
      expect(module.quizzes[0]).toBe(quiz);
    });
  });

  describe('create() - Factory Method', () => {
    it('devrait créer un module valide', () => {
      const module = Module.create(validModuleProps);

      expect(module).toBeInstanceOf(Module);
      expect(module.title).toBe('Introduction aux Finances');
    });

    it('devrait rejeter un titre vide', () => {
      const props = { ...validModuleProps, title: '' };

      expect(() => Module.create(props)).toThrow('Le titre du module est obligatoire');
    });

    it('devrait rejeter un titre avec seulement des espaces', () => {
      const props = { ...validModuleProps, title: '   ' };

      expect(() => Module.create(props)).toThrow('Le titre du module est obligatoire');
    });

    it('devrait rejeter un titre trop long (>200 caractères)', () => {
      const props = { ...validModuleProps, title: 'A'.repeat(201) };

      expect(() => Module.create(props)).toThrow('Le titre ne peut pas dépasser 200 caractères');
    });

    it('devrait accepter un titre de 200 caractères exactement', () => {
      const props = { ...validModuleProps, title: 'A'.repeat(200) };
      const module = Module.create(props);

      expect(module.title).toHaveLength(200);
    });

    it('devrait rejeter une description vide', () => {
      const props = { ...validModuleProps, description: '' };

      expect(() => Module.create(props)).toThrow('La description du module est obligatoire');
    });

    it('devrait rejeter une description avec seulement des espaces', () => {
      const props = { ...validModuleProps, description: '   ' };

      expect(() => Module.create(props)).toThrow('La description du module est obligatoire');
    });

    it('devrait rejeter une thématique vide', () => {
      const props = { ...validModuleProps, thematics: '' };

      expect(() => Module.create(props)).toThrow('Au moins une thématique est requise');
    });

    it('devrait rejeter une thématique avec seulement des espaces', () => {
      const props = { ...validModuleProps, thematics: '   ' };

      expect(() => Module.create(props)).toThrow('Au moins une thématique est requise');
    });

    it('devrait rejeter une durée <= 0', () => {
      const props = { ...validModuleProps, estimatedDuration: 0 };

      expect(() => Module.create(props)).toThrow('La durée estimée doit être supérieure à 0');
    });

    it('devrait rejeter une durée négative', () => {
      const props = { ...validModuleProps, estimatedDuration: -10 };

      expect(() => Module.create(props)).toThrow('La durée estimée doit être supérieure à 0');
    });

    it('devrait rejeter une durée > 10080 (7 jours)', () => {
      const props = { ...validModuleProps, estimatedDuration: 10081 };

      expect(() => Module.create(props)).toThrow('La durée maximale est de 7 jours');
    });

    it('devrait accepter une durée de 10080 exactement', () => {
      const props = { ...validModuleProps, estimatedDuration: 10080 };
      const module = Module.create(props);

      expect(module.estimatedDuration).toBe(10080);
    });

    it('devrait rejeter un niveau de difficulté invalide', () => {
      const props = { ...validModuleProps, difficultyLevel: 'INVALID' as any };

      expect(() => Module.create(props)).toThrow("Le niveau de difficulté n'est pas valide");
    });

    it('devrait rejeter un statut invalide', () => {
      const props = { ...validModuleProps, status: 'INVALID' as any };

      expect(() => Module.create(props)).toThrow("Le statut du module n'est pas valide");
    });

    it('devrait accepter tous les niveaux de difficulté valides', () => {
      const levels = [
        DifficultyLevel.BEGINNER,
        DifficultyLevel.INTERMEDIATE,
        DifficultyLevel.ADVANCED,
        DifficultyLevel.EXPERT,
      ];

      levels.forEach(level => {
        const props = { ...validModuleProps, difficultyLevel: level };
        const module = Module.create(props);
        expect(module.difficultyLevel).toBe(level);
      });
    });

    it('devrait accepter tous les statuts valides', () => {
      const statuses = [ModuleStatus.DRAFT, ModuleStatus.PUBLISHED, ModuleStatus.ARCHIVED];

      statuses.forEach(status => {
        const props = { ...validModuleProps, status };
        const module = Module.create(props);
        expect(module.status).toBe(status);
      });
    });
  });

  describe('Getters', () => {
    it('devrait retourner toutes les propriétés via getters', () => {
      const module = new Module(validModuleProps);

      expect(module.title).toBe(validModuleProps.title);
      expect(module.description).toBe(validModuleProps.description);
      expect(module.imageMediaId).toBe(validModuleProps.imageMediaId);
      expect(module.thematics).toBe(validModuleProps.thematics);
      expect(module.difficultyLevel).toBe(validModuleProps.difficultyLevel);
      expect(module.estimatedDuration).toBe(validModuleProps.estimatedDuration);
      expect(module.status).toBe(validModuleProps.status);
    });

    it('devrait retourner lessons comme array', () => {
      const module = new Module(validModuleProps);

      expect(Array.isArray(module.lessons)).toBe(true);
    });

    it('devrait retourner quizzes comme array', () => {
      const module = new Module(validModuleProps);

      expect(Array.isArray(module.quizzes)).toBe(true);
    });
  });

  describe('addLesson()', () => {
    it('devrait ajouter une leçon au module', () => {
      const module = new Module(validModuleProps);
      const lesson = new Lesson({
        id: EntityId.from('550e8400-e29b-41d4-a716-446655440003'),
        moduleId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Nouvelle leçon',
        description: 'Description',
        duration: 45,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [],
      });

      module.addLesson(lesson);

      expect(module.lessons).toHaveLength(1);
      expect(module.lessons[0]).toBe(lesson);
    });

    it("devrait mettre à jour updatedAt lors de l'ajout d'une leçon", () => {
      const module = new Module(validModuleProps);
      const initialUpdatedAt = module.updatedAt;

      // Attendre un peu pour s'assurer que la date change
      const lesson = new Lesson({
        id: EntityId.from('550e8400-e29b-41d4-a716-446655440004'),
        moduleId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Leçon test',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [],
      });

      setTimeout(() => {
        module.addLesson(lesson);
        expect(module.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime());
      }, 10);
    });

    it('ne devrait pas ajouter de doublons (Set)', () => {
      const module = new Module(validModuleProps);
      const lesson = new Lesson({
        id: EntityId.from('550e8400-e29b-41d4-a716-446655440005'),
        moduleId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Leçon unique',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
        quizzes: [],
      });

      module.addLesson(lesson);
      module.addLesson(lesson); // Ajouter la même leçon

      expect(module.lessons).toHaveLength(1);
    });
  });

  describe('addQuiz()', () => {
    it('devrait ajouter un quiz au module', () => {
      const module = new Module(validModuleProps);
      const quiz = new Quiz({
        id: EntityId.from('550e8400-e29b-41d4-a716-446655440006'),
        title: 'Nouveau quiz',
        description: 'Description',
        status: QuizStatus.DRAFT,
        scoreMinimum: 60,
        duree: 10,
        nombreTentatives: 2,
        questions: [],
      });

      module.addQuiz(quiz);

      expect(module.quizzes).toHaveLength(1);
      expect(module.quizzes[0]).toBe(quiz);
    });

    it("devrait mettre à jour updatedAt lors de l'ajout d'un quiz", () => {
      const module = new Module(validModuleProps);
      const quiz = new Quiz({
        id: EntityId.from('550e8400-e29b-41d4-a716-446655440007'),
        title: 'Quiz test',
        description: 'Description',
        status: QuizStatus.DRAFT,
        scoreMinimum: 70,
        duree: 15,
        nombreTentatives: 3,
        questions: [],
      });

      module.addQuiz(quiz);

      expect(module.updatedAt).toBeInstanceOf(Date);
    });

    it('ne devrait pas ajouter de doublons (Set)', () => {
      const module = new Module(validModuleProps);
      const quiz = new Quiz({
        id: EntityId.from('550e8400-e29b-41d4-a716-446655440008'),
        title: 'Quiz unique',
        description: 'Description',
        status: QuizStatus.DRAFT,
        scoreMinimum: 70,
        duree: 15,
        nombreTentatives: 3,
        questions: [],
      });

      module.addQuiz(quiz);
      module.addQuiz(quiz);

      expect(module.quizzes).toHaveLength(1);
    });
  });

  describe('getAllQuizzes()', () => {
    it('devrait retourner tous les quizzes du module uniquement', () => {
      const quiz1 = new Quiz({
        id: EntityId.from('550e8400-e29b-41d4-a716-446655440009'),
        title: 'Quiz module',
        description: 'Description',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 70,
        duree: 15,
        nombreTentatives: 3,
        questions: [],
      });

      const props = { ...validModuleProps, quizzes: [quiz1] };
      const module = new Module(props);

      const allQuizzes = module.getAllQuizzes();

      expect(allQuizzes).toHaveLength(1);
      expect(allQuizzes[0]).toBe(quiz1);
    });

    it('devrait retourner les quizzes du module + des leçons', () => {
      const moduleQuiz = new Quiz({
        id: EntityId.from('550e8400-e29b-41d4-a716-446655440010'),
        title: 'Quiz module',
        description: 'Description',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 70,
        duree: 15,
        nombreTentatives: 3,
        questions: [],
      });

      const lessonQuiz = new Quiz({
        id: EntityId.from('550e8400-e29b-41d4-a716-446655440011'),
        title: 'Quiz leçon',
        description: 'Description',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 60,
        duree: 10,
        nombreTentatives: 2,
        questions: [],
      });

      const lesson = new Lesson({
        id: EntityId.from('550e8400-e29b-41d4-a716-446655440012'),
        moduleId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Leçon avec quiz',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.PUBLISHED,
        chapters: [],
        quizzes: [lessonQuiz],
      });

      const props = { ...validModuleProps, lessons: [lesson], quizzes: [moduleQuiz] };
      const module = new Module(props);

      const allQuizzes = module.getAllQuizzes();

      expect(allQuizzes).toHaveLength(2);
      expect(allQuizzes).toContain(moduleQuiz);
      expect(allQuizzes).toContain(lessonQuiz);
    });

    it('devrait retourner les quizzes du module + leçons + chapitres', () => {
      const moduleQuiz = new Quiz({
        id: EntityId.from('550e8400-e29b-41d4-a716-446655440013'),
        title: 'Quiz module',
        description: 'Description',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 70,
        duree: 15,
        nombreTentatives: 3,
        questions: [],
      });

      const lessonQuiz = new Quiz({
        id: EntityId.from('550e8400-e29b-41d4-a716-446655440014'),
        title: 'Quiz leçon',
        description: 'Description',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 60,
        duree: 10,
        nombreTentatives: 2,
        questions: [],
      });

      const chapterQuiz = new Quiz({
        id: EntityId.from('550e8400-e29b-41d4-a716-446655440015'),
        title: 'Quiz chapitre',
        description: 'Description',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 50,
        duree: 5,
        nombreTentatives: 1,
        questions: [],
      });

      const chapter = new Chapter(
        EntityId.from('550e8400-e29b-41d4-a716-446655440016'),
        'Chapitre 1',
        'Description',
        undefined,
        0,
        undefined,
        [chapterQuiz]
      );

      const lesson = new Lesson({
        id: EntityId.from('550e8400-e29b-41d4-a716-446655440017'),
        moduleId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Leçon complète',
        description: 'Description',
        duration: 60,
        order: 0,
        status: LessonStatus.PUBLISHED,
        chapters: [chapter],
        quizzes: [lessonQuiz],
      });

      const props = { ...validModuleProps, lessons: [lesson], quizzes: [moduleQuiz] };
      const module = new Module(props);

      const allQuizzes = module.getAllQuizzes();

      expect(allQuizzes).toHaveLength(3);
      expect(allQuizzes).toContain(moduleQuiz);
      expect(allQuizzes).toContain(lessonQuiz);
      expect(allQuizzes).toContain(chapterQuiz);
    });

    it('devrait retourner un tableau vide si aucun quiz', () => {
      const module = new Module(validModuleProps);

      const allQuizzes = module.getAllQuizzes();

      expect(allQuizzes).toEqual([]);
    });
  });

  describe('publish()', () => {
    it('devrait publier un module en brouillon', () => {
      const module = new Module(validModuleProps);

      module.publish();

      expect(module.status).toBe(ModuleStatus.PUBLISHED);
    });

    it('devrait mettre à jour updatedAt lors de la publication', () => {
      const module = new Module(validModuleProps);

      module.publish();

      expect(module.updatedAt).toBeInstanceOf(Date);
    });

    it("devrait rejeter la publication d'un module déjà publié", () => {
      const props = { ...validModuleProps, status: ModuleStatus.PUBLISHED };
      const module = new Module(props);

      expect(() => module.publish()).toThrow('Le module est déjà publié');
    });

    it('devrait pouvoir publier un module archivé', () => {
      const props = { ...validModuleProps, status: ModuleStatus.ARCHIVED };
      const module = new Module(props);

      module.publish();

      expect(module.status).toBe(ModuleStatus.PUBLISHED);
    });
  });

  describe('updateTitle()', () => {
    it('devrait mettre à jour le titre', () => {
      const module = new Module(validModuleProps);

      module.updateTitle('Nouveau titre');

      expect(module.title).toBe('Nouveau titre');
    });

    it('devrait mettre à jour updatedAt', () => {
      const module = new Module(validModuleProps);

      module.updateTitle('Nouveau titre');

      expect(module.updatedAt).toBeInstanceOf(Date);
    });

    it('devrait rejeter un titre vide', () => {
      const module = new Module(validModuleProps);

      expect(() => module.updateTitle('')).toThrow('Le titre du module est obligatoire');
    });

    it('devrait rejeter un titre avec seulement des espaces', () => {
      const module = new Module(validModuleProps);

      expect(() => module.updateTitle('   ')).toThrow('Le titre du module est obligatoire');
    });
  });

  describe('updateDescription()', () => {
    it('devrait mettre à jour la description', () => {
      const module = new Module(validModuleProps);

      module.updateDescription('Nouvelle description');

      expect(module.description).toBe('Nouvelle description');
    });

    it('devrait mettre à jour updatedAt', () => {
      const module = new Module(validModuleProps);

      module.updateDescription('Nouvelle description');

      expect(module.updatedAt).toBeInstanceOf(Date);
    });

    it('devrait rejeter une description vide', () => {
      const module = new Module(validModuleProps);

      expect(() => module.updateDescription('')).toThrow(
        'La description du module est obligatoire'
      );
    });

    it('devrait rejeter une description avec seulement des espaces', () => {
      const module = new Module(validModuleProps);

      expect(() => module.updateDescription('   ')).toThrow(
        'La description du module est obligatoire'
      );
    });
  });

  describe('Status checks', () => {
    it('isPublished() devrait retourner true pour un module publié', () => {
      const props = { ...validModuleProps, status: ModuleStatus.PUBLISHED };
      const module = new Module(props);

      expect(module.isPublished()).toBe(true);
      expect(module.isDraft()).toBe(false);
      expect(module.isArchived()).toBe(false);
    });

    it('isDraft() devrait retourner true pour un module en brouillon', () => {
      const module = new Module(validModuleProps);

      expect(module.isDraft()).toBe(true);
      expect(module.isPublished()).toBe(false);
      expect(module.isArchived()).toBe(false);
    });

    it('isArchived() devrait retourner true pour un module archivé', () => {
      const props = { ...validModuleProps, status: ModuleStatus.ARCHIVED };
      const module = new Module(props);

      expect(module.isArchived()).toBe(true);
      expect(module.isDraft()).toBe(false);
      expect(module.isPublished()).toBe(false);
    });
  });

  describe('toDTO()', () => {
    it('devrait convertir le module en DTO', () => {
      const module = new Module(validModuleProps);

      const dto = module.toDTO();

      expect(dto.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(dto.title).toBe('Introduction aux Finances');
      expect(dto.description).toBe('Module de base sur les finances personnelles');
      expect(dto.imageMediaId).toBe('image-123');
      expect(dto.thematics).toBe('finance et comptabilité');
      expect(dto.difficultyLevel).toBe(DifficultyLevel.BEGINNER);
      expect(dto.estimatedDuration).toBe(60);
      expect(dto.status).toBe(ModuleStatus.DRAFT);
      expect(dto.lessons).toEqual([]);
      expect(dto.quizzes).toEqual([]);
      expect(dto.quizzesGlobal).toEqual([]);
      expect(dto.createdAt).toBeInstanceOf(Date);
      expect(dto.updatedAt).toBeInstanceOf(Date);
    });

    it('devrait inclure les lessons dans le DTO', () => {
      const lesson = new Lesson({
        id: EntityId.from('550e8400-e29b-41d4-a716-446655440018'),
        moduleId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Leçon 1',
        description: 'Description',
        duration: 30,
        order: 0,
        status: LessonStatus.PUBLISHED,
        chapters: [],
        quizzes: [],
      });

      const props = { ...validModuleProps, lessons: [lesson] };
      const module = new Module(props);

      const dto = module.toDTO();

      expect(dto.lessons).toHaveLength(1);
      expect(dto.lessons[0].id).toBe('550e8400-e29b-41d4-a716-446655440018');
    });

    it('devrait inclure les quizzes dans le DTO', () => {
      const quiz = new Quiz({
        id: EntityId.from('550e8400-e29b-41d4-a716-446655440019'),
        title: 'Quiz 1',
        description: 'Description',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 70,
        duree: 15,
        nombreTentatives: 3,
        questions: [],
      });

      const props = { ...validModuleProps, quizzes: [quiz] };
      const module = new Module(props);

      const dto = module.toDTO();

      expect(dto.quizzes).toHaveLength(1);
      expect(dto.quizzesGlobal).toHaveLength(1);
    });
  });
});
