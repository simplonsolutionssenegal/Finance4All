import { PrismaModuleFormationRepository } from '@/infrastructure/persistence/repositories/PrismaModuleFormationRepository';
import { EntityId } from '@/domain/shared/EntityId';
import {
  DifficultyLevel,
  Module,
  ModuleStatus,
} from '@/domain/formations/entities/ModuleFormation';
import type { PrismaClient } from '@prisma/client';

type MockPrisma = Partial<PrismaClient> & { module: any };

describe('PrismaModuleFormationRepository', () => {
  let repository: PrismaModuleFormationRepository;
  let mockPrisma: MockPrisma;

  const moduleId = '11111111-1111-4111-8111-111111111111';

  const makeRow = (overrides: Record<string, unknown> = {}) => ({
    id: moduleId,
    title: 'Module Test',
    description: 'Description Test',
    imageMediaId: null,
    thematics: 'finance',
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: 60,
    status: ModuleStatus.DRAFT,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    lessons: [],
    quizzes: [],
    ...overrides,
  });

  const makeDomainModule = () =>
    Module.create({
      id: EntityId.from(moduleId),
      title: 'Module Test',
      description: 'Description Test',
      imageMediaId: null,
      thematics: 'finance',
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      status: ModuleStatus.DRAFT,
      lessons: [],
      quizzes: [],
    });

  beforeEach(() => {
    mockPrisma = {
      module: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as MockPrisma;

    repository = new PrismaModuleFormationRepository(mockPrisma as unknown as PrismaClient);
  });

  it('save persiste et retourne une entite Module', async () => {
    mockPrisma.module.create.mockResolvedValue(makeRow());

    const saved = await repository.save(makeDomainModule());

    expect(mockPrisma.module.create).toHaveBeenCalled();
    expect(saved).toBeInstanceOf(Module);
    expect(saved.id.getValue()).toBe(moduleId);
  });

  it('findByTitle retourne null quand absent', async () => {
    mockPrisma.module.findFirst.mockResolvedValue(null);

    const found = await repository.findByTitle('introuvable');

    expect(found).toBeNull();
  });

  it('findById retourne un module quand present', async () => {
    mockPrisma.module.findUnique.mockResolvedValue(makeRow());

    const found = await repository.findById(moduleId);

    expect(found).toBeInstanceOf(Module);
    expect(found?.id.getValue()).toBe(moduleId);
  });

  it('findByThematic normalise la valeur', async () => {
    mockPrisma.module.findFirst.mockResolvedValue(
      makeRow({ thematics: 'finance et comptabilite' })
    );

    await repository.findByThematic('  Finance et Comptabilite  ');

    expect(mockPrisma.module.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          thematics: {
            equals: 'finance et comptabilite',
            mode: 'insensitive',
          },
        },
      })
    );
  });

  it('findAll retourne data + pagination', async () => {
    mockPrisma.module.findMany.mockResolvedValue([makeRow()]);
    mockPrisma.module.count.mockResolvedValue(1);

    const result = await repository.findAll({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
  });

  it('update ajoute les nouvelles donnees et retourne un module', async () => {
    const domain = makeDomainModule();

    mockPrisma.module.findUnique.mockResolvedValue(makeRow({ lessons: [], quizzes: [] }));
    mockPrisma.module.update.mockResolvedValue(makeRow({ title: 'Module Test' }));

    const updated = await repository.update(domain);

    expect(mockPrisma.module.update).toHaveBeenCalled();
    expect(updated).toBeInstanceOf(Module);
  });

  it('findByTitleExceptId appelle le filtre NOT id', async () => {
    mockPrisma.module.findFirst.mockResolvedValue(null);

    await repository.findByTitleExceptId('Titre', moduleId);

    expect(mockPrisma.module.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { title: { equals: 'Titre' }, NOT: { id: moduleId } },
      })
    );
  });

  it('findByThematicExceptId retourne null si aucun resultat', async () => {
    mockPrisma.module.findFirst.mockResolvedValue(null);

    const found = await repository.findByThematicExceptId('theme', moduleId);

    expect(found).toBeNull();
  });
});
