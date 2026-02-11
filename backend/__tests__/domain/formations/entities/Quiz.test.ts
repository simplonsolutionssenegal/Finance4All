/**
 * @jest-environment node
 */

import { Quiz, QuizStatus } from '@/domain/formations/entities/Quiz';
import { EntityId } from '@/domain/shared/EntityId';

// -------------------------
// Helpers / Mocks
// -------------------------
const UUID = {
  quiz: 'b4affe45-7885-4c13-b17e-e2c7e316accb',
  q1: '11111111-1111-4111-8111-111111111111',
  q2: '22222222-2222-4222-8222-222222222222',
};

function makeQuestion(overrides: Partial<any> = {}) {
  return {
    question: overrides.question ?? 'Question ?',
    points: overrides.points ?? 2,
    toDTO: jest.fn(() => ({
      question: overrides.question ?? 'Question ?',
      points: overrides.points ?? 2,
      type: 'CHOIX_UNIQUE',
      options: [],
    })),
    ...overrides,
  } as any;
}

function makeProps(overrides: Partial<any> = {}) {
  return {
    id: EntityId.from(UUID.quiz),
    moduleId: 'module-1',
    lessonId: 'lesson-1',
    chapterId: 'chapter-1',
    title: 'Quiz 1',
    description: 'Desc',
    status: QuizStatus.DRAFT,
    scoreMinimum: 70,
    duree: 20,
    nombreTentatives: 3,
    questions: [makeQuestion({ question: 'Q1', points: 2 })],
    ...overrides,
  };
}

