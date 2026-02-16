import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { ModuleCard } from '@/components/learning/module-card';
import { type LearningModule, UserModuleStatus } from '@/types/learning-module';
import { DifficultyLevel, ModuleStatus } from '@/types/modules/module';

jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ src, alt, fill, className, ...props }: any) {
    return (
      <div
        data-testid='module-image'
        data-src={src}
        data-alt={alt}
        data-fill={fill}
        className={className}
        {...props}
      />
    );
  },
}));

jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return (
      <a href={href} data-testid='module-link' {...props}>
        {children}
      </a>
    );
  };
});

jest.mock('lucide-react', () => ({
  BookOpen: (props: any) => <svg data-testid='book-open-icon' {...props} />,
  Clock: (props: any) => <svg data-testid='clock-icon' {...props} />,
  Lock: (props: any) => <svg data-testid='lock-icon' {...props} />,
  CheckCircle2: (props: any) => <svg data-testid='check-circle-icon' {...props} />,
}));

jest.mock('@/hooks/module/media/useMedia', () => ({
  useMediaUrl: jest.fn((mediaId: string | null | undefined) => ({
    url: mediaId ? `https://example.com/media/${mediaId}` : null,
    isLoading: false,
    error: null,
  })),
}));

const createModule = (overrides: Partial<LearningModule> = {}): LearningModule => ({
  id: 'mod-1',
  title: 'Module de Finance Personnelle',
  description: 'Apprenez les bases de la gestion financière personnelle.',
  difficultyLevel: DifficultyLevel.BEGINNER,
  estimatedDuration: 60,
  status: ModuleStatus.PUBLISHED,
  imageMediaId: 'media-123',
  lessonCount: 8,
  userStatus: UserModuleStatus.AVAILABLE,
  progressPercent: 0,
  ...overrides,
});

describe('ModuleCard (learning)', () => {
  it('affiche le titre et la description', () => {
    render(<ModuleCard module={createModule()} />);

    expect(screen.getByText('Module de Finance Personnelle')).toBeInTheDocument();
    expect(
      screen.getByText(/Apprenez les bases de la gestion financière personnelle/)
    ).toBeInTheDocument();
  });

  it("affiche l'image et le lien vers le module quand imageMediaId est défini", () => {
    render(<ModuleCard module={createModule({ imageMediaId: 'media-456' })} />);

    const image = screen.getByTestId('module-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('data-src', 'https://example.com/media/media-456');

    const link = screen.getByTestId('module-link');
    expect(link).toHaveAttribute('href', '/learning/mod-1');
  });

  it('affiche le badge difficulté Débutant pour BEGINNER', () => {
    render(<ModuleCard module={createModule({ difficultyLevel: DifficultyLevel.BEGINNER })} />);

    expect(screen.getByText('Débutant')).toBeInTheDocument();
  });

  it('affiche le badge difficulté Intermédiaire pour INTERMEDIATE', () => {
    render(<ModuleCard module={createModule({ difficultyLevel: DifficultyLevel.INTERMEDIATE })} />);

    expect(screen.getByText('Intermédiaire')).toBeInTheDocument();
  });

  it('affiche la section Progression et le pourcentage quand le module n’est pas verrouillé', () => {
    render(
      <ModuleCard
        module={createModule({ userStatus: UserModuleStatus.IN_PROGRESS, progressPercent: 42 })}
      />
    );

    expect(screen.getByText('Progression')).toBeInTheDocument();
    expect(screen.getAllByText('42%').length).toBeGreaterThanOrEqual(1);
  });

  it('affiche l’overlay complété (CheckCircle2) quand userStatus est COMPLETED', () => {
    render(<ModuleCard module={createModule({ userStatus: UserModuleStatus.COMPLETED })} />);

    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
  });

  it('affiche l’overlay cadenas quand userStatus est LOCKED', () => {
    render(<ModuleCard module={createModule({ userStatus: UserModuleStatus.LOCKED })} />);

    expect(screen.getAllByTestId('lock-icon').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Terminez les modules précédents pour débloquer/)).toBeInTheDocument();
  });

  it('affiche l’overlay progression en % quand userStatus est IN_PROGRESS', () => {
    render(
      <ModuleCard
        module={createModule({ userStatus: UserModuleStatus.IN_PROGRESS, progressPercent: 75 })}
      />
    );

    expect(screen.getAllByText('75%').length).toBeGreaterThanOrEqual(1);
  });

  it('affiche le nombre de leçons et la durée estimée', () => {
    render(<ModuleCard module={createModule({ lessonCount: 12, estimatedDuration: 90 })} />);

    expect(screen.getByText('12 leçons')).toBeInTheDocument();
    expect(screen.getByText('90 min')).toBeInTheDocument();
  });

  it('affiche le badge thématique quand thematic est défini', () => {
    render(<ModuleCard module={createModule({ thematic: 'Finance de base' })} />);

    expect(screen.getByText('Finance de base')).toBeInTheDocument();
  });

  it('n’affiche pas le badge thématique quand thematic est absent', () => {
    render(<ModuleCard module={createModule()} />);

    expect(screen.queryByText('Finance de base')).not.toBeInTheDocument();
  });

  it('rend les icônes BookOpen et Clock dans la meta', () => {
    render(<ModuleCard module={createModule()} />);

    expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
  });
});
