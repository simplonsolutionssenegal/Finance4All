// __tests__/components/admin/modules/module-list.test.tsx
import { render, screen } from '@testing-library/react';

import ModuleList from '@/components/admin/modules/module-list';
import { DifficultyLevel, ModuleStatus, type Module } from '@/types/modules/module';
import '@testing-library/jest-dom';

// Mock du composant ModuleCard (on simplifie fortement le rendu)
jest.mock('@/components/admin/modules/module-card', () => {
  return function MockModuleCard({ module }: { module: Module }) {
    return (
      <div data-testid={`module-card-${module.id}`}>
        <h3>{module.title}</h3>
      </div>
    );
  };
});

// Mock des icônes Lucide
jest.mock('lucide-react', () => ({
  ArrowRight: (props: any) => <svg data-testid='arrow-right-icon' {...props} />,
  Loader2: (props: any) => <svg data-testid='loader-icon' {...props} />,
}));

// Mock de CustomPagination pour tester l'intégration sans la logique interne
const mockOnPageChange = jest.fn();

jest.mock('@/components/admin/modules/custom-pagination', () => ({
  __esModule: true,
  CustomPagination: ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  }) => (
    <div data-testid='custom-pagination'>
      <span data-testid='pagination-current-page'>{currentPage}</span>
      <span data-testid='pagination-total-pages'>{totalPages}</span>
      <span data-testid='pagination-total-items'>{totalItems}</span>
      <span data-testid='pagination-items-per-page'>{itemsPerPage}</span>
      <button onClick={() => onPageChange(2)} data-testid='go-to-page-2'>
        Aller à la page 2
      </button>
    </div>
  ),
}));

