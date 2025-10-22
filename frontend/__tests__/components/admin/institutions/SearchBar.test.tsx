import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '@/components/admin/institutions/SearchBar';
import { TypeService } from '@/types/Service';
import { EMPTY_FILTERS, FilterOptions } from '@/components/admin/institutions/FilterPopup';

// Mock des composants UI
jest.mock('@/components/ui/input', () => ({
  Input: ({ className, ...props }: any) => (
    <input data-testid='search-input' className={className} {...props} />
  ),
}));

jest.mock('@/components/admin/institutions/FilterPopup', () => ({
  __esModule: true,
  default: ({ isOpen, value, onChange, onClose, onApply, onCancel }: any) =>
    isOpen ? (
      <div data-testid='filter-popup'>
        <button data-testid='popup-apply' onClick={() => onApply(value)}>
          Apply
        </button>
        <button data-testid='popup-cancel' onClick={onCancel}>
          Cancel
        </button>
        <button data-testid='popup-close' onClick={onClose}>
          Close
        </button>
        <button
          data-testid='popup-change'
          onClick={() =>
            onChange({
              ...value,
              type: [TypeService.CREDIT],
            })
          }
        >
          Change Filter
        </button>
      </div>
    ) : null,
}));

// Mock des icônes Lucide
jest.mock('lucide-react', () => ({
  Filter: ({ className }: any) => <span data-testid='filter-icon' className={className} />,
  Search: ({ className }: any) => <span data-testid='search-icon' className={className} />,
}));

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();
  const mockOnApplyFilters = jest.fn();

  const defaultProps = {
    onSearch: mockOnSearch,
    resultsCount: 42,
    onApplyFilters: mockOnApplyFilters,
    currentFilters: EMPTY_FILTERS,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu du composant', () => {
    it('affiche le titre avec le nombre de résultats', () => {
      render(<SearchBar {...defaultProps} />);
      expect(screen.getByText('Services financiers (42)')).toBeInTheDocument();
    });

    it('affiche le nombre de résultats mis à jour', () => {
      const { rerender } = render(<SearchBar {...defaultProps} />);
      expect(screen.getByText('Services financiers (42)')).toBeInTheDocument();

      rerender(<SearchBar {...defaultProps} resultsCount={10} />);
      expect(screen.getByText('Services financiers (10)')).toBeInTheDocument();
    });

    it('affiche le champ de recherche avec le placeholder', () => {
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Rechercher un service...');
      expect(input).toBeInTheDocument();
    });

    it("affiche l'icône de recherche", () => {
      render(<SearchBar {...defaultProps} />);
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it("affiche le bouton Filtrer avec l'icône", () => {
      render(<SearchBar {...defaultProps} />);
      const filterButton = screen.getByRole('button', { name: /filtrer/i });
      expect(filterButton).toBeInTheDocument();
      expect(screen.getByTestId('filter-icon')).toBeInTheDocument();
    });

    it("n'affiche pas le popup de filtre initialement", () => {
      render(<SearchBar {...defaultProps} />);
      expect(screen.queryByTestId('filter-popup')).not.toBeInTheDocument();
    });
  });

  describe('Fonctionnalité de recherche', () => {
    it('met à jour la valeur du champ de recherche lors de la saisie', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      const input = screen.getByPlaceholderText('Rechercher un service...');
      await user.type(input, 'compte');

      expect(input).toHaveValue('compte');
    });

    it('appelle onSearch avec la valeur saisie', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      const input = screen.getByPlaceholderText('Rechercher un service...');
      await user.type(input, 'épargne');

      expect(mockOnSearch).toHaveBeenCalledTimes(7); // Une fois par caractère
      expect(mockOnSearch).toHaveBeenLastCalledWith('épargne');
    });

    it('appelle onSearch pour chaque caractère saisi', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      const input = screen.getByPlaceholderText('Rechercher un service...');
      await user.type(input, 'abc');

      expect(mockOnSearch).toHaveBeenCalledWith('a');
      expect(mockOnSearch).toHaveBeenCalledWith('ab');
      expect(mockOnSearch).toHaveBeenCalledWith('abc');
    });

    it('gère la suppression de texte', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      const input = screen.getByPlaceholderText('Rechercher un service...');
      await user.type(input, 'test');

      mockOnSearch.mockClear();

      await user.clear(input);

      expect(mockOnSearch).toHaveBeenCalledWith('');
    });
  });

  describe('Gestion du popup de filtres', () => {
    it('ouvre le popup lors du clic sur le bouton Filtrer', () => {
      render(<SearchBar {...defaultProps} />);

      const filterButton = screen.getByRole('button', { name: /filtrer/i });
      fireEvent.click(filterButton);

      expect(screen.getByTestId('filter-popup')).toBeInTheDocument();
    });

    it('ferme le popup lors du clic sur Close', () => {
      render(<SearchBar {...defaultProps} />);

      const filterButton = screen.getByRole('button', { name: /filtrer/i });
      fireEvent.click(filterButton);

      const closeButton = screen.getByTestId('popup-close');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('filter-popup')).not.toBeInTheDocument();
    });

    it("initialise le popup avec les filtres actuels lors de l'ouverture", () => {
      const filters: FilterOptions = {
        ...EMPTY_FILTERS,
        type: [TypeService.CREDIT],
      };

      render(<SearchBar {...defaultProps} currentFilters={filters} />);

      const filterButton = screen.getByRole('button', { name: /filtrer/i });
      fireEvent.click(filterButton);

      expect(screen.getByTestId('filter-popup')).toBeInTheDocument();
    });

    it('réinitialise les filtres avec EMPTY_FILTERS quand currentFilters est undefined', () => {
      const { rerender } = render(<SearchBar {...defaultProps} />);

      const filterButton = screen.getByRole('button', { name: /filtrer/i });
      fireEvent.click(filterButton);

      // Le popup devrait être initialisé avec EMPTY_FILTERS
      expect(screen.getByTestId('filter-popup')).toBeInTheDocument();
    });
  });

  describe('Application des filtres', () => {
    it("appelle onApplyFilters et ferme le popup lors de l'application", () => {
      render(<SearchBar {...defaultProps} />);

      // Ouvrir le popup
      const filterButton = screen.getByRole('button', { name: /filtrer/i });
      fireEvent.click(filterButton);

      // Appliquer les filtres
      const applyButton = screen.getByTestId('popup-apply');
      fireEvent.click(applyButton);

      expect(mockOnApplyFilters).toHaveBeenCalled();
      expect(screen.queryByTestId('filter-popup')).not.toBeInTheDocument();
    });

    it('applique les filtres modifiés', () => {
      render(<SearchBar {...defaultProps} />);

      // Ouvrir le popup
      const filterButton = screen.getByRole('button', { name: /filtrer/i });
      fireEvent.click(filterButton);

      // Modifier les filtres
      const changeButton = screen.getByTestId('popup-change');
      fireEvent.click(changeButton);

      // Appliquer les filtres
      const applyButton = screen.getByTestId('popup-apply');
      fireEvent.click(applyButton);

      expect(mockOnApplyFilters).toHaveBeenCalledWith({
        ...EMPTY_FILTERS,
        type: [TypeService.CREDIT],
      });
    });

    it("ne fait rien si onApplyFilters n'est pas fourni", () => {
      render(<SearchBar {...defaultProps} onApplyFilters={undefined} />);

      const filterButton = screen.getByRole('button', { name: /filtrer/i });
      fireEvent.click(filterButton);

      const applyButton = screen.getByTestId('popup-apply');

      // Ne devrait pas lancer d'erreur
      expect(() => fireEvent.click(applyButton)).not.toThrow();
    });
  });

  describe('Annulation des filtres', () => {
    it("réinitialise les filtres et ferme le popup lors de l'annulation", () => {
      const filters: FilterOptions = {
        ...EMPTY_FILTERS,
        type: [TypeService.CREDIT],
      };

      render(<SearchBar {...defaultProps} currentFilters={filters} />);

      // Ouvrir le popup
      const filterButton = screen.getByRole('button', { name: /filtrer/i });
      fireEvent.click(filterButton);

      // Annuler
      const cancelButton = screen.getByTestId('popup-cancel');
      fireEvent.click(cancelButton);

      expect(mockOnApplyFilters).toHaveBeenCalledWith(EMPTY_FILTERS);
      expect(screen.queryByTestId('filter-popup')).not.toBeInTheDocument();
    });

    it("ne fait rien si onApplyFilters n'est pas fourni lors de l'annulation", () => {
      render(<SearchBar {...defaultProps} onApplyFilters={undefined} />);

      const filterButton = screen.getByRole('button', { name: /filtrer/i });
      fireEvent.click(filterButton);

      const cancelButton = screen.getByTestId('popup-cancel');

      // Ne devrait pas lancer d'erreur
      expect(() => fireEvent.click(cancelButton)).not.toThrow();
    });
  });

  describe('Styles et classes CSS', () => {
    it('applique les classes correctes au conteneur principal', () => {
      const { container } = render(<SearchBar {...defaultProps} />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('bg-white', 'rounded-lg');
    });

    it('applique les classes correctes au champ de recherche', () => {
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByTestId('search-input');
      expect(input).toHaveClass('pl-10', 'pr-4', 'py-2', 'border-gray-300', 'rounded-lg');
    });

    it('applique les classes correctes au bouton Filtrer', () => {
      render(<SearchBar {...defaultProps} />);
      const filterButton = screen.getByRole('button', { name: /filtrer/i });
      expect(filterButton).toHaveClass(
        'h-9',
        'bg-gray-900',
        'hover:bg-gray-800',
        'text-white',
        'font-medium',
        'py-2',
        'px-4',
        'rounded-md'
      );
    });
  });

  describe('Comportement avec différentes valeurs de props', () => {
    it('fonctionne avec resultsCount à 0', () => {
      render(<SearchBar {...defaultProps} resultsCount={0} />);
      expect(screen.getByText('Services financiers (0)')).toBeInTheDocument();
    });

    it('fonctionne avec un grand nombre de résultats', () => {
      render(<SearchBar {...defaultProps} resultsCount={999999} />);
      expect(screen.getByText('Services financiers (999999)')).toBeInTheDocument();
    });

    it('gère les filtres actuels avec plusieurs valeurs', () => {
      const filters: FilterOptions = {
        ...EMPTY_FILTERS,
        type: [TypeService.CREDIT, TypeService.EPARGNE],
        Coût: [true],
      };

      render(<SearchBar {...defaultProps} currentFilters={filters} />);

      const filterButton = screen.getByRole('button', { name: /filtrer/i });
      fireEvent.click(filterButton);

      expect(screen.getByTestId('filter-popup')).toBeInTheDocument();
    });
  });

  describe('Interactions combinées', () => {
    it("conserve la valeur de recherche après l'ouverture et la fermeture du popup", async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      // Saisir une recherche
      const input = screen.getByPlaceholderText('Rechercher un service...');
      await user.type(input, 'test');

      // Ouvrir et fermer le popup
      const filterButton = screen.getByRole('button', { name: /filtrer/i });
      fireEvent.click(filterButton);

      const closeButton = screen.getByTestId('popup-close');
      fireEvent.click(closeButton);

      // La valeur de recherche devrait être conservée
      expect(input).toHaveValue('test');
    });

    it('permet de rechercher et filtrer simultanément', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      // Saisir une recherche
      const input = screen.getByPlaceholderText('Rechercher un service...');
      await user.type(input, 'compte');

      // Ouvrir le popup et appliquer des filtres
      const filterButton = screen.getByRole('button', { name: /filtrer/i });
      fireEvent.click(filterButton);

      const changeButton = screen.getByTestId('popup-change');
      fireEvent.click(changeButton);

      const applyButton = screen.getByTestId('popup-apply');
      fireEvent.click(applyButton);

      expect(mockOnSearch).toHaveBeenCalled();
      expect(mockOnApplyFilters).toHaveBeenCalled();
      expect(input).toHaveValue('compte');
    });
  });
});
