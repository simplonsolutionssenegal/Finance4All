import type { LessonDTO } from '@/domain/formations/value-objects/LessonDTO';
import { LessonStatus } from '@/domain/formations/entities/Lesson';

describe('LessonDTO', () => {
  it('should accept a valid LessonDTO (compile-time) and runtime checks', () => {
    const dto: LessonDTO = {
      id: 'lesson-1',
      title: 'Leçon 1',
      description: 'Description',
      duration: 30,
      order: 0,
      status: LessonStatus.DRAFT,
      chapters: [
        {
          title: 'Chapitre 1',
          description: 'Desc',
          mediaId: 'media-1',
          order: 0,
        },
      ],
      chaptersCount: 1,
      // createdAt/updatedAt optionnels
    };

    expect(dto.id).toBe('lesson-1');
    expect(dto.status).toBe(LessonStatus.DRAFT);
    expect(Array.isArray(dto.chapters)).toBe(true);
    expect(dto.chaptersCount).toBe(1);
  });

  it('should allow createdAt/updatedAt to be omitted or provided', () => {
    const withoutDates: LessonDTO = {
      id: 'lesson-2',
      title: 'Leçon 2',
      description: 'Description',
      duration: 45,
      order: 1,
      status: LessonStatus.PUBLISHED,
      chapters: [],
      chaptersCount: 0,
    };

    const withDates: LessonDTO = {
      ...withoutDates,
      id: 'lesson-3',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(withoutDates.createdAt).toBeUndefined();
    expect(withDates.createdAt).toBeInstanceOf(Date);
    expect(withDates.updatedAt).toBeInstanceOf(Date);
  });
});
