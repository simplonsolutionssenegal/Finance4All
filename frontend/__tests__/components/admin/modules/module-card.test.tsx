
import '@testing-library/jest-dom';

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ModuleCard from '@/components/admin/modules/module-card';
import { DifficultyLevel, ModuleStatus, type Module } from '@/types/modules/module';

// ✅ Mock Next.js Image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} data-testid='module-image' />;
  };
});

// ✅ Mock Next.js Link
jest.mock('next/link', () => {
  return ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

// ✅ Mock lucide-react
jest.mock('lucide-react', () => ({
  FileText: (props: any) => <svg data-testid='file-text-icon' {...props} />,
  HelpCircle: (props: any) => <svg data-testid='help-circle-icon' {...props} />,
  Clock: (props: any) => <svg data-testid='clock-icon' {...props} />,
  Check: (props: any) => <svg data-testid='check-icon' {...props} />,
}));

// ✅ Mock constants
jest.mock('@/lib/constants/module-constants', () => ({
  DIFFICULTY_LABELS: {
    BEGINNER: 'Débutant',
    INTERMEDIATE: 'Intermédiaire',
    ADVANCED: 'Avancé',
    EXPERT: 'Expert',
  },
  DIFFICULTY_COLORS: {
    BEGINNER: 'bg-green-100 text-green-700',
    INTERMEDIATE: 'bg-blue-100 text-blue-700',
    ADVANCED: 'bg-orange-100 text-orange-700',
    EXPERT: 'bg-red-100 text-red-700',
  },
  THEMATIC_LABELS: {
    FINANCIAL_EDUCATION: 'Éducation financière',
    PERSONAL_DEVELOPMENT: 'Développement personnel',
    INVESTMENT: 'Investissement',
  },
  THEMATIC_ICONS: {
    FINANCIAL_EDUCATION: '📚',
    PERSONAL_DEVELOPMENT: '🚀',
    INVESTMENT: '💰',
  },
}));

// Type étendu pour les tests incluant les propriétés supplémentaires
type ModuleWithExtras = Module & {
  imageMediaId?: string | null;
  lessonsCount?: number;
  lessons?: Array<{ id: string }>;
  quizzesCount?: number;
  quizzes?: Array<{ id: string }>;
  durationMinutes?: number | string;
};

const createModule = (overrides: Partial<ModuleWithExtras> = {}): ModuleWithExtras => ({
  id: '1',
  title: 'Module de Finance Personnelle',
  description:
    'Apprenez les bases de la gestion financière personnelle avec ce module complet et interactif.',
  thematics: 'Finance de base' as any,
  estimatedDuration: 60,
  status: ModuleStatus.PUBLISHED,
  difficultyLevel: DifficultyLevel.BEGINNER,
  imageMediaId: 'media-123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('ModuleCard', () => {
  it('ne rend rien si aucune thématique n’est présente', () => {
    const { container } = render(<ModuleCard module={createModule({ thematics: '' as any })} />);

  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('affiche le titre, description, badges, stats', () => {
    render(<ModuleCard module={mockModule} />);

    expect(screen.getByText(mockModule.title)).toBeInTheDocument();
    expect(screen.getByText(/Apprenez les bases/)).toBeInTheDocument();

    // thematic label + difficulty label
    expect(screen.getByText('Éducation financière')).toBeInTheDocument();

    const difficultyBadge = screen.getByText('Débutant');
    expect(difficultyBadge).toHaveClass('bg-green-100', 'text-green-700');

    // status
    expect(screen.getByText(ModuleStatus.PUBLISHED)).toBeInTheDocument();

    // stats duration appears 3 times
    expect(screen.getAllByText('90')).toHaveLength(3);
    expect(screen.getByText('Leçons')).toBeInTheDocument();
    expect(screen.getByText('Quiz')).toBeInTheDocument();
    expect(screen.getByText('Inscrits')).toBeInTheDocument();
  });

  it("affiche l'image si imageUrl fourni", () => {
    render(<ModuleCard module={mockModule} />);
    const img = screen.getByTestId('module-image');
    expect(img).toHaveAttribute('src', mockModule.imageUrl);
    expect(img).toHaveAttribute('alt', mockModule.title);
  });

  it("affiche l'icône si imageUrl absent", () => {
    render(<ModuleCard module={{ ...mockModule, imageUrl: undefined }} />);
    expect(screen.getByText('📚')).toBeInTheDocument();
  });

  it('ouvre le menu au clic sur le bouton 3 points et affiche les items', async () => {
    const user = userEvent.setup();
    render(<ModuleCard module={mockModule} />);

    const menuBtn = screen.getByRole('button');
    await user.click(menuBtn);

    expect(screen.getByText('Voir les détails')).toBeInTheDocument();
    expect(screen.getByText('Modifier')).toBeInTheDocument();
    expect(screen.getByText('Archiver')).toBeInTheDocument();
    expect(screen.getByText('Supprimer')).toBeInTheDocument();

    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
    expect(screen.getByTestId('archive-icon')).toBeInTheDocument();
    expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
  });

  it('click sur "Voir les détails" ferme le menu et a le bon href (pas de console.log ici)', async () => {
    const user = userEvent.setup();
    render(<ModuleCard module={mockModule} />);

    await user.click(screen.getByRole('button')); // open

    const link = screen.getByText('Voir les détails').closest('a');
    expect(link).toHaveAttribute('href', `/modules/${mockModule.id}`);

    await user.click(screen.getByText('Voir les détails'));

    // menu fermé
    expect(screen.queryByText('Voir les détails')).not.toBeInTheDocument();

    // ✅ aucune action loggée pour "voir"
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('click "Modifier" log action et ferme le menu', async () => {
    const user = userEvent.setup();
    render(<ModuleCard module={mockModule} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Modifier'));

    expect(consoleLogSpy).toHaveBeenCalledWith('Action: modifier sur module 1');
    expect(screen.queryByText('Modifier')).not.toBeInTheDocument();
  });

  it('click "Archiver" log action et ferme le menu', async () => {
    const user = userEvent.setup();
    render(<ModuleCard module={mockModule} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Archiver'));

    expect(consoleLogSpy).toHaveBeenCalledWith('Action: archiver sur module 1');
    expect(screen.queryByText('Archiver')).not.toBeInTheDocument();
  });

  it('click "Supprimer" log action et ferme le menu', async () => {
    const user = userEvent.setup();
    render(<ModuleCard module={mockModule} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Supprimer'));

    expect(consoleLogSpy).toHaveBeenCalledWith('Action: supprimer sur module 1');
    expect(screen.queryByText('Supprimer')).not.toBeInTheDocument();
  });

  it('ferme le menu quand on clique en dehors', async () => {
    render(<ModuleCard module={mockModule} />);

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Voir les détails')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText('Voir les détails')).not.toBeInTheDocument();
    });
  });

  it('couvre les variations thematics + difficulty', () => {
    render(
      <>
        <ModuleCard module={{ ...mockModule, thematics: [Thematic.INVESTMENT] }} />
        <ModuleCard module={{ ...mockModule, difficultyLevel: DifficultyLevel.INTERMEDIATE }} />
        <ModuleCard module={{ ...mockModule, difficultyLevel: DifficultyLevel.ADVANCED }} />
        <ModuleCard module={{ ...mockModule, difficultyLevel: DifficultyLevel.EXPERT }} />
      </>
    );

    expect(screen.getByText('Investissement')).toBeInTheDocument();
    expect(screen.getByText('Intermédiaire')).toHaveClass('bg-blue-100', 'text-blue-700');
    expect(screen.getByText('Avancé')).toHaveClass('bg-orange-100', 'text-orange-700');
    expect(screen.getByText('Expert')).toHaveClass('bg-red-100', 'text-red-700');
  });
});
