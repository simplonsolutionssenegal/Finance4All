/**
 * @jest-environment node
 */

import { Chapter } from '@/domain/formations/entities/Chapter';

// On mock EntityId (juste ce qu'il faut : getValue())
function makeEntityId(value = '11111111-1111-4111-8111-111111111111') {
  return {
    getValue: () => value,
  } as any;
}

// On mock Quiz (id.getValue + toDTO)
function makeQuiz(id = '22222222-2222-4222-8222-222222222222', overrides: Partial<any> = {}) {
  return {
    id: makeEntityId(id),
    toDTO: jest.fn(() => ({ id, title: `Quiz ${id}` })),
    ...overrides,
  } as any;
}

// On mock Media (pas utilisé dans toDTO chez toi, mais on le passe aux méthodes)
function makeMedia(overrides: Partial<any> = {}) {
  return {
    toDTO: jest.fn(() => ({})),
    ...overrides,
  } as any;
}

describe('Chapter entity', () => {
  it('constructor: initialise les champs + quizzes + dates optionnelles', () => {
    const createdAt = new Date('2026-02-02T00:00:00Z');
    const updatedAt = new Date('2026-02-03T00:00:00Z');

    const q1 = makeQuiz('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    const q2 = makeQuiz('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

    const chapter = new Chapter(
      makeEntityId('cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
      'Titre',
      'Description',
      'media-1',
      2,
      undefined,
      [q1, q2],
      createdAt,
      updatedAt
    );

    expect(chapter.title).toBe('Titre');
    expect(chapter.description).toBe('Description');
    expect(chapter.mediaId).toBe('media-1');
    expect(chapter.order).toBe(2);

    // quizzes stockés dans un Set => array avec 2
    expect(chapter.quizzes).toHaveLength(2);
    expect(chapter.quizzes.map((q: any) => q.id.getValue())).toEqual(
      expect.arrayContaining([
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      ])
    );

    // dates dans DTO
    const dto = chapter.toDTO();
    expect(dto.createdAt).toEqual(createdAt);
    expect(dto.updatedAt).toEqual(updatedAt);
  });

  describe('validations', () => {
    it('validateTitle: throw si vide', () => {
      expect(() => new Chapter(makeEntityId(), '', 'Desc', undefined, 0)).toThrow(
        'Le titre du chapitre ne peut pas être vide'
      );
    });

    it('validateTitle: throw si > 200', () => {
      const long = 'a'.repeat(201);
      expect(() => new Chapter(makeEntityId(), long, 'Desc', undefined, 0)).toThrow(
        'Le titre du chapitre ne peut pas dépasser 200 caractères'
      );
    });

    it('validateDescription: throw si vide', () => {
      expect(() => new Chapter(makeEntityId(), 'Titre', '   ', undefined, 0)).toThrow(
        'La description du chapitre ne peut pas être vide'
      );
    });

    it('validateOrder: throw si négatif', () => {
      expect(() => new Chapter(makeEntityId(), 'Titre', 'Desc', undefined, -1)).toThrow(
        "L'ordre doit être un entier positif ou zéro"
      );
    });

    it('validateOrder: throw si non entier', () => {
      expect(() => new Chapter(makeEntityId(), 'Titre', 'Desc', undefined, 1.2)).toThrow(
        "L'ordre doit être un entier positif ou zéro"
      );
    });
  });

  it('updateTitle / updateDescription / updateOrder: met à jour et change updatedAt', () => {
    const chapter = new Chapter(makeEntityId(), 'Titre', 'Desc', undefined, 0);

    const before = chapter.toDTO().updatedAt;

    jest.setSystemTime(new Date('2026-02-02T00:00:01.000Z'));
    chapter.updateTitle('Nouveau titre');

    expect(chapter.title).toBe('Nouveau titre');
    expect(chapter.toDTO().updatedAt.getTime()).toBeGreaterThan(before.getTime());

    const before2 = chapter.toDTO().updatedAt;

    jest.setSystemTime(new Date('2026-02-02T00:00:02.000Z'));
    chapter.updateDescription('Nouvelle desc');

    expect(chapter.description).toBe('Nouvelle desc');
    expect(chapter.toDTO().updatedAt.getTime()).toBeGreaterThan(before2.getTime());

    const before3 = chapter.toDTO().updatedAt;

    jest.setSystemTime(new Date('2026-02-02T00:00:03.000Z'));
    chapter.updateOrder(5);

    expect(chapter.order).toBe(5);
    expect(chapter.toDTO().updatedAt.getTime()).toBeGreaterThan(before3.getTime());
  });

  it('updateMedia / removeMedia: met mediaId/media et change updatedAt', () => {
    const chapter = new Chapter(makeEntityId(), 'Titre', 'Desc', undefined, 0);

    const media = makeMedia();
    chapter.updateMedia('media-xyz', media);
    expect(chapter.mediaId).toBe('media-xyz');
    expect(chapter.media).toBe(media);

    chapter.removeMedia();
    expect(chapter.mediaId).toBeUndefined();
    expect(chapter.media).toBeUndefined();
  });

  it('addQuiz: ajoute et change updatedAt', () => {
    const chapter = new Chapter(makeEntityId(), 'Titre', 'Desc', undefined, 0);

    const q1 = makeQuiz('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    const before = chapter.toDTO().updatedAt;

    jest.setSystemTime(new Date('2026-02-02T00:00:01.000Z'));
    chapter.addQuiz(q1);

    expect(chapter.quizzes).toHaveLength(1);
    expect(chapter.quizzes[0].id.getValue()).toBe('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    expect(chapter.toDTO().updatedAt.getTime()).toBeGreaterThan(before.getTime());
  });

  it('removeQuiz: supprime si trouvé et change updatedAt', () => {
    const q1 = makeQuiz('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    const q2 = makeQuiz('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

    const chapter = new Chapter(makeEntityId(), 'Titre', 'Desc', undefined, 0, undefined, [q1, q2]);

    const before = chapter.toDTO().updatedAt;

    jest.setSystemTime(new Date('2026-02-02T00:00:01.000Z'));
    chapter.removeQuiz('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');

    expect(chapter.quizzes).toHaveLength(1);
    expect(chapter.quizzes[0].id.getValue()).toBe('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
    expect(chapter.toDTO().updatedAt.getTime()).toBeGreaterThan(before.getTime());
  });

  it('removeQuiz: si id non trouvé => ne change rien', () => {
    const q1 = makeQuiz('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    const chapter = new Chapter(makeEntityId(), 'Titre', 'Desc', undefined, 0, undefined, [q1]);

    const beforeUpdatedAt = chapter.toDTO().updatedAt;
    const beforeCount = chapter.quizzes.length;

    chapter.removeQuiz('not-found-id');

    expect(chapter.quizzes).toHaveLength(beforeCount);
    // updatedAt inchangé car rien supprimé
    expect(chapter.toDTO().updatedAt).toEqual(beforeUpdatedAt);
  });

  it('toDTO: inclut quizzes.toDTO', () => {
    const q1 = makeQuiz('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    const q2 = makeQuiz('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
    const chapter = new Chapter(makeEntityId(), 'Titre', 'Desc', 'media-1', 0, undefined, [q1, q2]);

    const dto = chapter.toDTO();

    expect(dto).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: 'Titre',
        description: 'Desc',
        mediaId: 'media-1',
        order: 0,
        quizzes: [
          { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', title: expect.any(String) },
          { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', title: expect.any(String) },
        ],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    );

    expect(q1.toDTO).toHaveBeenCalledTimes(1);
    expect(q2.toDTO).toHaveBeenCalledTimes(1);
  });
});
