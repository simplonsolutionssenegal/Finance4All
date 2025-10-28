// __tests__/components/admin/modules/module-list.test.tsx
import { render, screen } from '@testing-library/react';

import ModuleList from '@/components/admin/modules/module-list';
import { DifficultyLevel, Thematic, ModuleStatus, type Module } from '@/types/modules/module';
import '@testing-library/jest-dom';

// Mock du composant ModuleCard
jest.mock('@/components/admin/modules/module-card', () => {
  return function MockModuleCard({ module }: { module: Module }) {
    return (
      <div data-testid={`module-card-${module.id}`}>
        <h3>{module.title}</h3>
        <p>{module.description}</p>
        <span>Durée: {module.estimatedDuration}min</span>
        <span>Difficulté: {module.difficultyLevel}</span>
        <span>Statut: {module.status}</span>
      </div>
    );
  };
});

describe('ModuleList', () => {
  const createMockModule = (
    id: number,
    title: string,
    overrides: Partial<Module> = {}
  ): Module => ({
    id: id.toString(),
    title,
    description: `Description détaillée du ${title}`,
    thematics: [Thematic.FINANCIAL_EDUCATION],
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: 60,
    status: ModuleStatus.PUBLISHED,
    imageUrl: `https://example.com/image-${id}.jpg`,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    ...overrides,
  });

  it('affiche le message "Aucun module trouvé" quand la liste est vide', () => {
    render(<ModuleList modules={[]} />);

    expect(screen.getByText('Aucun module trouvé')).toBeInTheDocument();
  });

  it("applique les bonnes classes CSS pour l'état vide", () => {
    const { container } = render(<ModuleList modules={[]} />);

    const emptyStateDiv = container.querySelector('.text-center.py-12');
    expect(emptyStateDiv).toBeInTheDocument();

    const message = container.querySelector('.text-gray-500.text-lg');
    expect(message).toBeInTheDocument();
  });

  it("n'affiche pas de ModuleCard quand la liste est vide", () => {
    render(<ModuleList modules={[]} />);

    const cards = screen.queryAllByTestId(/module-card-/);
    expect(cards).toHaveLength(0);
  });

  it('affiche un module correctement', () => {
    const modules = [createMockModule(1, 'Module Finance Personnelle')];
    render(<ModuleList modules={modules} />);

    expect(screen.getByText('Module Finance Personnelle')).toBeInTheDocument();
    expect(
      screen.getByText('Description détaillée du Module Finance Personnelle')
    ).toBeInTheDocument();
    expect(screen.getByTestId('module-card-1')).toBeInTheDocument();
  });

  it('affiche plusieurs modules dans une grille', () => {
    const modules = [
      createMockModule(1, 'Module de Finance'),
      createMockModule(2, "Module d'Investissement"),
      createMockModule(3, 'Module de Budget'),
    ];

    const { container } = render(<ModuleList modules={modules} />);

    // Vérifier la classe CSS de la grille
    const gridContainer = container.querySelector(
      '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6'
    );
    expect(gridContainer).toBeInTheDocument();

    // Vérifier que tous les modules sont affichés
    expect(screen.getByText('Module de Finance')).toBeInTheDocument();
    expect(screen.getByText("Module d'Investissement")).toBeInTheDocument();
    expect(screen.getByText('Module de Budget')).toBeInTheDocument();

    // Vérifier le nombre de cartes
    const cards = screen.getAllByTestId(/module-card-/);
    expect(cards).toHaveLength(3);
  });

  it('passe les bonnes props aux composants ModuleCard', () => {
    const testModule = createMockModule(42, 'Module Test Complet', {
      difficultyLevel: DifficultyLevel.ADVANCED,
      estimatedDuration: 120,
      status: ModuleStatus.DRAFT,
    });

    render(<ModuleList modules={[testModule]} />);

    expect(screen.getByText('Module Test Complet')).toBeInTheDocument();
    expect(screen.getByText('Durée: 120min')).toBeInTheDocument();
    expect(screen.getByText('Difficulté: ADVANCED')).toBeInTheDocument();
    expect(screen.getByText('Statut: DRAFT')).toBeInTheDocument();
  });

  it('affiche des modules avec différentes thématiques', () => {
    const modules = [
      createMockModule(1, 'Module Finance', { thematics: [Thematic.FINANCIAL_EDUCATION] }),
      createMockModule(2, 'Module Investissement', { thematics: [Thematic.INVESTMENT] }),
      createMockModule(3, 'Module Personnel', { thematics: [Thematic.PERSONAL_DEVELOPMENT] }),
    ];

    render(<ModuleList modules={modules} />);

    modules.forEach(module => {
      expect(screen.getByTestId(`module-card-${module.id}`)).toBeInTheDocument();
    });
  });

  it('affiche des modules avec différents niveaux de difficulté', () => {
    const modules = [
      createMockModule(1, 'Module Débutant', { difficultyLevel: DifficultyLevel.BEGINNER }),
      createMockModule(2, 'Module Intermédiaire', {
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
      }),
      createMockModule(3, 'Module Avancé', { difficultyLevel: DifficultyLevel.ADVANCED }),
      createMockModule(4, 'Module Expert', { difficultyLevel: DifficultyLevel.EXPERT }),
    ];

    render(<ModuleList modules={modules} />);

    expect(screen.getByText('Difficulté: BEGINNER')).toBeInTheDocument();
    expect(screen.getByText('Difficulté: INTERMEDIATE')).toBeInTheDocument();
    expect(screen.getByText('Difficulté: ADVANCED')).toBeInTheDocument();
    expect(screen.getByText('Difficulté: EXPERT')).toBeInTheDocument();
  });

  it('affiche des modules avec différents statuts', () => {
    const modules = [
      createMockModule(1, 'Module Brouillon', { status: ModuleStatus.DRAFT }),
      createMockModule(2, 'Module Publié', { status: ModuleStatus.PUBLISHED }),
      createMockModule(3, 'Module Archivé', { status: ModuleStatus.ARCHIVED }),
    ];

    render(<ModuleList modules={modules} />);

    expect(screen.getByText('Statut: DRAFT')).toBeInTheDocument();
    expect(screen.getByText('Statut: PUBLISHED')).toBeInTheDocument();
    expect(screen.getByText('Statut: ARCHIVED')).toBeInTheDocument();
  });

  it('gère correctement un grand nombre de modules', () => {
    const modules = Array.from({ length: 50 }, (_, i) =>
      createMockModule(i + 1, `Module ${i + 1}`)
    );

    expect(() => render(<ModuleList modules={modules} />)).not.toThrow();

    const cards = screen.getAllByTestId(/module-card-/);
    expect(cards).toHaveLength(50);

    // Vérifier quelques modules spécifiques
    expect(screen.getByText('Module 1')).toBeInTheDocument();
    expect(screen.getByText('Module 25')).toBeInTheDocument();
    expect(screen.getByText('Module 50')).toBeInTheDocument();
  });

  it("maintient l'ordre des modules passés en props", () => {
    const modules = [
      createMockModule(3, 'Troisième Module'),
      createMockModule(1, 'Premier Module'),
      createMockModule(2, 'Deuxième Module'),
    ];

    render(<ModuleList modules={modules} />);

    const cards = screen.getAllByTestId(/module-card-/);
    expect(cards[0]).toHaveAttribute('data-testid', 'module-card-3');
    expect(cards[1]).toHaveAttribute('data-testid', 'module-card-1');
    expect(cards[2]).toHaveAttribute('data-testid', 'module-card-2');
  });

  it('affiche des modules avec des durées variées', () => {
    const modules = [
      createMockModule(1, 'Module Court', { estimatedDuration: 30 }),
      createMockModule(2, 'Module Moyen', { estimatedDuration: 90 }),
      createMockModule(3, 'Module Long', { estimatedDuration: 180 }),
    ];

    render(<ModuleList modules={modules} />);

    expect(screen.getByText('Durée: 30min')).toBeInTheDocument();
    expect(screen.getByText('Durée: 90min')).toBeInTheDocument();
    expect(screen.getByText('Durée: 180min')).toBeInTheDocument();
  });

  it('affiche des modules avec et sans images', () => {
    const modules = [
      createMockModule(1, 'Module avec Image', { imageUrl: 'https://example.com/image.jpg' }),
      createMockModule(2, 'Module sans Image', { imageUrl: null }),
      createMockModule(3, 'Module sans Image 2', { imageUrl: undefined }),
    ];

    render(<ModuleList modules={modules} />);

    // Tous les modules doivent être affichés
    expect(screen.getByTestId('module-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('module-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('module-card-3')).toBeInTheDocument();
  });

  it('ne modifie pas les props des modules', () => {
    const originalModule = createMockModule(1, 'Module Original');
    const modulesCopy = [{ ...originalModule }];

    render(<ModuleList modules={modulesCopy} />);

    // Vérifier que le module original n'a pas été modifié
    expect(originalModule.title).toBe('Module Original');
    expect(originalModule.id).toBe('1');
  });

  it("rend correctement quand on passe d'un état vide à des modules", () => {
    const { rerender } = render(<ModuleList modules={[]} />);

    expect(screen.getByText('Aucun module trouvé')).toBeInTheDocument();

    const modules = [createMockModule(1, 'Nouveau Module')];
    rerender(<ModuleList modules={modules} />);

    expect(screen.queryByText('Aucun module trouvé')).not.toBeInTheDocument();
    expect(screen.getByText('Nouveau Module')).toBeInTheDocument();
  });

  it('rend correctement quand on passe de modules à un état vide', () => {
    const modules = [createMockModule(1, 'Module à Supprimer')];
    const { rerender } = render(<ModuleList modules={modules} />);

    expect(screen.getByText('Module à Supprimer')).toBeInTheDocument();

    rerender(<ModuleList modules={[]} />);

    expect(screen.queryByText('Module à Supprimer')).not.toBeInTheDocument();
    expect(screen.getByText('Aucun module trouvé')).toBeInTheDocument();
  });
});
