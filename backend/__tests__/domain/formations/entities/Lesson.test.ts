import { Lesson, LessonStatus } from '@/domain/formations/entities/Lesson';
import { EntityId } from '@/domain/shared/EntityId';

describe('Lesson entity', () => {
  const makeId = () => EntityId.generate();

  const makeChapter = (idStr?: string) => {
    const id = idStr ?? EntityId.generate().getValue();
    return {
      id: { getValue: () => id },
      toDTO: jest.fn().mockReturnValue({ id, title: 'C', description: 'D', order: 0 }),
    } as any;
  };

  const makeQuiz = (idStr?: string) => {
    const id = idStr ?? EntityId.generate().getValue();
    return {
      id: { getValue: () => id },
      toDTO: jest.fn().mockReturnValue({ id, title: 'Q' }),
    } as any;
  };

  const makeLesson = (overrides: Partial<ConstructorParameters<typeof Lesson>[0]> = {}) => {
    return new Lesson({
      id: makeId(),
      moduleId: 'module-1',
      title: 'Titre',
      description: 'Description',
      duration: 10,
      order: 0,
      status: LessonStatus.DRAFT,
      chapters: [],
      quizzes: [],
      ...overrides,
    });
  };

  describe('constructor validations', () => {
    it('throw si duration <= 0', () => {
      expect(() => makeLesson({ duration: 0 })).toThrow('La durée doit être supérieure à 0');
      expect(() => makeLesson({ duration: -1 })).toThrow('La durée doit être supérieure à 0');
    });

    it('throw si order invalide', () => {
      expect(() => makeLesson({ order: -1 as any })).toThrow(
        "L'ordre doit être un entier positif ou zéro"
      );
      expect(() => makeLesson({ order: 1.5 as any })).toThrow(
        "L'ordre doit être un entier positif ou zéro"
      );
    });

    it('expose getters', () => {
      const ch = makeChapter();
      const q = makeQuiz();

      const lesson = makeLesson({
        moduleId: 'module-99',
        title: 'T',
        description: 'D',
        duration: 20,
        order: 2,
        status: LessonStatus.SCHEDULED,
        chapters: [ch],
        quizzes: [q],
      });

      expect(lesson.moduleId).toBe('module-99');
      expect(lesson.title).toBe('T');
      expect(lesson.description).toBe('D');
      expect(lesson.duration).toBe(20);
      expect(lesson.order).toBe(2);
      expect(lesson.status).toBe(LessonStatus.SCHEDULED);
      expect(lesson.chapters).toHaveLength(1);
      expect(lesson.chaptersCount).toBe(1);
      expect(lesson.quizzes).toHaveLength(1);
    });
  });

  describe('métier: publish/draft/archive/schedule', () => {
    it('publish: throw si ARCHIVED', () => {
      const lesson = makeLesson({ status: LessonStatus.ARCHIVED });
      expect(() => lesson.publish()).toThrow('Impossible de publier une leçon archivée');
    });

    it('publish: throw si pas de chapitres', () => {
      const lesson = makeLesson({ status: LessonStatus.DRAFT, chapters: [] });
      expect(() => lesson.publish()).toThrow('Impossible de publier une leçon sans chapitres');
    });

    it('publish: ok si chapitres présents', () => {
      const lesson = makeLesson({ chapters: [makeChapter()] });
      lesson.publish();
      expect(lesson.status).toBe(LessonStatus.PUBLISHED);
      expect(lesson.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('draft: throw si ARCHIVED', () => {
      const lesson = makeLesson({ status: LessonStatus.ARCHIVED });
      expect(() => lesson.draft()).toThrow(
        'Impossible de remettre en brouillon une leçon archivée'
      );
    });

    it('draft: ok', () => {
      const lesson = makeLesson({ status: LessonStatus.PUBLISHED, chapters: [makeChapter()] });
      lesson.draft();
      expect(lesson.status).toBe(LessonStatus.DRAFT);
    });

    it('archive: ok', () => {
      const lesson = makeLesson();
      lesson.archive();
      expect(lesson.status).toBe(LessonStatus.ARCHIVED);
    });

    it('schedule: throw si ARCHIVED', () => {
      const lesson = makeLesson({ status: LessonStatus.ARCHIVED });
      expect(() => lesson.schedule()).toThrow('Impossible de programmer une leçon archivée');
    });

    it('schedule: ok', () => {
      const lesson = makeLesson({ status: LessonStatus.DRAFT });
      lesson.schedule();
      expect(lesson.status).toBe(LessonStatus.SCHEDULED);
    });
  });

  describe('updates: title/description/duration/order', () => {
    it('updateTitle: throw si vide/espaces ou trop long', () => {
      const lesson = makeLesson();

      expect(() => lesson.updateTitle('')).toThrow('Le titre de la leçon ne peut pas être vide');
      expect(() => lesson.updateTitle('   ')).toThrow('Le titre de la leçon ne peut pas être vide');

      expect(() => lesson.updateTitle('a'.repeat(201))).toThrow(
        'Le titre de la leçon ne peut pas dépasser 200 caractères'
      );
    });

    it('updateTitle: ok', () => {
      const lesson = makeLesson();
      lesson.updateTitle('Nouveau');
      expect(lesson.title).toBe('Nouveau');
      expect(lesson.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('updateDescription: throw si vide', () => {
      const lesson = makeLesson();
      expect(() => lesson.updateDescription('   ')).toThrow(
        'La description de la leçon ne peut pas être vide'
      );
    });

    it('updateDescription: ok', () => {
      const lesson = makeLesson();
      lesson.updateDescription('Nouvelle desc');
      expect(lesson.description).toBe('Nouvelle desc');
    });

    it('updateDuration: throw si <=0, ok sinon', () => {
      const lesson = makeLesson();
      expect(() => lesson.updateDuration(0)).toThrow('La durée doit être supérieure à 0');

      lesson.updateDuration(99);
      expect(lesson.duration).toBe(99);
    });

    it('updateOrder: throw si invalide, ok sinon', () => {
      const lesson = makeLesson();
      expect(() => lesson.updateOrder(-1 as any)).toThrow(
        "L'ordre doit être un entier positif ou zéro"
      );
      expect(() => lesson.updateOrder(1.2 as any)).toThrow(
        "L'ordre doit être un entier positif ou zéro"
      );

      lesson.updateOrder(3);
      expect(lesson.order).toBe(3);
    });
  });

  describe('chapters management', () => {
    it('addChapter', () => {
      const lesson = makeLesson({ chapters: [] });
      const ch = makeChapter();

      lesson.addChapter(ch);
      expect(lesson.chapters).toHaveLength(1);
      expect(lesson.chaptersCount).toBe(1);
    });

    it('removeChapterAt: throw si index invalide', () => {
      const lesson = makeLesson({ chapters: [makeChapter()] });

      expect(() => lesson.removeChapterAt(-1)).toThrow('Index de chapitre invalide');
      expect(() => lesson.removeChapterAt(99)).toThrow('Index de chapitre invalide');
    });

    it('removeChapterAt: ok', () => {
      const lesson = makeLesson({ chapters: [makeChapter(), makeChapter()] });
      lesson.removeChapterAt(0);
      expect(lesson.chapters).toHaveLength(1);
    });

    it('removeChapterById: throw si pas trouvé', () => {
      const lesson = makeLesson({ chapters: [makeChapter()] });
      expect(() => lesson.removeChapterById('nope')).toThrow('Chapitre non trouvé');
    });

    it('removeChapterById: ok', () => {
      const chId = EntityId.generate().getValue();
      const lesson = makeLesson({ chapters: [makeChapter(chId), makeChapter()] });

      lesson.removeChapterById(chId);
      expect(lesson.chapters).toHaveLength(1);
    });

    it('updateChapterAt: throw si index invalide', () => {
      const lesson = makeLesson({ chapters: [makeChapter()] });
      expect(() => lesson.updateChapterAt(-1, makeChapter())).toThrow('Index de chapitre invalide');
      expect(() => lesson.updateChapterAt(5, makeChapter())).toThrow('Index de chapitre invalide');
    });

    it('updateChapterAt: ok', () => {
      const lesson = makeLesson({ chapters: [makeChapter()] });
      const newCh = makeChapter();

      lesson.updateChapterAt(0, newCh);
      expect(lesson.chapters[0]).toBe(newCh);
    });

    it('reorderChapters: throw si longueur différente', () => {
      const lesson = makeLesson({ chapters: [makeChapter(), makeChapter()] });
      expect(() => lesson.reorderChapters([makeChapter()] as any)).toThrow(
        'Le nombre de chapitres doit rester le même'
      );
    });

    it('reorderChapters: ok', () => {
      const ch1 = makeChapter();
      const ch2 = makeChapter();
      const lesson = makeLesson({ chapters: [ch1, ch2] });

      lesson.reorderChapters([ch2, ch1]);
      expect(lesson.chapters[0]).toBe(ch2);
      expect(lesson.chapters[1]).toBe(ch1);
    });
  });

  describe('quizzes set', () => {
    it('addQuiz ajoute au Set (pas de doublon) et update updatedAt', () => {
      const quizId = EntityId.generate().getValue();
      const q1 = makeQuiz(quizId);

      const lesson = makeLesson({ quizzes: [] });

      lesson.addQuiz(q1);
      lesson.addQuiz(q1);

      expect(lesson.quizzes).toHaveLength(1);
      expect(lesson.toDTO().updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('toDTO', () => {
    it('retourne un LessonDTO complet (chapters + quizzes + chaptersCount)', () => {
      const ch = makeChapter();
      const q = makeQuiz();

      const lesson = makeLesson({
        id: makeId(),
        moduleId: 'module-1',
        title: 'T',
        description: 'D',
        duration: 10,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [ch],
        quizzes: [q],
      });

      const dto = lesson.toDTO();

      expect(dto).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          moduleId: 'module-1',
          title: 'T',
          description: 'D',
          duration: 10,
          order: 0,
          status: LessonStatus.DRAFT,
          chaptersCount: 1,
        })
      );

      expect(ch.toDTO).toHaveBeenCalledTimes(1);
      expect(q.toDTO).toHaveBeenCalledTimes(1);
      expect(Array.isArray(dto.chapters)).toBe(true);
      expect(Array.isArray(dto.quizzes)).toBe(true);
    });
  });
});
