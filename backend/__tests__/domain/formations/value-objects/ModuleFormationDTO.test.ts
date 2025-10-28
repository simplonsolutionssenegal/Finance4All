import type {
  CreateModuleDTO,
  ModuleResponseDTO,
} from '@/domain/formations/value-objects/ModuleFormationDTO';
import { Thematic } from '@/domain/formations/value-objects/Thematic';
import { DifficultyLevel, ModuleStatus } from '@/domain/formations/entities/ModuleFormation';

describe('ModuleFormation DTOs', () => {
  it('should allow creating a valid CreateModuleDTO (compile-time check)', () => {
    // This object is typed as CreateModuleDTO; if TypeScript compiles the test, the shape is valid.
    const dto: CreateModuleDTO = {
      title: 'Introduction aux finances',
      description: 'Description du module',
      thematics: [Thematic.FINANCIAL_EDUCATION, Thematic.BUDGET_MANAGEMENT],
      imageUrl: 'https://example.com/image.jpg',
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
    };

    // Runtime assertions to ensure shape at runtime as well
    expect(typeof dto.title).toBe('string');
    expect(typeof dto.description).toBe('string');
    expect(Array.isArray(dto.thematics)).toBe(true);
    expect(typeof dto.estimatedDuration).toBe('number');
    expect(['string', 'object']).toContain(typeof dto.imageUrl); // can be string or null (typeof null === 'object')
  });

  it('should allow creating a valid ModuleResponseDTO (compile-time check and runtime assertions)', () => {
    const response: ModuleResponseDTO = {
      id: 'module-123',
      title: 'Titre',
      description: 'Desc',
      imageUrl: null,
      thematics: [Thematic.INVESTMENT],
      difficultyLevel: DifficultyLevel.ADVANCED,
      estimatedDuration: 120,
      status: ModuleStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Runtime assertions
    expect(typeof response.id).toBe('string');
    expect(typeof response.title).toBe('string');
    expect(typeof response.description).toBe('string');
    expect(Array.isArray(response.thematics)).toBe(true);
    expect(typeof response.estimatedDuration).toBe('number');
    expect(response.createdAt).toBeInstanceOf(Date);
    expect(response.updatedAt).toBeInstanceOf(Date);

    // status should be one of ModuleStatus values
    const allowedStatuses = [ModuleStatus.DRAFT, ModuleStatus.PUBLISHED, ModuleStatus.ARCHIVED];
    expect(allowedStatuses).toContain(response.status);
  });

  it('should accept imageUrl as null or string', () => {
    const dtoNull: CreateModuleDTO = {
      title: 't',
      description: 'd',
      thematics: [Thematic.SAVING],
      imageUrl: null,
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      estimatedDuration: 30,
    };

    const dtoString: CreateModuleDTO = {
      ...dtoNull,
      imageUrl: 'https://ok',
    };

    expect(dtoNull.imageUrl).toBeNull();
    expect(typeof dtoString.imageUrl).toBe('string');
  });
});
