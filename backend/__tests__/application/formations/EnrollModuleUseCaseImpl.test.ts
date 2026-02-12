import { EnrollModuleUseCaseImpl } from '@/application/formations/use-cases/EnrollModuleUseCaseImpl';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import type { ModuleEnrollmentRepository } from '@/domain/formations/ports/out/ModuleEnrollmentRepository';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import {
  Module,
  DifficultyLevel,
  ModuleStatus,
} from '@/domain/formations/entities/ModuleFormation';
import { EntityId } from '@/domain/shared/EntityId';

describe('EnrollModuleUseCaseImpl', () => {
  let useCase: EnrollModuleUseCaseImpl;
  let moduleRepository: jest.Mocked<ModuleRepository>;
  let enrollmentRepository: jest.Mocked<ModuleEnrollmentRepository>;

  beforeEach(() => {
    moduleRepository = {
      save: jest.fn(),
      findByTitle: jest.fn(),
      findByThematic: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      findByTitleExceptId: jest.fn(),
      findByThematicExceptId: jest.fn(),
    } as any;

    enrollmentRepository = {
      createIfNotExists: jest.fn(),
      findByUserId: jest.fn(),
    } as any;

    useCase = new EnrollModuleUseCaseImpl(moduleRepository, enrollmentRepository);
  });

  it('should create enrollment when module exists', async () => {
    const module = Module.create({
      id: EntityId.generate(),
      title: 'Module test',
      description: 'Desc',
      imageMediaId: null,
      thematics: 'Finance',
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 30,
      status: ModuleStatus.PUBLISHED,
      lessons: [],
      quizzes: [],
    });

    moduleRepository.findById.mockResolvedValue(module);
    enrollmentRepository.createIfNotExists.mockResolvedValue({
      id: 'enroll-1',
      moduleId: 'module-1',
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute({ moduleId: 'module-1', userId: 'user-1' });

    expect(moduleRepository.findById).toHaveBeenCalledWith('module-1');
    expect(enrollmentRepository.createIfNotExists).toHaveBeenCalledWith({
      moduleId: 'module-1',
      userId: 'user-1',
    });
    expect(result.id).toBe('enroll-1');
  });

  it('should throw NotFoundError when module does not exist', async () => {
    moduleRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ moduleId: 'missing', userId: 'user-1' })).rejects.toThrow(
      NotFoundError
    );
    await expect(useCase.execute({ moduleId: 'missing', userId: 'user-1' })).rejects.toThrow(
      'module with id missing not found'
    );
  });
});
