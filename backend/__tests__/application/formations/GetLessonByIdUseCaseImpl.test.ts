import { GetLessonByIdUseCaseImpl } from '@/application/formations/use-cases/GetLessonByIdUseCaseImpl';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { LessonStatus } from '@/domain/formations/entities/Lesson';
import type { LessonDTO } from '@/domain/formations/value-objects/LessonDTO';

describe('GetLessonByIdUseCaseImpl', () => {
  const makeRepo = () => ({
    findById: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundError if lesson does not exist', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValueOnce(null);

    const uc = new GetLessonByIdUseCaseImpl(repo as any);

    await expect(uc.execute({ id: 'lesson-404' })).rejects.toThrow(
      new NotFoundError('lesson with id lesson-404 not found')
    );

    expect(repo.findById).toHaveBeenCalledTimes(1);
    expect(repo.findById).toHaveBeenCalledWith('lesson-404');
  });

  it('should return lesson.toDTO() when lesson exists', async () => {
    const repo = makeRepo();

    const dto: LessonDTO = {
      id: 'lesson-1',
      moduleId: 'module-1',
      title: 'Leçon 1',
      description: 'Desc',
      duration: 10,
      order: 0,
      status: LessonStatus.DRAFT,
      chapters: [],
      quizzes: [],
      chaptersCount: 0,
    };

    const lesson = {
      toDTO: jest.fn().mockReturnValue(dto),
    };

    repo.findById.mockResolvedValueOnce(lesson);

    const uc = new GetLessonByIdUseCaseImpl(repo as any);

    const result = await uc.execute({ id: 'lesson-1' });

    expect(repo.findById).toHaveBeenCalledTimes(1);
    expect(repo.findById).toHaveBeenCalledWith('lesson-1');

    expect(lesson.toDTO).toHaveBeenCalledTimes(1);
    expect(result).toEqual(dto);
  });
});
