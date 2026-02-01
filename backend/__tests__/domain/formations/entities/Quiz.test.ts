import { Quiz, QuizStatus } from '@/domain/formations/entities/Quiz';
import { EntityId } from '@/domain/shared/EntityId';

describe('Quiz entity', () => {
  const makeId = () => EntityId.generate();

  const makeQuestion = (questionText = 'Q1', points = 1) => {
    return {
      question: questionText,
      points,
      toDTO: jest.fn().mockReturnValue({
        question: questionText,
        points,
        // le reste n’a pas d’importance ici
      }),
    } as any;
  };

  const makeQuiz = (overrides: Partial<ConstructorParameters<typeof Quiz>[0]> = {}) => {
    return new Quiz({
      id: makeId(),
      moduleId: overrides.moduleId,
      lessonId: overrides.lessonId,
      chapterId: overrides.chapterId,
      title: 'Titre',
      description: 'Description',
      status: QuizStatus.DRAFT,
      scoreMinimum: 50,
      duree: 30,
      nombreTentatives: 2,
      questions: [makeQuestion('Q1', 1)],
      ...overrides,
    });
  };

  describe('constructor validations', () => {
    it('throw si scoreMinimum invalide', () => {
      expect(() => makeQuiz({ scoreMinimum: -1 as any })).toThrow(
        'Le score minimum doit être un entier entre 0 et 100'
      );
      expect(() => makeQuiz({ scoreMinimum: 101 as any })).toThrow(
        'Le score minimum doit être un entier entre 0 et 100'
      );
      expect(() => makeQuiz({ scoreMinimum: 12.5 as any })).toThrow(
        'Le score minimum doit être un entier entre 0 et 100'
      );
    });

    it('throw si nombreTentatives invalide', () => {
      expect(() => makeQuiz({ nombreTentatives: 0 as any })).toThrow(
        'Le nombre de tentatives doit être entre 1 et 3'
      );
      expect(() => makeQuiz({ nombreTentatives: 4 as any })).toThrow(
        'Le nombre de tentatives doit être entre 1 et 3'
      );
      expect(() => makeQuiz({ nombreTentatives: 2.2 as any })).toThrow(
        'Le nombre de tentatives doit être entre 1 et 3'
      );
    });

    it('expose les getters', () => {
      const q1 = makeQuestion('Q1', 5);
      const quiz = makeQuiz({
        moduleId: 'mod-1',
        lessonId: 'les-1',
        chapterId: 'chap-1',
        title: 'T',
        description: 'D',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 60,
        duree: undefined,
        nombreTentatives: 3,
        questions: [q1],
      });

      expect(quiz.moduleId).toBe('mod-1');
      expect(quiz.lessonId).toBe('les-1');
      expect(quiz.chapterId).toBe('chap-1');
      expect(quiz.title).toBe('T');
      expect(quiz.description).toBe('D');
      expect(quiz.status).toBe(QuizStatus.PUBLISHED);
      expect(quiz.scoreMinimum).toBe(60);
      expect(quiz.duree).toBeUndefined();
      expect(quiz.isIllimite).toBe(true);
      expect(quiz.nombreTentatives).toBe(3);
      expect(quiz.questions).toHaveLength(1);
    });
  });

  describe('métier: publish/draft/archive', () => {
    it('publish: throw si ARCHIVED', () => {
      const quiz = makeQuiz({ status: QuizStatus.ARCHIVED });
      expect(() => quiz.publish()).toThrow('Impossible de publier un quiz archivé');
    });

    it('publish: throw si pas de questions', () => {
      const quiz = makeQuiz({ status: QuizStatus.DRAFT, questions: [] });
      expect(() => quiz.publish()).toThrow('Impossible de publier un quiz sans questions');
    });

    it('publish: ok si questions présentes', () => {
      const quiz = makeQuiz({ status: QuizStatus.DRAFT, questions: [makeQuestion()] });
      quiz.publish();
      expect(quiz.status).toBe(QuizStatus.PUBLISHED);
      expect(quiz.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('draft: throw si ARCHIVED', () => {
      const quiz = makeQuiz({ status: QuizStatus.ARCHIVED });
      expect(() => quiz.draft()).toThrow('Impossible de remettre en brouillon un quiz archivé');
    });

    it('draft: ok', () => {
      const quiz = makeQuiz({ status: QuizStatus.PUBLISHED });
      quiz.draft();
      expect(quiz.status).toBe(QuizStatus.DRAFT);
    });

    it('archive: ok', () => {
      const quiz = makeQuiz({ status: QuizStatus.DRAFT });
      quiz.archive();
      expect(quiz.status).toBe(QuizStatus.ARCHIVED);
    });
  });

  describe('updates: title/description/score/duree/tentatives', () => {
    it('updateTitle: throw si vide/espaces ou trop long', () => {
      const quiz = makeQuiz();

      expect(() => quiz.updateTitle('')).toThrow('Le titre du quiz ne peut pas être vide');
      expect(() => quiz.updateTitle('   ')).toThrow('Le titre du quiz ne peut pas être vide');
      expect(() => quiz.updateTitle('a'.repeat(201))).toThrow(
        'Le titre du quiz ne peut pas dépasser 200 caractères'
      );
    });

    it('updateTitle: ok', () => {
      const quiz = makeQuiz();
      quiz.updateTitle('Nouveau titre');
      expect(quiz.title).toBe('Nouveau titre');
      expect(quiz.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('updateDescription: throw si vide/espaces', () => {
      const quiz = makeQuiz();
      expect(() => quiz.updateDescription('')).toThrow(
        'La description du quiz ne peut pas être vide'
      );
      expect(() => quiz.updateDescription('   ')).toThrow(
        'La description du quiz ne peut pas être vide'
      );
    });

    it('updateDescription: ok', () => {
      const quiz = makeQuiz();
      quiz.updateDescription('Nouvelle desc');
      expect(quiz.description).toBe('Nouvelle desc');
    });

    it('updateScoreMinimum: throw si invalide, ok sinon', () => {
      const quiz = makeQuiz();

      expect(() => quiz.updateScoreMinimum(-1 as any)).toThrow(
        'Le score minimum doit être un entier entre 0 et 100'
      );

      quiz.updateScoreMinimum(80);
      expect(quiz.scoreMinimum).toBe(80);
    });

    it('updateDuree: throw si <=0 ou non entier, ok si undefined ou entier positif', () => {
      const quiz = makeQuiz();

      expect(() => quiz.updateDuree(0)).toThrow(
        'La durée doit être un entier positif ou non définie (illimité)'
      );
      expect(() => quiz.updateDuree(-1 as any)).toThrow(
        'La durée doit être un entier positif ou non définie (illimité)'
      );
      expect(() => quiz.updateDuree(1.2 as any)).toThrow(
        'La durée doit être un entier positif ou non définie (illimité)'
      );

      quiz.updateDuree(undefined);
      expect(quiz.duree).toBeUndefined();
      expect(quiz.isIllimite).toBe(true);

      quiz.updateDuree(45);
      expect(quiz.duree).toBe(45);
      expect(quiz.isIllimite).toBe(false);
    });

    it('updateNombreTentatives: throw si invalide, ok sinon', () => {
      const quiz = makeQuiz();

      expect(() => quiz.updateNombreTentatives(0 as any)).toThrow(
        'Le nombre de tentatives doit être entre 1 et 3'
      );

      quiz.updateNombreTentatives(3);
      expect(quiz.nombreTentatives).toBe(3);
    });
  });

  describe('questions management + totalPoints', () => {
    it('totalPoints calcule la somme des points', () => {
      const quiz = makeQuiz({
        questions: [makeQuestion('Q1', 2), makeQuestion('Q2', 3)],
      });

      expect(quiz.totalPoints).toBe(5);
    });

    it('addQuestion ajoute et met à jour updatedAt', () => {
      const quiz = makeQuiz({ questions: [] });

      quiz.addQuestion(makeQuestion('Q1', 1));
      expect(quiz.questions).toHaveLength(1);
      expect(quiz.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('removeQuestionAt: throw si index invalide', () => {
      const quiz = makeQuiz({ questions: [makeQuestion()] });

      expect(() => quiz.removeQuestionAt(-1)).toThrow('Index de question invalide');
      expect(() => quiz.removeQuestionAt(99)).toThrow('Index de question invalide');
    });

    it('removeQuestionAt: ok', () => {
      const quiz = makeQuiz({ questions: [makeQuestion('Q1'), makeQuestion('Q2')] });

      quiz.removeQuestionAt(0);
      expect(quiz.questions).toHaveLength(1);
      expect(quiz.questions[0].question).toBe('Q2');
    });

    it('removeQuestion: throw si pas trouvé', () => {
      const quiz = makeQuiz({ questions: [makeQuestion('Q1')] });
      expect(() => quiz.removeQuestion('NOPE')).toThrow('Question non trouvée');
    });

    it('removeQuestion: ok', () => {
      const quiz = makeQuiz({ questions: [makeQuestion('Q1'), makeQuestion('Q2')] });

      quiz.removeQuestion('Q1');
      expect(quiz.questions).toHaveLength(1);
      expect(quiz.questions[0].question).toBe('Q2');
    });

    it('updateQuestionAt: throw si index invalide', () => {
      const quiz = makeQuiz({ questions: [makeQuestion('Q1')] });

      expect(() => quiz.updateQuestionAt(-1, makeQuestion('QX'))).toThrow(
        'Index de question invalide'
      );
      expect(() => quiz.updateQuestionAt(9, makeQuestion('QX'))).toThrow(
        'Index de question invalide'
      );
    });

    it('updateQuestionAt: ok', () => {
      const quiz = makeQuiz({ questions: [makeQuestion('Q1')] });

      const updated = makeQuestion('Q-new', 10);
      quiz.updateQuestionAt(0, updated);

      expect(quiz.questions[0].question).toBe('Q-new');
      expect(quiz.questions[0].points).toBe(10);
    });
  });

  describe('toDTO', () => {
    it('retourne un QuizDTO complet (questions + totalPoints)', () => {
      const q1 = makeQuestion('Q1', 2);
      const q2 = makeQuestion('Q2', 3);

      const quiz = makeQuiz({
        questions: [q1, q2],
        moduleId: 'module-x',
        lessonId: 'lesson-x',
        chapterId: 'chapter-x',
        title: 'T',
        description: 'D',
        status: QuizStatus.DRAFT,
        scoreMinimum: 10,
        duree: undefined,
        nombreTentatives: 1,
      });

      const dto = quiz.toDTO();

      expect(dto).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          moduleId: 'module-x',
          lessonId: 'lesson-x',
          chapterId: 'chapter-x',
          title: 'T',
          description: 'D',
          status: QuizStatus.DRAFT,
          scoreMinimum: 10,
          duree: undefined,
          nombreTentatives: 1,
          totalPoints: 5,
        })
      );

      // toDTO des questions appelé
      expect(q1.toDTO).toHaveBeenCalledTimes(1);
      expect(q2.toDTO).toHaveBeenCalledTimes(1);
      expect(Array.isArray(dto.questions)).toBe(true);
    });
  });
});
