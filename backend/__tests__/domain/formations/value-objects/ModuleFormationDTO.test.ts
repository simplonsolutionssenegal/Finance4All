// __tests__/domain/formations/value-objects/ModuleResponseDTO.test.ts

import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import { DifficultyLevel, ModuleStatus } from '@/domain/formations/entities/ModuleFormation';
import type { LessonDTO } from '@/domain/formations/value-objects/LessonDTO';
import type { QuizDTO } from '@/domain/formations/value-objects/QuizDTO';

describe('ModuleResponseDTO', () => {
  describe('Structure et propriétés', () => {
    it('devrait avoir toutes les propriétés requises', () => {
      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Introduction aux Finances',
        description: 'Module de base sur les finances personnelles',
        imageMediaId: 'image-123',
        thematics: 'finance et comptabilité',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.PUBLISHED,
        lessons: [],
        quizzes: [],
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      };

      expect(dto.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(dto.title).toBe('Introduction aux Finances');
      expect(dto.description).toBe('Module de base sur les finances personnelles');
      expect(dto.imageMediaId).toBe('image-123');
      expect(dto.thematics).toBe('finance et comptabilité');
      expect(dto.difficultyLevel).toBe(DifficultyLevel.BEGINNER);
      expect(dto.estimatedDuration).toBe(60);
      expect(dto.status).toBe(ModuleStatus.PUBLISHED);
      expect(dto.lessons).toEqual([]);
      expect(dto.quizzes).toEqual([]);
      expect(dto.createdAt).toBeInstanceOf(Date);
      expect(dto.updatedAt).toBeInstanceOf(Date);
    });

    it('devrait accepter imageMediaId null', () => {
      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Module sans image',
        description: 'Description',
        imageMediaId: null,
        thematics: 'épargne',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 90,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(dto.imageMediaId).toBeNull();
    });

    it('devrait accepter quizzesGlobal comme propriété optionnelle', () => {
      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Module avec quizzes globaux',
        description: 'Description',
        imageMediaId: 'image-456',
        thematics: 'investissement',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 120,
        status: ModuleStatus.PUBLISHED,
        lessons: [],
        quizzes: [],
        quizzesGlobal: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(dto.quizzesGlobal).toBeDefined();
      expect(dto.quizzesGlobal).toEqual([]);
    });

    it('devrait fonctionner sans quizzesGlobal (propriété optionnelle)', () => {
      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        title: 'Module sans quizzesGlobal',
        description: 'Description',
        imageMediaId: null,
        thematics: 'budget',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 45,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(dto.quizzesGlobal).toBeUndefined();
    });
  });

  describe('Niveaux de difficulté', () => {
    it('devrait accepter BEGINNER', () => {
      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440004',
        title: 'Module débutant',
        description: 'Pour débutants',
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(dto.difficultyLevel).toBe(DifficultyLevel.BEGINNER);
    });

    it('devrait accepter INTERMEDIATE', () => {
      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440005',
        title: 'Module intermédiaire',
        description: 'Pour intermédiaires',
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(dto.difficultyLevel).toBe(DifficultyLevel.INTERMEDIATE);
    });

    it('devrait accepter ADVANCED', () => {
      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440006',
        title: 'Module avancé',
        description: 'Pour avancés',
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 120,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(dto.difficultyLevel).toBe(DifficultyLevel.ADVANCED);
    });

    it('devrait accepter EXPERT', () => {
      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440007',
        title: 'Module expert',
        description: 'Pour experts',
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.EXPERT,
        estimatedDuration: 180,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(dto.difficultyLevel).toBe(DifficultyLevel.EXPERT);
    });
  });

  describe('Statuts du module', () => {
    it('devrait accepter DRAFT', () => {
      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440008',
        title: 'Module brouillon',
        description: 'En cours de création',
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(dto.status).toBe(ModuleStatus.DRAFT);
    });

    it('devrait accepter PUBLISHED', () => {
      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440009',
        title: 'Module publié',
        description: 'Disponible',
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.PUBLISHED,
        lessons: [],
        quizzes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(dto.status).toBe(ModuleStatus.PUBLISHED);
    });

    it('devrait accepter ARCHIVED', () => {
      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440010',
        title: 'Module archivé',
        description: 'Plus disponible',
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.ARCHIVED,
        lessons: [],
        quizzes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(dto.status).toBe(ModuleStatus.ARCHIVED);
    });
  });

  describe('Collections (lessons, quizzes, quizzesGlobal)', () => {
    it('devrait accepter un tableau de lessons', () => {
      const lessons: LessonDTO[] = [
        {
          id: 'lesson-1',
          moduleId: '550e8400-e29b-41d4-a716-446655440011',
          title: 'Leçon 1',
          description: 'Description leçon 1',
          duration: 30,
          order: 0,
          status: 'PUBLISHED' as any,
          chapters: [],
          quizzes: [],
          chaptersCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'lesson-2',
          moduleId: '550e8400-e29b-41d4-a716-446655440011',
          title: 'Leçon 2',
          description: 'Description leçon 2',
          duration: 45,
          order: 1,
          status: 'PUBLISHED' as any,
          chapters: [],
          quizzes: [],
          chaptersCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440011',
        title: 'Module avec leçons',
        description: 'Description',
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 75,
        status: ModuleStatus.PUBLISHED,
        lessons,
        quizzes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(dto.lessons).toHaveLength(2);
      expect(dto.lessons[0].title).toBe('Leçon 1');
      expect(dto.lessons[1].title).toBe('Leçon 2');
    });

    it('devrait accepter un tableau de quizzes', () => {
      const quizzes: QuizDTO[] = [
        {
          id: 'quiz-1',
          title: 'Quiz 1',
          description: 'Premier quiz',
          status: 'PUBLISHED' as any,
          scoreMinimum: 70,
          duree: 15,
          totalPoints: 100,
          nombreTentatives: 3,
          questions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440012',
        title: 'Module avec quiz',
        description: 'Description',
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.PUBLISHED,
        lessons: [],
        quizzes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(dto.quizzes).toHaveLength(1);
      expect(dto.quizzes[0].title).toBe('Quiz 1');
    });

    it('devrait accepter quizzesGlobal avec tous les quizzes agrégés', () => {
      const moduleQuiz: QuizDTO = {
        id: 'quiz-module',
        title: 'Quiz du module',
        description: 'Quiz principal',
        status: 'PUBLISHED' as any,
        scoreMinimum: 70,
        duree: 20,
        totalPoints: 100,
        nombreTentatives: 3,
        questions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const lessonQuiz: QuizDTO = {
        id: 'quiz-lesson',
        title: 'Quiz de la leçon',
        description: 'Quiz de leçon',
        status: 'PUBLISHED' as any,
        totalPoints: 50,
        scoreMinimum: 60,
        duree: 10,
        nombreTentatives: 2,
        questions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440013',
        title: 'Module complet',
        description: 'Description',
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 120,
        status: ModuleStatus.PUBLISHED,
        lessons: [],
        quizzes: [moduleQuiz],
        quizzesGlobal: [moduleQuiz, lessonQuiz],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(dto.quizzesGlobal).toHaveLength(2);
      expect(dto.quizzesGlobal![0].id).toBe('quiz-module');
      expect(dto.quizzesGlobal![1].id).toBe('quiz-lesson');
    });
  });

  describe('Cas limites', () => {
    it('devrait gérer un titre très long', () => {
      const longTitle = 'A'.repeat(200);

      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440014',
        title: longTitle,
        description: 'Description',
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(dto.title).toBe(longTitle);
      expect(dto.title.length).toBe(200);
    });

    it('devrait gérer une description très longue', () => {
      const longDescription = 'Lorem ipsum '.repeat(500);

      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440015',
        title: 'Module test',
        description: longDescription,
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(dto.description).toBe(longDescription);
    });

    it('devrait gérer différentes durées', () => {
      const durations = [15, 30, 60, 120, 240, 360, 720];

      durations.forEach((duration, index) => {
        const dto: ModuleResponseDTO = {
          id: `550e8400-e29b-41d4-a716-4466554400${String(16 + index).padStart(2, '0')}`,
          title: `Module ${duration}min`,
          description: 'Description',
          imageMediaId: null,
          thematics: 'finance',
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: duration,
          status: ModuleStatus.DRAFT,
          lessons: [],
          quizzes: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(dto.estimatedDuration).toBe(duration);
      });
    });

    it('devrait gérer différentes thématiques', () => {
      const thematics = [
        'finance et comptabilité',
        'investissement',
        'épargne',
        'gestion de budget',
        'entrepreneuriat',
        'assurance',
        'fiscalité',
      ];

      thematics.forEach((thematic, index) => {
        const dto: ModuleResponseDTO = {
          id: `550e8400-e29b-41d4-a716-4466554400${String(23 + index).padStart(2, '0')}`,
          title: `Module ${thematic}`,
          description: 'Description',
          imageMediaId: null,
          thematics: thematic,
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 60,
          status: ModuleStatus.DRAFT,
          lessons: [],
          quizzes: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(dto.thematics).toBe(thematic);
      });
    });
  });

  describe('Dates', () => {
    it('devrait conserver les dates exactes', () => {
      const createdDate = new Date('2024-01-01T10:00:00Z');
      const updatedDate = new Date('2024-01-15T14:30:00Z');

      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440030',
        title: 'Module avec dates',
        description: 'Description',
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
        createdAt: createdDate,
        updatedAt: updatedDate,
      };

      expect(dto.createdAt).toEqual(createdDate);
      expect(dto.updatedAt).toEqual(updatedDate);
      expect(dto.updatedAt.getTime()).toBeGreaterThan(dto.createdAt.getTime());
    });

    it('devrait accepter la même date pour createdAt et updatedAt', () => {
      const sameDate = new Date('2024-01-01T10:00:00Z');

      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440031',
        title: 'Module nouvellement créé',
        description: 'Description',
        imageMediaId: null,
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
        createdAt: sameDate,
        updatedAt: sameDate,
      };

      expect(dto.createdAt).toEqual(dto.updatedAt);
    });
  });

  describe('Sérialisation JSON', () => {
    it('devrait être sérialisable en JSON', () => {
      const dto: ModuleResponseDTO = {
        id: '550e8400-e29b-41d4-a716-446655440032',
        title: 'Module JSON',
        description: 'Test de sérialisation',
        imageMediaId: 'image-789',
        thematics: 'finance et comptabilité',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
        lessons: [],
        quizzes: [],
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      };

      const json = JSON.stringify(dto);
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe(dto.id);
      expect(parsed.title).toBe(dto.title);
      expect(parsed.thematics).toBe(dto.thematics);
    });
  });
});
