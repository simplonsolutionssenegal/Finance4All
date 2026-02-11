import type {
  LessonDetailsDTO,
  ChapterWithMediaDTO,
} from '@/domain/formations/value-objects/LessonDetailsDTO';
import { LessonStatus } from '@/domain/formations/entities/Lesson';

describe('LessonDetailsDTO', () => {
  it('should accept a valid LessonDetailsDTO (compile-time) and runtime checks', () => {
    const chapter: ChapterWithMediaDTO = {
      id: 'ch-1',
      title: 'Chapitre 1',
      description: 'Desc',
      mediaId: null, // ✅ peut être null
      media: null, // ✅ peut être null
      order: 0,
      // createdAt/updatedAt optionnels
    };

    const dto: LessonDetailsDTO = {
      id: 'lesson-1',
      moduleId: 'module-1',
      title: 'Leçon 1',
      description: 'Description',
      duration: 30,
      order: 0,
      status: LessonStatus.DRAFT,
      chapters: [chapter],
      chaptersCount: 1,
      // createdAt/updatedAt optionnels
    };

    expect(dto.id).toBe('lesson-1');
    expect(dto.moduleId).toBe('module-1');
    expect(dto.status).toBe(LessonStatus.DRAFT);

    expect(Array.isArray(dto.chapters)).toBe(true);
    expect(dto.chapters).toHaveLength(1);

    expect(dto.chapters[0].id).toBe('ch-1');
    expect(dto.chapters[0].mediaId).toBeNull();
    expect(dto.chapters[0].media).toBeNull();

    expect(dto.chaptersCount).toBe(1);
  });

  it('should allow chapter mediaId/media to be undefined (not provided)', () => {
    const chapter: ChapterWithMediaDTO = {
      id: 'ch-2',
      title: 'Chapitre 2',
      description: 'Desc',
      order: 1,
      // ✅ mediaId/media omis
    };

    expect(chapter.mediaId).toBeUndefined();
    expect(chapter.media).toBeUndefined();
  });

  it('should allow createdAt/updatedAt to be omitted or provided', () => {
    const withoutDates: LessonDetailsDTO = {
      id: 'lesson-2',
      moduleId: 'module-1',
      title: 'Leçon 2',
      description: 'Description',
      duration: 45,
      order: 1,
      status: LessonStatus.PUBLISHED,
      chapters: [],
      chaptersCount: 0,
    };

    const withDates: LessonDetailsDTO = {
      ...withoutDates,
      id: 'lesson-3',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(withoutDates.createdAt).toBeUndefined();
    expect(withDates.createdAt).toBeInstanceOf(Date);
    expect(withDates.updatedAt).toBeInstanceOf(Date);
  });

  it('should allow chapter.media as MediaDTO object (runtime check)', () => {
    // On ne connaît pas encore la shape exacte de MediaDTO dans le test,
    // donc on le met en any (comme tes tests précédents).
    const media = { id: 'm1', url: 'https://cdn.example.com/file.mp4' } as any;

    const chapter: ChapterWithMediaDTO = {
      id: 'ch-3',
      title: 'Chapitre 3',
      description: 'Desc',
      mediaId: 'media-3',
      media,
      order: 2,
    };

    const dto: LessonDetailsDTO = {
      id: 'lesson-4',
      moduleId: 'module-9',
      title: 'Leçon 4',
      description: 'Description',
      duration: 10,
      order: 0,
      status: LessonStatus.DRAFT,
      chapters: [chapter],
      chaptersCount: 1,
    };

    expect(dto.chapters[0].mediaId).toBe('media-3');
    expect(dto.chapters[0].media).toEqual(media);
  });
});
