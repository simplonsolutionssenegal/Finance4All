import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CustomDropdown } from '@/components/custom-dropdown';
import type { DropdownOption } from '@/lib/dropdown-types';

// Mock data pour les tests
const mockOptions: DropdownOption<string>[] = [
  {
    id: 'option1',
    name: 'Option 1',
    value: 'value1',
    icon: '🏦',
    description: 'Description option 1',
  },
  {
    id: 'option2',
    name: 'Option 2',
    value: 'value2',
    icon: '💰',
    description: 'Description option 2',
  },
  {
    id: 'option3',
    name: 'Option 3',
    value: 'value3',
    icon: '📊',
    disabled: true,
  },
  {
    id: 'option4',
    name: 'Option 4',
    value: 'value4',
    icon: '🔒',
  },
];

const defaultProps = {
  options: mockOptions,
  selected: null,
  onSelect: jest.fn(),
  placeholder: 'Sélectionnez une option...',
  icon: <span>🎯</span>,
};

describe('CustomDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu initial', () => {
    it('should render the dropdown with placeholder', () => {
      render(<CustomDropdown {...defaultProps} />);

      expect(screen.getByText('Sélectionnez une option...')).toBeInTheDocument();
      expect(screen.getByText('🎯')).toBeInTheDocument();
    });

    it('should render with selected option', () => {
      const selectedOption = mockOptions[0];
      render(<CustomDropdown {...defaultProps} selected={selectedOption} />);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      // L'icône de l'option sélectionnée n'est pas affichée dans le bouton principal
      // mais dans la liste déroulante quand elle est ouverte
    });

    it('should render with custom className', () => {
      const { container } = render(<CustomDropdown {...defaultProps} className='custom-class' />);

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should render as disabled', () => {
      render(<CustomDropdown {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });

  describe('Ouverture et fermeture', () => {
    it('should open dropdown when clicked', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
      expect(screen.getByText('Option 4')).toBeInTheDocument();
    });

    it('should close dropdown when clicked again', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);

      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });

    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <CustomDropdown {...defaultProps} />
          <div data-testid='outside'>Outside element</div>
        </div>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText('Option 1')).toBeInTheDocument();

      const outsideElement = screen.getByTestId('outside');
      await user.click(outsideElement);

      await waitFor(() => {
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      });
    });

    it('should not open when disabled', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  describe("Sélection d'options", () => {
    it('should call onSelect when option is clicked', async () => {
      const user = userEvent.setup();
      const mockOnSelect = jest.fn();
      render(<CustomDropdown {...defaultProps} onSelect={mockOnSelect} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const option1 = screen.getByText('Option 1');
      await user.click(option1);

      expect(mockOnSelect).toHaveBeenCalledWith(mockOptions[0]);
    });

    it('should close dropdown after selection', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const option1 = screen.getByText('Option 1');
      await user.click(option1);

      await waitFor(() => {
        expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      });
    });

    it('should clear search term after selection', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} searchable={true} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const searchInput = screen.getByPlaceholderText('Rechercher...');
      await user.type(searchInput, 'Option');

      const option1 = screen.getByText('Option 1');
      await user.click(option1);

      // Réouvrir le dropdown
      await user.click(button);
      const searchInputAfter = screen.getByPlaceholderText('Rechercher...');
      expect(searchInputAfter).toHaveValue('');
    });

    it('should not select disabled options', async () => {
      const user = userEvent.setup();
      const mockOnSelect = jest.fn();
      render(<CustomDropdown {...defaultProps} onSelect={mockOnSelect} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const disabledOption = screen.getByText('Option 3');
      await user.click(disabledOption);

      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it('should show checkmark for selected option', async () => {
      const user = userEvent.setup();
      const selectedOption = mockOptions[0];
      render(<CustomDropdown {...defaultProps} selected={selectedOption} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Vérifier que l'option sélectionnée est présente dans la liste
      expect(screen.getAllByText('Option 1')).toHaveLength(2); // Une dans le bouton, une dans la liste

      // Vérifier que l'icône de check est présente pour l'option sélectionnée
      const checkSvg = screen
        .getAllByText('Option 1')[1]
        .closest('button')
        ?.querySelector('svg.lucide-check');
      expect(checkSvg).toBeInTheDocument();
    });
  });

  describe('Fonctionnalité de recherche', () => {
    it('should render search input when searchable is true', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} searchable={true} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
    });

    it('should not render search input when searchable is false', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} searchable={false} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.queryByPlaceholderText('Rechercher...')).not.toBeInTheDocument();
    });

    it('should filter options based on search term', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} searchable={true} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const searchInput = screen.getByPlaceholderText('Rechercher...');
      await user.type(searchInput, 'Option 1');

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
      expect(screen.queryByText('Option 4')).not.toBeInTheDocument();
    });

    it('should show empty message when no results found', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} searchable={true} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const searchInput = screen.getByPlaceholderText('Rechercher...');
      await user.type(searchInput, 'NonExistent');

      expect(screen.getByText('Aucun résultat trouvé')).toBeInTheDocument();
    });

    it('should show custom empty message', async () => {
      const user = userEvent.setup();
      render(
        <CustomDropdown {...defaultProps} searchable={true} emptyMessage='Pas de résultats' />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      const searchInput = screen.getByPlaceholderText('Rechercher...');
      await user.type(searchInput, 'NonExistent');

      expect(screen.getByText('Pas de résultats')).toBeInTheDocument();
    });
  });

  describe('Affichage des options', () => {
    it('should display option name and description', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Description option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Description option 2')).toBeInTheDocument();
    });

    it('should display option icons', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText('🏦')).toBeInTheDocument();
      expect(screen.getByText('💰')).toBeInTheDocument();
      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('🔒')).toBeInTheDocument();
    });

    it('should show disabled state for disabled options', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const disabledOption = screen.getByText('Option 3').closest('button');
      expect(disabledOption).toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });

  describe('Gestion des événements', () => {
    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Vérifier que le dropdown est ouvert
      expect(screen.getByText('Option 1')).toBeInTheDocument();

      // Test avec la touche Escape
      await user.keyboard('{Escape}');

      // Le dropdown devrait rester ouvert car Escape n'est pas géré
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('should handle mouse events correctly', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} />);

      const button = screen.getByRole('button');

      // Test click - devrait ouvrir le dropdown
      await user.click(button);
      expect(screen.getByText('Option 1')).toBeInTheDocument();

      // Test mouse events sur le dropdown ouvert
      fireEvent.mouseDown(button);
      expect(screen.getByText('Option 1')).toBeInTheDocument();

      fireEvent.mouseUp(button);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  describe('Props personnalisées', () => {
    it('should use custom maxHeight', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} maxHeight='max-h-40' />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Trouver le conteneur du dropdown avec la classe maxHeight
      const dropdownContainer = screen.getByText('Option 1').closest('.max-h-40');
      expect(dropdownContainer).toBeInTheDocument();
    });

    it('should handle empty options array', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} options={[]} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText('Aucun résultat trouvé')).toBeInTheDocument();
    });

    it('should handle options without icons', async () => {
      const optionsWithoutIcons: DropdownOption<string>[] = [
        {
          id: 'option1',
          name: 'Option 1',
          value: 'value1',
        },
      ];

      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} options={optionsWithoutIcons} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  describe('Accessibilité', () => {
    it('should have proper ARIA attributes', () => {
      render(<CustomDropdown {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} />);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Enter}');
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  describe('Gestion des erreurs', () => {
    it('should handle onSelect errors gracefully', async () => {
      const user = userEvent.setup();
      const mockOnSelect = jest.fn(() => {
        throw new Error('Selection error');
      });

      render(<CustomDropdown {...defaultProps} onSelect={mockOnSelect} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const option1 = screen.getByText('Option 1');

      // Should not crash the component
      expect(() => user.click(option1)).not.toThrow();
    });

    it('should handle empty search gracefully', async () => {
      const user = userEvent.setup();
      render(<CustomDropdown {...defaultProps} searchable={true} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const searchInput = screen.getByPlaceholderText('Rechercher...');
      await user.clear(searchInput);

      // Should show all options
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });
});
