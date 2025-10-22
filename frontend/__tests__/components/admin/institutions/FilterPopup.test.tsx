// __tests__/components/admin/institutions/FilterPopup.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import FilterDialog, {
  EMPTY_FILTERS,
  FilterOptions,
} from '@/components/admin/institutions/FilterPopup';
import { TypeService } from '@/types/Service';

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

  it('should render the dialog when isOpen is true', () => {
    render(<FilterDialog {...defaultProps} />);

    expect(screen.getByText('Type de produit')).toBeInTheDocument();
    expect(screen.getByText('Coût')).toBeInTheDocument();
    expect(screen.getByText('Réinitialiser')).toBeInTheDocument();
    expect(screen.getByText('Annuler')).toBeInTheDocument();
    expect(screen.getByText('Confirmer')).toBeInTheDocument();
  });

  it('should not render the dialog when isOpen is false', () => {
    render(<FilterDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Type de produit')).not.toBeInTheDocument();
  });

  it('should render all service type options', () => {
    render(<FilterDialog {...defaultProps} />);

    expect(screen.getByText('Paiement marchand')).toBeInTheDocument();
    expect(screen.getByText('Achat de crédit')).toBeInTheDocument();
    expect(screen.getByText("Transferts d'argent")).toBeInTheDocument();
    expect(screen.getByText('Épargne')).toBeInTheDocument();
  });

  it('should render cost filter options', () => {
    render(<FilterDialog {...defaultProps} />);

    expect(screen.getByText('Gratuit')).toBeInTheDocument();
    expect(screen.getByText('Payant')).toBeInTheDocument();
  });

  it('should call onChange when selecting a service type', async () => {
    const user = userEvent.setup();
    render(<FilterDialog {...defaultProps} />);

    const paiementMarchand = screen.getByText('Paiement marchand');
    await user.click(paiementMarchand);

    expect(mockOnChange).toHaveBeenCalledWith({
      type: [TypeService.PAIEMENT_MARCHAND],
      Coût: [],
    });
  });

  it('should call onChange when selecting a cost filter', async () => {
    const user = userEvent.setup();
    render(<FilterDialog {...defaultProps} />);

    const gratuitOption = screen.getByText('Gratuit');
    await user.click(gratuitOption);

    expect(mockOnChange).toHaveBeenCalledWith({
      type: [],
      Coût: [true],
    });
  });

  it('should allow selecting multiple service types', async () => {
    const user = userEvent.setup();
    render(<FilterDialog {...defaultProps} />);

    await user.click(screen.getByText('Paiement marchand'));
    await user.click(screen.getByText("Transferts d'argent"));

    expect(mockOnChange).toHaveBeenCalledTimes(2);
  });

  it('should allow selecting both cost options', async () => {
    const user = userEvent.setup();
    render(<FilterDialog {...defaultProps} />);

    await user.click(screen.getByText('Gratuit'));
    await user.click(screen.getByText('Payant'));

    expect(mockOnChange).toHaveBeenCalledTimes(2);
  });

  it('should disable reset button when no filters are applied', () => {
    render(<FilterDialog {...defaultProps} />);

    const resetButton = screen.getByText('Réinitialiser');
    expect(resetButton).toBeDisabled();
  });

  it('should enable reset button when filters are applied', () => {
    const filtersWithValues: FilterOptions = {
      type: [TypeService.PAIEMENT_MARCHAND],
      Coût: [true],
    };

    render(<FilterDialog {...defaultProps} value={filtersWithValues} />);

    const resetButton = screen.getByText('Réinitialiser');
    expect(resetButton).not.toBeDisabled();
  });

  it('should call onChange with empty filters when reset button is clicked', async () => {
    const user = userEvent.setup();
    const filtersWithValues: FilterOptions = {
      type: [TypeService.PAIEMENT_MARCHAND],
      Coût: [true],
    };

    render(<FilterDialog {...defaultProps} value={filtersWithValues} />);

    const resetButton = screen.getByText('Réinitialiser');
    await user.click(resetButton);

    expect(mockOnChange).toHaveBeenCalledWith(EMPTY_FILTERS);
  });

  it('should disable confirm button when no filters are applied', () => {
    render(<FilterDialog {...defaultProps} />);

    const confirmButton = screen.getByText('Confirmer');
    expect(confirmButton).toBeDisabled();
  });

  it('should enable confirm button when filters are applied', () => {
    const filtersWithValues: FilterOptions = {
      type: [TypeService.PAIEMENT_MARCHAND],
      Coût: [],
    };

    render(<FilterDialog {...defaultProps} value={filtersWithValues} />);

    const confirmButton = screen.getByText('Confirmer');
    expect(confirmButton).not.toBeDisabled();
  });

  it('should call onApply and onClose when confirm button is clicked', async () => {
    const user = userEvent.setup();
    const filtersWithValues: FilterOptions = {
      type: [TypeService.PAIEMENT_MARCHAND],
      Coût: [true],
    };

    render(<FilterDialog {...defaultProps} value={filtersWithValues} />);

    const confirmButton = screen.getByText('Confirmer');
    await user.click(confirmButton);

    expect(mockOnApply).toHaveBeenCalledWith(filtersWithValues);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onChange with empty filters and onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const filtersWithValues: FilterOptions = {
      type: [TypeService.PAIEMENT_MARCHAND],
      Coût: [true],
    };

    render(<FilterDialog {...defaultProps} value={filtersWithValues} />);

    const cancelButton = screen.getByText('Annuler');
    await user.click(cancelButton);

    expect(mockOnChange).toHaveBeenCalledWith(EMPTY_FILTERS);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onCancel when provided and cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(<FilterDialog {...defaultProps} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByText('Annuler');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it.skip('should reset filters and call onClose when dialog is closed via overlay', async () => {});

  it('should handle complete filter workflow', async () => {
    const user = userEvent.setup();
    const mockLocalOnChange = jest.fn();

    render(<FilterDialog {...defaultProps} onChange={mockLocalOnChange} />);

    await user.click(screen.getByText('Paiement marchand'));
    expect(mockLocalOnChange).toHaveBeenCalledWith({
      type: [TypeService.PAIEMENT_MARCHAND],
      Coût: [],
    });

    await user.click(screen.getByText('Gratuit'));
    expect(mockLocalOnChange).toHaveBeenCalledWith({
      type: [],
      Coût: [true],
    });
  });

  it('should properly display selected filters', () => {
    const filtersWithValues: FilterOptions = {
      type: [TypeService.PAIEMENT_MARCHAND, TypeService.TRANSFERT_ARGENT],
      Coût: [true],
    };

    render(<FilterDialog {...defaultProps} value={filtersWithValues} />);

    const paiementCheckbox = screen.getByRole('checkbox', {
      name: /paiement marchand/i,
    });
    const transfertCheckbox = screen.getByRole('checkbox', {
      name: /transferts d'argent/i,
    });
    const gratuitCheckbox = screen.getByRole('checkbox', {
      name: /gratuit/i,
    });

    expect(paiementCheckbox).toBeChecked();
    expect(transfertCheckbox).toBeChecked();
    expect(gratuitCheckbox).toBeChecked();
  });

  it('should allow deselecting filters', async () => {
    const user = userEvent.setup();
    const filtersWithValues: FilterOptions = {
      type: [TypeService.PAIEMENT_MARCHAND],
      Coût: [true],
    };

    render(<FilterDialog {...defaultProps} value={filtersWithValues} />);

    await user.click(screen.getByText('Paiement marchand'));
    expect(mockOnChange).toHaveBeenCalledWith({
      type: [],
      Coût: [true],
    });
  });

  it('should have proper ARIA labels', () => {
    render(<FilterDialog {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Filtres des services financiers');
  });

  it('should have proper button roles', () => {
    const filtersWithValues: FilterOptions = {
      type: [TypeService.PAIEMENT_MARCHAND],
      Coût: [],
    };

    render(<FilterDialog {...defaultProps} value={filtersWithValues} />);

    expect(screen.getByRole('button', { name: /réinitialiser/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmer/i })).toBeInTheDocument();
  });

  it('should handle rapid filter changes', async () => {
    const user = userEvent.setup();
    render(<FilterDialog {...defaultProps} />);

    await user.click(screen.getByText('Paiement marchand'));
    await user.click(screen.getByText('Gratuit'));
    await user.click(screen.getByText('Payant'));

    expect(mockOnChange).toHaveBeenCalledTimes(3);
  });

  it('should maintain filter state when reopening', () => {
    const filtersWithValues: FilterOptions = {
      type: [TypeService.PAIEMENT_MARCHAND],
      Coût: [true],
    };

    const { rerender } = render(
      <FilterDialog {...defaultProps} value={filtersWithValues} isOpen={false} />
    );

    rerender(<FilterDialog {...defaultProps} value={filtersWithValues} isOpen={true} />);

    const paiementCheckbox = screen.getByRole('checkbox', {
      name: /paiement marchand/i,
    });
    expect(paiementCheckbox).toBeChecked();
  });
});

describe('FilterDialog - Cost Filter Mapping', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    isOpen: true,
    value: EMPTY_FILTERS,
    onChange: mockOnChange,
    onClose: jest.fn(),
    onApply: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should map Gratuit to true (isGratuit)', async () => {
    const user = userEvent.setup();
    render(<FilterDialog {...defaultProps} />);

    await user.click(screen.getByText('Gratuit'));

    expect(mockOnChange).toHaveBeenCalledWith({
      type: [],
      Coût: [true],
    });
  });

  it('should map Payant to false (not isGratuit)', async () => {
    const user = userEvent.setup();
    render(<FilterDialog {...defaultProps} />);

    await user.click(screen.getByText('Payant'));

    expect(mockOnChange).toHaveBeenCalledWith({
      type: [],
      Coût: [false],
    });
  });

  it('should allow selecting both Gratuit and Payant with state management', async () => {
    const user = userEvent.setup();
    const mockLocalOnChange = jest.fn();

    const TestWrapper = () => {
      const [filters, setFilters] = React.useState<FilterOptions>(EMPTY_FILTERS);

      const handleChange = (newFilters: FilterOptions) => {
        setFilters(newFilters);
        mockLocalOnChange(newFilters);
      };

      return (
        <FilterDialog
          isOpen={true}
          value={filters}
          onChange={handleChange}
          onClose={jest.fn()}
          onApply={jest.fn()}
        />
      );
    };

    render(<TestWrapper />);

    await user.click(screen.getByText('Gratuit'));

    await user.click(screen.getByText('Payant'));

    expect(mockLocalOnChange).toHaveBeenCalledTimes(2);

    expect(mockLocalOnChange).toHaveBeenNthCalledWith(1, {
      type: [],
      Coût: [true],
    });

    expect(mockLocalOnChange).toHaveBeenNthCalledWith(2, {
      type: [],
      Coût: [true, false],
    });
  });

  it('should deselect a cost filter when clicked again', async () => {
    const user = userEvent.setup();
    const mockLocalOnChange = jest.fn();

    const TestWrapper = () => {
      const [filters, setFilters] = React.useState<FilterOptions>(EMPTY_FILTERS);

      const handleChange = (newFilters: FilterOptions) => {
        setFilters(newFilters);
        mockLocalOnChange(newFilters);
      };

      return (
        <FilterDialog
          isOpen={true}
          value={filters}
          onChange={handleChange}
          onClose={jest.fn()}
          onApply={jest.fn()}
        />
      );
    };

    render(<TestWrapper />);

    await user.click(screen.getByText('Gratuit'));
    expect(mockLocalOnChange).toHaveBeenLastCalledWith({
      type: [],
      Coût: [true],
    });

    await user.click(screen.getByText('Gratuit'));
    expect(mockLocalOnChange).toHaveBeenLastCalledWith({
      type: [],
      Coût: [],
    });
  });
});
