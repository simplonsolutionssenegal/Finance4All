import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import { Thematic } from '@/domain/formations/value-objects/Thematic';
import { DifficultyLevel, ModuleStatus } from '@/domain/formations/entities/ModuleFormation';

describe('ModuleFormation DTOs', () => {
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
    const dtoNull: ModuleResponseDTO = {
      id: 'module-456',
      title: 't',
      description: 'd',
      thematics: [Thematic.SAVING],
      imageUrl: null,
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      estimatedDuration: 30,
      status: ModuleStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const dtoString: ModuleResponseDTO = {
      ...dtoNull,
      id: 'module-789',
      imageUrl: 'https://ok',
    };

    expect(dtoNull.imageUrl).toBeNull();
    expect(typeof dtoString.imageUrl).toBe('string');
  });

  it('should include all required fields for ModuleResponseDTO', () => {
    const response: ModuleResponseDTO = {
      id: 'module-001',
      title: 'Introduction aux finances',
      description: 'Description du module',
      thematics: [Thematic.FINANCIAL_EDUCATION, Thematic.BUDGET_MANAGEMENT],
      imageUrl: 'https://example.com/image.jpg',
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      status: ModuleStatus.PUBLISHED,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    expect(response.id).toBe('module-001');
    expect(response.title).toBe('Introduction aux finances');
    expect(response.thematics).toHaveLength(2);
    expect(response.difficultyLevel).toBe(DifficultyLevel.BEGINNER);
    expect(response.status).toBe(ModuleStatus.PUBLISHED);
  });
});
