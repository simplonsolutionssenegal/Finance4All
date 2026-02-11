/**
 * @jest-environment node
 */

import type { ChapterDTO } from '@/domain/formations/value-objects/ChapterDTO';

describe('ChapterDTO (runtime shape test)', () => {
  it('should allow creating an object that matches the ChapterDTO structure', () => {
    const now = new Date('2026-02-02T00:00:00.000Z');

    const dto: ChapterDTO = {
      id: 'chapter-1',
      title: 'Chapitre 1',
      description: 'Description',
      order: 0,
      createdAt: now,
      updatedAt: now,

      // optionnels
      mediaId: 'media-1',
      media: undefined,
      quizzes: [],
    };

    // assertions runtime (sur l'objet, pas sur le type)
    expect(dto.id).toBe('chapter-1');
    expect(dto.title).toBe('Chapitre 1');
    expect(dto.description).toBe('Description');
    expect(dto.order).toBe(0);

    expect(dto.createdAt).toBeInstanceOf(Date);
    expect(dto.updatedAt).toBeInstanceOf(Date);

    // optionnels
    expect(dto.mediaId).toBe('media-1');
    expect(dto.media).toBeUndefined();
    expect(Array.isArray(dto.quizzes)).toBe(true);
    expect(dto.quizzes).toHaveLength(0);
  });

  it('should allow omitting optional fields', () => {
    const now = new Date('2026-02-02T00:00:00.000Z');

    const dto: ChapterDTO = {
      id: 'chapter-2',
      title: 'Chapitre 2',
      description: 'Description 2',
      order: 1,
      createdAt: now,
      updatedAt: now,
      // ✅ mediaId/media/quizzes omis
    };

    expect(dto.mediaId).toBeUndefined();
    expect(dto.media).toBeUndefined();
    expect(dto.quizzes).toBeUndefined();
  });
});
