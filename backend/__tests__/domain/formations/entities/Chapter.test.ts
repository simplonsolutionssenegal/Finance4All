import { Chapter } from '@/domain/formations/entities/Chapter';

describe('Chapter (entity) — 100% coverage', () => {
  it('should create a valid chapter and map to DTO', () => {
    const chapter = new Chapter('Titre', 'Description', 'media-1', 2);

    expect(chapter.title).toBe('Titre');
    expect(chapter.description).toBe('Description');
    expect(chapter.mediaId).toBe('media-1');
    expect(chapter.order).toBe(2);

    expect(chapter.toDTO()).toEqual({
      title: 'Titre',
      description: 'Description',
      mediaId: 'media-1',
      order: 2,
    });
  });

  it('should throw when title is empty', () => {
    expect(() => new Chapter('', 'Description', 'media-1', 0)).toThrow(
      'Le titre du chapitre ne peut pas être vide'
    );
  });

  it('should throw when title is too long (> 200)', () => {
    expect(() => new Chapter('a'.repeat(201), 'Description', 'media-1', 0)).toThrow(
      'Le titre du chapitre ne peut pas dépasser 200 caractères'
    );
  });

  it('should throw when description is empty', () => {
    expect(() => new Chapter('Titre', '', 'media-1', 0)).toThrow(
      'La description du chapitre ne peut pas être vide'
    );
  });

  it('should throw when mediaId is empty', () => {
    expect(() => new Chapter('Titre', 'Description', '', 0)).toThrow(
      'Le mediaId ne peut pas être vide'
    );
  });

  it('should throw when order is negative', () => {
    expect(() => new Chapter('Titre', 'Description', 'media-1', -1)).toThrow(
      "L'ordre doit être un entier positif ou zéro"
    );
  });

  it('should throw when order is not an integer', () => {
    expect(() => new Chapter('Titre', 'Description', 'media-1', 1.2)).toThrow(
      "L'ordre doit être un entier positif ou zéro"
    );
  });
});
