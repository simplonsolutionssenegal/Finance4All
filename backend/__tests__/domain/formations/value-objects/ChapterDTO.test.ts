import type { ChapterDTO } from '@/domain/formations/value-objects/ChapterDTO';

describe('ChapterDTO', () => {
  it('should accept a valid ChapterDTO (compile-time) and runtime checks', () => {
    const dto: ChapterDTO = {
      id: 'chapter-1',
      title: 'Chapitre 1',
      description: 'Description chapitre',
      order: 0,
      // optionnels
      mediaId: 'media-1',
      quizId: 'quiz-1',
    };

    expect(dto.id).toBe('chapter-1');
    expect(dto.title).toBe('Chapitre 1');
    expect(dto.order).toBe(0);
    expect(dto.mediaId).toBe('media-1');
    expect(dto.quizId).toBe('quiz-1');
  });

  it('should allow optional fields to be omitted', () => {
    const dto: ChapterDTO = {
      id: 'chapter-2',
      title: 'Chapitre 2',
      description: 'Description',
      order: 1,
      // ✅ mediaId / quizId / media / dates omis
    };

    expect(dto.mediaId).toBeUndefined();
    expect(dto.quizId).toBeUndefined();
    expect(dto.media).toBeUndefined();
    expect(dto.createdAt).toBeUndefined();
    expect(dto.updatedAt).toBeUndefined();
  });

  it('should allow createdAt/updatedAt to be provided', () => {
    const dto: ChapterDTO = {
      id: 'chapter-3',
      title: 'Chapitre 3',
      description: 'Description',
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(dto.createdAt).toBeInstanceOf(Date);
    expect(dto.updatedAt).toBeInstanceOf(Date);
  });

  it('should allow media to be provided (as MediaDTO)', () => {
    // On ne connaît pas la shape exacte de MediaDTO ici,
    // donc on le met en any juste pour vérifier que ChapterDTO l’accepte.
    const media = { id: 'm1', url: 'https://cdn.example.com/file.pdf' } as any;

    const dto: ChapterDTO = {
      id: 'chapter-4',
      title: 'Chapitre 4',
      description: 'Description',
      order: 3,
      media,
    };

    expect(dto.media).toEqual(media);
  });
});
