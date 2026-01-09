import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import BeneficiaryTable from '@/components/beneficiaire/BeneficiaryTable';
import { BeneficiaryStatus } from '@/types/beneficiaire/beneficiary';
// eslint-disable-next-line no-duplicate-imports
import type { Beneficiary } from '@/types/beneficiaire/beneficiary';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    custom: jest.fn(),
    dismiss: jest.fn(),
  },
}));

describe('BeneficiaryTable', () => {
  const mockUuidToInt = jest.fn((uuid: string) => {
    // Simple mock: hash to number
    return parseInt(uuid.slice(0, 8), 16) % 1000;
  });

  const mockBeneficiaries: Beneficiary[] = [
    {
      id: 'abc123-uuid-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+221771234567',
      status: BeneficiaryStatus.ACTIVE,
      progressPercent: 75,
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'def456-uuid-2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+221779876543',
      status: BeneficiaryStatus.INACTIVE,
      progressPercent: 50,
      createdAt: '2024-02-20T14:30:00Z',
    },
  ];

  const defaultProps = {
    rows: mockBeneficiaries,
    isLoading: false,
    uuidToInt: mockUuidToInt,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render table headers', () => {
      render(<BeneficiaryTable {...defaultProps} />);

      expect(screen.getByText('Bénéficiaire')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('Statut')).toBeInTheDocument();
      expect(screen.getByText('Progression')).toBeInTheDocument();
      expect(screen.getByText('Créé le')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render beneficiary rows', () => {
      render(<BeneficiaryTable {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    });

    it('should display initials in avatar', () => {
      render(<BeneficiaryTable {...defaultProps} />);

      expect(screen.getByText('JD')).toBeInTheDocument();
      expect(screen.getByText('JS')).toBeInTheDocument();
    });

    it('should display formatted ID using uuidToInt', () => {
      render(<BeneficiaryTable {...defaultProps} />);

      expect(mockUuidToInt).toHaveBeenCalledWith('abc123-uuid-1');
      expect(mockUuidToInt).toHaveBeenCalledWith('def456-uuid-2');
    });

    it('should display phone numbers', () => {
      render(<BeneficiaryTable {...defaultProps} />);

      expect(screen.getByText('+221771234567')).toBeInTheDocument();
      expect(screen.getByText('+221779876543')).toBeInTheDocument();
    });
  });

  describe('Status Pills', () => {
    it('should render Active status correctly', () => {
      render(<BeneficiaryTable {...defaultProps} />);

      const activeStatus = screen.getAllByText('Actif')[0];
      expect(activeStatus).toBeInTheDocument();
      expect(activeStatus).toHaveClass('text-emerald-700');
    });

    it('should render Inactive status correctly', () => {
      render(<BeneficiaryTable {...defaultProps} />);

      const inactiveStatus = screen.getByText('Inactif');
      expect(inactiveStatus).toBeInTheDocument();
      expect(inactiveStatus).toHaveClass('text-amber-700');
    });

    it('should render Pending status correctly', () => {
      const pendingBeneficiary: Beneficiary = {
        ...mockBeneficiaries[0],
        id: 'pending-uuid',
        status: 'PENDING' as any,
      };

      render(<BeneficiaryTable {...defaultProps} rows={[pendingBeneficiary]} />);

      const pendingStatus = screen.getByText('En attente');
      expect(pendingStatus).toBeInTheDocument();
      expect(pendingStatus).toHaveClass('text-orange-700');
    });
  });

  describe('Progress Bar', () => {
    it('should display progress percentage', () => {
      render(<BeneficiaryTable {...defaultProps} />);

      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should display progress bar with correct width', () => {
      const { container } = render(<BeneficiaryTable {...defaultProps} />);

      const progressBars = container.querySelectorAll('.bg-sky-500');
      expect(progressBars[0].getAttribute('style')).toContain('width: 75%');
      expect(progressBars[1].getAttribute('style')).toContain('width: 50%');
    });

    it('should clamp progress to 0-100 range', () => {
      const extremeBeneficiaries: Beneficiary[] = [
        { ...mockBeneficiaries[0], id: 'neg', progressPercent: -10 },
        { ...mockBeneficiaries[0], id: 'over', progressPercent: 150 },
      ];

      const { container } = render(
        <BeneficiaryTable {...defaultProps} rows={extremeBeneficiaries} />
      );

      const progressBars = container.querySelectorAll('.bg-sky-500');
      expect(progressBars[0].getAttribute('style')).toContain('width: 0%');
      expect(progressBars[1].getAttribute('style')).toContain('width: 100%');
    });
  });

  describe('Date Formatting', () => {
    it('should format dates in French format', () => {
      render(<BeneficiaryTable {...defaultProps} />);

      // Check that dates are formatted in French format (e.g., "15 janv. 2024")
      expect(screen.getByText(/15 janv\./i)).toBeInTheDocument();
      expect(screen.getByText(/févr\./i)).toBeInTheDocument();
    });

    it('should handle invalid dates gracefully', () => {
      const invalidDateBeneficiary: Beneficiary = {
        ...mockBeneficiaries[0],
        id: 'invalid-date',
        createdAt: 'invalid-date-string',
      };

      render(<BeneficiaryTable {...defaultProps} rows={[invalidDateBeneficiary]} />);

      // Should display the raw string when date is invalid
      expect(screen.getByText('invalid-date-string')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render all action buttons for mixed statuses', () => {
      render(<BeneficiaryTable {...defaultProps} />);

      const viewButtons = screen.getAllByTitle('Voir');
      const editButtons = screen.getAllByTitle('Modifier');

      expect(viewButtons).toHaveLength(2);
      expect(editButtons).toHaveLength(2);

      // John (ACTIVE) a un bouton Désactiver
      expect(screen.getByTitle('Désactiver')).toBeInTheDocument();

      // Jane (INACTIVE) a un bouton Réactiver
      expect(screen.getByTitle('Réactiver')).toBeInTheDocument();
    });

    it('should call onView when view button is clicked', () => {
      const onView = jest.fn();
      render(<BeneficiaryTable {...defaultProps} onView={onView} />);

      const viewButton = screen.getAllByTitle('Voir')[0];
      fireEvent.click(viewButton);

      expect(onView).toHaveBeenCalledWith(mockBeneficiaries[0]);
    });

    it('should call onEdit when edit button is clicked', () => {
      const onEdit = jest.fn();
      render(<BeneficiaryTable {...defaultProps} onEdit={onEdit} />);

      const editButton = screen.getAllByTitle('Modifier')[0];
      fireEvent.click(editButton);

      expect(onEdit).toHaveBeenCalledWith(mockBeneficiaries[0]);
    });

    it('should show confirmation toast when deactivate button is clicked', () => {
      const { toast } = require('sonner');
      render(<BeneficiaryTable {...defaultProps} />);

      const deactivateButton = screen.getByTitle('Désactiver');
      fireEvent.click(deactivateButton);

      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ duration: 8000 })
      );
    });

    it('should call onDelete when confirmation is accepted', () => {
      const { toast } = require('sonner');
      const onDelete = jest.fn();

      render(<BeneficiaryTable {...defaultProps} onDelete={onDelete} />);

      const deactivateButton = screen.getByTitle('Désactiver');
      fireEvent.click(deactivateButton);

      // Get the toast render function
      const toastCall = (toast.custom as jest.Mock).mock.calls[0];
      const toastRenderFn = toastCall[0];

      // Render the toast content
      const { getByText } = render(toastRenderFn({ id: 'test-toast' }));

      // Click confirm button
      const confirmButton = getByText('Désactiver');
      fireEvent.click(confirmButton);

      expect(toast.dismiss).toHaveBeenCalled();
      expect(onDelete).toHaveBeenCalledWith(mockBeneficiaries[0]);
    });

    it('should dismiss toast when cancel is clicked', () => {
      const { toast } = require('sonner');
      const onDelete = jest.fn();

      render(<BeneficiaryTable {...defaultProps} onDelete={onDelete} />);

      const deactivateButton = screen.getByTitle('Désactiver');
      fireEvent.click(deactivateButton);

      const toastCall = (toast.custom as jest.Mock).mock.calls[0];
      const toastRenderFn = toastCall[0];

      const { getByText } = render(toastRenderFn({ id: 'test-toast' }));

      const cancelButton = getByText('Annuler');
      fireEvent.click(cancelButton);

      expect(toast.dismiss).toHaveBeenCalled();
      expect(onDelete).not.toHaveBeenCalled();
    });

    it('should not crash when callbacks are undefined', () => {
      render(<BeneficiaryTable {...defaultProps} />);

      const viewButton = screen.getAllByTitle('Voir')[0];
      const editButton = screen.getAllByTitle('Modifier')[0];
      const deactivateButton = screen.getByTitle('Désactiver');

      expect(() => {
        fireEvent.click(viewButton);
        fireEvent.click(editButton);
        fireEvent.click(deactivateButton);
      }).not.toThrow();
    });
  });

  describe('Reactivate Button', () => {
    it('should show reactivate button for inactive beneficiaries', () => {
      const inactiveBeneficiaries: Beneficiary[] = [
        { ...mockBeneficiaries[1], status: BeneficiaryStatus.INACTIVE },
      ];

      render(<BeneficiaryTable {...defaultProps} rows={inactiveBeneficiaries} />);

      expect(screen.getByTitle('Réactiver')).toBeInTheDocument();
      expect(screen.queryByTitle('Désactiver')).not.toBeInTheDocument();
    });

    it('should show confirmation toast when reactivate button is clicked', () => {
      const { toast } = require('sonner');
      const inactiveBeneficiaries: Beneficiary[] = [
        { ...mockBeneficiaries[1], status: BeneficiaryStatus.INACTIVE },
      ];

      render(<BeneficiaryTable {...defaultProps} rows={inactiveBeneficiaries} />);

      const reactivateButton = screen.getByTitle('Réactiver');
      fireEvent.click(reactivateButton);

      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ duration: 8000 })
      );
    });

    it('should call onReactivate when confirmation is accepted', async () => {
      const { toast } = require('sonner');
      const onReactivate = jest.fn().mockResolvedValue(undefined);
      const inactiveBeneficiaries: Beneficiary[] = [
        { ...mockBeneficiaries[1], status: BeneficiaryStatus.INACTIVE },
      ];

      render(
        <BeneficiaryTable
          {...defaultProps}
          rows={inactiveBeneficiaries}
          onReactivate={onReactivate}
        />
      );

      const reactivateButton = screen.getByTitle('Réactiver');
      fireEvent.click(reactivateButton);

      const toastCall = (toast.custom as jest.Mock).mock.calls[0];
      const toastRenderFn = toastCall[0];

      const { getByText } = render(toastRenderFn({ id: 'test-toast' }));

      const confirmButton = getByText('Réactiver');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.dismiss).toHaveBeenCalled();
        expect(onReactivate).toHaveBeenCalledWith(inactiveBeneficiaries[0]);
      });
    });

    it('should show correct beneficiary name in reactivate confirmation', () => {
      const { toast } = require('sonner');
      const inactiveBeneficiaries: Beneficiary[] = [
        { ...mockBeneficiaries[1], status: BeneficiaryStatus.INACTIVE },
      ];

      render(<BeneficiaryTable {...defaultProps} rows={inactiveBeneficiaries} />);

      const reactivateButton = screen.getByTitle('Réactiver');
      fireEvent.click(reactivateButton);

      const toastCall = (toast.custom as jest.Mock).mock.calls[0];
      const toastRenderFn = toastCall[0];

      const { getByText } = render(toastRenderFn({ id: 'test-toast' }));

      expect(getByText(/Réactiver le bénéficiaire Jane Smith/)).toBeInTheDocument();
    });
  });

  describe('Deactivate Button', () => {
    it('should show deactivate button for active beneficiaries', () => {
      const activeBeneficiaries: Beneficiary[] = [
        { ...mockBeneficiaries[0], status: BeneficiaryStatus.ACTIVE },
      ];

      render(<BeneficiaryTable {...defaultProps} rows={activeBeneficiaries} />);

      expect(screen.getByTitle('Désactiver')).toBeInTheDocument();
      expect(screen.queryByTitle('Réactiver')).not.toBeInTheDocument();
    });

    it('should show correct beneficiary name in deactivate confirmation', () => {
      const { toast } = require('sonner');

      render(<BeneficiaryTable {...defaultProps} />);

      const deactivateButton = screen.getByTitle('Désactiver');
      fireEvent.click(deactivateButton);

      const toastCall = (toast.custom as jest.Mock).mock.calls[0];
      const toastRenderFn = toastCall[0];

      const { getByText } = render(toastRenderFn({ id: 'test-toast' }));

      expect(getByText(/Désactiver le bénéficiaire John Doe/)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading message when isLoading is true', () => {
      render(<BeneficiaryTable {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Chargement...')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should not display loading message when isLoading is false', () => {
      render(<BeneficiaryTable {...defaultProps} isLoading={false} />);

      expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty message when rows array is empty', () => {
      render(<BeneficiaryTable {...defaultProps} rows={[]} />);

      expect(screen.getByText('Aucun bénéficiaire trouvé.')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should not display empty message when rows exist', () => {
      render(<BeneficiaryTable {...defaultProps} />);

      expect(screen.queryByText('Aucun bénéficiaire trouvé.')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle beneficiary with missing firstName', () => {
      const incompleteBeneficiary: Beneficiary = {
        ...mockBeneficiaries[0],
        id: 'incomplete',
        firstName: '',
      };

      render(<BeneficiaryTable {...defaultProps} rows={[incompleteBeneficiary]} />);

      // Should show initials as just last name initial
      expect(screen.getByText('D')).toBeInTheDocument();
      // Name should still display properly with space
      expect(screen.getByText(/Doe/)).toBeInTheDocument();
    });

    it('should handle beneficiary with missing lastName', () => {
      const incompleteBeneficiary: Beneficiary = {
        ...mockBeneficiaries[0],
        id: 'incomplete2',
        lastName: '',
      };

      render(<BeneficiaryTable {...defaultProps} rows={[incompleteBeneficiary]} />);

      // Should show initials as just first name initial
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should handle beneficiary with both names missing', () => {
      const incompleteBeneficiary: Beneficiary = {
        ...mockBeneficiaries[0],
        id: 'incomplete3',
        firstName: '',
        lastName: '',
      };

      render(<BeneficiaryTable {...defaultProps} rows={[incompleteBeneficiary]} />);

      // Should show default initial 'B'
      expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('should handle beneficiary with missing phone', () => {
      const noPhoneBeneficiary: Beneficiary = {
        ...mockBeneficiaries[0],
        id: 'no-phone',
        phone: undefined,
      };

      render(<BeneficiaryTable {...defaultProps} rows={[noPhoneBeneficiary]} />);

      // Should not crash, phone field should be empty or not displayed
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    it('should handle large number of rows', () => {
      const manyBeneficiaries = Array.from({ length: 50 }, (_, i) => ({
        ...mockBeneficiaries[0],
        id: `beneficiary-${i}`,
        firstName: `User${i}`,
        lastName: `Test${i}`,
        email: `user${i}@example.com`,
      }));

      render(<BeneficiaryTable {...defaultProps} rows={manyBeneficiaries} />);

      expect(screen.getByText('User0 Test0')).toBeInTheDocument();
      expect(screen.getByText('User49 Test49')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-labels for action buttons', () => {
      render(<BeneficiaryTable {...defaultProps} />);

      expect(screen.getAllByLabelText('Voir')).toHaveLength(2);
      expect(screen.getAllByLabelText('Modifier')).toHaveLength(2);
      expect(screen.getByLabelText('Désactiver')).toBeInTheDocument();
      expect(screen.getByLabelText('Réactiver')).toBeInTheDocument();
    });

    it('should have title attributes for tooltips', () => {
      render(<BeneficiaryTable {...defaultProps} />);

      const viewButton = screen.getAllByTitle('Voir')[0];
      const editButton = screen.getAllByTitle('Modifier')[0];
      const deactivateButton = screen.getByTitle('Désactiver');
      const reactivateButton = screen.getByTitle('Réactiver');

      expect(viewButton).toHaveAttribute('title', 'Voir');
      expect(editButton).toHaveAttribute('title', 'Modifier');
      expect(deactivateButton).toHaveAttribute('title', 'Désactiver');
      expect(reactivateButton).toHaveAttribute('title', 'Réactiver');
    });

    it('should render buttons with proper type attribute', () => {
      render(<BeneficiaryTable {...defaultProps} />);

      const allButtons = screen.getAllByRole('button');
      allButtons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });
});
