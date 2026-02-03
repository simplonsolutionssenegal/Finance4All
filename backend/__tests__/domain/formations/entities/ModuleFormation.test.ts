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

    it('devrait lever une erreur si la durée estimée est négative', () => {
      expect(() => Module.create({ ...baseProps, estimatedDuration: -10 })).toThrow(
        'La durée estimée doit être supérieure à 0'
      );
    });

    it('devrait lever une erreur si la durée estimée dépasse 7 jours (10080 minutes)', () => {
      expect(() => Module.create({ ...baseProps, estimatedDuration: 10081 })).toThrow(
        'La durée maximale est de 7 jours'
      );
    });

    it('devrait accepter une durée estimée de 7 jours exactement (10080 minutes)', () => {
      const module = Module.create({ ...baseProps, estimatedDuration: 10080 });
      expect(module.estimatedDuration).toBe(10080);
    });

    it('devrait créer un module avec imageMediaId null', () => {
      const module = Module.create({ ...baseProps, imageMediaId: null });
      expect(module.imageMediaId).toBeNull();
    });

    it('devrait lever une erreur avec un niveau de difficulté invalide', () => {
      expect(() =>
        Module.create({ ...baseProps, difficultyLevel: 'INVALID' as DifficultyLevel })
      ).toThrow("Le niveau de difficulté n'est pas valide");
    });

    it('devrait lever une erreur avec un statut invalide', () => {
      expect(() => Module.create({ ...baseProps, status: 'INVALID' as ModuleStatus })).toThrow(
        "Le statut du module n'est pas valide"
      );
    });

    it('devrait créer un module avec tous les niveaux de difficulté valides', () => {
      Object.values(DifficultyLevel).forEach(level => {
        const module = Module.create({ ...baseProps, difficultyLevel: level });
        expect(module.difficultyLevel).toBe(level);
      });
    });

    it('devrait créer un module avec tous les statuts valides', () => {
      Object.values(ModuleStatus).forEach(status => {
        const module = Module.create({ ...baseProps, status });
        expect(module.status).toBe(status);
      });
    });
  });

  // Tests du constructeur direct
  describe('constructor', () => {
    it('devrait créer un module via le constructeur', () => {
      const module = new Module(baseProps);
      expect(module).toBeDefined();
      expect(module.title).toBe(baseProps.title);
      expect(module.description).toBe(baseProps.description);
    });

    it('devrait initialiser les dates createdAt et updatedAt', () => {
      const module = new Module(baseProps);
      expect(module.createdAt).toBeInstanceOf(Date);
      expect(module.updatedAt).toBeInstanceOf(Date);
    });
  });

  // Tests des méthodes de gestion d'état
  describe("méthodes d'état", () => {
    let module: Module;

    beforeEach(() => {
      module = Module.create(baseProps);
    });

    it('devrait correctement vérifier si le module est en brouillon', () => {
      expect(module.isDraft()).toBe(true);
      expect(module.isPublished()).toBe(false);
      expect(module.isArchived()).toBe(false);
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

  describe('updateThematics()', () => {
    it('devrait mettre à jour la thématique', () => {
      const module = new Module(validModuleProps);

      module.updateThematics('Gestion de Projet');

      expect(module.thematics).toBe('gestion de projet');
    });

    it('devrait normaliser en minuscules et trim', () => {
      const module = new Module(validModuleProps);

      module.updateThematics('  COMPTABILITÉ AVANCÉE  ');

      expect(module.thematics).toBe('comptabilité avancée');
    });

    it('devrait mettre à jour updatedAt', () => {
      const module = new Module(validModuleProps);
      const before = module.updatedAt;

      module.updateThematics('nouvelle thématique');

      expect(module.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it('devrait rejeter une thématique vide', () => {
      const module = new Module(validModuleProps);

      expect(() => module.updateThematics('')).toThrow('Au moins une thématique est requise');
    });

    it('devrait rejeter une thématique null', () => {
      const module = new Module(validModuleProps);

      expect(() => module.updateThematics(null as any)).toThrow(
        'Au moins une thématique est requise'
      );
    });

    it('devrait rejeter une thématique undefined', () => {
      const module = new Module(validModuleProps);

      expect(() => module.updateThematics(undefined as any)).toThrow(
        'Au moins une thématique est requise'
      );
    });

    it('devrait rejeter une thématique avec seulement des espaces', () => {
      const module = new Module(validModuleProps);

      expect(() => module.updateThematics('   ')).toThrow('Au moins une thématique est requise');
    });
  });

  describe('updateDifficultyLevel()', () => {
    it('devrait mettre à jour le niveau de difficulté', () => {
      const module = new Module(validModuleProps);

      module.updateDifficultyLevel(DifficultyLevel.EXPERT);

      expect(module.difficultyLevel).toBe(DifficultyLevel.EXPERT);
    });

    it('devrait mettre à jour updatedAt', () => {
      const module = new Module(validModuleProps);

      module.updateDifficultyLevel(DifficultyLevel.INTERMEDIATE);

      expect(module.updatedAt).toBeInstanceOf(Date);
    });

    it('devrait accepter tous les niveaux valides', () => {
      const module = new Module(validModuleProps);

      const levels = [
        DifficultyLevel.BEGINNER,
        DifficultyLevel.INTERMEDIATE,
        DifficultyLevel.ADVANCED,
        DifficultyLevel.EXPERT,
      ];

      levels.forEach(level => {
        module.updateDifficultyLevel(level);
        expect(module.difficultyLevel).toBe(level);
      });
    });

    it('devrait rejeter un niveau invalide', () => {
      const module = new Module(validModuleProps);

      expect(() => module.updateDifficultyLevel('INVALID' as any)).toThrow(
        "Le niveau de difficulté n'est pas valide"
      );
    });
  });

  describe('updateEstimatedDuration()', () => {
    it('devrait mettre à jour la durée estimée', () => {
      const module = new Module(validModuleProps);

      module.updateEstimatedDuration(120);

      expect(module.estimatedDuration).toBe(120);
    });

    it('devrait mettre à jour updatedAt', () => {
      const module = new Module(validModuleProps);

      module.updateEstimatedDuration(90);

      expect(module.updatedAt).toBeInstanceOf(Date);
    });

    it('devrait rejeter une durée <= 0', () => {
      const module = new Module(validModuleProps);

      expect(() => module.updateEstimatedDuration(0)).toThrow(
        'La durée estimée doit être supérieure à 0'
      );
    });

    it('devrait rejeter une durée négative', () => {
      const module = new Module(validModuleProps);

      expect(() => module.updateEstimatedDuration(-10)).toThrow(
        'La durée estimée doit être supérieure à 0'
      );
    });

    it('devrait rejeter une durée > 10080', () => {
      const module = new Module(validModuleProps);

      expect(() => module.updateEstimatedDuration(10081)).toThrow(
        'La durée maximale est de 7 jours'
      );
    });

    it('devrait accepter une durée de 10080 exactement', () => {
      const module = new Module(validModuleProps);

      module.updateEstimatedDuration(10080);

      expect(module.estimatedDuration).toBe(10080);
    });

    it('devrait rejeter une durée non finie (Infinity)', () => {
      const module = new Module(validModuleProps);

      expect(() => module.updateEstimatedDuration(Infinity)).toThrow(
        'La durée estimée doit être supérieure à 0'
      );
    });

    it('devrait rejeter une durée non finie (NaN)', () => {
      const module = new Module(validModuleProps);

      expect(() => module.updateEstimatedDuration(NaN)).toThrow(
        'La durée estimée doit être supérieure à 0'
      );
    });
  });

  describe('updateImageMediaId()', () => {
    it("devrait mettre à jour l'imageMediaId", () => {
      const module = new Module(validModuleProps);

      module.updateImageMediaId('new-image-456');

      expect(module.imageMediaId).toBe('new-image-456');
    });

    it("devrait accepter null pour supprimer l'image", () => {
      const module = new Module(validModuleProps);

      module.updateImageMediaId(null);

      expect(module.imageMediaId).toBeNull();
    });

    it('devrait mettre à jour updatedAt', () => {
      const module = new Module(validModuleProps);

      module.updateImageMediaId('new-image-789');

      expect(module.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('updateStatus()', () => {
    it('devrait mettre à jour le statut', () => {
      const module = new Module(validModuleProps);

      module.updateStatus(ModuleStatus.PUBLISHED);

      expect(module.status).toBe(ModuleStatus.PUBLISHED);
    });

    it('devrait mettre à jour updatedAt', () => {
      const module = new Module(validModuleProps);

      module.updateStatus(ModuleStatus.ARCHIVED);

      expect(module.updatedAt).toBeInstanceOf(Date);
    });

    it('devrait accepter tous les statuts valides', () => {
      const module = new Module(validModuleProps);

      const statuses = [ModuleStatus.DRAFT, ModuleStatus.PUBLISHED, ModuleStatus.ARCHIVED];

      statuses.forEach(status => {
        module.updateStatus(status);
        expect(module.status).toBe(status);
      });
    });

    it('devrait rejeter un statut invalide', () => {
      const module = new Module(validModuleProps);

      expect(() => module.updateStatus('INVALID' as any)).toThrow(
        "Le statut du module n'est pas valide"
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
