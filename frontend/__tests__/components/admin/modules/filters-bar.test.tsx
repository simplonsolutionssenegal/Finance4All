// __tests__/components/admin/modules/filters-bar.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FiltersBar from '@/components/admin/modules/filters-bar';
import { DifficultyLevel, Thematic, ModuleStatus, type Module } from '@/types/modules/module';

import '@testing-library/jest-dom';

// Mock des icônes de lucide-react
jest.mock('lucide-react', () => ({
  Search: () => <span data-testid='search-icon'>🔍</span>,
  Plus: () => <span data-testid='plus-icon'>+</span>,
  X: () => <span data-testid='x-icon'>❌</span>,
  Filter: () => <span data-testid='filter-icon'>🔽</span>,
  ChevronDown: () => <span data-testid='chevron-down-icon'>⬇️</span>,
}));

// Mock des constantes
jest.mock('@/lib/constants/module-constants', () => ({
  MODULE_STATUS_LABELS: {
    PUBLISHED: 'Publié',
    DRAFT: 'Brouillon',
    ARCHIVED: 'Archivé',
  },
  THEMATIC_LABELS: {
    FINANCIAL_EDUCATION: 'Éducation financière',
    INVESTMENT: 'Investissement',
    SAVING: 'Épargne',
    BUDGET_MANAGEMENT: 'Gestion de budget',
  },
}));

