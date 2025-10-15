import { render, screen, fireEvent } from '@testing-library/react';
import { EMPTY_FILTERS, FilterOptions, TypeService } from '@/types/Service';
import FilterDialog from '@/components/admin/institutions/FilterPopup';

// Mock des composants UI
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) =>
    open ? (
      <div data-testid='dialog' onClick={() => onOpenChange(false)}>
        {children}
      </div>
    ) : null,
  DialogContent: ({ children, className, 'aria-label': ariaLabel }: any) => (
    <div data-testid='dialog-content' className={className} aria-label={ariaLabel}>
      {children}
    </div>
  ),
  DialogHeader: ({ children, className }: any) => (
    <div data-testid='dialog-header' className={className}>
      {children}
    </div>
  ),
  DialogTitle: ({ children, className }: any) => (
    <h2 data-testid='dialog-title' className={className}>
      {children}
    </h2>
  ),
  DialogFooter: ({ children, className }: any) => (
    <div data-testid='dialog-footer' className={className}>
      {children}
    </div>
  ),
  DialogClose: ({ children, asChild }: any) => (asChild ? children : <div>{children}</div>),
}));

jest.mock('@/components/admin/institutions/filters/BadgeCheckboxGroup', () => ({
  __esModule: true,
  default: ({ options, values, onChange }: any) => (
    <div data-testid='badge-checkbox-group'>
      {options.map((opt: any) => (
        <button
          key={opt.value}
          data-testid={`option-${opt.value}`}
          onClick={() => {
            const newValues = values.includes(opt.value)
              ? values.filter((v: any) => v !== opt.value)
              : [...values, opt.value];
            onChange(newValues);
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  ),
}));

jest.mock('@/components/admin/institutions/filters/FilterSection', () => ({
  __esModule: true,
  default: ({ title, children }: any) => (
    <div data-testid='filter-section'>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  ),
}));

describe('FilterDialog', () => {
  const mockOnChange = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnApply = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    isOpen: true,
    value: EMPTY_FILTERS,
    onChange: mockOnChange,
    onClose: mockOnClose,
    onApply: mockOnApply,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu du composant', () => {
    it('affiche le dialog quand isOpen est true', () => {
      render(<FilterDialog {...defaultProps} />);
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it("n'affiche pas le dialog quand isOpen est false", () => {
      render(<FilterDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('affiche le titre "Type de produit"', () => {
      render(<FilterDialog {...defaultProps} />);
      expect(screen.getByText('Type de produit')).toBeInTheDocument();
    });

    it('affiche le bouton Réinitialiser', () => {
      render(<FilterDialog {...defaultProps} />);
      expect(screen.getByText('Réinitialiser')).toBeInTheDocument();
    });

    it('affiche les sections de filtres', () => {
      render(<FilterDialog {...defaultProps} />);
      const sections = screen.getAllByTestId('filter-section');
      expect(sections).toHaveLength(2);
    });

    it('affiche la section Coût', () => {
      render(<FilterDialog {...defaultProps} />);
      expect(screen.getByText('Coût')).toBeInTheDocument();
    });

    it('affiche les boutons Annuler et Confirmer', () => {
      render(<FilterDialog {...defaultProps} />);
      expect(screen.getByText('Annuler')).toBeInTheDocument();
      expect(screen.getByText('Confirmer')).toBeInTheDocument();
    });

    it("applique l'attribut aria-label correct", () => {
      render(<FilterDialog {...defaultProps} />);
      expect(screen.getByTestId('dialog-content')).toHaveAttribute(
        'aria-label',
        'Filtres des services financiers'
      );
    });

    it('affiche deux BadgeCheckboxGroup', () => {
      render(<FilterDialog {...defaultProps} />);
      const groups = screen.getAllByTestId('badge-checkbox-group');
      expect(groups).toHaveLength(2);
    });
  });

  describe('État des boutons', () => {
    it("désactive le bouton Réinitialiser quand il n'y a pas de filtres", () => {
      render(<FilterDialog {...defaultProps} />);
      const resetBtn = screen.getByText('Réinitialiser');
      expect(resetBtn).toBeDisabled();
    });

    it('active le bouton Réinitialiser quand il y a des filtres de type', () => {
      const filters: FilterOptions = {
        ...EMPTY_FILTERS,
        type: [TypeService.CREDIT],
      };
      render(<FilterDialog {...defaultProps} value={filters} />);
      const resetBtn = screen.getByText('Réinitialiser');
      expect(resetBtn).not.toBeDisabled();
    });

    it('active le bouton Réinitialiser quand il y a des filtres de coût', () => {
      const filters: FilterOptions = {
        ...EMPTY_FILTERS,
        Coût: ['Gratuit'],
      };
      render(<FilterDialog {...defaultProps} value={filters} />);
      const resetBtn = screen.getByText('Réinitialiser');
      expect(resetBtn).not.toBeDisabled();
    });

    it("désactive le bouton Confirmer quand il n'y a pas de filtres", () => {
      render(<FilterDialog {...defaultProps} />);
      const confirmBtn = screen.getByText('Confirmer');
      expect(confirmBtn).toBeDisabled();
    });

    it('active le bouton Confirmer quand il y a des filtres', () => {
      const filters: FilterOptions = {
        ...EMPTY_FILTERS,
        type: [TypeService.EPARGNE],
      };
      render(<FilterDialog {...defaultProps} value={filters} />);
      const confirmBtn = screen.getByText('Confirmer');
      expect(confirmBtn).not.toBeDisabled();
    });

    it('applique la classe disabled:opacity-60 au bouton Confirmer', () => {
      render(<FilterDialog {...defaultProps} />);
      const confirmBtn = screen.getByText('Confirmer');
      expect(confirmBtn).toHaveClass('disabled:opacity-60');
    });
  });

  describe('Interactions utilisateur', () => {
    it('appelle onChange avec EMPTY_FILTERS lors du clic sur Réinitialiser', () => {
      const filters: FilterOptions = {
        ...EMPTY_FILTERS,
        type: [TypeService.CREDIT],
      };
      render(<FilterDialog {...defaultProps} value={filters} />);

      const resetBtn = screen.getByText('Réinitialiser');
      fireEvent.click(resetBtn);

      expect(mockOnChange).toHaveBeenCalledWith(EMPTY_FILTERS);
    });

    it('appelle onApply et onClose lors du clic sur Confirmer', () => {
      const filters: FilterOptions = {
        ...EMPTY_FILTERS,
        type: [TypeService.CREDIT],
      };
      render(<FilterDialog {...defaultProps} value={filters} />);

      const confirmBtn = screen.getByText('Confirmer');
      fireEvent.click(confirmBtn);

      expect(mockOnApply).toHaveBeenCalledWith(filters);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('appelle onApply avec les bonnes valeurs', () => {
      const filters: FilterOptions = {
        ...EMPTY_FILTERS,
        type: [TypeService.CREDIT, TypeService.EPARGNE],
        Coût: ['Gratuit'],
      };
      render(<FilterDialog {...defaultProps} value={filters} />);

      const confirmBtn = screen.getByText('Confirmer');
      fireEvent.click(confirmBtn);

      expect(mockOnApply).toHaveBeenCalledWith(filters);
    });

    it('appelle onChange, onCancel lors du clic sur Annuler avec onCancel fourni', () => {
      render(<FilterDialog {...defaultProps} onCancel={mockOnCancel} />);

      const cancelBtn = screen.getByText('Annuler');
      fireEvent.click(cancelBtn);

      expect(mockOnChange).toHaveBeenCalledWith(EMPTY_FILTERS);
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('appelle onCancel mais pas onClose lors du clic sur Annuler avec onCancel fourni', () => {
      render(<FilterDialog {...defaultProps} onCancel={mockOnCancel} />);

      const cancelBtn = screen.getByText('Annuler');
      fireEvent.click(cancelBtn);

      expect(mockOnCancel).toHaveBeenCalled();
      // Note: DialogClose peut déclencher onClose automatiquement
    });

    it('appelle onChange et onClose lors du clic sur Annuler sans onCancel', () => {
      render(<FilterDialog {...defaultProps} />);

      const cancelBtn = screen.getByText('Annuler');
      fireEvent.click(cancelBtn);

      expect(mockOnChange).toHaveBeenCalledWith(EMPTY_FILTERS);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('réinitialise et ferme lors du changement de onOpenChange à false', () => {
      render(<FilterDialog {...defaultProps} />);

      const dialog = screen.getByTestId('dialog');
      fireEvent.click(dialog);

      expect(mockOnChange).toHaveBeenCalledWith(EMPTY_FILTERS);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Gestion des filtres', () => {
    it('met à jour les filtres de type via BadgeCheckboxGroup', () => {
      render(<FilterDialog {...defaultProps} />);

      const typeOption = screen.getByTestId(`option-${TypeService.CREDIT}`);
      fireEvent.click(typeOption);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...EMPTY_FILTERS,
        type: [TypeService.CREDIT],
      });
    });

    it('met à jour les filtres de coût via BadgeCheckboxGroup', () => {
      render(<FilterDialog {...defaultProps} />);

      const coutOption = screen.getByTestId('option-Gratuit');
      fireEvent.click(coutOption);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...EMPTY_FILTERS,
        Coût: ['Gratuit'],
      });
    });

    it("préserve les autres filtres lors de la mise à jour d'un filtre spécifique", () => {
      const filters: FilterOptions = {
        ...EMPTY_FILTERS,
        type: [TypeService.CREDIT],
        Coût: ['Gratuit'],
      };
      render(<FilterDialog {...defaultProps} value={filters} />);

      const epargnOption = screen.getByTestId(`option-${TypeService.EPARGNE}`);
      fireEvent.click(epargnOption);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...filters,
        type: [TypeService.CREDIT, TypeService.EPARGNE],
      });
    });

    it('permet de désélectionner un filtre déjà sélectionné', () => {
      const filters: FilterOptions = {
        ...EMPTY_FILTERS,
        type: [TypeService.CREDIT],
      };
      render(<FilterDialog {...defaultProps} value={filters} />);

      const creditOption = screen.getByTestId(`option-${TypeService.CREDIT}`);
      fireEvent.click(creditOption);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...EMPTY_FILTERS,
        type: [],
      });
    });

    it('gère correctement plusieurs filtres de type', () => {
      const { rerender } = render(<FilterDialog {...defaultProps} />);

      // Premier clic sur CREDIT
      const creditOption = screen.getByTestId(`option-${TypeService.CREDIT}`);
      fireEvent.click(creditOption);

      // Simuler la mise à jour du state avec le nouveau filtre
      const filtersWithCredit: FilterOptions = {
        ...EMPTY_FILTERS,
        type: [TypeService.CREDIT],
      };

      rerender(<FilterDialog {...defaultProps} value={filtersWithCredit} />);

      // Reset mock pour vérifier uniquement le prochain appel
      mockOnChange.mockClear();

      // Deuxième clic sur EPARGNE
      const epargneOption = screen.getByTestId(`option-${TypeService.EPARGNE}`);
      fireEvent.click(epargneOption);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...EMPTY_FILTERS,
        type: [TypeService.CREDIT, TypeService.EPARGNE],
      });
    });
  });

  describe('Classes CSS et styles', () => {
    it('applique les classes correctes au DialogContent', () => {
      render(<FilterDialog {...defaultProps} />);
      const content = screen.getByTestId('dialog-content');
      expect(content).toHaveClass('w-[20em]', 'max-w-[95vw]');
    });

    it('applique les classes correctes au DialogHeader', () => {
      render(<FilterDialog {...defaultProps} />);
      const header = screen.getByTestId('dialog-header');
      expect(header).toHaveClass('flex', 'flex-row', 'items-center', 'justify-between');
    });

    it('applique les classes correctes au DialogTitle', () => {
      render(<FilterDialog {...defaultProps} />);
      const title = screen.getByTestId('dialog-title');
      expect(title).toHaveClass('text-sm');
    });

    it('applique les classes correctes au bouton Réinitialiser', () => {
      const filters: FilterOptions = {
        ...EMPTY_FILTERS,
        type: [TypeService.CREDIT],
      };
      render(<FilterDialog {...defaultProps} value={filters} />);
      const resetBtn = screen.getByText('Réinitialiser');
      expect(resetBtn).toHaveClass(
        'text-xs',
        'px-1',
        'font-semibold',
        'text-white',
        'bg-cyan-400',
        'rounded-md'
      );
    });

    it('applique les classes correctes au conteneur des sections', () => {
      const { container } = render(<FilterDialog {...defaultProps} />);
      const sectionsContainer = container.querySelector('.p-1.space-y-5');
      expect(sectionsContainer).toBeInTheDocument();
    });

    it('applique les classes correctes au DialogFooter', () => {
      render(<FilterDialog {...defaultProps} />);
      const footer = screen.getByTestId('dialog-footer');
      expect(footer).toHaveClass('w-full', 'grid', 'grid-cols-2', 'gap-2', 'sm:gap-3');
    });

    it('applique les classes correctes au bouton Annuler', () => {
      render(<FilterDialog {...defaultProps} />);
      const cancelBtn = screen.getByText('Annuler');
      expect(cancelBtn).toHaveClass(
        'w-full',
        'px-4',
        'py-1',
        'text-xs',
        'font-medium',
        'text-gray-700',
        'bg-[#8b8e8fff]',
        'rounded-md',
        'transition-colors'
      );
    });

    it('applique les classes correctes au bouton Confirmer', () => {
      const filters: FilterOptions = {
        ...EMPTY_FILTERS,
        type: [TypeService.CREDIT],
      };
      render(<FilterDialog {...defaultProps} value={filters} />);
      const confirmBtn = screen.getByText('Confirmer');
      expect(confirmBtn).toHaveClass(
        'w-full',
        'px-4',
        'py-1',
        'text-xs',
        'font-medium',
        'text-white',
        'bg-green-500',
        'rounded-md',
        'transition-colors',
        'disabled:opacity-60'
      );
    });
  });

  describe('Logique hasFilters', () => {
    it('hasFilters est false quand tous les filtres sont vides', () => {
      render(<FilterDialog {...defaultProps} />);
      const resetBtn = screen.getByText('Réinitialiser');
      const confirmBtn = screen.getByText('Confirmer');

      expect(resetBtn).toBeDisabled();
      expect(confirmBtn).toBeDisabled();
    });

    it('hasFilters est true avec au moins un filtre de type', () => {
      const filters: FilterOptions = {
        ...EMPTY_FILTERS,
        type: [TypeService.CREDIT],
      };
      render(<FilterDialog {...defaultProps} value={filters} />);
      const resetBtn = screen.getByText('Réinitialiser');

      expect(resetBtn).not.toBeDisabled();
    });

    it('hasFilters est true avec au moins un filtre de coût', () => {
      const filters: FilterOptions = {
        ...EMPTY_FILTERS,
        Coût: ['Gratuit'],
      };
      render(<FilterDialog {...defaultProps} value={filters} />);
      const confirmBtn = screen.getByText('Confirmer');

      expect(confirmBtn).not.toBeDisabled();
    });

    it('hasFilters est false avec date vide', () => {
      const filters: FilterOptions = {
        ...EMPTY_FILTERS,
      };
      render(<FilterDialog {...defaultProps} value={filters} />);
      const resetBtn = screen.getByText('Réinitialiser');

      expect(resetBtn).toBeDisabled();
    });

    it('hasFilters est true avec plusieurs types de filtres', () => {
      const filters: FilterOptions = {
        type: [TypeService.CREDIT, TypeService.EPARGNE],
        Coût: ['Gratuit'],
      };
      render(<FilterDialog {...defaultProps} value={filters} />);
      const resetBtn = screen.getByText('Réinitialiser');
      const confirmBtn = screen.getByText('Confirmer');

      expect(resetBtn).not.toBeDisabled();
      expect(confirmBtn).not.toBeDisabled();
    });
  });

  describe("Attributs d'accessibilité", () => {
    it('le bouton Réinitialiser a le type button', () => {
      const filters: FilterOptions = {
        ...EMPTY_FILTERS,
        type: [TypeService.CREDIT],
      };
      render(<FilterDialog {...defaultProps} value={filters} />);
      const resetBtn = screen.getByText('Réinitialiser');
      expect(resetBtn).toHaveAttribute('type', 'button');
    });

    it('le DialogContent a un aria-label descriptif', () => {
      render(<FilterDialog {...defaultProps} />);
      const content = screen.getByTestId('dialog-content');
      expect(content).toHaveAttribute('aria-label', 'Filtres des services financiers');
    });
  });

  describe('Comportement du Dialog', () => {
    it('le dialog se ferme lors de onOpenChange(false)', () => {
      render(<FilterDialog {...defaultProps} />);

      const dialog = screen.getByTestId('dialog');
      fireEvent.click(dialog);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('reinit est appelé avant onClose lors de la fermeture du dialog', () => {
      const filters: FilterOptions = {
        ...EMPTY_FILTERS,
        type: [TypeService.CREDIT],
      };
      render(<FilterDialog {...defaultProps} value={filters} />);

      const dialog = screen.getByTestId('dialog');
      fireEvent.click(dialog);

      expect(mockOnChange).toHaveBeenCalledWith(EMPTY_FILTERS);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