describe('Quiz entity', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-02T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('constructor: set fields + getters', () => {
    const quiz = new Quiz(makeProps());

    expect(quiz.moduleId).toBe('module-1');
    expect(quiz.lessonId).toBe('lesson-1');
    expect(quiz.chapterId).toBe('chapter-1');

    expect(quiz.title).toBe('Quiz 1');
    expect(quiz.description).toBe('Desc');
    expect(quiz.status).toBe(QuizStatus.DRAFT);

    expect(quiz.scoreMinimum).toBe(70);
    expect(quiz.duree).toBe(20);
    expect(quiz.nombreTentatives).toBe(3);

    expect(quiz.questions).toHaveLength(1);
    expect(quiz.isIllimite).toBe(false);
  });

  it('constructor: duree undefined => isIllimite=true', () => {
    const quiz = new Quiz(makeProps({ duree: undefined }));
    expect(quiz.duree).toBeUndefined();
    expect(quiz.isIllimite).toBe(true);
  });

  describe('validations constructeur', () => {
    it('throw si scoreMinimum hors [0..100] ou non entier', () => {
      expect(() => new Quiz(makeProps({ scoreMinimum: -1 }))).toThrow(
        'Le score minimum doit être un entier entre 0 et 100'
      );
      expect(() => new Quiz(makeProps({ scoreMinimum: 101 }))).toThrow(
        'Le score minimum doit être un entier entre 0 et 100'
      );
      expect(() => new Quiz(makeProps({ scoreMinimum: 70.5 }))).toThrow(
        'Le score minimum doit être un entier entre 0 et 100'
      );
    });

    it('throw si nombreTentatives hors [1..3] ou non entier', () => {
      expect(() => new Quiz(makeProps({ nombreTentatives: 0 }))).toThrow(
        'Le nombre de tentatives doit être entre 1 et 3'
      );
      expect(() => new Quiz(makeProps({ nombreTentatives: 4 }))).toThrow(
        'Le nombre de tentatives doit être entre 1 et 3'
      );
      expect(() => new Quiz(makeProps({ nombreTentatives: 2.2 }))).toThrow(
        'Le nombre de tentatives doit être entre 1 et 3'
      );
    });
  });

  it('totalPoints: somme des points', () => {
    const quiz = new Quiz(
      makeProps({
        questions: [
          makeQuestion({ question: 'Q1', points: 2 }),
          makeQuestion({ question: 'Q2', points: 5 }),
        ],
      })
    );

    expect(quiz.totalPoints).toBe(7);
  });

  // -------------------------
  // Méthodes métier
  // -------------------------
  describe('publish/draft/archive', () => {
    it('publish: ok si pas archivé et questions > 0', () => {
      const quiz = new Quiz(makeProps({ status: QuizStatus.DRAFT }));
      const before = quiz.toDTO().updatedAt;

      jest.setSystemTime(new Date('2026-02-02T00:00:01.000Z'));
      quiz.publish();

      expect(quiz.status).toBe(QuizStatus.PUBLISHED);
      expect(quiz.toDTO().updatedAt?.getTime() ?? 0).toBeGreaterThan(before?.getTime() ?? 0);
    });

    it('publish: throw si archivé', () => {
      const quiz = new Quiz(makeProps({ status: QuizStatus.ARCHIVED }));
      expect(() => quiz.publish()).toThrow('Impossible de publier un quiz archivé');
    });

    it('publish: throw si aucune question', () => {
      const quiz = new Quiz(makeProps({ status: QuizStatus.DRAFT, questions: [] }));
      expect(() => quiz.publish()).toThrow('Impossible de publier un quiz sans questions');
    });

    it('draft: ok si pas archivé', () => {
      const quiz = new Quiz(makeProps({ status: QuizStatus.PUBLISHED }));
      const before = quiz.toDTO().updatedAt;

      jest.setSystemTime(new Date('2026-02-02T00:00:01.000Z'));
      quiz.draft();

      expect(quiz.status).toBe(QuizStatus.DRAFT);
      expect(quiz.toDTO().updatedAt?.getTime() ?? 0).toBeGreaterThan(before?.getTime() ?? 0);
    });

    it('draft: throw si archivé', () => {
      const quiz = new Quiz(makeProps({ status: QuizStatus.ARCHIVED }));
      expect(() => quiz.draft()).toThrow('Impossible de remettre en brouillon un quiz archivé');
    });

    it('archive: passe à ARCHIVED', () => {
      const quiz = new Quiz(makeProps({ status: QuizStatus.DRAFT }));
      const before = quiz.toDTO().updatedAt;

      jest.setSystemTime(new Date('2026-02-02T00:00:01.000Z'));
      quiz.archive();

      expect(quiz.status).toBe(QuizStatus.ARCHIVED);
      expect(quiz.toDTO().updatedAt?.getTime() ?? 0).toBeGreaterThan(before?.getTime() ?? 0);
    });
  });

  // -------------------------
  // Updates
  // -------------------------
  describe('updates', () => {
    it('updateTitle: ok + updatedAt change', () => {
      const quiz = new Quiz(makeProps());
      const before = quiz.toDTO().updatedAt;

      jest.setSystemTime(new Date('2026-02-02T00:00:01.000Z'));
      quiz.updateTitle('New title');

      expect(quiz.title).toBe('New title');
      expect(quiz.toDTO().updatedAt?.getTime() ?? 0).toBeGreaterThan(before?.getTime() ?? 0);
    });

    it('updateTitle: throw si vide ou > 200', () => {
      const quiz = new Quiz(makeProps());
      expect(() => quiz.updateTitle('   ')).toThrow('Le titre du quiz ne peut pas être vide');
      expect(() => quiz.updateTitle('a'.repeat(201))).toThrow(
        'Le titre du quiz ne peut pas dépasser 200 caractères'
      );
    });

    it('updateDescription: ok', () => {
      const quiz = new Quiz(makeProps());
      jest.setSystemTime(new Date('2026-02-02T00:00:01.000Z'));
      quiz.updateDescription('New desc');
      expect(quiz.description).toBe('New desc');
    });

    it('updateDescription: throw si vide', () => {
      const quiz = new Quiz(makeProps());
      expect(() => quiz.updateDescription('')).toThrow(
        'La description du quiz ne peut pas être vide'
      );
    });

    it('updateScoreMinimum: ok + throw si invalide', () => {
      const quiz = new Quiz(makeProps());
      quiz.updateScoreMinimum(0);
      expect(quiz.scoreMinimum).toBe(0);

      expect(() => quiz.updateScoreMinimum(101)).toThrow(
        'Le score minimum doit être un entier entre 0 et 100'
      );
      expect(() => quiz.updateScoreMinimum(1.5)).toThrow(
        'Le score minimum doit être un entier entre 0 et 100'
      );
    });

    it('updateDuree: ok + illimité + throw si invalide', () => {
      const quiz = new Quiz(makeProps({ duree: 10 }));

      quiz.updateDuree(25);
      expect(quiz.duree).toBe(25);
      expect(quiz.isIllimite).toBe(false);

      quiz.updateDuree(undefined);
      expect(quiz.duree).toBeUndefined();
      expect(quiz.isIllimite).toBe(true);

      expect(() => quiz.updateDuree(0)).toThrow(
        'La durée doit être un entier positif ou non définie (illimité)'
      );
      expect(() => quiz.updateDuree(-1)).toThrow(
        'La durée doit être un entier positif ou non définie (illimité)'
      );
      expect(() => quiz.updateDuree(2.2)).toThrow(
        'La durée doit être un entier positif ou non définie (illimité)'
      );
    });

    it('updateNombreTentatives: ok + throw si invalide', () => {
      const quiz = new Quiz(makeProps({ nombreTentatives: 3 }));
      quiz.updateNombreTentatives(1);
      expect(quiz.nombreTentatives).toBe(1);

      expect(() => quiz.updateNombreTentatives(0)).toThrow(
        'Le nombre de tentatives doit être entre 1 et 3'
      );
      expect(() => quiz.updateNombreTentatives(4)).toThrow(
        'Le nombre de tentatives doit être entre 1 et 3'
      );
      expect(() => quiz.updateNombreTentatives(2.5)).toThrow(
        'Le nombre de tentatives doit être entre 1 et 3'
      );
    });
  });

  // -------------------------
  // Gestion questions
  // -------------------------
  describe('questions management', () => {
    it('addQuestion: ajoute une question', () => {
      const quiz = new Quiz(makeProps({ questions: [] }));
      const q = makeQuestion({ question: 'NEW', points: 3 });

      quiz.addQuestion(q);

      expect(quiz.questions).toHaveLength(1);
      expect(quiz.questions[0].question).toBe('NEW');
    });

    it('removeQuestionAt: supprime par index + throw index invalide', () => {
      const quiz = new Quiz(
        makeProps({
          questions: [makeQuestion({ question: 'A' }), makeQuestion({ question: 'B' })],
        })
      );

      quiz.removeQuestionAt(0);
      expect(quiz.questions).toHaveLength(1);
      expect(quiz.questions[0].question).toBe('B');

      expect(() => quiz.removeQuestionAt(-1)).toThrow('Index de question invalide');
      expect(() => quiz.removeQuestionAt(5)).toThrow('Index de question invalide');
    });

    it('removeQuestion: supprime par texte + throw si introuvable', () => {
      const quiz = new Quiz(
        makeProps({
          questions: [makeQuestion({ question: 'A' }), makeQuestion({ question: 'B' })],
        })
      );

      quiz.removeQuestion('B');
      expect(quiz.questions).toHaveLength(1);
      expect(quiz.questions[0].question).toBe('A');

      expect(() => quiz.removeQuestion('X')).toThrow('Question non trouvée');
    });

    it('updateQuestionAt: remplace + throw index invalide', () => {
      const quiz = new Quiz(
        makeProps({
          questions: [makeQuestion({ question: 'A' }), makeQuestion({ question: 'B' })],
        })
      );

      const updated = makeQuestion({ question: 'C', points: 9 });
      quiz.updateQuestionAt(1, updated);

      expect(quiz.questions[1].question).toBe('C');
      expect(quiz.questions[1].points).toBe(9);

      expect(() => quiz.updateQuestionAt(-1, updated)).toThrow('Index de question invalide');
      expect(() => quiz.updateQuestionAt(9, updated)).toThrow('Index de question invalide');
    });
  });

  // -------------------------
  // DTO
  // -------------------------
  it('toDTO: mappe toutes les propriétés + questions.toDTO + totalPoints', () => {
    const q1 = makeQuestion({ question: 'Q1', points: 2 });
    const q2 = makeQuestion({ question: 'Q2', points: 5 });

    const quiz = new Quiz(
      makeProps({
        id: EntityId.from(UUID.quiz),
        moduleId: 'module-1',
        lessonId: 'lesson-1',
        chapterId: 'chapter-1',
        questions: [q1, q2],
        duree: undefined, // illimité
      })
    );

    const dto: any = quiz.toDTO();

    expect(dto).toMatchObject({
      id: UUID.quiz,
      moduleId: 'module-1',
      lessonId: 'lesson-1',
      chapterId: 'chapter-1',
      title: 'Quiz 1',
      description: 'Desc',
      status: QuizStatus.DRAFT,
      scoreMinimum: 70,
      duree: undefined,
      nombreTentatives: 3,
      totalPoints: 7,
    });

    expect(Array.isArray(dto.questions)).toBe(true);
    expect(dto.questions).toHaveLength(2);

    expect(q1.toDTO).toHaveBeenCalledTimes(1);
    expect(q2.toDTO).toHaveBeenCalledTimes(1);
  });
});
