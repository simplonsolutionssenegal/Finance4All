import { render, screen, fireEvent } from '@testing-library/react';

import { BeneficiaryDetail } from '@/components/beneficiaire/BeneficiaryDetail';
import { BeneficiaryStatus } from '@/types/beneficiaire/beneficiary';
// eslint-disable-next-line no-duplicate-imports
import type { Beneficiary } from '@/types/beneficiaire/beneficiary';
import type { BeneficiaireDashboardData } from '@/hooks/beneficiary/useBeneficiaireDashboardData';

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

  const mockDashboardData: BeneficiaireDashboardData = {
    stats: {
      modulesCompleted: { current: 2, total: 5 },
      learningTime: '3h 20min',
      quizzesPassed: { current: 4, total: 8 },
      globalProgress: 75,
      videosWatched: { current: 10, total: 20 },
      averageSessionTime: '25min',
      learningStreakDays: 5,
    },
    moduleStats: { completed: 2, inProgress: 1, notStarted: 2, total: 5 },
    monthlyProgress: [],
    recentActivity: [],
    timeByModule: [
      {
        moduleId: 'm1',
        moduleTitle: 'Bases de la Finance Personnelle',
        totalSeconds: 3600,
        completionPercent: 80,
      },
      {
        moduleId: 'm2',
        moduleTitle: 'Gestion budgétaire',
        totalSeconds: 1200,
        completionPercent: 30,
      },
    ],
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
      expect(activeStatus).toHaveClass('text-emerald-700');
    });

    it('should render Inactive status correctly', () => {
      const inactiveBeneficiary = { ...mockBeneficiary, status: BeneficiaryStatus.INACTIVE };
      render(<BeneficiaryDetail beneficiary={inactiveBeneficiary} onBack={mockOnBack} />);
      const inactiveStatus = screen.getByText('Inactif');
      expect(inactiveStatus).toHaveClass('text-amber-700');
    });

    it('should render Pending status correctly', () => {
      const pendingBeneficiary = { ...mockBeneficiary, status: 'PENDING' as any };
      render(<BeneficiaryDetail beneficiary={pendingBeneficiary} onBack={mockOnBack} />);
      const pendingStatus = screen.getByText('En attente');
      expect(pendingStatus).toHaveClass('text-orange-700');
    });
  });

  describe('Progress Display', () => {
    it('should display progress percentage', () => {
      render(<BeneficiaryDetail {...defaultProps} />);
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
      const percentages = screen.getAllByText('0%');
      expect(percentages.length).toBeGreaterThan(0);
    });
  });

  describe('Personal Information Section', () => {
    it('should render personal information section', () => {
      render(<BeneficiaryDetail {...defaultProps} />);
      expect(screen.getByText('Informations personnelles')).toBeInTheDocument();
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

    it('should display modules label', () => {
      render(<BeneficiaryDetail {...defaultProps} />);
      expect(screen.getByText('Modules')).toBeInTheDocument();
    });

    it('should show dash when no dashboard data', () => {
      render(<BeneficiaryDetail {...defaultProps} />);
      // Without dashboardData, modules and other stats show "—"
      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThan(0);
    });

    it('should show real stats when dashboardData is provided', () => {
      render(<BeneficiaryDetail {...defaultProps} dashboardData={mockDashboardData} />);
      expect(screen.getByText('2/5')).toBeInTheDocument();
      expect(screen.getByText('3h 20min')).toBeInTheDocument();
      expect(screen.getByText('4/8')).toBeInTheDocument();
    });
  });

  describe('Training Modules Section', () => {
    it('should render modules section header', () => {
      render(<BeneficiaryDetail {...defaultProps} />);
      expect(screen.getByText('Modules de formation')).toBeInTheDocument();
    });

    it('should show empty message when no modules and no dashboard data', () => {
      render(<BeneficiaryDetail {...defaultProps} />);
      expect(screen.getByText('Aucun module suivi pour le moment.')).toBeInTheDocument();
    });

    it('should show loading state when isDashboardLoading', () => {
      render(<BeneficiaryDetail {...defaultProps} isDashboardLoading />);
      expect(screen.getByText('Chargement...')).toBeInTheDocument();
    });

    it('should display real modules when dashboardData is provided', () => {
      render(<BeneficiaryDetail {...defaultProps} dashboardData={mockDashboardData} />);
      expect(screen.getByText('Bases de la Finance Personnelle')).toBeInTheDocument();
      expect(screen.getByText('Gestion budgétaire')).toBeInTheDocument();
    });

    it('should display module progress percentages', () => {
      render(<BeneficiaryDetail {...defaultProps} dashboardData={mockDashboardData} />);
      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
    });

    it('should display correct status badges', () => {
      render(<BeneficiaryDetail {...defaultProps} dashboardData={mockDashboardData} />);
      const enCoursBadges = screen.getAllByText('En cours');
      // 2 module badges + 1 "En cours" label in stats section
      expect(enCoursBadges.length).toBe(3);
    });

    it('should display learning time for modules', () => {
      render(<BeneficiaryDetail {...defaultProps} dashboardData={mockDashboardData} />);
      expect(screen.getByText('60 min de formation')).toBeInTheDocument();
      expect(screen.getByText('20 min de formation')).toBeInTheDocument();
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
  });

  describe('Layout and Structure', () => {
    it('should render header card', () => {
      const { container } = render(<BeneficiaryDetail {...defaultProps} />);
      const cards = container.querySelectorAll('.rounded-2xl');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should render training modules card', () => {
      render(<BeneficiaryDetail {...defaultProps} />);
      expect(screen.getByText('Modules de formation')).toBeInTheDocument();
    });

    it('should use responsive classes', () => {
      const { container } = render(<BeneficiaryDetail {...defaultProps} />);
      const responsiveGrid = container.querySelector(
        '.lg\\:grid-cols-\\[minmax\\(0\\,320px\\)_minmax\\(0\\,1fr\\)\\]'
      );
      expect(responsiveGrid).toBeInTheDocument();
    });
  });
});
