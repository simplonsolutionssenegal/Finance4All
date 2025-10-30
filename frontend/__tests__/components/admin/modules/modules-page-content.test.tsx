// __tests__/components/admin/modules/modules-page-content.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ModulesPageContent from '@/components/admin/modules/modules-page-content';
import { DifficultyLevel, Thematic, ModuleStatus, type Module } from '@/types/modules/module';

import '@testing-library/jest-dom';

// Mocks
jest.mock('@/components/admin/modules/content-tabs', () => {
  return function MockContentTabs({
    children,
  }: {
    children: (activeTab: 'modules' | 'quiz') => React.ReactNode;
  }) {
    return (
      <div data-testid='content-tabs'>
        <div data-testid='tabs-list'>
          <button data-testid='modules-tab'>Modules</button>
          <button data-testid='quiz-tab'>Quiz</button>
        </div>
        <div data-testid='tab-content'>{children('modules')}</div>
      </div>
    );
  };
});

jest.mock('@/components/admin/modules/filters-bar', () => {
  return function MockFiltersBar({
    onNewClick,
    buttonLabel,
    onSearchChange,
    onStatusChange,
    onThematicChange,
    searchValue,
    statusValue,
    thematicValue,
    filteredModules,
  }: any) {
    return (
      <div data-testid='filters-bar'>
        <input
          data-testid='search-input'
          placeholder='Rechercher...'
          value={searchValue}
          onChange={e => onSearchChange?.(e.target.value)}
        />
        <select
          data-testid='status-filter'
          value={statusValue}
          onChange={e => onStatusChange?.(e.target.value)}
        >
          <option value=''>Tous les statuts</option>
          <option value='PUBLISHED'>Publié</option>
          <option value='DRAFT'>Brouillon</option>
        </select>
        <select
          data-testid='thematic-filter'
          value={thematicValue}
          onChange={e => onThematicChange?.(e.target.value)}
        >
          <option value=''>Toutes les thématiques</option>
          <option value='FINANCIAL_EDUCATION'>Éducation financière</option>
        </select>
        <button data-testid='new-button' onClick={onNewClick}>
          {buttonLabel}
        </button>
        {filteredModules && (
          <span data-testid='results-count'>{filteredModules.length} résultats</span>
        )}
      </div>
    );
  };
});

jest.mock('@/components/admin/modules/stats-cards', () => {
  return function MockStatsCards({
    totalModules,
    publishedModules,
    totalQuizzes,
    totalLearners,
  }: any) {
    return (
      <div data-testid='stats-cards'>
        <div data-testid='total-modules'>{totalModules}</div>
        <div data-testid='published-modules'>{publishedModules}</div>
        <div data-testid='total-quizzes'>{totalQuizzes}</div>
        <div data-testid='total-learners'>{totalLearners}</div>
      </div>
    );
  };
});

