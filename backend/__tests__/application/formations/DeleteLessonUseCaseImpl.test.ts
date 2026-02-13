import { DeleteLessonUseCaseImpl } from '@/application/formations/use-cases/DeleteLessonUseCaseImpl';
import type { LessonRepository } from '@/domain/formations/ports/out/LessonRepository';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { EntityId } from '@/domain/shared/EntityId';
import { Lesson, LessonStatus } from '@/domain/formations/entities/Lesson';

describe('DeleteLessonUseCaseImpl', () => {
  let useCase: DeleteLessonUseCaseImpl;
  let mockLessonRepository: jest.Mocked<LessonRepository>;

  const lessonId = '123e4567-e89b-12d3-a456-426614174030';

  beforeEach(() => {
    mockLessonRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new DeleteLessonUseCaseImpl(mockLessonRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundError if lesson does not exist', async () => {
    mockLessonRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(lessonId)).rejects.toThrow(NotFoundError);
    await expect(useCase.execute(lessonId)).rejects.toThrow(`Lesson with id ${lessonId} not found`);

    expect(mockLessonRepository.delete).not.toHaveBeenCalled();
  });

  it('should delete lesson when found', async () => {
    const lesson = new Lesson({
      id: EntityId.from(lessonId),
      moduleId: '123e4567-e89b-12d3-a456-426614174031',
      title: 'Lesson',
      description: 'Desc',
      duration: 30,
      order: 0,
      status: LessonStatus.DRAFT,
      chapters: [],
      quizzes: [],
    });

    mockLessonRepository.findById.mockResolvedValue(lesson);
    mockLessonRepository.delete.mockResolvedValue();

    await useCase.execute(lessonId);

    expect(mockLessonRepository.delete).toHaveBeenCalledWith(lessonId);
  });
});
