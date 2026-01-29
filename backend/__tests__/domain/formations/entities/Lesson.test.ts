import { EntityId } from '@/domain/shared/EntityId';
import { Chapter } from '@/domain/formations/entities/Chapter';
import { Lesson, LessonStatus } from '@/domain/formations/entities/Lesson';

function makeChapter(
  overrides?: Partial<{ title: string; description: string; mediaId: string; order: number }>
) {
  return new Chapter(
    overrides?.title ?? 'Chapitre 1',
    overrides?.description ?? 'Description',
    overrides?.mediaId ?? 'media-1',
    overrides?.order ?? 0
  );
}

function makeLesson(
  params?: Partial<{
    status: LessonStatus;
    chapters: Chapter[];
    duration: number;
    order: number;
    title: string;
    description: string;
  }>
) {
  return new Lesson({
    id: EntityId.generate(),
    title: params?.title ?? 'Leçon 1',
    description: params?.description ?? 'Description leçon',
    duration: params?.duration ?? 30,
    order: params?.order ?? 0,
    status: params?.status ?? LessonStatus.DRAFT,
    chapters: params?.chapters ?? [makeChapter()],
  });
}

describe('Lesson (entity) — 100% coverage', () => {
  describe('constructor validations', () => {
    it('should throw if duration <= 0', () => {
      expect(() => makeLesson({ duration: 0 })).toThrow('La durée doit être supérieure à 0');
    });

    it('should throw if order is not an integer or < 0', () => {
      expect(() => makeLesson({ order: -1 })).toThrow(
        "L'ordre doit être un entier positif ou zéro"
      );
      expect(() => makeLesson({ order: 1.5 })).toThrow(
        "L'ordre doit être un entier positif ou zéro"
      );
    });
  });

  describe('getters', () => {
    it('should expose getters values', () => {
      const lesson = makeLesson({
        title: 'T',
        description: 'D',
        duration: 10,
        order: 2,
        status: LessonStatus.SCHEDULED,
        chapters: [makeChapter()],
      });

      expect(lesson.title).toBe('T');
      expect(lesson.description).toBe('D');
      expect(lesson.duration).toBe(10);
      expect(lesson.order).toBe(2);
      expect(lesson.status).toBe(LessonStatus.SCHEDULED);
      expect(lesson.chapters).toHaveLength(1);
      expect(lesson.chaptersCount).toBe(1);
    });
  });

  describe('business methods', () => {
    it('publish() should set status to PUBLISHED and update updatedAt', () => {
      const lesson = makeLesson({ status: LessonStatus.DRAFT, chapters: [makeChapter()] });

      lesson.publish();

      expect(lesson.status).toBe(LessonStatus.PUBLISHED);
      expect(lesson.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('publish() should throw if archived', () => {
      const lesson = makeLesson({ status: LessonStatus.ARCHIVED, chapters: [makeChapter()] });

      expect(() => lesson.publish()).toThrow('Impossible de publier une leçon archivée');
    });

    it('publish() should throw if no chapters', () => {
      const lesson = makeLesson({ status: LessonStatus.DRAFT, chapters: [] });

      expect(() => lesson.publish()).toThrow('Impossible de publier une leçon sans chapitres');
    });

    it('draft() should set status to DRAFT and update updatedAt', () => {
      const lesson = makeLesson({ status: LessonStatus.PUBLISHED, chapters: [makeChapter()] });

      lesson.draft();

      expect(lesson.status).toBe(LessonStatus.DRAFT);
      expect(lesson.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('draft() should throw if archived', () => {
      const lesson = makeLesson({ status: LessonStatus.ARCHIVED });

      expect(() => lesson.draft()).toThrow(
        'Impossible de remettre en brouillon une leçon archivée'
      );
    });

    it('archive() should set status to ARCHIVED and update updatedAt', () => {
      const lesson = makeLesson({ status: LessonStatus.DRAFT });

      lesson.archive();

      expect(lesson.status).toBe(LessonStatus.ARCHIVED);
      expect(lesson.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('schedule() should set status to SCHEDULED and update updatedAt', () => {
      const lesson = makeLesson({ status: LessonStatus.DRAFT });

      lesson.schedule();

      expect(lesson.status).toBe(LessonStatus.SCHEDULED);
      expect(lesson.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('schedule() should throw if archived', () => {
      const lesson = makeLesson({ status: LessonStatus.ARCHIVED });

      expect(() => lesson.schedule()).toThrow('Impossible de programmer une leçon archivée');
    });
  });

  describe('updates', () => {
    it('updateTitle() should update title', () => {
      const lesson = makeLesson();
      lesson.updateTitle('Nouveau titre');
      expect(lesson.title).toBe('Nouveau titre');
      expect(lesson.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('updateTitle() should throw if empty', () => {
      const lesson = makeLesson();
      expect(() => lesson.updateTitle('')).toThrow('Le titre ne peut pas être vide');
    });

    it('updateTitle() should throw if > 200 chars', () => {
      const lesson = makeLesson();
      expect(() => lesson.updateTitle('a'.repeat(201))).toThrow(
        'Le titre ne peut pas dépasser 200 caractères'
      );
    });

    it('updateDescription() should update description', () => {
      const lesson = makeLesson();
      lesson.updateDescription('Nouvelle description');
      expect(lesson.description).toBe('Nouvelle description');
      expect(lesson.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('updateDescription() should throw if empty', () => {
      const lesson = makeLesson();
      expect(() => lesson.updateDescription('')).toThrow('La description ne peut pas être vide');
    });

    it('updateDuration() should update duration', () => {
      const lesson = makeLesson();
      lesson.updateDuration(99);
      expect(lesson.duration).toBe(99);
      expect(lesson.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('updateDuration() should throw if <= 0', () => {
      const lesson = makeLesson();
      expect(() => lesson.updateDuration(0)).toThrow('La durée doit être supérieure à 0');
    });

    it('updateOrder() should update order', () => {
      const lesson = makeLesson();
      lesson.updateOrder(5);
      expect(lesson.order).toBe(5);
      expect(lesson.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('updateOrder() should throw if invalid', () => {
      const lesson = makeLesson();
      expect(() => lesson.updateOrder(-1)).toThrow("L'ordre doit être un entier positif ou zéro");
      expect(() => lesson.updateOrder(2.2)).toThrow("L'ordre doit être un entier positif ou zéro");
    });
  });

  describe('chapters management', () => {
    it('addChapter() should add a chapter', () => {
      const lesson = makeLesson({ chapters: [] });
      lesson.addChapter(makeChapter({ title: 'C1' }));
      expect(lesson.chapters).toHaveLength(1);
      expect(lesson.chapters[0].title).toBe('C1');
      expect(lesson.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('removeChapterAt() should throw for invalid index (negative and too large)', () => {
      const lesson = makeLesson({ chapters: [makeChapter()] });

      expect(() => lesson.removeChapterAt(-1)).toThrow('Index de chapitre invalide');
      expect(() => lesson.removeChapterAt(1)).toThrow('Index de chapitre invalide');
    });

    it('removeChapterAt() should remove chapter at index', () => {
      const lesson = makeLesson({
        chapters: [makeChapter({ title: 'A' }), makeChapter({ title: 'B', order: 1 })],
      });

      lesson.removeChapterAt(0);

      expect(lesson.chapters).toHaveLength(1);
      expect(lesson.chapters[0].title).toBe('B');
      expect(lesson.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('removeChapter() should throw if not found', () => {
      const lesson = makeLesson({ chapters: [makeChapter({ title: 'A' })] });

      expect(() => lesson.removeChapter('X')).toThrow('Chapitre non trouvé');
    });

    it('removeChapter() should remove by title', () => {
      const lesson = makeLesson({
        chapters: [makeChapter({ title: 'A' }), makeChapter({ title: 'B', order: 1 })],
      });

      lesson.removeChapter('B');

      expect(lesson.chapters).toHaveLength(1);
      expect(lesson.chapters[0].title).toBe('A');
      expect(lesson.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('updateChapterAt() should throw for invalid index', () => {
      const lesson = makeLesson({ chapters: [makeChapter({ title: 'A' })] });

      expect(() => lesson.updateChapterAt(2, makeChapter({ title: 'NEW' }))).toThrow(
        'Index de chapitre invalide'
      );
    });

    it('updateChapterAt() should replace chapter at index', () => {
      const lesson = makeLesson({ chapters: [makeChapter({ title: 'A' })] });

      lesson.updateChapterAt(0, makeChapter({ title: 'NEW' }));

      expect(lesson.chapters).toHaveLength(1);
      expect(lesson.chapters[0].title).toBe('NEW');
      expect(lesson.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('reorderChapters() should throw if length differs', () => {
      const lesson = makeLesson({
        chapters: [makeChapter({ title: 'A' }), makeChapter({ title: 'B', order: 1 })],
      });

      expect(() => lesson.reorderChapters([makeChapter({ title: 'ONLY' })])).toThrow(
        'Le nombre de chapitres doit rester le même'
      );
    });

    it('reorderChapters() should set new order', () => {
      const a = makeChapter({ title: 'A', order: 0 });
      const b = makeChapter({ title: 'B', order: 1 });
      const lesson = makeLesson({ chapters: [a, b] });

      lesson.reorderChapters([b, a]);

      expect(lesson.chapters[0].title).toBe('B');
      expect(lesson.chapters[1].title).toBe('A');
      expect(lesson.toDTO().updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('toDTO()', () => {
    it('should map entity to DTO including chaptersCount and chapters DTO', () => {
      const ch1 = makeChapter({ title: 'C1', order: 0 });
      const ch2 = makeChapter({ title: 'C2', order: 1 });

      const lesson = makeLesson({
        title: 'T',
        description: 'D',
        duration: 30,
        order: 2,
        status: LessonStatus.DRAFT,
        chapters: [ch1, ch2],
      });

      const dto = lesson.toDTO();

      expect(dto.id).toEqual(expect.any(String));
      expect(dto.title).toBe('T');
      expect(dto.description).toBe('D');
      expect(dto.duration).toBe(30);
      expect(dto.order).toBe(2);
      expect(dto.status).toBe(LessonStatus.DRAFT);
      expect(dto.chaptersCount).toBe(2);

      expect(dto.chapters).toHaveLength(2);
      expect(dto.chapters[0]).toEqual({
        title: 'C1',
        description: 'Description',
        mediaId: 'media-1',
        order: 0,
      });
    });
  });
});
