import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ServiceFilters } from '@/components/services-financiers/ServiceFilters';
import type { FilterOptions } from '@/types/FinancialServices';

// Mock the Button component since it's imported
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, className }: any) => (
    <button onClick={onClick} className={className} data-variant={variant}>
      {children}
    </button>
  ),
}));

const mockOnFiltersChange = jest.fn();
const mockOnToggle = jest.fn();

const defaultProps = {
  filters: {
    serviceType: [],
    geographicZone: [],
    institut: [],
    date: 'Récente' as const,
  },
  onFiltersChange: mockOnFiltersChange,
  isOpen: true,
  onToggle: mockOnToggle,
};

describe('ServiceFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<ServiceFilters {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Filtres')).not.toBeInTheDocument();
    });

    it('should render modal when isOpen is true', () => {
      render(<ServiceFilters {...defaultProps} isOpen={true} />);
      expect(screen.getByText('Filtres')).toBeInTheDocument();
      expect(screen.getByText('Type de produit')).toBeInTheDocument();
      expect(screen.getByText('Zone géographique')).toBeInTheDocument();
      expect(screen.getByText('Institut')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<ServiceFilters {...defaultProps} />);
      const closeButton = screen.getByRole('button', { name: /fermer/i });
      expect(closeButton).toBeInTheDocument();
      // The close button contains an X icon from lucide-react
    });

    it('should render filter options correctly', () => {
      render(<ServiceFilters {...defaultProps} />);

      // Check service types
      expect(screen.getByText('Epargne')).toBeInTheDocument();
      expect(screen.getByText('Crédit')).toBeInTheDocument();
      expect(screen.getByText('Autre type')).toBeInTheDocument();

      // Check geographic zones
      expect(screen.getByText('Zone Géo A')).toBeInTheDocument();
      expect(screen.getByText('Zone Géo B')).toBeInTheDocument();

      // Check institutions
      expect(screen.getByText('SIMPLON')).toBeInTheDocument();
      expect(screen.getByText('PAYTECH SN')).toBeInTheDocument();
      expect(screen.getByText('ODK')).toBeInTheDocument();

      // Check dates
      expect(screen.getByText('Récente')).toBeInTheDocument();
      expect(screen.getByText('Il y a 3 mois')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<ServiceFilters {...defaultProps} />);
      expect(screen.getByText('Annuler')).toBeInTheDocument();
      expect(screen.getByText('Confirmer')).toBeInTheDocument();
    });

    it('should render reset button', () => {
      render(<ServiceFilters {...defaultProps} />);
      expect(screen.getByText('Réinstaller')).toBeInTheDocument();
    });
  });

  describe('Checkbox interactions', () => {
    it('should handle service type checkbox selection', async () => {
      const user = userEvent.setup();
      render(<ServiceFilters {...defaultProps} />);

      const epargneCheckbox = screen.getByRole('checkbox', { name: /epargne/i });
      await user.click(epargneCheckbox);

      expect(mockOnFiltersChange).not.toHaveBeenCalled(); // Should only update local state
    });

    it('should handle geographic zone checkbox selection', async () => {
      const user = userEvent.setup();
      render(<ServiceFilters {...defaultProps} />);

      const zoneCheckbox = screen.getByRole('checkbox', { name: /zone géo a/i });
      await user.click(zoneCheckbox);

      expect(mockOnFiltersChange).not.toHaveBeenCalled(); // Should only update local state
    });

    it('should handle institution checkbox selection', async () => {
      const user = userEvent.setup();
      render(<ServiceFilters {...defaultProps} />);

      const simplonCheckbox = screen.getByRole('checkbox', { name: /simplon/i });
      await user.click(simplonCheckbox);

      expect(mockOnFiltersChange).not.toHaveBeenCalled(); // Should only update local state
    });

    it('should handle multiple checkbox selections', async () => {
      const user = userEvent.setup();
      render(<ServiceFilters {...defaultProps} />);

      const epargneCheckbox = screen.getByRole('checkbox', { name: /epargne/i });
      const zoneCheckbox = screen.getByRole('checkbox', { name: /zone géo a/i });

      await user.click(epargneCheckbox);
      await user.click(zoneCheckbox);

      expect(mockOnFiltersChange).not.toHaveBeenCalled(); // Should only update local state
    });

    it('should show checked state for selected filters', () => {
      const initialFilters: FilterOptions = {
        serviceType: ['Epargne'],
        geographicZone: ['Zone Géo A'],
        institut: ['SIMPLON'],
        date: 'Récente',
      };

      render(<ServiceFilters {...defaultProps} filters={initialFilters} />);

      const epargneCheckbox = screen.getByRole('checkbox', { name: /epargne/i });
      const zoneCheckbox = screen.getByRole('checkbox', { name: /zone géo a/i });
      const simplonCheckbox = screen.getByRole('checkbox', { name: /simplon/i });

      expect(epargneCheckbox).toBeChecked();
      expect(zoneCheckbox).toBeChecked();
      expect(simplonCheckbox).toBeChecked();
    });
  });

  describe('Radio button interactions', () => {
    it('should handle date radio button selection', async () => {
      const user = userEvent.setup();
      render(<ServiceFilters {...defaultProps} />);

      const oldDateRadio = screen.getByRole('radio', { name: /il y a 3 mois/i });
      await user.click(oldDateRadio);

      expect(mockOnFiltersChange).not.toHaveBeenCalled(); // Should only update local state
    });

    it('should maintain only one selected date option', async () => {
      const user = userEvent.setup();
      render(<ServiceFilters {...defaultProps} />);

      const recentRadio = screen.getByRole('radio', { name: /récente/i });
      const oldDateRadio = screen.getByRole('radio', { name: /il y a 3 mois/i });

      // Initially, "Récente" should be checked
      expect(recentRadio).toBeChecked();
      expect(oldDateRadio).not.toBeChecked();

      // Click the old date option
      await user.click(oldDateRadio);

      // Now only old date should be checked
      expect(recentRadio).not.toBeChecked();
      expect(oldDateRadio).toBeChecked();
    });
  });

  describe('Reset functionality', () => {
    it('should reset all filters when reset button is clicked', async () => {
      const user = userEvent.setup();

      // Start with some selected filters
      const initialFilters: FilterOptions = {
        serviceType: ['Epargne'],
        geographicZone: ['Zone Géo A'],
        institut: ['SIMPLON'],
        date: 'Il y a 3 mois',
      };

      render(<ServiceFilters {...defaultProps} filters={initialFilters} />);

      // Click reset button
      const resetButton = screen.getByText('Réinstaller');
      await user.click(resetButton);

      // All checkboxes should be unchecked and radio should be reset to default
      const epargneCheckbox = screen.getByRole('checkbox', { name: /epargne/i });
      const zoneCheckbox = screen.getByRole('checkbox', { name: /zone géo a/i });
      const recentRadio = screen.getByRole('radio', { name: /récente/i });

      expect(epargneCheckbox).not.toBeChecked();
      expect(zoneCheckbox).not.toBeChecked();
      expect(recentRadio).toBeChecked();
    });
  });

  describe('Apply and Cancel actions', () => {
    it('should call onFiltersChange and onToggle when Confirmer is clicked', async () => {
      const user = userEvent.setup();
      render(<ServiceFilters {...defaultProps} />);

      const confirmButton = screen.getByText('Confirmer');
      await user.click(confirmButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith(defaultProps.filters);
      expect(mockOnToggle).toHaveBeenCalled();
    });

    it('should call onToggle when Annuler is clicked', async () => {
      const user = userEvent.setup();
      render(<ServiceFilters {...defaultProps} />);

      const cancelButton = screen.getByText('Annuler');
      await user.click(cancelButton);

      expect(mockOnToggle).toHaveBeenCalled();
      expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });

    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServiceFilters {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /fermer/i });
      await user.click(closeButton);

      expect(mockOnToggle).toHaveBeenCalled();
    });
  });

  describe('Filter state management', () => {
    it('should initialize with provided filters', () => {
      const initialFilters: FilterOptions = {
        serviceType: ['Epargne'],
        geographicZone: ['Zone Géo A'],
        institut: ['SIMPLON'],
        date: 'Il y a 3 mois',
      };

      render(<ServiceFilters {...defaultProps} filters={initialFilters} />);

      // Check initial state
      const epargneCheckbox = screen.getByRole('checkbox', { name: /epargne/i });
      const zoneCheckbox = screen.getByRole('checkbox', { name: /zone géo a/i });
      const simplonCheckbox = screen.getByRole('checkbox', { name: /simplon/i });
      const oldDateRadio = screen.getByRole('radio', { name: /il y a 3 mois/i });

      expect(epargneCheckbox).toBeChecked();
      expect(zoneCheckbox).toBeChecked();
      expect(simplonCheckbox).toBeChecked();
      expect(oldDateRadio).toBeChecked();
    });

    it('should handle empty arrays in filters', () => {
      const emptyFilters: FilterOptions = {
        serviceType: [],
        geographicZone: [],
        institut: [],
        date: 'Récente',
      };

      render(<ServiceFilters {...defaultProps} filters={emptyFilters} />);

      // All checkboxes should be unchecked
      const epargneCheckbox = screen.getByRole('checkbox', { name: /epargne/i });
      const zoneCheckbox = screen.getByRole('checkbox', { name: /zone géo a/i });
      const simplonCheckbox = screen.getByRole('checkbox', { name: /simplon/i });

      expect(epargneCheckbox).not.toBeChecked();
      expect(zoneCheckbox).not.toBeChecked();
      expect(simplonCheckbox).not.toBeChecked();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form elements', () => {
      render(<ServiceFilters {...defaultProps} />);

      // Check that checkboxes have proper labels
      const epargneCheckbox = screen.getByRole('checkbox', { name: /epargne/i });
      expect(epargneCheckbox).toBeInTheDocument();

      // Check that radio buttons have proper labels
      const recentRadio = screen.getByRole('radio', { name: /récente/i });
      expect(recentRadio).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<ServiceFilters {...defaultProps} />);

      // Tab through elements
      await user.tab();
      expect(screen.getByRole('checkbox', { name: /epargne/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('checkbox', { name: /crédit/i })).toHaveFocus();
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid clicking on checkboxes', async () => {
      const user = userEvent.setup();
      render(<ServiceFilters {...defaultProps} />);

      const epargneCheckbox = screen.getByRole('checkbox', { name: /epargne/i });

      // Click multiple times rapidly
      await user.click(epargneCheckbox);
      await user.click(epargneCheckbox);
      await user.click(epargneCheckbox);

      // Should toggle correctly (odd number of clicks = checked)
      expect(epargneCheckbox).toBeChecked();
    });

    it('should handle clicking on text spans gracefully', async () => {
      const user = userEvent.setup();
      render(<ServiceFilters {...defaultProps} />);

      // Try to click on text spans (they should not be interactive)
      const epargneText = screen.getByText('Epargne');
      await user.click(epargneText);

      // Should not cause any errors and state should remain unchanged
      expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });
  });
});
