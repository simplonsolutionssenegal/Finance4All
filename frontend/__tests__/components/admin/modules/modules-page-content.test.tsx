// __tests__/components/admin/modules/modules-page-content.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ModulesPageContent from '@/components/admin/modules/modules-page-content';
import { DifficultyLevel, Thematic, ModuleStatus, type Module } from '@/types/modules/module';

import '@testing-library/jest-dom';

// Mocks
jest.mock('lucide-react', () => ({
  Plus: () => <span data-testid='plus-icon'>+</span>,
}));

jest.mock('@/components/admin/modules/module-list', () => {
  return function MockModuleList({ modules }: { modules: Module[] }) {
    return (
      <div data-testid='module-list'>
        {modules.length === 0 ? (
          <div data-testid='empty-state'>Aucun module trouvé</div>
        ) : (
          <div data-testid='modules-grid'>
            {modules.map(module => (
              <div key={module.id} data-testid={`module-item-${module.id}`}>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
});

jest.mock('@/components/admin/modules/module-dialog', () => {
  return function MockModuleDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;

    return (
      <div data-testid='module-dialog'>
        <h2>Nouveau module</h2>
        <button onClick={onClose} data-testid='dialog-close'>
          Fermer
        </button>
        <form data-testid='module-form'>
          <input placeholder='Titre du module' />
          <button type='submit'>Créer</button>
        </form>
      </div>
    );
  };
});

describe('ModulesPageContent', () => {
  const createMockModule = (
    id: number,
    title: string,
    overrides: Partial<Module> = {}
  ): Module => ({
    id: id.toString(),
    title,
    description: `Description du ${title}`,
    thematics: [Thematic.FINANCIAL_EDUCATION],
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: 60,
    status: ModuleStatus.PUBLISHED,
    imageUrl: `https://example.com/image-${id}.jpg`,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    ...overrides,
  });

  it('affiche le titre de la page', () => {
    render(<ModulesPageContent initialModules={[]} />);

    expect(screen.getByText('Modules de formation')).toBeInTheDocument();
  });

  it('affiche le bouton "Nouveau module"', () => {
    render(<ModulesPageContent initialModules={[]} />);

    const button = screen.getByText('Nouveau module');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-blue-600', 'text-white');
  });

  it("affiche l'icône Plus dans le bouton", () => {
    render(<ModulesPageContent initialModules={[]} />);

    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
  });

  it('applique les bonnes classes CSS au conteneur principal', () => {
    const { container } = render(<ModulesPageContent initialModules={[]} />);

    const mainContainer = container.querySelector('.min-h-screen.bg-gray-50.p-6');
    expect(mainContainer).toBeInTheDocument();

    const maxWidthContainer = container.querySelector('.max-w-7xl.mx-auto');
    expect(maxWidthContainer).toBeInTheDocument();
  });

  it('affiche la liste des modules avec les modules initiaux', () => {
    const modules = [
      createMockModule(1, 'Module de Finance'),
      createMockModule(2, "Module d'Investissement"),
    ];

    render(<ModulesPageContent initialModules={modules} />);

    expect(screen.getByTestId('module-list')).toBeInTheDocument();
    expect(screen.getByTestId('modules-grid')).toBeInTheDocument();
    expect(screen.getByText('Module de Finance')).toBeInTheDocument();
    expect(screen.getByText("Module d'Investissement")).toBeInTheDocument();
  });

  it("affiche l'état vide quand aucun module n'est fourni", () => {
    render(<ModulesPageContent initialModules={[]} />);

    expect(screen.getByTestId('module-list')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('Aucun module trouvé')).toBeInTheDocument();
  });

  it("n'affiche pas le dialog au chargement initial", () => {
    render(<ModulesPageContent initialModules={[]} />);

    expect(screen.queryByTestId('module-dialog')).not.toBeInTheDocument();
  });

  it('ouvre le dialog au clic sur "Nouveau module"', async () => {
    const user = userEvent.setup();
    render(<ModulesPageContent initialModules={[]} />);

    const button = screen.getByText('Nouveau module');
    await user.click(button);

    expect(screen.getByTestId('module-dialog')).toBeInTheDocument();
  });

  it('ferme le dialog quand onClose est appelé', async () => {
    const user = userEvent.setup();
    render(<ModulesPageContent initialModules={[]} />);

    // Ouvrir le dialog
    const openButton = screen.getByText('Nouveau module');
    await user.click(openButton);

    expect(screen.getByTestId('module-dialog')).toBeInTheDocument();

    // Fermer le dialog
    const closeButton = screen.getByTestId('dialog-close');
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('module-dialog')).not.toBeInTheDocument();
    });
  });

  it("maintient l'état du dialog fermé après fermeture", async () => {
    const user = userEvent.setup();
    render(<ModulesPageContent initialModules={[]} />);

    // Ouvrir et fermer le dialog
    const openButton = screen.getByText('Nouveau module');
    await user.click(openButton);

    const closeButton = screen.getByTestId('dialog-close');
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('module-dialog')).not.toBeInTheDocument();
    });

    // Vérifier que le dialog reste fermé
    expect(screen.queryByTestId('module-dialog')).not.toBeInTheDocument();
  });

  it('peut ouvrir le dialog plusieurs fois', async () => {
    const user = userEvent.setup();
    render(<ModulesPageContent initialModules={[]} />);

    const openButton = screen.getByText('Nouveau module');

    // Premier cycle ouverture/fermeture
    await user.click(openButton);
    expect(screen.getByTestId('module-dialog')).toBeInTheDocument();

    const closeButton = screen.getByTestId('dialog-close');
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('module-dialog')).not.toBeInTheDocument();
    });

    // Deuxième ouverture
    await user.click(openButton);
    expect(screen.getByTestId('module-dialog')).toBeInTheDocument();
  });

  it("affiche la structure d'en-tête correcte", () => {
    const { container } = render(<ModulesPageContent initialModules={[]} />);

    const header = container.querySelector('.flex.items-center.justify-between.mb-6');
    expect(header).toBeInTheDocument();

    const title = container.querySelector('h1.text-3xl.font-bold.text-gray-900');
    expect(title).toBeInTheDocument();
  });

  it('applique les bonnes classes CSS au bouton', () => {
    render(<ModulesPageContent initialModules={[]} />);

    const button = screen.getByText('Nouveau module');
    expect(button).toHaveClass(
      'flex',
      'items-center',
      'gap-2',
      'px-6',
      'py-3',
      'bg-blue-600',
      'text-white',
      'rounded-lg',
      'font-medium',
      'hover:bg-blue-700',
      'transition-colors'
    );
  });

  it('transmet correctement les modules à ModuleList', () => {
    const modules = [
      createMockModule(1, 'Module Finance', {
        description: 'Formation en finance personnelle',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
      }),
      createMockModule(2, 'Module Budget', {
        description: 'Gestion de budget familial',
        thematics: [Thematic.PERSONAL_DEVELOPMENT],
      }),
    ];

    render(<ModulesPageContent initialModules={modules} />);

    expect(screen.getByTestId('module-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('module-item-2')).toBeInTheDocument();
    expect(screen.getByText('Module Finance')).toBeInTheDocument();
    expect(screen.getByText('Module Budget')).toBeInTheDocument();
    expect(screen.getByText('Formation en finance personnelle')).toBeInTheDocument();
    expect(screen.getByText('Gestion de budget familial')).toBeInTheDocument();
  });

  it('gère correctement un grand nombre de modules', () => {
    const modules = Array.from({ length: 20 }, (_, i) =>
      createMockModule(i + 1, `Module ${i + 1}`)
    );

    render(<ModulesPageContent initialModules={modules} />);

    expect(screen.getByTestId('modules-grid')).toBeInTheDocument();

    // Vérifier quelques modules spécifiques
    expect(screen.getByText('Module 1')).toBeInTheDocument();
    expect(screen.getByText('Module 10')).toBeInTheDocument();
    expect(screen.getByText('Module 20')).toBeInTheDocument();
  });

  it("maintient l'état des composants lors des interactions", async () => {
    const user = userEvent.setup();
    const modules = [createMockModule(1, 'Module Test')];

    render(<ModulesPageContent initialModules={modules} />);

    // Vérifier que les modules sont affichés
    expect(screen.getByText('Module Test')).toBeInTheDocument();

    // Ouvrir le dialog
    await user.click(screen.getByText('Nouveau module'));
    expect(screen.getByTestId('module-dialog')).toBeInTheDocument();

    // Les modules doivent toujours être visibles
    expect(screen.getByText('Module Test')).toBeInTheDocument();

    // Fermer le dialog
    await user.click(screen.getByTestId('dialog-close'));

    await waitFor(() => {
      expect(screen.queryByTestId('module-dialog')).not.toBeInTheDocument();
    });

    // Les modules doivent toujours être visibles
    expect(screen.getByText('Module Test')).toBeInTheDocument();
  });

  it('affiche des modules avec différents statuts correctement', () => {
    const modules = [
      createMockModule(1, 'Module Publié', { status: ModuleStatus.PUBLISHED }),
      createMockModule(2, 'Module Brouillon', { status: ModuleStatus.DRAFT }),
      createMockModule(3, 'Module Archivé', { status: ModuleStatus.ARCHIVED }),
    ];

    render(<ModulesPageContent initialModules={modules} />);

    expect(screen.getByText('Module Publié')).toBeInTheDocument();
    expect(screen.getByText('Module Brouillon')).toBeInTheDocument();
    expect(screen.getByText('Module Archivé')).toBeInTheDocument();
  });

  it('est accessible avec les attributs ARIA appropriés', () => {
    render(<ModulesPageContent initialModules={[]} />);

    const button = screen.getByText('Nouveau module');
    expect(button.tagName).toBe('BUTTON');

    const title = screen.getByText('Modules de formation');
    expect(title.tagName).toBe('H1');
  });
});
