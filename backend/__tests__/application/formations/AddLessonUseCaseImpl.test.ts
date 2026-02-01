import { AddLessonUseCaseImpl } from '@/application/formations/use-cases/AddLessonUseCaseImpl';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { LessonStatus } from '@/domain/formations/entities/Lesson';
import { Chapter } from '@/domain/formations/entities/Chapter';
import { EntityId } from '@/domain/shared/EntityId';

describe('AddLessonUseCaseImpl', () => {
  const moduleId = 'module-123';

  const makeRepo = () => ({
    findById: jest.fn(),
    update: jest.fn(),
  });

  const makeModule = (dto: any = { id: moduleId }) => ({
    addLesson: jest.fn(),
    toDTO: jest.fn().mockReturnValue(dto),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throw NotFoundError si module non trouvé', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValueOnce(null);

    const uc = new AddLessonUseCaseImpl(repo as any);

    await expect(
      uc.execute({
        moduleId,
        title: 'T',
        description: 'D',
        duration: 10,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
      } as any)
    ).rejects.toThrow(new NotFoundError(`Module ${moduleId} not found`));

    expect(repo.findById).toHaveBeenCalledTimes(1);
    expect(repo.findById).toHaveBeenCalledWith(moduleId);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('crée une lesson même si chapters est undefined, update le module, puis retourne refreshed.toDTO()', async () => {
    const repo = makeRepo();
    const existingModule = makeModule({ id: moduleId, ok: 'before' });
    const refreshedModule = makeModule({ id: moduleId, ok: 'after' });

    repo.findById.mockResolvedValueOnce(existingModule).mockResolvedValueOnce(refreshedModule);
    repo.update.mockResolvedValueOnce(undefined);

    const uc = new AddLessonUseCaseImpl(repo as any);

    const result = await uc.execute({
      moduleId,
      title: 'Ma leçon',
      description: 'Desc',
      duration: 30,
      order: 1,
      status: LessonStatus.DRAFT,
      chapters: undefined, // ✅ branche (command.chapters ?? [])
    } as any);

    expect(repo.findById).toHaveBeenCalledTimes(2);
    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith(existingModule);

    expect(existingModule.addLesson).toHaveBeenCalledTimes(1);
    const lessonArg = existingModule.addLesson.mock.calls[0][0];

    expect(lessonArg.moduleId).toBe(moduleId);
    expect(lessonArg.title).toBe('Ma leçon');
    expect(lessonArg.description).toBe('Desc');
    expect(lessonArg.duration).toBe(30);
    expect(lessonArg.order).toBe(1);
    expect(lessonArg.status).toBe(LessonStatus.DRAFT);
    expect(lessonArg.chapters).toHaveLength(0);

    expect(result).toEqual({ id: moduleId, ok: 'after' });
    expect(refreshedModule.toDTO).toHaveBeenCalledTimes(1);
  });

  it('mappe les chapitres (id present/absent, quizId present/absent, mediaId null/string) et appelle update', async () => {
    const repo = makeRepo();
    const existingModule = makeModule({ id: moduleId, ok: 'before' });
    const refreshedModule = makeModule({ id: moduleId, ok: 'after' });

    repo.findById.mockResolvedValueOnce(existingModule).mockResolvedValueOnce(refreshedModule);
    repo.update.mockResolvedValueOnce(undefined);

    const uc = new AddLessonUseCaseImpl(repo as any);

    // ✅ id garanti valide selon ton regex
    const validChapterId = EntityId.generate().getValue();

    const result = await uc.execute({
      moduleId,
      title: 'Leçon chapitres',
      description: 'Avec chapitres',
      duration: 20,
      order: 2,
      status: LessonStatus.DRAFT,
      chapters: [
        {
          id: validChapterId, // ✅ branche dto.id ? EntityId.from(dto.id)
          title: 'C1',
          description: 'D1',
          mediaId: null, // ✅ branche dto.mediaId ?? undefined => undefined
          order: 0,
          quizId: 'quiz-1', // ✅ branche if(dto.quizId)
        },
        {
          // ✅ branche sans dto.id => EntityId.generate()
          title: 'C2',
          description: 'D2',
          mediaId: 'media-2', // ✅ string
          order: 1,
        },
      ],
    } as any);

    expect(existingModule.addLesson).toHaveBeenCalledTimes(1);
    const lessonArg = existingModule.addLesson.mock.calls[0][0];

    expect(lessonArg.title).toBe('Leçon chapitres');
    expect(lessonArg.chapters).toHaveLength(2);

    // Vérif mapping via DTO (plus stable)
    const lessonDto = lessonArg.toDTO();
    expect(lessonDto.chapters).toHaveLength(2);

    // chapitre 1: mediaId null => undefined/absent
    expect(lessonDto.chapters[0]).toEqual(
      expect.objectContaining({
        title: 'C1',
        description: 'D1',
        order: 0,
      })
    );
    expect((lessonDto.chapters[0] as any).mediaId ?? undefined).toBeUndefined();

    // chapitre 2: mediaId string
    expect(lessonDto.chapters[1]).toEqual(
      expect.objectContaining({
        title: 'C2',
        description: 'D2',
        order: 1,
      })
    );
    expect((lessonDto.chapters[1] as any).mediaId).toBe('media-2');

    expect(repo.update).toHaveBeenCalledWith(existingModule);
    expect(result).toEqual({ id: moduleId, ok: 'after' });
  });

  it('throw NotFoundError si module introuvable après update', async () => {
    const repo = makeRepo();
    const existingModule = makeModule({ id: moduleId });

    repo.findById.mockResolvedValueOnce(existingModule).mockResolvedValueOnce(null); // après update => introuvable
    repo.update.mockResolvedValueOnce(undefined);

    const uc = new AddLessonUseCaseImpl(repo as any);

    await expect(
      uc.execute({
        moduleId,
        title: 'T',
        description: 'D',
        duration: 10,
        order: 0,
        status: LessonStatus.DRAFT,
        chapters: [],
      } as any)
    ).rejects.toThrow(new NotFoundError(`Module ${moduleId} not found after update`));

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.findById).toHaveBeenCalledTimes(2);
  });

  it('couvre la méthode privée mapChapter (id présent / absent)', () => {
    const repo = makeRepo();
    const uc = new AddLessonUseCaseImpl(repo as any);

    const validId = EntityId.generate().getValue();

    // id présent => EntityId.from(validId)
    const chapter1 = (uc as any).mapChapter({
      id: validId,
      title: 'T1',
      description: 'D1',
      mediaId: 'm1',
      order: 0,
    });
    expect(chapter1).toBeInstanceOf(Chapter);

    // id absent => EntityId.generate()
    const chapter2 = (uc as any).mapChapter({
      title: 'T2',
      description: 'D2',
      mediaId: 'm2',
      order: 1,
    });
    expect(chapter2).toBeInstanceOf(Chapter);
  });
});
