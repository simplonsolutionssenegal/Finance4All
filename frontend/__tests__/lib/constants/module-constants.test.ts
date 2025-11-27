import {
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  THEMATIC_LABELS,
  THEMATIC_ICONS,
  MODULE_STATUS_LABELS,
  MODULE_STATUS_COLORS,
} from '@/lib/constants/module-constants';
import { DifficultyLevel, ModuleStatus, Thematic } from '@/types/modules/module';

describe('module-constants', () => {
  it('DIFFICULTY_LABELS retourne les bons labels', () => {
    expect(DIFFICULTY_LABELS[DifficultyLevel.BEGINNER]).toBe('Débutant');
    expect(DIFFICULTY_LABELS[DifficultyLevel.INTERMEDIATE]).toBe('Intermédiaire');
    expect(DIFFICULTY_LABELS[DifficultyLevel.ADVANCED]).toBe('Avancé');
    expect(DIFFICULTY_LABELS[DifficultyLevel.EXPERT]).toBe('Expert');
  });

  it('DIFFICULTY_COLORS retourne les bonnes classes', () => {
    expect(DIFFICULTY_COLORS[DifficultyLevel.BEGINNER]).toContain('green');
    expect(DIFFICULTY_COLORS[DifficultyLevel.INTERMEDIATE]).toContain('blue');
    expect(DIFFICULTY_COLORS[DifficultyLevel.ADVANCED]).toContain('orange');
    expect(DIFFICULTY_COLORS[DifficultyLevel.EXPERT]).toContain('red');
  });

  it('THEMATIC_LABELS retourne les bons labels', () => {
    expect(THEMATIC_LABELS[Thematic.FINANCIAL_EDUCATION]).toBe('Éducation financière');
    expect(THEMATIC_LABELS[Thematic.INSURANCE]).toBe('Assurance');
  });

  it('THEMATIC_ICONS retourne les bons emojis', () => {
    expect(THEMATIC_ICONS[Thematic.FINANCIAL_EDUCATION]).toBe('📚');
    expect(THEMATIC_ICONS[Thematic.INSURANCE]).toBe('🛡️');
  });

  it('MODULE_STATUS_LABELS retourne les bons labels', () => {
    expect(MODULE_STATUS_LABELS[ModuleStatus.DRAFT]).toBe('Brouillon');
    expect(MODULE_STATUS_LABELS[ModuleStatus.PUBLISHED]).toBe('Publié');
    expect(MODULE_STATUS_LABELS[ModuleStatus.ARCHIVED]).toBe('Archivé');
  });

  it('MODULE_STATUS_COLORS retourne les bonnes classes', () => {
    expect(MODULE_STATUS_COLORS[ModuleStatus.DRAFT]).toContain('gray');
    expect(MODULE_STATUS_COLORS[ModuleStatus.PUBLISHED]).toContain('green');
    expect(MODULE_STATUS_COLORS[ModuleStatus.ARCHIVED]).toContain('orange');
  });
});
