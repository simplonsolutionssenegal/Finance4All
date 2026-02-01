import { Chapter } from '@/domain/formations/entities/Chapter';
import { EntityId } from '@/domain/shared/EntityId';

describe('Chapter entity', () => {
  const makeId = () => EntityId.generate();

  const makeMedia = () => ({
    toDTO: jest.fn().mockReturnValue({ id: 'm1', url: 'http://x' }),
  });

  it('crée un chapitre valide et expose les getters', () => {
    const id = makeId();
    const media = makeMedia();

    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');

    const chapter = new Chapter(
      id,
      'Titre',
      'Description',
      'media-1',
      0,
      media as any,
      createdAt,
      updatedAt
    );

    expect(chapter.id.getValue()).toBe(id.getValue());
    expect(chapter.title).toBe('Titre');
    expect(chapter.description).toBe('Description');
    expect(chapter.mediaId).toBe('media-1');
    expect(chapter.order).toBe(0);
    expect(chapter.media).toBe(media as any);

    // toDTO sans baseUrl => media undefined
    const dtoNoBase = chapter.toDTO();
    expect(dtoNoBase.media).toBeUndefined();
    expect(dtoNoBase.createdAt).toBeInstanceOf(Date);
    expect(dtoNoBase.updatedAt).toBeInstanceOf(Date);

    // createdAt / updatedAt bien assignés
    expect(dtoNoBase.createdAt?.toISOString()).toBe(createdAt.toISOString());
    expect(dtoNoBase.updatedAt?.toISOString()).toBe(updatedAt.toISOString());
  });

  describe('validations (constructor)', () => {
    it('throw si titre vide', () => {
      expect(() => new Chapter(makeId(), '', 'Desc', undefined, 0)).toThrow(
        'Le titre du chapitre ne peut pas être vide'
      );
    });

    it('throw si titre > 200 caractères', () => {
      const longTitle = 'a'.repeat(201);
      expect(() => new Chapter(makeId(), longTitle, 'Desc', undefined, 0)).toThrow(
        'Le titre du chapitre ne peut pas dépasser 200 caractères'
      );
    });

    it('throw si description vide', () => {
      expect(() => new Chapter(makeId(), 'Titre', '   ', undefined, 0)).toThrow(
        'La description du chapitre ne peut pas être vide'
      );
    });

    it('throw si order invalide (non entier / négatif)', () => {
      expect(() => new Chapter(makeId(), 'Titre', 'Desc', undefined, -1)).toThrow(
        "L'ordre doit être un entier positif ou zéro"
      );
      expect(() => new Chapter(makeId(), 'Titre', 'Desc', undefined, 1.5)).toThrow(
        "L'ordre doit être un entier positif ou zéro"
      );
    });
  });

  describe('updates', () => {
    it('updateTitle: met à jour + updatedAt', () => {
      const chapter = new Chapter(makeId(), 'Titre', 'Desc', undefined, 0);
      const before = chapter.toDTO().updatedAt;

      chapter.updateTitle('Nouveau titre');

      expect(chapter.title).toBe('Nouveau titre');
      const after = chapter.toDTO().updatedAt;
      expect(after).toBeInstanceOf(Date);
      if (before && after) expect(after.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it('updateTitle: throw si invalide', () => {
      const chapter = new Chapter(makeId(), 'Titre', 'Desc', undefined, 0);

      expect(() => chapter.updateTitle('')).toThrow('Le titre du chapitre ne peut pas être vide');
      expect(() => chapter.updateTitle('a'.repeat(201))).toThrow(
        'Le titre du chapitre ne peut pas dépasser 200 caractères'
      );
    });

    it('updateDescription: met à jour + updatedAt', () => {
      const chapter = new Chapter(makeId(), 'Titre', 'Desc', undefined, 0);

      chapter.updateDescription('Nouvelle desc');
      expect(chapter.description).toBe('Nouvelle desc');
      expect(chapter.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('updateDescription: throw si invalide', () => {
      const chapter = new Chapter(makeId(), 'Titre', 'Desc', undefined, 0);
      expect(() => chapter.updateDescription('   ')).toThrow(
        'La description du chapitre ne peut pas être vide'
      );
    });

    it('updateOrder: met à jour + updatedAt', () => {
      const chapter = new Chapter(makeId(), 'Titre', 'Desc', undefined, 0);

      chapter.updateOrder(2);
      expect(chapter.order).toBe(2);
      expect(chapter.toDTO().updatedAt).toBeInstanceOf(Date);
    });

    it('updateOrder: throw si invalide', () => {
      const chapter = new Chapter(makeId(), 'Titre', 'Desc', undefined, 0);

      expect(() => chapter.updateOrder(-1)).toThrow("L'ordre doit être un entier positif ou zéro");
      expect(() => chapter.updateOrder(1.2)).toThrow("L'ordre doit être un entier positif ou zéro");
    });

    it('updateMedia + removeMedia', () => {
      const chapter = new Chapter(makeId(), 'Titre', 'Desc', undefined, 0);

      const media = makeMedia();
      chapter.updateMedia('media-99', media as any);

      expect(chapter.mediaId).toBe('media-99');
      expect(chapter.media).toBe(media as any);

      chapter.removeMedia();
      expect(chapter.mediaId).toBeUndefined();
      expect(chapter.media).toBeUndefined();
    });
  });

  describe('toDTO(mediaBaseUrl)', () => {
    it('inclut media si media existe ET baseUrl fournie', () => {
      const media = makeMedia();
      const chapter = new Chapter(makeId(), 'Titre', 'Desc', 'media-1', 0, media as any);

      const dto = chapter.toDTO('https://cdn.example.com');
      expect(media.toDTO).toHaveBeenCalledTimes(1);
      expect(media.toDTO).toHaveBeenCalledWith('https://cdn.example.com');
      expect(dto.media).toEqual({ id: 'm1', url: 'http://x' });
    });

    it('n’inclut pas media si baseUrl manquante ou media manquant', () => {
      const media = makeMedia();
      const c1 = new Chapter(makeId(), 'Titre', 'Desc', 'media-1', 0, media as any);

      const dto1 = c1.toDTO(undefined);
      expect(dto1.media).toBeUndefined();

      const c2 = new Chapter(makeId(), 'Titre', 'Desc', 'media-1', 0, undefined);
      const dto2 = c2.toDTO('https://cdn.example.com');
      expect(dto2.media).toBeUndefined();
    });
  });
});
