import { render, screen, fireEvent } from '@testing-library/react';

import BeneficiaryTable from '@/components/beneficiaire/BeneficiaryTable';
import { BeneficiaryStatus } from '@/types/beneficiaire/beneficiary';
// eslint-disable-next-line no-duplicate-imports
import type { Beneficiary } from '@/types/beneficiaire/beneficiary';

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
    it('should render all action buttons', () => {
      render(<BeneficiaryTable {...defaultProps} />);

      const viewButtons = screen.getAllByTitle('Voir');
      const editButtons = screen.getAllByTitle('Modifier');
      const deleteButtons = screen.getAllByTitle('Supprimer');

      expect(viewButtons).toHaveLength(2);
      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);
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

    it('should call onDelete when delete button is clicked', () => {
      const onDelete = jest.fn();
      render(<BeneficiaryTable {...defaultProps} onDelete={onDelete} />);

      const deleteButton = screen.getAllByTitle('Supprimer')[0];
      fireEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith(mockBeneficiaries[0]);
    });

    it('should not crash when callbacks are undefined', () => {
      render(<BeneficiaryTable {...defaultProps} />);

      const viewButton = screen.getAllByTitle('Voir')[0];
      const editButton = screen.getAllByTitle('Modifier')[0];
      const deleteButton = screen.getAllByTitle('Supprimer')[0];

      expect(() => {
        fireEvent.click(viewButton);
        fireEvent.click(editButton);
        fireEvent.click(deleteButton);
      }).not.toThrow();
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
      expect(screen.getAllByLabelText('Supprimer')).toHaveLength(2);
    });

    it('should have title attributes for tooltips', () => {
      render(<BeneficiaryTable {...defaultProps} />);

      const viewButton = screen.getAllByTitle('Voir')[0];
      const editButton = screen.getAllByTitle('Modifier')[0];
      const deleteButton = screen.getAllByTitle('Supprimer')[0];

      expect(viewButton).toHaveAttribute('title', 'Voir');
      expect(editButton).toHaveAttribute('title', 'Modifier');
      expect(deleteButton).toHaveAttribute('title', 'Supprimer');
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