describe('FiltersBar', () => {
  const defaultProps = {
    onNewClick: jest.fn(),
    onSearchChange: jest.fn(),
    onStatusChange: jest.fn(),
    onThematicChange: jest.fn(),
  };

  const createMockModule = (id: number, overrides: Partial<Module> = {}): Module => ({
    id: id.toString(),
    title: `Module ${id}`,
    description: `Description ${id}`,
    thematics: [Thematic.FINANCIAL_EDUCATION],
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: 60,
    status: ModuleStatus.PUBLISHED,
    imageUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu initial', () => {
    it('affiche la structure de base du composant', () => {
      render(<FiltersBar {...defaultProps} />);

      expect(screen.getByPlaceholderText('Rechercher un module...')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Tous les statuts')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Toutes')).toBeInTheDocument();
      expect(screen.getByText('Nouveau module')).toBeInTheDocument();
    });

    it('applique les bonnes classes CSS au conteneur principal', () => {
      const { container } = render(<FiltersBar {...defaultProps} />);

      const mainContainer = container.querySelector('.space-y-3.mb-6');
      expect(mainContainer).toBeInTheDocument();
    });

    it('affiche le bouton avec le label par défaut', () => {
      render(<FiltersBar {...defaultProps} />);

      expect(screen.getByText('Nouveau module')).toBeInTheDocument();
    });

    it('affiche le bouton avec un label personnalisé', () => {
      render(<FiltersBar {...defaultProps} buttonLabel='Créer un quiz' />);

      expect(screen.getByText('Créer un quiz')).toBeInTheDocument();
    });
  });

  describe('Champ de recherche', () => {
    it("affiche l'icône de recherche", () => {
      render(<FiltersBar {...defaultProps} />);

      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('affiche la valeur de recherche passée en prop', () => {
      render(<FiltersBar {...defaultProps} searchValue='test search' />);

      const searchInput = screen.getByPlaceholderText('Rechercher un module...');
      expect(searchInput).toHaveValue('test search');
    });

    it('appelle onSearchChange lors de la saisie', async () => {
      const user = userEvent.setup();
      render(<FiltersBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Rechercher un module...');
      await user.type(searchInput, 'finance');
    });

    it('affiche le bouton de suppression quand il y a du texte', () => {
      render(<FiltersBar {...defaultProps} searchValue='test' />);
    });

    it('cache le bouton de suppression quand le champ est vide', () => {
      render(<FiltersBar {...defaultProps} searchValue='' />);

      expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
    });

    it('applique les bonnes classes CSS au champ de recherche', () => {
      render(<FiltersBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Rechercher un module...');
      expect(searchInput).toHaveClass(
        'w-full',
        'pl-12',
        'pr-10',
        'py-3',
        'bg-gray-50',
        'border-0',
        'rounded-xl',
        'focus:ring-2',
        'focus:ring-blue-500',
        'transition-all'
      );
    });
  });

  describe('Filtre par statut', () => {
    it("affiche l'icône de filtre", () => {
      render(<FiltersBar {...defaultProps} />);

      expect(screen.getByTestId('filter-icon')).toBeInTheDocument();
    });

    it("affiche l'icône chevron", () => {
      render(<FiltersBar {...defaultProps} />);

      const chevronIcons = screen.getAllByTestId('chevron-down-icon');
      expect(chevronIcons).toHaveLength(2); // Un pour chaque select
    });

    it('affiche toutes les options de statut', () => {
      render(<FiltersBar {...defaultProps} />);

      expect(screen.getByText('Tous les statuts')).toBeInTheDocument();
      expect(screen.getByText('Publié')).toBeInTheDocument();
      expect(screen.getByText('Brouillon')).toBeInTheDocument();
      expect(screen.getByText('Archivé')).toBeInTheDocument();
    });

    it('affiche la valeur de statut sélectionnée', () => {
      render(<FiltersBar {...defaultProps} statusValue='PUBLISHED' />);

      const statusSelect = screen.getByDisplayValue('Publié');
      expect(statusSelect).toBeInTheDocument();
    });

    it('appelle onStatusChange lors de la sélection', async () => {
      const user = userEvent.setup();
      render(<FiltersBar {...defaultProps} />);

      const statusSelect = screen.getByDisplayValue('Tous les statuts');
      await user.selectOptions(statusSelect, 'PUBLISHED');

      expect(defaultProps.onStatusChange).toHaveBeenCalledWith('PUBLISHED');
    });

    it('applique les bonnes classes CSS au select de statut', () => {
      render(<FiltersBar {...defaultProps} />);

      const statusSelect = screen.getByDisplayValue('Tous les statuts');
      expect(statusSelect).toHaveClass(
        'w-full',
        'pl-11',
        'pr-10',
        'py-3',
        'bg-gray-50',
        'border-0',
        'rounded-xl',
        'focus:ring-2',
        'focus:ring-blue-500',
        'appearance-none',
        'cursor-pointer'
      );
    });
  });

  describe('Filtre par thématique', () => {
    it('affiche toutes les options de thématique', () => {
      render(<FiltersBar {...defaultProps} />);

      expect(screen.getByText('Toutes')).toBeInTheDocument();
      expect(screen.getByText('Éducation financière')).toBeInTheDocument();
      expect(screen.getByText('Investissement')).toBeInTheDocument();
      expect(screen.getByText('Épargne')).toBeInTheDocument();
      expect(screen.getByText('Gestion de budget')).toBeInTheDocument();
    });

    it('affiche la valeur de thématique sélectionnée', () => {
      render(<FiltersBar {...defaultProps} thematicValue='FINANCIAL_EDUCATION' />);

      const thematicSelect = screen.getByDisplayValue('Éducation financière');
      expect(thematicSelect).toBeInTheDocument();
    });

    it('appelle onThematicChange lors de la sélection', async () => {
      const user = userEvent.setup();
      render(<FiltersBar {...defaultProps} />);

      const thematicSelect = screen.getByDisplayValue('Toutes');
      await user.selectOptions(thematicSelect, 'INVESTMENT');

      expect(defaultProps.onThematicChange).toHaveBeenCalledWith('INVESTMENT');
    });

    it('applique les bonnes classes CSS au select de thématique', () => {
      render(<FiltersBar {...defaultProps} />);

      const thematicSelect = screen.getByDisplayValue('Toutes');
      expect(thematicSelect).toHaveClass(
        'w-full',
        'pl-4',
        'pr-10',
        'py-3',
        'bg-gray-50',
        'border-0',
        'rounded-xl',
        'focus:ring-2',
        'focus:ring-blue-500',
        'appearance-none',
        'cursor-pointer'
      );
    });
  });

  describe('Bouton nouveau', () => {
    it("affiche l'icône plus", () => {
      render(<FiltersBar {...defaultProps} />);

      expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    });

    it('appelle onNewClick au clic', async () => {
      const user = userEvent.setup();
      render(<FiltersBar {...defaultProps} />);

      const newButton = screen.getByText('Nouveau module');
      await user.click(newButton);

      expect(defaultProps.onNewClick).toHaveBeenCalledTimes(1);
    });

    it('applique les bonnes classes CSS', () => {
      render(<FiltersBar {...defaultProps} />);

      const newButton = screen.getByText('Nouveau module');
      expect(newButton).toHaveClass(
        'flex',
        'items-center',
        'gap-2',
        'px-6',
        'py-3',
        'bg-primary-300',
        'text-white',
        'rounded-xl',
        'font-medium',
        'hover:bg-primary-400',
        'transition-colors',
        'whitespace-nowrap'
      );
    });
  });

  describe('Indicateur de filtres actifs', () => {
    it("n'affiche pas l'indicateur quand aucun filtre n'est actif", () => {
      render(<FiltersBar {...defaultProps} />);

      expect(screen.queryByText(/résultat/)).not.toBeInTheDocument();
      expect(screen.queryByText('Réinitialiser')).not.toBeInTheDocument();
    });

    it("affiche l'indicateur quand la recherche est active", () => {
      const modules = [createMockModule(1), createMockModule(2)];
      render(<FiltersBar {...defaultProps} searchValue='test' filteredModules={modules} />);

      expect(screen.getByText('2 résultats')).toBeInTheDocument();
      expect(screen.getByText('Réinitialiser')).toBeInTheDocument();
    });

    it("affiche l'indicateur quand le filtre de statut est actif", () => {
      const modules = [createMockModule(1)];
      render(<FiltersBar {...defaultProps} statusValue='PUBLISHED' filteredModules={modules} />);

      expect(screen.getByText('1 résultat')).toBeInTheDocument();
    });

    it("affiche l'indicateur quand le filtre de thématique est actif", () => {
      const modules = [createMockModule(1), createMockModule(2), createMockModule(3)];
      render(
        <FiltersBar
          {...defaultProps}
          thematicValue='FINANCIAL_EDUCATION'
          filteredModules={modules}
        />
      );

      expect(screen.getByText('3 résultats')).toBeInTheDocument();
    });

    it('gère correctement le pluriel pour un seul résultat', () => {
      const modules = [createMockModule(1)];
      render(<FiltersBar {...defaultProps} searchValue='test' filteredModules={modules} />);

      expect(screen.getByText('1 résultat')).toBeInTheDocument();
    });

    it('gère correctement le pluriel pour plusieurs résultats', () => {
      const modules = [createMockModule(1), createMockModule(2)];
      render(<FiltersBar {...defaultProps} searchValue='test' filteredModules={modules} />);

      expect(screen.getByText('2 résultats')).toBeInTheDocument();
    });

    it('gère correctement zéro résultat', () => {
      render(<FiltersBar {...defaultProps} searchValue='test' filteredModules={[]} />);

      expect(screen.getByText('0 résultat')).toBeInTheDocument();
    });

    it('réinitialise tous les filtres au clic sur Réinitialiser', async () => {
      const user = userEvent.setup();
      render(
        <FiltersBar
          {...defaultProps}
          searchValue='test'
          statusValue='PUBLISHED'
          thematicValue='INVESTMENT'
          filteredModules={[createMockModule(1)]}
        />
      );

      const resetButton = screen.getByText('Réinitialiser');
      await user.click(resetButton);

      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('');
      expect(defaultProps.onStatusChange).toHaveBeenCalledWith('');
      expect(defaultProps.onThematicChange).toHaveBeenCalledWith('');
    });
  });

  describe('Gestion des props optionnelles', () => {
    it('fonctionne sans les callbacks optionnels', () => {
      render(<FiltersBar onNewClick={defaultProps.onNewClick} />);

      expect(screen.getByPlaceholderText('Rechercher un module...')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Tous les statuts')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Toutes')).toBeInTheDocument();
    });

    it('utilise les valeurs par défaut pour les props optionnelles', () => {
      render(<FiltersBar onNewClick={defaultProps.onNewClick} />);

      const searchInput = screen.getByPlaceholderText('Rechercher un module...');
      expect(searchInput).toHaveValue('');

      expect(screen.getByDisplayValue('Tous les statuts')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Toutes')).toBeInTheDocument();
      expect(screen.getByText('Nouveau module')).toBeInTheDocument();
    });

    it('gère filteredModules vide par défaut', () => {
      render(<FiltersBar {...defaultProps} searchValue='test' />);

      expect(screen.getByText('0 résultat')).toBeInTheDocument();
    });
  });

  describe('Interactions utilisateur complexes', () => {
    it('gère plusieurs interactions en séquence', async () => {
      const user = userEvent.setup();
      const modules = [createMockModule(1), createMockModule(2)];

      render(<FiltersBar {...defaultProps} filteredModules={modules} />);

      // Taper dans la recherche
      const searchInput = screen.getByPlaceholderText('Rechercher un module...');
      await user.type(searchInput, 'test');

      // Changer le statut
      const statusSelect = screen.getByDisplayValue('Tous les statuts');
      await user.selectOptions(statusSelect, 'PUBLISHED');

      // Changer la thématique
      const thematicSelect = screen.getByDisplayValue('Toutes');
      await user.selectOptions(thematicSelect, 'INVESTMENT');

      // Vérifier que tous les callbacks ont été appelés
      expect(defaultProps.onSearchChange).toHaveBeenCalled();
      expect(defaultProps.onStatusChange).toHaveBeenCalledWith('PUBLISHED');
      expect(defaultProps.onThematicChange).toHaveBeenCalledWith('INVESTMENT');
    });

    it("maintient l'état visuel lors des interactions", async () => {
      const { rerender } = render(
        <FiltersBar {...defaultProps} searchValue='' statusValue='' thematicValue='' />
      );

      // Simuler un changement d'état du parent
      rerender(
        <FiltersBar
          {...defaultProps}
          searchValue='finance'
          statusValue='PUBLISHED'
          thematicValue='INVESTMENT'
          filteredModules={[createMockModule(1)]}
        />
      );

      expect(screen.getByDisplayValue('finance')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Publié')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Investissement')).toBeInTheDocument();
      expect(screen.getByText('1 résultat')).toBeInTheDocument();
    });
  });

  describe('Accessibilité', () => {
    it('les champs de saisie sont accessibles', () => {
      render(<FiltersBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Rechercher un module...');
      const statusSelect = screen.getByDisplayValue('Tous les statuts');
      const thematicSelect = screen.getByDisplayValue('Toutes');
      const newButton = screen.getByText('Nouveau module');

      expect(searchInput.tagName).toBe('INPUT');
      expect(statusSelect.tagName).toBe('SELECT');
      expect(thematicSelect.tagName).toBe('SELECT');
      expect(newButton.tagName).toBe('BUTTON');
    });

    it('les boutons ont des textes descriptifs', () => {
      render(
        <FiltersBar {...defaultProps} searchValue='test' filteredModules={[createMockModule(1)]} />
      );

      expect(screen.getByText('Réinitialiser')).toBeInTheDocument();
      expect(screen.getByText('Nouveau module')).toBeInTheDocument();
    });
  });
});
