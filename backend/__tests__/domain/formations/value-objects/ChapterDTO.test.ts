import type { ChapterDTO } from '@/domain/formations/value-objects/ChapterDTO';

describe('ChapterDTO', () => {
  it('should accept a valid ChapterDTO (compile-time) and basic runtime checks', () => {
    const dto: ChapterDTO = {
      title: 'Chapitre 1',
      description: 'Description',
      mediaId: 'media-1',
      order: 0,
    };

    expect(typeof dto.title).toBe('string');
    expect(typeof dto.description).toBe('string');
    expect(typeof dto.mediaId).toBe('string');
    expect(typeof dto.order).toBe('number');
  });
});
