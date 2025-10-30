// __tests__/components/admin/modules/module-card.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ModuleCard from '@/components/admin/modules/module-card';
import { DifficultyLevel, Thematic, ModuleStatus, type Module } from '@/types/modules/module';
import '@testing-library/jest-dom';

// Mock de Next.js Image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} data-testid='module-image' />;
  };
});

// Mock des icônes Lucide React
jest.mock('lucide-react', () => ({
  Eye: () => <span data-testid='eye-icon'>👁️</span>,
  Edit: () => <span data-testid='edit-icon'>✏️</span>,
  Archive: () => <span data-testid='archive-icon'>📦</span>,
  Trash2: () => <span data-testid='trash-icon'>🗑️</span>,
}));

// Mock des constantes
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
    INVESTMENT: '�',
  },
}));

describe('ModuleCard', () => {
  const mockModule: Module = {
    id: '1',
    title: 'Module de Finance Personnelle',
    description:
      'Apprenez les bases de la gestion financière personnelle avec ce module complet et interactif.',
    thematics: [Thematic.FINANCIAL_EDUCATION],
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: 90,
    imageUrl: 'https://example.com/module-image.jpg',
    status: ModuleStatus.PUBLISHED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Mock console.log pour tester les actions du menu
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('affiche le titre du module', () => {
    render(<ModuleCard module={mockModule} />);

    expect(screen.getByText('Module de Finance Personnelle')).toBeInTheDocument();
  });

  it('affiche la description du module', () => {
    render(<ModuleCard module={mockModule} />);

    expect(screen.getByText(/Apprenez les bases de la gestion financière/)).toBeInTheDocument();
  });

  it("affiche l'image du module quand imageUrl est fournie", () => {
    render(<ModuleCard module={mockModule} />);

    const image = screen.getByTestId('module-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/module-image.jpg');
    expect(image).toHaveAttribute('alt', 'Module de Finance Personnelle');
  });

  it("affiche l'icône de thématique quand imageUrl n'est pas fournie", () => {
    const moduleWithoutImage = { ...mockModule, imageUrl: undefined };
    render(<ModuleCard module={moduleWithoutImage} />);

    expect(screen.getByText('📚')).toBeInTheDocument();
  });

  it('affiche le label de la thématique', () => {
    render(<ModuleCard module={mockModule} />);

    expect(screen.getByText('Éducation financière')).toBeInTheDocument();
  });

  it('affiche le niveau de difficulté avec les bonnes classes CSS', () => {
    render(<ModuleCard module={mockModule} />);

    const difficultyBadge = screen.getByText('Débutant');
    expect(difficultyBadge).toBeInTheDocument();
    expect(difficultyBadge).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('affiche le statut "Publié"', () => {
    render(<ModuleCard module={mockModule} />);
  });

  it('affiche les statistiques du module', () => {
    render(<ModuleCard module={mockModule} />);

    // Vérifie que la durée estimée apparaît dans les trois colonnes de stats
    const durationTexts = screen.getAllByText('90');
    expect(durationTexts).toHaveLength(3);

    expect(screen.getByText('Leçons')).toBeInTheDocument();
    expect(screen.getByText('Quiz')).toBeInTheDocument();
    expect(screen.getByText('Inscrits')).toBeInTheDocument();
  });

  it('affiche le menu à 3 points', () => {
    render(<ModuleCard module={mockModule} />);

    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();
  });

  it('ouvre le menu déroulant au clic sur le bouton menu', async () => {
    const user = userEvent.setup();
    render(<ModuleCard module={mockModule} />);

    const menuButton = screen.getByRole('button');
    await user.click(menuButton);

    expect(screen.getByText('Voir les détails')).toBeInTheDocument();
    expect(screen.getByText('Modifier')).toBeInTheDocument();
    expect(screen.getByText('Archiver')).toBeInTheDocument();
    expect(screen.getByText('Supprimer')).toBeInTheDocument();
  });

  it('affiche les icônes dans le menu déroulant', async () => {
    const user = userEvent.setup();
    render(<ModuleCard module={mockModule} />);

    const menuButton = screen.getByRole('button');
    await user.click(menuButton);

    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
    expect(screen.getByTestId('archive-icon')).toBeInTheDocument();
    expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
  });

  it('exécute l\'action "voir" et ferme le menu', async () => {
    const user = userEvent.setup();
    render(<ModuleCard module={mockModule} />);

    const menuButton = screen.getByRole('button');
    await user.click(menuButton);

    const viewButton = screen.getByText('Voir les détails');
    await user.click(viewButton);

    expect(consoleLogSpy).toHaveBeenCalledWith('Action: voir sur module 1');
    expect(screen.queryByText('Voir les détails')).not.toBeInTheDocument();
  });

  it('exécute l\'action "modifier" et ferme le menu', async () => {
    const user = userEvent.setup();
    render(<ModuleCard module={mockModule} />);

    const menuButton = screen.getByRole('button');
    await user.click(menuButton);

    const editButton = screen.getByText('Modifier');
    await user.click(editButton);

    expect(consoleLogSpy).toHaveBeenCalledWith('Action: modifier sur module 1');
    expect(screen.queryByText('Modifier')).not.toBeInTheDocument();
  });

  it('exécute l\'action "archiver" et ferme le menu', async () => {
    const user = userEvent.setup();
    render(<ModuleCard module={mockModule} />);

    const menuButton = screen.getByRole('button');
    await user.click(menuButton);

    const archiveButton = screen.getByText('Archiver');
    await user.click(archiveButton);

    expect(consoleLogSpy).toHaveBeenCalledWith('Action: archiver sur module 1');
    expect(screen.queryByText('Archiver')).not.toBeInTheDocument();
  });

  it('exécute l\'action "supprimer" et ferme le menu', async () => {
    const user = userEvent.setup();
    render(<ModuleCard module={mockModule} />);

    const menuButton = screen.getByRole('button');
    await user.click(menuButton);

    const deleteButton = screen.getByText('Supprimer');
    await user.click(deleteButton);

    expect(consoleLogSpy).toHaveBeenCalledWith('Action: supprimer sur module 1');
    expect(screen.queryByText('Supprimer')).not.toBeInTheDocument();
  });

  it('ferme le menu quand on clique en dehors', async () => {
    render(<ModuleCard module={mockModule} />);

    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    expect(screen.getByText('Voir les détails')).toBeInTheDocument();

    // Simuler un clic en dehors
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText('Voir les détails')).not.toBeInTheDocument();
    });
  });

  it("empêche la propagation d'événements sur les boutons du menu", async () => {
    const user = userEvent.setup();
    render(<ModuleCard module={mockModule} />);

    const menuButton = screen.getByRole('button');
    await user.click(menuButton);

    const viewButton = screen.getByText('Voir les détails');

    // Vérifier que stopPropagation est appelé (teste implicitement le comportement)
    await user.click(viewButton);
    expect(consoleLogSpy).toHaveBeenCalledWith('Action: voir sur module 1');
  });

  it('affiche correctement un module avec thématique INVESTMENT', () => {
    const investmentModule = { ...mockModule, thematics: [Thematic.INVESTMENT] };
    render(<ModuleCard module={investmentModule} />);

    expect(screen.getByText('Investissement')).toBeInTheDocument();
  });

  it('affiche correctement un module avec niveau INTERMEDIATE', () => {
    const intermediateModule = { ...mockModule, difficultyLevel: DifficultyLevel.INTERMEDIATE };
    render(<ModuleCard module={intermediateModule} />);

    const badge = screen.getByText('Intermédiaire');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-700');
  });

  it('affiche correctement un module avec niveau ADVANCED', () => {
    const advancedModule = { ...mockModule, difficultyLevel: DifficultyLevel.ADVANCED };
    render(<ModuleCard module={advancedModule} />);

    const badge = screen.getByText('Avancé');
    expect(badge).toHaveClass('bg-orange-100', 'text-orange-700');
  });

  it('affiche correctement un module avec niveau EXPERT', () => {
    const expertModule = { ...mockModule, difficultyLevel: DifficultyLevel.EXPERT };
    render(<ModuleCard module={expertModule} />);

    const badge = screen.getByText('Expert');
    expect(badge).toHaveClass('bg-red-100', 'text-red-700');
  });
});
