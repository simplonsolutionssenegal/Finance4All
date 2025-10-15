import { render, screen, fireEvent } from '@testing-library/react';
import BadgeCheckboxGroup, {
  Option,
} from '@/components/admin/institutions/filters/BadgeCheckboxGroup';

// Mock du composant Badge
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, variant }: any) => (
    <div data-testid='badge' className={className} data-variant={variant}>
      {children}
    </div>
  ),
}));

// Mock de l'icône Check
jest.mock('lucide-react', () => ({
  Check: ({ className, strokeWidth }: any) => (
    <span data-testid='check-icon' className={className} data-stroke-width={strokeWidth} />
  ),
}));

describe('BadgeCheckboxGroup', () => {
  const mockOnChange = jest.fn();

  const testOptions: ReadonlyArray<Option<string>> = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const defaultProps = {
    options: testOptions,
    values: [] as string[],
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu du composant', () => {
    it('affiche toutes les options', () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('affiche le bon nombre de badges', () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const badges = screen.getAllByTestId('badge');
      expect(badges).toHaveLength(3);
    });

    it('affiche le bon nombre de checkboxes', () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
    });

    it("affiche le bon nombre d'icônes Check", () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const icons = screen.getAllByTestId('check-icon');
      expect(icons).toHaveLength(3);
    });

    it('génère des IDs uniques pour chaque checkbox', () => {
      render(<BadgeCheckboxGroup {...defaultProps} idPrefix='test' />);

      const checkbox1 = screen.getByLabelText('Option 1');
      const checkbox2 = screen.getByLabelText('Option 2');
      const checkbox3 = screen.getByLabelText('Option 3');

      expect(checkbox1).toHaveAttribute('id', 'test-option1-0');
      expect(checkbox2).toHaveAttribute('id', 'test-option2-1');
      expect(checkbox3).toHaveAttribute('id', 'test-option3-2');
    });

    it('utilise le idPrefix par défaut "chk"', () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const checkbox = screen.getByLabelText('Option 1');
      expect(checkbox).toHaveAttribute('id', 'chk-option1-0');
    });

    it('applique le name aux checkboxes si fourni', () => {
      render(<BadgeCheckboxGroup {...defaultProps} name='test-group' />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('name', 'test-group');
      });
    });

    it('applique la className personnalisée au conteneur', () => {
      const { container } = render(
        <BadgeCheckboxGroup {...defaultProps} className='custom-class' />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('applique toujours les classes de base', () => {
      const { container } = render(<BadgeCheckboxGroup {...defaultProps} />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex', 'flex-wrap', 'gap-2');
    });
  });

  describe('État des checkboxes', () => {
    it('toutes les checkboxes sont décochées par défaut', () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).not.toBeChecked();
      });
    });

    it('coche les checkboxes correspondant aux valeurs sélectionnées', () => {
      render(<BadgeCheckboxGroup {...defaultProps} values={['option1', 'option3']} />);

      const checkbox1 = screen.getByLabelText('Option 1');
      const checkbox2 = screen.getByLabelText('Option 2');
      const checkbox3 = screen.getByLabelText('Option 3');

      expect(checkbox1).toBeChecked();
      expect(checkbox2).not.toBeChecked();
      expect(checkbox3).toBeChecked();
    });

    it('applique les bonnes classes aux badges sélectionnés', () => {
      const { container } = render(<BadgeCheckboxGroup {...defaultProps} values={['option1']} />);

      const selectedSpan = container.querySelector('input:checked + label span');
      expect(selectedSpan).toHaveClass('bg-green-500', 'border-green-500');
    });

    it('applique les bonnes classes aux badges non sélectionnés', () => {
      const { container } = render(<BadgeCheckboxGroup {...defaultProps} />);

      const unselectedSpan = container.querySelector('input:not(:checked) + label span');
      expect(unselectedSpan).toHaveClass('bg-white', 'border-gray-300');
    });

    it("affiche l'icône Check en blanc pour les options sélectionnées", () => {
      render(<BadgeCheckboxGroup {...defaultProps} values={['option1']} />);

      const icons = screen.getAllByTestId('check-icon');
      expect(icons[0]).toHaveClass('text-white');
    });

    it("affiche l'icône Check transparente pour les options non sélectionnées", () => {
      render(<BadgeCheckboxGroup {...defaultProps} values={['option1']} />);

      const icons = screen.getAllByTestId('check-icon');
      expect(icons[1]).toHaveClass('text-transparent');
      expect(icons[2]).toHaveClass('text-transparent');
    });
  });

  describe('Interactions utilisateur', () => {
    it('appelle onChange avec la nouvelle valeur lors du clic sur une option', () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const checkbox1 = screen.getByLabelText('Option 1');
      fireEvent.click(checkbox1);

      expect(mockOnChange).toHaveBeenCalledWith(['option1']);
    });

    it('appelle onChange avec la valeur lors du clic sur le label', () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const label = screen.getByText('Option 2');
      fireEvent.click(label);

      expect(mockOnChange).toHaveBeenCalledWith(['option2']);
    });

    it('ajoute une valeur aux valeurs existantes', () => {
      render(<BadgeCheckboxGroup {...defaultProps} values={['option1']} />);

      const checkbox2 = screen.getByLabelText('Option 2');
      fireEvent.click(checkbox2);

      expect(mockOnChange).toHaveBeenCalledWith(['option1', 'option2']);
    });

    it('retire une valeur déjà sélectionnée', () => {
      render(<BadgeCheckboxGroup {...defaultProps} values={['option1', 'option2']} />);

      const checkbox1 = screen.getByLabelText('Option 1');
      fireEvent.click(checkbox1);

      expect(mockOnChange).toHaveBeenCalledWith(['option2']);
    });

    it('gère la sélection multiple', () => {
      const { rerender } = render(<BadgeCheckboxGroup {...defaultProps} />);

      // Première sélection
      const checkbox1 = screen.getByLabelText('Option 1');
      fireEvent.click(checkbox1);
      expect(mockOnChange).toHaveBeenCalledWith(['option1']);

      // Mise à jour avec la nouvelle valeur
      rerender(<BadgeCheckboxGroup {...defaultProps} values={['option1']} />);

      // Deuxième sélection
      const checkbox2 = screen.getByLabelText('Option 2');
      fireEvent.click(checkbox2);
      expect(mockOnChange).toHaveBeenCalledWith(['option1', 'option2']);
    });

    it('gère la désélection de toutes les options', () => {
      render(<BadgeCheckboxGroup {...defaultProps} values={['option1']} />);

      const checkbox1 = screen.getByLabelText('Option 1');
      fireEvent.click(checkbox1);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it("préserve l'ordre des valeurs lors de l'ajout", () => {
      render(<BadgeCheckboxGroup {...defaultProps} values={['option1', 'option3']} />);

      const checkbox2 = screen.getByLabelText('Option 2');
      fireEvent.click(checkbox2);

      expect(mockOnChange).toHaveBeenCalledWith(['option1', 'option3', 'option2']);
    });
  });

  describe('Accessibilité', () => {
    it('les checkboxes sont cachées visuellement avec sr-only', () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveClass('sr-only');
      });
    });

    it('les checkboxes ont la classe peer pour le focus', () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveClass('peer');
      });
    });

    it('les labels sont associés aux checkboxes via htmlFor', () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const checkbox1 = screen.getByLabelText('Option 1');
      expect(checkbox1).toBeInTheDocument();
    });

    it('les badges ont un cursor pointer', () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const badges = screen.getAllByTestId('badge');
      badges.forEach(badge => {
        expect(badge).toHaveClass('cursor-pointer');
      });
    });

    it('les spans indicateurs ont aria-hidden', () => {
      const { container } = render(<BadgeCheckboxGroup {...defaultProps} />);

      const spans = container.querySelectorAll('span[aria-hidden="true"]');
      expect(spans.length).toBe(3);
    });

    it('les badges ont la classe select-none', () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const badges = screen.getAllByTestId('badge');
      badges.forEach(badge => {
        expect(badge).toHaveClass('select-none');
      });
    });

    it('les badges ont les classes de focus visible', () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const badges = screen.getAllByTestId('badge');
      badges.forEach(badge => {
        expect(badge).toHaveClass('peer-focus-visible:ring-2', 'peer-focus-visible:ring-offset-2');
      });
    });
  });

  describe('Styles des badges', () => {
    it('applique le variant outline aux badges', () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const badges = screen.getAllByTestId('badge');
      badges.forEach(badge => {
        expect(badge).toHaveAttribute('data-variant', 'outline');
      });
    });

    it('applique les classes de style correctes aux badges', () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const badges = screen.getAllByTestId('badge');
      badges.forEach(badge => {
        expect(badge).toHaveClass(
          'rounded-full',
          'px-1.5',
          'bg-[#F7F7F7]',
          'border-[#EAEAEA]',
          'text-[12px]',
          'font-medium',
          'text-[#2B2B2B]',
          'inline-flex',
          'items-center',
          'gap-1'
        );
      });
    });

    it("l'icône Check a le bon strokeWidth", () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const icons = screen.getAllByTestId('check-icon');
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('data-stroke-width', '3');
      });
    });

    it("l'icône Check a la bonne classe de taille", () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const icons = screen.getAllByTestId('check-icon');
      icons.forEach(icon => {
        expect(icon).toHaveClass('h-3', 'w-3');
      });
    });
  });

  describe('Gestion des types génériques', () => {
    it('fonctionne avec des types string littéraux', () => {
      type Status = 'active' | 'inactive' | 'pending';
      const statusOptions: ReadonlyArray<Option<Status>> = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
      ];

      const onChange = jest.fn<void, [Status[]]>();

      render(
        <BadgeCheckboxGroup<Status> options={statusOptions} values={[]} onChange={onChange} />
      );

      const checkbox = screen.getByLabelText('Active');
      fireEvent.click(checkbox);

      expect(onChange).toHaveBeenCalledWith(['active']);
    });
  });

  describe('Cas limites', () => {
    it("fonctionne avec une liste vide d'options", () => {
      render(<BadgeCheckboxGroup {...defaultProps} options={[]} />);

      const badges = screen.queryAllByTestId('badge');
      expect(badges).toHaveLength(0);
    });

    it('fonctionne avec une seule option', () => {
      const singleOption: ReadonlyArray<Option<string>> = [{ value: 'only', label: 'Only Option' }];

      render(<BadgeCheckboxGroup {...defaultProps} options={singleOption} />);

      expect(screen.getByText('Only Option')).toBeInTheDocument();
    });

    it('gère correctement les valeurs avec des caractères spéciaux', () => {
      const specialOptions: ReadonlyArray<Option<string>> = [
        { value: 'option-with-dash', label: 'Option With Dash' },
        { value: 'option_with_underscore', label: 'Option With Underscore' },
      ];

      render(<BadgeCheckboxGroup {...defaultProps} options={specialOptions} />);

      const checkbox = screen.getByLabelText('Option With Dash');
      expect(checkbox).toHaveAttribute('value', 'option-with-dash');
    });

    it("n'appelle pas onChange plusieurs fois pour le même clic", () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const checkbox = screen.getByLabelText('Option 1');
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Valeurs des checkboxes', () => {
    it("les checkboxes ont la bonne valeur d'attribut", () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const checkbox1 = screen.getByLabelText('Option 1');
      const checkbox2 = screen.getByLabelText('Option 2');
      const checkbox3 = screen.getByLabelText('Option 3');

      expect(checkbox1).toHaveAttribute('value', 'option1');
      expect(checkbox2).toHaveAttribute('value', 'option2');
      expect(checkbox3).toHaveAttribute('value', 'option3');
    });

    it('les checkboxes ont le type checkbox', () => {
      render(<BadgeCheckboxGroup {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('type', 'checkbox');
      });
    });
  });
});