describe('ModuleList', () => {
  const createMockModule = (
    id: number,
    title: string,
    overrides: Partial<Module> = {}
  ): Module => ({
    id: id.toString(),
    title,
    description: `Description détaillée du ${title}`,
    thematics: 'General',
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: 60,
    status: ModuleStatus.PUBLISHED,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    ...overrides,
  });

  it('affiche le message "Aucun module trouvé" quand la liste est vide', () => {
    render(<ModuleList modules={[]} />);

    expect(screen.getByText('Aucun module trouvé')).toBeInTheDocument();
    // Pas de header ni de grille dans l'état vide
    expect(screen.queryByText('Modules récents')).not.toBeInTheDocument();
  });

  it("applique les bonnes classes CSS pour l'état vide", () => {
    const { container } = render(<ModuleList modules={[]} />);

    const message = container.querySelector('.text-gray-500.text-lg');
    expect(message).toBeInTheDocument();
  });

  it("n'affiche pas de ModuleCard quand la liste est vide", () => {
    render(<ModuleList modules={[]} />);

    const cards = screen.queryAllByTestId(/module-card-/);
    expect(cards).toHaveLength(0);
  });

  it('affiche le header, le bouton Voir tout et un module', () => {
    const modules = [createMockModule(1, 'Module Finance Personnelle')];
    const { container } = render(<ModuleList modules={modules} />);

    // Header bar
    expect(screen.getByText('Modules récents')).toBeInTheDocument();
    expect(screen.getByText('Voir tout')).toBeInTheDocument();

    // Grille des modules
    const gridContainer = container.querySelector(
      '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6'
    );
    expect(gridContainer).toBeInTheDocument();

    // ModuleCard mock
    expect(screen.getByText('Module Finance Personnelle')).toBeInTheDocument();
    expect(screen.getByTestId('module-card-1')).toBeInTheDocument();
  });

  it('affiche plusieurs modules dans la grille', () => {
    const modules = [
      createMockModule(1, 'Module de Finance'),
      createMockModule(2, "Module d'Investissement"),
      createMockModule(3, 'Module de Budget'),
    ];

    render(<ModuleList modules={modules} />);

    expect(screen.getByText('Module de Finance')).toBeInTheDocument();
    expect(screen.getByText("Module d'Investissement")).toBeInTheDocument();
    expect(screen.getByText('Module de Budget')).toBeInTheDocument();

    const cards = screen.getAllByTestId(/module-card-/);
    expect(cards).toHaveLength(3);
  });

  it('gère correctement un grand nombre de modules', () => {
    const modules = Array.from({ length: 30 }, (_, i) =>
      createMockModule(i + 1, `Module ${i + 1}`)
    );

    expect(() => render(<ModuleList modules={modules} />)).not.toThrow();

    const cards = screen.getAllByTestId(/module-card-/);
    expect(cards).toHaveLength(30);
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

  it('affiche le spinner de chargement quand isLoading est true', () => {
    const { container } = render(<ModuleList modules={[]} isLoading />);

    // Loader2 a la classe animate-spin
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it("affiche l'état d'erreur quand isError est true", () => {
    render(<ModuleList modules={[]} isError />);

    expect(screen.getByText('Erreur lors du chargement des modules')).toBeInTheDocument();
  });

  it('affiche la pagination personnalisée quand pagination est fournie', () => {
    const modules = [createMockModule(1, 'Module 1'), createMockModule(2, 'Module 2')];

    render(
      <ModuleList
        modules={modules}
        pagination={{ page: 1, limit: 2, total: 4, totalPages: 2 }}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByTestId('custom-pagination')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-current-page')).toHaveTextContent('1');
    expect(screen.getByTestId('pagination-total-pages')).toHaveTextContent('2');
    expect(screen.getByTestId('pagination-total-items')).toHaveTextContent('4');
    expect(screen.getByTestId('pagination-items-per-page')).toHaveTextContent('2');
  });

  it('appelle onPageChange quand un changement de page est déclenché depuis la pagination', () => {
    const modules = [createMockModule(1, 'Module 1')];

    render(
      <ModuleList
        modules={modules}
        pagination={{ page: 1, limit: 1, total: 2, totalPages: 2 }}
        onPageChange={mockOnPageChange}
      />
    );

    screen.getByTestId('go-to-page-2').click();
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it("n'affiche pas la pagination si totalPages est 1", () => {
    const modules = [createMockModule(1, 'Module 1')];

    render(
      <ModuleList
        modules={modules}
        pagination={{ page: 1, limit: 10, total: 5, totalPages: 1 }}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.queryByTestId('custom-pagination')).not.toBeInTheDocument();
  });

  it("n'affiche pas la pagination si onPageChange n'est pas fourni", () => {
    const modules = [createMockModule(1, 'Module 1')];

    render(
      <ModuleList modules={modules} pagination={{ page: 1, limit: 10, total: 50, totalPages: 5 }} />
    );

    expect(screen.queryByTestId('custom-pagination')).not.toBeInTheDocument();
  });

  it('affiche l\'icône ArrowRight dans le bouton "Voir tout"', () => {
    const modules = [createMockModule(1, 'Module 1')];
    render(<ModuleList modules={modules} />);

    expect(screen.getByTestId('arrow-right-icon')).toBeInTheDocument();
  });

  it("affiche l'icône Loader2 pendant le chargement", () => {
    render(<ModuleList modules={[]} isLoading />);

    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('applique les bonnes classes au loader', () => {
    render(<ModuleList modules={[]} isLoading />);

    const loader = screen.getByTestId('loader-icon');
    expect(loader).toHaveClass('w-8', 'h-8', 'animate-spin', 'text-sky-400');
  });

  it('le bouton "Voir tout" a le bon type', () => {
    const modules = [createMockModule(1, 'Module 1')];
    render(<ModuleList modules={modules} />);

    const button = screen.getByText('Voir tout').closest('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('applique les bonnes classes au conteneur principal', () => {
    const modules = [createMockModule(1, 'Module 1')];
    const { container } = render(<ModuleList modules={modules} />);

    const mainContainer = container.querySelector('.space-y-3');
    expect(mainContainer).toBeInTheDocument();
  });

  it("affiche l'icône SVG pour l'état vide", () => {
    const { container } = render(<ModuleList modules={[]} />);

    const svg = container.querySelector('svg.text-gray-400');
    expect(svg).toBeInTheDocument();
  });

  it("affiche l'icône SVG X pour l'erreur", () => {
    const { container } = render(<ModuleList modules={[]} isError />);

    const svg = container.querySelector('svg.text-red-600');
    expect(svg).toBeInTheDocument();
  });

  it('priorité: isLoading sur isError et état vide', () => {
    render(<ModuleList modules={[]} isLoading isError />);

    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.queryByText('Erreur lors du chargement des modules')).not.toBeInTheDocument();
    expect(screen.queryByText('Aucun module trouvé')).not.toBeInTheDocument();
  });

  it('priorité: isError sur état vide', () => {
    render(<ModuleList modules={[]} isError />);

    expect(screen.getByText('Erreur lors du chargement des modules')).toBeInTheDocument();
    expect(screen.queryByText('Aucun module trouvé')).not.toBeInTheDocument();
  });

  it('gère les modules avec des caractères spéciaux', () => {
    const modules = [createMockModule(1, 'Module & <Test> "Special"')];
    render(<ModuleList modules={modules} />);

    expect(screen.getByText('Module & <Test> "Special"')).toBeInTheDocument();
  });

  it('applique les bonnes classes au titre "Modules récents"', () => {
    const modules = [createMockModule(1, 'Module 1')];
    render(<ModuleList modules={modules} />);

    const title = screen.getByText('Modules récents');
    expect(title).toHaveClass('text-base', 'font-medium', 'text-gray-700');
  });
});
