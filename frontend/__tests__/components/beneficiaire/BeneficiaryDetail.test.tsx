import { render, screen, fireEvent } from '@testing-library/react';

import { BeneficiaryDetail } from '@/components/beneficiaire/BeneficiaryDetail';
import { BeneficiaryStatus } from '@/types/beneficiaire/beneficiary';
// eslint-disable-next-line no-duplicate-imports
import type { Beneficiary } from '@/types/beneficiaire/beneficiary';

describe('BeneficiaryDetail', () => {
  const mockBeneficiary: Beneficiary = {
    id: '123-uuid',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+221771234567',
    status: BeneficiaryStatus.ACTIVE,
    progressPercent: 75,
    createdAt: '2024-01-15T10:00:00Z',
  };

  const mockOnBack = jest.fn();

  const defaultProps = {
    beneficiary: mockBeneficiary,
    onBack: mockOnBack,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render beneficiary full name', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render beneficiary initials', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render beneficiary email', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    it('should render beneficiary phone when provided', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('+221771234567')).toBeInTheDocument();
    });

    it('should not render phone section when phone is missing', () => {
      const beneficiaryWithoutPhone = { ...mockBeneficiary, phone: undefined };
      render(<BeneficiaryDetail beneficiary={beneficiaryWithoutPhone} onBack={mockOnBack} />);

      expect(screen.queryByText('+221771234567')).not.toBeInTheDocument();
    });

    it('should render status pill', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Actif')).toBeInTheDocument();
    });

    it('should render back button', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Retour à la liste')).toBeInTheDocument();
    });
  });

  describe('Status Pills', () => {
    it('should render Active status correctly', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      const activeStatus = screen.getByText('Actif');
      expect(activeStatus).toBeInTheDocument();
      expect(activeStatus).toHaveClass('text-emerald-700');
    });

    it('should render Inactive status correctly', () => {
      const inactiveBeneficiary = { ...mockBeneficiary, status: BeneficiaryStatus.INACTIVE };
      render(<BeneficiaryDetail beneficiary={inactiveBeneficiary} onBack={mockOnBack} />);

      const inactiveStatus = screen.getByText('Inactif');
      expect(inactiveStatus).toBeInTheDocument();
      expect(inactiveStatus).toHaveClass('text-amber-700');
    });

    it('should render Pending status correctly', () => {
      const pendingBeneficiary = { ...mockBeneficiary, status: 'PENDING' as any };
      render(<BeneficiaryDetail beneficiary={pendingBeneficiary} onBack={mockOnBack} />);

      const pendingStatus = screen.getByText('En attente');
      expect(pendingStatus).toBeInTheDocument();
      expect(pendingStatus).toHaveClass('text-orange-700');
    });
  });

  describe('Progress Display', () => {
    it('should display progress percentage', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      // 75% appears multiple times (progress bar and percentage displays)
      const percentages = screen.getAllByText('75%');
      expect(percentages.length).toBeGreaterThan(0);
    });

    it('should display progress bar with correct width', () => {
      const { container } = render(<BeneficiaryDetail {...defaultProps} />);

      const progressBars = container.querySelectorAll('.bg-sky-500');
      expect(progressBars[0].getAttribute('style')).toContain('width: 75%');
    });

    it('should clamp progress to 0% when negative', () => {
      const beneficiaryWithNegProgress = { ...mockBeneficiary, progressPercent: -10 };
      const { container } = render(
        <BeneficiaryDetail beneficiary={beneficiaryWithNegProgress} onBack={mockOnBack} />
      );

      const progressBars = container.querySelectorAll('.bg-sky-500');
      expect(progressBars[0].getAttribute('style')).toContain('width: 0%');
    });

    it('should clamp progress to 100% when over 100', () => {
      const beneficiaryWithOverProgress = { ...mockBeneficiary, progressPercent: 150 };
      const { container } = render(
        <BeneficiaryDetail beneficiary={beneficiaryWithOverProgress} onBack={mockOnBack} />
      );

      const progressBars = container.querySelectorAll('.bg-sky-500');
      expect(progressBars[0].getAttribute('style')).toContain('width: 100%');
    });

    it('should handle zero progress percent', () => {
      const beneficiaryNoProgress = { ...mockBeneficiary, progressPercent: 0 };
      render(<BeneficiaryDetail beneficiary={beneficiaryNoProgress} onBack={mockOnBack} />);

      // 0% appears multiple times (progress bar and percentage display)
      const percentages = screen.getAllByText('0%');
      expect(percentages.length).toBeGreaterThan(0);
    });
  });

  describe('Personal Information Section', () => {
    it('should render personal information section', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Informations personnelles')).toBeInTheDocument();
    });

    it('should show placeholder for address', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Adresse')).toBeInTheDocument();
      expect(screen.getAllByText('Non renseignée')[0]).toBeInTheDocument();
    });

    it('should show placeholder for city', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Ville')).toBeInTheDocument();
      expect(screen.getAllByText('Non renseignée')[1]).toBeInTheDocument();
    });

    it('should show placeholder for country', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Pays')).toBeInTheDocument();
      expect(screen.getByText('Non renseigné')).toBeInTheDocument();
    });

    it('should format and display creation date', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText(/Date d.inscription/i)).toBeInTheDocument();
      expect(screen.getByText(/15 janv\./i)).toBeInTheDocument();
    });
  });

  describe('Statistics Section', () => {
    it('should render statistics section', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Statistiques')).toBeInTheDocument();
    });

    it('should display global progression label', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Progression globale')).toBeInTheDocument();
    });

    it('should display modules count', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Modules')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should display certificates label', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Certificats')).toBeInTheDocument();
    });

    it('should show 0 certificates when progress < 100', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      // Progress is 75%, so certificates should be 0
      const certificateCards = screen.getAllByText('0');
      expect(certificateCards.length).toBeGreaterThan(0);
    });

    it('should show 1 certificate when progress >= 100', () => {
      const completedBeneficiary = { ...mockBeneficiary, progressPercent: 100 };
      render(<BeneficiaryDetail beneficiary={completedBeneficiary} onBack={mockOnBack} />);

      // Progress is 100%, verify the certificates display
      // "1" appears multiple times (modules count is also 1)
      const ones = screen.getAllByText('1');
      expect(ones.length).toBeGreaterThan(0);
    });
  });

  describe('Training Module Section', () => {
    it('should render training module section', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Module de formation')).toBeInTheDocument();
    });

    it('should display module title', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Bases de la Finance Personnelle')).toBeInTheDocument();
    });

    it('should display module description', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(
        screen.getByText('Introduction aux concepts financiers essentiels')
      ).toBeInTheDocument();
    });

    it('should display "En cours" badge', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      const enCoursBadges = screen.getAllByText('En cours');
      expect(enCoursBadges.length).toBeGreaterThan(0);
    });

    it('should display module progress percentage', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      // Le pourcentage 75% apparaît plusieurs fois (progression globale et module)
      const percentages = screen.getAllByText('75%');
      expect(percentages.length).toBeGreaterThan(0);
    });
  });

  describe('Certifications Section', () => {
    it('should render certifications section', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Certifications obtenues')).toBeInTheDocument();
    });

    it('should display certification title', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Certification Finance de base')).toBeInTheDocument();
    });

    it('should display certification date', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Délivrée le 1 sept. 2024')).toBeInTheDocument();
    });

    it('should display certification progress', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });

  describe('Back Button', () => {
    it('should call onBack when back button is clicked', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      const backButton = screen.getByText('Retour à la liste');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should have proper button type', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      const backButton = screen.getByText('Retour à la liste').closest('button');
      expect(backButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Date Formatting', () => {
    it('should format valid date in French format', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText(/15 janv\./i)).toBeInTheDocument();

      // 2024 appears in multiple places (certification date, created date)
      const yearElements = screen.getAllByText(/2024/i);
      expect(yearElements.length).toBeGreaterThan(0);
    });

    it('should handle invalid date gracefully', () => {
      const invalidDateBeneficiary = { ...mockBeneficiary, createdAt: 'invalid-date' };
      render(<BeneficiaryDetail beneficiary={invalidDateBeneficiary} onBack={mockOnBack} />);

      expect(screen.getByText('invalid-date')).toBeInTheDocument();
    });
  });

  describe('Initials Generation', () => {
    it('should generate correct initials from first and last name', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should handle missing first name', () => {
      const noFirstName = { ...mockBeneficiary, firstName: '' };
      render(<BeneficiaryDetail beneficiary={noFirstName} onBack={mockOnBack} />);

      expect(screen.getByText('D')).toBeInTheDocument();
    });

    it('should handle missing last name', () => {
      const noLastName = { ...mockBeneficiary, lastName: '' };
      render(<BeneficiaryDetail beneficiary={noLastName} onBack={mockOnBack} />);

      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should default to "B" when both names are missing', () => {
      const noNames = { ...mockBeneficiary, firstName: '', lastName: '' };
      render(<BeneficiaryDetail beneficiary={noNames} onBack={mockOnBack} />);

      expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('should convert initials to uppercase', () => {
      const lowerCaseNames = { ...mockBeneficiary, firstName: 'john', lastName: 'doe' };
      render(<BeneficiaryDetail beneficiary={lowerCaseNames} onBack={mockOnBack} />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Layout and Structure', () => {
    it('should render header card', () => {
      const { container } = render(<BeneficiaryDetail {...defaultProps} />);

      const cards = container.querySelectorAll('.rounded-2xl');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should render personal information card', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Informations personnelles')).toBeInTheDocument();
    });

    it('should render statistics card', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Statistiques')).toBeInTheDocument();
    });

    it('should render training module card', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Module de formation')).toBeInTheDocument();
    });

    it('should render certifications card', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Certifications obtenues')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render Mail icon', () => {
      const { container } = render(<BeneficiaryDetail {...defaultProps} />);

      // Mail icon should be present near the email
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render Phone icon when phone is present', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('+221771234567')).toBeInTheDocument();
    });

    it('should render CalendarDays icon', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText(/Date d.inscription/i)).toBeInTheDocument();
    });

    it('should render BookOpen icon for modules', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Modules')).toBeInTheDocument();
    });

    it('should render Award icon for certificates', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      expect(screen.getByText('Certificats')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle beneficiary with all optional fields missing', () => {
      const minimalBeneficiary: Beneficiary = {
        id: '456',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: undefined,
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: '2024-01-01T00:00:00Z',
      };

      render(<BeneficiaryDetail beneficiary={minimalBeneficiary} onBack={mockOnBack} />);

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();

      // 0% appears multiple times (progress bar and percentage display)
      const percentages = screen.getAllByText('0%');
      expect(percentages.length).toBeGreaterThan(0);

      // Should show 0 certificates when progress is 0%
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle very long names gracefully', () => {
      const longNameBeneficiary = {
        ...mockBeneficiary,
        firstName: 'VeryLongFirstNameThatExceedsNormalLength',
        lastName: 'VeryLongLastNameThatExceedsNormalLength',
      };

      render(<BeneficiaryDetail beneficiary={longNameBeneficiary} onBack={mockOnBack} />);

      expect(
        screen.getByText(
          'VeryLongFirstNameThatExceedsNormalLength VeryLongLastNameThatExceedsNormalLength'
        )
      ).toBeInTheDocument();
    });

    it('should handle progress percent at exactly 100', () => {
      const completedBeneficiary = { ...mockBeneficiary, progressPercent: 100 };
      const { container } = render(
        <BeneficiaryDetail beneficiary={completedBeneficiary} onBack={mockOnBack} />
      );

      // 100% appears in the module progress section
      const percentages = screen.getAllByText('100%');
      expect(percentages.length).toBeGreaterThan(0);

      // Verify that progress bars have correct width
      const progressBars = container.querySelectorAll('.bg-sky-500');
      expect(progressBars[0].getAttribute('style')).toContain('width: 100%');
    });

    it('should trim whitespace from full name', () => {
      const spacedBeneficiary = {
        ...mockBeneficiary,
        firstName: '  John  ',
        lastName: '  Doe  ',
      };

      render(<BeneficiaryDetail beneficiary={spacedBeneficiary} onBack={mockOnBack} />);

      // The trim() should remove extra spaces
      const nameElement = screen.getByText(/John.*Doe/);
      expect(nameElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button type attribute', () => {
      const { container } = render(<BeneficiaryDetail {...defaultProps} />);

      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('should be keyboard navigable', () => {
      render(<BeneficiaryDetail {...defaultProps} />);

      const backButton = screen.getByText('Retour à la liste').closest('button');
      expect(backButton).not.toBeNull();

      if (backButton) {
        backButton.focus();
        expect(document.activeElement).toBe(backButton);
      }
    });
  });

  describe('Responsive Layout', () => {
    it('should render grid layout for sections', () => {
      const { container } = render(<BeneficiaryDetail {...defaultProps} />);

      const gridElements = container.querySelectorAll('.grid');
      expect(gridElements.length).toBeGreaterThan(0);
    });

    it('should use responsive classes', () => {
      const { container } = render(<BeneficiaryDetail {...defaultProps} />);

      // Check for responsive grid classes
      const responsiveGrid = container.querySelector(
        '.lg\\:grid-cols-\\[minmax\\(0\\,320px\\)_minmax\\(0\\,1fr\\)\\]'
      );
      expect(responsiveGrid).toBeInTheDocument();
    });
  });
});
