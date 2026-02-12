import { CreateModuleFormationUseCaseImpl } from '@/application/formations/use-cases/CreateModuleFormationUseCaseImpl';
import type { CreateModuleUseCommand } from '@/domain/formations/ports/in/CreateModuleUseCase';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import {
  DifficultyLevel,
  Module,
  ModuleStatus,
} from '@/domain/formations/entities/ModuleFormation';
import { EntityId } from '@/domain/shared/EntityId';
import {
  DuplicateThematicException,
  DuplicateTitleException,
} from '@/domain/shared/exceptions/FormationDomainException';

describe('CreateModuleFormationUseCaseImpl', () => {
  let useCase: CreateModuleFormationUseCaseImpl;
  let repo: jest.Mocked<ModuleRepository>;
  let entityIdSpy: jest.SpyInstance;

  const generatedId = EntityId.from('550e8400-e29b-41d4-a716-446655440000');

  const input: CreateModuleUseCommand = {
    title: 'Introduction aux Finances',
    description: "Module d'introduction aux concepts financiers de base",
    thematics: 'Finance et Comptabilite',
    imageMediaId: 'img-1',
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: 60,
    status: ModuleStatus.DRAFT,
  };

  beforeEach(() => {
    repo = {
      save: jest.fn(),
      findByTitle: jest.fn(),
      findByThematic: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      findByTitleExceptId: jest.fn(),
      findByThematicExceptId: jest.fn(),
    };

    useCase = new CreateModuleFormationUseCaseImpl(repo);
    entityIdSpy = jest.spyOn(EntityId, 'generate').mockReturnValue(generatedId);
  });

  afterEach(() => {
    entityIdSpy.mockRestore();
  });

  it('cree un module avec thematique normalisee', async () => {
    repo.findByTitle.mockResolvedValue(null);
    repo.findByThematic.mockResolvedValue(null);

    const saved = new Module({
      id: generatedId,
      title: input.title,
      description: input.description,
      imageMediaId: input.imageMediaId,
      thematics: 'finance et comptabilite',
      difficultyLevel: input.difficultyLevel,
      estimatedDuration: input.estimatedDuration,
      status: ModuleStatus.DRAFT,
      lessons: [],
      quizzes: [],
    });

    repo.save.mockResolvedValue(saved);

    const result = await useCase.execute(input);

    expect(repo.findByThematic).toHaveBeenCalledWith('finance et comptabilite');
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual(saved.toDTO());
  });

  it('force le statut DRAFT a la creation', async () => {
    repo.findByTitle.mockResolvedValue(null);
    repo.findByThematic.mockResolvedValue(null);

    const saved = new Module({
      id: generatedId,
      title: input.title,
      description: input.description,
      imageMediaId: input.imageMediaId,
      thematics: 'finance et comptabilite',
      difficultyLevel: input.difficultyLevel,
      estimatedDuration: input.estimatedDuration,
      status: ModuleStatus.DRAFT,
      lessons: [],
      quizzes: [],
    });
    repo.save.mockResolvedValue(saved);

    await useCase.execute({ ...input, status: ModuleStatus.PUBLISHED });

    const arg = repo.save.mock.calls[0][0];
    expect(arg.status).toBe(ModuleStatus.DRAFT);
  });

  it('leve DuplicateTitleException si titre existe', async () => {
    const existing = new Module({
      id: EntityId.generate(),
      title: input.title,
      description: 'x',
      imageMediaId: null,
      thematics: 'autre',
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 10,
      status: ModuleStatus.DRAFT,
      lessons: [],
      quizzes: [],
    });

    repo.findByTitle.mockResolvedValue(existing);

    await expect(useCase.execute(input)).rejects.toThrow(DuplicateTitleException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('leve DuplicateThematicException si thematique existe', async () => {
    const existing = new Module({
      id: EntityId.generate(),
      title: 'Autre titre',
      description: 'x',
      imageMediaId: null,
      thematics: 'finance et comptabilite',
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 10,
      status: ModuleStatus.DRAFT,
      lessons: [],
      quizzes: [],
    });

    repo.findByTitle.mockResolvedValue(null);
    repo.findByThematic.mockResolvedValue(existing);

    await expect(useCase.execute(input)).rejects.toThrow(DuplicateThematicException);
    expect(repo.save).not.toHaveBeenCalled();
  });
});