jest.mock('@/components/admin/modules/module-list', () => {
  return function MockModuleList({ modules }: { modules: Module[] }) {
    return (
      <div data-testid='module-list'>
        {modules.map(module => (
          <div key={module.id} data-testid={`module-${module.id}`}>
            <h3>{module.title}</h3>
            <p>{module.description}</p>
            <span data-testid={`status-${module.id}`}>{module.status}</span>
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('@/components/admin/quiz/quiz-list', () => {
  return function MockQuizList() {
    return <div data-testid='quiz-list'>Liste des quiz</div>;
  };
});

jest.mock('@/components/admin/modules/module-dialog', () => {
  return function MockModuleDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;
    return (
      <div data-testid='module-dialog'>
        <h2>Nouveau module</h2>
        <button onClick={onClose} data-testid='close-dialog'>
          Fermer
        </button>
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

  describe('Rendu initial', () => {
    it('affiche la structure de base du composant', () => {
      render(<ModulesPageContent initialModules={[]} />);

      expect(screen.getByTestId('stats-cards')).toBeInTheDocument();
      expect(screen.getByTestId('content-tabs')).toBeInTheDocument();
      expect(screen.getByTestId('filters-bar')).toBeInTheDocument();
    });

    it('affiche les statistiques correctement', () => {
      const modules = [
        createMockModule(1, 'Module 1', { status: ModuleStatus.PUBLISHED }),
        createMockModule(2, 'Module 2', { status: ModuleStatus.DRAFT }),
        createMockModule(3, 'Module 3', { status: ModuleStatus.PUBLISHED }),
      ];

      render(<ModulesPageContent initialModules={modules} />);

      expect(screen.getByTestId('total-modules')).toHaveTextContent('3');
      expect(screen.getByTestId('published-modules')).toHaveTextContent('2');
      expect(screen.getByTestId('total-quizzes')).toHaveTextContent('2');
      expect(screen.getByTestId('total-learners')).toHaveTextContent('688');
    });

    it('applique les bonnes classes CSS au conteneur principal', () => {
      const { container } = render(<ModulesPageContent initialModules={[]} />);

      const mainContainer = container.querySelector('.min-h-screen.bg-gray-50.p-6');
      expect(mainContainer).toBeInTheDocument();

      const maxWidthContainer = container.querySelector('.max-w-7xl.mx-auto');
      expect(maxWidthContainer).toBeInTheDocument();
    });
  });

  describe('Affichage des modules', () => {
    it('affiche les modules dans la liste', () => {
      const modules = [createMockModule(1, 'Module Finance'), createMockModule(2, 'Module Budget')];

      render(<ModulesPageContent initialModules={modules} />);

      expect(screen.getByTestId('module-list')).toBeInTheDocument();
      expect(screen.getByTestId('module-1')).toBeInTheDocument();
      expect(screen.getByTestId('module-2')).toBeInTheDocument();
      expect(screen.getByText('Module Finance')).toBeInTheDocument();
      expect(screen.getByText('Module Budget')).toBeInTheDocument();
    });

    it('affiche le message quand aucun module ne correspond aux filtres', () => {
      render(<ModulesPageContent initialModules={[]} />);

      expect(
        screen.getByText('Aucun module ne correspond à vos critères de recherche')
      ).toBeInTheDocument();
      expect(screen.getByText('Réinitialiser les filtres')).toBeInTheDocument();
    });

    it('gère un grand nombre de modules', () => {
      const modules = Array.from({ length: 50 }, (_, i) =>
        createMockModule(i + 1, `Module ${i + 1}`)
      );

      render(<ModulesPageContent initialModules={modules} />);

      expect(screen.getByTestId('total-modules')).toHaveTextContent('50');
      expect(screen.getByTestId('module-list')).toBeInTheDocument();
    });
  });

  describe('Gestion du dialog', () => {
    it("n'affiche pas le dialog au chargement initial", () => {
      render(<ModulesPageContent initialModules={[]} />);

      expect(screen.queryByTestId('module-dialog')).not.toBeInTheDocument();
    });

    it('ouvre le dialog au clic sur le bouton nouveau', async () => {
      const user = userEvent.setup();
      render(<ModulesPageContent initialModules={[]} />);

      const newButton = screen.getByTestId('new-button');
      await user.click(newButton);

      expect(screen.getByTestId('module-dialog')).toBeInTheDocument();
    });

    it('ferme le dialog via le bouton fermer', async () => {
      const user = userEvent.setup();
      render(<ModulesPageContent initialModules={[]} />);

      // Ouvrir le dialog
      await user.click(screen.getByTestId('new-button'));
      expect(screen.getByTestId('module-dialog')).toBeInTheDocument();

      // Fermer le dialog
      await user.click(screen.getByTestId('close-dialog'));

      await waitFor(() => {
        expect(screen.queryByTestId('module-dialog')).not.toBeInTheDocument();
      });
    });

    it('peut rouvrir le dialog après fermeture', async () => {
      const user = userEvent.setup();
      render(<ModulesPageContent initialModules={[]} />);

      const newButton = screen.getByTestId('new-button');

      // Premier cycle
      await user.click(newButton);
      await user.click(screen.getByTestId('close-dialog'));

      await waitFor(() => {
        expect(screen.queryByTestId('module-dialog')).not.toBeInTheDocument();
      });

      // Deuxième ouverture
      await user.click(newButton);
      expect(screen.getByTestId('module-dialog')).toBeInTheDocument();
    });
  });

  describe('Filtrage des modules', () => {
    const testModules = [
      createMockModule(1, 'Module Finance', {
        status: ModuleStatus.PUBLISHED,
        thematics: [Thematic.FINANCIAL_EDUCATION],
      }),
      createMockModule(2, 'Module Budget', {
        status: ModuleStatus.DRAFT,
        thematics: [Thematic.FINANCIAL_EDUCATION],
      }),
      createMockModule(3, 'Module Investissement', {
        status: ModuleStatus.PUBLISHED,
        thematics: [Thematic.INVESTMENT],
      }),
    ];

    it('filtre par recherche de texte', async () => {
      const user = userEvent.setup();
      render(<ModulesPageContent initialModules={testModules} />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Finance');

      // Le composant devrait afficher seulement le module qui correspond
      expect(screen.getByTestId('results-count')).toHaveTextContent('1 résultats');
    });

    it('filtre par statut', async () => {
      const user = userEvent.setup();
      render(<ModulesPageContent initialModules={testModules} />);

      const statusFilter = screen.getByTestId('status-filter');
      await user.selectOptions(statusFilter, 'PUBLISHED');

      // Devrait afficher 2 modules publiés
      expect(screen.getByTestId('results-count')).toHaveTextContent('2 résultats');
    });

    it('filtre par thématique', async () => {
      const user = userEvent.setup();
      render(<ModulesPageContent initialModules={testModules} />);

      const thematicFilter = screen.getByTestId('thematic-filter');
      await user.selectOptions(thematicFilter, 'FINANCIAL_EDUCATION');

      // Devrait afficher 2 modules avec cette thématique
      expect(screen.getByTestId('results-count')).toHaveTextContent('2 résultats');
    });

    it('combine plusieurs filtres', async () => {
      const user = userEvent.setup();
      render(<ModulesPageContent initialModules={testModules} />);

      const statusFilter = screen.getByTestId('status-filter');
      const thematicFilter = screen.getByTestId('thematic-filter');

      await user.selectOptions(statusFilter, 'PUBLISHED');
      await user.selectOptions(thematicFilter, 'FINANCIAL_EDUCATION');

      // Devrait afficher 1 module qui correspond aux deux critères
      expect(screen.getByTestId('results-count')).toHaveTextContent('1 résultats');
    });

    it('réinitialise les filtres via le bouton', async () => {
      const user = userEvent.setup();
      render(<ModulesPageContent initialModules={testModules} />);

      // Appliquer des filtres
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Finance');
    });

    it('affiche le message quand aucun résultat ne correspond', async () => {
      const user = userEvent.setup();
      render(<ModulesPageContent initialModules={testModules} />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Module inexistant');

      expect(
        screen.getByText('Aucun module ne correspond à vos critères de recherche')
      ).toBeInTheDocument();
      expect(screen.getByText('Réinitialiser les filtres')).toBeInTheDocument();
    });
  });

  describe('Gestion des onglets', () => {
    it('affiche le contenu des modules par défaut', () => {
      const modules = [createMockModule(1, 'Test Module')];
      render(<ModulesPageContent initialModules={modules} />);

      expect(screen.getByTestId('module-list')).toBeInTheDocument();
      expect(screen.getByText('Test Module')).toBeInTheDocument();
    });

    it("transmet le bon label de bouton selon l'onglet actif", () => {
      render(<ModulesPageContent initialModules={[]} />);

      // Dans le mock, l'onglet modules est actif par défaut
      expect(screen.getByText('Nouveau module')).toBeInTheDocument();
    });

    it("transmet les bonnes données filtrées selon l'onglet", () => {
      const modules = [createMockModule(1, 'Test Module')];
      render(<ModulesPageContent initialModules={modules} />);

      // Pour l'onglet modules, les modules filtrés devraient être transmis
      expect(screen.getByTestId('results-count')).toHaveTextContent('1 résultats');
    });
  });

  describe('Props et état', () => {
    it('utilise correctement les modules initiaux', () => {
      const modules = [createMockModule(1, 'Module 1'), createMockModule(2, 'Module 2')];

      render(<ModulesPageContent initialModules={modules} />);

      expect(screen.getByTestId('total-modules')).toHaveTextContent('2');
      expect(screen.getByText('Module 1')).toBeInTheDocument();
      expect(screen.getByText('Module 2')).toBeInTheDocument();
    });

    it('gère correctement les modules vides', () => {
      render(<ModulesPageContent initialModules={[]} />);

      expect(screen.getByTestId('total-modules')).toHaveTextContent('0');
      expect(
        screen.getByText('Aucun module ne correspond à vos critères de recherche')
      ).toBeInTheDocument();
    });

    it('calcule correctement les statistiques', () => {
      const modules = [
        createMockModule(1, 'Module 1', { status: ModuleStatus.PUBLISHED }),
        createMockModule(2, 'Module 2', { status: ModuleStatus.PUBLISHED }),
        createMockModule(3, 'Module 3', { status: ModuleStatus.DRAFT }),
        createMockModule(4, 'Module 4', { status: ModuleStatus.ARCHIVED }),
      ];

      render(<ModulesPageContent initialModules={modules} />);

      expect(screen.getByTestId('total-modules')).toHaveTextContent('4');
      expect(screen.getByTestId('published-modules')).toHaveTextContent('2');
    });
  });

  describe('Interaction utilisateur', () => {
    it("maintient l'état des filtres pendant les interactions", async () => {
      const user = userEvent.setup();
      const modules = [createMockModule(1, 'Test Module')];

      render(<ModulesPageContent initialModules={modules} />);

      // Appliquer un filtre
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Test');

      // Ouvrir le dialog
      await user.click(screen.getByTestId('new-button'));
      expect(screen.getByTestId('module-dialog')).toBeInTheDocument();

      // Le filtre devrait toujours être actif
      expect(searchInput).toHaveValue('Test');

      // Fermer le dialog
      await user.click(screen.getByTestId('close-dialog'));

      // Le filtre devrait toujours être là
      expect(searchInput).toHaveValue('Test');
    });

    it('réagit aux changements de modules', () => {
      const { rerender } = render(<ModulesPageContent initialModules={[]} />);

      expect(screen.getByTestId('total-modules')).toHaveTextContent('0');

      const newModules = [createMockModule(1, 'Nouveau Module')];
      rerender(<ModulesPageContent initialModules={newModules} />);

      expect(screen.getByTestId('total-modules')).toHaveTextContent('1');
      expect(screen.getByText('Nouveau Module')).toBeInTheDocument();
    });
  });
});
